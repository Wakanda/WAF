/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, sinon */
var Widget = WAF.require('waf-core/widget');

function testBehaviorPropertiesList(upgradeWidget) {
    describe('type list', function() {
        var W, w;
        beforeEach(function() {
            W = Widget.create('W');
            W.addProperty('items', { type: 'list' });
            upgradeWidget(W);
            w = new W({ items: "[1,2,3]" });
        });
        describe('.addProperty( type list)', function() {
            it('should understand attributes as a list of strings', function() {
                var W  = Widget.create('W', { items: Widget.property({ type: 'list', attributes: ['a', 'b', { name: 'c' }] }) });
                upgradeWidget(W);
                expect(W._properties.items).to.have.a.property('attributes').to.be.a('array');
                expect(W._properties.items.attributes).to.have.length(3);
                expect(W._properties.items.attributes[0]).to.be.a('object').to.have.a.property('name', 'a');
                expect(W._properties.items.attributes[1]).to.be.a('object').to.have.a.property('name', 'b');
                expect(W._properties.items.attributes[2]).to.be.a('object').to.have.a.property('name', 'c');
            });
            it('should support insert callback as options', function() {
                var d = { index: 0 };
                var spy = sinon.spy();
                var W  = Widget.create('W', { items: Widget.property({ type: 'list', onInsert: spy }) });
                upgradeWidget(W);
                var w = new W();
                w.fire('insert', 'items', d);
                w.fire('insert', 'not_items');
                expect(spy).to.have.been.calledWith(d);
                expect(spy).to.have.been.calledOnce;
            });
            it('should support remove callback as options', function() {
                var d = { index: 0 };
                var spy = sinon.spy();
                var W  = Widget.create('W', { items: Widget.property({ type: 'list', onRemove: spy }) });
                upgradeWidget(W);
                var w = new W();
                w.fire('remove', 'items', d);
                w.fire('remove', 'not_items');
                expect(spy).to.have.been.calledWith(d);
                expect(spy).to.have.been.calledOnce;
            });
            it('should support move callback as options', function() {
                var d = { from: 0, to: 0 };
                var spy = sinon.spy();
                var W  = Widget.create('W', { items: Widget.property({ type: 'list', onMove: spy }) });
                upgradeWidget(W);
                var w = new W();
                w.fire('move', 'items', d);
                w.fire('move', 'not_items');
                expect(spy).to.have.been.calledWith(d);
                expect(spy).to.have.been.calledOnce;
            });
            it('should support modify callback as options', function() {
                var d = { index: 0 };
                var spy = sinon.spy();
                var W  = Widget.create('W', { items: Widget.property({ type: 'list', onModify: spy }) });
                upgradeWidget(W);
                var w = new W();
                w.fire('modify', 'items', d);
                w.fire('modify', 'not_items');
                expect(spy).to.have.been.calledWith(d);
                expect(spy).to.have.been.calledOnce;
            });
            it('should support change callback as options', function() {
                var d = {};
                var spy = sinon.spy();
                var W  = Widget.create('W', { items: Widget.property({ type: 'list', onChange: spy }) });
                upgradeWidget(W);
                var w = new W();
                w.fire('change', 'items', d);
                w.fire('change', 'not_items');
                expect(spy).to.have.been.calledWith(d);
            });
        });
        describe('events', function() {
            it('should have a onInsert helper', function() {
                expect(w.items).to.have.a.property('onInsert').to.be.a('function');
            });
            it('should launch callback when insert event with this target', function() {
                var d = { index: 0 };
                var spy = sinon.spy();
                w.items.onInsert(spy);
                w.fire('insert', 'items', d);
                w.fire('insert', 'not_items');
                expect(spy).to.have.been.calledWith(d);
                expect(spy).to.have.been.calledOnce;
            });
            it('should launch callback when remove event with this target', function() {
                var d = { index: 0 };
                var spy = sinon.spy();
                w.items.onRemove(spy);
                w.fire('remove', 'items', d);
                w.fire('remove', 'not_items');
                expect(spy).to.have.been.calledWith(d);
                expect(spy).to.have.been.calledOnce;
            });
            it('should launch callback when move event with this target', function() {
                var d = { from: 0, to: 0};
                var spy = sinon.spy();
                w.items.onMove(spy);
                w.fire('move', 'items', d);
                w.fire('move', 'not_items');
                expect(spy).to.have.been.calledWith(d);
                expect(spy).to.have.been.calledOnce;
            });
            it('should launch callback when modify event with this target', function() {
                var d = { index: 0 };
                var spy = sinon.spy();
                w.items.onModify(spy);
                w.fire('modify', 'items', d);
                w.fire('modify', 'not_items');
                expect(spy).to.have.been.calledWith(d);
                expect(spy).to.have.been.calledOnce;
            });
            it('should launch callback when change event with this target', function() {
                var d = {};
                var spy = sinon.spy();
                w.items.onChange(spy);
                w.fire('change', 'items', d);
                w.fire('change', 'not_items');
                expect(spy).to.have.been.calledWith(d);
                expect(spy).to.have.been.calledOnce;
            });
        });
        describe('#items()', function() {
            it('should have a #item() accessor', function() {
                expect(w).to.have.a.property('items').to.be.a('function');
                expect(w.items()).to.be.a('array');
            });
            it('should normalize an empty value to an empty list', function() {
                w.items("");
                expect(w.items()).to.deep.equal([]);
            });
            it('should normalize the default value', function() {
                expect(w.items()).to.deep.equal([1,2,3]);
            });
            it('should set the list', function() {
                w.items([4,5,6]);
                expect(w.items()).to.deep.equal([4, 5, 6]);
            });
            it('should get an item', function() {
                expect(w.items(1)).to.equal(2);
            });
            it('should set an item', function() {
                w.items(1, 4);
                expect(w.items()).to.deep.equal([1, 4, 3]);
            });
            it('should fire an modify event', function() {
                w.items.onMove(function(data) {
                    expect(data).to.have.a.property('from', 1);
                    expect(data).to.have.a.property('to', 0);
                });
                w.items(1, 0);
            });
            it('should fire an remove event', function() {
                w.items.onRemove(function(data) {
                    expect(data).to.have.a.property('index', 1);
                    expect(data).to.have.a.property('value', 2);
                });
                w.items(1, 0);
            });
            it('should fire an insert event', function() {
                w.items.onInsert(function(data) {
                    expect(data).to.have.a.property('index', 1);
                    expect(data).to.have.a.property('value', 0);
                });
                w.items(1, 0);
            });
            it('should fire a change event once', function(done) {
                w.items.onChange(function(data) {
                    done();
                });
                w.items(1,4);
            });
            it('should not fire insert and remove when onMove is set', function() {
                var spy = sinon.spy();
                var W  = Widget.create('W', { items: Widget.property({ type: 'list', onModify: undefined }) });
                upgradeWidget(W);
                var w = new W({ items: '[1,2,3]' });
                w.items.onInsert(spy);
                w.items.onRemove(spy);
                w.items(1,2);
                expect(spy).to.have.not.been.called;
            });
            it('should push if index == length', function() {
                w.items(3, 4);
                expect(w.items.count()).to.equal(4);
            });
            it("shouldn't fire modify if index == length", function() {
                var spy = sinon.spy();
                w.items.onModify(spy);
                w.items(3, 4);
                expect(spy).to.not.have.been.called;
            });
            it("should fire insert if index == length", function() {
                var spy = sinon.spy();
                w.items.onInsert(spy);
                w.items(3, 4);
                expect(spy).to.have.been.called;
            });
            it("should throw if index > length", function() {
                expect(function() {
                    w.items(1231, 0);
                }).to.throw();
            });
        });
        describe('#items.push()', function() {
            it('should append an item', function() {
                w.items.push(4);
                expect(w.items()).to.deep.equal([1,2,3,4]);
            });
            it('should fire an insert event', function() {
                w.items.onInsert(function(data) {
                    expect(data).to.have.a.property('index', 3);
                    expect(data).to.have.a.property('value', 4);
                });
                w.items.push(4);
            });
            it('should fire a change event once', function(done) {
                w.items.onChange(function(data) {
                    done();
                });
                w.items.push(4);
                w.items.push(5);
            });
        });
        describe('#count()', function() {
            it('should return the length of the list', function() {
                expect(w.items.count()).to.equal(3);
            });
        });
        describe('#insert(index, value)', function() {
            it('should insert an item', function() {
                w.items.insert(0, 10);
                expect(w.items()).to.deep.equal([10,1,2,3]);
            });
            it('should append an item if index is to big', function() {
                w.items.insert(1000, 10);
                expect(w.items()).to.deep.equal([1,2,3, 10]);
            });
            it('should fire an insert event', function() {
                w.items.onInsert(function(data) {
                    expect(data).to.have.a.property('index', 1);
                    expect(data).to.have.a.property('value', 4);
                });
                w.items.insert(1, 4);
            });
            it('should fire a change event once', function(done) {
                w.items.onChange(function(data) {
                    done();
                });
                w.items.insert(1,4);
                w.items.insert(1,5);
            });
        });
        describe('#remove(index)', function() {
            it('should remove an item', function() {
                w.items.remove(0);
                expect(w.items()).to.deep.equal([2,3]);
            });
            it('should do nothing if index is too big', function() {
                w.items.remove(1000);
                expect(w.items()).to.deep.equal([1,2,3]);
            });
            it('should fire an remove event', function() {
                w.items.onRemove(function(data) {
                    expect(data).to.have.a.property('index', 1);
                    expect(data).to.have.a.property('value', 2);
                });
                w.items.remove(1);
            });
            it('should fire a change event once', function(done) {
                w.items.onChange(function(data) {
                    done();
                });
                w.items.remove(1);
                w.items.remove(1);
            });
        });
        describe('#first()', function() {
            it('should return the first item', function() {
                expect(w.items.first()).to.equal(1);
            });
        });
        describe('#last()', function() {
            it('should return the last item', function() {
                expect(w.items.last()).to.equal(3);
            });
        });
        describe('#pop()', function() {
            it('should return the last item', function() {
                expect(w.items.pop()).to.equal(3);
            });
            it('should remove the last item', function() {
                w.items.pop();
                expect(w.items()).to.deep.equal([1,2]);
            });
            it('should fire an remove event', function() {
                w.items.onRemove(function(data) {
                    expect(data).to.have.a.property('index', 2);
                    expect(data).to.have.a.property('value', 3);
                });
                w.items.pop();
            });
            it('should fire a change event once', function(done) {
                w.items.onChange(function(data) {
                    done();
                });
                w.items.pop();
                w.items.pop();
            });
        });
        describe('#shift()', function() {
            it('should return the first item', function() {
                expect(w.items.shift()).to.equal(1);
            });
            it('should remove the first item', function() {
                w.items.shift();
                expect(w.items()).to.deep.equal([2,3]);
            });
            it('should fire an remove event', function() {
                w.items.onRemove(function(data) {
                    expect(data).to.have.a.property('index', 0);
                    expect(data).to.have.a.property('value', 1);
                });
                w.items.shift();
            });
            it('should fire a change event once', function(done) {
                w.items.onChange(function(data) {
                    done();
                });
                w.items.shift();
                w.items.shift();
            });
        });
        describe('#concat(list)', function() {
            it('should append the items at end', function() {
                w.items.concat([4,5,6]);
                expect(w.items()).to.deep.equal([1,2,3,4,5,6]);
            });
            it('should do nothing if no list', function() {
                w.items.concat();
                expect(w.items()).to.deep.equal([1,2,3]);
            });
            it('should fire an insert event', function() {
                var spy = sinon.spy();
                w.items.onInsert(spy);
                w.items.concat([4, 5]);
                expect(spy).to.have.been.calledTwice;
            });
            it('should fire a change event once', function(done) {
                w.items.onChange(function(data) {
                    done();
                });
                w.items.concat([1,4]);
            });
        });
        describe('#removeAll()', function() {
            it('should empty the list', function() {
                w.items.removeAll();
                expect(w.items.count()).to.equal(0);
            });
        });
        describe('#move(from, to)', function() {
            it('should move an item', function() {
                w.items.move(0,1);
                expect(w.items()).to.deep.equal([2,1,3]);
            });
            it('should move an item at end if to is too big', function() {
                w.items.move(0,1000);
                expect(w.items()).to.deep.equal([2,3,1]);
            });
            it('should do nothing if from is too big', function() {
                w.items.move(100, 0);
                expect(w.items()).to.deep.equal([1,2,3]);
            });
            it('should fire an move event', function() {
                w.items.onMove(function(data) {
                    expect(data).to.have.a.property('from', 1);
                    expect(data).to.have.a.property('to', 0);
                });
                w.items.move(1, 0);
            });
            it('should fire an remove event', function() {
                w.items.onRemove(function(data) {
                    expect(data).to.have.a.property('index', 1);
                    expect(data).to.have.a.property('value', 2);
                });
                w.items.move(1, 0);
            });
            it('should fire an insert event', function() {
                w.items.onInsert(function(data) {
                    expect(data).to.have.a.property('index', 0);
                    expect(data).to.have.a.property('value', 2);
                });
                w.items.move(1, 0);
            });
            it('should fire a change event once', function(done) {
                w.items.onChange(function(data) {
                    done();
                });
                w.items.move(1,4);
            });
            it('should not fire insert and remove when onMove is set', function() {
                var spy = sinon.spy();
                var W  = Widget.create('W', { items: Widget.property({ type: 'list', onMove: undefined }) });
                upgradeWidget(W);
                var w = new W({ items: '[1,2,3]' });
                w.items.onInsert(spy);
                w.items.onRemove(spy);
                w.items.move(1,2);
                expect(spy).to.have.not.been.called;
            });
        });
    });
}
moduleDescribe('waf-behavior/properties-list', function() {
    testBehaviorPropertiesList(function() {});
});


