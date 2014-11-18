/** @module waf-core/class */
WAF.define('waf-core/class', function() {
    "use strict";
    /**
     *  @namespace Class
     *  @public
     */
    var Class = {
        defaultBehaviors: []
    };

    function getNextMergeOrProtectedLevel(object, key) {
        if('*' in object) {
            return object['*'];
        }
        if('**' in object) {
            return { '**': {} };
        }
        if(key in object) {
            return object[key];
        }
        return {};
    }

    // merges class attributes according the _mergeOnInherit and _protectedClassAttributes structures
    // '*' treat all keys as mergeable
    // '**' treat all keys as mergeable and recursively
    var mergeObjects = function(dest, source, merge, protectd) {
        source = WAF.clone(source);
        for(var k in source) {
            if((k in protectd || '*' in protectd || '**' in protectd) && protectd[k] !== false) {
                continue;
            }
            if(typeof source[k] === 'object' && (k in merge || '*' in merge || '**' in merge) && merge[k] !== false) {
                if(source[k] instanceof Array) {
                    dest[k] = (dest[k] || []).concat(source[k]);
                } else {
                    var m = getNextMergeOrProtectedLevel(merge, k);
                    var p = getNextMergeOrProtectedLevel(protectd, k);
                    dest[k] = mergeObjects(dest[k] || {}, source[k] || {}, m, p);
                }
            } else {
                dest[k] = source[k];
            }
        }
        return dest;
    };

    // If we have a stacked method, we must compose a list of all inherited methods 
    // that use the same name and create a new function that execute them all.
    // Stacked functions should not call $super.
    function addStackedMethod(klass, sup, functionName) {
        var list = [];
        var listClass = [];
        klass.getAllSupers()
            .concat([sup, klass])
            .concat(sup.getAllSupers())
            .forEach(function(c) {
                var func = c.prototype[functionName];
                if(typeof func !== 'function') {
                    return;
                }
                while(func._original) {
                    func = func._original;
                }
                if(func._stack) {
                    return;
                }
                if(list.indexOf(func) < 0) {
                    list.push(func);
                    listClass.push([c, func]);
                }
            });
        // sort by inheritance order
        listClass.sort(function(c1, c2) {
            if(Class.inheritFrom(c1[0], c2[0])) {
                return  1;
            }
            if(Class.inheritFrom(c2[0], c1[0])) {
                return -1;
            }
            return 0;
        });

        list = listClass.map(function(c) { return c[1]; });
        
        var original = klass.prototype[functionName];
        klass.prototype[functionName] = function() {
            for(var i = 0; i < list.length; i++) {
                list[i].apply(this, arguments);
            }
        };
        klass.prototype[functionName]._stack = list;
        klass.prototype[functionName]._original = original;
    }

    function copyPrototype(klass, sup) {
        var proto = sup.prototype;
        for( var f in proto ) {
            if( f !== "constructor" && typeof proto[f] === "function" ) {
                if(f !== 'toString' && (sup._stackedInstanceMethods[f] || klass._stackedInstanceMethods[f])) {
                    addStackedMethod(klass, sup, f);
                } else {
                    if(klass.prototype[f] && (klass._prototypeInheritLevel[f] || []).length <= (sup._prototypeInheritLevel[f] || []).length) {
                        continue;
                    }
                    klass.prototype[f] = proto[f];
                    klass._prototypeInheritLevel[f] = (sup._prototypeInheritLevel[f] || []).concat([sup]);
                }
            }
        }
    }

    var baseClassAttributes = /** @lends Class.BaseClass */ {
        supers: [],
        _protectedClassAttributes: { supers: {}, _prototypeInheritLevel: {}, toString: {}, inherit: {}, whenInherited: {}, _allSupers: {} },
        _prototypeInheritLevel: {},
        _stackedInstanceMethods: {},
        _mergeOnInherit: { _mergeOnInherit: { '*' : {} }, _protectedClassAttributes: { '*' : {} }, _stackedInstanceMethods: {} },
        /**
         * Inherit from other classes
         * @param {...constructor} class - parent class
         * @return {Class} this
         * @public
         */
        inherit: function() {
            if( arguments.length < 1 ) {
                return this;
            }

            var args = [].map.call(arguments, function(arg) {
                if(typeof arg === 'string') {
                    var module = WAF.require(arg);
                    if(module === undefined) {
                        var WakError = WAF.require('waf-core/error');
                        throw new WakError.Error("Can't inherit from unknown class '" + arg + "'");
                    }
                    return module;
                }
                return arg;
            });

            args.forEach(function(sup) {
                if(sup === undefined) {
                    var WakError = WAF.require('waf-core/error');
                    throw new WakError.Error("Can't inherit from undefined");
                }
                copyPrototype(this, sup);
                mergeObjects(
                    this,
                    sup,
                    WAF.extend(true, WAF.clone(this._mergeOnInherit), WAF.clone(sup._mergeOnInherit)),
                    WAF.extend(true, WAF.clone(this._protectedClassAttributes), WAF.clone(sup._protectedClassAttributes))
                );
                if('whenInherited' in sup) {
                    sup.whenInherited(this);
                }

                // push the super
                this.supers.push(sup);
                // clear getAllSupers() cache
                this._allSupers = undefined;
            }.bind(this));

            // add the $super method
            /**
             *  Reteive and call a the method inherited from parents
             *  @param {string} name Function name
             *  @param {*} [args] Arguments to call the function with
             *  @param {*} value returned by the function
             *  @function $callSuper
             *  @memberof Class.BaseClass
             *  @instance
             * @method $callSuper
             */
            this.prototype.$callSuper = function(name) {
                return this.$super(name).apply(this, [].slice.call(arguments, 1));
            };

            var supers = this.supers;
            var constructor = this;
            
            /**
             * Reteive a the method inherited from parents
             * @returns {function}
             * @function $super
             * @memberof Class.BaseClass
             * @instance
             * @method $super
             * @public
             */
            this.prototype.$super = function(name, _class) {
                if (_class) {
                    return _class.prototype[name] && _class.prototype[name].bind(this);
                }
                var _supers = supers;
                if(name in constructor._prototypeInheritLevel) { // find the right super if the method is allready inherited
                    constructor._prototypeInheritLevel[name].reverse().some(function(sup) {
                        if(sup.prototype[name] !== constructor.prototype[name]) {
                            return true;
                        }
                        _supers = sup.supers;
                    });
                }
                _supers = _supers.filter(function(sup) { return name in sup.prototype && typeof sup.prototype[name] === "function"; });
                var _level = Math.min.apply(Math, _supers.map(function(sup) { return (sup._prototypeInheritLevel[name] || []).length; }));
                var len = _supers.length;
                for(var i = 0; i < len; i++) {
                    var sup = _supers[i];
                    if( (sup._prototypeInheritLevel[name] || []).length === _level) {
                        return function() {
                            var old$super = this.$super;
                            var r;
                            if (sup.prototype.$super) {
                                this.$super = sup.prototype.$super;
                            }
                            try {
                                r = sup.prototype[name].apply(this, arguments);
                            } catch(e) {
                                this.$super = old$super;
                                throw e;
                            }
                            this.$super = old$super;
                            return r;
                        }.bind(this);
                    }
                }
                return undefined;
            };
            return this;
        },
        /**
         * Reteive the list of all supers
         * @returns {Array} List of all supers
         * @public
         */
        getAllSupers: function() {
            if (this._allSupers) {
                return this._allSupers;
            }
            this._allSupers = this.supers.slice(0);
            for( var i = 0; i < this.supers.length; i++) {
                var s = this.supers[i].getAllSupers();
                for(var j = 0; j < s.length; j++) {
                    if (this._allSupers.indexOf(s[j]) < 0) {
                        this._allSupers.push(s[j]);
                    }
                }
            }
            return this._allSupers;
        },
        /**
         * Set a flag to protect a class attribute from being overridden on inherit
         * @param {string} name Attribute name
         */
        protectClassAttribute: function(name) {
            this._protectedClassAttributes[name] = true;
        },
        /**
         * Unset a flag to protect a class attribute from being overridden on inherit
         * @param {string} name Attribute name
         */
        unprotectClassAttribute: function(name) {
            delete this._protectedClassAttributes[name];
        },
        /**
         * Set a flag to make this method a stacked one. Stacked methods call the method on all inherited supers, by order of inheritance.
         * @param {string} name Method name
         */
        stackInstanceMethods: function(name) {
            this._stackedInstanceMethods[name] = true;
        },
        /**
         * Set a flag to merge a class attribute on inheritance.
         * @param {string} name Attribute name
         */
        mergeClassAttributeOnInherit: function(name) {
            name = name.split('.');
            var o = this._mergeOnInherit;
            while(name.length) {
                var n = name.shift();
                o = o[n] = o[n] || {};
            }
        }
    };

    /**
     * Tell if an instance is a member of a class
     * @param {object} instance
     * @param {function} class
     * @returns {boolean}
     * @memberof Class
     * @method instanceOf
     * @public
     */
    Class.instanceOf = function instanceOf(instance, klass) {
        if (!instance) {
            return false;
        }

        if(typeof klass === 'string') {
            klass = WAF.require(klass);
        }
        
        if(instance instanceof klass) {
            return true;
        }
        
        return Class.inheritFrom(instance.constructor, klass);
    };
    
    /**
     * Tell if a class inherits from another class
     * @param {function} class
     * @param {function} class
     * @returns {boolean}
     * @memberof Class
     * @method inheritFrom
     * @public
    */
    Class.inheritFrom = function inheritFrom(constr, klass) {
        if(typeof klass === 'string') {
            klass = WAF.require(klass);
        }
        
        return !!(constr && constr.getAllSupers && constr.getAllSupers().indexOf(klass) >= 0);
    };

        
    /**
     * Create a new class
     * @param {string} name
     * @returns {class}
     * @memberof Class
     * @method create
     * @public
     */
    Class.create = function create(methods) {

        /**
         * @name Class.BaseClass
         * @constructor
         * @mixes MethodsHelper
         * @mixes PropertiesHelper
         * @abstract
         * @method klass
         * @public
         */
        var klass = function() {
            if (this.initialize) {
                this.initialize.apply(this, arguments);
            }
        };

        WAF.extend(true, klass, baseClassAttributes);

        /**
         * Tell if the instance is a member of a class
         * @param {function} class
         * @returns {boolean}
         * @function isInstanceOf
         * @memberof Class.BaseClass
         * @instance
         * @method isInstanceOf
         * @public
         */
        klass.prototype.isInstanceOf = function(klass) { return Class.instanceOf(this, klass); };

        /**
         * Print a debug representation of the object to the console
         * @function debug
         * @memberof Class.BaseClass
         * @instance
         * @method debug
         */
        klass.prototype.debug = function() {
            var classMethods = [],
                classProperties = [],
                instanceMethods = [],
                instanceProperties = [];
            
            console.log(this.toString(), '\n------');
            
            // list Class properties
            for (var prop in this) {
                if (typeof this[prop] === 'function') {
                        var args = /\(([^)]*){1}/.exec(this[prop]);
                        if (args && args[1]) {
                            args = args[1].split(/\s*,\s*/);
                        } else {
                            args = [];
                        }
                    instanceMethods.push(prop + '( ' + args.join(', ') + ' )');
                } else {
                    instanceProperties.push(prop);
                }
            }
            
            instanceProperties.sort();
            instanceMethods.sort();
            
            console.group('Methods');
            for (var prop in instanceMethods) {
                console.log(instanceMethods[prop]);
            }
            console.groupEnd();
            console.group('properties');
            for (var prop in instanceProperties) {
                if (typeof this[instanceProperties[prop]] === 'object')  {
                    console.log(instanceProperties[prop] + ': ' + '%O', this[instanceProperties[prop]]);
                } else {
                    console.log(instanceProperties[prop] + ': ', this[instanceProperties[prop]]);
                }
            }
            console.groupEnd();
        };
        
        Class.defaultBehaviors.forEach(function(b) {
            klass.inherit(b);
        });
        
        if (methods) {
            WAF.extend(klass.prototype, methods);
        }
        
        return klass;
    };


    return Class;
});
