/**
 * @file source/chrome.js - Webkit Extension API Wrapper.
 *
 * Webkit Extension API wrapper using ES6 features - promises, accessors and 
 * classes. Levels differences between different Webkit implementations (Opera,
 * Chrome). Also adds some useful features of its own (settings management, tab
 * management, fetch for extension-local files, language switching, etc.)
 *
 * @author Lukasz A.J. Wrona (lukasz.andrzej.wrona@gmail.com)
 *
 * @license GNU Lesser General Public License version 3
 */

"use strict"
define([], function () {

/**
 * @brief Modernizes Chrome Extension API system function.
 *
 * Helper function. Modernizes Chrome's API system call. Binds function to it's
 * parent \p namespace. Converts return-by-callback behavior to
 * return-by-promise behavior.
 * 
 * Exception Safety: Strong. Will throw if specified namespace/key is not a 
 * function
 *
 * @param namespace: Object parent of bound function
 * @param funcKey: String name of the function in the namespace. Function must
 * return value by callback
 * @throw Error: Function throws \c Error if \c namespace[funcKey] is not a
 * function
 * @return Function: wrapped function returning Promise to value previously
 * returned by callback
 */

function wrap(namespace, funcKey) {
	typecheck(arguments, Object, String);
	if (!namespace[funcKey] || !(namespace[funcKey] instanceof Function)) {
		throw new Error("namespace[funcKey] must be a function");
	}
	return function () {
		let args = Array.prototype.slice.call(arguments);
		return new Promise(function (resolve) {
			args.push(resolve);
			namespace[funcKey].apply(namespace, args);
		});
	}
}

let Chrome = {

/**
 * @brief Creates I18n function. I18n function returns locale message held under
 * I18n key.
 * Exception-Safety: No-Throw
 * Promise Exception-Safety: Strong Guarantee. Will throw if File-related
 * errors occur
 * @param locale String: Optional ID of the locale ex: en, en-gb, de
 * @return Promise: to Locale Map
 */
getI18n: function (locale) {
	typecheck(arguments, [String, undefined]);
	// default locale - use default chrome locale engine
	if (!locale)
		return Promise.resolve(chrome.i18n.getMessage.bind(chrome.i18n));
	// custom set to english - load only english
	if (locale == "en")
		return Chrome.fetch("_locales/en/messages.json")
			.then(function (json) {
				let locale = JSON.parse(json);
				return function (messageKey) {
					typecheck(arguments, String);
					let data = locale[messageKey];
					return data ? data.message : "";
				}
			});
	// custom set to non-english, english fallback
	return Promise.all([
			Chrome.fetch("_locales/" + locale + "/messages.json"),
			Chrome.fetch("_locales/en/messages.json")
	]).then(function (locales) {
		let locale = JSON.parse(locales[0]);
		let enLocale = JSON.parse(locales[1]);
		return function (messageKey) {
			let data = locale[messageKey] || enLocale[messageKey];
			return data ? data.message : "";		
		}
	});
},

/**
 * @brief Returns name of the platform
 * @note Exception Safety: No-Throw
 * @return String: Returns \c "Windows" on Windows platforms and \c "Ubuntu" on
 * Linux Platforms. Returns empty string otherwise.
 */
getPlatform: function() {
	if (navigator.appVersion.indexOf("Win") != -1)
		return "Windows";
	else if (navigator.appVersion.indexOf("Linux") != -1)
		return "Ubuntu";
	else return "";
},

/**
 * @brief \c fetch for extension-local files
 * @note Exception Safety: No-Throw
 * @note Promise Exception Safety: Promise will reject if file cannot be fetched
 * @param url String: path to the fetched file
 * @return: Promise Function returns Promise of string contents of the file
 */
fetch: function(url) {
	return new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300)
				resolve(xhr.response);
			else reject(xhr.statusText);
		}
		xhr.onerror = function () {
			reject(xhr.statusText);
		}
		xhr.send();
	});
},

