var expect = chai.expect;

var Widget     = WAF.require('waf-core/widget'),
    Behavior   = WAF.require('waf-core/behavior'),
    WakError   = WAF.require('waf-core/error'),
    Event      = WAF.require('waf-core/event'),
    Subscriber = WAF.require('waf-core/subscriber'),
    Class      = WAF.require('waf-core/class');

moduleDescribe('waf-behavior/observable', function() {

    describe('#subscribe(eventKind, target, callback, observer, user_data)', function() {
        var subscriber, w, spy;
        before(function() {
            var W = Widget.create('Plop');
            w = new W();
            w._initSubscriber = sinon.spy();
            spy = sinon.spy();
            subscriber = w.subscribe('myEvent', spy);
        });
        it('should return a subscriber object', function() {
            expect(subscriber).is.instanceOfClass(Subscriber);
        });
        describe('Subscriber', function() {
            it('should have properties', function() {
                // TODO
            });
            describe('#unsubscribe()', function() {
                // TODO
            });
            describe('#match(args)', function() {
                it('should match args', function() {
                    // TODO
                });
                it('shoudl call the given match function', function() {
                    // TODO
                });
            });
        });
        it('should call _initSubscriber to initailize the event', function() {
            expect(w._initSubscriber).to.have.been.calledWith('myEvent');
        });
        it('should call _initSubscriber for a sub event', function() {
            // FIXME check if needed
        });
    });
    describe('#unsubscribe(args)', function() {
        var w, s1, s2, s3, s4, s5, s6;
        beforeEach(function() {
            var W = Widget.create('Plop');
            w = new W();
            w._destroySubscriber = sinon.spy();
            s1 = sinon.spy();
            s2 = sinon.spy();
            s3 = sinon.spy();
            s4 = sinon.spy();
            s5 = sinon.spy();
            s6 = sinon.spy();
            w.subscribe('plop', s1);
            w.subscribe('plip', s2);
            w.subscribe('plop', 'target', s3);
            w.subscribe('plop', s4, w);
        });

        it('should do nothing if no event match', function() {
            w.unsubscribe({ event: 'toto' });
            w.fire(['plip', 'plop']);
            expect(s1).to.have.been.called;
            expect(s2).to.have.been.called;
            expect(s3).to.have.been.called;
            expect(s4).to.have.been.called;
        });
        it('should remove all subscriber for an event', function() {
            w.unsubscribe({ event: 'plop' });
            w.fire(['plip', 'plop']);
            expect(s1).to.not.have.been.called;
            expect(s2).to.have.been.called;
            expect(s3).to.not.have.been.called;
            expect(s4).to.not.have.been.called;
        });
        it('should remove all subscriber for an observer', function() {
            w.unsubscribe({ observer: w });
            w.fire(['plip', 'plop']);
            expect(s1).to.have.been.called;
            expect(s2).to.have.been.called;
            expect(s3).to.have.been.called;
            expect(s4).to.not.have.been.called;
        });
        it('should remove all subscriber for a target', function() {
            w.unsubscribe({ target: 'target' });
            w.fire(['plip', 'plop']);
            expect(s1).to.have.been.called;
            expect(s2).to.have.been.called;
            expect(s3).to.not.have.been.called;
            expect(s4).to.have.been.called;
        });
        it('should remove all subscriber for a callback', function() {
            w.unsubscribe({ callback: s1 });
            w.fire(['plip', 'plop']);
            expect(s1).to.not.have.been.called;
            expect(s2).to.have.been.called;
            expect(s3).to.have.been.called;
            expect(s4).to.have.been.called;
        });
        it('should call destorySubscriber when theres no subscriber left', function() {
            w.unsubscribe({ event: 'plop' });
            expect(w._destroySubscriber).to.have.been.calledWith('plop');
        });
    });
    describe('#removeSubscriber(subscriber)', function() {
        it('should remove a subscriber from the widget', function() {
            var W = Widget.create('Plop');
            var w = new W();
            var spy = sinon.spy();
            var subscriber = w.subscribe('plop', spy);
            w.fire('plop');
            w.removeSubscriber(subscriber);
            w.fire('plop');
            expect(spy).to.have.been.calledOnce;
        });
        it('should fire the subscriber for other widgets', function() {
            var W = Widget.create('Plop');
            var w = new W();
            var w2 = new W();
            var spy = sinon.spy();
            var subscriber = w.subscribe('plop', spy);
            w2.subscribe(subscriber);
            w.fire('plop');
            w2.fire('plop');
            expect(spy).to.have.been.calledTwice;
            w.removeSubscriber(subscriber);
            w.fire('plop');
            expect(spy).to.have.been.calledThirce;
            w2.fire('plop');
            expect(spy).to.have.been.calledThirce;
        });
    });
    describe('#fire(eventKinds, target, data, options)', function() {
        it('should launch the callback for the event', function() {
            var W = Widget.create('');
            var w = new W();
            var spy = sinon.spy();
            w.subscribe('plop', spy);
            w.fire('plop');
            expect(spy).to.have.been.called;
        });
        it('should launch the callback for all event', function() {
            var W = Widget.create('');
            var w = new W();
            var spy = sinon.spy();
            w.subscribe('all', spy);
            w.fire('plop');
            expect(spy).to.have.been.called;
        });
        it('should launch the callback for a sub event', function() {
            var W = Widget.create('');
            var w = new W();
            var spy = sinon.spy();
            w.subscribe('plop', spy);
            w.fire(['plip', 'plop']);
            expect(spy).to.have.been.called;
        });
        it('should launch the callback for an event and a target', function() {
            var W = Widget.create('');
            var w = new W();
            var spy = sinon.spy();
            w.subscribe('plop', 'toto', spy);
            w.fire('plop', 'toto');
            w.fire('plop', 'tata');
            expect(spy).to.have.been.calledOnce;
        });
        it('should launch the callback for an event and a regex target', function() {
            var W = Widget.create('');
            var w = new W();
            var spy = sinon.spy();
            var spy2 = sinon.spy();
            w.subscribe('plop', 'toto', spy);
            w.subscribe('plop', 'totata', spy2);
            w.fire('plop', /^to/);
            w.fire('plop', /tata/);
            expect(spy).to.have.been.calledOnce;
            expect(spy2).to.have.been.calledTwice;
        });
        describe('Option onlyRealEvent', function() {
            it('should launch not the callback for a sub event if onlyRealEvent', function() {
                var W = Widget.create('');
                var w = new W();
                var spy = sinon.spy();
                var spy2 = sinon.spy();
                w.subscribe('plop', spy);
                w.subscribe('plip', spy2);
                w.fire(['plip', 'plop'], {}, { onlyRealEvent: true });
                expect(spy2).to.have.been.calledOnce;
                expect(spy).to.not.have.been.called;
            });
        });
        describe('Option defered', function() {
            it('should launch the callback defered', function(done) {
                var W = Widget.create('');
                var w = new W();
                var spy = sinon.spy(function() {
                    done();
                });
                w.subscribe('plop', spy);
                w.fire('plop', {}, { defered: true });
                expect(spy).to.not.have.been.called;
            });
        });
        describe('Option animationFrame', function() {
            it('should launch the callback in an animation frame', function(done) {
                //TODO test if really in animation frame (for instance, it just tests if defered)
                var W = Widget.create('');
                var w = new W();
                var spy = sinon.spy(function() {
                    done();
                });
                w.subscribe('plop', spy);
                w.fire('plop', {}, { animationFrame: true });
                expect(spy).to.not.have.been.called;
            });
        });
        describe('Option once', function() {
            it('should launch the callback defered once', function(done) {
                var W = Widget.create('');
                var w = new W();
                var spy = sinon.spy();
                w.subscribe('plop', spy);
                w.fire('plop', {}, { once: true });
                w.fire('plop', {}, { once: true });
                w.fire('plop', {}, { once: true });
                expect(spy).to.not.have.been.called;
                setTimeout(function() {
                    expect(spy).to.have.been.calledOnce;
                    done();
                }, 100);
            });
        });
        it('should launch again  the callback for an event when the subscriber is resumed', function() {
            var W = Widget.create('');
            var w = new W();
            var spy = sinon.spy();
            var subscriber = w.subscribe('plop', spy);
            expect(subscriber.isPaused()).to.be.false;
            w.fire('plop');
            subscriber.pause();
            expect(subscriber.isPaused()).to.be.true;
            w.fire('plop');
            expect(spy).to.have.been.calledOnce;
            subscriber.resume();
            expect(subscriber.isPaused()).to.be.false;
            w.fire('plop');
            expect(spy).to.have.been.calledTwice;
        });
        describe('Event object', function() {
            var W, w;
            beforeEach(function() {
                W = Widget.create('');
                w = new W();
            });
            it('should pass an event object to the callback', function() {
                w.subscribe('plop', function(event) {
                    expect(event).to.be.instanceOfClass(Event);
                });
                w.fire('plop');
            });
            it('should have the right properties', function() {
                var data = { hello: 'world' };
                var self = {};
                w.subscribe('plop', function(event) {
                    expect(this).to.equal(self);
                    expect(event).to.have.property('data').to.deep.equal(data);
                    expect(event).to.have.property('kind', 'plip');
                    expect(event).to.have.property('target', 'target');
                    expect(event).to.have.property('emitter', w);
                    expect(event).to.have.property('emitters').to.contain(w);
                    expect(event).to.not.have.property('parentEvent');
                    expect(event).to.have.property('options').to.deep.equal({ fromFire: true });
                }, self);
                w.fire(['plip', 'plop'], 'target', data, { fromFire: true });
            });
            it('should contain user data', function() {
                var userData = { bonjour: 'monde' };
                w.subscribe('plip', function(event, u) {
                    expect(u).to.equal(userData);
                }, w, userData);
                w.fire('plip');
            });
            it('should manage the list of the emiters', function() {
                // TODO
            });
            it('should refer to the parent event', function() {
                // TODO
            });
        });
    });
    describe('cloned object', function() {
        var W, w, spy, subscriber, w2;
        beforeEach(function() {
            W = Widget.create('Plop');
            W.prototype._initSubscriber = sinon.spy();
            w = new W();
            spy = sinon.spy();
            subscriber = w.subscribe('plop', spy);
            w2 = w.clone();
        });
        it('should clone events', function() {
            w2.fire('plop');
            expect(spy).to.have.been.calledOnce;
        });
        it('should allow subscribers to unsubscribe all widgets', function() {
            w.fire('plop');
            w2.fire('plop');
            expect(spy).to.have.been.calledTwice;
            subscriber.unsubscribe();
            w.fire('plop');
            w2.fire('plop');
            expect(spy).to.have.been.calledTwice;
        });
        it('should call _initSubscribers when cloning subscribers', function() {
            expect(W.prototype._initSubscriber).to.have.been.calledWith('plop');
        });
    });
});
