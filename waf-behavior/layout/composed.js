WAF.define('waf-behavior/layout/composed', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior'),
        WakError = WAF.require('waf-core/error'),
        Widget = WAF.require('waf-core/widget');
    WAF.require('waf-behavior/style');

    /**
     * @class Layout.Composed
     * @augments Behavior.BaseBehavior
     */
    var klass = Behavior.create();
    var proto = klass.prototype;
    // Instance methods
    
    /**
     * Set the widget for a part
     * If a widget was already in this part, replace it. If no widget is given, clear the part.
     * @param {string} name - name of the part
     * @param {Widget} [widget] - the widget to set. If not, clear the part
     * @memberof Layout.Composed
     * @instance
     * @method setPart
     */
    proto.setPart = function(name, widget) {
        var aliasName;

        if(!(name in this._parts)) {
            /*
             * if(!this.options.runtime_part_create) //FIXME
             *   throw new WakError.LayoutComposed("Unknow part");
             */
            this._parts[name] = {};
        }
        var part = this._parts[name];
        if(part.widget !== widget) {
            if(part.widget) {
                part.widget._detach();
            }
            if(widget) {
                widget._detach();
            }
        }
        part.widget = widget;
        for(aliasName in part.aliasdProperties) {
            delete this[aliasName];
        }
        if(widget) {
            var classname = 'waf-' + this.kind.toLowerCase() + '-part-' + name;
            widget.addClass(classname);
            this._composedInsertDomNode(widget);
            widget._attach(this, function() {
                widget.removeClass(classname);
                this._composedRemoveDomNode(widget);
                if(part.events) {
                    part.events.forEach(function(eventDesc) {
                        if(eventDesc.subscriber) {
                            eventDesc.subscriber.unsubscribe();
                        }
                        delete eventDesc.subscriber;
                    });
                }
                part.widget = undefined;
            }.bind(this));
            if(part.events && widget.subscribe) {
                part.events.forEach(function(eventDesc) {
                    widget.subscribe(eventDesc.event, function(event) {
                        eventDesc.subscriber = this.fire(eventDesc.newEvent || eventDesc.event, { parentEvent: event, part: part, widget: widget });
                    }.bind(this), this);
                }.bind(this));
            }
            for(aliasName in part.aliasdProperties) {
                this[aliasName] = widget[part.aliasdProperties[aliasName]];
            }
        }
    };

    /**
     * Insert a domnode
     * @param {Widget} widget
     * @private
     * @memberof Layout.Container
     * @instance
     * @method _composedInsertDomNode
     */
    proto._composedInsertDomNode = function(widget) {
        this.getNode().appendChild(widget.getNode());
    };

    /**
     * Remove a domnode
     * @param {Widget} widget
     * @private
     * @memberof Layout.Container
     * @instance
     * @method _composedRemoveDomNode
     */
    proto._composedRemoveDomNode = function(widget) {
        if(widget.getNode().parentNode) {
            widget.getNode().parentNode.removeChild(widget.getNode());
        }
    };
    
    /**
     * Get the widget for a part
     * @param {string} name - name of the part
     * @returns {Widget} The widget on this part, or undefined
     * @memberof Layout.Composed
     * @instance
     * @method getPart
     */
    proto.getPart = function(name) {
        if(!(name in this._parts)) {
            throw new WakError.LayoutComposed("Unknow part");
        }
        return this._parts[name].widget;
    };
    
    /**
     * Remove a part
     * @param {string} name - name of the part
     * @memberof Layout.Composed
     * @instance
     * @method removePart
     */
    proto.removePart = function(name) {
        if(!(name in this._parts)) {
            throw new WakError.LayoutComposed("Unknow part");
        }
        this.setPart(name);
        delete this._parts[name];
    };
    
    /**
     * Get the list of the parts
     * @return {string[]}
     * @memberof Layout.Composed
     * @instance
     * @method getParts
     */
    proto.getParts = function() {
        return Object.keys(this._parts);
    };
    
    /**
     * Create the parts when creating a new widget
     * @private
     * @memberof Layout.Composed
     * @instance
     * @method _createChildren
     */
    proto._createChildren = function(nosubwidget) {
        for(var k in this._parts) {
            var part = this._parts[k];
            if(!nosubwidget && part.widgetClass && !part.widget) {
                var partOptions = part.options || {};
                if(typeof partOptions === 'function') {
                    partOptions = partOptions.call(this, k, part.widgetClass);
                }
                this.setPart(k, new part.widgetClass(partOptions));
            }
        }
    };
    
    /**
     * Called to initialize behaviors of a cloned widget
     * @param {BaseWidget} master - The widget cloned from
     * @private
     * @memberof Layout.Composed
     * @instance
     * @method _cloneBehavior
     */
    proto._cloneBehavior = function(master) {
        for(var k in this._parts) {
            var sub = master.getPart(k);
            if(sub) {
                this.setPart(k, sub.clone());
            }
        }
    };
    
    /**
     * Intanciate children from the dom nodes that already exists.
     * @private
     * @memberof Layout.Composed
     * @instance
     * @method _initChildrenFromDom
     */
    proto._initChildrenFromDom = function() {
        var that = this;
        var classPrefix = 'waf-' + this.kind.toLowerCase() + '-part-';
        $(this.node).children('[class*=' + classPrefix + ']').each(function(i) {
            var partname = new RegExp(classPrefix + '([^ ]*)').exec(this.className)[1];
            var part = that._parts[partname] = that._parts[partname] || {};
            var partOptions = part.options || {};
            if(typeof partOptions === 'function') {
                partOptions = partOptions.call(that);
            }

            // part of a composed widget that may allready be claimed by a container behavior must be attached to the right part
            var widget;
            try {
                widget = Widget.instanceFromDom(this);
            } catch(error) {
                if(!(error instanceof WakError.Exists)) {
                    throw error;
                }
                widget = Widget.get(this);
            }
            if(widget) {
                that.setPart(partname, widget);
                widget.changeOptions(partOptions);
            }
        });
        this._createChildren();
    };
    
    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof Layout.Composed
     * @instance
     * @method _initProperties
     */
    proto._initProperties = function() {
        this._parts = WAF.extend(true, {}, this.constructor._parts);
    };
    
    /**
     * Return all the children that are parts of the widget
     * @returns {Widget[]} List of widgets
     * @memberof Layout.Composed
     * @instance
     * @method children
     */
    proto.children = function() {
        var r = [];
        for(var k in this._parts) {
            if(this._parts[k].widget) {
                r.push(this._parts[k].widget);
            }
        }
        return r;
    };
    

    
    // Class Methods
    klass._parts = {};
    /**
     * Function that return the options used to create the widget
     * @callback Layout.composed~optionsCallback
     * @this the current widget
     * @param {string} name - the part name
     * @param {Widget} widgetClass - the sub widget class to create
     * @return {object} the options
     */

    /**
     * Set the widget class for a part
     * @param {string} name - The part name
     * @param {Widget} widgetClass - The widget class
     * @param {object|Layout.composed~optionsCallback} [options] - The options to used to create the widget instance, or a function that will return thoses options
     * @memberof Layout.Composed
     * @method setPart
     */
    klass.setPart = function(name, widgetClass, options) {
        this._parts[name] = {
            aliasdProperties: {}
        };
        if(widgetClass) {
            this._parts[name].widgetClass = widgetClass;
        } else {
            delete this._parts[name].widgetClass;
        }
        if(options) {
            this._parts[name].options = options;
        } else {
            delete this._parts[name].options;
        }
    };
    
    /**
     * Remove a part
     * @param {string} name - The part name
     * @memberof Layout.Composed
     * @method removePart
     */
    klass.removePart = function(name) {
        if(!(name in this._parts)) {
            throw new WakError.LayoutComposed("Unknow part");
        }
        delete this._parts[name];
    };
    
    /**
     * Return the list of the parts
     * @return {string[]}
     * @memberof Layout.Composed
     * @method getParts
     */
    klass.getParts = function() {
        return Object.keys(this._parts);
    };
    
    /**
     * Add methods that are proxy to the part
     * @param {Behavior|string[]} methodsOrBehavior - List of methods name, or a behaviot
     * @param {string} name - The part name to proxy
     * @param {string} [prefix=''] - String to preprend to all functions created. Function name first letter will be put upper case to respect camelcase notation.
     * @param {string} [suffix=''] - String to append to all function created
     * @method addProxiedMethods
     */
    klass.addProxiedMethods = function(methodsOrBehavior, part, prefix, suffix) {
        prefix = prefix || '';
        var methods = [];
        if(Array.isArray(methodsOrBehavior)) {
            methods = methodsOrBehavior;
        }
        if(methodsOrBehavior.getMethods) {
            methods = methodsOrBehavior.getMethods();
        }
        methods.forEach(function(k) {
            var n = prefix ? prefix + k.capitalize() : k;
            n += suffix || '';
            if(n in this.prototype) {
                return;
            }
            this.prototype[n] = function() {
                var p = this.getPart(part);
                if(!p) {
                    throw new WakError.LayoutComposed("Part is undefined");
                }
                if(typeof p[k] !== 'function') {
                    throw new WakError.LayoutComposed("Behavior is unsupported");
                }
                return p[k].apply(p, arguments);
            };
        }.bind(this));
    };

    /**
     * Let the widget refire an event fired by the part
     * @param {string} event - the event to listen and refire
     * @param {string} name - the part name to subscribe
     * @param {string} [newEvent] - if given change the event type
     * @method addProxiedEvent
     */
    klass.addProxiedEvent = function(event, name, newEvent) {
        if(!(name in this._parts)) {
            throw new WakError.LayoutComposed("Unknow part");
        }
        var part = this._parts[name];
        part.events = part.events || [];
        part.events.push({ event: event, newEvent: newEvent });
    };
    
    /**
     * Alias a property of one part and attach it to the widget
     * @param {string} aliasName - The name of the new aliasd property
     * @param {string} part - The name of the part to copy the property from
     * @param {string} name - The name of the property to copy
     * @method addAliasProperty
     */
    klass.addAliasProperty = function(aliasName, part, name) {
        var errorBase = 'Can\'t alias property "' + name + '" from part "' + part + '" to "' + aliasName + '": ';
        if(!(part in this._parts)) {
            throw errorBase + 'Unknown part';
        }

        var widgetClass = this._parts[part].widgetClass;
        if(!widgetClass) {
            throw errorBase + 'Unknown widget class';
        }

        var property = WAF.extend({}, widgetClass._properties[name]);
        if(!property) {
            throw errorBase + 'Unknown property';
        }
        property.functionName = String.toCamelCase(aliasName);

        if(this.getProperties().indexOf(aliasName) >= 0 || Object.keys(this._parts).some(function(part) {
            return aliasName in this._parts[part].aliasdProperties;
        }.bind(this))) {
            throw errorBase + 'Property alredy exists';
        }

        this._parts[part].aliasdProperties[aliasName] = name;

        var Properties = WAF.require('waf-behavior/properties');
        var custom = Properties._propertiesCustomHelper;
        custom(property, 'optionsParsers').call(this, aliasName, property);
    };

    /**
     * @class WakError.LayoutComposed
     * @augments WakError.Error
     */
    WakError.create('LayoutComposed');
    


    return klass;
});
