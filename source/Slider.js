/**
 * @file source/Slider.js - Slider class. Requires common.js loader, like
 * Require.js or Webpack.
 * @copyright Copyright 2016 (c) Lukasz A.J. Wrona. All rights reserved. This
 * file is distributed under the GNU General Public License version 3. See
 * LICENSE for details.
 * @author Lukasz A.J. Wrona (lukasz.andrzej.wrona@gmail.com)
 */

"use strict";

define(["./libraries/ui/source/Node"], function (_Node) {

const sliderTemplate = $({
	nodeName:  "LABEL",
	className: "Slider",
	childNodes: [
		$({
			nodeName: "INPUT",
			type:     "range",
		}),
		$({
			nodeName: "INPUT",
			disabled: true,
		}),
		$("")
	]
});

/**
 * @brief Slider - Slider with label
 */
class Slider extends _Node {
	/**
	 * @brief Slider constructor
	 * Exception Safety: No-throw guarantee
	 * @param object - Object literal:
	 * - change Function: callback function, called when value of the slider
	 *   changes
	 * - max Number: (Optinoal) Maximum value, defaults to 100
	 * - min Number: (Optional) Minimum value, defaults to 0
	 * - step Number: (Optional) Step size, defaults to 1
	 * - title String: (Optional) Text label next to the slider
	 * - value Number: (Optional) Initial slider value, defaults to average
	 *   between min and max
	 */
	constructor(object) {
		typecheck(arguments, [{
			change: [Function, undefined],
			max:    [Number, undefined],
			min:    [Number, undefined],
			step:   [Number, undefined],
			title:  [String, undefined],
			value:  [Number, undefined]
		}, undefined]);
		super({
			DOM: sliderTemplate.cloneNode(true)
		});
		object = object || {};
		this._knob    = this.DOM.firstChild;
		this._title   = this.DOM.lastChild;
		this._display = this.DOM.childNodes[1];
		this.change   = object.change || function () {}
		this.max      = object.max || 100;
		this.min      = object.min || 0;
		this.step     = object.step || 1;
		this.title    = object.title || "";
		this.value    = object.value || (object.min + object.max) / 2;
	}
	set title(value) {
		typecheck(arguments, String);
		this._title.nodeValue = value;
	}
	get title() {
		return this._title.nodeValue;
	}
	set value(value) {
		typecheck(arguments, Number);
		this._knob.value    = value;
		this._display.value = value;
	}
	get value() {
		return this._knob.value;
	}
	set min(value) {
		typecheck(arguments, Number);
		this._knob.min = value;
	}
	get min() {
		return this._knob.min;
	}
	set max(value) {
		typecheck(arguments, Number);
		this._knob.max = value;
	}
	get max() {
		return this._knob.max;
	}
	set step(value) {
		typecheck(arguments, Number);
		this._knob.step = value;
	}
	get step() {
		return this._knob.step;
	}
	fadeIn() {
		let oldValue   = this.value;
		this._interval = setInterval(function () {
			if (this.value != oldValue) {
				oldValue            = this.value;
				this._display.value = this.value;
				this.change(this.value);
			}
		}.bind(this), 16);
	}
	fadeOut() {
		clearInterval(this._interval);
		this._interval = null;
	}
}

return Slider;

});
