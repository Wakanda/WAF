var Widget = WAF.require('waf-core/widget');
/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, afterEach, sinon */

moduleDescribe('waf-behavior/style', function() {

    describe(".hasClass(c)", function() {
        it('should return true if widget ave the class', function() {
            var W = Widget.create('W');
            W.addClass('plop');
            expect(W.hasClass('plop')).to.be.true;
        });
        it("should return false if widget don't have the class", function() {
            var W = Widget.create('W');
            expect(W.hasClass('plop')).to.be.false;
        });
    });
    describe(".addClass(c)", function() {
        it("should add aclass to the widget instance", function() {
            var W = Widget.create('W');
            W.addClass('plop');
            var w = new W();
            expect(w.node.className).to.contain('plop');
        });
    });
    describe(".removeClass(c)", function() {
        it("should add aclass to the widget instance", function() {
            var W = Widget.create('W');
            W.addClass('plop');
            W.removeClass('plop');
            var w = new W();
            expect(w.node.className).to.not.contain('plop');
        });
    });
    describe(".addClassOption(optionName, values, _default)", function() {
        //TODO
    });
    describe("#addClass(klass, selector)", function() {
        it("should add a class", function() {
            var W = Widget.create('W');
            var w = new W();
            w.addClass('plop');
            expect(w.node.className).to.contain('plop');
        });
        it("should add a class with selector", function() {
            var W = Widget.create('W');
            var w = new W();
            w.node.innerHTML = '<div></div>';
            w.addClass('plop', '>div');
            expect(w.node.getElementsByTagName('div')[0].className).to.contain('plop');
            expect(w.node.className).to.not.contain('plop');
        });
    });
    describe("#removeClass(klass, selector)", function() {
        it("should remove a class", function() {
            var W = Widget.create('W');
            var w = new W();
            w.addClass('plop');
            w.removeClass('plop');
            expect(w.node.className).to.not.contain('plop');
        });
        it("should remove a class with selector", function() {
            var W = Widget.create('W');
            var w = new W();
            w.node.innerHTML = '<div class="plop"></div>';
            w.addClass('plop');
            w.removeClass('plop', '>div');
            expect(w.node.getElementsByTagName('div')[0].className).to.not.contain('plop');
            expect(w.node.className).to.contain('plop');
        });
    });
    describe("#hasClass(klass, selector)", function() {
        it("should return true if class", function() {
            var W = Widget.create('W');
            var w = new W();
            w.addClass('plop');
            expect(w.hasClass('plop')).to.be.true;
        });
        it("should return false if no class", function() {
            var W = Widget.create('W');
            var w = new W();
            expect(w.hasClass('plop')).to.be.false;
        });
        it("should return true if class with selector", function() {
            var W = Widget.create('W');
            var w = new W();
            w.node.innerHTML = '<div class="plop"></div>';
            expect(w.hasClass('plop')).to.be.false;
            expect(w.hasClass('plop', '>div')).to.be.true;
        });
        it("should return false if no class with selector", function() {
            var W = Widget.create('W');
            var w = new W();
            w.node.innerHTML = '<div class="plop"></div>';
            expect(w.hasClass('plop')).to.be.false;
            expect(w.hasClass('plip', '>div')).to.be.false;
        });
    });
    describe("#toggleClass(klass, selector)", function() {
        it("should add a class", function() {
            var W = Widget.create('W');
            var w = new W();
            w.toggleClass('plop');
            expect(w.node.className).to.contain('plop');
        });
        it("should add a class with selector", function() {
            var W = Widget.create('W');
            var w = new W();
            w.node.innerHTML = '<div></div>';
            w.toggleClass('plop', '>div');
            expect(w.node.getElementsByTagName('div')[0].className).to.contain('plop');
            expect(w.node.className).to.not.contain('plop');
        });
        it("should remove a class", function() {
            var W = Widget.create('W');
            var w = new W();
            w.addClass('plop');
            w.toggleClass('plop');
            expect(w.node.className).to.not.contain('plop');
        });
        it("should remove a class with selector", function() {
            var W = Widget.create('W');
            var w = new W();
            w.node.innerHTML = '<div class="plop"></div>';
            w.toggleClass('plop');
            w.toggleClass('plop', '>div');
            expect(w.node.getElementsByTagName('div')[0].className).to.not.contain('plop');
            expect(w.node.className).to.contain('plop');
        });
    });
    describe("#style(objOrName, value)", function() {
        // TODO
    });
    describe("#hide()", function() {
        it("should set style display to none", function() {
            var W = Widget.create('W');
            var w = new W();
            w.hide();
            expect(w.node.style.display).to.equal('none');
        });
    });
    describe("#show()", function() {
        it("should unset style display to none", function() {
            var W = Widget.create('W');
            var w = new W();
            w.hide();
            w.show();
            expect(w.node.style.display).to.not.equal('none');
        });
    });
    describe("#_disableBehavior()", function() {
        it("should add waf-sate-disabled", function() {
            var W = Widget.create('W');
            var w = new W();
            w.disable();
            expect(w.node.className).to.contain('waf-state-disabled');
        });
    });
    describe("#_enableBehavior()", function() {
        it("should remove waf-sate-disabled", function() {
            var W = Widget.create('W');
            var w = new W();
            w.disable();
            w.enable();
            expect(w.node.className).to.not.contain('waf-state-disabled');
        });
    });
    describe("#bindDatasourceAttributeCSS(datasource, attribute, cssProperty)", function() {
        var C, c, spy, spy2, source, data;
        beforeEach(function() {
            C = Widget.create('C');
            c = new C();

            data = [ { attr1: "50px" } ];
            source = new WAF.DataSourceVar({
                "variableReference": data,
                "data-attributes": 'attr1:string,attr2:string'
            });
        });
        it("should set the css property", function() {
            c.bindDatasourceAttributeCSS(source, 'attr1', 'width');
            expect(c.node.style.width).to.equal('50px');
        });
        it("should set the css property on update", function() {
            c.bindDatasourceAttributeCSS(source, 'attr1', 'width');
            source.getAttribute('attr1').setValue('100px');
            expect(c.node.style.width).to.equal('100px');
        });
        it("should be binded with options", function() {
            window.sources = { source: source };
            var c = new C({'binding-css': 'width:source.attr1;height:source.attr1'});
            expect(c.node.style.width).to.equal('50px');
            expect(c.node.style.height).to.equal('50px');
            delete window.sources;
        });
        it("should do nohing when binded with options to an unknown datasource", function() {
            window.sources = { source: source };
            new C({'binding-css': 'width:unknonwn.attr1;height:unknown.attr1'});
            delete window.sources;
        });
        it("should update when binded with options", function() {
            window.sources = { source: source };
            var c = new C({'binding-css': 'width:source.attr1;height:source.attr1'});
            source.getAttribute('attr1').setValue('100px');
            expect(c.node.style.width).to.equal('100px');
            expect(c.node.style.height).to.equal('100px');
            delete window.sources;
        });
        it("should return a subscriber", function() {
            var subscriber = c.bindDatasourceAttributeCSS(source, 'attr1', 'width');
            expect(subscriber).to.have.a.property('unbind').to.be.a('function');
        });
        it("should unsubscribe", function() {
            var subscriber = c.bindDatasourceAttributeCSS(source, 'attr1', 'width');
            subscriber.unbind();
            source.getAttribute('attr1').setValue('100px');
            expect(c.node.style.width).to.equal('50px');
        });
        it("should do nothing if not a datasource", function() {
            c.bindDatasourceAttributeCSS({}, 'attr1', 'width');
        });
        it("should support unknown attribute", function() {
            c.bindDatasourceAttributeCSS(source, 'attr1jftfhtc', 'width');
        });
        it("should unsubscribe previous datasource", function() {
        });
    });
    describe("#_cloneBehavior(master)", function() {
        //TODO
    });

});
