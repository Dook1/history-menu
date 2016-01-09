/************* source/popup.js - WHM Popup Entry Point Script *****************/
/**
 * @file This file is the entry point for Wrona History Menu Popup.
 * @copyright Copyright 2015 (c) Lukasz A.J. Wrona. All rights reserved. This
 * file is distributed under the GNU General Public License version 3. See
 * LICENSE for details.
 * @author Lukasz A.J. Wrona (lukasz.andrzej.wrona@gmail.com)
 */

"use strict"

define(["./ActionButton", "./Chrome", "./DevicesButton", "./DeviceFolder",
		"./libraries/ui/source/Input", "./libraries/ui/source/Layer",
		"./libraries/ui/source/MultiButton",
		"./libraries/ui/source/Progressbar.js",
		"./libraries/ui/source/Separator", "./WindowFolder", "./TabButton",
		"./HistoryButton", "./libraries/ui/source/Root"],
function (ActionButton, Chrome, DevicesButton, DeviceFolder, Input, Layer,
	MultiButton, Progressbar, Separator, WindowFolder, TabButton, HistoryButton,
	Root) {

// get time sectors for search
function timeSectors(now) {
	const hour      = 1000 * 3600;
	const lastHour  = now - hour;
	const lastDay   = now - hour * 24;
	const yesterday = now - hour * 48;
	const lastWeek  = now - hour * 24 * 7;
	const prevWeek  = now - hour * 24 * 14;
	const lastMonth = now - hour * 24 * 30;
	const prevMonth = now - hour * 24 * 60;
	return [
		{ start: lastHour,  end: now,       i18n: "results_recently" },
		{ start: lastDay,   end: lastHour,  i18n: "results_today" },
		{ start: yesterday, end: lastDay,   i18n: "results_yesterday" },
		{ start: lastWeek,  end: yesterday, i18n: "results_this_week" },
		{ start: prevWeek,  end: lastWeek,  i18n: "results_last_week" },
		{ start: lastMonth, end: prevWeek,  i18n: "results_this_month" },
		{ start: prevMonth, end: lastMonth, i18n: "results_last_month" }
	];
}

class View {
	constructor(root, i18n) {
		this._root          = root;
		this._i18n          = i18n;
		this.onSearch       = function () {}
		this._mainLayer     = new Layer;
		this._searchLayer   = new Layer({visible: false});
		this._deviceLayer   = new Layer({visible: false});
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
						Chrome.tabs.openOrSelect("chrome://history/", false);
					}
				}),
				new ActionButton({
					tooltip: this._i18n("popup_options"),
					icon:    "icons/options.png",
					click:   function (e) {
						Chrome.tabs.openOrSelect(
							"chrome://extensions/?options=", false);
					}
				})
			]
		}));
	}
	setRecent(sessions, history, sessionsFirst) {
		typecheck(arguments, Array, Array, Boolean);
		const sessionNodes = sessions.map(function (session) {
			const sessionNode = session.tab
				? new TabButton(session.tab)
				: new WindowFolder(session.window);
			sessionNode.timer = session.lastModified * 1000;
			return sessionNode;
		});
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

class Token {
	constructor(tokenFactory) {
		typecheck(arguments, TokenFactory);
		tokenFactory._id   += 1;
		this._id           = tokenFactory._id;
		this._tokenFactory = tokenFactory;
	}
	get valid() {
		return this._id == this._tokenFactory._id;
	}
	valueOf() {
		return this.valid;
	}
}

class TokenFactory {
	constructor() {
		this._id = 0;
	}
}

Chrome.fetch("defaults.json")
	.then(JSON.parse)
	.then(Chrome.settings.getReadOnly)
	.then(function (settings) {
		return Promise.all([
			Root.ready(),
			Chrome.getI18n(settings.lang),
			settings
		])
	}).then(function (promises) {
		const root      = promises[0];
		const i18n      = promises[1];
		const settings  = promises[2];
		const view      = new View(root, i18n);
		const timestamp = Date.now();
		view.width      = settings.width;
		view.height     = settings.height;
		view.theme      = settings.theme || Chrome.getPlatform();
		view.animate    = settings.animate;
		view.timer      = settings.timer;
		window.view     = view;
		Promise.all([
			Chrome.history.search({
				text:       "", 
				startTime:  timestamp - 1000 * 3600 * 24 * 30, 
				endTime:    timestamp,
				maxResults: parseInt(settings.historyCount)
			}),
			Chrome.sessions.getRecent({
				maxResults: parseInt(settings.tabCount)
			})
		]).then(function (promises) {
			view.setRecent(promises[1], promises[0], settings.tabsFirst);
		});
		Chrome.sessions.getDevices().then(function (devices) {
			view.setDevices(devices);
		});
		// search
		const tokenFactory = new TokenFactory;
		view.onSearch = function (value) {
			typecheck(arguments, String);
			const token = new Token(tokenFactory);
			if (value.length == 0) {
				view.clearSearch();
			} else {
				view.beginSearch();
				timeSectors(Date.now()).reduce(function (promise, sector) {
					return promise.then(function () {
						return Chrome.history.search({
							text:      value,
							startTime: sector.start,
							endTime:   sector.end
						})
					}).then(function (results) {
						if (token.valid) {
							view.pushSearchResults(results, sector.i18n);
						}
					});
				}, new Promise(function (resolve) {
					setTimeout(function () {
						if (token.valid) {
							console.log("thend");
							resolve();
						}
					}, 500);
				})).then(function () {
					if (token.valid) {
						view.endSearch();
					}
				});
			}
		}
	});
});
