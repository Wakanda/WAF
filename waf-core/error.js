/** @module waf-core/error */
WAF.define('waf-core/error', function() {
    "use strict";
    /** @namespace WarError */
    var Class = WAF.require('waf-core/class');
    var WakError = /** @lends WakError */ {
        /**
         * @class WakError.Error
         * @augments Class.BaseClass
         */
        Error: Class.create(),
        /**
         * Create a new Error Class
         * @param {string} name
         * @param {Error} parent
         * @returns {Error}
         */
        create: function(name, parnt, level) {
            if(typeof parnt === 'number') {
                level = parnt;
                parnt = undefined;
            }
            var e = this[name] = Class.create();
            e.kind = name;
            e.inherit(parnt || this.Error);
            delete e.inherit; // we prevent multiple inheritance
            if(typeof level === 'number') {
                e.prototype.level = function() { return level; };
            }
            return e;
        }
    };

    WakError.Error.prototype.toString = function() { return 'Error ' + (this.kind || '') + '(' + this.message + ')'; };
    WakError.Error.prototype.level = function() { return 0; };
    WakError.Error.prototype.initialize = function(message) {
        this.message = message;
    };

    /**
     * @class WakError.NotFound
     * @augments WakError.Error
     */
    WakError.create('NotFound');

    return WakError;
});
