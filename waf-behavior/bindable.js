WAF.define('waf-behavior/bindable', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior'),
        Event = WAF.require('waf-core/event'),
        WakError = WAF.require('waf-core/error');

    /**
     * @class Bindable
     * @augments Observable
     */
    var klass = Behavior.create('Bindable');
    var proto = klass.prototype;
    klass.inherit(WAF.require('waf-behavior/observable'));

    /******************************************************************************/
    /* Binding datasource attribute                                               */
    /******************************************************************************/

    /**
     * Bind a datasource attribute to a property
     * @param {Datasource} datasource - The datasource object
     * @param {string} attribute - The attribute name
     * @param {string} [property=''] - The property to bind the attribute
     * @memberof Bindable
     * @instance
     */
    proto.bindDatasourceAttribute = function(datasource, attribute, property) {
        property = property || '';
        var bp = this.constructor._bindable_properties && this.constructor._bindable_properties[property];
        var ba = this._binded_attributes[property];
        if(!bp && !ba) throw new WakError.Bindable('Unknown property: ' + property);
        
        var widget_subscriber, ds_subscriber;
        var that = this;
        var att = datasource.getAttribute(attribute);
        if (!att) return;

        // check if this property isn't already binded
        if (ba && ba.datasource) {
            if (ba.datasource == datasource && ba.attribute == attribute) 
                return ba.subscriber;
            ba.subscriber.unsubscribe();
        }
        
        // upgrade and save _binded_attibute with all neded values
        ba = ba || {};
        if(bp) WAF.extend(ba, bp);
        this._binded_attributes[property] = WAF.extend( ba, {
            datasource : datasource,
            attribute : attribute,
            _callback: function(value, event) {
                if (widget_subscriber) widget_subscriber.pause();
                ba.set_get_callback.call(that, value, event);
                if (widget_subscriber) widget_subscriber.resume();
            }
        });
        
        // install all the events handlers
        if (ba.event) {
            ba.widget_subscriber = widget_subscriber = this.subscribe(ba.event, property, function(event) {
                if(typeof ba.position != 'undefined' && ba.position !== datasource.getPosition()) return;
                var value = ba.get_callback ? 
                        ba.get_callback.call(this, event) :
                        ba.set_get_callback.call(this);
                ds_subscriber.pause();
                att.setValue(value);
                // FIXME: fix old widgets so they do not need a sync THEN REMOVE THE TWO UGLY LINES BELOW !!!
                if(Class.instanceOf(ba.datasource, WAF.DataSourceVar))
                    ba.datasource.sync();
                ds_subscriber.resume();
            }, this);
        }
        
        ds_subscriber = datasource.subscribe(Event.AttributeChange, attribute, function(event) {
            if(typeof ba.position != 'undefined' && ba.position !== datasource.getPosition()) return;
            var value = att.getValue();
            ba._callback(value, event);
        });

        // prepare the unsubscribe method
        ds_subscriber.unsubscribe = (function(unsubscribe) {
            return function() {
                delete that._binded_attributes[property];
                unsubscribe.call(this);
                if(widget_subscriber)
                    widget_subscriber.unsubscribe();
            }
        })(ds_subscriber.unsubscribe)
        ds_subscriber.property = property;
        ds_subscriber.unbind = ds_subscriber.unsubscribe;

        this._binded_attributes[property].subscriber = ds_subscriber;

        // property initialisation with ds attribute value
        if(typeof ba.position == 'undefined') {
            var value = att.getValue();
            ba._callback(value);
        } else {
            ds.getElement(ba.position, function(r) {
                var value = r.getAttributeValue(attribute);
                ba._callback(value);
            }.bind(this));
        }
        
        return ds_subscriber;
    };

    /**
     * A callback that can set or return the value
     * @this the widget instance
     * @callback Bindable~GetSetCallback
     * @param {any} [value] - The value to set. Get the value if no value is passed
     * @returns {any} The current value
     */

    /**
     * A callback that can set the value
     * @this the widget instance
     * @callback Bindable~SetCallback
     * @param {any} value - The value to set
     */

    /**
     * A callback that can return the value
     * @this the widget instance
     * @callback Bindable~GetCallback
     * @returns {any} The current value
     */

    /**
     * Bind a datasource attribute to some callback and event
     * This method allow to define and setup binding at runtime
     * @param {Datasource} datasource - The datasource object
     * @param {string} attribute - The attribute name
     * @param {Bindable~GetSetCallback|Bindable~SetCallback} set_get_callback - GetSet or Set callback.
     * @Param {Event} [event] - Event to subscribe on the widget to know when the value has changed
     * @param {Bindable~GetCallback} [get_callback] - Get callback.
     * @memberof Bindable
     * @instance
     */
    proto.bindDatasourceAttributeWithCallback = function(datasource, attribute, set_get_callback, event, get_callback) {
        var that = this;
        this._callback_binding_counter = (this._callback_binding_counter || 0) + 1;
        var property = 'callback' + this._callback_binding_counter;

        this._binded_attributes[property] = {
            set_get_callback: set_get_callback,
            event: event,
            get_callback: get_callback
        };

        var subscriber = this.bindDatasourceAttribute(datasource, attribute, property);
        var original_unsubscribe = subscriber.unsubscribe;
        subscriber.unsubscribe = function() {
            original_unsubscribe.call(this);
            delete that._binded_attributes[property];
        };
        subscriber.unbind = subscriber.unsubscribe;
        return subscriber;
    };

    /**
     * Define a bindable property
     * This method allow to define binding for the class
     * @param {string} [property=''] - The property name
     * @param {Bindable~GetSetCallback|Bindable~SetCallback} set_get_callback - GetSet or Set callback.
     * @Param {Event} [event] - Event to subscribe on the widget to know when the value has changed
     * @param {Bindable~GetCallback} [get_callback] - Get callback.
     * @memberof Bindable
     */
    klass.makeBindableProperty = function(property, set_get_callback, event, get_callback) {
        if(typeof property == 'function') {
            get_callback = event;
            event = set_get_callback;
            set_get_callback = property;
            property = '';
        }
        
        this._bindable_properties = this._bindable_properties || {};

        this._bindable_properties[property] = {
            set_get_callback: set_get_callback,
            event: event,
            get_callback: get_callback
        };

        this.options_parsers[property ? 'binding-' + property : 'binding'] = function(name) {
            var s = this.options[name].split('.');
            var source = sources[s[0]];
            if(!source) return;
            if(Class.instanceOf(source, WAF.DataSourceVar) && source._private.sourceType == 'scalar' && !s[1])
                s[1] = s[0];
            this.bindDatasourceAttribute(source, s[1], property);
        };
    };

    /**
     * Restrict bindings to a specified element of the daasource
     * @param {Datasource} datasource - The datasource object
     * @param {interger} position - The position to restrict the bindings of this datasource
     * @memberof Bindable
     * @instance
     */
    proto.bindDatasourceElement = function(datasource, position) {
        for(var k in this._binded_attributes) {
            var ba = this._binded_attributes[k] = this._binded_attributes[k] || {};
            if(typeof ba.datasource == 'undefined')
                ba.datasource = datasource;
            if(ba.datasource == datasource)
                ba.position = position;
            datasource.getElement(position, function(r) {
                var value = r.element.getAttributeValue(ba.attribute);
                ba._callback(value);
            }.bind(this));
        }
    };    

    /******************************************************************************/
    /* Binding datasource action                                                  */
    /******************************************************************************/

    proto.bindDatasourceAction = function(datasource, action, event) {
        if(typeof event == 'string')
            event = this.constructor._bindable_actions[event];
        var subscriber = this.subscribe(event, function() {
            if (datasource[action]) {
                datasource[action]();
            }
        });
        this._binded_actions.push(subscriber);
        return subscriber;
    }

    klass.makeBindableAction = function(event, name) {
        this._bindable_actions = this._bindable_actions || {};
        if(typeof name == 'undefined')
            name = event.name.toLowerCase();
        this._bindable_actions[name] = event;
        this.options_parsers[name ? 'action-' + name : 'action'] = function(optname) {
            var s = this.options[optname].split('.');
            var source = sources[s[0]];
            if(!source) return;
            this.bindDatasourceAction(source, s[1], name);
        };
    };

    /******************************************************************************/
    /* Binding datasource collection                                              */
    /******************************************************************************/

    // install event listeners
    // FIXME: parseOptions is no longer used
    proto.parseOptions = function() {
        this.ds = {};
        this.dsAttr = {};
        var match, ds, attr, bindingName;
        for(var p in this.options) {
            ds = this.options[p];
            attr = null;
            if (ds && ds.indexOf('.') >= 0) {
                match = ds.split('.');
                ds = match[0];
                attr = match[1];
            }
            
            if (p.substr(0, 7) == 'binding') {
                if (p.indexOf('-') == 7) {
                    bindingName = p.substr(8);
                } else {
                    bindingName = '';
                }
            } else {
                continue;
            }
            
            ds = source[ds];
            if (attr) {
                attr = ds.getAttribute(attr);
            }
            
            if (attr) {
                this.dsAttr[bindingName] = attr;
            } else {
                this.ds[bindingName] = ds;
            }
        }
    }
    klass.makeBindableDatasource = function(property, callback, event) {
        this._bindable_datasource = this._bindable_datasource || {};
        if(typeof property == 'function') {
            event = callback;
            callback = property;
            property = '';
        }

        this._bindable_datasource[property] = {
            callback: callback,
            event: event
        };
    };

    proto.bindDatasourceCollection = function(datasource, callback, event) {
        var callbackObject, bindingId, subscriber, returnObj;
        
        if (!this._binded_datasource) {
            this._binded_datasource = {};
        }
         if (typeof callback != 'function') {
            bindingId = callback;
            callbackObject = this.constructor._bindable_datasource[bindingId || ''];
            if (callbackObject) {
                callback = callbackObject.callback;
                event = callbackObject.event;
            } else {
                return;
            }
        }
        
        if (!event) {
            event = Event.DataSource;
        }
        
        if (callback) {
            if (!this.bindingDsId) {
                this.bindingDsId = 0;
            }
            if (!bindingId) {
                bindingId = ++this.bindingDsId;
            }
            
            var that = this;

            
            this.ds[bindingId] = datasource;
            if (event instanceof Array) {
                returnObj = {};
                for(var i = 0; i < event.length; i++) {
                    
                    if (!bindingId) {
                        bindingId = ++this.bindingDsId;
                    }
                    
                    subscriber = new WAF.Subscriber({
                        event : (function(ind) {return event[ind]})(i), 
                        callback : callback.bind(that),
                        unsubscribe : (function(bindedId) {
                            return function() {
                                delete that._binded_datasource[bindedId];
                                delete that.ds[bindedId] ;
                                this.targetReference.unsubscribe(this);
                            }
                        })(bindingId)
                    });
                    
                    returnObj[event[i].getIdentifier()] = subscriber = datasource.subscribe(subscriber);
                    this._binded_datasource[bindingId] = subscriber;
                    
                    
                    //subscriber = datasource.subscribe(event[i], callback.bind(this));
                    
                }
            } else {
                subscriber = new WAF.Subscriber({
                    event : event, 
                    callback : callback.bind(that),
                    unsubscribe : (function(bindedId) {
                        return function() {
                            delete that._binded_datasource[bindedId];
                            delete that.ds[bindedId] ;
                            this.targetReference.unsubscribe(this);
                        }
                    })(bindingId)
                });
                //subscriber = datasource.subscribe(event, callback.bind(this));
                
                returnObj = subscriber = datasource.subscribe(subscriber);
                this._binded_datasource[bindingId] = subscriber;
            }
            
            return returnObj;
        }
    };

    proto.unbindDatasourceCollection = function(datasource, callback, event) {
        var callbackObject, dsItm, d, e, c;
        
        if (typeof callback != 'function') {
            callbackObject = this._binded_datasource[callback || ''];
            if (callbackObject) {
                callback = callbackObject.callback;
                event = callbackObject.event;
            } else {
                return;
            }
        }
        
        for (var p in this._binded_datasource) {
            dsItm = this._binded_datasource[p];
            d = dsItm.datasource;
            e = dsItm.event;
            c = dsItm.callback;
            
            if (
                (typeof datasource == 'undifined' || datasource == d) &&
                (typeof callback == 'undifined' || callback == c) &&
                (typeof event == 'undifined' || event == e)
            ) {
                d.unsubscribe(e, c);
                delete this._binded_datasource[p];
                delete this.ds[p] 
            }
        }
    };

    /******************************************************************************/
    /* Service methods                                                            */
    /******************************************************************************/

    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof Bindable
     * @instance
     */
    proto.initProperties = function () {
        this.ds = {};
        this.dsAttr = {};
        this._binded_attributes = {};
        this._binded_actions = [];
    }

    /**
     * Called to initialize behaviors of a cloned widget
     * @param {BaseWidget} master - The widget cloned from
     * @private
     * @memberof Bindable
     * @instance
     */
    proto.cloneBehavior = function(master) {
        // Attributes
        for(var k in master._binded_attributes) {
            var ba = master._binded_attributes[k];
            if(ba.datasource) {
                if(this.constructor._bindable_properties && k in this.constructor._bindable_properties)
                    this.bindDatasourceAttribute(ba.datasource, ba.attribute, k);
                else
                    this.bindDatasourceAttributeWithCallback(ba.datasource, ba.attribute, ba.set_get_callback, ba.event, ba.get_callback);
            }
            if(ba.widget_subscriber)
                this.unsubscribe(ba.widget_subscriber); // remove cloned subscriber
        }
        // Actions
        this._binded_actions = master._binded_actions.slice(0);
    };

    // make all properties bindable
    klass.doAfterClassMethod('addProperty', function(name) {
        this.makeBindableProperty(name, this.prototype[name], Event.Change);
    });
        
    WakError.create('Bindable');

    var Widget = WAF.require('waf-core/widget');
    Widget.default_behaviors.push(klass); // By inheritance, add Observable


    return klass;
});
