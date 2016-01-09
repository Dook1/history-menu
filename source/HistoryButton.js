"use strict"

define(["./TimerButton"], function(TimerButton) {

const removeButton = $({
	nodeName:  "DIV",
	className: "Remove"
});

class HistoryButton extends TimerButton {
	constructor(item) {
		typecheck.loose(arguments, [{
			title:   [String, undefined],
			url:     String,
			tooltip: undefined // tooltip is generated
		}, undefined]);
		super(item);
		this.DOM.classList.add("History");
		this.title = item.title || "";
		this.url   = item.url;
		this.icon  = "chrome://favicon/" + item.url;
		if (item.lastVisitTime) {
			this._lastModified = item.lastVisitTime;
		}
		this._remove     = this.DOM.appendChild(removeButton.cloneNode(true));
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
			super.tooltip = this._hbTitle + "\n" + this.url;
		} else {
			super.title   = trimURL(this.url);
			super.tooltip = this.url;
		}
	}
}

return HistoryButton;

});
