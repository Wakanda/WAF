/** @module waf-behavior/properties */
WAF.define('waf-behavior/properties', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior'),
        Class = WAF.require('waf-core/class');

    /**
     * @class Properties
     * @augments Bindable
     */
    var Properties = Behavior.create();
    Properties.inherit(WAF.require('waf-behavior/bindable'));

    Properties.types = {};
    Properties.protectClassAttribute('types');

    Properties._properties = {};
    Properties.mergeClassAttributeOnInherit('_properties');

    function custom(property, method) {
        if(!property) {
            return;
        }
        var type = Properties.types[property.type] || Properties.types['*'];
        return type[method] || Properties.types['*'][method];
    }
    Properties._propertiesCustomHelper = custom;
    Properties.protectClassAttribute('_propertiesCustomHelper');


    /**
     * Add a property
     * @param {string} name
     * @param {object} [options={}]
     * @param {string} [options.type]
     * @param {any} [options.defaultValue]
     * @param {function} [options.defaultValueCallback]
     * @param {function} [options.onChange]
     * @param {booelan} [options.bindable=true]
     * @memberof Properties
     * @method addProperty
     * @public
     */
    Properties.addProperty = function(name, options) {
        var functionName = String.toCamelCase(name);
        for(var key in this._properties) {
            if(key.toLowerCase() === name.toLowerCase()) {
                throw "You can't define two properties with the same name (" + name.toLowerCase() + ")";
            }
        }
        options = this._properties[name] = WAF.extend({ 
            functionName: functionName,
            type: '*',
            bindable: true
        }, custom(options, 'options'), options || {});

        if(!(options.type in Properties.types)) {
            throw 'Unknow type "' + options.type + '" for property "' + name + '".';
        }

        // make all properties bindable
        if(options.bindable) {
            this._makeBindableProperty(name, function() { return this[functionName].apply(this, arguments); }, 'change');
        }

        custom(options, 'afterAdd').call(this, name, options);
        custom(options, 'optionsParsers').call(this, name, options);
    };

    /**
     * Remove a property
     * @param {string} name
     * @memberof Properties
     * @method removeProperty
     * @public
     */
    Properties.removeProperty = function(name) {
        delete this._properties[name];
        delete this.prototype[String.toCamelCase(name)];
        delete this.optionsParsers[name];
    };

    /**
     * Get the list of the properties 
     * @return {string[]} list of properties name
     * @memberof Properties
     * @method getProperties
     * @public
     */
    Properties.getProperties = function() {
        return Object.keys(this._properties);
    };

    /**
     * Called to initialize behaviors
     * @private
     * @memberof Properties
     * @instance
     * @method _initBehavior
     */
    Properties.prototype._initBehavior = function() {
        var storage = {};
        Object.keys(this.constructor._properties).forEach(function(key) {
            var property = this.constructor._properties[key];
            custom(property, 'init').call(this, key, property, storage);
        }.bind(this));
    };

    /**
     * @private
     * @memberof Properties
     * @instance
     * @method _init
     */
    Properties.prototype._init = function() {
        Object.keys(this.constructor._properties).forEach(function(key) {
            var property = this.constructor._properties[key];
            custom(property, 'installCallbacks').call(this, key, property);
        }.bind(this));
    };

    /**
     * Called to initialize behaviors of a cloned widget
     * @param {BaseWidget} master - The widget cloned from
     * @private
     * @memberof Properties
     * @instance
     * @method _cloneBehavior
     */
    Properties.prototype._cloneBehavior = function(master) {
        var thisEs   =   this._eventSubscribers.change || [];
        var masterEs = master._eventSubscribers.change || [];
        thisEs.forEach(function(subscriber) {
            if(masterEs.indexOf(subscriber) > -1) {
                this.removeSubscriber(subscriber); // remove cloned subscriber
            }
        }.bind(this));
    };

    Class.defaultBehaviors.push(Properties);


    // Default methods
    Properties.types['*'] = {
        listable: true,
        init: function(name, property, storage) {
            storage[name] = null;
            custom(property, 'createAccessor').call(this, name, property, storage);

            if('defaultValue' in property) {
                storage[name] = WAF.clone(property.defaultValue);
            }
            if(this.options && !(name in this.options) && 'defaultValueCallback' in property) {
                storage[name] = property.defaultValueCallback.call(this, name);
            }
        },
        createAccessor: function(name, property, storage) {
            this[property.functionName] = function(newValue) {
                if(arguments.length) {
                    var old = storage[name];
                    storage[name] = custom(property, 'normalize').call(this, newValue, property, name);
                    if(old !== storage[name]) {
                        this.fire('change', name, { value: storage[name], oldValue: old });
                    }
                }
                return storage[name];
            };

            this[property.functionName].onChange = function(callback) {
                return this.subscribe('change', name, function(event) {
                    callback.call(this, event.data.value, event.data.oldValue, event.target);
                }, this);
            }.bind(this);

            if(property.bindable) {
                this[property.functionName].bindDatasource = function(datasource, attribute, options) {
                    return this.bindDatasourceAttribute(datasource, attribute, name, options);
                }.bind(this);

                this[property.functionName].unbindDatasource = function() {
                    if(name in this._boundAttributes) {
                        this._boundAttributes[name].subscriber.unsubscribe();
                    }
                }.bind(this);

                this[property.functionName].boundDatasource = function() {
                    function makeBinding(binding) {
                        return {
                            datasourceName: binding.datasourceName,
                            datasource:     binding.datasource,
                            attribute:      binding.attribute,
                            formatters:     (binding.formatters || []).map(function(formatter) {
                                return {
                                    formatter: formatter,
                                    name:      formatter.kind,
                                    arguments: (formatter.arguments || []).map(function(argument) {
                                        if(typeof argument === 'object') {
                                            return makeBinding(argument);
                                        }
                                        return argument;
                                    })
                                };
                            }),
                            valid: !!binding.subscriber
                        };
                    }
                    if(name in this._boundAttributes) {
                        return makeBinding(this._boundAttributes[name]);
                    }
                    return null;
                }.bind(this);
            }
        },
        installCallbacks: function(name, property) {
            var accessor = this[property.functionName];
            for(var key in property) {
                if(/^on[A-Z]/.test(key) && typeof property[key] === 'function' && typeof accessor[key] === 'function') {
                    accessor[key](property[key]);
                }
            }
        },
        normalize: function(value, property, name) {
            return value;
        },
        options: {},
        afterAdd: function(name, property) {},
        optionsParsers: function(name, property) {
            this.optionsParsers[name.toLowerCase()] = function() {
                this[property.functionName](this.options[name.toLowerCase()]);
            };

            if(property.bindable) {
                this.optionsParsers['binding-' + name.toLowerCase()] = function() {
                    this[property.functionName].bindDatasource(this.options['binding-' + name.toLowerCase()]);
                };
            }
        }
    };

    // Default types
    Properties.types['string'] = {
        normalize: function(value) {
            return String(value);
        }
    };

    Properties.types['boolean'] = {
        normalize: function(value) {
            if(typeof value !== 'boolean') {
                return value === 'true';
            }
            return value;
        }
    };

    Properties.types['number'] = {
        normalize: function(value) {
            if(typeof value !== 'number') {
                return parseFloat(value);
            }
            return value;
        }
    };

    Properties.types['integer'] = {
        normalize: function(value) {
            if(typeof value !== 'number') {
                return parseInt(value, 10);
            }
            return Math.floor(value);
        }
    };

    Properties.types['date'] = {
        normalize: function(value) {
            if(value instanceof Date) {
                return value;
            }
            if(typeof value === 'string') {
                return new Date(Date.parse(value));
            }
            return new Date(value);
        }
    };

    Properties.types['enum'] = {
    };

    return Properties;
});
