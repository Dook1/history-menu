"use strict";

define(["./TimerButton"], function (TimerButton) {

class TabButton extends TimerButton {
	/**
	 * @brief TabButtonConstructor
	 * Exception-Safety: No-throw guarantee
	 * @param tab Object: Object literal. Properties:
	 * - icon String: (optional)
	 * - sessionId String: ID of the tab session to restore
	 * - timer Number: (optional) Unix timestamp of time close. Will be
	 *   displayed as a little live timer on the right of the button
	 * - title String: (string) title of the button, Represents a text on top of
	 *   the button
	 * - url String: (optional) URL Of the tab, Sets the text of the tooltip
	 *   displayed when mouse hovering over the button and sets favicon to the
	 *   favicon of the page
	 */
	constructor(tab) {
		typecheck.loose(arguments, {
			sessionId: String,
			url:       String,
			view:      Object
		});
		super({
			icon:   "chrome://favicon/" + tab.url,
			title:   tab.title,
			timer:   tab.timer
		});
		this.sessionId = tab.sessionId;
		this._view     = tab.view;
		this.url       = tab.url;
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
			inBackground: !!(e.which == 2 || e.ctrlKey)
		});
	}
	set url(value) {
		typecheck(arguments, String);
		super.tooltip = value;
		super.icon    = "chrome://favicon/" + value;
	}
	get url() {
		return super.tooltip;
	}
	get tooltip() {
		return super.tooltip;
	}
};

return TabButton;

});
