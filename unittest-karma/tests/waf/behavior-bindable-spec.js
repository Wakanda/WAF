var Class = WAF.require('waf-core/class');
var Widget = WAF.require('waf-core/widget');
var WakError = WAF.require('waf-core/error');
/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, afterEach, sinon */

describe('waf-behavior/bindable', function() {
    describe('.makeBindableProperty(property, setGetCallback, event)', function() {
        var C, gsc;
        beforeEach(function() {
            C = Class.create();
            C.inherit('waf-behavior/bindable');
            gsc = function() {};
            C.makeBindableProperty('toto', gsc, 'event');
        });
        it('should create a bindableProperty', function() {
            expect(C).to.have.a.property('_bindableProperties').to.have.property('toto').to.have.property('event', 'event');
            expect(C).to.have.a.property('_bindableProperties').to.have.property('toto').to.have.property('setGetCallback', gsc);
        });
        it('should create an optionsParsers', function() {
            expect(C).to.have.a.property('optionsParsers').to.have.a.property('binding-toto').to.be.a('function');
        });
    });
    describe('.makeBindableProperty(setGetCallback, event)', function() {
        var C, gsc;
        beforeEach(function() {
            C = Class.create();
            C.inherit('waf-behavior/bindable');
            gsc = function() {};
            C.makeBindableProperty(gsc, 'event');
        });
        it('should create a bindableProperty', function() {
            expect(C).to.have.a.property('_bindableProperties').to.have.property('').to.have.property('event', 'event');
            expect(C).to.have.a.property('_bindableProperties').to.have.property('').to.have.property('setGetCallback', gsc);
        });
        it('should create an optionsParsers', function() {
            expect(C).to.have.a.property('optionsParsers').to.have.a.property('binding').to.be.a('function');
        });
    });
    describe('#bindDatasourceAttribute(datasource, attribute, property)', function() {
        var C, c, spy, spy2, source, data;
        beforeEach(function() {
            C = Widget.create('C');
            spy = sinon.stub();
            spy.returns('bonjour');
            spy2 = sinon.spy();
            C.makeBindableProperty('toto', spy, 'event');
            C.makeBindableProperty('toto2', spy2, 'event2', spy);
            c = new C();

            data = [ { attr1: "coucou" } ];
            source = new WAF.DataSourceVar({
                "variableReference": data,
                "data-attributes": 'attr1:string,attr2:string'
            });
        });
        it('should do nothing if no datasource', function() {
            c.bindDatasourceAttribute(undefined, 'attr1', 'toto');
        });
        it('should do nothing if not a datasource', function() {
            c.bindDatasourceAttribute({}, 'attr1', 'toto');
        });
        it('should throw an error if unknown property', function() {
            expect(function() {
                c.bindDatasourceAttribute(source, 'attr1', 'tototatat');
            }).to.throw(WakError.Bindable);
        });
        it('should do nothing if unknown datasource attribute', function() {
            c.bindDatasourceAttribute(source, 'attrjfjfjcj', 'toto');
        });
        it('should call the getter/setter when binding a source', function() {
            c.bindDatasourceAttribute(source, 'attr1', 'toto');
            expect(spy).to.have.been.calledWith('coucou');
        });
        it('should call the getter/setter when the source is updated', function() {
            c.bindDatasourceAttribute(source, 'attr1', 'toto');
            source.getAttribute('attr1').setValue('hello');
            expect(spy).to.have.been.calledWith('hello');
        });
        it('should call the getter/setter when the event is fired', function() {
            c.bindDatasourceAttribute(source, 'attr1', 'toto');
            c.fire('event');
            expect(spy).to.have.been.calledTwice;
        });
        it('should have update the source when the event is fired', function() {
            c.bindDatasourceAttribute(source, 'attr1', 'toto');
            c.fire('event');
            expect(source.getAttribute('attr1').getValue()).to.equal('bonjour');
        });

        it('should call the setter when binding a source', function() {
            c.bindDatasourceAttribute(source, 'attr1', 'toto2');
            expect(spy2).to.have.been.calledWith('coucou');
        });
        it('should call the setter when the source is updated', function() {
            c.bindDatasourceAttribute(source, 'attr1', 'toto2');
            source.getAttribute('attr1').setValue('hello');
            expect(spy2).to.have.been.calledWith('hello');
        });
        it('should call the getter when the event is fired', function() {
            c.bindDatasourceAttribute(source, 'attr1', 'toto2');
            c.fire('event2', 'toto2');
            expect(spy).to.have.been.called;
        });
        it('should have update the source when the event is fired', function() {
            c.bindDatasourceAttribute(source, 'attr1', 'toto2');
            c.fire('event2', 'toto2');
            expect(source.getAttribute('attr1').getValue()).to.equal('bonjour');
        });
        it('should return a subscriber with an unbind method', function() {
            var subscriber = c.bindDatasourceAttribute(source, 'attr1', 'toto');
            expect(subscriber).to.have.a.property('unbind').to.be.a('function');
        });
        it('should have an unbind method on the subscriber', function() {
            var subscriber = c.bindDatasourceAttribute(source, 'attr1', 'toto');
            subscriber.unbind();
            source.getAttribute('attr1').setValue('hello');
            expect(spy2).to.not.have.been.calledWith('hello');
            c.fire('event');
            expect(spy).to.have.been.calledOnce;
        });
        it('should return the same subscriber if binding to the same datasource/attribute', function() {
            var subscriber = c.bindDatasourceAttribute(source, 'attr1', 'toto');
            expect(c.bindDatasourceAttribute(source, 'attr1', 'toto')).to.equal(subscriber);
        });
        it('should unsubscribe if binding to another attribute', function() {
            var subscriber = c.bindDatasourceAttribute(source, 'attr1', 'toto');
            sinon.spy(subscriber, 'unbind');
            c.bindDatasourceAttribute(source, 'attr2', 'toto');
            expect(subscriber.unbind).to.have.been.caled;
        });
        it('should unsubscribe if binding to another attribute', function() {
            var subscriber = c.bindDatasourceAttribute(source, 'attr1', 'toto');
            sinon.spy(subscriber, 'unbind');
            var source2 = new WAF.DataSourceVar({
                "variableReference": [],
                "data-attributes": 'attr1:string,attr2:string'
            });
            c.bindDatasourceAttribute(source2, 'attr1', 'toto');
            expect(subscriber.unbind).to.have.been.caled;
        });
        it('should bind at init from options', function() {
            window.sources = { source: source };
            var w = new C({ "binding-toto": "source.attr1" });
            expect(spy).to.have.been.calledWith('coucou');
            source.getAttribute('attr1').setValue('hello');
            expect(spy).to.have.been.calledWith('hello');
            w.fire('event');
            expect(spy).to.have.been.calledThirce;
            expect(source.getAttribute('attr1').getValue()).to.equal('bonjour');
            delete window.sources;
        });
        it('should support unknown datasource at init from options', function() {
            window.sources = { source: source };
            new C({ "binding-toto": "source2.attr1" });
            delete window.sources;
        });
        it('should support scalar datasources ', function() {
            window.source2 = "coucou";
            var _source2 = new WAF.DataSourceVar({
                "binding": "source2",
                "data-source-type": "scalar"
            });
            _source2.sync();
            window.sources = { source2: _source2 };
            var w = new C({ "binding-toto": "source2" });
            expect(spy).to.have.been.calledWith('coucou');
            window.source2 = "hello";
            _source2.sync();
            expect(spy).to.have.been.calledWith('hello');
            w.fire('event');
            expect(spy).to.have.been.calledThirce;
            expect(window.source2).to.equal('bonjour');
            delete window.sources;
            delete window.source2;
        });
    });
    describe('#bindDatasourceWithCallback(datasource, attribute, setGetCallback, event, getCallback)', function() {
        var C, c, spy, spy2, source, data;
        beforeEach(function() {
            C = Widget.create('C');
            spy = sinon.stub();
            spy.returns('bonjour');
            spy2 = sinon.spy();
            c = new C();

            data = [ { attr1: "coucou" } ];
            source = new WAF.DataSourceVar({
                "variableReference": data,
                "data-attributes": 'attr1:string,attr2:string'
            });
        });
        it('should do nothing if no datasource', function() {
            c.bindDatasourceAttributeWithCallback(undefined, 'attr1', spy, 'event');
        });
        it('should do nothing if not a datasource', function() {
            c.bindDatasourceAttributeWithCallback({}, 'attr1', spy, 'event');
        });
        it('should do nothing if unknown datasource attribute', function() {
            c.bindDatasourceAttributeWithCallback(source, 'attrjfjfjcj', spy, 'event');
        });
        it('should call the getter/setter when binding a source', function() {
            c.bindDatasourceAttributeWithCallback(source, 'attr1', spy, 'event');
            expect(spy).to.have.been.calledWith('coucou');
        });
        it('should call the getter/setter when the source is updated', function() {
            c.bindDatasourceAttributeWithCallback(source, 'attr1', spy, 'event');
            source.getAttribute('attr1').setValue('hello');
            expect(spy).to.have.been.calledWith('hello');
        });
        it('should call the getter/setter when the event is fired', function() {
            c.bindDatasourceAttributeWithCallback(source, 'attr1', spy, 'event');
            c.fire('event');
            expect(spy).to.have.been.calledTwice;
        });
        it('should have update the source when the event is fired', function() {
            c.bindDatasourceAttributeWithCallback(source, 'attr1', spy, 'event');
            c.fire('event');
            expect(source.getAttribute('attr1').getValue()).to.equal('bonjour');
        });

        it('should call the setter when binding a source', function() {
            c.bindDatasourceAttributeWithCallback(source, 'attr1', spy2, 'event', spy);
            expect(spy2).to.have.been.calledWith('coucou');
        });
        it('should call the setter when the source is updated', function() {
            c.bindDatasourceAttributeWithCallback(source, 'attr1', spy2, 'event', spy);
            source.getAttribute('attr1').setValue('hello');
            expect(spy2).to.have.been.calledWith('hello');
        });
        it('should call the getter when the event is fired', function() {
            c.bindDatasourceAttributeWithCallback(source, 'attr1', spy2, 'event', spy);
            c.fire('event');
            expect(spy).to.have.been.called;
        });
        it('should have update the source when the event is fired', function() {
            c.bindDatasourceAttributeWithCallback(source, 'attr1', spy2, 'event', spy);
            c.fire('event');
            expect(source.getAttribute('attr1').getValue()).to.equal('bonjour');
        });
        it('should return a subscriber with an unbind method', function() {
            var subscriber = c.bindDatasourceAttributeWithCallback(source, 'attr1', spy, 'event');
            expect(subscriber).to.have.a.property('unbind').to.be.a('function');
        });
        it('should have an unbind method on the subscriber', function() {
            var subscriber = c.bindDatasourceAttributeWithCallback(source, 'attr1', spy, 'event');
            subscriber.unbind();
            source.getAttribute('attr1').setValue('hello');
            expect(spy2).to.not.have.been.calledWith('hello');
            c.fire('event');
            expect(spy).to.have.been.calledOnce;
        });
        it('should unsubscribe if binding to another attribute', function() {
            var subscriber = c.bindDatasourceAttributeWithCallback(source, 'attr1', spy, 'event');
            sinon.spy(subscriber, 'unbind');
            c.bindDatasourceAttributeWithCallback(source, 'attr2', spy, 'event');
            expect(subscriber.unbind).to.have.been.caled;
        });
        it('should unsubscribe if binding to another attribute', function() {
            var subscriber = c.bindDatasourceAttributeWithCallback(source, 'attr1', spy, 'event');
            sinon.spy(subscriber, 'unbind');
            var source2 = new WAF.DataSourceVar({
                "variableReference": [],
                "data-attributes": 'attr1:string,attr2:string'
            });
            c.bindDatasourceAttributeWithCallback(source2, 'attr1', spy, 'event');
            expect(subscriber.unbind).to.have.been.caled;
        });
    });
    describe('#bindDatasourceElement(datasource, position)', function() {
        var C, c, spy, source, data;
        beforeEach(function() {
            C = Widget.create('C');
            spy = sinon.stub();
            spy.returns('bonjour');
            C.makeBindableProperty('toto', spy, 'event');

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
});
