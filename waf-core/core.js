(function(global) {
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

    if(!Object.values) {
        Object.values = function(obj) {
            var r = [];
            for(var k in obj) {
                if(obj.hasOwnProperty(k)) {
                    r.push(obj[k]);
                }
            }
            return r;
        };
    }

    /**
     * parse a query string and return an object with all the key / values
     * @param {string} query
     * @return {object}
     */
    WAF.parseQueryString = function(query) {
        var match = query.match(/([^?#]*)(#.*)?$/);
        var hash = {};
        if(match) {
            match[1].split('&').forEach(function(pair) {
                if ((pair = pair.split('='))[0]) {
                    var key = decodeURIComponent(pair.shift()),
                        value = pair.length > 1 ? pair.join('=') : pair[0];

                    if (value !== undefined) {
                        value = decodeURIComponent(value.replace(/\+/g, ' '));
                    }

                    if (key in hash) {
                        if (!Array.isArray(hash[key])) {
                            hash[key] = [hash[key]];
                        }
                        hash[key].push(value);
                    }
                    else {
                        hash[key] = value;
                    }
                }
            });
        }
        return hash;
    };

    function toQueryPair(key, value) {
        if (value === undefined) {
            return key;
        }
        value = value == null ? '' : String(value);
        value = value.replace(/(\r)?\n/g, '\r\n');
        value = encodeURIComponent(value);
        value = value.replace(/%20/g, '+');
        return key + '=' + value;
    }
    /**
     * return a querystring from an object
     * @param {object} object
     * @return {string}
     */
    WAF.toQueryString = function(object) {
        var queryValues = [];
        Object.keys(object).forEach(function(key) {
            var values = object[key];
            key = encodeURIComponent(key);

            if (values && typeof values === 'object') {
                if (Array.isArray(values)) {
                    for (var i = 0, len = values.length, value; i < len; i++) {
                        value = values[i];
                        queryValues.push(toQueryPair(key, value));
                    }
                }
            } else {
                queryValues.push(toQueryPair(key, values));
            }
        });
        return queryValues.join('&');
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
                return fToBind.apply(this instanceof fNOP && oThis ?
                    this : oThis,
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
     * @public
     */
    function extend(target, source, deep) {
        function copyKey(key) {
            if (deep && typeof source[key] === 'object') {
                if(target[key] === undefined) {
                    target[key] = Array.isArray(source[key]) ? [] : {};
                }
                extend(target[key], source[key], true);
            } else {
                target[key] = source[key];
            }
        }
        var key;
        if(Array.isArray(source)) {
            for (key = 0; key < source.length; key++) {
                copyKey(key);
            }
        } else {
            for (key in source) {
                if(source.hasOwnProperty(key)) {
                    copyKey(key);
                }
            }
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
     * @method extend
     * @public
     */
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

    WAF.clone = function(obj) {
        if (typeof obj !== 'object' && typeof obj !== 'function') {
            return obj;
        }

        return WAF.extend(true, Array.isArray(obj) ? [] : {}, obj);
    };

    WAF.remove = function(arr, el) {
        var i = arr.indexOf(el);
        if(i >= 0) {
            arr.splice(i, 1);
            return true;
        }
        return false;
    };

    var modules = {};
    var currentModule;

    /**
     * Return the key at the given path (dot separated)
     * Return undefined if the key isn't found
     * @param {object} object
     * @param {string} [path] - Return the object if no path is given
     * @return {any}
     */
    WAF.get = function(object, path) {
        if(object == null) {
            return object;
        }
        if(path === undefined) {
            return object;
        }
        path = path.split('.');
        if(path.length === 1) {
            return object[path[0]];
        }
        return WAF.get(object[path[0]], path.slice(1).join('.'));
    };

    /**
     * Retreive a module
     * (if the module wasn't previously loaded, try to load it via XHR (this shouldn't happen in production with WD2)
     * @param {string} name
     * @return {any} module
     * @memberof WAF
     * @method require
     * @public
     */
    function require(name) {
        name = name.split('.');
        if(name[0] in modules) {
            return WAF.get(modules[name[0]], name[1] && name.slice(1).join('.'));
        }
        currentModule = name[0];
        var url = '/walib/WAF/' + name[0] + '.js';

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 0)) {
                eval(xhr.responseText); // jshint ignore:line
            }
        };

        xhr.open("GET", url, false);
        xhr.send(null);
        return WAF.get(modules[name[0]], name[1]);
    }

    /**
     * The list of the loaded modules
     * @type {object}
     */
    require.modules = modules;

    /**
     * Declare a new module
     * @param {string} [name] - module name
     * @param {string[]} [requires] - list of modules to load
     * @param {function} func - function that return the module
     * 
     * or 
     *
     * Declare the next module name
     * @param {string} name - module name
     *
     * @memberof WAF
     * @method define
     * @public
     */
    function define(name, requires, func) {
        // optional arguments
        if(typeof name !== 'string') {
            func = requires;
            requires = name;
            name = undefined;
        }
        if (!Array.isArray(requires)) {
            func = requires;
            requires = undefined;
        }

        // if no name, use the currentModule value
        if (name === undefined) {
            name = currentModule;
            currentModule = undefined;
        }

        // if no function, set the currentModule value
        if(typeof func !== 'function') {
            currentModule = name;
            return;
        }

        requires = (requires || []).map(function(fileToLoad) {
            return WAF.require(fileToLoad);
        });

        modules[name] = func.apply(undefined, requires); // use undefined as "this" to respect ES5 strict mode

        return;
    }

    WAF.require = require;
    WAF.define = define;


})(window);
