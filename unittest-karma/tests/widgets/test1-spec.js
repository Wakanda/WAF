(function(){
    describe("test1",function(){
        var errorClass;
        it('dummy test',function(){
            expect(undefined).to.be.an('undefined'); 
        });
        
        before(function(){
            console.log("WAF is defined : ",WAF ? true : false);
            errorClass = WAF.require('waf-core/error');
        });
        
        it("core should be loaded",function(){
            expect(WAF).to.not.equal(undefined);
            expect(WAF.require).to.be.an('function');
        });
        
        it("error class should be loaded",function(){
            expect(errorClass).to.be.an('object');
        });
        
    });
})();