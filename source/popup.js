/************* source/popup.js - WHM Popup Entry Point Script *****************/
/**
 * @file This file is the entry point for Wrona History Menu Popup.
 * @copyright Copyright 2015 (c) Lukasz A.J. Wrona. All rights reserved. This
 * file is distributed under the GNU General Public License version 3. See
 * LICENSE for details.
 * @author Lukasz A.J. Wrona (lukasz.andrzej.wrona@gmail.com)
 */

"use strict"

define(["./Chrome", "./libraries/ui/source/Root", "./view"],
function (Chrome, Root, View) {

// get time sectors for search
function timeSectors(now) {
	const hour      = 1000 * 3600;
	const lastHour  = now - hour;
	const lastDay   = now - hour * 24;
	const yesterday = now - hour * 48;
	const lastWeek  = now - hour * 24 * 7;
	const prevWeek  = now - hour * 24 * 14;
	const lastMonth = now - hour * 24 * 30;
	const prevMonth = now - hour * 24 * 60;
	return [
		{ start: lastHour,  end: now,       i18n: "results_recently" },
		{ start: lastDay,   end: lastHour,  i18n: "results_today" },
		{ start: yesterday, end: lastDay,   i18n: "results_yesterday" },
		{ start: lastWeek,  end: yesterday, i18n: "results_this_week" },
		{ start: prevWeek,  end: lastWeek,  i18n: "results_last_week" },
		{ start: lastMonth, end: prevWeek,  i18n: "results_this_month" },
		{ start: prevMonth, end: lastMonth, i18n: "results_last_month" }
	];
}

class Token {
	constructor(tokenFactory) {
		typecheck(arguments, TokenFactory);
		tokenFactory._id   += 1;
		this._id           = tokenFactory._id;
		this._tokenFactory = tokenFactory;
	}
	get valid() {
		return this._id == this._tokenFactory._id;
	}
	valueOf() {
		return this.valid;
	}
}

class TokenFactory {
	constructor() {
		this._id = 0;
	}
}

Chrome.fetch("defaults.json")
	.then(JSON.parse)
	.then(Chrome.settings.getReadOnly)
	.then(function (settings) {
		return Promise.all([
			Root.ready(),
			Chrome.getI18n(settings.lang),
			settings
		])
	}).then(function (promises) {
		const root      = promises[0];
		const i18n      = promises[1];
		const settings  = promises[2];
		const view      = new View(root, i18n);
		const timestamp = Date.now();
		view.width      = settings.width;
		view.height     = settings.height;
		view.theme      = settings.theme || Chrome.getPlatform();
		view.animate    = settings.animate;
		view.timer      = settings.timer;
		window.view     = view;
		Promise.all([
			Chrome.history.search({
				text:       "", 
				startTime:  timestamp - 1000 * 3600 * 24 * 30, 
				endTime:    timestamp,
				maxResults: parseInt(settings.historyCount)
			}),
			Chrome.sessions.getRecent({
				maxResults: parseInt(settings.tabCount)
			})
		]).then(function (promises) {
			view.setRecent(promises[1], promises[0], settings.tabsFirst);
		});
		Chrome.sessions.getDevices().then(function (devices) {
			view.setDevices(devices);
		});
		// search
		const tokenFactory = new TokenFactory;
		view.onSearch = function (value) {
			typecheck(arguments, String);
			const token = new Token(tokenFactory);
			if (value.length == 0) {
				view.clearSearch();
			} else {
				view.beginSearch();
				timeSectors(Date.now()).reduce(function (promise, sector) {
					return promise.then(function () {
						return Chrome.history.search({
							text:      value,
							startTime: sector.start,
							endTime:   sector.end
						})
					}).then(function (results) {
						if (token.valid) {
							view.pushSearchResults(results, sector.i18n);
						}
					});
				}, new Promise(function (resolve) {
					setTimeout(function () {
						if (token.valid) {
							console.log("thend");
							resolve();
						}
					}, 500);
				})).then(function () {
					if (token.valid) {
						view.endSearch();
					}
				});
			}
		}
	});
});
