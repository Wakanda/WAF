var expect = chai.expect;
var Class = WAF.require('waf-core/class');
var Behavior = WAF.require('waf-core/behavior');
WAF.require('waf-behavior/methodshelper');
WAF.require('waf-behavior/propertieshelper');

describe('Behavior', function() {
    describe('.create', function() {
        it('should create a new behavior', function() {
            var toto = Behavior.create('Toto');
            expect(toto).to.be.a('function');
        });
    });
    describe('#getMethods', function() {
        it('should return methods', function() {
            var toto = Behavior.create('Toto');
            toto.prototype.m = function() { return this; };
            expect(toto).to.have.property('getMethods').to.be.a('function');
            expect(toto.getMethods()).to.contain('m').to.have.length(1);
        });
    });

});

describe('Behavior.PropertiesHelper', function() {
    describe('.addProperty', function() {
        var a = Class.create('a');
        a.prototype.initialize = function() {
            this.options = {};
            this.initProperties();
            this.initBehavior();
        };
        a.addProperty('plop', { defaultValue: 5 });

        var _a = new a();
        it('should have a property', function() {
            expect(_a).to.have.property('plop').to.be.a('function');
        });
        it('should have the right default value', function() {
            expect(_a.plop()).to.equal(5);
        });
        it('should set a value', function() {
            expect(_a.plop(123)).to.equal(123);
            expect(_a.plop()).to.equal(123);
        });

        var b = Class.create('b');
        a.addProperty('plip', { defaultValue: [] });
        b.inherit(a);
        var _b = new b();
        it('should have an inherited property', function() {
            expect(_b).to.have.property('plop').to.be.a('function');
            expect(_b.plop()).to.equal(5);
            expect(_b).to.have.property('plip').to.be.a('function');
            expect(_b.plip()).to.be.a('array');
        });

        it('should clone objects', function() {
            _b.plip().push(5);
            _b2 = new b();
            expect(_b2.plip()).not.to.contain(5);
        });

        it('should call onChange', function(done) {
            var ok;
            a.addProperty('toto', {
                onChange: function(value, name) {
                    expect(name).to.equal('toto');
                    expect(value).to.equal(123);
                    done();
                }
            });
            var _a = new a();
            _a.toto(123);
            expect(_a.toto()).to.equal(123);
        });

        it('should use camelcase for the function name', function() {
            a.addProperty('coucou_les_amis');
            expect(a.prototype).to.have.property('coucouLesAmis').to.be.a('function');
        });
    });
    describe('.removeProperty', function() {
        var a = Class.create('a');
        a.prototype.initialize = function() { this.initProperties(); };
        a.addProperty('plop', { defaultValue: 5 });

        var b = Class.create('b');
        b.inherit(a);
        b.removeProperty('plop');
        var _a = new a();
        var _b = new b();
        it('should no longer have property', function() {
            expect(_a).to.have.property('plop');
            expect(_b).to.not.have.property('plop');
        });
    });
    describe('.getProperties', function() {
        var a = Class.create('a');
        a.addProperty('plop', { defaultValue: 5 });
        var b = Class.create('b');
        a.addProperty('plip', { defaultValue: [] });
        b.inherit(a);
        it('should list properties', function() {
            expect(b.getProperties()).to.contain('plop').to.contain('plip').to.have.length(2);
        });

    });
});

describe('Behavior.MethodsHelper', function() {
    var getThis = function() { return this }
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
        describe('.addMultiInheritedCaller', function() {
        var a = Class.create('a');
        a.prototype.m = function(a, b) { this._m += 'a' + a + b; };
        b = Class.create('b');
        b.prototype.m = function(a, b) { this._m += 'b' + a + b; };
        c = Class.create('c');
        c.inherit(a);
        c.inherit(b);
        c.prototype.initialize = function() { this._m = ''; };
        c.addMultiInheritedCaller('m')
        _c = new c();
        _c.m('0', '1');
        it('should create a function', function() {
            expect(_c).to.have.property('m').to.be.a('function');
        });
        it('should call all inherited function when called', function() {
            expect(_c).to.have.property('_m').to.be.a('string').to.contain('a01').to.contain('b01').to.have.length(6);
        });
    });
});
