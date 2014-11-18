var Behavior = WAF.require('waf-core/behavior');

moduleDescribe('waf-core/behavior', function() {
    describe('.create', function() {
        it('should create a new behavior', function() {
            var toto = Behavior.create('Toto');
            expect(toto).to.be.a('function');
        });
    });
    describe('#getMethods', function() {
        it('should return methods', function() {
            var toto = Behavior.create('Toto');
            toto.prototype.m = function() { return this; };
            expect(toto).to.have.property('getMethods').to.be.a('function');
            expect(toto.getMethods()).to.contain('m').to.have.length(1);
        });
    });

});

