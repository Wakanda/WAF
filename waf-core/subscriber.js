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
    var Class = WAF.require('waf-core/class');

    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame ||
                               window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
    if(!requestAnimationFrame) {
        requestAnimationFrame = function(cb) { return setTimeout(cb, 0); };
        cancelAnimationFrame = clearTimeout;
    }
    
    /**
     * @class Subscriber
     * @augments Class.BaseClass
     * @param {Observable~SubscribeCallback} object.callback - Callback 
     * @param {object} [object.userData] - User data
     * @param {string} [object.target] - Target for event filtering
     * @param {Event} [object.event] - Event subscribed
     * @param {Class.BaseClass} [object.observer] - Object that have subscribed
     * @param {object} [object.options] - options
     * @param {boolean} [options.deferred] - lauch the callback defered (setTimeout 0)
     * @param {boolean} [options.animationFrame] - launch the callback during an animation frame (defered)
     * @param {boolean} [options.once] - Discard previous pending events if true (only when defered)
     * @param {boolean} [options.onlyRealEvent] - launch callback only when the fired event is realy the subscribe event (not a sub event)
     * @public
     */
    var s = Class.create();
    
    s.prototype.initialize = function(param) {
        if (param) {
            WAF.extend(this, param);
        }
        this.subscribed = [];
        this._pause = false;
        this._pending = [];
        this.options = this.options || {};
    };
    
    /**
     * Tel if the subscriber is paused
     * @returns {boolean}
     * @memberof Subscriber
     * @instance
     * @method isPaused
     * @public
     */
    s.prototype.isPaused = function() {
        return this._pause;
    };
    
    /**
     * Set the subscriber in pause. In pause callback isn't fired.
     * @memberof Subscriber
     * @instance
     * @method pause
     * @public
     */
    s.prototype.pause = function() {
        this._pause = true;
    };

    /**
     * Resume the subscriber. Callback'll be fired again.
     * @returns {boolean}
     * @memberof Subscriber
     * @instance
     * @method resume
     * @public
     */
    s.prototype.resume = function() {
        this._pause = false;
    };

    /**
     * Unsubscribe the event. The subscriber'll be deactivated.
     * @memberof Subscriber
     * @instance
     * @method unsubscribe
     * @public
     */
    s.prototype.unsubscribe = function() {
        var subscribed = this.subscribed;
        this.subscribed = []; // small perf tip to avoid removing subscribed one by one for behavior.observable
        subscribed.forEach(function(s) { s.removeSubscriber(this); }.bind(this));
    };

    /**
     * Fire the callback if no paused
     * @param {Event} event - Event to pass to the callback
     * @param {object} [options] - options
     * @param {boolean} [options.deferred] - lauch the callback defered (setTimeout 0)
     * @param {boolean} [options.animationFrame] - launch the callback during an animation frame (defered)
     * @param {boolean} [options.once] - Discard previous pending events if true (only when defered)
     * @param {boolean} [options.onlyRealEvent] - launch callback only when the fired event is realy the subscribe event (not a sub event)
     * @private
     * @memberof Subscriber
     * @instance
     * @method fire
     */
    s.prototype.fire = function(event) {
        if(this._pause) {
            return;
        }
        if(!this.callback) {
            return;
        }
        
        var options = WAF.extend({}, event.options, this.options);

        if(options.once) {
            while(this._pending.length) {
                this._pending.shift()(); // execute the bounded "clear"
            }
        }
        
        var set = function(f) { f(); };
        var clear = function() {};
        if(options.defered || options.once) {
            set = setTimeout;
            clear = clearTimeout;
        }
        if(options.animationFrame) {
            set = requestAnimationFrame;
            clear = cancelAnimationFrame;
        }

        var id = set(function() {
            WAF.remove(this._pending, bindedClear);
            this.callback.call(this.observer || this, event, this.userData, this);
        }.bind(this), 0);
        if(id) {
            var bindedClear = clear.bind(window, id);
            this._pending.push(bindedClear);
        }
    };

    /**
     * Tell if the subscriber match some criterias
     * @param {object|function} args - properties to match, of function that return a boolean
     * @returns {boolean}
     * @private
     * @memberof Subscriber
     * @instance
     * @method match
     */
    s.prototype.match = function(args) {
        if(typeof args === 'function') {
            return args.call(this);
        }

        for(var k in args) {
            if(this[k] !== args[k]) {
                return false;
            }
        }
        return true;
    };

    return s;
});
