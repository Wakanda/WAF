/** @module waf-core/event */
WAF.define('waf-core/event', function() {
    "use strict";
    /** @namespace Event */
    var Class = WAF.require('waf-core/class');

    var event_identifier = 0;
    var Event = /** @lends Event */{
        All: Class.create('Event'),
        /**
         * Create a new Event Class
         * @param {string} name
         * @param {Event} parent
         * @returns {Event}
         */
        create: function(name, parnt) {
            var e = Event[name] = Class.create(name);
            e.inherit(parnt || Event.All);
            delete e.inherit; // we prevent multiple inheritance
            e._identifier = event_identifier++;
            e.kind = name;
            return e;
        }
    };
    Event.All._identifier = event_identifier++;
    /**
     * @class Event.All
     * @augments Class.BaseClass
     * @param {Event} [parentEvent] - Parent event, if the event is refired
     * @paran {string} [target] - Target for event filtering
     * @paran {object} data - Datas of the event
     * @param {Class.BaseClass} [emiter] - object that fire the event
     * @method initialize
     */
    Event.All.prototype.initialize = function(parentEvent, target, data, emitter) {
        // parentEvent is optional
        if(!Class.instanceOf(parentEvent, Event.All)) {
            emitter = data;
            data = target;
            target = parentEvent;
            parentEvent = undefined;
        }
        // target is optional
        if(typeof target == 'object' && !(target instanceof RegExp)) {
            emitter = data;
            data = target;
            target = undefined;
        }
        /**
         * Target filtering the event
         * @type {string|undefined}
         */
        this.target = target;
        /**
         * List of objects that fired the event
         * @type {Class.BaseClass[]}
         */
        this.emitters = [];
        /**
         * Parent event (if the event is refired)
         * @type {Event}
         */
        this.parentEvent = parentEvent;
        if(parentEvent)
            this.emitters = parentEvent.emitters.slice(0);
        /**
         * Data of the event
         * @type {object}
         */
        this.data = data;
        /**
         * Object that fire the event
         * @type {Class.BaseClass}
         */
        this.emitter = emitter;
    };

    Object.defineProperty(Event.All.prototype, "emitter", {
        get: function() {
            return this._emitter;
        },
        set: function(value) {
            if(this.emitters[0] === value)
                this.emitters.splice(0, 1);
            this._emitter = value;
            this.emitters.splice(0, 0, value);
        }
    });
    
    /**
     * Return a unique identifier of the event
     * @returns {integer}
     * @memberof Event.All
     * @method getIdentifier
     */
    Event.All.getIdentifier = function() { return this._identifier; };
    /**
     * Return a unique identifier of the event
     * @returns {integer}
     * @memberof Event.All
     * @instance
     * @method getIdentifier
     */
    Event.All.prototype.getIdentifier = function() { return this.constructor.getIdentifier(); };
    /**
     * Return the list of all identifiers of the event and it's parents
     * @returns {integer[]}
     * @memberof Event.All
     * @method getAllIdentifiers
     */
    Event.All.getAllIdentifiers = function() {
        if(this._all_identifiers) // return cached value
            return this._all_identifiers;
        if(this.supers) {
            var i = this.supers.length;
            while(i--) {
                var p = this.supers[i];
                if(p && p.getAllIdentifiers)
                    return this._all_identifiers = [ this.getIdentifier() ].concat(p.getAllIdentifiers());
            }
        }
        return this._all_identifiers = [ this.getIdentifier() ];
    };
    Event.All.protectClassAttribute('_all_identifiers');


    /**
     * @class Event.Action
     * @augments Event.All
     */
    Event.create('Action');

    /**
     * @class Event.Change
     * @augments Event.All
     */
    Event.create('Change');
    
    return Event;
});
