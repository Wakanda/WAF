/*
 * This file is part of Wakanda software, licensed by 4D under
 *  (i) the GNU General Public License version 3 (GNU GPL v3), or
 *  (ii) the Affero General Public License version 3 (AGPL v3) or
 *  (iii) a commercial license.
 * This file remains the exclusive property of 4D and/or its licensors
 * and is protected by national and international legislations.
 * In any event, Licensee's compliance with the terms and conditions
 * of the applicable license constitutes a prerequisite to any use of this file.
 * Except as otherwise expressly stated in the applicable license,
 * such license does not include any other license or rights on this file,
 * 4D's and/or its licensors' trademarks and/or other proprietary rights.
 * Consequently, no title, copyright or other proprietary rights
 * other than those specified in the applicable license is granted.
 */


/** @module waf-core/subscriber */
WAF.define('waf-core/subscriber', function() {
    "use strict";
    /** @namespace Subscriber */
    var Class = WAF.require('waf-core/class');

    /**
     * @class Subscriber
     * @augments Class.BaseClass
     * @param {Observable~SubscribeCallback} object.callback - Callback 
     * @param {object} [object.user_data] - User data
     * @param {string} [object.target] - Target for event filtering
     * @param {Event} [object.event] - Event subscribed
     * @param {Class.BaseClass} [object.observer] - Object that have subscribed
     */
    var s = Class.create('Subscriber');
    
    s.prototype.initialize = function(param) {
        if (param) {
            for (var p in param) {
                this[p] = param[p];
            }
        }
        this.subscribed = [];
        this._pause = false;
    };
    
    /**
     * Tel if the subscriber is paused
     * @returns {boolean}
     * @memberof Subscriber
     * @instance
     */
    s.prototype.isPaused = function() {
        return this._pause;
    };
    
    /**
     * Set the subscriber in pause. In pause callback isn't fired.
     * @memberof Subscriber
     * @instance
     */
    s.prototype.pause = function() {
        this._pause = true;
    };

    /**
     * Resume the subscriber. Callback'll be fired again.
     * @returns {boolean}
     * @memberof Subscriber
     * @instance
     */
    s.prototype.resume = function() {
        this._pause = false;
    };

    /**
     * Unsubscribe the event. The subscriber'll be deactivated.
     * @memberof Subscriber
     * @instance
     */
    s.prototype.unsubscribe = function() {
        var subscribed = this.subscribed;
        this.subscribed = []; // small perf tip to avoid removing subscribed one by one for behavior.observable
        subscribed.forEach(function(s) { s.unsubscribe(this); }.bind(this));
    };

    /**
     * Fire the callback if no paused
     * @param {Event} event - Event to pass to the callback
     * @memberof Subscriber
     * @instance
     */
    s.prototype.fire = function(event) {
        if(this._pause) return;
        if(!this.callback) return;
        return this.callback.call(this.observer || this, event, this.user_data);
    };

    /**
     * Tell if the subscriber match some criterias
     * @param {Event|undefined} event
     * @param {string|undefined} target
     * @param {Observable~SubscribeCallback|undefined} callback
     * @param {Class.BaseClass|undefined} observer
     * @returns {boolean}
     * @private
     * @memberof Subscriber
     * @instance
     */
    s.prototype.match = function(event, target, callback, observer) {
        return (typeof event    == 'undefined' || this.event    == event   ) &&
               (typeof target   == 'undefined' || this.target   == target  ) &&
               (typeof callback == 'undefined' || this.callback == callback) &&
               (typeof observer == 'undefined' || this.observer == observer);
    };

    return s;
});
