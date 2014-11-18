/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, afterEach, sinon, source, sources */
var Widget = WAF.require('waf-core/widget');

moduleDescribe('waf-behavior/properties-datasource', function() {
    var W, w, data;
    beforeEach(function() {
        window.sources = window.source = {};
        W = Widget.create('W');
        W.addProperty('items', { type: 'datasource', attributes: ['a', 'b'] });
        w = new W();
        data = [ { toto: "coucou", tata: 13 }, { toto: "bonjour", tata: 42 }, { toto: "hello", tata: 7 } ];
        source.datasource = new WAF.DataSourceVar({
            "variableReference": data,
            "data-attributes": 'toto:string,tata:number'
        });
        source.datasource2 = new WAF.DataSourceVar({
            "variableReference": [],
            "data-attributes": 'toto:string,tata:number'
        });
    });
    afterEach(function() {
        delete window.source;
        delete window.sources;
    });
    describe('.addProperty(type datasource)', function() {
        it('should understand attributes as a list of strings', function() {
            var W  = Widget.create('W', { items: Widget.property({ type: 'datasource', attributes: ['a', 'b', { name: 'c' }] }) });
            expect(W._properties.items).to.have.a.property('attributes').to.be.a('array');
            expect(W._properties.items.attributes).to.have.length(3);
            expect(W._properties.items.attributes[0]).to.be.a('object').to.have.a.property('name', 'a');
            expect(W._properties.items.attributes[1]).to.be.a('object').to.have.a.property('name', 'b');
            expect(W._properties.items.attributes[2]).to.be.a('object').to.have.a.property('name', 'c');
        });
    });
    describe('.propertyName(value)', function() {
        it('should normalize to a datasource', function() {
            w.items('datasource');
            expect(w.items()).to.equal(source.datasource);
        });
        it('should normalize to undfined if unknonw datasource name', function() {
            w.items('kbjkb');
            expect(w.items()).to.be.null;
        });
    });
    describe('#property.attributes()', function() {
        it('should return the list of attributes', function() {
            expect(w.items.attributes()).to.deep.equal([ { name: 'a' }, { name: 'b' } ]);
        });
    });
    describe('#property.mapping(map)', function() {
        it('should be undefined if no mapping', function() {
            expect(w.items.mapping()).to.be.undefined;
        });
        it('should set the mapping', function() {
            w.items.mapping({ a: 'toto', b: 'tata'});
            expect(w.items.mapping()).to.deep.equal({ a: 'toto', b: 'tata'});
        });
        it('should support mapping as options', function() {
            w = new W({ 'items-attribute-a': 'toto', 'items-attribute-b': 'tata' });
            expect(w.items.mapping()).to.deep.equal({ a: 'toto', b: 'tata'});
        });
    });
    describe('#property.attributeFor(n)', function() {
        it('should get undefined if no mapping', function() {
            expect(w.items.attributeFor('a')).to.be.undefined;
        });
        it('should get the mapping', function() {
            w.items.mapping({ a: 'toto', b: 'tata'});
            expect(w.items.attributeFor('a')).to.equal('toto');
        });
    });
    describe('#property.mapElement(element)', function() {
        it('should not map the element if no mapping', function() {
            var o = { toto: 5, tata: 6 };
            expect(w.items.mapElement(o)).to.equal(o);
        });
        it('should not map the element if mapping is 1-1', function() {
            w.items.mapping({ a: 'a', b: 'b'});
            var o = { a: 5, b: 6 };
            //expect(w.items.mapElement(o)).to.equal(o); // test this if optim
            expect(w.items.mapElement(o)).to.deep.equal(o);
        });
        it('should not map the element if no mapping', function() {
            w.items.mapping({ a: 'toto', b: 'tata'});
            var o = { toto: 5, tata: 6 };
            expect(w.items.mapElement(o)).to.deep.equal({ a: 5, b: 6 });
        });
    });
    describe('#property.getPage(options, callback, errorCallback)', function() {
        it('should return the collection if no mapping', function(done) {
            w.items(source.datasource);
            w.items.getPage(function(elements) {
                expect(elements).to.have.length(3);
                expect(elements[0]).to.have.a.property('toto', 'coucou');
                expect(elements[0]).to.have.a.property('tata', 13);
                expect(elements[1]).to.have.a.property('toto', 'bonjour');
                expect(elements[1]).to.have.a.property('tata', 42);
                expect(elements[2]).to.have.a.property('toto', 'hello');
                expect(elements[2]).to.have.a.property('tata', 7);
                done();
            });
        });
        it('should call the callback on this', function(done) {
            var spy = sinon.spy();
            w.items.getPage(function() {
                expect(this).to.equal(w);
                done();
            });
        });
        it('should return an empty list if no datasource', function(done) {
            w.items.getPage(function(elements) {
                expect(elements).to.have.length(0);
                done();
            });
        });
        it('should return the mapped collection if mapping', function(done) {
            w.items.mapping({ a: 'toto', b: 'tata'});
            w.items(source.datasource);
            w.items.getPage(function(elements) {
                expect(elements).to.deep.equal([ { a: "coucou", b: 13 }, { a: "bonjour", b: 42 }, { a: "hello", b: 7 } ]);
                done();
            });
        });
        it('should return the collection if no mapping with pageSize', function(done) {
            w.items(source.datasource);
            w.items.getPage({ pageSize: 1 }, function(elements) {
                expect(elements).to.have.length(1);
                expect(elements[0]).to.have.a.property('toto', 'coucou');
                expect(elements[0]).to.have.a.property('tata', 13);
                done();
            });
        });
        it('should return the mapped collection if mapping with pageSize', function(done) {
            w.items.mapping({ a: 'toto', b: 'tata'});
            w.items(source.datasource);
            w.items.getPage({ pageSize: 1 }, function(elements) {
                expect(elements).to.deep.equal([ { a: "coucou", b: 13 } ]);
                done();
            });
        });
        it('should return the collection if no mapping with start and pageSize', function(done) {
            w.items(source.datasource);
            w.items.getPage({ pageSize: 1, start: 1 }, function(elements) {
                expect(elements).to.have.length(1);
                expect(elements[0]).to.have.a.property('toto', 'bonjour');
                expect(elements[0]).to.have.a.property('tata', 42);
                done();
            });
        });
        it('should return the mapped collection if mapping with start and pageSize', function(done) {
            w.items.mapping({ a: 'toto', b: 'tata'});
            w.items(source.datasource);
            w.items.getPage({ pageSize: 1, start: 1 }, function(elements) {
                expect(elements).to.deep.equal([ { a: "bonjour", b: 42 } ]);
                done();
            });
        });
        it('should not change the start', function() {
            w.items(source.datasource);
            w.items.getPage({start: 123 }, function() {});
            expect(w.items.start()).to.equal(0);
        });
        it('should not change the pageSize', function() {
            w.items(source.datasource);
            w.items.getPage({pageSize: 123 }, function() {});
            expect(w.items.pageSize()).to.equal(Infinity);
        });
    });
    describe('#property.fetch() and #property.onPageChange(callback)', function() {
        var spy;
        beforeEach(function() {
            spy = sinon.spy();
        });
        it('should call the callback on first fetch', function() {
            w.items(source.datasource);
            w.items.onPageChange(spy);
            w.items.fetch();
            expect(spy).to.have.been.called;
        });
        it('should call the callback with elements', function() {
            w.items(source.datasource);
            w.items.onPageChange(spy);
            w.items.mapping({ a: 'toto', b: 'tata'});
            w.items.fetch();
            expect(spy).to.have.been.called;
            var elements = spy.lastCall.args[0];
            expect(elements).to.have.length(3);
            expect(elements[0]).to.have.a.property('a', 'coucou');
            expect(elements[0]).to.have.a.property('b', 13);
            expect(elements[1]).to.have.a.property('a', 'bonjour');
            expect(elements[1]).to.have.a.property('b', 42);
            expect(elements[2]).to.have.a.property('a', 'hello');
            expect(elements[2]).to.have.a.property('b', 7);
        });
        it('should not call the callback on fecth with same start and pageSize', function() {
            w.items(source.datasource);
            w.items.onPageChange(spy);
            w.items.fetch();
            spy.reset();
            w.items.fetch();
            expect(spy).to.not.have.been.called;
        });
        it('should call the callback if the start is different', function() {
            w.items(source.datasource);
            w.items.onPageChange(spy);
            w.items.fetch();
            spy.reset();
            w.items.fetch({start: 1});
            expect(spy).to.have.been.called;
        });
        it('should call the callback if the pageSize is different', function() {
            w.items(source.datasource);
            w.items.onPageChange(spy);
            w.items.fetch();
            spy.reset();
            w.items.fetch({pageSize: 1});
            expect(spy).to.have.been.called;
        });
        it('should save the default start and pageSize for the next getPage()', function(done) {
            w.items(source.datasource);
            w.items.mapping({ a: 'toto', b: 'tata'});
            w.items.fetch({start: 1, pageSize: 1});
            w.items.getPage({ pageSize: 1, start: 1 }, function(elements) {
                expect(elements).to.have.length(1);
                expect(elements[0]).to.have.a.property('a', 'bonjour');
                expect(elements[0]).to.have.a.property('b', 42);
                done();
            });
        });
        it('should call the callback on collection change', function() {
            w.items(source.datasource);
            w.items.onPageChange(spy);
            data.push({toto: 'hi', tata: 123});
            source.datasource.sync();
            expect(spy).to.have.been.called;
        });
        it('should call the callback if attribute change in the range', function() {
            w.items(source.datasource);
            w.items.onPageChange(spy);
            w.items.fetch({pageSize: 2});
            spy.reset();
            source.datasource.getAttribute('toto').setValue('plop');
            expect(spy).to.have.been.called;
        });
        it('should not call the callback if attribute change out of the range', function() {
            w.items(source.datasource);
            w.items.onPageChange(spy);
            w.items.fetch({start: 2, pageSize: 2});
            spy.reset();
            source.datasource.getAttribute('toto').setValue('plop');
            expect(spy).to.not.have.been.called;
        });
        it('should not call the callback if current element change', function() {
            w.items(source.datasource);
            w.items.onPageChange(spy);
            source.datasource.select(1);
            expect(spy).to.not.have.been.called;
        });
        it('should return a subscriber', function() {
            var subscriber = w.items.onPageChange(function() {});
            expect(subscriber).to.be.an.instanceOfClass('waf-core/subscriber');
        });
        it('should stop calling the callback on fetch if unsubscribe', function() {
            w.items(source.datasource);
            var subscriber = w.items.onPageChange(spy);
            subscriber.unsubscribe();
            w.items.fetch();
            expect(spy).to.not.have.been.called;
        });
        it('should stop calling the callback on attributeChange if unsubscribe', function() {
            w.items(source.datasource);
            var subscriber = w.items.onPageChange(spy);
            subscriber.unsubscribe();
            w.items.fetch({pageSize: 2});
            spy.reset();
            source.datasource.getAttribute('toto').setValue('plop');
            expect(spy).to.not.have.been.called;
        });
        it('should call the callback on this', function() {
            w.items(source.datasource);
            w.items.onPageChange(spy);
            w.items.fetch();
            expect(spy).to.have.been.calledOn(w);
        });
    });
    describe('#property.start()', function() {
        it('should return the last value', function() {
            w.items(source.datasource);
            w.items.fetch({start: 123 });
            expect(w.items.start()).to.equal(123);
        });
    });
    describe('#property.pageSize()', function() {
        it('should return the last value', function() {
            w.items(source.datasource);
            w.items.fetch({pageSize: 123 });
            expect(w.items.pageSize()).to.equal(123);
        });
    });
    describe('#property.subscribe(event, target, callback)', function() {
        it('should call subscribe on the datasource', function() {
            sinon.spy(source.datasource, 'subscribe');
            w.items(source.datasource);
            var cb = function() {};
            w.items.subscribe('event', 'target', cb, w, '');
            expect(source.datasource.subscribe).to.have.been.calledWith('event', 'target', cb, w, '');
        });
        it('should call subscribe on the next datasource', function() {
            sinon.spy(source.datasource, 'subscribe');
            var cb = function() {};
            w.items.subscribe('event', 'target', cb, w, '');
            w.items(source.datasource);
            expect(source.datasource.subscribe).to.have.been.calledWith('event', 'target', cb, w, '');
        });
        it('should unsubscribe the previous datasource when changing datasource', function() {
            var spy = sinon.spy();
            w.items(source.datasource);
            w.items.subscribe('event', spy);
            w.items(source.datasource2);
            source.datasource.fire('event');
            expect(spy).to.have.not.been.called;
        });
        it('should unsubscribe the previous datasource when changing to no datasource', function() {
            var spy = sinon.spy();
            w.items(source.datasource);
            w.items.subscribe('event', spy);
            w.items(undefined);
            source.datasource.fire('event');
            expect(spy).to.have.not.been.called;
        });
        it('should return a subscriber', function() {
            var subscriber = w.items.subscribe('event', function() {});
            expect(subscriber).to.be.an.instanceOfClass('waf-core/subscriber');
        });
        it('should unsubscribe of the datasource', function() {
            var spy = sinon.spy();
            w.items(source.datasource);
            var subscriber = w.items.subscribe('event', spy);
            subscriber.unsubscribe();
            source.datasource.fire('event');
            expect(spy).to.have.not.been.called;
        });
        it('should no longer subscribe to the next datasource', function() {
            sinon.spy(source.datasource, 'subscribe');
            var subscriber = w.items.subscribe('event', function() {});
            subscriber.unsubscribe();
            w.items(source.datasource);
            expect(source.datasource.subscribe).to.not.have.been.called;
        });
        it('should pause the subscriber', function() {
            var spy = sinon.spy();
            w.items(source.datasource);
            var subscriber = w.items.subscribe('event', spy);
            subscriber.pause();
            source.datasource.fire('event');
            expect(spy).to.not.have.been.called;
        });
        it('should resume the subscriber', function() {
            var spy = sinon.spy();
            w.items(source.datasource);
            var subscriber = w.items.subscribe('event', spy);
            subscriber.pause();
            source.datasource.fire('event');
            expect(spy).to.not.have.been.called;
            subscriber.resume();
            source.datasource.fire('event');
            expect(spy).to.have.been.called;
        });
        it('should keep paused state of the subscriber after changing the datasource', function() {
            var spy = sinon.spy();
            var subscriber = w.items.subscribe('event', spy);
            subscriber.pause();
            w.items(source.datasource);
            source.datasource.fire('event');
            expect(spy).to.not.have.been.called;
        });
        it('should keep resumed state of the subscriber after changing the datasource', function() {
            var spy = sinon.spy();
            var subscriber = w.items.subscribe('event', spy);
            subscriber.pause();
            subscriber.resume();
            w.items(source.datasource);
            source.datasource.fire('event');
            expect(spy).to.have.been.called;
        });
    });
    describe('#property.onCollectionChange(callback, errorCallback)', function() {
    });
    describe('static binding', function() {
        it('should create and bind an array datasource', function() {
            w = new W({'static-items': '[]'});
            expect(w.items()).to.be.instanceOfClass(WAF.DataSourceVar);
        });
        it('should contain the datas', function(done) {
            w = new W({'static-items': JSON.stringify([
                { a: 'coucou', b: 13 },
                { a: 'bonjour', b: 42 },
                { a: 'hello', b: 7 }
            ])});
            w.items.getPage(function(elements) {
                expect(elements).to.have.length(3);
                expect(elements[0]).to.have.a.property('a', 'coucou');
                expect(elements[0]).to.have.a.property('b', 13);
                expect(elements[1]).to.have.a.property('a', 'bonjour');
                expect(elements[1]).to.have.a.property('b', 42);
                expect(elements[2]).to.have.a.property('a', 'hello');
                expect(elements[2]).to.have.a.property('b', 7);
                done();
            });
        });
        it('should do nothing if static is empty', function() {
            w = new W({'static-items': ''});
            expect(w.items()).to.be.null;
        });
    });
});

