var expect = chai.expect;
chai.Assertion.addProperty('called', function() {
    var j = jasmine.getEnv().currentSpec.expect(this._obj);
    if(this.__flags.negate) j = j.not;
    j.toHaveBeenCalled();
    return this;
});

chai.Assertion.addProperty('once', function() {
    this.assert(
        this._obj.calls.length == 1
      , 'expected #{this} to have been called once'
      , 'expected #{this} to not have been called once'
    );
    return this;
});

chai.Assertion.addMethod('exactly', function(n) {
    this.assert(
        this._obj.calls.length == n
      , 'expected #{this} to have been called ' + n + ' times'
      , 'expected #{this} to not have been called ' + n + ' times'
    );
    return this;
});

chai.Assertion.addMethod('withArguments', function() {
    var j = jasmine.getEnv().currentSpec.expect(this._obj);
    if(this.__flags.negate) j = j.not;
    j.toHaveBeenCalledWith.apply(j, arguments);
    return this;
});



WAF.require('waf-behavior/position');
var Widget   = WAF.require('waf-core/widget'),
    Behavior = WAF.require('waf-core/behavior'),
    Event    = WAF.require('waf-core/event'),
    WakError = WAF.require('waf-core/error'),
    Class    = WAF.require('waf-core/class');


describe('Behavior.Layout.Container', function() {
    Widget.create('ContTest');
    Widget.ContTest.inherit(WAF.require('waf-behavior/layout/container'));

    describe('#detachWidget(index)', function() {
        var c, w1, w2, w3, w4;
        beforeEach(function() {
            c = new Widget.ContTest();
            w1 = new Widget.BaseWidget();
            w2 = new Widget.BaseWidget();
            w3 = new Widget.BaseWidget();
            w4 = new Widget.BaseWidget();
            c.insertWidget(0, w1);
            c.insertWidget(1, w2);
            c.insertWidget(2, w3);
        });
        it('should remove the widget by position', function() {
            c.detachWidget(0);
            expect(c.children()).to.not.contain(w1);
            expect(c.indexOfWidget(w2)).to.equal(0);
        });
        it('should remove the widget', function() {
            c.detachWidget(w2);
            expect(c.children()).to.not.contain(w2);
            expect(c.indexOfWidget(w3)).to.equal(1);
        });
        it('should call detach on the widget', function() {
            spyOn(w1, 'detach').andCallThrough();
            c.detachWidget(0);
            expect(w1.detach).to.have.been.called;
            expect(w1).to.not.have.property('parent_widget');
        });
        it('should fire a DetachWidget event', function(done) {
            var called = false;
            c.subscribe(Event.DetachWidget, function(event) {
                called = true;
                expect(event.data).to.have.property('widget', w1);
                expect(event.data).to.have.property('index', 0);
            });
            c.insertWidget(0, w1);
            expect(called).to.be.true;
        });
        it('should remove the dom node', function() {
            c.detachWidget(0);
            expect(w1.node.parentNode).to.be.null;
            expect($(c.node).children().toArray()).to.not.contain(w1.node);
        });
    });
    describe('#indexOfWidget(widget)', function() {

    });
    describe('#insertWidget(index, widget)', function() {
        var c, w1, w2, w3, w4;
        beforeEach(function() {
            c = new Widget.ContTest();
            w1 = new Widget.BaseWidget();
            w2 = new Widget.BaseWidget();
            w3 = new Widget.BaseWidget();
            w4 = new Widget.BaseWidget();
        });
        it('should insert the widget', function() {
            c.insertWidget(0, w1);
            expect(c.children()).to.contain(w1);
            c.insertWidget(0, w2);
            expect(c.children()).to.contain(w2);
            expect(c.indexOfWidget(w2)).to.equal(0);
            expect(c.indexOfWidget(w1)).to.equal(1);
            expect(c.indexOfWidget(w3)).to.equal(-1);
        });
        it('should insert the widget at end', function() {
            c.insertWidget(123, w1);
            expect(c.indexOfWidget(w1)).to.equal(0);
        });
        it('should return the index of the widget', function() {
            expect(c.insertWidget(0, w1)).to.equal(0);
            expect(c.insertWidget(123, w2)).to.equal(1);
        });
        it('should call attach on the inserted widget', function() {
            spyOn(w1, 'attach').andCallThrough();
            c.insertWidget(123, w1);
            expect(w1.attach).to.have.been.called;
            expect(w1.parent_widget).to.equal(c);
        });
        it('should fire a InsertWidget event', function(done) {
            var called = false;
            c.subscribe(Event.InsertWidget, function(event) {
                called = true;
                expect(event.data).to.have.property('widget', w1);
                expect(event.data).to.have.property('index', 0);
            });
            c.insertWidget(0, w1);
            expect(called).to.be.true;
        });
        it('should append the dom node', function() {
            c.insertWidget(123, w1);
            expect(w1.node.parentNode).to.equal(c.node);
            expect($(c.node).children().toArray()).to.contain(w1.node);
        });
    });
    describe('#countWidgets()', function() {
        it('should return the number of widgets', function() {
            var c = new Widget.ContTest();
            c.attachWidget(new Widget.BaseWidget());
            c.attachWidget(new Widget.BaseWidget());
            c.attachWidget(new Widget.BaseWidget());
            c.attachWidget(new Widget.BaseWidget());
            expect(c.countWidgets()).to.equal(4);
        });
    });
    describe('#widgets()', function() {
        it('should return the list of widget in the right order', function() {
            var c = new Widget.ContTest();
            var w = [new Widget.BaseWidget(), new Widget.BaseWidget(), new Widget.BaseWidget(), new Widget.BaseWidget()];
            w.forEach(c.attachWidget.bind(c));
            var w2 = c.widgets();
            w2.forEach(function(_w, i) { expect(_w).to.equal(w[i]); });
        });
    });
    describe('#attachWidget(widget)', function() {
        it('should call insertWidget', function() {
            var c = new Widget.ContTest();
            var w = new Widget.BaseWidget();
            spyOn(c, 'insertWidget').andCallThrough();
            c.attachWidget(w);
            expect(c.insertWidget).to.have.been.called.withArguments(c.countWidgets() - 1, w);
        });
    });
    describe('#widget(index)', function() {
        it('should return the widget at the index', function() {
            var c = new Widget.ContTest();
            c.attachWidget(new Widget.BaseWidget());
            c.attachWidget(new Widget.BaseWidget());
            var w1 = new Widget.BaseWidget();
            c.insertWidget(1, w1);
            expect(c.widget(1)).to.equal(w1);
            expect(c.widget(0)).to.be.instanceOf(Widget.BaseWidget).to.not.equal(w1);
            expect(c.widget(2)).to.be.instanceOf(Widget.BaseWidget).to.not.equal(w1);
            expect(c.widget(-1)).to.be.undefined;
            expect(c.widget(3)).to.be.undefined;
        });
    });
    describe('#widget(index, widget)', function() {
        var c, w1, w2, w3;
        beforeEach(function() {
            c = new Widget.ContTest();
            w1 = new Widget.BaseWidget();
            w2 = new Widget.BaseWidget();
            c.attachWidget(new Widget.BaseWidget());
            c.attachWidget(w1);
            c.attachWidget(new Widget.BaseWidget());
            spyOn(c, 'detachWidget').andCallThrough();
            spyOn(c, 'insertWidget').andCallThrough();
            w3 = c.widget(1, w2);
        });
        it('should detach the previous widget at the index', function() {
            expect(c.detachWidget).to.have.been.called.withArguments(1);
        });
        it('should set the widget at the index', function() {
            expect(c.insertWidget).to.have.been.called.withArguments(1, w2);
        });
        it('should return the widget at the index', function() {
            expect(w3).to.equal(w2);
        });
        it('should add widget at end', function() {
            var w4 = new Widget.BaseWidget();
            c.widget(123, w4);
            expect(c.indexOfWidget(w4)).to.equal(3);
        });
    });
    describe('#detachAllWidgets()', function() {
        var c, w1, w2, w3;
        beforeEach(function() {
            c = new Widget.ContTest();
            w1 = new Widget.BaseWidget();
            w2 = new Widget.BaseWidget();
            w3 = new Widget.BaseWidget();
            c.attachWidget(w1);
            c.attachWidget(w2);
            c.attachWidget(w3);
            spyOn(c, 'detachWidget').andCallThrough();
            c.detachAllWidgets();
        });
        it('should call detachWidget for all widgets', function() {
            expect(c.detachWidget).to.have.been.called.exactly(3);
        });
        it('should removed all widgets', function() {
            expect(c.countWidgets()).to.equal(0);
        });
    });
    describe('#lastWidget()', function() {
        var c, w1, w2, w3;
        beforeEach(function() {
            c = new Widget.ContTest();
            w1 = new Widget.BaseWidget();
            w2 = new Widget.BaseWidget();
            w3 = new Widget.BaseWidget();
        });
        it('should throw an error when no widget', function() {
            expect(function() { c.lastWidget() }).to.throw(WakError.Container);
        });
        it('should return the last widget', function() {
            c.attachWidget(w1);
            expect(c.lastWidget()).to.equal(w1);
        });
        it('should return the last widget after detaching another widget', function() {
            c.attachWidget(w1);
            c.insertWidget(0, w2);
            c.detachWidget(1);
            expect(c.lastWidget()).to.equal(w2);
        });
        it('should return thow an error if last widget was removed', function() {
            c.attachWidget(w1);
            c.insertWidget(0, w2);
            c.detachWidget(0);
            expect(function() { c.lastWidget() }).to.throw(new WakError.Container);
        });
    });
    describe('#children()', function() {
        it('should return the list of widget in the right order', function() {
            var c = new Widget.ContTest();
            var w = [new Widget.BaseWidget(), new Widget.BaseWidget(), new Widget.BaseWidget(), new Widget.BaseWidget()];
            w.forEach(c.attachWidget.bind(c));
            var w2 = c.widgets();
            w2.forEach(function(_w, i) { expect(_w).to.equal(w[i]); });
        });
    });
    describe('#invoke(funcname)', function() {
        var c, w1, w2, w3, r;
        beforeEach(function() {
            c = new Widget.ContTest();
            Widget.create('WInvoke');
            Widget.WInvoke.prototype.spy = function() {};
            w1 = new Widget.WInvoke();
            w2 = new Widget.WInvoke();
            w3 = new Widget.WInvoke();
            spyOn(w1, 'spy').andReturn(1);
            spyOn(w2, 'spy').andReturn(2);
            spyOn(w3, 'spy').andReturn(3);
            c.attachWidget(w1);
            c.attachWidget(w2);
            c.attachWidget(w3);
            r = c.invoke('spy', 'plop');
        });
        it('should call the method on all widgets', function() {
            expect(w1.spy).to.have.been.called.withArguments('plop');
            expect(w2.spy).to.have.been.called.withArguments('plop');
            expect(w3.spy).to.have.been.called.withArguments('plop');
        });
        it('should return the results of all methods', function() {
            expect(r).to.be.an('array').to.have.length(3).to.contain(1).to.contain(2).to.contain(3);
        });
    });
    describe('#cloneBehavior(master)', function() {

    });
    describe('#initChildrenFromDom(widget)', function() {

    });
    describe('#restrictWidget(widget)', function() {
        var c, w1, w2, w3;
        beforeEach(function() {
            Widget.create('ContTestRestrict2', Widget.ContTest);
            Widget.create('Restrict1');
            Widget.create('Restrict2');
            Widget.create('Restrict3', Widget.Restrict1);
            c = new Widget.ContTestRestrict2();
            w1 = new Widget.Restrict1();
            w2 = new Widget.Restrict2();
            w3 = new Widget.Restrict3();
        });
        it('should return BaseWidget when no restrict', function() {
            expect(c.restrictWidget()).to.equal(Widget.BaseWidget);
        });
        it('should set a new restrict widget class', function() {
            c.restrictWidget(Widget.Restrict1);
            expect(c.restrictWidget()).to.equal(Widget.Restrict1);
        });
        it('should restrict widget at runtime', function() {
            c.restrictWidget(Widget.Restrict1);
            expect(function() { c.attachWidget(w1); }).not.to.throw(new WakError.Container);
            expect(function() { c.attachWidget(w2); }).to.throw(new WakError.Container);
            expect(function() { c.attachWidget(w3); }).not.to.throw(new WakError.Container);
        });

    });
    describe('.restrictWidget(widget)', function() {
        var w1, w2, w3;
        beforeEach(function() {
            Widget.create('ContTestRestrict', Widget.ContTest);
            Widget.create('Restrict1');
            Widget.create('Restrict2');
            Widget.create('Restrict3', Widget.Restrict1);
            w1 = new Widget.Restrict1();
            w2 = new Widget.Restrict2();
            w3 = new Widget.Restrict3();
        });
        it('should return undef when no restrict', function() {
            expect(Widget.ContTestRestrict.restrictWidget()).to.be.undefined;
        });
        it('should set a new restrict widget class', function() {
            Widget.ContTestRestrict.restrictWidget(Widget.Restrict1);
            expect(Widget.ContTestRestrict.restrictWidget()).to.equal(Widget.Restrict1);
        });
        it('should set the restrict widget at runtime', function() {
            Widget.ContTestRestrict.restrictWidget(Widget.Restrict1);
            var c = new Widget.ContTestRestrict();
            expect(c.restrictWidget()).to.equal(Widget.Restrict1);
        });
        it('should restrict widget at runtime', function() {
            Widget.ContTestRestrict.restrictWidget(Widget.Restrict1);
            var c = new Widget.ContTestRestrict();
            expect(function() { c.attachWidget(w1); }).not.to.throw(new WakError.Container);
            expect(function() { c.attachWidget(w2); }).to.throw(new WakError.Container);
            expect(function() { c.attachWidget(w3); }).not.to.throw(new WakError.Container);
        });
    });
    describe('.addIndexedMethods(behavior, prefix, suffix)', function() {
        var c, w1, w2;
        beforeEach(function() {
            Widget.create('ContTestIM', Widget.ContTest);
            var spy = Behavior.create('Spy');
            spy.prototype.spy = function(a) { return a; };
            spy.prototype.spy2 = function(a) { return this; };
            Widget.create('WithSpyBehavior');
            Widget.WithSpyBehavior.inherit(spy);
            w1 = new Widget.WithSpyBehavior();
            w2 = new Widget.BaseWidget();
            Widget.ContTestIM.addIndexedMethods(spy);
            Widget.ContTestIM.addIndexedMethods(spy, 'prefix');
            Widget.ContTestIM.addIndexedMethods(spy, '', 'Suffix');
            Widget.ContTestIM.addIndexedMethods(spy, 'prefix', 'Suffix');
            c = new Widget.ContTestIM();
            c.attachWidget(w1);
            c.attachWidget(w2);
        });
        it('should create functions on prototype', function() {
            expect(Widget.ContTestIM.prototype).to.have.property('indexedSpy').to.be.a('function');
            expect(Widget.ContTestIM.prototype).to.have.property('indexedSpy2').to.be.a('function');
        });
        it('should create functions on prototype with prefix', function() {
            expect(Widget.ContTestIM.prototype).to.have.property('prefixSpy').to.be.a('function');
            expect(Widget.ContTestIM.prototype).to.have.property('prefixSpy2').to.be.a('function');
        });
        it('should create functions on prototype with suffix', function() {
            expect(Widget.ContTestIM.prototype).to.have.property('spySuffix').to.be.a('function');
            expect(Widget.ContTestIM.prototype).to.have.property('spy2Suffix').to.be.a('function');
        });
        it('should create functions on prototype with prefix and suffix', function() {
            expect(Widget.ContTestIM.prototype).to.have.property('prefixSpySuffix').to.be.a('function');
            expect(Widget.ContTestIM.prototype).to.have.property('prefixSpy2Suffix').to.be.a('function');
        });
        it('should call the method on the child widget', function() {
            expect(c.indexedSpy(0, 123)).to.equal(123);
            expect(c.indexedSpy2(0)).to.equal(w1);

            expect(c.prefixSpy(0, 123)).to.equal(123);
            expect(c.prefixSpy2(0)).to.equal(w1);

            expect(c.spySuffix(0, 123)).to.equal(123);
            expect(c.spy2Suffix(0)).to.equal(w1);

            expect(c.prefixSpySuffix(0, 123)).to.equal(123);
            expect(c.prefixSpy2Suffix(0)).to.equal(w1);
        });
        it('should throw an error if no method on the child widget', function() {
            expect(function() { c.indexedSpy(1, 132); }).to.throw(new WakError.Container);
        });
        it('should throw an error if no child widget', function() {
            expect(function() { c.indexedSpy(2, 132); }).to.throw(new WakError.Container);
        });
    });
    describe('.addIndexedMethods(behavior, prefix, suffix, default_index)', function() {
        var c, w1, w2, a;
        beforeEach(function() {
            Widget.create('ContTestIM', Widget.ContTest);
            var spy = Behavior.create('Spy');
            spy.prototype.spy = function(a) { return a; };
            spy.prototype.spy2 = function(a) { return this; };
            Widget.create('WithSpyBehavior');
            Widget.WithSpyBehavior.inherit(spy);
            w1 = new Widget.WithSpyBehavior();
            w2 = new Widget.BaseWidget();
            Widget.ContTestIM.addIndexedMethods(spy, 0);
            Widget.ContTestIM.addIndexedMethods(spy, 'prefix', function() { return a; });
            Widget.ContTestIM.addIndexedMethods(spy, '', 'Suffix', function() { return a; });
            Widget.ContTestIM.addIndexedMethods(spy, 'prefix', 'Suffix', 1);
            c = new Widget.ContTestIM();
            c.attachWidget(w1);
            c.attachWidget(w2);
        });
        it('should create functions on prototype', function() {
            expect(Widget.ContTestIM.prototype).to.have.property('indexedSpy').to.be.a('function');
            expect(Widget.ContTestIM.prototype).to.have.property('indexedSpy2').to.be.a('function');
        });
        it('should create functions on prototype with prefix', function() {
            expect(Widget.ContTestIM.prototype).to.have.property('prefixSpy').to.be.a('function');
            expect(Widget.ContTestIM.prototype).to.have.property('prefixSpy2').to.be.a('function');
        });
        it('should create functions on prototype with suffix', function() {
            expect(Widget.ContTestIM.prototype).to.have.property('spySuffix').to.be.a('function');
            expect(Widget.ContTestIM.prototype).to.have.property('spy2Suffix').to.be.a('function');
        });
        it('should create functions on prototype with prefix and suffix', function() {
            expect(Widget.ContTestIM.prototype).to.have.property('prefixSpySuffix').to.be.a('function');
            expect(Widget.ContTestIM.prototype).to.have.property('prefixSpy2Suffix').to.be.a('function');
        });
        it('should call the method on the child widget', function() {
            a = 0;
         //   expect(c.indexedSpy(123)).to.equal(123);
         //   expect(c.indexedSpy2()).to.equal(w1);

            expect(c.prefixSpy(123)).to.equal(123);
            expect(c.prefixSpy2()).to.equal(w1);

            expect(c.spySuffix(123)).to.equal(123);
            expect(c.spy2Suffix()).to.equal(w1);

        });
        it('should throw an error if no method on the child widget', function() {
            a = 1;
            expect(function() { c.prefixSpy(132); }).to.throw(new WakError.Container);
            expect(function() { c.prefixSpySuffix(123); }).to.throw(new WakError.Container);
            expect(function() { c.prefixSpy2Suffix(); }).to.throw(new WakError.Container);
        });
        it('should throw an error if no child widget', function() {
            a = 2
            expect(function() { c.prefixSpy(132); }).to.throw(new WakError.Container);
        });
    });
    describe('.addIndexedEvent(event, new_event)', function() {
        var c, w1, w2, spy;
        Widget.create('ContTestIE', Widget.ContTest);
        Widget.create('Obs');
        Event.create('ContTest1');
        Event.create('ContTest2');
        Event.create('ContTest3');
        Event.create('ContTest4');
        Event.create('ContTest5', Event.ContTest4);
        Widget.ContTestIE.addIndexedEvent(Event.ContTest1);
        Widget.ContTestIE.addIndexedEvent(Event.ContTest2, Event.ContTest3);
        Widget.ContTestIE.addIndexedEvent(Event.ContTest4);
        beforeEach(function() {
            c = new Widget.ContTestIE();
            w1 = new Widget.Obs();
            w2 = new Widget.Obs();
            spy = {
                a: function() {},
                b: function() {}
            };
        });
        it('should refire the event of the widget', function(done) {
            spy.a = function(event) {
                expect(event.data).to.have.property('index', 0);
                expect(event.data).to.have.property('widget', w1);
            };
            spyOn(spy, 'a').andCallThrough();
            spyOn(spy, 'b');
            c.subscribe(Event.ContTest1, spy.a);
            c.subscribe(Event.ContTest2, spy.b);
            c.attachWidget(w1);
            w1.fire(new Event.ContTest1());
            w2.fire(new Event.ContTest1());
            w1.fire(new Event.ContTest2());
            expect(spy.a).to.have.been.called.once;
            expect(spy.b).to.not.have.been.called;
        });
        it('should fire a new event of the widget', function(done) {
            spy.a = function(event) {
                expect(event.data).to.have.property('index', 0);
                expect(event.data).to.have.property('widget', w1);
                expect(Class.instanceOf(event.parent_event, Event.ContTest2)).to.be.true;
            };
            spyOn(spy, 'a').andCallThrough();
            spyOn(spy, 'b');
            c.attachWidget(w1);
            c.subscribe(Event.ContTest3, spy.a);
            c.subscribe(Event.ContTest2, spy.b);
            w1.fire(new Event.ContTest2());
            w2.fire(new Event.ContTest2());
            w1.fire(new Event.ContTest3());
            expect(spy.a).to.have.been.called.once;
            expect(spy.b).to.not.have.been.called;
        });
        it('should fire inherited events', function(done) {
            spy.a = function(event) {
                expect(event.data).to.have.property('index', 0);
                expect(event.data).to.have.property('widget', w1);
            };
            spyOn(spy, 'a').andCallThrough();
            spyOn(spy, 'b');
            c.subscribe(Event.ContTest4, spy.a);
            c.subscribe(Event.ContTest5, spy.b);
            c.attachWidget(w1);
            w1.fire(new Event.ContTest4());
            w2.fire(new Event.ContTest4());
            w1.fire(new Event.ContTest5());
            expect(spy.a).to.have.been.called.exactly(2);
            expect(spy.b).to.not.have.been.called;
        });
        it('should unsubscribe event on detach', function() {
        });
    });
});
