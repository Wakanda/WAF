/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, sinon */
var Parser = WAF.require('waf-core/binding-parser');

moduleDescribe('waf-core/binding-parser', function() {
    it('should parse simple', function() {
        expect(Parser.parse('source.attribute'))
            .to.deep.equal({
                datasource: 'source',
                attribute: 'attribute',
                formatters: []
            });
    });
    it('should parse simple no attribute', function() {
        expect(Parser.parse('source'))
            .to.deep.equal({
                datasource: 'source',
                attribute: '',
                formatters: []
            });
    });
    it('should parse', function() {
        expect(Parser.parse('source.attribute|f1 "cou\\"cou\\t"'))
            .to.deep.equal({
                datasource: 'source',
                attribute: 'attribute',
                formatters: [{
                    formatter: "f1",
                    arguments: [
                        "cou\"cou\t"
                    ]
                }]
            });
    });
    it('should parse single quote', function() {
        expect(Parser.parse("source.attribute|f1 'cou\\'cou\\t'"))
            .to.deep.equal({
                datasource: 'source',
                attribute: 'attribute',
                formatters: [{
                    formatter: "f1",
                    arguments: [
                        "cou'cou\t"
                    ]
                }]
            });
    });
    it('should parse accents', function() {
        expect(Parser.parse('source.attribute|f1 "cou\\"càéïôùou\\t"'))
            .to.deep.equal({
                datasource: 'source',
                attribute: 'attribute',
                formatters: [{
                    formatter: "f1",
                    arguments: [
                        "cou\"càéïôùou\t"
                    ]
                }]
            });
    });
    it('should parse $', function() {
        expect(Parser.parse("employee.salary|money '$'"))
            .to.deep.equal({
                datasource: 'employee',
                attribute: 'salary',
                formatters: [{
                    formatter: "money",
                    arguments: [
                        "$"
                    ]
                }]
            });
    });
    it('should parse numbers', function() {
        expect(Parser.parse('source.attribute|f1 1 1.2 -1 1e1 1.1e12 1e-1 1.1e-12'))
            .to.deep.equal({
                datasource: 'source',
                attribute: 'attribute',
                formatters: [{
                    formatter: "f1",
                    arguments: [
                        1,
                        1.2,
                        -1,
                        1e1,
                        1.1e12,
                        1e-1,
                        1.1e-12,
                    ]
                }]
            });
    });
    it('should parse chained formatters', function() {
        expect(Parser.parse('source.attribute|f1 1|f2'))
            .to.deep.equal({
                datasource: 'source',
                attribute: 'attribute',
                formatters: [{
                    formatter: "f1",
                    arguments: [ 1 ]
                },{
                    formatter: "f2",
                    arguments: []
                }]
            });
    });
    it('should parse binding argumments', function() {
        expect(Parser.parse('source.attribute|f1 coucou.toto'))
            .to.deep.equal({
                datasource: 'source',
                attribute: 'attribute',
                formatters: [{
                    formatter: "f1",
                    arguments: [{
                        datasource: 'coucou',
                        attribute: 'toto',
                        formatters: []
                    }]
                }]
            });
    });
    it('should parse binding argumments with formatters', function() {
        expect(Parser.parse('source.attribute|f1 [coucou.toto|f2]'))
            .to.deep.equal({
                datasource: 'source',
                attribute: 'attribute',
                formatters: [{
                    formatter: "f1",
                    arguments: [{
                        datasource: 'coucou',
                        attribute: 'toto',
                        formatters: [{
                            formatter: 'f2',
                            arguments: []
                        }]
                    }]
                }]
            });
    });
    it('should parse complex', function() {
        expect(Parser.parse('source.attribute|f1 "cou\\"cou\\t" 1 1.2 -1 1e1 1.1e12 1e-1 1.1e-12 | format2|toto [s.a.b.c] s.a.b.c \'aaa\\\'\' [s.a|coucou]|toto'))
            .to.deep.equal({
                datasource: 'source',
                attribute: 'attribute',
                formatters: [{
                    formatter: "f1",
                    arguments: [
                        "cou\"cou\t",
                        1,
                        1.2,
                        -1,
                        1e1,
                        1.1e12,
                        1e-1,
                        1.1e-12,
                    ]
                }, {
                    formatter: "format2",
                    arguments: [],
                }, {
                    formatter: 'toto',
                    arguments: [ {
                        datasource: 's',
                        attribute: 'a.b.c',
                        formatters: []
                    }, {
                        datasource: 's',
                        attribute: 'a.b.c',
                        formatters: []
                    }, 
                    "aaa'",
                    {
                        datasource: 's',
                        attribute: 'a',
                        formatters: [{
                            formatter: 'coucou',
                            arguments: []
                        }]
                    }]
                }, {
                    formatter: 'toto',
                    arguments: []
                }]
            });
    });
    it('should throw on empty', function() {
        expect(function() {
            Parser.parse('');
        }).to.throw;
    });
    it('should throw on non closed string', function() {
        expect(function() {
            Parser.parse('aaa|aaa "ddd');
        }).to.throw;
    });
    it('should throw on non closed string', function() {
        expect(function() {
            Parser.parse('aaa|aaa "ddd');
        }).to.throw;
    });
});
