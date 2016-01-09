"use strict"

define(["./libraries/ui/source/Button"], function (Button) {
const template = $({
	nodeName: "DIV",
	className: "Timer hidden",
	childNodes: [$("")]
});

class TimerButton extends Button {
	constructor(e) {
		typecheck.loose(arguments, {
			timer: [Number, undefined]
		});
		super(e);
		this._timerNode = this.DOM.appendChild(template.cloneNode(true));
		this.timer      = e.timer;
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
			this._timerNode.firstChild.nodeValue =
				relativeTime(this.timer);
		}
	}
};

return TimerButton;

});
