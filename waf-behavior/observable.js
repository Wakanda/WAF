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
        Subscriber = WAF.require('waf-core/subscriber'),
        WakError = WAF.require('waf-core/error');
    
    /**
     * @class Observable
     * @augments Behavior.BaseBehavior
     */
    var klass = Behavior.create('Observable');
    var proto = klass.prototype;
    
    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof Observable
     * @instance
     * @method initProperties
     */
    proto.initProperties = function() {
        this._event_subscribers = {};
    };
    

    /**
     * A subscriber call back
     * User code aimed to be launched when the widget fire de the subscribed event
     * @this the observer, or if undefined, the subscriber itself
     * @callback Observable~SubscribeCallback
     * @param {Event} event - The event instance
     * @param {object} [user_data] - The optionnal user-defined data defined during subscribe
     */

    /**
     * subscribe to an event
     * @param {Event} event - Event class to subscribe
     * @param {string} [target] - Target filtering for the event
     * @param {Observable~SubscribeCallback} callback - the callback launched when the event is fired
     * @param {Class} [observer] - The object that is subscribing to the event
     * @param {object} [user_data] - User-defined data passed to the callback
     * @returns {Subscriber} Return a subscriber object to manage the subscription
     * @memberof Observable
     * @instance
     * @method subscribe
     */
    proto.subscribe = function(event, target, callback, observer, user_data) {
        // target is optional
        var subscriber;
        if(typeof target == 'function') {
            user_data = observer;
            observer = callback;
            callback = target;
            target = undefined;
        }
        
        if(typeof event == 'string') {
            event = Event[event];
        }
        
        if (Class.instanceOf(event, Subscriber)) {
            subscriber = event;
            event = subscriber.event;
        } else {
            if(Class.instanceOf(event, Event.All)) {
                event = event.conctructor; // We want the class, not an instance
            }
            
            subscriber = new Subscriber({
                event : event, 
                target : target, 
                callback : callback, 
                observer : observer, 
                user_data : user_data
            });
        }
        
        subscriber.subscribed.push(this);
        
        var identifier = event.getIdentifier();
        if(!(identifier in this._event_subscribers)) {
            this._event_subscribers[identifier] = [];
        }
        
        if(!this._event_subscribers[identifier].length && this.initSubscriber) {
            this.initSubscriber(event, identifier);
        }
        
        this._event_subscribers[identifier].push(subscriber);
        
        
        return subscriber;
    };
    
    /**
     * remove subscribers that match an event, target, callback or observer
     * If you wan't to remove a specific subscriber, use the subscriber object #unsubscribe() method
     * @param {Event|Subscriber} event - Event class to subscribe, or the specific subscriber
     * @param {string} [target] - Target filtering for the event
     * @param {Observable~SubscribeCallback} callback - the callback launched when the event is fired
     * @param {Class} [observer] - The object that is subscribing to the event
     * @memberof Observable
     * @instance
     * @method unsubscribe
     */
    proto.unsubscribe = function(event, target, callback, observer) {
        // target is optional
        var subscriber, identifier, storage, i;
        
        if(typeof target == 'function') {
            observer = callback;
            callback = target;
            target = undefined;
        }
        
        if (Class.instanceOf(event, Subscriber)) {
            subscriber = event;
            event = subscriber.event;
            identifier = event.getIdentifier();
            if(WAF.remove(this._event_subscribers[identifier], subscriber)) {
                WAF.remove(subscriber.subscribed, this);
            }
            
        } else {
    
            if(typeof event == 'string') {
                event = Event[event];
            }
            if(Class.instanceOf(event,Event.All)) {
                event = event.conctructor; // We want the class, not the instance
            }
    
            if(event) {
                this._removeSubscribersInList(event.getIdentifier(), event, target, callback, observer);
            } else {
                for(var k in this._event_subscribers)
                    this._removeSubscribersInList(k, event, target, callback, observer);
            }
        }
    };
    
    /**
     * remove subscribers that match an event, target, callback or observer for a given identifier
     * @param {integer} identifier
     * @param {Event|Subscriber} event - Event class to subscribe, or the specific subscriber
     * @param {string} [target] - Target filtering for the event
     * @param {Observable~SubscribeCallback} callback - the callback launched when the event is fired
     * @param {Class} [observer] - The object that is subscribing to the event
     * @private
     * @memberof Observable
     * @instance
     * @method _removeSubscribersInList
     */
    proto._removeSubscribersInList = function(identifier, event, target, callback, observer) {
        var l = this._event_subscribers[identifier];
        for(var i = l.length - 1; i >= 0; i--) {
            var subscriber = l[i];
            if(subscriber.match(event, target, callback, observer)) {
                if(WAF.remove(this._event_subscribers[identifier], subscriber)) {
                    WAF.remove(subscriber.subscribed, this);
                }
            }
        }
        if(!l.length && this.destroySubscriber) {
            this.destroySubscriber(event, identifier);
        }
    };
    
    /**
     * remove subscribers that match an event
     * If you wan't to remove a specific subscriber, use the subscriber object #unsubscribe() method
     * @param {Event} event - Event class to subscribe
     * @memberof Observable
     * @instance
     * @method unsubscribeEvent
     */
    proto.unsubscribeEvent = function(event, target) {
        this.unsubscribe(event, target);
    };
    
    /**
     * remove subscribers that match a callback 
     * If you wan't to remove a specific subscriber, use the subscriber object #unsubscribe() method
     * @param {Observable~SubscribeCallback} callback - the callback launched when the event is fired
     * @memberof Observable
     * @instance
     * @method unsubscribeCallback
     */
    proto.unsubscribeCallback = function(callback) {
        this.unsubscribe(undefined, callback);
    };
    
    /**
     * remove subscribers that match an observer
     * If you wan't to remove a specific subscriber, use the subscriber object #unsubscribe() method
     * @param {Class} [observer] - The object that is subscribing to the event
     * @memberof Observable
     * @instance
     * @method unsubscribeObserver
     */
    proto.unsubscribeObserver = function(observer) {
        this.unsubscribe(undefined, undefined, observer);
    };
    
    /**
     * fire an event
     * This method is used by the widget itself to fire an event.
     * @param {Event|string} event - The event instance, with it's target and data passed as constructor argument or the name of the event
     * @param {string} [target] - The optional target (if the first argument is a string)
     * @param {object} [data] - The optional data (if the first argument is a string)
     * @memberof Observable
     * @instance
     * @method fire
     */
    proto.fire = function(event, target, data) {
        // target is optional
        if(typeof target == 'object') {
            data = target;
            target = undefined;
        }
    
        var identifiers = event.constructor.getAllIdentifiers();
        if(!event.emitter) {
            event.emitter = this;
        }
        
        for(var i = 0; i < identifiers.length; i++) {
            if(!(identifiers[i] in this._event_subscribers)) {
                continue;
            }
            
            this._event_subscribers[identifiers[i]].forEach(function(subscriber) {
                
                if((typeof subscriber.target != 'undefined' && typeof event.target != 'undefined' &&
                  (( event.target.test && !event.target.test(subscriber.target)) ||
                   (!event.target.test &&  event.target !== subscriber.target)))) {
                    return;
                }
                subscriber.fire(event);
            }.bind(this));
        }
    };
    
    /**
     * Called to initialize behaviors of a cloned widget
     * @param {BaseWidget} master - The widget cloned from
     * @private
     * @memberof Observable
     * @instance
     * @method cloneBehavior
     */
    proto.cloneBehavior = function(master) {
        for(var identifier in master._event_subscribers) {
            identifier = parseFloat(identifier); // identifier are int, but object keys are strings
            this._event_subscribers[identifier] = master._event_subscribers[identifier].slice(0);
            this._event_subscribers[identifier].forEach(function(subscriber) { subscriber.subscribed.push(this); }.bind(this));
            if(this._event_subscribers[identifier].length && this.initSubscriber) {
                this.initSubscriber(this._event_subscribers[identifier].event, identifier);
            }
        }
    };
    


    return klass;
});
