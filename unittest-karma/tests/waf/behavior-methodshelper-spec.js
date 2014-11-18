/* jshint strict:false,expr:true */
/* global describe, it, expect, sinon */
var Class = WAF.require('waf-core/class');

moduleDescribe('waf-behavior/methodshelper', function() {
    var getThis = function() { return this; };
    describe('.addClassMethod', function() {
        var a = Class.create('a');
        a.addClassMethod('toto', getThis);
        it('should add a class method', function() {
            expect(a).to.have.property('toto').to.equal(getThis);
            expect(a.toto()).to.equal(a);
        });
    });
    describe('.addClassMethods', function() {
        var a = Class.create('a');
        a.addClassMethods({'titi': getThis, tata: 5});
        it('should add some class methods', function() {
            expect(a).to.have.property('titi').to.equal(getThis);
            expect(a.titi()).to.equal(a);
            expect(a).to.have.property('tata').to.equal(5);
        });
    });
    describe('.addMethod', function() {
        var a = Class.create('a');
        a.addMethod('toto2', getThis);
        var _a = new a();
        it('should add an instance method', function() {
            expect(_a).to.have.property('toto2').to.equal(getThis);
            expect(_a.toto2()).to.equal(_a);
        });
    });
    describe('.addMethods', function() {
        var a = Class.create('a');
        a.addMethods({'titi2': getThis, tata2: 25});
        var _a = new a();
        it('should add some instance methods', function() {
            expect(_a).to.have.property('titi2').to.equal(getThis);
            expect(_a.titi2()).to.equal(_a);
            expect(_a).to.have.property('tata2').to.equal(25);
        });
    });
    describe('.makeAsync', function() {
        var a = Class.create('a');
        a.prototype.toto = function() { return 'toto'; };
        a.prototype.arghhh = function() { throw 'toto'; };
        a.makeAsync('toto');
        a.makeAsync('toto', 'callMeLater');
        a.makeAsync('arghhh');
        var _a = new a();
        it('should create new functions', function() {
            expect(_a).to.have.property('totoAsync');
            expect(_a).to.have.property('callMeLater');
            expect(_a).to.have.property('arghhhAsync');
        });
        it('should call passed onsuccess', function(done) {
            _a.totoAsync({ onSuccess: function(r) { expect(r).to.equal('toto'); done(); }});
        });
        it('should call passed onsucces on renamed function', function(done) {
            _a.callMeLater({ onSuccess: function(r) { expect(r).to.equal('toto'); done(); }});
        });
        it('should call onerror', function(done) {
            _a.arghhhAsync({ onSuccess: function(r) { throw 'this should not happen'; }, onError: function(e) { expect(e).to.equal('toto'); done(); }});
        });
    });
   /* describe('.setClassNamespace', function() {
        var a = Class.create('a');
        a.setClassNamespace('ns', {
            toto: getThis
        });
        it('should add a namespace', function() {
            expect(a).to.have.property('ns').to.have.property('toto').to.be.a('function');
        });
        it('should bind functions to this', function() {
            expect(a.ns.toto()).to.equal(a);
        });
    });
    describe('.setNamespace', function() {
        var a = Class.create('a');
        a.setNamespace('ns2', {
            tata: getThis
        });
        var _a = new a();
        it('should add a namespace', function() {
            expect(_a).to.have.property('ns2').to.have.property('tata').to.be.a('function');
        });
        it('should bind functions to this', function() {
            expect(_a.ns2.tata()).to.equal(_a);
        });
    });
*/
    describe('._addMultiInheritedCaller', function() {
        var a = Class.create('a');
        a.prototype.m = function(a, b) { this._m += 'a' + a + b; };
        var b = Class.create('b');
        b.prototype.m = function(a, b) { this._m += 'b' + a + b; };
        var c = Class.create('c');
        c.inherit(a);
        c.inherit(b);
        c.prototype.initialize = function() { this._m = ''; };
        c._addMultiInheritedCaller('m');
        var _c = new c();
        _c.m('0', '1');
        it('should create a function', function() {
            expect(_c).to.have.property('m').to.be.a('function');
        });
        it('should call all inherited function when called', function() {
            expect(_c).to.have.property('_m').to.be.a('string').to.contain('a01').to.contain('b01').to.have.length(6);
        });
    });

    describe('.wrapClassMethod(name, function)', function() {
        it('should call function with original binded method and arguments', function() {
            var a = Class.create();
            a.m = function() { return this; };
            a.wrapClassMethod('m', function(orig, arg) {
                expect(this).to.equal(a);
                expect(orig).to.be.a.function;
                expect(orig()).to.equal(this);
                return arg;
            });
            expect(a.m(123)).to.equal(123);
        });
    });
    describe('.doBeforeClassMethod(name, function)', function() {
        it('should call function with original binded method and arguments', function() {
            var a = Class.create();
            var orig = a.m = sinon.spy();
            var spy = sinon.spy();
            a.doBeforeClassMethod('m', spy);
            a.m(123);
            expect(orig).to.have.been.calledWith(123);
            expect(spy).to.have.been.calledBefore(orig);
        });
    });
    describe('.doAfterClassMethod(name, function)', function() {
        it('should call function with original binded method and arguments', function() {
            var a = Class.create();
            var orig = a.m = sinon.spy();
            var spy = sinon.spy();
            a.doAfterClassMethod('m', spy);
            a.m(123);
            expect(orig).to.have.been.calledWith(123);
            expect(spy).to.have.been.calledAfter(orig);
        });
    });

    describe('.wrap(name, function)', function() {
        it('should call function with original binded method and arguments', function() {
            var a = Class.create();
            a.prototype.m = function() { return this; };
            a.wrap('m', function(orig, arg) {
                expect(this).to.equal(_a);
                expect(orig).to.be.a.function;
                expect(orig()).to.equal(this);
                return arg;
            });
            var _a = new a();
            expect(_a.m(123)).to.equal(123);
        });
    });
    describe('.doBefore(name, function)', function() {
        it('should call function with original binded method and arguments', function() {
            var a = Class.create();
            var orig = a.prototype.m = sinon.spy();
            var spy = sinon.spy();
            a.doBefore('m', spy);
            var _a = new a();
            _a.m(123);
            expect(orig).to.have.been.calledWith(123);
            expect(spy).to.have.been.calledBefore(orig);
        });
    });
    describe('.doAfter(name, function)', function() {
        it('should call function with original binded method and arguments', function() {
            var a = Class.create();
            var orig = a.prototype.m = sinon.spy();
            var spy = sinon.spy();
            a.doAfter('m', spy);
            var _a = new a();
            _a.m(123);
            expect(orig).to.have.been.calledWith(123);
            expect(spy).to.have.been.calledAfter(orig);
        });
    });
});

