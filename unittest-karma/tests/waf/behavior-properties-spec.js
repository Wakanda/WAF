/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, sinon */
var Class = WAF.require('waf-core/class');
var Widget = WAF.require('waf-core/widget');

describe('waf-behavior/properties', function() {
    describe('.addProperty', function() {
        describe('Runtime', function() {
            var a = Widget.create('a');
            a.addProperty('plop', { defaultValue: 5 });
            a.addProperty('plip');

            var _a = new a();
            it('should have a property', function() {
                expect(_a).to.have.property('plop').to.be.a('function');
            });
            it('should have the right default value', function() {
                expect(_a.plop()).to.equal(5);
            });
            it('should return null as default value', function() {
                expect(_a.plip()).to.be.null;
            });
            it('should set a value', function() {
                expect(_a.plop(123)).to.equal(123);
                expect(_a.plop()).to.equal(123);
            });
            it('should set the initial value form the options', function() {
                var _a = new a({ plop: 456 });
                expect(_a.plop()).to.equal(456);
            });
            it('should set the initial value with a callback', function() {
                var a = Widget.create('a');
                var _this;
                a.doBefore('initialize', function(options) {
                    _this = this;
                });
                a.addProperty('plop', { defaultValueCallback: function(name) {
                    expect(name).to.equal('plop');
                    expect(this).to.equal(_this);
                    return 456;
                }});
                var _a = new a();
                expect(_a.plop()).to.equal(456);
            });
            it('should fire change event', function() {
                a.addProperty('toto');
                var _a = new a();
                var spy = sinon.spy();
                _a.toto(12);
                _a.subscribe('change', 'toto', function(event) {
                    spy();
                    expect(event.data).to.have.property('value', 123);
                    expect(event.data).to.have.property('oldValue', 12);
                });
                _a.toto(123);
                expect(spy).to.have.been.called;
            });
            it('should support change callback as options', function() {
                var spy = sinon.spy();
                var W  = Widget.create('W', { items: Widget.property({ type: 'list', onChange: spy }) });
                var w = new W();
                w.fire('change', 'items', { value: 1234 });
                w.fire('change', 'not_items');
                expect(spy).to.have.been.calledWith(1234);
            });
            it('should launch callback when change event with this target', function() {
                var spy = sinon.spy();
                var W  = Widget.create('W', { items: Widget.property() });
                var w = new W();
                w.items.onChange(spy);
                w.fire('change', 'items', { value: 1234 });
                w.fire('change', 'not_items');
                expect(spy).to.have.been.calledWith(1234);
                expect(spy).to.have.been.calledOnce;
            });
        });

        it('should throw an error if a property already exists', function() {
            var a = Class.create();
            a.addProperty('plop', { defaultValue: 5 });
            expect(function() { a.addProperty('plop'); }).to.throw();
            expect(function() { a.addProperty('Plop'); }).to.throw();
        });

        var a = Class.create('a');
        a.prototype.initialize = function() {
            this.options = {};
            this._initBehavior();
        };
        a.addProperty('plop', { defaultValue: 5 });

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

    });
    describe('.removeProperty', function() {
        var a = Class.create('a');
        a.prototype.initialize = function() {
            this._initBehavior();
        };
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

    describe('plugins', function() {
        var Properties = WAF.require('waf-behavior/properties');
        var _this;
        Properties.types.plop = {
            init: function(name, property, storage) {
                expect(name).to.equal('plip');
                expect(property).to.equal(this.constructor._properties.plip);
                expect(this).to.equal(_this);
                Properties.types['*'].init.call(this, name, property, storage);
            },
            createAccessor: function(name, property, storage) {
                expect(name).to.equal('plip');
                expect(property).to.equal(this.constructor._properties.plip);
                expect(this).to.equal(_this);
                Properties.types['*'].createAccessor.call(this, name, property, storage);
            },
            normalize: function(value, property, name) {
                expect(name).to.equal('plip');
                expect(property).to.equal(this.constructor._properties.plip);
                expect(this).to.equal(_this);
                Properties.types['*'].normalize.call(this, value, property, name);
                return 123;
            },
            options: { specialOption: true },
            afterAdd: function(name, property) {
                Properties.types['*'].afterAdd.call(this, name, property);
            }
        };
        sinon.spy(Properties.types.plop, 'init');
        sinon.spy(Properties.types.plop, 'createAccessor');
        sinon.spy(Properties.types.plop, 'normalize');
        sinon.spy(Properties.types.plop, 'afterAdd');
        it('should have a types property', function() {
            expect(Properties).to.have.a.property('types').to.be.an('object');
        });
        it('should call afterAdd callback', function() {
            var a = Widget.create('a');
            a.addProperty('plip', { type: 'plop' });
            a.doBefore('initialize', function() { _this = this; });
            expect(Properties.types.plop.afterAdd).to.have.been.called;
        });
        it('should call init callback', function() {
            var a = Widget.create('a');
            a.addProperty('plip', { type: 'plop' });
            a.doBefore('initialize', function() { _this = this; });
            var _a = new a();
            expect(Properties.types.plop.init).to.have.been.called;
        });
        it('should call createAccessor callback', function() {
            var a = Widget.create('a');
            a.addProperty('plip', { type: 'plop' });
            a.doBefore('initialize', function() { _this = this; });
            var _a = new a();
            expect(Properties.types.plop.createAccessor).to.have.been.calledAfter(Properties.types.plop.init);
        });
        it('should call normalize callback', function() {
            var a = Widget.create('a');
            a.addProperty('plip', { type: 'plop' });
            a.doBefore('initialize', function() { _this = this; });
            var _a = new a();
            _a.plip(456);
            expect(Properties.types.plop.normalize).to.have.been.called;
            expect(_a.plip()).to.equal(123);
        });
    
    });

    describe('type number', function() {
        it('should normalize to number', function() {
            var a = Widget.create('a');
            a.addProperty('plop', { type: 'number' });
            var _a = new a();
            _a.plop('456');
            expect(_a.plop()).to.be.a('number');
            expect(_a.plop()).to.equal(456);
        });
    });
    describe('type boolean', function() {
        it('should normalize to a boolean', function() {
            var a = Widget.create('a');
            a.addProperty('plop', { type: 'boolean' });
            var _a = new a();
            _a.plop('true');
            expect(_a.plop()).to.be.a('boolean');
            expect(_a.plop()).to.be.true;
            _a.plop('nottrue');
            expect(_a.plop()).to.be.a('boolean');
            expect(_a.plop()).to.be.false;
        });
    });


});


