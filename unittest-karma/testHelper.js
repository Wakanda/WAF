(function (testHelper){
    
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(testHelper);
    } else {
        // Browser globals
        window.testHelper = testHelper();
    }
    
})(function(){
    
    chai.Assertion.addMethod('instanceOfClass', function(klass) {
        this.assert(
            Class.instanceOf(this._obj, klass)
          , 'expected #{this} to be an instance of ' + klass
          , 'expected #{this} to not be an instance of ' + klass
        );
        return this;
    });

    chai.Assertion.addMethod('inheritFromClass', function(klass) {
        this.assert(
            Class.inheritFrom(this._obj, klass)
          , 'expected #{this} to be inherit from ' + klass
          , 'expected #{this} to not inherit from ' + klass
        );
        return this;
    });

    var testHelper;
    
    testHelper = {
        setInlineCss : function(inlneCss){
            var css = document.createElement("style");
            css.id = "tests-inline-css";
            css.type = "text/css";
            css.innerHTML = inlneCss;
            document.head.appendChild(css);
        },
        removeInlineCss : function(){
            document.getElementById("tests-inline-css").remove();
        }
    };
    
    return testHelper;

});
