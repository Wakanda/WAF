/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, afterEach, source, sinon, moduleDescribe */
var Widget = WAF.require('waf-core/widget');

function testAccessor(options, values) {
    describe('#accessor()', function() {
        var a, _a;
        beforeEach(function() {
            a = Widget.create('a');
            a.addProperty('plop', WAF.extend({ defaultValue: values[0] }, options));
            a.addProperty('plip', options);

            _a = new a();
        });
        it('should have a property', function() {
            expect(_a).to.have.property('plop').to.be.a('function');
        });
        it('should have the right default value', function() {
            expect(_a.plop()).to.equal(values[0]);
        });
        it('should return null as default value', function() {
            expect(_a.plip()).to.be.null;
        });
        it('should set a value', function() {
            expect(_a.plop(values[1])).to.equal(values[1]);
            expect(_a.plop()).to.equal(values[1]);
        });
        it('should set the initial value form the options', function() {
            var _a = new a({ plop: values[1] });
            expect(_a.plop()).to.equal(values[1]);
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
                return values[1];
            }});
            var _a = new a();
            expect(_a.plop()).to.equal(values[1]);
        });
        it('should fire change event', function() {
            a.addProperty('toto');
            var _a = new a();
            var spy = sinon.spy();
            _a.toto(values[2]);
            _a.subscribe('change', 'toto', function(event) {
                spy();
                expect(event.data).to.have.property('value', values[1]);
                expect(event.data).to.have.property('oldValue', values[2]);
            });
            _a.toto(values[1]);
            expect(spy).to.have.been.called;
        });
        it('should not fire change event if value is the same', function() {
            var spy = sinon.spy();
            _a.subscribe('change', 'plop', spy);
            _a.plop(values[0]);
            expect(spy).to.not.have.been.called;
        });
        it('should support change callback as options', function() {
            var spy = sinon.spy();
            var W  = Widget.create('W', { items: Widget.property({ onChange: spy }) });
            var w = new W();
            w.fire('change', 'items', { value: values[1] });
            w.fire('change', 'not_items');
            expect(spy).to.have.been.calledWith(values[1]);
        });
        it('should launch callback when change event with this target', function() {
            var spy = sinon.spy();
            var W  = Widget.create('W', { items: Widget.property() });
            var w = new W();
            w.items.onChange(spy);
            w.fire('change', 'items', { value: values[1] });
            w.fire('change', 'not_items');
            expect(spy).to.have.been.calledWith(values[1]);
            expect(spy).to.have.been.calledOnce;
        });
        describe('.bindDatasource()', function() {
            it('should call bindDatasourceAttribute', function() {
                window.sources = window.source = {
                    source: new WAF.DataSourceVar({
                        "variableReference": [],
                        "data-attributes": 'attr1:string'
                    })
                };
                sinon.spy(_a, 'bindDatasourceAttribute');
                _a.plop.bindDatasource('source.attr1');
                expect(_a.bindDatasourceAttribute).to.have.been.calledWith('source.attr1', undefined, 'plop', undefined);
                delete window.sources;
                delete window.source;
            });
            it('should set the initial binding form the options', function() {
                var _a = new a({ 'binding-plop': 'source.attr' });
                expect(_a.plop.boundDatasource()).to.have.a.property('datasourceName', 'source');
                expect(_a.plop.boundDatasource()).to.have.a.property('attribute', 'attr');
            });
        });
        describe('.unbindDatasource()', function() {
            it('should call unsubscribe on the subscriber', function() {
                window.sources = window.source = {
                    source: new WAF.DataSourceVar({
                        "variableReference": [],
                        "data-attributes": 'attr1:string'
                    })
                };
                sinon.spy(_a, 'bindDatasourceAttribute');
                _a.plop.bindDatasource('source.attr1');
                var subscriber = _a.bindDatasourceAttribute.lastCall.returnValue;
                sinon.spy(subscriber, 'unsubscribe');
                _a.plop.unbindDatasource();
                expect(subscriber.unsubscribe).to.have.been.called;
                delete window.sources;
                delete window.source;
            });
        });
        describe('.boundDatasource()', function() {
            beforeEach(function() {
                window.sources = window.source = {
                    source: new WAF.DataSourceVar({
                        "variableReference": [],
                        "data-attributes": 'attr1:string'
                    })
                };
            });
            afterEach(function() {
                delete window.sources;
                delete window.source;
            });
            it('should return null if no binding', function() {
                expect(_a.plop.boundDatasource()).to.be.null;
            });
            it('should return an object', function() {
                _a.plop.bindDatasource('source.attr1');
                expect(_a.plop.boundDatasource()).to.be.an('object');
            });
            it('should return a distinct copy', function() {
                _a.plop.bindDatasource('source.attr1');
                expect(_a.plop.boundDatasource()).to.not.equal(_a.plop.boundDatasource());
            });
            it('should return datasourceName', function() {
                _a.plop.bindDatasource('source.attr1');
                expect(_a.plop.boundDatasource()).to.have.a.property('datasourceName', 'source');
            });
            it('should return attribute', function() {
                _a.plop.bindDatasource('source.attr1');
                expect(_a.plop.boundDatasource()).to.have.a.property('attribute', 'attr1');
            });
            it('should return datasource', function() {
                _a.plop.bindDatasource('source.attr1');
                expect(_a.plop.boundDatasource()).to.have.a.property('datasource', source.source);
            });
            it('should return datasource undef if it not exists', function() {
                _a.plop.bindDatasource('source2.attr1');
                expect(_a.plop.boundDatasource().datasource).to.be.undefined;
            });
            it('should return datasourceName if it not exists', function() {
                _a.plop.bindDatasource('source2.attr1');
                expect(_a.plop.boundDatasource()).to.have.a.property('datasourceName', 'source2');
            });
            it('should return valid true if bound', function() {
                _a.plop.bindDatasource('source.attr1');
                expect(_a.plop.boundDatasource()).to.have.a.property('valid', true);
            });
            it('should return valid false if bound', function() {
                _a.plop.bindDatasource('source2.attr1');
                expect(_a.plop.boundDatasource()).to.have.a.property('valid', false);
            });
        });
    });
}

