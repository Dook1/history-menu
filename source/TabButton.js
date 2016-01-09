"use strict";

define(["./TimerButton"], function (TimerButton) {

class TabButton extends TimerButton {
   constructor(tab) {
		typecheck.loose(arguments, {
			sessionId: String,
			view:      Object
		});
		super({
			icon:   "chrome://favicon/" + tab.url,
			title:   tab.title,
			tooltip: tab.url,
			timer:   tab.timer
		});
		this.sessionId = tab.sessionId;
		this._view     = tab.view;
	}
	mousedown(e) { /* override */
		if (e.which == 2) {
			e.preventDefault();
		}
	}
	click(e) { /*override*/
		e.preventDefault();
		this._view.onSessionRestore({
			sessionId:    this.sessionId,
			inBackground: e.which == 2 || e.ctrlKey
		});
	}
};

return TabButton;

});
