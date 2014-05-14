WAF.define('waf-behavior/bindable', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior'),
        WakError = WAF.require('waf-core/error');

    /**
     * @class Bindable
     * @augments Observable
     */
    var klass = Behavior.create();
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
     * @method bindDatasourceAttribute
     */
    proto.bindDatasourceAttribute = function(datasource, attribute, property) {
        if(!datasource) {
            return;
        }
        if(!datasource.getAttribute) {
            return;
        }

        property = property || '';
        var bp = this.constructor._bindableProperties && this.constructor._bindableProperties[property];
        var ba = this._bindedAttributes[property];
        if(!bp && !ba) {
            throw new WakError.Bindable('Unknown property: ' + property);
        }
        
        var widgetSubscriber, dsSubscriber;
        var that = this;
        var att = datasource.getAttribute(attribute);
        
        if (!att) {
            console.warn('Behavior/Bindable::bindDatasourceAttribute, attribute ', attribute, 'could not be found in Datasoruce => bind cancelled');
            return;
        }

        // check if this property isn't already binded
        if (ba && ba.datasource) {
            if (ba.datasource === datasource && ba.attribute === attribute) {
                return ba.subscriber;
            }
            ba.subscriber.unsubscribe();
        }
        
        // upgrade and save _binded_attibute with all neded values
        ba = ba || {};
        if(bp) {
            WAF.extend(ba, bp);
        }
        this._bindedAttributes[property] = WAF.extend( ba, {
            datasource : datasource,
            attribute : attribute,
            _callback: function(value, event) {
                if (widgetSubscriber) {
                    widgetSubscriber.pause();
                }
                ba.setGetCallback.call(that, value, event);
                if (widgetSubscriber) {
                    widgetSubscriber.resume();
                }
            }
        });
        
        // install all the events handlers
        if (ba.event) {
            ba.widgetSubscriber = widgetSubscriber = this.subscribe(ba.event, property, function(event) {
                if(ba.position !== undefined && ba.position !== datasource.getPosition()) {
                    return;
                }
                var value = ba.getCallback ? 
                        ba.getCallback.call(this, event) :
                        ba.setGetCallback.call(this);
                dsSubscriber.pause();
                att.setValue(value);
                // FIXME: fix old widgets so they do not need a sync THEN REMOVE THE TWO UGLY LINES BELOW !!!
                if(Class.instanceOf(ba.datasource, WAF.DataSourceVar)) {
                    ba.datasource.sync();
                }
                dsSubscriber.resume();
            }, this);
        }
        
        dsSubscriber = datasource.subscribe('attributeChange', attribute, function(event) {
            if(ba.position !== undefined && ba.position !== datasource.getPosition()) {
                return;
            }
            var value = att.getValue();
            ba._callback(value, event);
        });

        // prepare the unsubscribe method
        dsSubscriber.unsubscribe = (function(unsubscribe) {
            return function() {
                delete that._bindedAttributes[property];
                unsubscribe.call(this);
                if(widgetSubscriber) {
                    widgetSubscriber.unsubscribe();
                }
            };
        })(dsSubscriber.unsubscribe);
        dsSubscriber.property = property;
        dsSubscriber.unbind = dsSubscriber.unsubscribe;

        this._bindedAttributes[property].subscriber = dsSubscriber;

        // property initialisation with ds attribute value
        if(typeof ba.position === 'undefined') {
            var value = att.getValue();
            ba._callback(value);
        } else {
            datasource.getElement(ba.position, function(r) {
                var value = r.getAttributeValue(attribute);
                ba._callback(value);
            }.bind(this));
        }
        
        return dsSubscriber;
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
     * @param {Bindable~GetSetCallback|Bindable~SetCallback} setGetCallback - GetSet or Set callback.
     * @Param {Event} [event] - Event to subscribe on the widget to know when the value has changed
     * @param {Bindable~GetCallback} [getCallback] - Get callback.
     * @memberof Bindable
     * @instance
     * @method bindDatasourceAttributeWithCallback
     */
    proto.bindDatasourceAttributeWithCallback = function(datasource, attribute, setGetCallback, event, getCallback) {
        var that = this;
        this._callbackBindingCounter = (this._callbackBindingCounter || 0) + 1;
        var property = 'callback' + this._callbackBindingCounter;

        this._bindedAttributes[property] = {
            setGetCallback: setGetCallback,
            event: event,
            getCallback: getCallback
        };

        var subscriber = this.bindDatasourceAttribute(datasource, attribute, property);
        if(!subscriber) {
            return;
        }
        var originalUnsubscribe = subscriber.unsubscribe;
        subscriber.unsubscribe = function() {
            originalUnsubscribe.call(this);
            delete that._bindedAttributes[property];
        };
        subscriber.unbind = subscriber.unsubscribe;
        return subscriber;
    };

    /**
     * Define a bindable property
     * This method allow to define binding for the class
     * @param {string} [property=''] - The property name
     * @param {Bindable~GetSetCallback|Bindable~SetCallback} setGetCallback - GetSet or Set callback.
     * @Param {Event} [event] - Event to subscribe on the widget to know when the value has changed
     * @param {Bindable~GetCallback} [getCallback] - Get callback.
     * @memberof Bindable
     * @method makeBindableProperty
     */
    klass.makeBindableProperty = function(property, setGetCallback, event, getCallback) {
        if(typeof property === 'function') {
            getCallback = event;
            event = setGetCallback;
            setGetCallback = property;
            property = '';
        }
        
        this._bindableProperties = this._bindableProperties || {};

        this._bindableProperties[property] = {
            setGetCallback: setGetCallback,
            event: event,
            getCallback: getCallback
        };

        this.optionsParsers[property ? 'binding-' + property.toLowerCase() : 'binding'] = function(name) {
            /* global sources */
            var s = this.options[name].split('.');
            var source = sources[s[0]];
            if(!source) {
                return;
            }
            if(Class.instanceOf(source, WAF.DataSourceVar) && source._private.sourceType === 'scalar' && !s[1]) {
                s[1] = s[0];
            }
            this.bindDatasourceAttribute(source, s[1], property);
        };
    };

    /**
     * Restrict bindings to a specified element of the datasource
     * @param {Datasource} datasource - The datasource object
     * @param {interger} position - The position to restrict the bindings of this datasource
     * @memberof Bindable
     * @instance
     * @method bindDatasourceElement
     */
    proto.bindDatasourceElement = function(datasource, position) {
        var that = this;
        
        datasource.getElement(position, function(event) {
            for (var attName in that._bindedAttributes) {
                var attribute = that._bindedAttributes[attName] || {};
                
                if (attribute.datasource === undefined) {
                    attribute.datasource = datasource;
                }
                
                if (attribute.datasource === datasource) {
                    attribute.position = position;
                }
                
                var value = event.element.getAttributeValue(attribute.attribute);
                
                attribute._callback(value);
            }            
        });
    };

    /******************************************************************************/
    /* Service methods                                                            */
    /******************************************************************************/

    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof Bindable
     * @instance
     * @method _initProperties
     */
    proto._initProperties = function () {
        //this.ds = {};
        //this.dsAttr = {};
        this._bindedAttributes = {};
    };
    klass.stackInstanceMethods('_initProperties');

    /**
     * Called to initialize behaviors of a cloned widget
     * @param {BaseWidget} master - The widget cloned from
     * @private
     * @memberof Bindable
     * @instance
     * @method _cloneBehavior
     */
    proto._cloneBehavior = function(master) {
        // Attributes
        for(var k in master._bindedAttributes) {
            var ba = master._bindedAttributes[k];
            if(ba.datasource) {
                if(this.constructor._bindableProperties && k in this.constructor._bindableProperties) {
                    this.bindDatasourceAttribute(ba.datasource, ba.attribute, k);
                } else {
                    this.bindDatasourceAttributeWithCallback(ba.datasource, ba.attribute, ba.setGetCallback, ba.event, ba.getCallback);
                }
            }
            if(ba.widgetSubscriber) {
                this.removeSubscriber(ba.widgetSubscriber); // remove cloned subscriber
            }
        }
    };

    WakError.create('Bindable');

    var Class = WAF.require('waf-core/class');
    Class.defaultBehaviors.push(klass); // By inheritance, add Observable


    return klass;
});
