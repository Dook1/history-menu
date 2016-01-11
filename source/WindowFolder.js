/**
 * @file source/WindowFolder.js - WindowFolder class. Requires common.js loader,
 * like Require.js or Webpack.
 * @copyright Copyright 2016 (c) Lukasz A.J. Wrona. All rights reserved. This
 * file is distributed under the GNU General Public License version 3. See
 * LICENSE for details.
 * @author Lukasz A.J. Wrona (lukasz.andrzej.wrona@gmail.com)
 */

"use strict";

define(["./libraries/ui/source/Folder", "./TabButton.js"],
		function(Folder, TabButton) {

const template = $({
	nodeName:   "DIV",
	className:  "Timer hidden",
	childNodes: [$("")]
});

class WindowFolder extends Folder {
	/**
	 * @brief WindowFolder constructor
	 * @param object Object: Object literal
	 * - open Boolean: (optional) Should the folder be open
	 * - sessionId String: chrome session identifier
	 * - tabs Array: Array of Tab object literals (look up TabButton
	 *   constructor)
	 * - view Object: View object, which will receive onSessionRestore events
	 * - timer Number: time of session closure
	 * - title String: String pattern, which will be converted to folder's title
	 *   example: Window (Number of tabs: $1)
	 */
	constructor(object) {
		typecheck.loose(arguments, {
			open:      [Boolean, undefined],
			sessionId: String,
			tabs:      Array,
			view:      Object, // view.js object
			timer:     [Number, undefined],
			title:     [String, undefined]
		});
		super();
		this.insert(object.tabs.map(function (tab) {
			return new TabButton({
				view:      object.view,
				sessionId: tab.sessionId,
				icon:      tab.icon,
				url:       tab.url
			});
		}.bind(this)));
		this._timerNode = this.DOM.firstChild
		                 .appendChild(template.cloneNode(true));
		this.sessionId  = object.sessionId;
		this._view      = object.view;
		this.open       = object.open !== undefined
		                 ? object.open
		                 : true;
		this.timer      = object.timer;
		this.title      = object.title;
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
	fadeIn(delay) { /* override */
		super.fadeIn(delay);
		this._timerInterval = setInterval(function () {
			if (this._timer !== undefined) {
				this._timerNode.firstChild.nodeValue = this._timer;
			}
		}.bind(this), 500);
	}
	fadeOut(delay) { /* override */
		super.fadeOut(delay);
		clearInterval(this._timerInterval)
		this._timerInterval = undefined;
	}
	get timer() {
		return this._timer;
	}
	set timer(value) {
		typecheck(arguments, [Number, undefined]);
		this._timer                          = value;
		this._timerNode.firstChild.nodeValue = value;
	}
	get title() {
		return super.title;
	}
	set title(value) {
		typecheck(arguments, [String, undefined]);
		this._titleValue = value;
		this._updateTitle();
	}
	_updateTitle() {
		const titlePattern = this._titleValue || "";
		const childCount   = this.children.length.toString();
		super.title        = titlePattern.replace("$1", childCount);
	}
}

return WindowFolder;

});