history: {

	/**
	 * @brief Equivalent to chrome.history.search. Callback result will be
	 * forwarded to returned promise
	 * @param query Object: Search query object literal. Properties:
	 * - text String: search string
	 * - startDate Number: Optional beginning of the date range
	 * - endDate Number: Optional end of the date range
	 * - maxResults Number: Optional maximum number of results. Defaults to 100
	 * @throw Error: Throws if object literal is missing or contains invalid
	 * values
	 * @return Promise: Function returns a Promise of search results
	 */
	search: wrap(chrome.history, "search"),

	/**
	 * @brief Equivalent to chrome.history.deleteUrl. Callback result will be
	 * forwarded to returned promise
	 * @return Promise: Function returns empty Promise resolved after history
	 * entry gets deleted
	 */
	deleteUrl: wrap(chrome.history, "deleteUrl")
}, // namespace Chrome.history

sessions: {

	/**
	 * @brief Equivalent to chrome.sessions.getRecentlyClosed. Callback result
	 * will be forwarded to returned promise
	 * @return Promise: Function returns Promise of an array of recently closed 
	 * tabs
	 */
	getRecent: wrap(chrome.sessions, "getRecentlyClosed"),

	/**
	 * @brief Equivalent to chrome.sessions.getDevices Callback result will be
	 * forwarded to returned promise
	 * @return Promise of an array of devices
	 */
	getDevices: wrap(chrome.sessions, "getDevices"),
	
	/**
	 * @brief Restores specified session optionally in background
	 * @note Exception Safety: No-Throw.
	 * @note Promise Exception Safety: Strong. If session doesn't exist promise 
	 * will reject.
	 * @param sessionId String: ID of the session to restore
	 * @param inBackground Boolean: Optional. If specified, tab will be restored
	 * in background
	 * @return Promise: Returns promise that will be resolved after session gets
	 * restored.
	 */
	restore: function (sessionId, inBackground) {
		typecheck(arguments, String, [Boolean, undefined]);	
		return new Promise(function (resolve) {
			if (inBackground) {
				chrome.tabs.getCurrent(function (tab) {
					chrome.sessions.restore(sessionId, function () {
						chrome.tabs.update(tab.id, {active: true},
							resolve);
					});
				})
			} else chrome.sessions.restore(sessionId);
		});
	}
}, // namespace Chrome.sessions

storage: {

	local: {

		/**
		 * @brief Equivalent to chrome.storage.local.get Callback result will
		 * be forwarded to returned promise
		 * @param Array: Optional array of keys to fetch
		 * @return Promise: Promise of map of storage's local variables
		 */
		get: wrap(chrome.storage.local, "get"),

		/**
		 * @brief Equivalent to chrome.storage.local.set Callback result will
		 * be forwarded to returned promise
		 * @param Object: Map-like object literal containing values to be set
		 * @return Promise: Empty promise that will be resolved after all
		 * properties are set.
		 */
		set: wrap(chrome.storage.local, "set")
	}, // namespace Chrome.storage.local

	sync: {

		/**
		 * @brief Equivalent to chrome.storage.sync.get Callback result will
		 * be forwarded to returned promise
		 * @note Opera Browser doesn't synchronize its sync storage
		 * @param Array: Optional array of keys to fetch
		 * @return Promise: Promise of map of storage's local variables
		 */
		get: wrap(chrome.storage.sync, "get"),

		/**
		 * @brief Equivalent to chrome.storage.sync.set Callback result will
		 * be forwarded to returned promise
		 * @note Opera Browser doesn't synchronize its sync storage
		 * @param Object: Map-like object literal containing values to be set
		 * @return Promise: Empty promise that will be resolved after all
		 * properties are set.
		 */
		set: wrap(chrome.storage.sync, "set")
	} // namespace Chrome.storage.sync
}, // namespace Chrome.storage

