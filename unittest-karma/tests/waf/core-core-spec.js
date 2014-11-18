/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, afterEach, sinon */

moduleDescribe('waf-core/core', function() {
    describe("WAF.extend()", function() {
        var object1,
            object2,
            object3,
            original1,
            original2,
            original3;

        beforeEach(function() {
            // {"apple":0,"banana":{"weight":52,"price":100},"cherry":97}
            object1 = original1 = {
                apple: 0,
                banana: {
                    weight: 52,
                    price: 100,
                    flags: [ 'a' ]
                },
                cherry: 97
            };
            
            // {"banana":{"price":200},"durian":100}
            object2 = original2 = {
                banana: {
                    price: 200,
                    flags: [ 'b', 'c' ]
                },
                durian: 100
            };
            
            // {"car":"dolorean"}
            object3 = original3 = {
                car: 'dolorean'
            };
        });

        afterEach(function() {
            object1 = object2 = object3 = original1 = original2 = original3 = null;
        });

        it("simple test, no deep copy", function() {
            var res = WAF.extend(object1, object2);
            
            // first parameter is modified
            expect(original1).to.equal(object1);
            
            expect(res).to.equal(original1);
            
            // other parameters are untouched
            expect(JSON.stringify(original2)).to.equal('{"banana":{"price":200,"flags":["b","c"]},"durian":100}');
                
            expect(JSON.stringify(original1)).to.equal('{"apple":0,"banana":{"price":200,"flags":["b","c"]},"cherry":97,"durian":100}');
        });
        
        it("simple test, no deep copy, new target", function() {
            var newTarget = {};
            
            var res = WAF.extend(newTarget, object1, object2);
            
            // second parameter is not modified
            expect(original1).to.equal(object1);
            expect(original1).not.to.equal(newTarget);
            
            expect(res).to.equal(newTarget);
            
            // other parameters are untouched
            expect(JSON.stringify(original2)).to.equal('{"banana":{"price":200,"flags":["b","c"]},"durian":100}');
                
            expect(JSON.stringify(newTarget)).to.equal('{"apple":0,"banana":{"price":200,"flags":["b","c"]},"cherry":97,"durian":100}');
            
            expect(JSON.stringify(original1)).to.equal('{"apple":0,"banana":{"weight":52,"price":100,"flags":["a"]},"cherry":97}');        
        });
        
        it("deep copy", function() {        
            var res = WAF.extend(true, object1, object2);
            
            // first parameter is modified
            expect(original1).to.equal(object1);
            
            expect(res).to.equal(object1);
            
            // other parameters are untouched
            expect(JSON.stringify(original2)).to.equal('{"banana":{"price":200,"flags":["b","c"]},"durian":100}');
            original2.banana.price = 100;
            expect(JSON.stringify(original1)).to.equal('{"apple":0,"banana":{"weight":52,"price":200,"flags":["b","c"]},"cherry":97,"durian":100}');
        });
        
        it("deep copy, new target", function() {        
            var res = WAF.extend(true, {}, object2);
            
            // first parameter is modified
            expect(original2).to.equal(object2);
            
            expect(res).not.to.equal(object2);

            res.banana.flags.push('plop');
            
            // other parameters are untouched
            expect(JSON.stringify(res)).to.equal('{"banana":{"price":200,"flags":["b","c","plop"]},"durian":100}');
            res.banana.price = 100;
            expect(JSON.stringify(original2)).to.equal('{"banana":{"price":200,"flags":["b","c"]},"durian":100}');
                
        });
        
        it("null/undefined parameters should not be merged", function() {
            var res = WAF.extend(object1, undefined, object2, null, object3);
            
            expect(JSON.stringify(object1)).to.equal('{"apple":0,"banana":{"price":200,"flags":["b","c"]},"cherry":97,"durian":100,"car":"dolorean"}');
            
            expect(object1).to.equal(res);
            
            expect(original2).to.equal(object2);
            expect(original3).to.equal(object3);
        });
        
        it("first parameter is null/undefined", function() {
            var res = WAF.extend(null, undefined, object2, null, object3);
            
            expect(JSON.stringify(object2)).to.equal('{"banana":{"price":200,"flags":["b","c"]},"durian":100,"car":"dolorean"}');
            
            expect(object2).to.equal(res);
            
            expect(original3).to.equal(object3);
        });    

    });

    describe('WAF.parseQueryString(string)', function() {
        // only the query part
        var result = {a:undefined, b:'c'};
        it('should support empty query', function() {
            expect(WAF.parseQueryString('')).to.deep.equal({});
        });
        it('should support empty query with URL', function() {
            expect(WAF.parseQueryString('foo?')).to.deep.equal({});
        });
        it('should support query with URL', function() {
            expect(WAF.parseQueryString('foo?a&b=c')).to.deep.equal(result);
        });
        it('should support query with URL and fragment', function() {
            expect(WAF.parseQueryString('foo?a&b=c#fragment')).to.deep.equal(result);
        });
    
        it('should support key without value', function() {
            expect(WAF.parseQueryString('a')).to.deep.equal({a:undefined});
        });
        it('should support empty key', function() {
            expect(WAF.parseQueryString('a=b&=c')).to.deep.equal({a:'b'});
        });
        it('should support empty value', function() {
            expect(WAF.parseQueryString('a=b&c=')).to.deep.equal({a:'b', c:''});
        });
        it('should support value of spaces', function() {
            expect(WAF.parseQueryString('a=++')).to.deep.equal({a:'  '});
        });

        it('should support proper decoding', function() {
            expect(WAF.parseQueryString('a%20b=c&d=e%20f&g=h')).to.deep.equal({'a b':'c', d:'e f', g:'h'});
        });
        it('should support multiple equal signs', function() {
            expect(WAF.parseQueryString('a=b=c=d')).to.deep.equal({a:'b=c=d'});
        });
        it('should support proper splitting', function() {
            expect(WAF.parseQueryString('&a=b&&&c=d')).to.deep.equal({a:'b', c:'d'});
        });
        
        it('should support collection without square brackets', function() {
            expect(WAF.parseQueryString('col=r&col=g&col=b')).to.have.property('col').deep.equal(['r', 'g', 'b']);
        });
        it('should support empty values inside collection', function() {
            expect(WAF.parseQueryString('c=r&c=&c=b')).to.have.property('c').deep.equal(['r', '', 'b']);
        });
        it('should support empty values inside collection', function() {
            expect(WAF.parseQueryString('c=&c=blue')).to.have.property('c').deep.equal(['', 'blue']);
        });
        it('should support empty values inside collection', function() {
            expect(WAF.parseQueryString('c=blue&c=')).to.have.property('c').deep.equal(['blue', '']);
        });
    
    });

    describe('WAF.toQueryString(object)', function() {
        it('should encode object', function() {
            expect(WAF.toQueryString({a: 'A', b: 'B', c: 'C', d: 'D#', e: undefined, f: ['a', 1], g: null, h: {}})).to.deep.equal('a=A&b=B&c=C&d=D%23&e&f=a&f=1&g=');
        });
    });

    describe('String.escapeHTML(str)', function() {
        it('should escape html', function() {
            expect(String.escapeHTML('coucou<b>les</b>&amis')).to.equal('coucou&lt;b&gt;les&lt;/b&gt;&amp;amis');
        });
    });

    describe('Object.value(object)', function() {
        it('should return a list of value', function() {
            var obj = {};
            expect(Object.values({ a: 1, b: 'c', c: obj })).to.deep.equal([1, 'c', obj]);
        });
        it('should not return prototype values', function() {
            var Constr = function() {
                this.a = '5';
            };
            Constr.prototype.b = function() {};
            expect(Object.values(new Constr())).to.deep.equal(['5']);
        });
    });

    describe('WAF.get(object, path)', function() {
        it('should return the object for an undefined path', function() {
            var obj = {};
            expect(WAF.get(obj)).to.equal(obj);
        });
        it('should return the object at path', function() {
            expect(WAF.get({ a: { b: { c: 5 } } }, 'a.b.c')).to.equal(5);
        });
        it('should return undefined if the path is invalid', function() {
            expect(WAF.get({}, 'coucou.toto')).to.be.undefined;
        });
    });

    describe('Module management', function() {
        describe('WAF.define', function() {
            afterEach(function() {
                // clear loaded modules
                for(var k in WAF.require.modules) {
                    if(!/^waf-/.test(k)) {
                        delete WAF.require.modules[k];
                    }
                }
                // remove spies
                if (WAF.require.restore) {
                    WAF.require.restore();
                }
                if (WAF.define.restore) {
                    WAF.define.restore();
                }
            
            });
            it('should execute the module function', function() {
                var spy = sinon.spy();
                WAF.define('name', spy);
                expect(spy).to.have.been.calledOnce;
            });
            it('should accept a name', function() {
                var spy = sinon.stub();
                var module = {};
                spy.returns(module);
                WAF.define('name', spy);
                expect(spy).to.have.been.calledOnce;
                expect(WAF.require('name')).to.equal(module);
            });
            it('should accept a predefined name', function() {
                var spy = sinon.stub();
                var module = {};
                spy.returns(module);
                WAF.define('name');
                WAF.define(spy);
                expect(spy).to.have.been.calledOnce;
                expect(WAF.require('name')).to.equal(module);
            });
            it('should require a list of modules', function(done) {
                sinon.spy(WAF, 'require');
                var spy1 = sinon.stub();
                var m1 = {};
                spy1.returns(m1);
                var spy2 = sinon.stub();
                var m2 = {};
                spy2.returns(m2);
                var spy3 = sinon.stub();
                var m3 = {};
                spy3.returns(m3);
                WAF.define('spy1', spy1);
                WAF.define('spy2', spy2);
                WAF.define('spy3', spy3);
                WAF.define('name', ['spy1', 'spy2', 'spy3'], function(s1, s2, s3) {
                    expect(s1).to.equal(m1);
                    expect(s2).to.equal(m2);
                    expect(s3).to.equal(m3);
                    done();
                });
                expect(WAF.require).to.have.been.calledWith('spy1');
                expect(WAF.require).to.have.been.calledWith('spy2');
                expect(WAF.require).to.have.been.calledWith('spy3');
            });
            it('should require a list of modules with apredefined name', function(done) {
                sinon.spy(WAF, 'require');
                var spy1 = sinon.stub();
                var m1 = {};
                spy1.returns(m1);
                var spy2 = sinon.stub();
                var m2 = {};
                spy2.returns(m2);
                var spy3 = sinon.stub();
                var m3 = {};
                spy3.returns(m3);
                WAF.define('spy1', spy1);
                WAF.define('spy2', spy2);
                WAF.define('spy3', spy3);
                WAF.define('name');
                WAF.define(['spy1', 'spy2', 'spy3'], function(s1, s2, s3) {
                    expect(s1).to.equal(m1);
                    expect(s2).to.equal(m2);
                    expect(s3).to.equal(m3);
                    done();
                });
                expect(WAF.require).to.have.been.calledWith('spy1');
                expect(WAF.require).to.have.been.calledWith('spy2');
                expect(WAF.require).to.have.been.calledWith('spy3');
            });
        });
        describe('WAF.require', function() {
            it('should return a module', function() {
            });
            it('should try to synchronously load and execute a module in /walib/WAF', function() {
            });
            it('shlould return undefined if the module can\'t equal found', function() {
            });
        });
    });
});
