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
WAF.define('waf-behavior/domhelpers', function() {
    "use strict";
    var Class = WAF.require('waf-core/class'),
        Behavior = WAF.require('waf-core/behavior'),
        Event = WAF.require('waf-core/event'),
        Subscriber = WAF.require('waf-core/subscriber'),
        WakError = WAF.require('waf-core/error');
    
    /**
     * @class DomHelpers
     * @augments Observable
     */
    var klass = Behavior.create('DomHelpers');
    var proto = klass.prototype;
    klass.inherit(WAF.require('waf-behavior/observable'));
    klass._auto_fired_dom_events = [];
    klass.mergeClassAttributeOnInherit('_auto_fired_dom_events');

    /**
     * An event modifier callback.
     * Used to change the wakanda event instance before firing it (i.e.: addind values to #data object).
     * @this The widget that fire the event
     * @callback DomHelpers~eventCallback
     * @param {Event} event - The event instance
     */

    /**
     * Configure the widget to send a Wakanda Event when the specified dom event happen
     * @param {string} dom_event - The DOM event name
     * @param {Event|function} event - The Wakanda event, or a function to launch
     * @param {string} [selector] - A selector, to restricit the dom event binding on specific sub node.
     * @param {DomHelpers~eventCallback} [eventCallback] - An event modfier  callback used to change the wakanda event instance before firing it (i.e.: addind values to #data object).
     * @memberof DomHelpers
     */
    klass.autoFireDomEvent = function(dom_event, event, selector, eventCallback) {
        
        if(typeof event == 'function' && !Class.inheritFrom(event,Event.All)) {
            eventCallback = event;
            selector = undefined;
            event = undefined;
        }
        
        if(typeof selector == 'function') {
            eventCallback = selector;
            selector = undefined;
        }
        this._auto_fired_dom_events.push({ event: event, dom_event: dom_event, selector: selector, eventCallback: eventCallback });
    };
    
    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof DomHelpers
     * @instance
     */
    proto.initProperties = function() {
        this._auto_fired_dom_events = this.constructor._auto_fired_dom_events.map(function(d) {
            return WAF.extend(true, {}, d);
        });
    };
        
    /**
     * Called to initialize behaviors
     * @private
     * @memberof DomHelpers
     * @instance
     */
    proto.initBehavior = function() {
        this._auto_fired_dom_events.forEach(function(d) {
            if(d.event) return;
            this._installDomHandler(d);
        }.bind(this));
    };
    
    /**
     * Called to initialize dom event when a subscriber is created
     * @param {Event} event - The event subscribed
     * @param {integer} identifier - the matched identifier
     * @private
     * @memberof DomHelpers
     * @instance
     */
    proto.initSubscriber = function(event, identifier) {
        this._auto_fired_dom_events.forEach(function(d) {
            var element;
            if(d.handler) {
                return;
            }
            if(!d.event) return;
    
            if(!~d.event.getAllIdentifiers().indexOf(identifier)) {
                return;
            }
            this._installDomHandler(d);
        }.bind(this));
    };
    
    /**
     * Install the dom event handler
     * @param {object} d - Contain the info on the event handler to install
     * @private
     * @memberof DomHelpers
     * @instance
     */
    proto._installDomHandler = function(d) {
        d.handler = function(event) {
            var new_event;
            if (d.event) {
                new_event = new d.event({ dom_event: event });
            }
            
            if(d.eventCallback) {
                d.eventCallback.call(this, new_event || event);
            }
            
            if (new_event) {
                this.fire(new_event);
                event.stopPropagation();
            }
        }.bind(this);
        var element = d.selector ? $(this.getNode()).find(d.selector) : $(this.getNode());
        element.on(d.dom_event, d.handler);
    };
    
    /**
     * Called to remove dom event when a subscriber is removed
     * @param {Event} event - The event subscribed
     * @param {integer} identifier - the matched identifier
     * @private
     * @memberof DomHelpers
     * @instance
     */
    proto.destroySubscriber = function(event, identifier) {
        if(!this._auto_fired_dom_events) {
            return;
        }
        
        this._auto_fired_dom_events.forEach(function(d) {
            var element;
            if(!d.handler) {
                return;
            }
    
            if(!d.event) return;
    
            if(!~d.event.getAllIdentifiers().indexOf(identifier)) {
                return;
            }
            
            element = d.selector ? $(this.getNode()).find(d.selector) : $(this.getNode());
            element.off(d.dom_event, d.handler);
            
            delete d.handler;
        }.bind(this));
    };

    /**
     * Add a property that update the innerHTML of the dom element automatically
     * Add a <name> property that can set or get the value
     * Add a <name>_allow_html property that can activate or deactivate the escaping of the html
     * The properties are bindable like any other properties
     * @param {string} name - The name of the property
     * @param {object} [options]
     * @param {any} [options.default_value] - The default value of the property
     * @param {string} [options.selector] - A selector, to specify the sub node to update.
     * @memberof DomHelpers
     */
    klass.addDomHtmlProperty = function(name, options) {
        options = options || {};
        if(!options.force_text)
            this.addProperty(name + '-allow-html', { default_value: 'true' });
        if(options.selector) {
            options = WAF.extend({
                getter: function() {
                    return $(this.node).find(options.selector).html();
                },
                setter: function(v) {
                    v = v || '';
                    if(this.options[name + '-allow-html'] != 'true')
                        v = v.escapeHTML();
                    $(this.node).find(options.selector).html(v);
                }
            }, options);
        } else {
            options = WAF.extend({
                getter: function() {
                    return this.node.innerHTML;
                },
                setter: function(v) {
                    v = v || '';
                    if(this.options[name + '-allow-html'] != 'true')
                        v = v.escapeHTML();
                    this.node.innerHTML = v;
                }
            }, options);
        }
        options.default_value_callback = function(name) {
            if(this.getNode().parentNode) {
                // if the widget is already attached in the dom 
                // then we can consider than the dom is correct 
                // and then don't define any default
                return undefined;
            }
            return options.default_value;
        };
        this.addProperty(name, options);
    };

    /**
     * Add a property that update the textContent of the dom element automatically. Html in the value will be escaped.
     * Add a <name> property that can set or get the value
     * The property is bindable like any other properties
     * @param {string} name - The name of the property
     * @param {object} [options]
     * @param {any} [options.default_value] - The default value of the property
     * @param {string} [options.selector] - A selector, to specify the sub node to update.
     * @memberof DomHelpers
     */
    klass.addDomTextProperty = function(name, options) {
        this.addDomHtmlProperty(name, WAF.extend({ force_text: true }, options || {}));
    };

    /**
     * Add a property that update an attribute of the dom element automatically.
     * Add a <name> property that can set or get the value
     * The property is bindable like any other properties
     * @param {string} name - The name of the property
     * @param {object} [options]
     * @param {any} [options.default_value] - The default value of the property
     * @param {string} [options.selector] - A selector, to specify the sub node to update.
     * @param {string} [options.attribute] - Attribute to change, default is name
     * @memberof DomHelpers
     */
    klass.addDomAttributeProperty = function(name, options) {
        options = options || {};
        options.attribute = options.attribute || name;
        if(options.selector) {
            options = WAF.extend({
                getter: function() {
                    return $(this.node).find(options.selector).attr(options.attribute);
                },
                setter: function(v) {
                    $(this.node).find(options.selector).attr(options.attribute, v);
                }
            }, options);
        } else {
            options = WAF.extend({
                getter: function() {
                    return this.node.getAttribute(options.attribute);
                },
                setter: function(v) {
                    this.node.setAttribute(options.attribute,  v);
                }
            }, options);
        }
        options.default_value_callback = function(name) {
            if(this.getNode().parentNode) {
                // if the widget is already attached in the dom 
                // then we can consider than the dom is correct 
                // and then don't define any default
                return undefined;
            }
            return options.default_value;
        };
        this.addProperty(name, options);
    };

    var Widget = WAF.require('waf-core/widget');
    Widget.default_behaviors.push(klass); // By inheritance, add Observable

    return klass;
});