settings: {

	/**
	 * @brief Obtains read-only Settings object.
	 * @note Exception Safety: No-throw
	 * @note Promise Exception Safety: Strong Guarantee
	 * @note Settings object shares its keys with local and sync storage. Be 
	 * cauctious when used in conjuction with Chrome.storage API. Local 
	 * storage's \c local property is used for switching between local and sync
	 * settings
	 * @param defaultSttings Object: Optional object literal containing default 
	 * settings that will be used as template if no settings are set yet.
	 * @return Promise: Function returns promise of settings object literal
	 */
	getReadOnly: function (defaultSettings) {
		defaultSettings = defaultSettings || {};
		return Promise.all([
			Chrome.storage.local.get(),
			Chrome.storage.sync.get()
		]).then(function (storages) {
			let local = storages[0];
			let sync = storages[1];
			if (local.local)
				return local;
			else return sync;
		}).then(function (settings) {
			for (var i in defaultSettings) {
				if (!settings.hasOwnProperty(i))
					settings[i] = defaultSettings[i];
			}
			return settings;
		});
	}, 

	/**
	 * @brief Placeholder Function
	 */
	getReadWrite: function () {
		throw new Error("Called Placeholder Function");
		
	}
}, // namespace Chrome.settings

tabs: {

	/**
	 * @brief Equivalent to chrome.tabs.create.
	 * @param properties Object: Object literal containing properties of newly
	 * created tab
	 * @return Promise: Function returns empty promise that will be resolved
	 * once tab is created
	 */
	create: wrap(chrome.tabs, "create"),

	/**
	 * @brief Equivalent to chrome.tabs.query.
	 * @param properties Object: Object literal containing properties of tab 
	 * to be found
	 * @return Promise: Function returns promise of Array of found tabs
	 */
	query: wrap(chrome.tabs, "query"),

	/**
	 * @brief Equivalent to chrome.tabs.create.
	 * @param properties Object: Object literal containing properties of updated
	 * tab
	 * @return Promise: Function returns empty promise that will be resolved
	 * once tab is updated
	 */
	update: wrap(chrome.tabs, "update"),

	/**
	 * @brief Equivalent to chrome.tabs.create.
	 * @param properties Object: Object literal containing ids of tabs to 
	 * highlight
	 * @return Promise: Function returns empty promise that will be resolved
	 * once tab is created
	 */
	highlight: wrap(chrome.tabs, "highlight"),

	/**
	 * @brief Creates new tab in current active window, specified by supplied 
	 * URL without closing extension popup. Optionally creates it in background.
	 * If tab with specified URL already exists, selects this tab.
	 * @note Exception Safety: No-Throw
	 * @note Promise Exception Safety: No-Throw
	 * @note might close popup in Goolge Chrome
	 * @param url String: URL of newly created tab.
	 * @param inBackground Boolean: Optional. Create background tab.
	 */
	// open url or if tab with URL already exists, select it instead
	openOrSelect: function (url, inBackground) {
		typecheck(arguments, String, [Boolean, undefined]);
		let colon = url.indexOf(":");
		if (colon >= 0) {
			// external URL (has comma)
			let pattern = "*" + url.substr(colon);
			return Chrome.tabs.query({url: pattern})
				.then(function (tabs) {
				console.log(tabs);
				if (tabs.length) {
					if (inBackground)
						return Chrome.tabs.highlight({
							tabs:
								tabs.map(function (tab) { return tab.index; })
						});		
					else return Chrome.tabs.update(
						tabs[0].id, 
						{ active: true }
					);
				} else {
					return Chrome.tabs.create({
						url: url,
						active: !inBackground
					});
				}
			});
		} else {
			// extension-local URL
			return Chrome.tabs.create({
				url: url,
				active: !inBackground
			});
		}
	}
} // namespace Chrome.tabs
} // namespace Chrome
return Chrome;
});
