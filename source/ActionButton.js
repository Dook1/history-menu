"use strict"

define(["./libraries/ui/source/Button"], function (_Button) {

class ActionButton extends _Button {
	constructor (e) {
		super(e);
		this.click = e.click;
	}
}

return ActionButton;

});
