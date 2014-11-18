var Widget = WAF.require('waf-core/widget');
/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, afterEach, sinon */

moduleDescribe('waf-behavior/style', function() {
    var W, w;
    beforeEach(function() {
        W = Widget.create('W');
        w = new W();
        w.node.style.width = '100px';
        w.node.style.height = '200px';
    });

    describe("#width(width)", function() {
        it("should get the width", function() {
            expect(w.width()).to.equal(100);
        });
        it("should set the width", function() {
            expect(w.width(300)).to.equal(300);
            expect(w.width()).to.equal(300);
        });
        it("should fire resize event defered", function(done) {
            w.subscribe('resize', function() { done(); });
            w.width(300);
        });
    });
    describe("#height(height)", function() {
        it("should get the height", function() {
            expect(w.height()).to.equal(200);
        });
        it("should set the height", function() {
            expect(w.height(300)).to.equal(300);
            expect(w.height()).to.equal(300);
        });
        it("should fire resize event defered", function(done) {
            w.subscribe('resize', function() { done(); });
            w.height(300);
        });
    });
    describe("#size(w, h)", function() {
        it("should get the size", function() {
            var r = w.size();
            expect(r).to.have.property('0', 100);
            expect(r).to.have.property('width', 100);
            expect(r).to.have.property('1', 200);
            expect(r).to.have.property('height', 200);
            expect(r).to.have.property('length', 2);
        });
        it("should set the size", function() {
            var r = w.size(150,250);
            expect(r).to.have.property('0', 150);
            expect(r).to.have.property('width', 150);
            expect(r).to.have.property('1', 250);
            expect(r).to.have.property('height', 250);
            expect(r).to.have.property('length', 2);
            r = w.size();
            expect(r).to.have.property('0', 150);
            expect(r).to.have.property('width', 150);
            expect(r).to.have.property('1', 250);
            expect(r).to.have.property('height', 250);
            expect(r).to.have.property('length', 2);
        });
        it("should fire resize event defered", function(done) {
            var spy = sinon.spy();
            w.subscribe('resize', spy);
            w.size(150,250);
            setTimeout(function() {
                expect(spy).to.have.been.calledOnce;
                done();
            }, 50);
        });
    });
    describe("#autoWidth()", function() {
        it("should set width to auto", function() {
            w.autoWidth();
            expect(w.node.style.width).to.equal('auto');
        });
    });
    describe("#autoHeight()", function() {
        it("should set height to auto", function() {
            w.autoHeight();
            expect(w.node.style.height).to.equal('auto');
        });
    });
    describe("#hasRelativeSize()", function() {
    });

    describe('Event resize', function() {
    });
});
