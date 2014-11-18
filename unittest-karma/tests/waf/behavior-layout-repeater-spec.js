/* jshint strict:false,expr:true */
/* global describe, it, expect, moduleDescribe, afterEach, source, sources, beforeEach, sinon */
var Widget = WAF.require('waf-core/widget');

moduleDescribe('waf-behavior/layout/repeater', function() {
    var W, W2, w, data;
    beforeEach(function() {
        window.sources = window.source = {};
        W = Widget.create('W');
        W.inherit('waf-behavior/layout/repeater');
        W.addProperty('items', { type: 'datasource' });
        W.linkDatasourcePropertyToRepeater('items');
        w = new W();
        data = [ { toto: "coucou", tata: 13 }, { toto: "bonjour", tata: 42 }, { toto: "hello", tata: 7 } ];
        source.datasource = new WAF.DataSourceVar({
            "variableReference": data,
            "data-attributes": 'toto:string,tata:number'
        });
    });
    afterEach(function() {
        delete window.source;
        delete window.sources;
    });

    describe('.linkDatasourcePropertyToRepeater(property)', function() {
        it('should do nothing if unknown property', function() {
            W.linkDatasourcePropertyToRepeater('coucou');
            w = new W();
        });
        it('should do nothing if no property', function() {
            W.removeProperty('items');
            w = new W();
        });
    });
    describe('.repeatedWidget(widget)', function() {
        it('should return undefined', function() {
            expect(W.repeatedWidget()).to.be.undefined;
        });
        it('should save a widget', function() {
            var W2 = Widget.create('W2');
            W.repeatedWidget(W2);
            expect(W.repeatedWidget()).to.equal(W2);
        });
    });
    describe('#repeatedWidget(widget)', function() {
        it('should return undefined', function() {
            expect(w.repeatedWidget()).to.be.undefined;
        });
        it('should save a widget', function() {
            var W2 = Widget.create('W2');
            var w2 = new W2();
            w.repeatedWidget(w2);
            expect(w.repeatedWidget()).to.equal(w2);
        });
        it('should return the class widget widget', function() {
            var W2 = Widget.create('W2');
            W.repeatedWidget(W2);
            w = new W();
            expect(w.repeatedWidget()).to.be.instanceOfClass(W2);
        });
        it('should return the first attached widget', function() {
            var W2 = Widget.create('W2');
            WAF.define('W', function() {
                return { W: W, W2: W2 };
            });
            w = new W($('<div data-type="W" data-package="W"><div data-type="W2" data-package="W" id="W2a"></div><div data-type="W2" data-package="W" id="W2b"></div></div>').get(0));
            expect(w.repeatedWidget()).to.be.instanceOfClass(W2);
            expect(w.repeatedWidget().id).to.equal('W2a');
        });
        it('should remove previously attached widgets', function() {
            var W2 = Widget.create('W2');
            WAF.define('W', function() {
                return { W: W, W2: W2 };
            });
            w = new W($('<div data-type="W" data-package="W"><div data-type="W2" data-package="W" id="W2a"></div><div data-type="W2" data-package="W" id="W2b"></div></div>').get(0));
            expect(w.countWidgets()).to.equal(0);
        });
    });
    function testRepeat(name, setup) {
        describe('repeat ' + name, function() {
            it('should call getNewItem', function() {
                w = setup();
                var l = Math.min(source.datasource.length, w.items.start() + w.items.pageSize());
                expect(w.getNewItem).to.have.callCount(l - w.items.start());
                for(var i = w.items.start(); i < l; i++) {
                    expect(w.getNewItem).to.have.been.calledWith(i);
                }
            });
            it('should attach the clone to the widget', function() {
                w = setup();
                var l = Math.min(source.datasource.length, w.items.start() + w.items.pageSize());
                expect(w.countWidgets()).to.equal(l - w.items.start());
                for(var i = w.items.start(); i < l; i++) {
                    var clone = w.widget(i - w.items.start());
                    expect(clone).to.be.instanceOf(W2);
                }
            });
            it('should propagate bindDatasourceElement on clones', function() {
                w = setup();
                var l = Math.min(source.datasource.length, w.items.start() + w.items.pageSize());
                for(var i = w.items.start(); i < l; i++) {
                    var clone = w.widget(i - w.items.start());
                    expect(clone.propagate).to.have.been.calledWith('bindDatasourceElement', source.datasource, i);
                }

            });
            it('should propagate subscribe focus on clones', function() {
            });
        });
    }

    testRepeat('onChange', function() {
        W2 = Widget.create('W2');
        sinon.spy(W2.prototype, 'propagate');
        w.repeatedWidget(new W2());
        sinon.spy(w, 'getNewItem');
        w.items(source.datasource);
        return w;
    });
    testRepeat('init', function() {
        W2 = Widget.create('W2');
        sinon.spy(W2.prototype, 'propagate');
        W.repeatedWidget(W2);
        sinon.spy(W.prototype, 'getNewItem');
        w = new W({ items: 'datasource' });
        return w;
    });
    testRepeat('collectionChange', function() {
        W2 = Widget.create('W2');
        sinon.spy(W2.prototype, 'propagate');
        W.repeatedWidget(W2);
        w = new W({ items: 'datasource' });
        sinon.spy(w, 'getNewItem');
        W2.prototype.propagate.reset();
        //debugger;
        source.datasource.sync();
        return w;
    });
    testRepeat('fetch start', function() {
        W2 = Widget.create('W2');
        sinon.spy(W2.prototype, 'propagate');
        W.repeatedWidget(W2);
        //debugger;
        w = new W({ items: 'datasource' });
        sinon.spy(w, 'getNewItem');
        W2.prototype.propagate.reset();
        w.items.fetch({ start: 1 });
        return w;
    });
    testRepeat('fetch pageSize', function() {
        W2 = Widget.create('W2');
        sinon.spy(W2.prototype, 'propagate');
        W.repeatedWidget(W2);
        w = new W({ items: 'datasource' });
        sinon.spy(w, 'getNewItem');
        W2.prototype.propagate.reset();
        w.items.fetch({ pageSize: 2 });
        return w;
    });
});
