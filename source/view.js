"use strict";

define(["./ActionButton", "./Chrome", "./DevicesButton", "./DeviceFolder",
		"./libraries/ui/source/Input", "./libraries/ui/source/Layer",
		"./libraries/ui/source/MultiButton",
		"./libraries/ui/source/Progressbar.js",
		"./libraries/ui/source/Separator", "./WindowFolder", "./TabButton",
		"./HistoryButton", "./libraries/ui/source/Root"],
function (ActionButton, Chrome, DevicesButton, DeviceFolder, Input, Layer,
	MultiButton, Progressbar, Separator, WindowFolder, TabButton, HistoryButton,
	Root) {

class View {
	constructor(root, i18n) {
		typecheck(arguments, Root, Function);
		this._root            = root;
		this._i18n            = i18n;
		this.onSearch         = function () {}
		this._mainLayer       = new Layer;
		this._searchLayer     = new Layer({visible: false});
		this._deviceLayer     = new Layer({visible: false});
		this.onSessionRestore = function () { }
		this.onTabCreate      = function () { }
		this.onHistoryRemove  = function () { }
		root.insert([
			this._mainLayer,
			this._searchLayer,
			this._deviceLayer
		]);
		this._devicesButton = new DevicesButton({
			tooltip: this._i18n("popup_other_devices"),
			click:   function () {
				this._devicesVisible = !this._devicesVisible;
			}.bind(this),
			visible: false
		});
		root.insert(new MultiButton({
			children: [
				new Input({
					placeholder: this._i18n("popup_search_history"),
					lockon:      true,
					change:      function (value) {
						this.onSearch(value);
					}.bind(this)
				}),
				this._devicesButton,
				new ActionButton({
					tooltip: this._i18n("popup_history_manager"),
					icon:    "icons/history-19.png",
					click:   function (e) {
						this.tabCreate({
							url:          "chrome://history/",
							inBackground: false
						});
					}.bind(this)
				}),
				new ActionButton({
					tooltip: this._i18n("popup_options"),
					icon:    "icons/options.png",
					click:   function (e) {
						this.tabCreate({
							url:          "chrome://extensions/?options"
							              + chrome.runtime.id,
							inBackground: false
						});
					}.bind(this)
				})
			]
		}));
	}
	setRecent(sessions, history, sessionsFirst) {
		typecheck(arguments, Array, Array, Boolean);
		const sessionNodes = sessions.map(function (session) {
			if (session.tab) {
				const tab = session.tab;
				return new TabButton({
					view:      this,
					timer:     tab.lastModified * 1000,
					sessionId: tab.sessionId,
				});
			} else if (session.window) {
				const window = session.window;
				return new WindowFolder({
					view:      this,
					timer:     window.lastModified * 1000,
					sessionId: window.sessionId,
					tabs:      window.tabs
				});
			} else {
				throw TypeError("Invalid session object supplied");
			}
		}.bind(this));
		const historyNodes = history.map(function (item) {
			return new HistoryButton(item);
		});
		if (sessionNodes.length > 0) {
			sessionNodes.unshift(new Separator({
				title: this._i18n("popup_recently_closed_tabs")
			}));
		}
		if (historyNodes.length > 0) {
			historyNodes.unshift(new Separator({
				title: this._i18n("popup_recent_history")
			}));
		}
		const children = sessionsFirst 
			? sessionNodes.concat(historyNodes) 
			: historyNodes.concat(sessionNodes);
		if (children.length == 0) {
			history.unshift(new Separator({
				title: this._i18n("results_nothing_found")
			}));
		}
		this._mainLayer.children = children;
	}
	setDevices(devices) {
		const deviceNodes = devices.map(function (device) {
			return new DeviceFolder(device);
		});
		this._deviceLayer.children  = deviceNodes;
		this._devicesButton.visible = deviceNodes.length > 0;
	}
	beginSearch() {
		this._deviceLayer.visible = false;
		this._searchLayer.visible = true;
		this._searchLayer.clear();
		this._searchLayer.insert(new Progressbar);
	}
	endSearch() {
		this._searchLayer.remove(this._searchLayer.children[0]);
		this._searchLayer.insert(new Separator({
			title: this._i18n("search_results_end")
		}));
	}
	clearSearch() {
		this._searchLayer.visible = false;
	}
	pushSearchResults(results, separatorI18n) {
		if (results.length > 0) {
			const children = results.map(function (item) {
				return new HistoryButton(item);
			});
			children.unshift(new Separator({title: this._i18n(separatorI18n)}));
			this._searchLayer.insert(children);
		}
	}
	get width() {
		return this._root.width;
	}
	set width(value) {
		typecheck(arguments, Number);
		this._root.width = value;
	}
	get height() {
		return this._root.height;
	}
	set height(value) {
		typecheck(arguments, Number);
		this._root.height = value;
	}
	set animate(value) {
		typecheck(arguments, Boolean);
		this._animate = value;
		this._root.setTheme(this._theme || "", this._animate);
	}
	get animate() {
		return this._animate;
	}
	set theme(value) {
		typecheck(arguments, String);
		this._theme = value;
		this._root.setTheme(this._theme, this._animate || false);
	}
	get theme() {
		return this._theme;
	}
	get timer() {
		return this._timer;
	}
	set timer(value) {
		typecheck(arguments, Boolean);
		this._timer = value;
	}
	// private _devicesVisible
	set _devicesVisible(value) {
		typecheck(arguments, Boolean);
		this._deviceLayer.visible = value;
		this._devicesButton.on    = value;
	}
	get _devicesVisible() {
		return this._deviceLayer.visible;
	}
}

return View;

});
