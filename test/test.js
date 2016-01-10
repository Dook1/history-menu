"use strict";

define(["../source/ActionButton", "../source/HistoryButton", "../source/Slider",
        "../source/TabButton.js", "../source/TimerButton"],
       function (ActionButton, HistoryButton, Slider, TabButton, TimerButton) {

QUnit.test("ActionButton", function (assert) {
    const onClick      = function () { }
    const actionButton = new ActionButton({
        click: onClick
    });
    assert.equal(actionButton.click, onClick,
                 "ActionButton should pass click function through the"
                 + "constructor");
});

QUnit.test("HistoryButton", function (assert) {
    class ViewStub {
        constructor() {
            this.createdCount = 0;
        }
        onTabCreate(object) {
            this.createdCount += 1;
            this.createdTab   = object;
        }
    }
    const timer = 1337;
    const title = "history-button-title";
    const url   = "http://example.com/";

    // check constructor and tooltip being write-protected
    (function () {
        const view  = new ViewStub;
        const historyButton = new HistoryButton({
            view:  view,
            timer: timer,
            title: title,
            url:   url
        });
        assert.ok(historyButton instanceof TimerButton,
                  "HistoryButton should implement timer interface");
        assert.equal(view.createdCount, 0,
                     "HistoryButton should not create any tabs upon"
                     + "construction");
        assert.equal(historyButton.timer, timer,
                     "HistoryButton timer should be properly settable through "
                     + "the constructor");
        assert.equal(historyButton.title, title,
                     "HistoryButton title should be properly settable through "
                     + "the constructor");
        assert.equal(historyButton.url, url,
                     "HistoryButton url should be properly settable through the"
                     + " constructor");
        assert.equal(historyButton.tooltip, title + "\n" + url,
                     "HistoryButton tooltip should be properly generated");
        // this should throw, but we can't remove method in derived class
        assert.throws(function () {
            historyButton.tooltip = "alternative-tooltip";
        }, TypeError, "HistoryButton tooltip should not be assignable");
    })();
    // no-title fallback
    (function () {
        const historyButton            = new HistoryButton({
            url:  url,
            view: new ViewStub
        });
        assert.equal(historyButton.title, url,
                     "HistoryButton should set title to url, if title is not "
                     + "defined");
        assert.equal(historyButton.tooltip, url,
                     "HistoryButton should set tooltip to url, if title is not "
                     + "defined");
    })();
    // URL trimming
    (function () {
        const longUrl       = "http://example.com/very/long/url";
        const trimedUrl     = "http://example.com/very/.../url";
        const historyButton = new HistoryButton({
            url:  longUrl,
            view: new ViewStub
        });
        assert.equal(historyButton.title, trimedUrl,
                     "Long URL title should be trimmed");
    })();
    // Callback
    (function () {
        const historyButton = new HistoryButton({
            url:  url,
            view: new ViewStub
        });
        historyButton.click({
            which: 1,
        });
        assert.equal(view.createdTab.url, url,
                     "Clicked button should trigger supplied view's onTabCreate"
                     + " event with correct url");
        assert.equal(view.createdCount, 1,
                     "Clicked button should trigger supplied view's onTabCreate"
                     + " event only once");
        assert.equal(view.createdTab.inBackground, true,
                     "Button clicked with left mouse button should open tab"
                     + " in foreground");
        historyButton.click({
            which: 2
        });
        assert.equal(view.createdTab.inBackground, true,
                     "Button clicked with middle mouse button should open tab"
                     + " in background");
        historyButton.click({
            which:   1,
            ctrlKey: true
        });
        assert.equal(view.createdTab.inBackground, true,
                     "Button clicked with left mouse button and control key"
                     + " should create tab in background");
    });
});

QUnit.test("Slider", function(assert) {
    // slider default constructor
    (function () {
        const slider = new Slider;
        assert.ok(slider.click instanceof Function,
                  "Slider.click property should default to an empty function");
        assert.equal(slider.max, 100,
                     "Slider.max property should default to 100");
        assert.equal(slider.min, 0,
                     "Slider.min property should default to 0");
        assert.equal(slider.step, 1,
                     "Slider.step property should default to 1");
        assert.equal(slider.title, "",
                     "Slider.title property should default to an empty string");
        assert.equal(slider.value, 50,
                     "Slider.value property should default to min max average");
    }());
    (function () {
        const min    = 50;
        const max    = 150;
        const step   = 5;
        const title  = "slider-title";
        const value  = 75;
        const slider = new Slider({
            min:   min,
            max:   max,
            step:  step,
            title: title,
            value: value
        });
        assert.ok(slider.click instanceof Function,
                  "Slider.click property should be settable through the "
                  + "constructor");
        assert.equal(slider.max, max,
                     "Slider.max property should be settable through the "
                     + "constructor");
        assert.equal(slider.min, min,
                     "Slider.min property should be settable through the "
                     + "constructor");
        assert.equal(slider.step, step,
                     "Slider.step property should be settable through the "
                     + "constructor");
        assert.equal(slider.title, title,
                     "Slider.title property should be settable through the "
                     + "constructor");
        assert.equal(slider.value, value,
                     "Slider.value property should be settable through the "
                     + "constructor");
    }());
    // TODO: Should add QA-like tests, max < min, value lower than max, stepsize
    // in a wild range, etc.
});

QUnit.test("TabButton", function (assert) {
    class ViewStub {
        constructor() {
            this.callCount = 0;
        }
        onSessionRestore(object) {
            this.callCount += 1;
            this.restored  = object;
        }
    };
    const view      = new ViewStub;
    const title     = "tab-button-title";
    const url       = "http://example.com/";
    const sessionId = "session-id";
    const tabButton = new TabButton({
        view:      view,
        title:     title,
        sessionId: sessionId,
        url:       url
    });
    assert.equal(tabButton.title, title,
                 "TabBUtton.title should be settable through the constructor");
    assert.equal(tabButton.sessionId, sessionId,
                 "tabButton.sessionId should be settable through the "
                 + "constructor");
    assert.equal(tabButton.url, url,
                 "tabButton.url should be settable through the constructor");
    assert.equal(tabButton.icon, "chrome://favicon/http://example.com/",
                 "tabButton.icon should be deduced from URL");
    assert.equal(tabButton.tooltip, url,
                 "tabButton.tooltip should be deduced from url");
    assert.equal(view.callCount, 0,
                 "View.onSessionRestore should not be called during "
                 + "consturction");
    tabButton.click({
        which: 1,
        preventDefault: function () {}
    });
    assert.equal(view.callCount, 1,
                 "click should trigger onSessionRestore exactly once");
    assert.equal(view.restored.sessionId, sessionId,
                 "onSessionRestore should be supplied with correct sessionId");
    assert.equal(view.restored.inBackground, false,
                 "onSessionRestore should be called with inBackground set to "
                 + "false, when clicked with left mouse button");
    tabButton.click({
        which: 2,
        preventDefault: function () {}
    });
    assert.equal(view.restored.inBackground, true,
                 "onSessionRestore should be called with inBackground set to "
                 + "true, when clicked with middle mouse button");
    tabButton.click({
        which: 1,
        ctrlKey: true,
        preventDefault: function () {}
    });
    assert.equal(view.restored.inBackground, true,
                 "onSessionRestore should be called with inBackground set to "
                 + "true, when clicked with left mouse button and ctrl pressed");
});

});
