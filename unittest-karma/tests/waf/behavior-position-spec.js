var Widget = WAF.require('waf-core/widget');
/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, afterEach, sinon */

moduleDescribe('waf-behavior/style', function() {
    var W, w, w2;
    var Body = WAF.require('waf-widget/body');
    var body = new Body();
    beforeEach(function() {
        W = Widget.create('W');
        W.inherit('waf-behavior/layout/container');
        w = new W();
        w2 = new W();
        w.node.style.position = 'absolute';
        w.node.style.left = '10px';
        w.node.style.top = '20px';
        w.size(500, 500);
        body.attachWidget(w);
        w2.node.style.position = 'absolute';
        w2.node.style.left = '10px';
        w2.node.style.top = '20px';
        w2.size(200, 200);
        w.attachWidget(w2);
    });
    afterEach(function() {
        body.detachWidget(0);
    });
    describe("#left(x)", function() {
        it("should get left", function() {
            expect(w.left()).to.equal(10);
        });
        it("should set left", function() {
            expect(w.left(30)).to.equal(30);
            expect(w.left()).to.equal(30);
        });
    });
    describe("#top(y)", function() {
        it("should get top", function() {
            expect(w.top()).to.equal(20);
        });
        it("should set top", function() {
            expect(w.top(30)).to.equal(30);
            expect(w.top()).to.equal(30);
        });
    });
    describe("#right(x)", function() {
        it("should set right", function() {
            w2.autoWidth();
            w2.right(10);
            expect(w2.width()).to.equal(500 - 10 - 10);
        });
    });
    describe("#bottom(y)", function() {
        it("should set botom", function() {
            w2.autoHeight();
            w2.bottom(10);
            expect(w2.height()).to.equal(500 - 20 - 10);
        });
    });
    describe("#fitToLeft()", function() {
        it("should set left to 0", function() {
        });
        it("should preserve right", function() {
        });
        it("should fire resize event", function() {
        });
    });
    describe("#fitToTop()", function() {
        it("should set top to 0", function() {
        });
        it("should preserve bottom", function() {
        });
        it("should fire resize event", function() {
        });
    });
    describe("#fitToRight()", function() {
        it("should set right to 0", function() {
        });
        it("should preserve left", function() {
        });
        it("should fire resize event", function() {
        });
    });
    describe("#fitToBottom()", function() {
        it("should set bottom to 0", function() {
        });
        it("should preserve top", function() {
        });
        it("should fire resize event", function() {
        });
    });
    describe("#position(x, y)", function() {
        it("should get the position", function() {
        });
        it("should set the position", function() {
        });
    });
    describe("#absolutePosition()", function() {
        it("should get the absolute position", function() {
        });
    });
});
