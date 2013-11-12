/* brackets-xunit: includes=../../ui/utils.js */
describe("utils - extend ", function() {
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
        }
    });

    afterEach(function() {
        object1 = object2 = object3 = original1 = original2 = original3 = null;
    });

    it("simple test, no deep copy", function() {
        var res = WAF.extend(object1, object2);
        
        // first parameter is modified
        expect(original1).toBe(object1);
        
        expect(res).toBe(original1);
        
        // other parameters are untouched
        expect(JSON.stringify(original2)).toBe('{"banana":{"price":200,"flags":["b","c"]},"durian":100}');
            
        expect(JSON.stringify(original1)).toBe('{"apple":0,"banana":{"price":200,"flags":["b","c"]},"cherry":97,"durian":100}');
    });
    
    it("simple test, no deep copy, new target", function() {
        var newTarget = {};
        
        var res = WAF.extend(newTarget, object1, object2);
        
        // second parameter is not modified
        expect(original1).toBe(object1);
        expect(original1).not.toBe(newTarget);
        
        expect(res).toBe(newTarget);
        
        // other parameters are untouched
        expect(JSON.stringify(original2)).toBe('{"banana":{"price":200,"flags":["b","c"]},"durian":100}');
            
        expect(JSON.stringify(newTarget)).toBe('{"apple":0,"banana":{"price":200,"flags":["b","c"]},"cherry":97,"durian":100}');
        
        expect(JSON.stringify(original1)).toBe('{"apple":0,"banana":{"weight":52,"price":100,"flags":["a"]},"cherry":97}');        
    });
    
    it("deep copy", function() {        
        var res = WAF.extend(true, object1, object2);
        
        // first parameter is modified
        expect(original1).toBe(object1);
        
        expect(res).toBe(object1);
        
        // other parameters are untouched
        expect(JSON.stringify(original2)).toBe('{"banana":{"price":200,"flags":["b","c"]},"durian":100}');
        original2.banana.price = 100;
        expect(JSON.stringify(original1)).toBe('{"apple":0,"banana":{"weight":52,"price":200,"flags":["b","c"]},"cherry":97,"durian":100}');
    });
    
    it("deep copy, new target", function() {        
        var res = WAF.extend(true, {}, object2);
        
        // first parameter is modified
        expect(original2).toBe(object2);
        
        expect(res).not.toBe(object2);

        res.banana.flags.push('plop');
        
        // other parameters are untouched
        expect(JSON.stringify(res)).toBe('{"banana":{"price":200,"flags":["b","c","plop"]},"durian":100}');
        res.banana.price = 100;
        expect(JSON.stringify(original2)).toBe('{"banana":{"price":200,"flags":["b","c"]},"durian":100}');
            
    });
    
    it("null/undefined parameters should not be merged", function() {
        var res = WAF.extend(object1, undefined, object2, null, object3);
        
        expect(JSON.stringify(object1)).toBe('{"apple":0,"banana":{"price":200,"flags":["b","c"]},"cherry":97,"durian":100,"car":"dolorean"}');
        
        expect(object1).toBe(res);
        
        expect(original2).toBe(object2);
        expect(original3).toBe(object3);
    });
    
    it("first parameter is null/undefined", function() {
        var res = WAF.extend(null, undefined, object2, null, object3);
        
        expect(JSON.stringify(object2)).toBe('{"banana":{"price":200,"flags":["b","c"]},"durian":100,"car":"dolorean"}');
        
        expect(object2).toBe(res);
        
        expect(original3).toBe(object3);
    });    

});
