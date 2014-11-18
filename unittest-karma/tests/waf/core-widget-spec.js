/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, afterEach, sinon */

var Widget = WAF.require('waf-core/widget'),
    WakError  = WAF.require('waf-core/error'),
    Class  = WAF.require('waf-core/class');


describe('Widget', function() {
    describe('.create(name, base)', function() {
        var w = Widget.create('Plop');
        it('should create a new Widget', function() {
            expect(w).to.be.a('function');
        });
        it('should inherit from BaseWidget', function() {
            expect(w.supers).to.contain(Widget.BaseWidget);
        });
        it('should inherit from another base widget', function() {
            var Plip = Widget.create('Plip', w);
            expect(Plip.supers).to.contain(w).to.not.contain(Widget.BaseWidget);
        });
    });
    describe('.create(name, proto)', function() {
        it('should call _upgradeWidget()', function() {
            sinon.spy(Widget, '_upgradeWidget');
            var o = {};
            var w = Widget.create('w', o);
            expect(Widget._upgradeWidget).to.have.been.calledWith(w, o);
            Widget._upgradeWidget.restore();
        });
    });
    describe('._upgradeWidget(_class, proto)', function() {
        var w;
        beforeEach(function() {
            w =Widget.create('w');
            sinon.spy(w, 'addProperty');
        });
        it('should call addProperty', function() {
            var o = {};
            Widget._upgradeWidget(w, {
                prop1: Widget.property(o),
                prop2: Widget.property()
            });
            expect(w.addProperty).to.have.been.calledWith('prop1', o);
            expect(w.addProperty).to.have.been.calledWith('prop2', undefined);
            var _w = new w();
            expect(_w).to.have.a.property('prop1').to.be.a('function');
            expect(_w).to.have.a.property('prop2').to.be.a('function');
        });
        it('should add methods', function() {
            var m1 = function() {},
                m2 = function() {};
            Widget._upgradeWidget(w, { m1: m1, m2: m2 });
            expect(w.prototype).to.have.a.property('m1', m1);
            expect(w.prototype).to.have.a.property('m2', m2);
        });
        it('should set tagName', function() {
            Widget._upgradeWidget(w, { tagName: 'input' });
            expect(w.tagName).to.equal('input');
        });
    });

    describe('new Widget()', function() {
        var w, _w;
        beforeEach(function() {
            w = Widget.create('PlopNew');
            sinon.spy(w.prototype, 'changeOptions');
            sinon.spy(w.prototype, '_initProperties');
            sinon.spy(w.prototype, '_initWidget');
            sinon.spy(w.prototype, 'init');
            _w = new w({ toto: 'abc' });
        });
        it('should call _initProperties', function() { expect(_w._initProperties).to.have.been.called; });
        it('should call _initWidget',     function() { expect(_w._initWidget    ).to.have.been.called; });
        it('should call init',           function() { expect(_w.init          ).to.have.been.called; });
        it('should have created a new dom node', function() {
            expect(_w.getNode()).to.be.instanceOf(HTMLElement).to.have.property('tagName', w.tagName.toUpperCase());
            expect(_w.getNode().getAttribute('data-type')).to.equal('PlopNew');
            expect(_w.getNode().parentNode).to.be.null;
        });
        it('should call changeOptions()', function() {
            expect(_w.changeOptions).to.have.been.calledWith({ toto: 'abc' });
        });
        it('should add the widget in Widget._instance', function() {
            expect(Widget._instances).to.have.property(_w.id, _w);
        });
    });

    describe('new Widget(dom_node)', function() {
        var w, _w, e;
        beforeEach(function() {
            w = Widget.create('PlopNew2');
            sinon.spy(w.prototype, '_getOptionsFromDomNode');
            sinon.spy(w.prototype, 'changeOptions');
            e = document.createElement('div');
            e.id = "plip";
            e.setAttribute('data-tata', '123');
            _w = new w(e, { toto: 'abc' });
        });
        it('should use the current dom node', function() {
            expect(_w.getNode()).to.equal(e);
        });
        it('should call _getOptionsFromDomNode()', function() {
            expect(_w.changeOptions).to.have.been.called;
        });
        it('should call changeOptions()', function() {
            expect(_w.changeOptions).to.have.been.calledWith({ toto: 'abc', tata: '123' });
        });
        it('should add the widget in Widget._instance', function() {
            expect(Widget._instances).to.have.property(_w.id, _w);
        });
    });

    describe('new Widget(id)', function() {
        var w, _w, e;
        beforeEach(function() {
            w = Widget.create('PlopNew2');
            e = document.createElement('div');
            e.id = "plip";
            document.body.appendChild(e);
            _w = new w('plip');
        });
        afterEach(function() {
            document.body.removeChild(e);
        });
        it('should use the current dom node', function() {
            expect(_w.getNode()).to.equal(e);
        });
    });

    describe('new Widget(widget) (cloning)', function() {
        it('should clone the widget', function() {
            // TODO
        });
    });

    describe('.inherit(klass)', function() {
        it('should replace BaseWidget', function() {
            var w = Widget.create('Plop');
            var w2 = Widget.create('Plip');
            w2.inherit(w);
            expect(w2.supers).to.contain(w).to.not.contain(Widget.BaseWidget);
        });
        it("shouldn't have inherited from another behavior first", function() {
            var w = Widget.create('Plop');
            var w2 = Widget.create('Plip');
            w2.inherit(Class.create('a'));
            expect(function() { w2.inherit(w); }).to.throw(WakError.Inherit);
        });
        it("shouldn't have inherited from another behavior first", function() {
            var w = Widget.create('Plop');
            var w2 = Widget.create('Plip');
            expect(function() { w2.inherit(Class.create('a'), w); }).to.throw(WakError.Inherit);
        });
    });

    describe('.BaseWidget', function() {

        describe('#children()', function() {
            var a, b, w;
            beforeEach(function() {
                var PlopChildren = Widget.create('PlopChildren');
                a = Class.create('a');
                a.prototype.children = function() {
                    return [1, 2];
                };
                b = Class.create('b');
                b.prototype.children = function() {
                    return [3, 4];
                };
                PlopChildren.inherit(a, b);

                w = new PlopChildren();
            });
            it('should call the children method of inherited behaviors', function() {
                sinon.spy(a.prototype, 'children');
                sinon.spy(b.prototype, 'children');
                w.children();
                expect(a.prototype.children).to.have.been.called;
                expect(b.prototype.children).to.have.been.called;
            });
            it('shoud concatenate the results', function() {
                expect(w.children()).to.be.an('array').to.have.length(4).to.contain(1).to.contain(2).to.contain(3).to.contain(4);
            });
        });
        describe('#allChildren()', function() {
            var a, b, _b, w;
            beforeEach(function() {
                var PlopAllChildren = Widget.create('PlopAllChildren');
                b = Class.create('b');
                b.prototype.allChildren = function() { return 1; };
                _b = new b();
                a = Class.create('a');
                a.prototype.children = function() {
                    return [ _b ];
                };
                PlopAllChildren.inherit(a);

                w = new PlopAllChildren();
            });
            it('should call children', function() {
                sinon.spy(w, 'children');
                w.allChildren();
                expect(w.children).to.have.been.called;
            });
            it('should call allChildren on all children', function() {
                w.children().forEach(function(vv) {
                    sinon.spy(vv, 'allChildren');
                });
                w.allChildren();
                w.children().forEach(function(vv) {
                    expect(vv.allChildren).to.have.been.called;
                });
            });
            it('should concatenate the results', function() {
                expect(w.allChildren()).to.be.an('array').to.contain(_b).to.contain(1);
            });
        });
        describe('#_attach(parnt, callback)', function() {
            var w, x, y;
            beforeEach(function() {
                var Plop2 = Widget.create('Plop2');
                w = new Plop2();
                x = new Plop2();
                y = new Plop2();
                w._detach = sinon.spy();
                w._attach(x);
            });
            it('should set the new parent', function() {
                expect(w).to.have.property('parentWidget', x);
            });
            it('should not have called _detach', function() {
                expect(w._detach).to.not.have.been.called;
            });
            it('should have called _detach', function() {
                w._attach(y);
                expect(w._detach).to.have.been.called;
            });
        });
        describe('#_detach()', function() {
            var w, x, y;
            beforeEach(function() {
                var Plop2 = Widget.create('Plop2');
                w = new Plop2();
                x = new Plop2();
                y = { _detachCallback: function() { y = true; } };
                y._detachCallback = sinon.spy();
                w._attach(x, y._detachCallback);
                w._detach();
            });
            it('should unset the parent', function() {
                expect(w).to.not.have.property('parentWidget');
            });
            it('should have called _detach callback', function() {
                expect(y._detachCallback).to.have.been.called;
            });
            it('should not have called _detach callback', function() {
                w._detach();
                expect(y._detachCallback).to.have.calledOnce;
            });
        });
        describe('#_getId()', function() {
            var Plop = Widget.create('Plop');
            it('should return a new unique id', function() {
                var w = new Plop();
                expect(w._getId()).not.to.equal(w._getId());
            });
            it('should start with idPrefix', function() {
                var w = new Plop();
                expect(w._getId()).to.match(new RegExp('^' + Plop.idPrefix + '[0-9]+$'));
            });
            it("even if there's an item with this id in the DOM", function() {
                var w = new Plop();
                var p = Plop.idPrefix;
                var id = p + (parseFloat(w._getId().substr(p.length)) + 1);

                var e = document.createElement('div');
                e.id = id;
                document.body.appendChild(e);

                expect(w._getId()).not.to.equal(id);

                e.parentNode.removeChild(e);
            });
        });
        describe('#getNode()', function() {
            var Plop = Widget.create('Plop');
            it('should return the dom node', function() {
                var w = new Plop();
                expect(w.getNode()).to.be.an.instanceOf(HTMLElement);
                expect(w.getNode().tagName).to.equal(w.constructor.tagName.toUpperCase());
            });
        });
        describe('#_createDomNode()', function() {
            var w, oldNode;
            var Plop2 = Widget.create('Plop2');
            beforeEach(function() {
                w = new Plop2();
                oldNode = w.getNode();
                w._createChildren = sinon.spy();
                w._createDomNode();
            });
            it('should create a new dom node', function() {
                var n = w.getNode();
                expect(n).to.not.equal(oldNode);
                expect(n.getAttribute('data-type')).to.equal('Plop2');
                expect(n.id).to.equal;
            });
            it('should call #_createChildren()', function() {
                expect(w._createChildren).to.have.been.called;
            });

        });
        describe('#_getOptionsFromDomNode()', function() {
            var Plop2 = Widget.create('Plop2');
            it('should parse options from dom node', function() {
                var w = new Plop2();
                w.getNode().setAttribute('data-plop', 'plip');
                w.getNode().setAttribute('data-plup', 'plap');
                w.getNode().setAttribute('toto', 'tata');
                var o = w._getOptionsFromDomNode();
                expect(o).to.have.property('plop', 'plip');
                expect(o).to.have.property('plup', 'plap');
                expect(o).to.not.have.property('toto');
            });
        });
        describe('#changeOption(name, value)', function() {
            var a, w;
            var Plop3 = Widget.create('Plop3');
            Plop3.optionsParsers = { plop2: function() { a = this; } };
            sinon.spy(Plop3.optionsParsers, 'plop2');
            beforeEach(function() {
                w = new Plop3();
                w.changeOption("plop2", "coucou");
            });
            it('should set the option', function() {
                expect(w.options).to.have.property('plop2', "coucou");
            });
            it('should call the option parser', function() {
                w.changeOption("plop2", "coucou");
                expect(Plop3.optionsParsers.plop2).to.have.been.called;
            });
            it('should call the option parser binded to the widget', function() {
                expect(a).to.equal(w);
            });
        });
        describe('#changeOptions(obj)', function() {
            it('should call #changeOption with each option', function() {
                var o = { a: 1, b: 2, c: 3};
                var PlopChangeOptions = Widget.create('PlopChangeOptions');
                var w = new PlopChangeOptions();
                sinon.spy(w, 'changeOption');
                w.changeOptions(o);
                for(var k in o) {
                    expect(w.changeOption).to.have.been.calledWith(k, o[k]);
                }
            });
            it('should normalize options to lowerCase', function() {
                var o = { aA: 1 };
                var PlopChangeOptions = Widget.create('PlopChangeOptions');
                var w = new PlopChangeOptions();
                w.changeOptions(o);
                expect(o).to.have.a.property('aa', 1);
                expect(o).to.not.have.a.property('aA');
            });
        });
        describe('#destroy()', function() {
        });
        describe('#disable(state)', function() {
        });
        describe('#enable(state)', function() {
        });
        describe('#disabled()', function() {
        });
        describe('#clone()', function() {
            it('should return a new widget instance', function() {
                //TODO
            });
        });
        describe('#propagate(name)', function() {
            var w, x, y;
            beforeEach(function() {
                var PlopPropagate = Widget.create('PlopPropagate');
                PlopPropagate.prototype.plop = function() {};
                w = new PlopPropagate();
                x = new PlopPropagate();
                y = new PlopPropagate();
                sinon.spy(w, 'plop');
                sinon.spy(x, 'propagate');
                sinon.spy(y, 'propagate');
                w.children = function() { return [x, y]; };
                w.propagate('plop', 1, 2, 3);
            });

            it('should call name on the current widget', function() {
                expect(w.plop).to.have.been.calledWith(1, 2, 3);
            });
            it('should call propagete on all children', function() {
                w.children().forEach(function(x) {
                    expect(x.propagate).to.have.been.calledWith('plop', 1, 2, 3);
                });
            });
        });
    });

    describe('.get(node_or_id)', function() {
    });

    describe('.instance(name, node, options)', function() {
    });

    describe('.instanceFromDom(node)', function() {
        var W1, W2, W3;
        function h(html) {
            return $(html).get(0);
        }
        beforeEach(function() {
            W1 = Widget.create('W1');
            W2 = Widget.create('W2');
            W3 = Widget.create('W3');
            W3.W4 = Widget.create('W4');
            WAF.define('W1', function() {
                return W1;
            });
            WAF.define('p2', function() {
                return { W2: W2 };
            });
            WAF.define('W3', function() {
                return W3;
            });
        });
        afterEach(function() {
            delete WAF.require.modules.W1;
            delete WAF.require.modules.p2;
            delete WAF.require.modules.W3;
            delete Widget._instances.w1;
        });
        it('should return a widget with package and type', function() {
            expect(Widget.instanceFromDom(h('<div id="w1" data-type="W1" data-package="W1"></div>')))
                .to.be.instanceOfClass(W1);
        });
        it('should return a widget with package and type from multiwidget package', function() {
            expect(Widget.instanceFromDom(h('<div id="w1" data-type="W2" data-package="p2"></div>')))
                .to.be.instanceOfClass(W2);
        });
        it('should return a sub widget with package and type', function() {
            expect(Widget.instanceFromDom(h('<div id="w1" data-type="W4" data-package="W3"></div>')))
                .to.be.instanceOfClass(W3.W4);
        });
        it('should not return a widget with only type', function() {
            expect(Widget.instanceFromDom(h('<div id="w1" data-type="W1"></div>')))
                .to.be.undefined;
        });
        it('should return an old-widget if a node contain a widget', function() {
            expect(Widget.instanceFromDom(h('<div><div id="w1" data-type="W1" data-package="W1"></div></div>')))
                .to.be.instanceOfClass('waf-widget/oldwidget');
        });
        it('shoudl throw if the widget is already instanciated', function() {
            expect(Widget.instanceFromDom(h('<div id="w1" data-type="W1" data-package="W1"></div>')))
                .to.be.instanceOfClass(W1);
            expect(function() {
                Widget.instanceFromDom(h('<div id="w1" data-type="W1" data-package="W1"></div>'));
            }).to.be.throw(WakError.Exists);
        });
        it("should return undefined if the package doesn't exists", function() {
            expect(Widget.instanceFromDom(h('<div id="w1" data-type="W1" data-package="W1hdhdd"></div>')))
                .to.be.undefined;
        });
        it('should return undefined if the widget is not found in a multiwidget package', function() {
            expect(Widget.instanceFromDom(h('<div id="w1" data-type="W5" data-package="p2"></div>')))
                .to.be.undefined;
        });
        it('should return undefined if the subwidget is not found', function() {
            expect(Widget.instanceFromDom(h('<div id="w1" data-type="W5" data-package="W3"></div>')))
                .to.be.undefined;
        });
    });

    describe('.isWidget(obj, klass)', function() {
    });

    describe('.default_behavior', function() {
    });

    describe('.property(options)', function() {
        it('should return a object with options', function() {
            var a = {};
            expect(Widget.property(a)).to.have.a.property('options', a);
        });
    });


});
        
