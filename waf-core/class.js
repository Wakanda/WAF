/** @module waf-core/class */
WAF.define('waf-core/class', function() {
    "use strict";
    /**
        @namespace Class
    */
    var Class = {
        default_behaviors: []
    };

    var base_class_attributes = /** @lends Class.BaseClass */ {
        supers: [],
        _protected_class_attributes: { supers: true, _prototype_inherit_level: true, _class_inherited_methods: true, toString: true, inherit: true, whenInherited: true },
        _prototype_inherit_level: {},
        _class_inherited_methods : {},
        _stacked_instance_methods: {},
        _merge_on_inherit: { _merge_on_inherit: true, _protected_class_attributes: true, _stacked_instance_methods: true },
        /**
            Inherit from other classes
            @param {...constructor} class - parent class
            @return {Class} this
        */
        inherit: function() {
            if( arguments.length < 1 ) return this;

            // We copy prototypes
            WAF.each(arguments, function(sup) {
                if(typeof sup == 'undefined') {
                    var WakError = WAF.require('waf-core/error');
                    throw new WakError.Error("Can't inherit from undefined");
                }
                var proto = sup.prototype;
                for( var f in proto ) {
                    if( f != "constructor" && typeof proto[f] == "function" ) {
                        if(f != 'toString' && (sup._stacked_instance_methods[f] || this._stacked_instance_methods[f])) {
                            // If we have a stacked method, we must compose a list of all inherited methods 
                            // that use the same name and create a new function that execute them all.
                            // Stacked functions should not call $super.
                            (function(f) {
                                var list = [];
                                var list_class = [];
                                this.getAllSupers()
                                    .concat([sup, this])
                                    .concat(sup.getAllSupers())
                                    .forEach(function(c) {
                                        var func = c.prototype[f];
                                        if(typeof func != 'function') return;
                                        while(func._original) func = func._original;
                                        if(func._stack) return;
                                        if(!~list.indexOf(func)) {
                                            list.push(func);
                                            list_class.push([c, func]);
                                        }
                                    });
                                // sort by inheritance order
                                list_class.sort(function(c1, c2) {
                                    if(Class.inheritFrom(c1[0], c2[0])) return  1;
                                    if(Class.inheritFrom(c2[0], c1[0])) return -1;
                                    return 0;
                                });

                                list = list_class.map(function(c) { return c[1]; });
                                
                                var original = this.prototype[f];
                                this.prototype[f] = function() {
                                    for(var i = 0; i < list.length; i++)
                                        list[i].apply(this, arguments);
                                };
                                this.prototype[f]._stack = list;
                                this.prototype[f]._original = original;
                            }).call(this, f)
                        } else {
                            if(this.prototype[f] && (this._prototype_inherit_level[f] || []).length <= (sup._prototype_inherit_level[f] || []).length)
                                continue;
                            this.prototype[f] = proto[f];
                            this._prototype_inherit_level[f] = (sup._prototype_inherit_level[f] || []).concat([sup]);
                        }
                    }
                }
                var sup_props = WAF.clone(sup); 
                for(var k in sup_props) {
                    if(this._protected_class_attributes[k] || sup._protected_class_attributes[k]) continue;
                    if(typeof sup_props[k] == 'object' && (sup._merge_on_inherit[k] || this._merge_on_inherit[k])) {
                        if(sup_props[k] instanceof Array) {
                            this[k] = (this[k] || []).concat(sup_props[k]);
                        } else {
                            this[k] = WAF.extend(this[k] || {}, sup_props[k]);
                        }
                    } else {
                        this[k] = sup_props[k];
                        this._class_inherited_methods[k] = true;
                    }
                }
                if('whenInherited' in sup)
                    sup.whenInherited(this);
                this.supers.push(sup);
            }.bind(this));
            delete this._all_supers;

            // add the $super method
            /**
                Reteive and call a the method inherited from parents
                @param {string} name Function name
                @param {*} [args] Arguments to call the function with
                @param {*} value returned by the function
                @function $callSuper
                @memberof Class.BaseClass
                @instance
            */
            this.prototype.$callSuper = function(name) {
                return this.$super(name).apply(this, [].slice.call(arguments, 1))
            };

            var supers = this.supers;
            var constructor = this;
            
            /**
                Reteive a the method inherited from parents
                @returns {function}
                @function $super
                @memberof Class.BaseClass
                @instance
            */
            this.prototype.$super = function(name, _class) {
                if (_class) {
                    return _class.prototype[name] && _class.prototype[name].bind(this);
                }
                var _supers = supers;
                if(name in constructor._prototype_inherit_level) { // find the right super if the method is allready inherited
                    constructor._prototype_inherit_level[name].reverse().some(function(sup) {
                        if(sup.prototype[name] != constructor.prototype[name])
                            return true;
                        _supers = sup.supers;
                    });
                }
                _supers = _supers.filter(function(sup) { return name in sup.prototype && typeof sup.prototype[name] == "function"; });
                var _level = Math.min.apply(Math, _supers.map(function(sup) { return (sup._prototype_inherit_level[name] || []).length; }));
                var len = _supers.length;
                for(var i = 0; i < len; i++) {
                    var sup = _supers[i];
                    if( (sup._prototype_inherit_level[name] || []).length == _level) {
                        return function() {
                            var old_$super = this.$super;
                            if (sup.prototype.$super) {
                                this.$super = sup.prototype.$super;
                            }
                            var r = sup.prototype[name].apply(this, arguments);
                            this.$super = old_$super;
                            return r;
                        }.bind(this);
                    }
                }
                return undefined;
            };
            return this;
        },
        /**
            Reteive the list of all supers
            @returns {Array} List of all supers
        */
        getAllSupers: function() {
            if (this._all_supers) {
                return this._all_supers;
            }
            this._all_supers = this.supers.slice(0);
            for( var i = 0; i < this.supers.length; i++) {
                var s = this.supers[i].getAllSupers();
                for(var j = 0; j < s.length; j++) {
                    if (!~this._all_supers.indexOf(s[j])) {
                        this._all_supers.push(s[j]);
                    }
                }
            }
            return this._all_supers;
        },
        /**
            Set a flag to protect a class attribute from being overridden on inherit
            @param {string} name Attribute name
        */
        protectClassAttribute: function(name) {
            this._protected_class_attributes[name] = true;
        },
        /**
            Unset a flag to protect a class attribute from being overridden on inherit
            @param {string} name Attribute name
        */
        unprotectClassAttribute: function(name) {
            delete this._protected_class_attributes[name];
        },
        /**
            Set a flag to make this method a stacked one. Stacked methods call the method on all inherited supers, by order of inheritance.
            @param {string} name Method name
        */
        stackInstanceMethods: function(name) {
            this._stacked_instance_methods[name] = true;
        },
        /**
            Set a flag to merge a class attribute on inheritance.
            @param {string} name Attribute name
        */
        mergeClassAttributeOnInherit: function(name) {
            this._merge_on_inherit[name] = true;
        }
    };

    /**
        Tell if an instance is a member of a class
        @param {object} instance
        @param {function} class
        @returns {boolean}
        @memberof Class
    */
    Class.instanceOf = function instanceOf(instance, klass) {
        if (!instance) {
             return false;
        }
        
        if(instance instanceof klass) {
            return true;
        }
        
        return Class.inheritFrom(instance.constructor, klass);
    };
    
    /**
        Tell if a class inherit from another class
        @param {function} class
        @param {function} class
        @returns {boolean}
        @memberof Class
    */
    Class.inheritFrom = function inheritFrom(constr, klass) {
        return constr && constr.getAllSupers && !!~constr.getAllSupers().indexOf(klass);
    };

        
    /**
        Create a new class
        @param {string} name
        @param {object} [methods]
        @returns {class}
        @memberof Class
    */
    Class.create = function create(name, methods) {

        /**
            @name Class.BaseClass
            @constructor
            @mixes MethodsHelper
            @mixes PropertiesHelper
            @abstract
        */
        var klass = function() {
            if (this.initialize) {
                this.initialize.apply(this, arguments);
            }
        };

        WAF.extend(true, klass, base_class_attributes);

        /**
            Tell if the instance is a member of a class
            @param {function} class
            @returns {boolean}
            @function isInstanceOf
            @memberof Class.BaseClass
            @instance
        */
        klass.prototype.isInstanceOf = function(klass) { return Class.instanceOf(this, klass); };


        /**
            Return a string representation of the object
            @returns {string}
            @function toString
            @memberof Class.BaseClass
        */
        klass.toString = function() { return 'Class ' + name; };


        /**
            Print a debug representation of the object to the console
            @function debug
            @memberof Class.BaseClass
            @instance
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
        
        Class.default_behaviors.forEach(function(b) {
            klass.inherit(b);
        });
        
        if (methods) {
            WAF.extend(klass.prototype, methods);
        }
        
        return klass;
    }


    return Class;
});
