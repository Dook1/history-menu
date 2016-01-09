"use strict";

define(["./libraries/ui/source/Folder", "./TabButton.js"],
		function(Folder, TabButton) {

const template = $({
	nodeName:   "DIV",
	className:  "Timer hidden",
	childNodes: [$("")]
});

class WindowFolder extends Folder {
	constructor(wnd) {
		typecheck.loose(arguments, {
			open:      [Boolean, undefined],
			sessionId: String,
			view:      Object // view.js object
		});
		super();
		this._timer    = this.DOM.firstChild
		                 .appendChild(template.cloneNode(true))
		                 .firstChild;
		this.insert(wnd.tabs.map(function (tab) {
			return new TabButton({
				view:      this.view,
				sessionId: tab.sessionId,
				icon:      tab.icon,
				url:       tab.url
			});
		}.bind(this)));
		this.title     = "Window (Number of tabs: " + wnd.tabs.length + ")";
		this.open      = wnd.open !== undefined
		                 ? wnd.open
		                 : true;
		this.timer     = wnd.timer;
		this.sessionId = wnd.sessionId;
		this._view     = view;
	}
	mousedown(e) { /* override */
		e.preventDefault();
	}
	click(e) { /*override*/
		e.preventDefault();
		if (e.which == 2 || e.ctrlKey) {
			this._view.onSessionRestore({
				sessionId:    this._sessionId,
				inBackground: e.which || e.ctrlKey
			});
		} else {
			Folder.prototype.click.call(this, e);
		}
	}
}

return WindowFolder;

});
