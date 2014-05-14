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
    WakError = WAF.require('waf-core/error');


describe('Behavior.Layout.Container', function() {
    describe('#detachWidget(index)', function() {
        var c, w1, w2, w3, w4;
        beforeEach(function() {
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            c = new ContTest();
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
            expect(w1).to.not.have.property('parentWidget');
        });
        it('should fire a DetachWidget event', function(done) {
            c.subscribe('detachWidget', function(event) {
                expect(event.data).to.have.property('widget', w1);
                expect(event.data).to.have.property('index', 0);
                done();
            });
            c.insertWidget(0, w1);
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
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            c = new ContTest();
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
            expect(w1.parentWidget).to.equal(c);
        });
        it('should fire a InsertWidget event', function(done) {
            c.subscribe('insertWidget', function(event) {
                expect(event.data).to.have.property('widget', w1);
                expect(event.data).to.have.property('index', 0);
                done();
            });
            c.insertWidget(0, w1);
        });
        it('should append the dom node', function() {
            c.insertWidget(123, w1);
            expect(w1.node.parentNode).to.equal(c.node);
            expect($(c.node).children().toArray()).to.contain(w1.node);
        });
    });
    describe('#countWidgets()', function() {
        it('should return the number of widgets', function() {
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            var c = new ContTest();
            c.attachWidget(new Widget.BaseWidget());
            c.attachWidget(new Widget.BaseWidget());
            c.attachWidget(new Widget.BaseWidget());
            c.attachWidget(new Widget.BaseWidget());
            expect(c.countWidgets()).to.equal(4);
        });
    });
    describe('#widgets()', function() {
        it('should return the list of widget in the right order', function() {
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            var c = new ContTest();
            var w = [new Widget.BaseWidget(), new Widget.BaseWidget(), new Widget.BaseWidget(), new Widget.BaseWidget()];
            w.forEach(c.attachWidget.bind(c));
            var w2 = c.widgets();
            w2.forEach(function(_w, i) { expect(_w).to.equal(w[i]); });
        });
    });
    describe('#attachWidget(widget)', function() {
        it('should call insertWidget', function() {
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            var c = new ContTest();
            var w = new Widget.BaseWidget();
            spyOn(c, 'insertWidget').andCallThrough();
            c.attachWidget(w);
            expect(c.insertWidget).to.have.been.called.withArguments(c.countWidgets() - 1, w);
        });
    });
    describe('#widget(index)', function() {
        it('should return the widget at the index', function() {
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            var c = new ContTest();
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
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            c = new ContTest();
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
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            c = new ContTest();
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
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            c = new ContTest();
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
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            var c = new ContTest();
            var w = [new Widget.BaseWidget(), new Widget.BaseWidget(), new Widget.BaseWidget(), new Widget.BaseWidget()];
            w.forEach(c.attachWidget.bind(c));
            var w2 = c.widgets();
            w2.forEach(function(_w, i) { expect(_w).to.equal(w[i]); });
        });
    });
    describe('#invoke(funcname)', function() {
        var c, w1, w2, w3, r;
        beforeEach(function() {
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            c = new ContTest();
            var WInvoke = Widget.create('WInvoke');
            WInvoke.prototype.spy = function() {};
            w1 = new WInvoke();
            w2 = new WInvoke();
            w3 = new WInvoke();
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
        var c, w1, w2, w3, ContTestRestrict, Restrict1, Restrict2, Restrict3;
        beforeEach(function() {
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            ContTestRestrict2 = Widget.create('ContTestRestrict2', ContTest);
            Restrict1 = Widget.create('Restrict1');
            Restrict2 = Widget.create('Restrict2');
            Restrict3 = Widget.create('Restrict3', Restrict1);
            c = new ContTestRestrict2();
            w1 = new Restrict1();
            w2 = new Restrict2();
            w3 = new Restrict3();
        });
        it('should return Widget.BaseWidget when no restrict', function() {
            expect(c.restrictWidget()).to.equal(Widget.BaseWidget);
        });
        it('should set a new restrict widget class', function() {
            c.restrictWidget(Restrict1);
            expect(c.restrictWidget()).to.equal(Restrict1);
        });
        it('should restrict widget at runtime', function() {
            c.restrictWidget(Restrict1);
            expect(function() { c.attachWidget(w1); }).not.to.throw(new WakError.Container);
            expect(function() { c.attachWidget(w2); }).to.throw(new WakError.Container);
            expect(function() { c.attachWidget(w3); }).not.to.throw(new WakError.Container);
        });

    });
    describe('.restrictWidget(widget)', function() {
        var w1, w2, w3, ContTestRestrict, Restrict1, Restrict2, Restrict3;
        beforeEach(function() {
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            ContTestRestrict = Widget.create('ContTestRestrict', ContTest);
            Restrict1 = Widget.create('Restrict1');
            Restrict2 = Widget.create('Restrict2');
            Restrict3 = Widget.create('Restrict3', Restrict1);
            w1 = new Restrict1();
            w2 = new Restrict2();
            w3 = new Restrict3();
        });
        it('should return undef when no restrict', function() {
            expect(ContTestRestrict.restrictWidget()).to.be.undefined;
        });
        it('should set a new restrict widget class', function() {
            ContTestRestrict.restrictWidget(Restrict1);
            expect(ContTestRestrict.restrictWidget()).to.equal(Restrict1);
        });
        it('should set the restrict widget at runtime', function() {
            ContTestRestrict.restrictWidget(Restrict1);
            var c = new ContTestRestrict();
            expect(c.restrictWidget()).to.equal(Restrict1);
        });
        it('should restrict widget at runtime', function() {
            ContTestRestrict.restrictWidget(Restrict1);
            var c = new ContTestRestrict();
            expect(function() { c.attachWidget(w1); }).not.to.throw(new WakError.Container);
            expect(function() { c.attachWidget(w2); }).to.throw(new WakError.Container);
            expect(function() { c.attachWidget(w3); }).not.to.throw(new WakError.Container);
        });
    });
    describe('.addIndexedMethods(behavior, prefix, suffix)', function() {
        var c, w1, w2, ContTestIM;
        beforeEach(function() {
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            ContTestIM = Widget.create('ContTestIM', ContTest);
            var spy = Behavior.create('Spy');
            spy.prototype.spy = function(a) { return a; };
            spy.prototype.spy2 = function(a) { return this; };
            var WithSpyBehavior = Widget.create('WithSpyBehavior');
            WithSpyBehavior.inherit(spy);
            w1 = new WithSpyBehavior();
            w2 = new Widget.BaseWidget();
            ContTestIM.addIndexedMethods(spy);
            ContTestIM.addIndexedMethods(spy, 'prefix');
            ContTestIM.addIndexedMethods(spy, '', 'Suffix');
            ContTestIM.addIndexedMethods(spy, 'prefix', 'Suffix');
            c = new ContTestIM();
            c.attachWidget(w1);
            c.attachWidget(w2);
        });
        it('should create functions on prototype', function() {
            expect(ContTestIM.prototype).to.have.property('indexedSpy').to.be.a('function');
            expect(ContTestIM.prototype).to.have.property('indexedSpy2').to.be.a('function');
        });
        it('should create functions on prototype with prefix', function() {
            expect(ContTestIM.prototype).to.have.property('prefixSpy').to.be.a('function');
            expect(ContTestIM.prototype).to.have.property('prefixSpy2').to.be.a('function');
        });
        it('should create functions on prototype with suffix', function() {
            expect(ContTestIM.prototype).to.have.property('spySuffix').to.be.a('function');
            expect(ContTestIM.prototype).to.have.property('spy2Suffix').to.be.a('function');
        });
        it('should create functions on prototype with prefix and suffix', function() {
            expect(ContTestIM.prototype).to.have.property('prefixSpySuffix').to.be.a('function');
            expect(ContTestIM.prototype).to.have.property('prefixSpy2Suffix').to.be.a('function');
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
        var c, w1, w2, a, ContTestIM;
        beforeEach(function() {
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            ContTestIM = Widget.create('ContTestIM', ContTest);
            var spy = Behavior.create('Spy');
            spy.prototype.spy = function(a) { return a; };
            spy.prototype.spy2 = function(a) { return this; };
            var WithSpyBehavior = Widget.create('WithSpyBehavior');
            WithSpyBehavior.inherit(spy);
            w1 = new WithSpyBehavior();
            w2 = new Widget.BaseWidget();
            ContTestIM.addIndexedMethods(spy, 0);
            ContTestIM.addIndexedMethods(spy, 'prefix', function() { return a; });
            ContTestIM.addIndexedMethods(spy, '', 'Suffix', function() { return a; });
            ContTestIM.addIndexedMethods(spy, 'prefix', 'Suffix', 1);
            c = new ContTestIM();
            c.attachWidget(w1);
            c.attachWidget(w2);
        });
        it('should create functions on prototype', function() {
            expect(ContTestIM.prototype).to.have.property('indexedSpy').to.be.a('function');
            expect(ContTestIM.prototype).to.have.property('indexedSpy2').to.be.a('function');
        });
        it('should create functions on prototype with prefix', function() {
            expect(ContTestIM.prototype).to.have.property('prefixSpy').to.be.a('function');
            expect(ContTestIM.prototype).to.have.property('prefixSpy2').to.be.a('function');
        });
        it('should create functions on prototype with suffix', function() {
            expect(ContTestIM.prototype).to.have.property('spySuffix').to.be.a('function');
            expect(ContTestIM.prototype).to.have.property('spy2Suffix').to.be.a('function');
        });
        it('should create functions on prototype with prefix and suffix', function() {
            expect(ContTestIM.prototype).to.have.property('prefixSpySuffix').to.be.a('function');
            expect(ContTestIM.prototype).to.have.property('prefixSpy2Suffix').to.be.a('function');
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
        beforeEach(function() {
            var ContTest = Widget.create('ContTest');
            ContTest.inherit(WAF.require('waf-behavior/layout/container'));
            var ContTestIE = Widget.create('ContTestIE', ContTest);
            var Obs = Widget.create('Obs');
            ContTestIE.addIndexedEvent('contTest1');
            ContTestIE.addIndexedEvent('contTest2', 'contTest3');
            ContTestIE.addIndexedEvent(['contTest4', 'contTest5']);
            c = new ContTestIE();
            w1 = new Obs();
            w2 = new Obs();
            spy = {
                a: function() {},
                b: function() {}
            };
        });
        it('should refire the event of the widget', function(done) {
            spy.a = function(event) {
                expect(event.data).to.have.property('index', 0);
                expect(event.data).to.have.property('widget', w1);
                done();
            };
            c.subscribe('contTest1', spy.a);
            c.subscribe('contTest2', spy.b);
            c.attachWidget(w1);
            w1.fire('contTest1');
            w2.fire('contTest1');
            w1.fire('contTest2');
            //expect(spy.b).to.not.have.been.called;
        });
        it('should fire a new event of the widget', function(done) {
            spy.a = function(event) {
                expect(event.data).to.have.property('index', 0);
                expect(event.data).to.have.property('widget', w1);
                expect(event).to.have.property('parentEvent', 'contTest2');
                done();
            };
            c.attachWidget(w1);
            c.subscribe('contTest3', spy.a);
            c.subscribe('contTest2', spy.b);
            w1.fire('contTest2');
            w2.fire('contTest2');
            w1.fire('contTest3');
            //expect(spy.b).to.not.have.been.called;
        });
        it('should fire inherited events', function(done) {
            spy.a = function(event) {
                expect(event.data).to.have.property('index', 0);
                expect(event.data).to.have.property('widget', w1);
                done();
            };
            c.subscribe('contTest4', spy.a);
            c.subscribe('contTest5', spy.b);
            c.attachWidget(w1);
            w1.fire('contTest4');
            w2.fire('contTest4');
            w1.fire(['contTest5', 'contTest4']);
            //expect(spy.b).to.not.have.been.called;
        });
        it('should unsubscribe event on detach', function() {
            throw 'TODO';
        });
    });
});
