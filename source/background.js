"use strict";
define(["./Chrome.js"], function (Chrome) {
	Chrome.settings.getReadOnly({
		icon: "granite"
	}).then(function (settings) {
		chrome.browserAction.setIcon({
			path: "icons/history-19-" + settings.icon + ".png"
		});
	});
});
