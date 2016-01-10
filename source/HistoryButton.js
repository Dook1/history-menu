/**
 * @file source/HistoryButton.js - HistoryButton class. Requires common.js
 * loader, like Require.js or Webpack.
 * @copyright Copyright 2016 (c) Lukasz A.J. Wrona. All rights reserved. This
 * file is distributed under the GNU General Public License version 3. See
 * LICENSE for details.
 * @author Lukasz A.J. Wrona (lukasz.andrzej.wrona@gmail.com)
 */

"use strict";

define(["./TimerButton"], function(TimerButton) {

const removeButton = $({
	nodeName:  "DIV",
	className: "Remove"
});

/**
 * @brief HistoryButton - History-Entry-Specific button with small subbutton for
 * removing history entry and little live timer showing last url access time
 */
class HistoryButton extends TimerButton {
	/**
	 * @brief HistoryButton constructor
	 * Exception Safety: No-throw guarantee
	 * @param object - Object literal, properties:
	 * - icon String: (optional) url to 16x16 icon
	 * - timer Number (optional) Unix timestamp. When url was visited, will
	 *   display little timer on the right
	 * - title String: (optional) Button text label
	 * - url String: URL, which should be opened when button is clicked
	 * - view View Object: View object, to which button will propagate events
	 */
	constructor(object) {
		typecheck.loose(arguments, [{
			url:  String,
			view: Object // 
		}, undefined]);
		super({
			icon:  object.icon,
			title: object.title,
			timer: object.timer
		});
		this.DOM.classList.add("History");
		this._remove = this.DOM.appendChild(removeButton.cloneNode(true));
		this._view   = object.view;
		this.url     = object.url;
	}
	fadeIn(e) { /* override */
		super.fadeIn(e);
		if (this._lastModified) {
			this._updateTimer();
			this._interval = setInterval(this._updateTimer.bind(this), 500);
		}
	}
	fadeOut(e) { /* override */
		super.fadeOut(e);
		clearInterval(this._interval);
	}
	mousedown(e) /*override*/ {
		// NOTE: without this, mouse enters scroll mode, because this is not a
		// true HTML Anchor element with defined href
		if (e.which == 2) {
			e.preventDefault();
		}
	}
	click(e) { /*override*/
		e.preventDefault();
		if (e.target == this._remove) {
			this._view.onHistoryRemove({
				url: this.url
			});
		} else {
			this.parent.remove(this);
			this._view.onTabCreate({
				url:          this.url,
				inBackground: e.which == 2 || e.ctrlKey
			});
		}
	}
	get title() { return super.title; }
	set title(value) { /* override */
		typecheck(arguments, String);
		this._hbTitle = value;
		this._hbUpdateLabels();
	}
	get url() { return this.DOM.href; }
	set url(value) {
		typecheck(arguments, String);
		this.DOM.href = value;
		this._hbUpdateLabels();
	}
	set highlighted(value) {
		typecheck(arguments, Boolean);
		this._highlighted = value;
		this.DOM.classList.toggle("highlighted", value);
	}
	get highlighted() { return this._highlighted; }
	get tooltip() { return super.tooltip; }
	_hbUpdateLabels() {
		if (this._hbTitle) {
			super.title   = this._hbTitle;
			super.tooltip = this._hbTitle + "\n" + this.url;
		} else {
			super.title   = trimURL(this.url);
			super.tooltip = this.url;
		}
	}
}

return HistoryButton;

});
