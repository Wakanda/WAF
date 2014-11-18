/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, afterEach, sinon, source, sources, testAccessor */
var Widget = WAF.require('waf-core/widget');

moduleDescribe('waf-behavior/properties-template', function() {
    describe('addProperty(datasourceProperty: undefined)', function() {
        var W, w, data;
        beforeEach(function() {
            window.sources = window.source = {};
            W = Widget.create('W');
            W.addProperty('prop', { type: 'template', templates: [
                { name: 'plop', template: '<b>{{ name }}</b>' },
                { name: 'plip', template: '<i>{{ name }}</i>' }
            ]});
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

        testAccessor({ type: 'template' }, [ 'a', 'b', 'c']);

        describe('accessor()', function() {
            it('should trigger a onDataChange', function() {
                var spy = sinon.spy();
                w.subscribe('dataChange', 'prop', spy);
                w.prop('coucou');
                expect(spy).to.have.been.called;
            });
        });

        describe('accessor.templates()', function() {
            it('should return the list of templates', function() {
                expect(w.prop.templates()).to.deep.equal([
                    { name: 'plop', template: '<b>{{ name }}</b>' },
                    { name: 'plip', template: '<i>{{ name }}</i>' }
                ]);
            });
            it('should return an empty list if no predefined templates', function() {
                W.addProperty('prop2', { type: 'template' });
                w = new W();
                expect(w.prop2.templates()).to.be.an('array').to.have.length(0);
            });
        });
        describe('accessor.select(name)', function() {
            it('should change the template', function() {
                w.prop.select('plop');
                expect(w.prop()).to.equal('<b>{{ name }}</b>');
            });
            it('should return the selected template name', function() {
                w.prop('<b>{{ name }}</b>');
                expect(w.prop.select()).to.equal('plop');
            });
            it('should return null if the current template is not predefined', function() {
                w.prop('<bjgfjgff>');
                expect(w.prop.select()).to.be.null;
            });
            it('should throw if unknown template name', function() {
                expect(function() {
                    w.prop.selct('kbhv');
                }).to.throw;
            });
        });
        describe('accessor.render(object)', function() {
            it('should return a rendered string', function() {
                w.prop('<b>{{ coucou }}</b>{{toto}}');
                expect(w.prop.render({ coucou: 'a', toto: 5 })).to.equal('<b>a</b>5');
            });
            it('should call prop.attribute() for missing values', function() {
                sinon.spy(w.prop, 'attribute');
                w.prop('<b>{{ coucou }}</b>{{toto}}');
                w.prop.render({ toto: 5 });
                expect(w.prop.attribute).to.have.been.calledWith('coucou');
                expect(w.prop.attribute).to.not.have.been.calledWith('toto');
            });
            it('should call prop.attribute() if no values', function() {
                sinon.spy(w.prop, 'attribute');
                w.prop('<b>{{ coucou }}</b>{{toto}}');
                w.prop.render();
                expect(w.prop.attribute).to.have.been.calledWith('coucou');
                expect(w.prop.attribute).to.have.been.calledWith('toto');
            });
            it('should throw if no template', function() {
                expect(function() {
                    w.prop.render({});
                }).to.throw;
            });
        });
        describe('accessor.attributes()', function() {
            it('should return the list of attributes', function() {
                w.prop('<b>{{ coucou }}</b>{{toto}}');
                expect(w.prop.attributes()).to.be.an('array').to.have.length(2);
                expect(w.prop.attributes()).to.contain('coucou');
                expect(w.prop.attributes()).to.contain('toto');
            });
            it('should return empty list if no template', function() {
                expect(w.prop.attributes()).to.be.an('array').to.have.length(0);
            });
        });
        describe('accessor.onDataChange(callback)', function() {
        });
        describe('accessor.attribute(attributeName, value)', function() {
        });
        describe('accessor.bindAttribute(attributeName, binding)', function() {
        });
    });

});
