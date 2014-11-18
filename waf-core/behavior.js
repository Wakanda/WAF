/** @module waf-core/behavior */
WAF.define('waf-core/behavior', function() {
    "use strict";
    /** @namespace Behavior */
    var Class = WAF.require('waf-core/class');
    var baseMethods = [];

    var Behavior = /** @lends Behavior */ {
        /**
         * Create a new Behavior Class
         * @returns {Behavior.BaseBehavior}
         * @public
         */
        create: function() {
            /**
             * @class Behavior.BaseBehavior
             * @augments Class.BaseClass
             * @abstract
             * @public
             */
            var klass = Class.create();
            klass.defaultOptions = {};
            klass.mergeClassAttributeOnInherit('defaultOptions');
            klass.optionsParsers = {};
            klass.mergeClassAttributeOnInherit('optionsParsers');

            baseMethods = Object.keys(klass.prototype);
            
            /**
            * Return the list of the default methods of a new behavior
            * @return {array} Array of methods names
            * @function getMethods
            * @memberof Behavior.BaseBehavior
            */
            klass.getMethods = function getMethods() {
                var r = [];
                for(var k in this.prototype) {
                    if(baseMethods.indexOf(k) < 0 && typeof this.prototype[k] === 'function') {
                        r.push(k);
                    }
                }
                return r;
            };

            return klass;
        }
    };


    return Behavior;
});
