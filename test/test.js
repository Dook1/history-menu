"use strict";

define(["../source/ActionButton", "../source/HistoryButton",
        "../source/TimerButton"],
       function (ActionButton, HistoryButton, TimerButton) {

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

});
