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
    const timer         = 1337;
    const title         = "history-button-title";
    const url           = "http://example.com/";
    const view          = new ViewStub;

    // check constructor and tooltip being write-protected
    (function () {
        const historyButton = new HistoryButton({
            view:    view,
            timer:   timer,
            title:   title,
            url:     url
        });
        assert.ok(historyButton instanceof TimerButton,
                  "HistoryButton should implement timer interface");
        assert.equal(view.createdCount, 0,
                     "HistoryButton should not create any tabs upon"
                     + "construction");
        assert.equal(historyButton.timer, timer,
                     "HistoryButton timer should be properly settable through"
                     + "the constructor");
        assert.equal(historyButton.title, title,
                     "HistoryButton title should be properly settable through"
                     + "the constructor");
        assert.equal(historyButton.url, url,
                     "HistoryButton url should be properly settable through the"
                     + "constructor");
        assert.equal(historyButton.tooltip, title + "\n" + url,
                     "HistoryButton tooltip should be properly generated");
        // this should throw, but we can't remove method in derived class
        assert.throws(function () {
            historyButton.tooltip = "alternative-tooltip";
        }, TypeError, "HistoryButton tooltip should not be assignable");
    })();
    // check no-title fallback
    (function () {
        const historyButton = new HistoryButton({
            url: url
        });
        assert.equal(historyButton.title, url,
                     "HistoryButton should set title to url, if title is not"
                     + "defined");
        assert.equal(historyButton.tooltip, url,
                     "HistoryButton should set tooltip to url, if title is not"
                     + "defined");
    })();
    // check click event
    
});

});
