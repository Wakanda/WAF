WAF.define('waf-behavior/listable', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior'),
        Event = WAF.require('waf-core/event'),
        WakError = WAF.require('waf-core/error');

    /**
     * @class Listable
     * @augments Behavior.BaseBehavior
     */
    var klass = Behavior.create('Listable');
    var proto = klass.prototype;
    klass.inherit(WAF.require('waf-behavior/observable'));
    
    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof Listable
     * @instance
     */
    proto.initProperties = function() {
        this._values = [];
    };

    /**
     * Get or set the item at index
     * @param {integer} index - index of the item
     * @param {any} [value] - new item value
     * @return {any} item value
     * @memberof Listable
     * @instance
     */
    proto.item = function(index, value) {
        if(arguments.length > 1) {
            if(index > this._values.length) {
                this.index = this._values.length;
                this._values.push(value);
            } else {
                this._values[index] = value;
            }
            this.fire(new Event.Insert({ index: index }));
        }
        return this._values[index];
    };

    /**
     * Return the number of items
     * @return {integer} Number of items
     * @memberof Listable
     * @instance
     */
    proto.countItems = function() {
        return this._values.length;
    }

    /**
     * Insert an item at index
     * @param {integer} index - index of the item
     * @param {any} [value] - new item value
     * @memberof Listable
     * @instance
     */
    proto.insertItem = function(index, value) {
        if(index > this._values.length) {
            this.index = this._values.length;
            this._values.push(value);
        } else {
            this._values.splice(index, 0, value);
        }
        this.fire(new Event.Insert({ index: index }));
    };

    /**
     * Remove item at index
     * @param {integer} index - index of the item
     * @memberof Listable
     * @instance
     */
    proto.removeItem = function(index) {
        if(index < 0 || index >= this._values.length)
            return;
        this._values.splice(index, 1);
        this.fire(new Event.Remove({ index: index }));
    };
    
    

    /**
     * Append an item at the end of the list
     * @param {any} [value] - new item value
     * @memberof Listable
     * @instance
     */
    proto.push = function(value) {
        this.item(this.countItems(), value);
    };

    /**
     * Return and remove the item at the end of the list
     * @return {any} item value
     * @memberof Listable
     * @instance
     */
    proto.pop = function() {
        var value = this.item(this.countItems() - 1);
        this.removeItem(this.countItems() - 1);
        return value;
    };

    /**
     * Return and remove the item at the beggining of the list
     * @return {any} item value
     * @memberof Listable
     * @instance
     */
    proto.shift = function(value) {
        var value = this.item(0);
        this.removeItem(0);
        return value;
    };
    
    
    /**
     * @class Event.Listable
     * @augments Event.All
     */
    Event.create('Listable');
    /**
     * @class Event.Insert
     * @augments Event.Listable
     */
    Event.create('Insert', Event.Listable);
    /**
     * @class Event.Remove
     * @augments Event.Listable
     */
    Event.create('Remove', Event.Listable);


    return klass;
});
