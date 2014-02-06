/** @module waf-core/behavior */
WAF.define('waf-core/behavior', function() {
    "use strict";
    /** @namespace Behavior */
    var Class = WAF.require('waf-core/class');
    var base_methods = [];

    /**
     * Return the list of the default methods of a new behavior
     * @return {array} Array of methods names
     * @function getMethods
     * @memberof Behavior.BaseBehavior
     */
    function getMethods() {
        var r = [];
        for(var k in this.prototype)
            if(!~base_methods.indexOf(k) && typeof this.prototype[k] == 'function')
                r.push(k);
        return r;
    }

    var Behavior = /** @lends Behavior */ {
        /**
         * Create a new Behavior Class
         * @param {string} name
         * @returns {Behavior.BaseBehavior}
         */
        create: function(name) {
            /**
             * @class Behavior.BaseBehavior
             * @augments Class.BaseClass
             * @abstract
             */
            var klass = Class.create(name);
            klass.defaultOptions = {};
            klass.mergeClassAttributeOnInherit('defaultOptions');
            klass.optionsParsers = {};
            klass.mergeClassAttributeOnInherit('optionsParsers');

            for(var k in klass.prototype)
                base_methods.push(k);
            
            klass.getMethods = getMethods;
            return klass;
        }
    };


    return Behavior;
});
