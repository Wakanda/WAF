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
WAF.define('waf-behavior/observable', function() {
    "use strict";
    var Class = WAF.require('waf-core/class'),
        Behavior = WAF.require('waf-core/behavior'),
        Event = WAF.require('waf-core/event'),
        Subscriber = WAF.require('waf-core/subscriber');
    
    /**
     * @class Observable
     * @augments Behavior.BaseBehavior
     */
    var klass = Behavior.create();
    var proto = klass.prototype;
    
    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof Observable
     * @instance
     * @method _initProperties
     */
    proto._initProperties = function() {
        this._eventSubscribers = {};
    };
    

    /**
     * A subscriber call back
     * User code aimed to be launched after the widget fire de the subscribed event
     * @this the observer, or if undefined, the subscriber itself
     * @callback Observable~SubscribeCallback
     * @param {Event} event - The event instance
     * @param {object} userData - The optionnal user-defined data defined during subscribe
     * @param {Subscriber} subscriber - The subscriber that launch the event
     */

    /**
     * subscribe to an event
     * the callback will be executed asynchronously
     * @param {string} event - The event name
     * @param {string} [target] - Target filtering for the event
     * @param {Observable~SubscribeCallback} callback - the callback launched after the event is fired
     * @param {Class} [observer] - The object that is subscribing to the event
     * @param {object} [userData] - User-defined data passed to the callback
     * @returns {Subscriber} Return a subscriber object to manage the subscription
     * @memberof Observable
     * @instance
     * @method subscribe
     * @public
     */
    proto.subscribe = function(eventKind, target, callback, observer, userData) {
        var subscriber;
        // target is optional
        if(typeof target === 'function') {
            userData = observer;
            observer = callback;
            callback = target;
            target = undefined;
        }
        
        if (Class.instanceOf(eventKind, Subscriber)) {
            subscriber = eventKind;
            eventKind = subscriber.event;
        } else {
            subscriber = new Subscriber({
                event : eventKind, 
                target : target, 
                callback : callback, 
                observer : observer, 
                userData : userData
            });
        }
        
        subscriber.subscribed.push(this);
        
        if(!(eventKind in this._eventSubscribers)) {
            this._eventSubscribers[eventKind] = [];
        }
        
        if(!this._eventSubscribers[eventKind].length && this._initSubscriber) {
            this._initSubscriber(eventKind);
        }
        
        this._eventSubscribers[eventKind].push(subscriber);
        
        
        return subscriber;
    };
    
    /**
     * remove subscribers that match an event, target, callback or observer
     * If you wan't to remove a specific subscriber, use the subscriber object #unsubscribe() method
     * @param {object} args - Properties to match
     * @param {string} [args.event] - Event subscribed
     * @param {string} [args.target] - Target filtering for the event
     * @param {Observable~SubscribeCallback} [args.callback] - the callback launched after the event is fired
     * @param {Class} [args.observer] - The object that is subscribing to the event
     * @memberof Observable
     * @instance
     * @method unsubscribe
     * @public
     */
    proto.unsubscribe = function(args) {
        if(args.event) {
            _removeSubscribersInList(this, args.event, args);
        } else {
            for(var k in this._eventSubscribers) {
                _removeSubscribersInList(this, k, args);
            }
        }
    };

    /**
     * remove subscribers that match an event, target, callback or observer for a given kind
     * @param {Widget} that 
     * @param {string} event 
     * @param {object|function} args - properties to match or function that return a boolean
     * @private
     */
    function _removeSubscribersInList(that, event, args) {
        var l = that._eventSubscribers[event];
        if(!l) {
            return;
        }
        for(var i = l.length - 1; i >= 0; i--) {
            var subscriber = l[i];
            if(subscriber.match(args)) {
                if(WAF.remove(l, subscriber)) {
                    WAF.remove(subscriber.subscribed, that);
                }
            }
        }
        // if no event listen anymore, we can call _destroySubscriber
        if(!l.length && that._destroySubscriber) {
            that._destroySubscriber(event);
        }
    }
    
    /**
     * remove a subscriber from this widget
     * @param {Subscriber} subscriber
     * @memberof Observable
     * @instance
     * @method removeSubscriber
     * @public
     */
    proto.removeSubscriber = function(subscriber) {
        var event = subscriber.event;
        if(WAF.remove(this._eventSubscribers[event], subscriber)) {
            WAF.remove(subscriber.subscribed, this);

            // if no event listen anymore, we can call _destroySubscriber
            if(!this._eventSubscribers[event].length && this._destroySubscriber) {
                this._destroySubscriber(event);
            }
        }
    };
    
    /**
     * fire an event
     * the callbacks will be executed asynchronously
     * This method is used by the widget itself to fire an event.
     * @param {string[]|string} event - The event name
     * @param {string|RegExp} [target] - The optional target 
     * @param {object} [data] - The optional data 
     * @param {object} [options] - options
     * @param {boolean} [options.deferred] - lauch the callback defered (setTimeout 0)
     * @param {boolean} [options.animationFrame] - launch the callback during an animation frame (defered)
     * @param {boolean} [options.once] - Discard previous pending events if true (only when defered)
     * @param {boolean} [options.onlyRealEvent] - launch callback only when the fired event is realy the subscribe event (not a sub event)
     * @memberof Observable
     * @instance
     * @method fire
     * @public
     */
    proto.fire = function(eventKinds, target, data, options) {
        if(typeof eventKinds === 'string') {
            eventKinds = [eventKinds];
        }
        // target is optional
        if(typeof target === 'object' && target.constructor !== RegExp) {
            options = data;
            data = target;
            target = undefined;
        }
        options = options || {};

        if('all' in this._eventSubscribers) {
            eventKinds.push('all');
        }

        if(options.onlyRealEvent) {
            eventKinds = eventKinds.slice(0, 1);
        }

        var event = new Event({
            kind: eventKinds[0],
            target: target,
            data: data,
            emitter: this,
            options: options
        });

        eventKinds.forEach(function(eventKind) {
            if(!(eventKind in this._eventSubscribers)) {
                return;
            }
            
            var evSubID, subscriberSubID, condition1, condition2, subCondition, subscribers, i;
            
            subscribers = this._eventSubscribers[eventKind];
            
            if (data && data.dispatchSubID) {
                evSubID = data.dispatchSubID;
            }
            
            for(i = 0; i < subscribers.length; i++) {
                
                subscriberSubID = undefined;
                if (subscribers[i] && subscribers[i].userData) {
                    subscriberSubID = subscribers[i].userData.subID;
                }
                
                subCondition = (subscribers[i].target !== undefined && target !== undefined);
                condition1 = subCondition && (target.test && !target.test(subscribers[i].target) || (!target.test &&  target !== subscribers[i].target));
                condition2 = ((evSubID !== undefined || (subscriberSubID !== undefined && subscriberSubID !== null)) &&  subscriberSubID !== evSubID);
		
                if(condition1 || condition2) {
                    continue;
                }
                
                subscribers[i].fire(event);
            }
        }.bind(this));
    };

    /**
     * Called to initialize behaviors of a cloned widget
     * @param {BaseWidget} master - The widget cloned from
     * @private
     * @memberof Observable
     * @instance
     * @method _cloneBehavior
     */
    proto._cloneBehavior = function(master) {
        for(var event in master._eventSubscribers) {
            var es = this._eventSubscribers[event] = (this._eventSubscribers[event] || []).concat(master._eventSubscribers[event]);
            
            // add the widget to the list of subscribed widgets for each subscribers
            for(var i = 0; i < es.length; i++) {
                es[i].subscribed.push(this);
            }
            
            // If needed call the initSubscriber
            if(es.length && this._initSubscriber) {
                this._initSubscriber(event);
            }
        }
    };
    klass.stackInstanceMethods('_cloneBehavior');
    


    return klass;
});
