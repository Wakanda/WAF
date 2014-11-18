/** @module waf-behavior/methodshelper */
WAF.define('waf-behavior/methodshelper', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior'),
        Class = WAF.require('waf-core/class'),
        WakError = WAF.require('waf-core/error');

    /**
     * @class MethodsHelper
     * @augments Behavior.BaseBehavior
     */
    var MethodsHelper = Behavior.create();
    
    /**
     * Add a new instance method
     * @param {string} name
     * @param {function} function
     * @memberof MethodsHelper
     * @method addMethod
     * @public
     */
    MethodsHelper.addMethod = function(name, func) {
        this.prototype[name] = func;
    };
    
    /**
     * Add a new class method
     * @param {string} name
     * @param {function} function
     * @memberof MethodsHelper
     * @method addClassMethod
     * @public
     */
    MethodsHelper.addClassMethod = function(name, func) {
        this[name] = func;
    };
    
    /**
     * Add new instance methods
     * @param {object} object - Methods to add
     * @memberof MethodsHelper
     * @method addMethods
     * @public
     */
    MethodsHelper.addMethods = function(object) {
        for(var name in object) {
            this.prototype[name] = object[name];
        }
    };
    
    /**
     * Add new class methods
     * @param {object} object - Methods to add
     * @memberof MethodsHelper
     * @method addClassMethods
     * @public
     */
    MethodsHelper.addClassMethods = function(object) {
        for(var name in object) {
            this[name] = object[name];
        }
    };

    /**
     * Add a new async method
     * The async method accept a new callback argument, as last argument, or an object as last agument that can contain an onSuccess or an onError callback
     * @param {string} name - the name of the function to make async
     * @param {string [newname] - the name of the new function to create. The default name is name + 'Async'.
     * @memberof MethodsHelper
     * @method makeAsync
     */
    MethodsHelper.makeAsync = function(name, newname) {
        if(typeof this.prototype[name] !== 'function') {
            throw new WakError.NotFound("can't find function \"" + name +'"');
        }
        newname = newname || (name + 'Async');
        this.prototype[newname] = function() {
            var ret;
            var o = arguments[arguments.length - 1];
            if(typeof o !== 'object') {
                o = {};
            }
            try {
                ret = this[name].apply(this, arguments);
            } catch(e) {
                if(o.onError) {
                    o.onError(e);
                }
                return;
            }
            if(o.onSuccess) {
                o.onSuccess(ret);
            }
        };
    };

    /**
     * add new function that will call the methods with the same name on all the supers
     * @param {string} name - The name of the function to create and the functions to call
     * @memberof MethodsHelper
     * @method _addMultiInheritedCaller
     * @private
     */
    MethodsHelper._addMultiInheritedCaller = function(name) {
        var klass = this;
        this.prototype[name] = function() {
            if(!klass.supers) {
                return;
            }
            for(var i = 0; i < klass.supers.length; i++) {
                if(klass.supers[i].prototype[name]) {
                    klass.supers[i].prototype[name].apply(this, arguments);
                }
            }
        };
    };

    /**
     * replace a method with a new one that wrap the old one
     * the original function is available as the first argument of the wrapper method
     * @param {string} name  - the function to wrap
     * @param {MethodsHelper~wrapCallback} wrapper - the wrapper function
     * @memberof MethodsHelper
     * @method wrap
     * @public
     */
    MethodsHelper.wrap = function(name, wrapper) {
        var original = this.prototype[name];
        this.prototype[name] = function() {
            return wrapper.apply(this, [original.bind(this)].concat([].slice.call(arguments, 0)));
        };
    };
    /**
     * A wrapper callback
     * @callback MethodsHelper~wrapCallback
     * @param {function} orginal - the original wrapped function
     * @param {any} [...args] - the passed arguments
     */

    /**
     * Replace a method, with a new one that call the callbak before the original function
     * @param {string} name -  The name of the method to modify
     * @param {function} callback - The function to call before
     * @memberof MethodsHelper
     * @method doBefore
     * @public
     */
    MethodsHelper.doBefore = function(name, callback) {
        this.wrap(name, function(original) {
            var args = [].slice.call(arguments, 1);
            callback.apply(this, args);
            return original.apply(this, args);
        });
    };

    /**
     * Replace a method, with a new one that call the callbak after the original function
     * @param {string} name -  The name of the method to modify
     * @param {function} callback - The function to call after
     * @memberof MethodsHelper
     * @method doAfter
     * @public
     */
    MethodsHelper.doAfter = function(name, callback) {
        this.wrap(name, function(original) {
            var args = [].slice.call(arguments, 1);
            var r =  original.apply(this, args);
            callback.apply(this, args);
            return r;
        });
    };

    /**
     * replace a method with a new one that wrap the old one
     * the original function is available as the first argument of the wrapper method
     * @param {string} name  - the function to wrap
     * @param {MethodsHelper~wrapCallback} wrapper - the wrapper function
     * @memberof MethodsHelper
     * @method wrapClassMethod
     * @public
     */
    MethodsHelper.wrapClassMethod = function(name, wrapper) {
        var original = this[name];
        this[name] = function() {
            return wrapper.apply(this, [original.bind(this)].concat([].slice.call(arguments, 0)));
        };
    };

    /**
     * Replace a method, with a new one that call the callbak before the original function
     * @param {string} name -  The name of the method to modify
     * @param {function} callback - The function to call before
     * @memberof MethodsHelper
     * @method doBeforeClassMethod
     * @public
     */
    MethodsHelper.doBeforeClassMethod = function(name, callback) {
        this.wrapClassMethod(name, function(original) {
            var args = [].slice.call(arguments, 1);
            callback.apply(this, args);
            return original.apply(this, args);
        });
    };

    /**
     * Replace a method, with a new one that call the callbak after the original function
     * @param {string} name -  The name of the method to modify
     * @param {function} callback - The function to call after
     * @memberof MethodsHelper
     * @method doAfterClassMethod
     * @public
     */
    MethodsHelper.doAfterClassMethod = function(name, callback) {
        this.wrapClassMethod(name, function(original) {
            var args = [].slice.call(arguments, 1);
            var r =  original.apply(this, args);
            callback.apply(this, args);
            return r;
        });
    };

    Class.defaultBehaviors.push(MethodsHelper);

    return MethodsHelper;
});
