var expect = chai.expect;
chai.Assertion.addProperty('called', function() {
    var j = jasmine.getEnv().currentSpec.expect(this._obj);
    if(this.__flags.negate) j = j.not;
    j.toHaveBeenCalled();
    return this;
});

chai.Assertion.addProperty('once', function() {
    expect(this._obj.calls.length).to.equal(1);
    return this;
});

chai.Assertion.addMethod('withArguments', function() {
    var j = jasmine.getEnv().currentSpec.expect(this._obj);
    if(this.__flags.negate) j = j.not;
    j.toHaveBeenCalledWith.apply(j, arguments);
    return this;
});


var Widget = WAF.require('waf-core/widget'),
    Class  = WAF.require('waf-core/class');
WAF.require('waf-behavior/bindable');
WAF.require('waf-behavior/position');


describe('Widget', function() {
    describe('.create(name, base)', function() {
        var w = Widget.create('Plop');
        it('should create a new Widget', function() {
            expect(w).to.be.a('function');
            expect(Widget).to.have.property('Plop').to.equal(w);
        });
        it('should inherit from BaseWidget', function() {
            expect(w.supers).to.contain(Widget.BaseWidget);
        });
        it('should inherit from another base widget', function() {
            Widget.create('Plip', Widget.Plop);
            expect(Widget.Plip.supers).to.contain(Widget.Plop).to.not.contain(Widget.BaseWidget);
        });
    });

    describe('new Widget()', function() {
        var w, _w;
        beforeEach(function() {
            w = Widget.create('PlopNew');
            spyOn(w.prototype, 'changeOptions').andCallThrough();
            spyOn(w.prototype, 'initProperties').andCallThrough();
            spyOn(w.prototype, 'initWidget').andCallThrough();
            spyOn(w.prototype, 'init').andCallThrough();
            _w = new w({ toto: 'abc' });
        });
        it('should call initProperties', function() { expect(_w.initProperties).to.have.been.called; });
        it('should call initWidget',     function() { expect(_w.initWidget    ).to.have.been.called; });
        it('should call init',           function() { expect(_w.init          ).to.have.been.called; });
        it('should have created a new dom node', function() {
            expect(_w.getNode()).to.be.instanceOf(HTMLElement).to.have.property('tagName', w.tagName);
            expect(_w.getNode().getAttribute('data-type')).to.equal('PlopNew');
            expect(_w.getNode().parentNode).to.be.null;
        });
        it('should call changeOptions()', function() {
            expect(_w.changeOptions).to.have.been.called.withArguments({ toto: 'abc' });
        });
        it('should add the widget in Widget._instance', function() {
            expect(Widget._instances).to.have.property(_w.id, _w);
        });
    });

    describe('new Widget(dom_node)', function() {
        var w, _w, e;
        beforeEach(function() {
            w = Widget.create('PlopNew2');
            spyOn(w.prototype, 'getOptionsFromDomNode').andCallThrough();
            spyOn(w.prototype, 'changeOptions').andCallThrough();
            e = document.createElement('div');
            e.id = "plip";
            e.setAttribute('data-tata', '123');
            _w = new w(e, { toto: 'abc' });
        });
        it('should use the current dom node', function() {
            expect(_w.getNode()).to.equal(e);
        });
        it('should call getOptionsFromDomNode()', function() {
            expect(_w.changeOptions).to.have.been.called;
        });
        it('should call changeOptions()', function() {
            expect(_w.changeOptions).to.have.been.called.withArguments({ toto: 'abc', tata: '123' });
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
        it('should clone the widget', function() { throw 'write test'; });
    });

    describe('.inherit(klass)', function() {
        it('should replace BaseWidget', function() {
            var w = Widget.create('Plop');
            var w2 = Widget.create('Plip');
            w2.inherit(w);
            expect(Widget.Plip.supers).to.contain(Widget.Plop).to.not.contain(Widget.BaseWidget);
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
                Widget.create('PlopChildren');
                a = Class.create('a');
                a.prototype.children = function() {
                    return [1, 2];
                };
                b = Class.create('b');
                b.prototype.children = function() {
                    return [3, 4];
                };
                Widget.PlopChildren.inherit(a, b);

                w = new Widget.PlopChildren();
            });
            it('should call the children method of inherited behaviors', function() {
                spyOn(a.prototype, 'children').andCallThrough();
                spyOn(b.prototype, 'children').andCallThrough();
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
                Widget.create('PlopAllChildren');
                b = Class.create('b');
                b.prototype.allChildren = function() { return 1 };
                _b = new b();
                a = Class.create('a');
                a.prototype.children = function() {
                    return [ _b ];
                };
                Widget.PlopAllChildren.inherit(a);

                w = new Widget.PlopAllChildren();
            });
            it('should call children', function() {
                spyOn(w, 'children').andCallThrough();
                w.allChildren();
                expect(w.children).to.have.been.called;
            });
            it('should call allChildren on all children', function() {
                w.children().forEach(function(vv) {
                    spyOn(vv, 'allChildren').andCallThrough();
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
        describe('#attach(parnt, callback)', function() {
            var w, x, y;
            beforeEach(function() {
                Widget.create('Plop2');
                w = new Widget.Plop2();
                x = new Widget.Plop2();
                y = new Widget.Plop2();
                spyOn(w, 'detach');
                w.attach(x);
            });
            it('should set the new parent', function() {
                expect(w).to.have.property('parent_widget', x);
            });
            it('should not have called detach', function() {
                expect(w.detach).to.not.have.been.called;
            });
            it('should have called detach', function() {
                w.attach(y);
                expect(w.detach).to.have.been.called;
            });
        });
        describe('#detach()', function() {
            var w, x, y;
            beforeEach(function() {
                Widget.create('Plop2');
                w = new Widget.Plop2();
                x = new Widget.Plop2();
                y = { detachCallback: function() { y = true; } };
                spyOn(y, 'detachCallback');
                w.attach(x, y.detachCallback);
                w.detach();
            });
            it('should unset the parent', function() {
                expect(w).to.not.have.property('parent_widget');
            });
            it('should have called detach callback', function() {
                expect(y.detachCallback).to.have.been.called;
            });
            it('should not have called detach callback', function() {
                w.detach();
                expect(y.detachCallback).to.have.called.once;
            });
        });
        describe('#getId()', function() {
            it('should return a new unique id', function() {
                var w = new Widget.Plop();
                expect(w.getId()).not.to.equal(w.getId());
            });
            it('should start with id_prefix', function() {
                var w = new Widget.Plop();
                expect(w.getId()).to.match(new RegExp('^' + Widget.Plop.id_prefix + '[0-9]+$'));
            });
            it("even if there's an item with this id in the DOM", function() {
                var w = new Widget.Plop();
                var p = Widget.Plop.id_prefix;
                var id = p + (parseFloat(w.getId().substr(p.length)) + 1);

                var e = document.createElement('div');
                e.id = id;
                document.body.appendChild(e);

                expect(w.getId()).not.to.equal(id);

                e.parentNode.removeChild(e);
            });
        });
        describe('#getNode()', function() {
            it('should return the dom node', function() {
                var w = new Widget.Plop();
                expect(w.getNode()).to.be.an.instanceOf(HTMLElement);
                expect(w.getNode().tagName).to.equal(w.constructor.tagname.toUpperCase());
            });
        });
        describe('#createDomNode()', function() {
            var w, old_node;
            beforeEach(function() {
                w = new Widget.Plop2();
                old_node = w.getNode();
                spyOn(w, 'createChildren');
                w.createDomNode();
            });
            it('should create a new dom node', function() {
                var n = w.getNode();
                expect(n).to.not.equal(old_node);
                expect(n.getAttribute('data-type')).to.equal('Plop2');
                expect(n.id).to.equal
            });
            it('should call #createChildren()', function() {
                expect(w.createChildren).to.have.been.called;
            });

        });
        describe('#getOptionsFromDomNode()', function() {
            it('should parse options from dom node', function() {
                var w = new Widget.Plop2();
                w.getNode().setAttribute('data-plop', 'plip');
                w.getNode().setAttribute('data-plup', 'plap');
                w.getNode().setAttribute('toto', 'tata');
                var o = w.getOptionsFromDomNode();
                expect(o).to.have.property('plop', 'plip');
                expect(o).to.have.property('plup', 'plap');
                expect(o).to.not.have.property('toto');
            });
        });
        describe('#changeOption(name, value)', function() {
            var a, w;
            Widget.create('Plop3');
            Widget.Plop3.options_parsers = { plop2: function() { a = this; } };
            beforeEach(function() {
                w = new Widget.Plop3();
                w.changeOption("plop2", "coucou");
            });
            it('should set the option', function() {
                expect(w.options).to.have.property('plop2', "coucou");
            });
            it('should call the option parser', function() {
                spyOn(Widget.Plop3.options_parsers, 'plop2');
                w.changeOption("plop2", "coucou");
                expect(Widget.Plop3.options_parsers.plop2).to.have.been.called;
            });
            it('should call the option parser binded to the widget', function() {
                expect(a).to.equal(w);
            });
        });
        describe('#changeOptions(obj)', function() {
            it('should call #changeOption with each option', function() {
                var o = { a: 1, b: 2, c: 3};
                Widget.create('PlopChangeOptions');
                var w = new Widget.PlopChangeOptions();
                spyOn(w, 'changeOption').andCallThrough();
                w.changeOptions(o);
                for(var k in o) {
                    expect(w.changeOption).to.have.been.called.withArguments(k, o[k]);
                }
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
            it('should return a new widget instance', function() { throw 'write test'; });
        });
        describe('#propagate(name)', function() {
            var w, x, y;
            beforeEach(function() {
                Widget.create('PlopPropagate');
                Widget.PlopPropagate.prototype.plop = function() {};
                w = new Widget.PlopPropagate();
                x = new Widget.PlopPropagate();
                y = new Widget.PlopPropagate();
                spyOn(w, 'plop').andCallThrough();
                spyOn(x, 'propagate').andCallThrough();
                spyOn(y, 'propagate').andCallThrough();
                w.children = function() { return [x, y] };
                w.propagate('plop', 1, 2, 3);
            });

            it('should call name on the current widget', function() {
                expect(w.plop).to.have.been.called.withArguments(1, 2, 3);
            });
            it('should call propagete on all children', function() {
                w.children().forEach(function(x) {
                    expect(x.propagate).to.have.been.called.withArguments('plop', 1, 2, 3);
                });
            });
        });
    });

    describe('.get(node_or_id)', function() {
    });

    describe('.instance(name, node, options)', function() {
    });

    describe('.instanceFromDom(node)', function() {
    });

    describe('.isWidget(obj, klass)', function() {
    });

    describe('.default_behavior', function() {
    });


});
        
