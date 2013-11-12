/** @module waf-behavior/propertieshelper */
WAF.define('waf-behavior/propertieshelper', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior'),
        Class = WAF.require('waf-core/class');

    /**
     * @class PropertiesHelper
     * @augments Behavior.BaseBehavior
     */
    var PropertiesHelper = Behavior.create('PropertiesHelper');
    PropertiesHelper._properties = {};
    PropertiesHelper._merge_on_inherit._properties = true;

    /**
     * Add a property
     * @param {string} name
     * @param {object} [options={}]
     * @param {any} [options.default_value]
     * @param {function} [options.getter]
     * @param {function} [options.setter]
     * @memberof PropertiesHelper
     */
    PropertiesHelper.addProperty = function(name, options) {
        name = name.replace(/-/g, '_');
        var function_name = String.toCamelCase(name);
        options = this._properties[name] = WAF.extend({ 
            function_name: function_name
        }, options || {});
        this.prototype[function_name] = function(value) {
            if(arguments.length) {
                this['_' + name] = value;
                if(options.setter)
                    options.setter.call(this, value, name);
                this.fire(new Event.Change(name, { value: value }));
            }
            if(options.getter)
                return options.getter.call(this, name);
            return this['_' + name];
        };

        // value can be passed through options
        this.options_parsers[name.replace(/_/g, '-')] = function() {
            this[function_name](this.options[name]);
        };
    };

    /**
     * Remove a property
     * @param {string} name
     * @memberof PropertiesHelper
     */
    PropertiesHelper.removeProperty = function(name) {
        delete this._properties[name];
        delete this.prototype[String.toCamelCase(name)];
        delete this.options_parsers[name];
    };

    /**
     * Get the list of the properties 
     * @return {string[]} list of properties name
     * @memberof PropertiesHelper
     */
    PropertiesHelper.getProperties = function() {
        return Object.keys(this._properties);
    };

    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof PropertiesHelper
     * @instance
     */
    PropertiesHelper.prototype.initProperties = function() {
        for(var k in this.constructor._properties)
            this['_' + k] = WAF.clone(this.constructor._properties[k].default_value);
    };
    PropertiesHelper.stackInstanceMethods('initProperties');

    /**
     * Called to initialize behaviors
     * @private
     * @memberof PropertiesHelper
     * @instance
     */
    PropertiesHelper.prototype.initBehavior = function() {
        for(var k in this.constructor._properties) {
            var property = this.constructor._properties[k]
            var v = property.default_value;
            if(!(k in this.options)) {
                if('default_value_callback' in property)
                    v = property.default_value_callback.call(this, k);
                 if(typeof v != 'undefined')
                     this[property.function_name](v);
            }
        }
    };
    PropertiesHelper.stackInstanceMethods('initBehavior');

    Class.default_behaviors.push(PropertiesHelper);


    return PropertiesHelper;
});
