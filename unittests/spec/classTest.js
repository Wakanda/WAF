var expect = chai.expect;
var Class = WAF.require('waf-core/class');

describe('Class', function() {
    describe('.create()', function() {
        it("should create a class", function() {
            var a = Class.create('a');
            expect(a).to.be.a('function');
            expect(a).to.have.property('inherit').to.be.a('function');
            a.prototype.initialize = function() { this.p = 5; };
            a.prototype.m = function() { return this.p; };
            var _a = new a();
            expect(_a.constructor).to.equal(a);
            expect(_a.p).to.equal(5);
            expect(_a).to.have.property('m').to.be.a('function');
            expect(_a.m()).to.equal(5);
        });
    });
    describe('#inherit() instance methods', function() {
        var a = Class.create('a');
        a.prototype.toto = function() { return this.p; };
        a.addM = function(t) { this.prototype.tutu = function() { return t; }; };
        a.prototype.getThis = function() { return this };

        var b = Class.create('b');
        b.inherit(a);
        it("should inherit a method", function() {
            expect(b.prototype).to.have.property('toto').to.be.a('function');
        });
        b.prototype.toto = function() { return 'supercharged ' + this.$super('toto')(); };
        var _b = new b();
        _b.p = 'test';
        it('should supercharge a method', function() {
            expect(_b.toto()).to.equal('supercharged test');
        });
        it('should inherit class methods', function() {
            b.addM('titi');
            var _b = new b();
            expect(_b).to.have.property('tutu').to.be.a('function');
            expect(_b.tutu()).to.equal('titi');
        });
        it('should preserve this', function() {
            var _b = new b();
            expect(_b.getThis()).to.equal(_b);
        });
        b.prototype.getThis = function() { return this.$super('getThis')(); };
        it('should preserve this in $super', function() {
            var _b = new b();
            expect(_b.getThis()).to.equal(_b);
        });

        it('Should chained supercharged methods', function() {
            var a = Class.create('a');
            a.prototype.m = function() { return 'a'; };
            var b = Class.create('b');
            b.inherit(a);
            b.prototype.m = function() { return 'b' + this.$callSuper('m'); };
            var c = Class.create('c');
            c.inherit(b);
            c.prototype.m = function() { return 'c' + this.$callSuper('m'); };

            expect(new c().m()).to.equal('cba');
        });

        it('Should call the right method when inherited from multiple parents at different depth', function() {
            var a = Class.create('a');
            a.prototype.toto = function() { return 'toto'; };

            var d = Class.create('d');
            d.inherit(a);

            var e = Class.create('e');
            e.prototype.toto = function() { return 'toto de e'; };

            var f = Class.create('f');
            f.inherit(e);
            f.inherit(d);

            var g = Class.create('g');
            g.inherit(d);
            g.inherit(e);

            expect(new f().toto()).to.equal('toto de e');
            expect(new g().toto()).to.equal('toto de e');

            f.prototype.toto = function() { return this.$super('toto')(); };
            g.prototype.toto = function() { return this.$super('toto')(); };
            expect(new f().toto()).to.equal('toto de e');
            expect(new g().toto()).to.equal('toto de e');
        });

        it('Should call stacked methods', function() {
            var a = Class.create('a');
            a.prototype.toto = function() { this.a += 'a' };
            a.stackInstanceMethods('toto');

            var b = Class.create('b');
            b.inherit(a);
            b.prototype.toto = function() { this.a += 'b' };

            var c = Class.create('c');
            c.inherit(a);
            c.prototype.toto = function() { this.a += 'c' };

            var d = Class.create('d');
            d.inherit(b);
            d.inherit(c);
            d.prototype.initialize = function() { this.a = ''; };
            
            var _d = new d();
            _d.toto();
            expect(_d).to.have.property('a').to.equal('abc');
        });
        it('should call the right $super method in inherited method', function() {
            var a = Class.create('a');
            a.prototype.toto = function() { return 'toto'; };
            var b = Class.create('b');
            b.inherit(a);
            b.prototype.toto = function() { return 'tata' + this.$super('toto')(); };
            var c = Class.create('c');
            c.inherit(b);
            var _c = new c();
            expect(_c.toto()).to.equal('tatatoto');
        });
        it('should call the right $super method in inherited $super method', function() {
            var a = Class.create('a');
            a.prototype.toto = function() { return 'toto'; };
            var b = Class.create('b');
            b.inherit(a);
            b.prototype.toto = function() { return 'tata' + this.$super('toto')(); };
            var c = Class.create('c');
            c.inherit(b);
            var d = Class.create('d');
            d.inherit(c);
            d.prototype.toto = function() { return this.$super('toto')(); };
            var e = Class.create('e');
            e.inherit(d);
            var _e = new e();
            expect(_e.toto()).to.equal('tatatoto');
        });
    });
    
    describe('#inherit() class attributes', function() {
        var a = Class.create('a');
        a.toto = function() { return 'a'; };
        a.titi = 'titi';
        a.tata = { 'hello': 'world' };

        var b = Class.create('b');
        b.inherit(a);
        a.tata.hello = 'everybody';

        it('Should inherit class attributes', function() {
            expect(b).to.have.property('toto').to.be.a('function');
            expect(b.toto()).to.equal('a');
            expect(b).to.have.property('titi').to.equal('titi');
        });
        it('Should clone inherited class attributes', function() {
            expect(b).to.have.property('tata').to.be.a('object').not.to.equal(a.tata);
        });
        it('Should not inherit protected attributes', function() {
            var a = Class.create('a');
            a.protectClassAttribute('titi');
            a.titi = 'titi';

            var b = Class.create('b');
            b.inherit(a);

            expect(b).not.to.have.property('titi');

            var a = Class.create('a');
            a.titi = 'titi';

            var b = Class.create('b');
            b.protectClassAttribute('titi');
            b.inherit(a);
            b.unprotectClassAttribute('titi');

            var c = Class.create('c');
            c.inherit(b);

            expect(b).not.to.have.property('titi');
            expect(c).not.to.have.property('titi');

            c.titi = 'toto';
            var d = Class.create('d');
            d.inherit(c);

            expect(d).to.have.property('titi').to.equal('toto');
        });
        it('Should merge array attributes', function() {
            var a = Class.create('a');
            a.mergeClassAttributeOnInherit('titi');
            a.titi = [1];

            var b = Class.create('b');
            b.titi = [2];
            b.inherit(a);
            
            expect(b).to.have.property('titi').to.include(2).to.include(1).to.have.length(2);
            
        });
        it('Should merge object attributes', function() {
            var a = Class.create('a');
            a.mergeClassAttributeOnInherit('titi');
            a.titi = { coucou: 1 };

            var b = Class.create('b');
            b.titi = { hello: 'world' };
            b.inherit(a);
            
            expect(b).to.have.property('titi').to.have.property('coucou', 1);
            expect(b).to.have.property('titi').to.have.property('hello', 'world');
            
        });
        it('Should merge deep attributes', function() {
            var a = Class.create('a');
            a.mergeClassAttributeOnInherit('titi.toto.tutu');
            a.titi = { toto: { tutu: { coucou: 1, plop: [1] }, lala: { lulu: 5 } } };

            var b = Class.create('b');
            b.mergeClassAttributeOnInherit('titi.toto.tutu.plop');
            b.titi = { toto: { tutu: { 'hello': 'world', plop: [2] } }, lala: { lulu: 4, lili: 3 } };
            b.inherit(a);
            
            expect(b)
                .to.have.property('titi')
                    .to.have.property('toto')
                        .to.have.property('tutu')
                            .to.have.property('coucou', 1);
            expect(b.titi.toto.tutu)
                            .to.have.property('hello', 'world');
            expect(b.titi.toto.tutu)
                            .to.have.property('plop').to.contain(1).to.contain(2).to.have.length(2);
            expect(b.titi.toto)
                        .to.have.property('lala')
                            .to.have.property('lulu', 5);
            expect(b.titi.toto.lala)
                            .not.to.have.property('lili');
        });
        it('Should merge deep wildcard attributes', function() {
            var a = Class.create('a');
            a.mergeClassAttributeOnInherit('titi.**');
            a.titi = { toto: { tutu: { coucou: 1, plop: [1] }, lala: { lulu: 5 } } };

            var b = Class.create('b');
            b.titi = { toto: { tutu: { 'hello': 'world', plop: [2] }, lala: { lulu: 4, lili: 3 } } };
            b.inherit(a);
            
            expect(b)
                .to.have.property('titi')
                    .to.have.property('toto')
                        .to.have.property('tutu')
                            .to.have.property('coucou', 1);
            expect(b.titi.toto.tutu)
                            .to.have.property('hello', 'world');
            expect(b.titi.toto.tutu)
                            .to.have.property('plop').to.contain(1).to.contain(2).to.have.length(2);
            expect(b.titi.toto)
                        .to.have.property('lala')
                            .to.have.property('lulu', 5);
            expect(b.titi.toto.lala)
                            .to.have.property('lili', 3);

            // TODO: test titi.*
            // TODO: test titi.*.tata
            // TODO: test titi.** and titi.tata
            // TODO: test titi.* and titi.tata
        });
    });


    var a = Class.create('a');
    var d = Class.create('d');
    d.inherit(a);
    var e = Class.create('e');
    var f = Class.create('f');
    f.inherit(e);
    f.inherit(d);
    describe('#supers', function() {
        it('should return direct supers', function() {
            expect(f.supers).to.include(e).to.include(d).to.not.include(a);
        });
    });
    describe('#getAllSupers()', function() {
        it('should return inherited supers', function() {
            expect(f.getAllSupers()).to.include(e).to.include(d).to.include(a);
            expect(f.getAllSupers()).to.have.length(3);
        });
        it('should not return actual class', function() {
            expect(f.getAllSupers()).to.not.include(f);
        });
    });
    describe('.instanceOf()', function() {
        it('should detect main class', function() {
            expect(Class.instanceOf(new f(), f)).to.be.true;
        });
        it('should detect inherited class', function() {
            expect(Class.instanceOf(new f(), e)).to.be.true;
            expect(Class.instanceOf(new f(), d)).to.be.true;
        });
        it('should detect deeply inherited class', function() {
            expect(Class.instanceOf(new f(), a)).to.be.true;
        });
        it('should detect unrelated class', function() {
            expect(Class.instanceOf(new d(), e)).to.be.false;
        });
    });
    describe('.default_behaviors', function() {
        var b = Class.create('b');
        Class.default_behaviors.push(b);
        var a = Class.create('a');
        it('should inherit from default behaviors', function() {
            expect(a.supers).to.contain(b);
        });
    });
});
        
