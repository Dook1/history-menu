/**
 * @file source/TimerButton.js - TimerButton class. Requires common.js loader,
 * like Require.js or Webpack.
 * @copyright Copyright 2016 (c) Lukasz A.J. Wrona. All rights reserved. This
 * file is distributed under the GNU General Public License version 3. See
 * LICENSE for details.
 * @author Lukasz A.J. Wrona (lukasz.andrzej.wrona@gmail.com)
 */

"use strict";

define(["./libraries/ui/source/Button"], function (Button) {
const template = $({
	nodeName:  "DIV",
	className: "Timer hidden",
	childNodes: [$("")]
});

/**
 * @brief TimerButton - Button with little live timer on the right
 */
class TimerButton extends Button {
	/**
	 * @brief TimerButton constructor
	 * Exception Safety: No-throw guarantee
	 * @param object - Object literal, properties:
	 * - icon String: (optional) url to 16x16 icon
	 * - timer Number (optional) Unix timestamp. When url was visited, will
	 *   display little timer on the right
	 * - title String: (optional) Button text label
	 */
	constructor(object) {
		typecheck.loose(arguments, {
			timer: [Number, undefined]
		});
		super(object);
		this._timerNode = this.DOM.appendChild(template.cloneNode(true));
		if (object.timer !== undefined) {
			this.timer = object.timer;
		}
	}
	fadeIn(e) { // override
		super.fadeIn(e);
		this._timerInterval = setInterval(this._updateTimer.bind(this), 500);
	}
	fadeOut(e) { // override
		super.fadeOut(e);
		clearInterval(this._timerInterval);
	}
	set timer(value) {
		typecheck(arguments, [Number, undefined]);
		this._timer = value;
		this._timerNode.classList.toggle("hidden", !value);
		this._updateTimer();
	}
	get timer() {
		return this._timer;
	}
	_updateTimer() {
		if (this.timer) {
			this._timerNode.firstChild.nodeValue = relativeTime(this.timer);
		}
	}
};

return TimerButton;

});
