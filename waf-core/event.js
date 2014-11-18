/** @module waf-core/event */
WAF.define('waf-core/event', [], function() {
    "use strict";
    var Class = WAF.require('waf-core/class');

    /**
     * @class Event
     * @augments Class.BaseClass
     * @paran {string} obj.kind - kind of the event
     * @paran {string} [obj.target] - Target for event filtering
     * @paran {object} [obj.data={}] - Datas of the event
     * @param {Class.BaseClass} [obj.emitter] - object that fire the event
     * @paran {object} [obj.options={}] - 
     * @public
     */
    var Event = Class.create();

    Event.prototype.initialize = function(obj) {
        /**
         * Kind of the event
         * @type {string}
         * @public
         */
        this.kind = obj.kind;
        /**
         * Target filtering the event
         * @type {string|undefined}
         * @public
         */
        this.target = obj.target;
        /**
         * Data of the event
         * @type {object}
         * @public
         */
        this.data = obj.data || {};
        /**
         * List of objects that fired the event
         * @type {Class.BaseClass[]}
         * @public
         */
        this.emitters = [];
        /**
         * Parent event (if the event is refired)
         * @type {Event}
         * @public
         */
        this.parentEvent = this.data.parentEvent;
        if(this.parentEvent) {
            this.emitters = this.parentEvent.emitters.slice(0);
        }
        /**
         * Object that fire the event
         * @type {Class.BaseClass}
         * @public
         */
        this.emitter = obj.emitter;
        /**
         * Event options
         * @type {object}
         * @public
         */
        this.options = obj.options || {};
    };

    Object.defineProperty(Event.prototype, "emitter", {
        get: function() {
            return this._emitter;
        },
        set: function(value) {
            // insert the emiter at the begining of the emiters list
            this._emitter = value;
            if(this.emitters[0] !== value) {
                this.emitters.splice(0, 0, value);
            }
        }
    });

    // init touch gestures: this adds touch specific events like swipe,...
    if (WAF.PLATFORM && WAF.PLATFORM.isTouch === true) {
        jQuery(document.body).hammer({
            swipe_velocity: 0.2
        });
    }
    
    return Event;
});
