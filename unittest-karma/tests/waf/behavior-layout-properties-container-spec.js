/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, sinon */
var Class = WAF.require('waf-core/class');
var Widget = WAF.require('waf-core/widget');

moduleDescribe('waf-behavior/layout/properties-container', function() {
    describe('.linkListPropertyToContainer(name, options)', function() {
        var W;
        beforeEach(function() {
            W = Widget.create('W', {
                plip: Widget.property(),
                plop: Widget.property({ type: 'list' })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
        });
        it("should throw if property is unknown", function() {
            expect(function() {
                W.linkListPropertyToContainer('plup');
            }).to.throw();
        });
        it("should throw if property is not a list", function() {
            expect(function() {
                W.linkListPropertyToContainer('plip');
            }).to.throw();
        });
    });
    describe('#property.insert(index, item)', function() {
        var W, W2, w;
        beforeEach(function() {
            W2 = Widget.create('W2', {
                attr1: Widget.property(),
                attr2: Widget.property()
            });

            W = Widget.create('W', {
                plop: Widget.property({ type: 'list', attributes: ['attr1', 'attr2'] })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.restrictWidget(W2);
            W.linkListPropertyToContainer('plop');
            w = new W();
        });
        it("should add a new widget", function() {
            w.plop.insert(0, { attr1: 1, attr2: 2 });
            expect(w.countWidgets()).to.equal(1);
        });
        it("should add a new widget instance of the restricted class", function() {
            w.plop.insert(0, { attr1: 1, attr2: 2 });
            expect(w.widget(0)).to.be.instanceOfClass(W2);
        });
        it("should set the properties of the widget", function() {
            w.plop.insert(0, { attr1: 1, attr2: 2 });
            var w2 = w.widget(0);
            expect(w2.attr1()).to.equal(1);
            expect(w2.attr2()).to.equal(2);
        });
        it("should not fail if the property doesn't exists", function() {
            w.plop.insert(0, { unknown: 'plop' });
            expect(w.countWidgets()).to.equal(1);
        });
    });
    describe('#property.insert(index, item)', function() {
        var W, W2, w, spy;
        beforeEach(function() {
            W2 = Widget.create('W2', {
                attr1: Widget.property(),
                attr2: Widget.property()
            });

            W = Widget.create('W', {
                plop: Widget.property({ type: 'list', attributes: ['attr1', 'attr2'] })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.linkListPropertyToContainer('plop', {
                defaultWidgetClass: W2,
                getNewWidget: spy = sinon.spy(function() { return new W2(); })
            });
            w = new W();
        });
        it("should add a new widget instance of the defaultWidgetClass option", function() {
            w.plop.insert(0, { attr1: 1, attr2: 2 });
            expect(w.widget(0)).to.be.instanceOfClass(W2);
        });
        it("should call getNewWidget", function() {
            var o = { attr1: 1, attr2: 2};
            w.plop.insert(0, o);
            expect(spy).to.have.been.calledWith(o);
        });
    });
    describe('#property.remove(index)', function() {
        it("should remove a widget", function() {
            var W2 = Widget.create('W2');
            var W = Widget.create('W', {
                plop: Widget.property({ type: 'list', attributes: ['attr1', 'attr2'] })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.restrictWidget(W2);
            W.linkListPropertyToContainer('plop');
            var w = new W();
            w.plop.push({});
            expect(w.countWidgets()).to.equal(1);
            w.plop.remove(0);
            expect(w.countWidgets()).to.equal(0);
        });
    });
    describe('#property(index, item)', function() {
        var W, W2, w;
        beforeEach(function() {
            W2 = Widget.create('W2', {
                attr1: Widget.property(),
                attr2: Widget.property()
            });

            W = Widget.create('W', {
                plop: Widget.property({ type: 'list', attributes: ['attr1', 'attr2'] })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.restrictWidget(W2);
            W.linkListPropertyToContainer('plop');
            w = new W();
            w.plop.push({});
            w.plop.push({});
            w.plop.push({});
        });
        it("should not add or remove a widget", function() {
            var c = w.countWidgets();
            w.plop(1, { attr1: 1, attr2: 2 });
            expect(w.countWidgets()).to.equal(c);
        });
        it("should set the properties of the widget", function() {
            w.plop(1, { attr1: 1, attr2: 2 });
            expect(w.widget(1).attr1()).to.equal(1);
            expect(w.widget(1).attr2()).to.equal(2);
        });
        it("should not fail if the property doesn't exists", function() {
            var c = w.countWidgets();
            w.plop(1, { unknown: 'plop' });
            expect(w.countWidgets()).to.equal(c);
        });
    });
    describe('#property(index, item)', function() {
        var W, W2, w, spy;
        beforeEach(function() {
            W2 = Widget.create('W2', {
                attr1: Widget.property(),
                attr2: Widget.property()
            });

            W = Widget.create('W', {
                plop: Widget.property({ type: 'list', attributes: ['attr1', 'attr2'] })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.restrictWidget(W2);
            W.linkListPropertyToContainer('plop', {
                modifyWidget: spy = sinon.spy()
            });
            w = new W();
            w.plop.push({});
            w.plop.push({});
            w.plop.push({});
        });
        it("should call modifyWidget", function() {
            var o = { attr1: 1, attr2: 2 };
            w.plop(1, o);
            expect(spy).to.have.been.calledWith(1, o);
        });
    });
    describe("#property.move(from, to)", function() {
        var W, W2, w;
        beforeEach(function() {
            W2 = Widget.create('W2', {
                attr1: Widget.property(),
                attr2: Widget.property()
            });

            W = Widget.create('W', {
                plop: Widget.property({ type: 'list', attributes: ['attr1', 'attr2'] })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.restrictWidget(W2);
            W.linkListPropertyToContainer('plop');
            w = new W();
            w.plop.push({});
            w.plop.push({});
            w.plop.push({});
        });
        it("should move the widget without destroying it", function() {
            var w2 = w.widget(1);
            w.plop.move(1, 0);
            expect(w.widget(0)).to.equal(w2);
        });
        it("should not add or remove a widget", function() {
            var c = w.countWidgets();
            w.plop.move(1, 0);
            expect(w.countWidgets()).to.equal(c);
        });
    });
    describe("#insertWidget(index, widget)", function() {
        var W, W2, w;
        beforeEach(function() {
            W2 = Widget.create('W2', {
                attr1: Widget.property(),
                attr2: Widget.property()
            });

            W = Widget.create('W', {
                plop: Widget.property({ type: 'list', attributes: ['attr1', 'attr2'] })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.restrictWidget(W2);
            W.linkListPropertyToContainer('plop');
            w = new W();
        });
        it("should add an item to the list", function() {
            var w2 = new W2({ attr1: 'a', attr2: 'b' });
            w.attachWidget(w2);
            expect(w.plop.count()).to.equal(1);
        });
        it("should copy properties values into the item", function() {
            var w2 = new W2({ attr1: 'a', attr2: 'b' });
            w.attachWidget(w2);
            expect(w.plop(0).attr1).to.equal('a');
            expect(w.plop(0).attr2).to.equal('b');
        });
        it("should insert item at the same position than the widget", function() {
            var w1 = new W2({ attr1: 'a', attr2: 'b' });
            w.attachWidget(w1);
            var w2 = new W2({ attr1: 'c', attr2: 'd' });
            w.attachWidget(w2);
            var w3 = new W2({ attr1: 'e', attr2: 'f' });
            w.insertWidget(1, w3);
            expect(w.plop()).to.deep.equal([
                { attr1: 'a', attr2: 'b' },
                { attr1: 'e', attr2: 'f' },
                { attr1: 'c', attr2: 'd' }
            ]);
        });
    });
    describe("#insertWidget(index, widget)", function() {
        var W, W2, w, spy;
        beforeEach(function() {
            W2 = Widget.create('W2', {
                attr1: Widget.property(),
                attr2: Widget.property()
            });

            W = Widget.create('W', {
                plop: Widget.property({ type: 'list', attributes: ['attr1', 'attr2'] })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.restrictWidget(W2);
            W.linkListPropertyToContainer('plop', {
                getValueFromWidget: spy = sinon.stub().returns({})
            });
            w = new W();
        });
        it("should call getValueFromWidget", function() {
            var w2 = new W2();
            w.attachWidget(w2);
            expect(spy).to.have.been.calledWith(w2);
        });
    });
    describe("#widget(index, widget)", function() {
        var W, W2, w;
        beforeEach(function() {
            W2 = Widget.create('W2', {
                attr1: Widget.property(),
                attr2: Widget.property()
            });

            W = Widget.create('W', {
                plop: Widget.property({ type: 'list', attributes: ['attr1', 'attr2'] })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.restrictWidget(W2);
            W.linkListPropertyToContainer('plop');
            w = new W();
            w.attachWidget(new W2());
        });
        it("should add an item to the list", function() {
            var w2 = new W2({ attr1: 'a', attr2: 'b' });
            w.widget(0, w2);
            expect(w.plop.count()).to.equal(1);
        });
        it("should copy properties values into the item", function() {
            var w2 = new W2({ attr1: 'a', attr2: 'b' });
            w.widget(0, w2);
            expect(w.plop(0).attr1).to.equal('a');
            expect(w.plop(0).attr2).to.equal('b');
        });
    });
    describe("#widget(index, widget)", function() {
        var W, W2, w, spy;
        beforeEach(function() {
            W2 = Widget.create('W2', {
                attr1: Widget.property(),
                attr2: Widget.property()
            });

            W = Widget.create('W', {
                plop: Widget.property({ type: 'list', attributes: ['attr1', 'attr2'] })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.restrictWidget(W2);
            W.linkListPropertyToContainer('plop', {
                getValueFromWidget: spy = sinon.stub().returns({})
            });
            w = new W();
            w.attachWidget(new W2());
            spy.reset();
        });
        it("should call getValueFromWidget", function() {
            var w2 = new W2();
            w.widget(0, w2);
            expect(spy).to.have.been.calledWith(w2);
        });
    });
    describe("#detachWidget(index)", function() {
        var W, W2, w;
        beforeEach(function() {
            W2 = Widget.create('W2', {
                attr1: Widget.property(),
                attr2: Widget.property()
            });

            W = Widget.create('W', {
                plop: Widget.property({ type: 'list', attributes: ['attr1', 'attr2'] })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.restrictWidget(W2);
            W.linkListPropertyToContainer('plop');
            w = new W();
            w.plop([
                { attr1: 'a', attr2: 'b' },
                { attr1: 'e', attr2: 'f' },
                { attr1: 'c', attr2: 'd' }
            ]);
        });
        it("should remmove the item", function() {
            w.detachWidget(1);
            expect(w.plop()).to.deep.equal([
                { attr1: 'a', attr2: 'b' },
                { attr1: 'c', attr2: 'd' }
            ]);
        });
    });
    describe("#moveWidget(from, to)", function() {
        var W, W2, w;
        beforeEach(function() {
            W2 = Widget.create('W2', {
                attr1: Widget.property(),
                attr2: Widget.property()
            });

            W = Widget.create('W', {
                plop: Widget.property({ type: 'list', attributes: ['attr1', 'attr2'] })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.restrictWidget(W2);
            W.linkListPropertyToContainer('plop');
            w = new W();
            w.plop([
                { attr1: 'a', attr2: 'b' },
                { attr1: 'e', attr2: 'f' },
                { attr1: 'c', attr2: 'd' }
            ]);
        });
        it("should move the item without destroying it", function() {
            var o2 = w.plop(1);
            w.moveWidget(1, 0);
            expect(w.plop(0)).to.equal(o2);
        });
        it("should not add or remove an item", function() {
            var c = w.plop.count();
            w.moveWidget(1, 0);
            expect(w.plop.count()).to.equal(c);
        });
    });
    describe('callbacks', function() {
        var W, W2, w, insertSpy, removeSpy, moveSpy, modifySpy;
        beforeEach(function() {
            W2 = Widget.create('W2', {
                attr1: Widget.property(),
                attr2: Widget.property()
            });

            W = Widget.create('W', {
                plop: Widget.property({
                    type: 'list',
                    attributes: ['attr1', 'attr2'],
                    onInsert: insertSpy = sinon.spy(),
                    onRemove: removeSpy = sinon.spy(),
                    onMove:   moveSpy   = sinon.spy(),
                    onModify: modifySpy = sinon.spy()
                })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.restrictWidget(W2);
            W.linkListPropertyToContainer('plop');
            w = new W();
        });
        it("should preserve original onInsert callbacks", function() {
            w.attachWidget(new W2());
            expect(insertSpy).to.have.been.called;
        });
        it("should preserve original onRemove callbacks", function() {
            w.attachWidget(new W2());
            w.detachWidget(0);
            expect(removeSpy).to.have.been.called;
        });
        it("should preserve original onMove callbacks", function() {
            w.attachWidget(new W2());
            w.attachWidget(new W2());
            w.moveWidget(1,0);
            expect(moveSpy).to.have.been.called;
        });
        it("should preserve original onModify callbacks", function() {
            w.attachWidget(new W2());
            w.plop(0, {});
            expect(modifySpy).to.have.been.called;
        });
    });
    describe('callbacks', function() {
        var W, W2, w, insertSpy, removeSpy;
        beforeEach(function() {
            W2 = Widget.create('W2', {
                attr1: Widget.property(),
                attr2: Widget.property()
            });

            W = Widget.create('W', {
                plop: Widget.property({
                    type: 'list',
                    attributes: ['attr1', 'attr2'],
                    onInsert: insertSpy = sinon.spy(),
                    onRemove: removeSpy = sinon.spy()
                })
            });
            W.inherit('waf-behavior/layout/container');
            W.inherit('waf-behavior/layout/properties-container');
            W.restrictWidget(W2);
            W.linkListPropertyToContainer('plop');
            w = new W();
            w.plop([{}, {}]);
            insertSpy.reset();
            insertSpy.reset();
        });
        it("shouldn't call onInsert and onRemove on move", function() {
            w.moveWidget(1,0);
            expect(insertSpy).to.have.been.called;
            expect(removeSpy).to.have.been.called;
        });
        it("shouldn't call onInsert and onRemove on modify", function() {
            w.plop(1, {});
            expect(insertSpy).to.have.been.called;
            expect(removeSpy).to.have.been.called;
        });
    });
//    describe("#widget(index).property(value)", function() {
//        it("should update the item value", function() {
//        });
//    });
    testBehaviorPropertiesList(function(W) {
        var W2 = Widget.create('W2');
        W.inherit('waf-behavior/layout/container');
        W.inherit('waf-behavior/layout/properties-container');
        W.restrictWidget(W2);
        W.linkListPropertyToContainer('items');
    });
    testBehaviorLayoutContainer(function(W) {
        W.addProperty('items', { type: 'list', attributes: [] });
        W.inherit('waf-behavior/layout/properties-container');
        W.restrictWidget(Widget.BaseWidget);
        W.linkListPropertyToContainer('items');
    });
});


