/* globals define, chai, describe */
(function (testHelper){
    "use strict";

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(testHelper);
    } else {
        // Browser globals
        window.testHelper = testHelper();
    }

})(function(){
    "use strict";

    var Class = WAF.require('waf-core/class');

    chai.Assertion.addMethod('instanceOfClass', function(klass) {
        this.assert(
            Class.instanceOf(this._obj, klass),
            'expected #{this} to be an instance of ' + klass,
            'expected #{this} to not be an instance of ' + klass
        );
        return this;
    });

    chai.Assertion.addMethod('inheritFromClass', function(klass) {
        this.assert(
            Class.inheritFrom(this._obj, klass),
            'expected #{this} to be inherit from ' + klass,
            'expected #{this} to not inherit from ' + klass
        );
        return this;
    });


    var modules = {};

    window.moduleDescribe = function(name, dependencies, callback) {
        if(typeof dependencies === 'function') {
            callback = dependencies;
            dependencies = undefined;
        }
        modules[name] = {
            dependencies: dependencies || [],
            callback: callback
        };
    };

    window.runModuleDescribes = function() {
        var names = Object.keys(modules);
        names.sort(function(a, b) {
            var _a = modules[a];
            var _b = modules[b];
            if(_a.dependencies.indexOf(b) < 0) {
                return -1;
            }
            if(_b.dependencies.indexOf(a) < 0) {
                return 1;
            }
            return 0;
        });
        names.forEach(function(name) {
            describe(name,  modules[name].callback);
        });
    };


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
