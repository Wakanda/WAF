;(function(global) {
    "use strict";
    var slice = [].slice;

    // for test environment
    if (!global.WAF) {
        global.WAF = {};
    }

    String.capitalize =  function(s) {
        return s ? s[0].toUpperCase() + s.substr(1) : s;
    };

    if (!String.prototype.capitalize) {
        String.prototype.capitalize = function() {
            return String.capitalize(this);
        };
    }

    String.toCamelCase = function(str, sep, sep2) {
        sep = sep || '_';
        sep2 = sep2 || '';
        var r = str.split(sep);
        return r[0] + r.slice(1).map(String.capitalize).join(sep2);
    };

    if (!String.prototype.toCamelCase) {
        String.prototype.toCamelCase = function(sep, sep2) {
            return String.toCamelCase(this, sep, sep2);
        };
    }

    String.escapeHTML = function(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };

    if (!String.prototype.escapeHTML) {
        String.prototype.escapeHTML = function() {
            return String.escapeHTML(this);
        };
    }

    if(!Object.values)
        Object.values = function(obj) {
            var r = [];
            for(var k in obj)
                r.push(obj[k])
            return r;
        };

    /* Fix our webkit
     * Taken from Mozilla MDN
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
     */
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function() {
            },
            fBound = function() {
                return fToBind.apply(this instanceof fNOP && oThis
                ? this
                : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments)));
            };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    /**
     * Extends target object with source object
     *
     * @param {object} target of the extend
     * @param {object} source of the extend
     * @param {boolean} deep: should we do a deep copy
     * @return {object} the target, extended with the source object
     **/
    function extend(target, source, deep) {
        function copyKey(key) {
            if (deep && typeof source[key] === 'object') {
                if(typeof target[key] == 'undefined')
                    target[key] = Array.isArray(source[key]) ? [] : {};
                extend(target[key], source[key], true);
            } else {
                target[key] = source[key];
            }
        }
        if(Array.isArray(source)) {
            for(var key = 0; key < source.length; key++)
                copyKey(key);
        } else {
            for (key in source)
                copyKey(key);
        }
        return target;
    }

    /**
     * Extends the first object with other objects, ignoring undefined or null values
     * should be compatible with jQuery.extend
     *
     * @param {object} object 1 to extend with the target 
     * @param {object} object N to extend with the target
     * @return {object} the target, extended with the source object
     *
     * or
     * @param {boolean} deep, if true, the merge is recursive
     * @param {object} object 1 to extend with the target 
     * @param {object} object N to extend with the target
     * @return {object} the target, extended with the source object     
     *
     * see: http://api.jquery.com/jQuery.extend/
     **/    
    WAF.extend = function() {
        var args = null,
            deep = false,
            target = {};
        
        // remove undefined/null values
        args = slice.call(arguments, 0).filter(function(e) { return e; });
        
        // first argument is true: deep copies, target becomes second one, and targets start at second one
        if (args[0] === true) {
            args = args.slice(2);
            target = arguments[1];
            deep = true;
        } else {
            target = args[0];
            args = args.slice(1);
        }
        
        target = target || {};
        
        args.forEach(function(argument) {
            extend(target, argument, deep);
        });
        
        return target;
    };
    
    WAF.each = function(obj, cb) {
        // handle Arrays and Array-like objects (like arguments)
        if (Array.isArray(obj) || obj.length) {
            for (var i = 0, max = obj.length; i < max; i++) {
                if (cb.call(obj[i], obj[i], i, obj) === false) {
                    break;
                }
            }
        } else if (typeof obj === 'object') {
            for (var key in obj) {
                if (cb.call(obj[key], obj[key], key, obj) === false) {
                    break;
                }                
            }
        }
            
        return obj;
    };
    
    WAF.capitalize = function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    
    WAF.clone = function(obj) {
        if (typeof obj != 'object' && typeof obj != 'function')
            return obj;
        
        return WAF.extend(true, Array.isArray(obj) ? [] : {}, obj);
    };

    WAF.remove = function(arr, el) {
        var i = arr.indexOf(el);
        if(~i) {
            arr.splice(i, 1);
            return true;
        }
        return false;
    };

    var modules = {};
    var current_module;

    function require(name) {
        if(name in modules) {
            return modules[name];
        }
        current_module = name;
        var url = '/walib/WAF/' + name + '.js';

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
                eval(xhr.responseText);
            }
        };
     
        xhr.open("GET", url, false);
        xhr.send(null);
        return modules[name];
    }

    require.modules = modules;

    function define(name, func) {
        if(typeof name == 'function') {
            func = name;
            name = current_module;
            current_module = undefined;
        }

        if(typeof func != 'function') {
            current_module = name;
            return;
        }

        if(name in modules) return;
        modules[name] = func();
        return;
    }

    WAF.require = require;
    WAF.define = define;
        

})(window);