moduleDescribe('waf-behavior/properties', function() {
    describe('.addProperty', function() {
        testAccessor({}, [7, 12, 34]);
    });
    describe('.addProperty', function() {
        var a, b, _b;
        beforeEach(function() {
            a = Widget.create('a');
            a.addProperty('plop', { defaultValue: 5 });
            a.addProperty('plorp', { bindable: false });

            b = Widget.create('b', a);
            b.addProperty('plip', { defaultValue: [] });
            _b = new b();
        });
        it('should throw an error if a property already exists', function() {
            expect(function() { a.addProperty('plop'); }).to.throw();
            expect(function() { a.addProperty('Plop'); }).to.throw();
            expect(function() { a.addProperty('plOp'); }).to.throw();
        });
        it('should throw an error if type is unknown', function() {
            expect(function() { a.addProperty('plaaaap', { type: 'jyfvvjcjtjcg' }); }).to.throw();
        });
        it('should have an inherited property', function() {
            expect(_b).to.have.property('plop').to.be.a('function');
            expect(_b.plop()).to.equal(5);
            expect(_b).to.have.property('plip').to.be.a('function');
            expect(_b.plip()).to.be.a('array');
        });
        it('should clone objects', function() {
            _b.plip().push(5);
            var _b2 = new b();
            expect(_b2.plip()).not.to.contain(5);
        });
        describe('bindable', function() {
            var data, source;
            beforeEach(function() {
                a = Widget.create('a');
                a.addProperty('plop', { defaultValue: 5 });
                a.addProperty('plorp', { bindable: false });
                _b = new a();

                data = [ { attr1: "coucou" } ];
                source = new WAF.DataSourceVar({
                    "variableReference": data,
                    "data-attributes": 'attr1:string,attr2:string'
                });
            });
            it('should throw an error if property is not bindable', function() {
                expect(function() {
                    _b.bindDatasourceAttribute(source, 'attr1', 'plorp');
                }).to.throw(WakError.Bindable);
            });
            it('should sync values', function() {
                _b.bindDatasourceAttribute(source, 'attr1', 'plop');
                expect(_b.plop()).to.equal('coucou');
            });
            it('should sync values on datasource update', function() {
                _b.bindDatasourceAttribute(source, 'attr1', 'plop');
                expect(_b.plop()).to.equal('coucou');
            });
            it('should sync values', function() {
                _b.bindDatasourceAttribute(source, 'attr1', 'plop');
                expect(_b.plop()).to.equal('coucou');
                source.getAttribute('attr1').setValue('hello');
                expect(_b.plop()).to.equal('hello');
            });
            it('should sync values', function() {
                _b.bindDatasourceAttribute(source, 'attr1', 'plop');
                _b.plop('bonjour');
                expect(source.getAttribute('attr1').getValue()).to.equal('bonjour');
            });
        });
    });
    describe('.removeProperty', function() {
        var a, b, _a, _b;
        beforeEach(function() {
            a = Widget.create('a');
            a.addProperty('plop', { defaultValue: 5 });

            b = Widget.create('b', a);
            b.removeProperty('plop');
            _a = new a();
            _b = new b();
        });
        it('should no longer have property', function() {
            expect(_a).to.have.property('plop');
            expect(_b).to.not.have.property('plop');
        });
    });
    describe('.getProperties', function() {
        var a, b;
        beforeEach(function() {
            a = Widget.create('a');
            a.addProperty('plop', { defaultValue: 5 });
            b = Widget.create('b', a);
            b.addProperty('plip', { defaultValue: [] });
        });
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
            new a();
            expect(Properties.types.plop.init).to.have.been.called;
        });
        it('should call createAccessor callback', function() {
            var a = Widget.create('a');
            a.addProperty('plip', { type: 'plop' });
            a.doBefore('initialize', function() { _this = this; });
            new a();
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
        var a, _a;
        beforeEach(function() {
            a = Widget.create('a');
            a.addProperty('plop', { type: 'number' });
            _a = new a();
        });
        it('should normalize to number', function() {
            _a.plop('456.123');
            expect(_a.plop()).to.be.a('number');
            expect(_a.plop()).to.equal(456.123);
        });
        it('shoudl return number unchanged', function() {
            _a.plop(456.123);
            expect(_a.plop()).to.be.a('number');
            expect(_a.plop()).to.equal(456.123);
        });
    });
    describe('type boolean', function() {
        var a, _a;
        beforeEach(function() {
            a = Widget.create('a');
            a.addProperty('plop', { type: 'boolean' });
            _a = new a();
        });
        it('should normalize "true" to true', function() {
            _a.plop('true');
            expect(_a.plop()).to.be.a('boolean');
            expect(_a.plop()).to.be.true;
        });
        it('should normalize other non boolean to false', function() {
            _a.plop('nottrue');
            expect(_a.plop()).to.be.a('boolean');
            expect(_a.plop()).to.be.false;
        });
        it('shoudl return true unchanged', function() {
            _a.plop(true);
            expect(_a.plop()).to.be.true;
        });
        it('shoudl return false unchanged', function() {
            _a.plop(false);
            expect(_a.plop()).to.be.false;
        });
    });
    describe('type integer', function() {
        var a, _a;
        beforeEach(function() {
            a = Widget.create('a');
            a.addProperty('plop', { type: 'integer' });
            _a = new a();
        });
        it('should normalize to an integer', function() {
            _a.plop('456.123');
            expect(_a.plop()).to.be.a('number');
            expect(_a.plop()).to.equal(456);
        });
        it('should truncate float', function() {
            _a.plop(456.123);
            expect(_a.plop()).to.be.a('number');
            expect(_a.plop()).to.equal(456);
        });
        it('shoudl return int unchanged', function() {
            _a.plop(456);
            expect(_a.plop()).to.be.a('number');
            expect(_a.plop()).to.equal(456);
        });
    });
    describe('type string', function() {
        var a, _a;
        beforeEach(function() {
            a = Widget.create('a');
            a.addProperty('plop', { type: 'string' });
            _a = new a();
        });
        it('should normalize to a string', function() {
            _a.plop(123);
            expect(_a.plop()).to.be.a('string');
            expect(_a.plop()).to.equal('123');
        });
        it('shoudl return string unchanged', function() {
            _a.plop('coucou');
            expect(_a.plop()).to.equal('coucou');
        });
    });
    describe('type date', function() {
        var a, _a;
        beforeEach(function() {
            a = Widget.create('a');
            a.addProperty('plop', { type: 'date' });
            _a = new a();
        });
        var tests = {
            '2011-11-29T15:52:30.5': 1322581950500,
            '2011-11-29T15:52:30.52': 1322581950520,
            '2011-11-29T15:52:18.867': 1322581938867,
            '2011-11-29T15:52:18.867Z': 1322581938867,
            '2011-11-29T15:52:18.867-03:30': 1322594538867,
            '2011-11-29': 1322524800000,
            '2011-11': 1320105600000,
            '2011': 1293840000000
        };
        Object.keys(tests).forEach(function(k) {
            it('should normalize "' + k + '" to a date', function() {
                _a.plop(k);
                expect(_a.plop()).to.be.instanceOf(Date);
                expect(_a.plop().getTime()).to.equal(tests[k]);
            });
            it('should normalize ' + tests[k] + ' to a date', function() {
                _a.plop(tests[k]);
                expect(_a.plop()).to.be.instanceOf(Date);
                expect(_a.plop().getTime()).to.equal(tests[k]);
            });
        });
        it('shoudl return date unchanged', function() {
            var d = new Date();
            _a.plop(d);
            expect(_a.plop()).to.equal(d);
        });
    });


});


