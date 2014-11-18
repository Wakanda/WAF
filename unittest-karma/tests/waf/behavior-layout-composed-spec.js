var expect = chai.expect;

var Widget   = WAF.require('waf-core/widget'),
    Behavior = WAF.require('waf-core/behavior'),
    WakError = WAF.require('waf-core/error'),
    Class    = WAF.require('waf-core/class');

moduleDescribe('waf-behavior/layout/composed', function() {


    describe('#setPart(name, widget)', function() {
        var c, w1, w2;
        beforeEach(function() {
            var CompTest = Widget.create('CompTest');
            CompTest.inherit(WAF.require('waf-behavior/layout/composed'));
            var StyleWidget = Widget.create('StyleWidget');
            c = new CompTest();
            w1 = new StyleWidget();
            w2 = new StyleWidget();
        });
        it('should attach the widget', function() {
            c.setPart('plop', w1);
            expect(c.children()).to.contain(w1);
            expect(c.getPart('plop')).to.equal(w1);
        });
        it('shoudl call attach on the attached widget', function() {
            sinon.spy(w1, '_attach');
            c.setPart('plop', w1);
            expect(w1._attach).to.have.been.called;
            expect(w1.parentWidget).to.equal(c);
        });
        it('shoudl detach the previous widget', function() {
            sinon.spy(w1, '_detach');
            c.setPart('plop', w1);
            c.setPart('plop', w2);
            expect(w1._detach).to.have.been.called;
            expect(w1.parentWidget).to.be.undefined;
        });
        it('should remove the widget if called without widget', function() {
            sinon.spy(w1, '_detach');
            c.setPart('plop', w1);
            c.setPart('plop');
            expect(w1._detach).to.have.been.called;
            expect(w1.parentWidget).to.be.undefined;
        });
        it('should throw an error if the part doesn\'t exists and runtime_part_create is false', function() {
            return; //TODO
            c.changeOption('runtime_part_create');
            expect(function() { c.setPart('plop'); }).to.throw(new WakError.LayoutComposed);
        });
        it('should attach the dom node', function() {
            c.setPart('plop', w1);
            expect($(c.node).find('*').toArray()).to.contain(w1.node);
        });
    });
    describe('#getPart(name)', function() {
        var c, w1;
        beforeEach(function() {
            var CompTest = Widget.create('CompTest');
            CompTest.inherit(WAF.require('waf-behavior/layout/composed'));
            var StyleWidget = Widget.create('StyleWidget');
            c = new CompTest();
            w1 = new StyleWidget();
            c.setPart('plop', w1);
            c.setPart('plup');
        });
        it('should return the widget', function() {
            expect(c.getPart('plop')).to.equal(w1);
        });
        it('should throw an error when the part doesn\'t exists', function() {
            expect(function() { c.getPart('plip'); }).to.throw(new WakError.LayoutComposed());
        });
        it('should return undefined if no widget is attached to this part', function() {
            expect(c.getPart('plup')).to.be.undefined;
        });
    });
    describe('#removePart(name)', function() {
        var c, w1;
        beforeEach(function() {
            var CompTest = Widget.create('CompTest');
            CompTest.inherit(WAF.require('waf-behavior/layout/composed'));
            var StyleWidget = Widget.create('StyleWidget');
            c = new CompTest();
            w1 = new StyleWidget();
            c.setPart('plop', w1);
            c.setPart('plup');
        });
        it('should call detach on the widget if it exists', function() {
            sinon.spy(w1, '_detach');
            c.removePart('plop');
            expect(w1._detach).to.have.been.called;
        });
        it('should remove a part', function() {
            c.removePart('plup');
            expect(function() { c.getPart('plup'); }).to.throw(new WakError.LayoutComposed);
        });
        it('should throw an error when the part doesn\'t exsts', function() {
            expect(function() { c.removePart('plip'); }).to.throw(new WakError.LayoutComposed());
        });
        it('should remove the subwidget node', function() {
            c.removePart('plop');
            expect($(c.node).find('.waf-comptest-part-plop')).to.have.length(0)
        });
    });
    describe('#getParts()', function() {
        var c, w1, w2;
        beforeEach(function() {
            var CompTest = Widget.create('CompTest');
            CompTest.inherit(WAF.require('waf-behavior/layout/composed'));
            var StyleWidget = Widget.create('StyleWidget');
            c = new CompTest();
            w1 = new StyleWidget();
            w2 = new StyleWidget();
            c.setPart('plop', w1);
            c.setPart('plip', w2);
            c.setPart('plap');
            c.setPart('plup');
            c.removePart('plap');
        });
        it('should return the list of the names of the all parts', function() {
            expect(c.getParts()).to.be.an('array').to.have.length(3).to.contain('plop').to.contain('plip').to.contain('plup');
        });
    });
    describe('#_createChildren(nosubwidget)', function() {
        it('should create all the div parts and subwidgets', function() {
            return; //TODO
        });
        it('should create all the div parts but not the subwidgets', function() {
            return; //TODO
        });
    });
    describe('#_cloneBehavior(master)', function() {
        
    });
    describe('#_initChildrenFromDom()', function() {
        
    });
    describe('#_initProperties()', function() {
        
    });
    describe('#children()', function() {
        var c, w1, w2, w3;
        beforeEach(function() {
            var CompTest = Widget.create('CompTest');
            CompTest.inherit(WAF.require('waf-behavior/layout/composed'));
            var StyleWidget = Widget.create('StyleWidget');
            c = new CompTest();
            w1 = new StyleWidget();
            w2 = new StyleWidget();
            w3 = new StyleWidget();
            c.setPart('plop', w1);
            c.setPart('plip', w2);
            c.setPart('plap', w3);
            c.setPart('plup');
            c.removePart('plap');
        });
        it('should return the list of all widgets in parts', function() {
            expect(c.children()).to.be.an('array').to.have.length(2).to.contain(w1).to.contain(w2);
        });
    });
    describe('.setPart(name, widgetclass, options)', function() {
        var StyleWidget, CompTest;
        beforeEach(function() {
            CompTest = Widget.create('CompTest');
            CompTest.inherit(WAF.require('waf-behavior/layout/composed'));
            StyleWidget = Widget.create('StyleWidget');
            WAF.define('plop', function() { return { StyleWidget: StyleWidget }; });
            CompTest.setPart('plop');
            CompTest.setPart('plip', StyleWidget, { toto: 123 });
        });
        afterEach(function() {
            delete WAF.require.modules.plop;
        });
        it('should set a part', function() {
            expect(CompTest.getParts()).to.contain('plop').to.contain('plip');
        });
        it('should create the part at instanciation', function() {
            var c = new CompTest();
            expect(function() { c.getPart('plop'); }).to.not.throw(new WakError.LayoutComposed);
            expect(function() { c.getPart('plip'); }).to.not.throw(new WakError.LayoutComposed);
        });
        it('should create the widget at instanciation', function() {
            var c = new CompTest();
            expect(c.getPart('plip')).to.be.instanceOfClass(StyleWidget);
        });
        it('should retreive the widget at instanciation from dom', function() {
            var e = document.createElement('div');
            e.id = 'toto';
            e.innerHTML = '<div class="waf-comptest-part-plop" data-type="StyleWidget" data-package="plop"></div>';
            var c = new CompTest(e);
            expect(c.getPart('plop')).to.be.instanceOfClass(StyleWidget);
        });
        it('should create the widget at instanciation from dom', function() {
            var e = document.createElement('div');
            e.id = 'toto';
            var c = new CompTest(e);
            expect(c.getPart('plip')).to.be.instanceOfClass(StyleWidget);
        });
        it('should unset widget class', function() {
            CompTest.setPart('plip');
            var c = new CompTest();
            expect(c.getPart('plip')).to.be.undefined;
        });
        it('shoudl add option for the created widget instance', function() {
            var c = new CompTest();
            expect(c.getPart('plip').options).to.have.property('toto', 123);
        });
    });
    describe('.removePart(name)', function() {
        var CompTest;
        beforeEach(function() {
            CompTest = Widget.create('CompTest');
            CompTest.inherit(WAF.require('waf-behavior/layout/composed'));
            CompTest.setPart('plop');
        });
        it('should remove a part', function() {
            CompTest.removePart('plop');
            expect(CompTest.getParts()).to.not.contain('plop');
        });
        it('should throw an error when the part doesn\'t exsts', function() {
            expect(function() { CompTest.removePart('gchvvjy'); }).to.throw(new WakError.LayoutComposed);
        });
    });
    describe('.getParts()', function() {
        it('should return the list of the names of the all parts', function() {
            var CompTest = Widget.create('CompTest');
            CompTest.inherit(WAF.require('waf-behavior/layout/composed'));
            CompTest.setPart('plop');
            CompTest.setPart('plap');
            expect(CompTest.getParts()).to.be.an('array').to.have.length(2).to.contain('plop').to.contain('plap');
            CompTest.removePart('plop');
            CompTest.removePart('plap');
        });
    });
    describe('.addProxiedMethods(behavior, part, prefix)', function() {
        var c, w1, w2, a, CompTestPB;
        beforeEach(function() {
            var CompTest = Widget.create('CompTest');
            CompTest.inherit(WAF.require('waf-behavior/layout/composed'));
            var StyleWidget = Widget.create('StyleWidget');
            CompTestPB = Widget.create('CompTestPB', CompTest);
            var spy = Behavior.create('Spy');
            spy.prototype.spy = function(a) { return a; };
            spy.prototype.spy2 = function(a) { return this; };
            var WithSpyBehavior = Widget.create('WithSpyBehavior', StyleWidget);
            WithSpyBehavior.inherit(spy);
            w1 = new WithSpyBehavior();
            w2 = new StyleWidget();
            CompTestPB.addProxiedMethods(spy, 'plop');
            CompTestPB.addProxiedMethods(spy, 'plop', 'plop');
            CompTestPB.addProxiedMethods(spy, 'plip', 'plip');
            c = new CompTestPB();
            c.setPart('plop', w1);
            c.setPart('plip', w2);
            c.setPart('plup');
        });
        it('should add the methods of the behavior', function() {
            expect(CompTestPB.prototype).to.have.property('spy').to.be.a('function');
            expect(CompTestPB.prototype).to.have.property('spy2').to.be.a('function');
        });
        it('should add the methods of the behavior with a prefix', function() {
            expect(CompTestPB.prototype).to.have.property('plopSpy').to.be.a('function');
            expect(CompTestPB.prototype).to.have.property('plopSpy2').to.be.a('function');

            expect(CompTestPB.prototype).to.have.property('plipSpy').to.be.a('function');
            expect(CompTestPB.prototype).to.have.property('plipSpy2').to.be.a('function');
        });
        it('should call the methods of the sub widget', function() {
            expect(c.spy(123)).to.equal(123);
            expect(c.spy2()).to.equal(w1);

            expect(c.plopSpy(123)).to.equal(123);
            expect(c.plopSpy2()).to.equal(w1);
        });
        it('should throw an error when the widget doesn\'t exist', function() {
            expect(function() { c.plupSpy(123); }).to.throw(new WakError.LayoutComposed);
            expect(function() { c.plupSpy2(); }).to.throw(new WakError.LayoutComposed);
        });
        it('should throw an error when the widget doesn\'t support the method', function() {
            expect(function() { c.plipSpy(123); }).to.throw(new WakError.LayoutComposed);
            expect(function() { c.plipSpy2(); }).to.throw(new WakError.LayoutComposed);
        });
    });
    describe('.addProxiedEvent(event, part, new_event)', function() {
        it('should fire event', function() {
            return; //TODO
        });
        it('should unsubscribe event on detach', function() {
            return; //TODO
        });
    });
});
