var Class = WAF.require('waf-core/class');
var Widget = WAF.require('waf-core/widget');
var WakError = WAF.require('waf-core/error');
/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, afterEach, sinon */

moduleDescribe('waf-behavior/bindable', function() {
    describe('._makeBindableProperty(property, setGetCallback, event)', function() {
        var C, gsc;
        beforeEach(function() {
            C = Class.create();
            C.inherit('waf-behavior/bindable');
            gsc = function() {};
            C._makeBindableProperty('toto', gsc, 'event');
        });
        it('should create a bindableProperty', function() {
            expect(C).to.have.a.property('_bindableProperties').to.have.property('toto').to.have.property('event', 'event');
            expect(C).to.have.a.property('_bindableProperties').to.have.property('toto').to.have.property('setGetCallback', gsc);
        });
    });
    describe('._makeBindableProperty(setGetCallback, event)', function() {
        var C, gsc;
        beforeEach(function() {
            C = Class.create();
            C.inherit('waf-behavior/bindable');
            gsc = function() {};
            C._makeBindableProperty(gsc, 'event');
        });
        it('should create a bindableProperty', function() {
            expect(C).to.have.a.property('_bindableProperties').to.have.property('').to.have.property('event', 'event');
            expect(C).to.have.a.property('_bindableProperties').to.have.property('').to.have.property('setGetCallback', gsc);
        });
    });

    var C, c, spy, spy2, spy3, datasource, data;
    function testValues(name, setup, event, attribute, spyValue, sourceValue, values) {
        describe(name, function() {
            it('should return a subscriber', function() {
                var subscriber = setup();
                expect(subscriber).to.be.a('object');
            });
            it('should return a subscriber with an unbind method', function() {
                var subscriber = setup();
                expect(subscriber).to.have.a.property('unbind').to.be.a('function');
            });
            it('should call the setter when binding a source', function() {
                setup();
                expect(spy2).to.have.been.calledWith(sourceValue);
            });
            if(event) {
                it('should call the getter when the event is fired', function() {
                    setup();
                    spy.reset();
                    c.fire(event);
                    expect(spy).to.have.been.calledOnce;
                });
                it('should have update the source when the event is fired', function() {
                    setup();
                    c.fire(event);
                    expect(datasource.getAttribute(attribute).getValue()).to.equal(spyValue);
                });
            }
            values.forEach(function(value) {
                it('should call the setter when the source is updated ' + JSON.stringify(value), function() {
                    setup();
                    if(typeof value[0] === 'object') {
                        Object.keys(value[0]).forEach(function(attribute) {
                            datasource.getAttribute(attribute).setValue(value[0][attribute]);
                        });
                    } else {
                        datasource.getAttribute(attribute).setValue(value[0]);
                    }
                    expect(spy2).to.have.been.calledWith(value[1]);
                });
                it('should stop calling setter after unbind ' + JSON.stringify(value), function() {
                    var subscriber = setup();
                    subscriber.unbind();
                    spy2.reset();
                    if(typeof value[0] === 'object') {
                        Object.keys(value[0]).forEach(function(attribute) {
                            datasource.getAttribute(attribute).setValue(value[0][attribute]);
                        });
                    } else {
                        datasource.getAttribute(attribute).setValue(value[0]);
                    }
                    expect(spy2).to.not.have.been.calledWith(value[1]);
                });
                if(event) {
                    if(typeof value[0] === 'object') {
                        it('should have update the source when the event is fired ' + JSON.stringify(value), function() {
                            setup();
                            spy.returns(value[1]);
                            var attributeValue = datasource.getAttribute(attribute).getValue();
                            datasource.getAttribute(attribute).setValue(Math.random());
                            Object.keys(value[0]).forEach(function(attribute2) {
                                if(attribute2 !== attribute) {
                                    datasource.getAttribute(attribute2).setValue(value[0][attribute2]);
                                } else {
                                    attributeValue = value[0][attribute];
                                }
                            });
                            c.fire(event);
                            expect(datasource.getAttribute(attribute).getValue()).to.equal(attributeValue);
                        });
                    }
                    it('should stop calling getter after unbind ' + JSON.stringify(value), function() {
                        var subscriber = setup();
                        subscriber.unbind();
                        spy.reset();
                        c.fire(event);
                        expect(spy).to.not.have.been.called;
                    });
                }
            });
        });
    }

    describe('#bindDatasourceAttribute', function() {
        beforeEach(function() {
            C = Widget.create('C');
            spy = sinon.stub();
            spy.returns('bonjour');
            spy2 = sinon.spy();
            spy3 = sinon.stub();
            spy3.returns(17);
            C._makeBindableProperty('toto', spy, 'event');
            C._makeBindableProperty('toto2', spy2, 'event2', spy);
            C._makeBindableProperty('toto3', spy2);
            C._makeBindableProperty('toto4', spy2, 'event4', spy3);
            c = new C();

            data = [ { attr1: "coucou", attr3: 13, attr4: 5 } ];
            datasource = new WAF.DataSourceVar({
                "variableReference": data,
                "data-attributes": 'attr1:string,attr2:string,attr3:number,attr4:number'
            });
            window.source2 = "coucou";
            var datasource2 = new WAF.DataSourceVar({
                "binding": "source2",
                "data-source-type": "scalar"
            });
            datasource2.sync();
            window.source = window.sources = {
                source: datasource,
                source2: datasource2,
            };
        });
        afterEach(function() {
            delete window.source2;
            delete window.source;
            delete window.sources;
        });
        describe('(datasource, attribute, property)', function() {
            it('should do nothing if no datasource', function() {
                c.bindDatasourceAttribute(undefined, 'attr1', 'toto');
            });
            it('should do nothing if not a datasource', function() {
                c.bindDatasourceAttribute({}, 'attr1', 'toto');
            });
            it('should throw an error if unknown property', function() {
                expect(function() {
                    c.bindDatasourceAttribute(datasource, 'attr1', 'tototatat');
                }).to.throw(WakError.Bindable);
            });
            it('should do nothing if unknown datasource attribute', function() {
                c.bindDatasourceAttribute(datasource, 'attrjfjfjcj', 'toto');
            });
            it('should unsubscribe if binding to another attribute', function() {
                var subscriber = c.bindDatasourceAttribute(datasource, 'attr1', 'toto');
                sinon.spy(subscriber, 'unbind');
                c.bindDatasourceAttribute(datasource, 'attr2', 'toto');
                expect(subscriber.unbind).to.have.been.caled;
            });
            it('should unsubscribe if binding to another datasource', function() {
                var subscriber = c.bindDatasourceAttribute(datasource, 'attr1', 'toto');
                sinon.spy(subscriber, 'unbind');
                var source2 = new WAF.DataSourceVar({
                    "variableReference": [],
                    "data-attributes": 'attr1:string,attr2:string'
                });
                c.bindDatasourceAttribute(source2, 'attr1', 'toto');
                expect(subscriber.unbind).to.have.been.caled;
            });
            it('should bind at init from options', function() {
                var w = new C({ "binding-toto": "source.attr1" });
                expect(spy).to.have.been.calledWith('coucou');
                datasource.getAttribute('attr1').setValue('hello');
                expect(spy).to.have.been.calledWith('hello');
                w.fire('event');
                expect(spy).to.have.been.calledThirce;
                expect(datasource.getAttribute('attr1').getValue()).to.equal('bonjour');
            });
            it('should support unknown datasource at init from options', function() {
                new C({ "binding-toto": "source2.attr1" });
            });
            it('should do nothing if empty binding string', function() {
                expect(c.bindDatasourceAttribute('', 'toto')).to.be.undefined;
            });
        });

        testValues('({datasource, attribute}, "toto")', function() {
            spy2 = spy;
            return c.bindDatasourceAttribute({
                datasource: datasource,
                attribute: 'attr1'
            }, 'toto');
        }, 'event', 'attr1', 'bonjour', 'coucou', [['hello', 'hello']]);

        testValues('(datasource, attribute, "toto")', function() {
            spy2 = spy;
            return c.bindDatasourceAttribute(datasource, 'attr1', 'toto');
        }, 'event', 'attr1', 'bonjour', 'coucou', [['hello', 'hello']]);

        testValues('("source.attribute", "toto")', function() {
            spy2 = spy;
            return c.bindDatasourceAttribute('source.attr1', 'toto');
        }, 'event', 'attr1', 'bonjour', 'coucou', [['hello', 'hello']]);


        testValues('({datasource, attribute}, "toto2")', function() {
            return c.bindDatasourceAttribute({
                datasource: datasource,
                attribute: 'attr1'
            }, 'toto2');
        }, 'event2', 'attr1', 'bonjour', 'coucou', [['hello', 'hello']]);

        testValues('("source.attribute", "toto2")', function() {
            return c.bindDatasourceAttribute('source.attr1', 'toto2');
        }, 'event2', 'attr1', 'bonjour', 'coucou', [['hello', 'hello']]);

        testValues('(datasource, attribute, "toto2")', function() {
            return c.bindDatasourceAttribute(datasource, 'attr1', 'toto2');
        }, 'event2', 'attr1', 'bonjour', 'coucou', [['hello', 'hello']]);


        testValues('({datasource, attribute}, "toto3")', function() {
            return c.bindDatasourceAttribute({
                datasource: datasource,
                attribute: 'attr1'
            }, 'toto3');
        }, undefined, 'attr1', 'bonjour', 'coucou', [['hello', 'hello']]);

        testValues('("source.attribute", "toto3")', function() {
            return c.bindDatasourceAttribute('source.attr1', 'toto3');
        }, undefined, 'attr1', 'bonjour', 'coucou', [['hello', 'hello']]);

        testValues('(datasource, attribute, "toto3")', function() {
            return c.bindDatasourceAttribute(datasource, 'attr1', 'toto3');
        }, undefined, 'attr1', 'bonjour', 'coucou', [['hello', 'hello']]);


        testValues('("source2", "toto") Datasource variable', function() {
            spy2 = spy;
            datasource = source.source2;
            return c.bindDatasourceAttribute('source2', 'toto');
        }, 'event', 'source2', 'bonjour', 'coucou', [['hello', 'hello']]);


        testValues('({callback})', function() {
            spy2 = spy;
            return c.bindDatasourceAttribute({
                datasource: datasource,
                attribute: 'attr1',
                callback: spy,
            });
        }, undefined, 'attr1', 'bonjour', 'coucou', [['hello', 'hello']]);

        testValues('({callback, event})', function() {
            spy2 = spy;
            return c.bindDatasourceAttribute({
                datasource: datasource,
                attribute: 'attr1',
                callback: spy,
                event: 'event3'
            });
        }, 'event3', 'attr1', 'bonjour', 'coucou', [['hello', 'hello']]);

        testValues('({setCallback})', function() {
            return c.bindDatasourceAttribute({
                datasource: datasource,
                attribute: 'attr1',
                setCallback: spy2
            });
        }, undefined, 'attr1', 'bonjour', 'coucou', [['hello', 'hello']]);

        testValues('({getCallback, setCallback, event})', function() {
            return c.bindDatasourceAttribute({
                datasource: datasource,
                attribute: 'attr1',
                setCallback: spy2,
                event: 'event3',
                getCallback: spy
            });
        }, 'event3', 'attr1', 'bonjour', 'coucou', [['hello', 'hello']]);

        testValues("('source.attr3|multiply 2', 'toto4')", function() {
            //debugger;
            spy = spy3;
            return c.bindDatasourceAttribute('source.attr3|multiply 2', 'toto4');
        }, 'event4', 'attr3', 17 / 2, 13 * 2, [[4, 4 * 2]]);

        testValues("('source.attr3|multiply 2|add 3', 'toto4')", function() {
            spy = spy3;
            return c.bindDatasourceAttribute('source.attr3|multiply 2|add 3', 'toto4');
        }, 'event4', 'attr3', (17 - 3) / 2, 13 * 2 + 3, [[4, 4 * 2 + 3]]);

        testValues("('source.attr3|multiply source.attr4|add 3', 'toto4')", function() {
            spy = spy3;
            return c.bindDatasourceAttribute('source.attr3|multiply source.attr4|add 3', 'toto4');
        }, 'event4', 'attr3', (17 - 3) / 5, 13 * 5 + 3, [
            [4, 4 * 5 + 3],
            [{ attr4: 7 }, 13 * 7 + 3],
            [{ attr3: 5, attr4: 7 }, 5 * 7 + 3],
        ]);

        testValues("('source.attr3|multiply [source.attr4|add 3]', 'toto4')", function() {
            spy = spy3;
            return c.bindDatasourceAttribute('source.attr3|multiply [source.attr4|add 3]', 'toto4');
        }, 'event4', 'attr3', 17 / (5 + 3), 13 * (5 + 3), [
            [4, 4 * (5 + 3)],
            [{ attr4: 7 }, 13 * (7 + 3)],
            [{ attr3: 5, attr4: 7 }, 5 * (7 + 3)],
        ]);

        describe('({datasource, attribute, callback, event})', function() {
            it('should do nothing if no datasource', function() {
                c.bindDatasourceAttribute({
                    datasource: undefined,
                    attribute: 'attr1',
                    setGetCallback: spy,
                    event: 'event'
                });
            });
            it('should do nothing if not a datasource', function() {
                c.bindDatasourceAttribute({
                    datasource: {},
                    attribute: 'attr1',
                    setGetCallback: spy,
                    event: 'event'
                });
            });
            it('should do nothing if unknown datasource attribute', function() {
                c.bindDatasourceAttribute({
                    datasource: datasource,
                    attribute: 'attrhgkgg',
                    setGetCallback: spy,
                    event: 'event'
                });
            });
            it('should unsubscribe if binding to another attribute', function() {
                var subscriber = c.bindDatasourceAttribute({
                    datasource: datasource,
                    attribute: 'attr1',
                    setGetCallback: spy,
                    event: 'event'
                });
                sinon.spy(subscriber, 'unbind');
                c.bindDatasourceAttribute({
                    datasource: datasource,
                    attribute: 'attr2',
                    setGetCallback: spy,
                    event: 'event'
                });
                expect(subscriber.unbind).to.have.been.caled;
            });
            it('should unsubscribe if binding to another attribute', function() {
                var subscriber = c.bindDatasourceAttribute({
                    datasource: datasource,
                    attribute: 'attr1',
                    setGetCallback: spy,
                    event: 'event'
                });
                sinon.spy(subscriber, 'unbind');
                var source2 = new WAF.DataSourceVar({
                    "variableReference": [],
                    "data-attributes": 'attr1:string,attr2:string'
                });
                c.bindDatasourceAttribute({
                    datasource: source2,
                    attribute: 'attr1',
                    setGetCallback: spy,
                    event: 'event'
                });
                expect(subscriber.unbind).to.have.been.caled;
            });
        });
    });
    describe('#bindDatasourceElement(datasource, position)', function() {
        var C, c, spy, source, data;
        beforeEach(function() {
            C = Widget.create('C');
            spy = sinon.stub();
            spy.returns('bonjour');
            C._makeBindableProperty('toto', spy, 'event');

            data = [
                { attr1: "coucou" },
                { attr1: "coucou2" },
                { attr1: "coucou3" },
            ];
            source = new WAF.DataSourceVar({
                "variableReference": data,
                "data-attributes": 'attr1:string,attr2:string'
            });

            c = new C();
            c.bindDatasourceAttribute(source, 'attr1', 'toto');
        });
        it('should get the value for this element', function() {
            c.bindDatasourceElement(source, 1);
            expect(spy).to.have.been.calledWith('coucou2');
        });
        it('should update the value for this element', function() {
            c.bindDatasourceElement(source, 1);
            source.select(1);
            source.getAttribute('attr1').setValue('lalala');
            expect(spy).to.have.been.calledWith('lalala');
        });
        it("shouldn't save the value on the current element if it's not the right element", function() {
            c.bindDatasourceElement(source, 1);
            c.fire('event');
            expect(source.getAttribute('attr1').getValue()).to.equal('coucou');
        });
        it('should save the value for this element', function() {
            c.bindDatasourceElement(source, 1);
            c.fire('event');
            source.select(1);
            expect(source.getAttribute('attr1').getValue()).to.equal('bonjour');
        });
        it("shouldn't update the value for another element", function() {
            c.bindDatasourceElement(source, 1);
            source.select(2);
            source.getAttribute('attr1').setValue('lalala');
            expect(spy).to.not.have.been.calledWith('lalala');
        });
    });
    describe('cloned object', function() {
        var C, c, spy, spy2, spy3, data, datasource;
        beforeEach(function() {
            C = Widget.create('C');
            spy = sinon.stub();
            spy.returns('bonjour');
            spy2 = sinon.spy();
            spy3 = sinon.stub();
            spy3.returns('bonjour');
            C._makeBindableProperty('toto', spy, 'event');
            C._makeBindableProperty('toto2', spy2, 'event2', spy);
            C._makeBindableProperty('toto3', spy2);
            c = new C();

            data = [ { attr1: "coucou", attr3: 13, attr4: 5 } ];
            datasource = new WAF.DataSourceVar({
                "variableReference": data,
                "data-attributes": 'attr1:string,attr2:string,attr3:number,attr4:number'
            });

            c.bindDatasourceAttribute({
                datasource: datasource,
                attribute: 'attr1'
            }, 'toto');
            c.bindDatasourceAttribute({
                datasource: datasource,
                attribute: 'attr1',
                callback: spy3
            });
        });
        it("should clone property bindings", function() {
            spy.reset();
            var c2 = c.clone();
            expect(spy).to.have.been.calledOn(c2);
        });
        it("should not interfer with master property binding", function() {
            spy.reset();
            c.clone();
            expect(spy).to.have.not.been.calledOn(c);
        });
        it("should clone callback bindings", function() {
            spy3.reset();
            var c2 = c.clone();
            expect(spy3).to.have.been.calledOn(c2);
        });
        it("should not interfer with master callback binding", function() {
            spy3.reset();
            c.clone();
            expect(spy3).to.have.not.been.calledOn(c);
        });
    });
    describe('destroyed object', function() {
        var C, c, spy, subscriber, data, datasource;
        beforeEach(function() {
            C = Widget.create('C');
            spy = sinon.stub();
            spy.returns('bonjour');
            C._makeBindableProperty('toto', spy, 'event');
            c = new C();

            data = [ { attr1: "coucou", attr3: 13, attr4: 5 } ];
            datasource = new WAF.DataSourceVar({
                "variableReference": data,
                "data-attributes": 'attr1:string,attr2:string,attr3:number,attr4:number'
            });

            subscriber = c.bindDatasourceAttribute({
                datasource: datasource,
                attribute: 'attr1'
            }, 'toto');

            spy.reset();
        });
        it('should unsubscribe from the datasource', function() {
            sinon.spy(subscriber, 'unsubscribe');
            c.destroy();
            expect(subscriber.unsubscribe).to.have.been.called;
        });
        it("shouldn't launch the callbacks", function() {
            c.destroy();
            datasource.fire('attributeChange');
            expect(spy).to.not.have.been.called;
        });
    });
});
