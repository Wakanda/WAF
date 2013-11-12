WAF.define('waf-behavior/layout/composed', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior'),
        Event = WAF.require('waf-core/event'),
        WakError = WAF.require('waf-core/error'),
        Widget = WAF.require('waf-core/widget');
    WAF.require('waf-behavior/style');

    /**
     * @class Layout.Composed
     * @augments Behavior.BaseBehavior
     */
    var klass = Behavior.create('Layout.Composed');
    var proto = klass.prototype;
    // Instance methods
    
    /**
     * Set the widget for a part
     * If a widget was already in this part, replace it. If no widget is given, clear the part.
     * @param {string} name - name of the part
     * @param {Widget} [widget] - the widget to set. If not, clear the part
     * @memberof Layout.Composed
     * @instance
     */
    proto.setPart = function(name, widget) {
        if(!(name in this._parts)) {
            /*
             * if(!this.options.runtime_part_create) //FIXME
             *   throw new WakError.LayoutComposed("Unknow part");
             */
            this._parts[name] = {};
        }
        var part = this._parts[name];
        if(part.widget != widget) {
            if(part.widget) part.widget.detach();
            if(widget) widget.detach();
        }
        part.widget = widget;
        if(widget) {
            var classname = 'waf-' + this.kind.toLowerCase() + '-part-' + name;
            widget.addClass(classname);
            this._composedInsertDomNode(widget);
            widget.attach(this, function() {
                if(widget) {
                    widget.removeClass(classname);
                    this._composedRemoveDomNode(widget);
                    if(part.events) {
                        part.events.forEach(function(d) {
                            if(d.subscriber)
                                d.subscriber.unsubscribe();
                            delete d.subscriber;
                        });
                    }
                }
                part.widget = undefined;
            });
            if(part.events && widget.subscribe) {
                part.events.forEach(function(d) {
                    widget.subscribe(d.event, function(event) {
                        d.subscriber = this.fire(new (d.new_event || d.event)(event, {part: part, widget: widget}));
                    }.bind(this), this);
                }.bind(this));
            }
        }
    };

    /**
     * Insert a domnode
     * @param {Widget} widget
     * @private
     * @memberof Layout.Container
     * @instance
     */
    proto._composedInsertDomNode = function(widget) {
        this.getNode().appendChild(widget.getNode());
    }

    /**
     * Remove a domnode
     * @param {Widget} widget
     * @private
     * @memberof Layout.Container
     * @instance
     */
    proto._composedRemoveDomNode = function(widget) {
        widget.getNode().parentNode.removeChild(widget.getNode());
    };
    
    /**
     * Get the widget for a part
     * @param {string} name - name of the part
     * @returns {Widget} The widget on this part, or undefined
     * @memberof Layout.Composed
     * @instance
     */
    proto.getPart = function(name) {
        if(!(name in this._parts))
            throw new WakError.LayoutComposed("Unknow part");
        return this._parts[name].widget;
    };
    
    /**
     * Remove a part
     * @param {string} name - name of the part
     * @memberof Layout.Composed
     * @instance
     */
    proto.removePart = function(name) {
        if(!(name in this._parts))
            throw new WakError.LayoutComposed("Unknow part");
        this.setPart(name);
        delete this._parts[name];
    };
    
    /**
     * Get the list of the parts
     * @return {string[]}
     * @memberof Layout.Composed
     * @instance
     */
    proto.getParts = function() {
        return Object.keys(this._parts);
    };
    
    /**
     * Create the parts when creating a new widget
     * @private
     * @memberof Layout.Composed
     * @instance
     */
    proto.createChildren = function(nosubwidget) {
        for(var k in this._parts) {
            var part = this._parts[k];
            if(!nosubwidget && part.widgetclass && !part.widget) {
                var part_options = part.options || {}
                if(typeof part_options == 'function')
                    part_options = part_options.call(this, k, part.widgetclass);
                this.setPart(k, new part.widgetclass(part_options));
            }
        }
    };
    
    /**
     * Called to initialize behaviors of a cloned widget
     * @param {BaseWidget} master - The widget cloned from
     * @private
     * @memberof Layout.Composed
     * @instance
     */
    proto.cloneBehavior = function(master) {
        for(var k in this._parts) {
            this.setPart(k, master.getPart(k).clone());
        }
    };
    
    /**
     * Intanciate children from the dom nodes that already exists.
     * @private
     * @memberof Layout.Composed
     * @instance
     */
    proto.initChildrenFromDom = function() {
        var that = this;
        var class_prefix = 'waf-' + this.kind.toLowerCase() + '-part-';
        $(this.node).children('[class*=' + class_prefix + ']').each(function(i) {
            var partname = new RegExp(class_prefix + '([^ ]*)').exec(this.className)[1]
            var part = that._parts[partname] = that._parts[partname] || {};
            var part_options = part.options || {}
            if(typeof part_options == 'function')
                part_options = part_options.call(that);

            // part of a composed widget that may allready be claimed by a container behavior must be attached to the right part
            var widget;
            try {
                widget = Widget.instanceFromDom(this);
            } catch(e) {
                if(!(e instanceof WakError.Exists)) throw e;
                widget = Widget.get(this);
            }
            if(widget) {
                that.setPart(partname, widget);
                widget.changeOptions(part_options);
            }
        });
        this.createChildren();
    };
    
    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof Layout.Composed
     * @instance
     */
    proto.initProperties = function() {
        this._parts = WAF.extend(true, {}, this.constructor._parts);
    }
    
    /**
     * Return all the children that are parts of the widget
     * @returns {Widget[]} List of widgets
     * @private
     * @memberof Layout.Composed
     * @instance
     */
    proto.children = function() {
        var r = [];
        for(var k in this._parts)
            if(this._parts[k].widget)
                r.push(this._parts[k].widget);
        return r;
    };
    

    
    // Class Methods
    klass._parts = {};
    /**
     * Function that return the options used to create the widget
     * @callback Layout.composed~optionsCallback
     * @this the current widget
     * @param {string} name - the part name
     * @param {Widget} widgetclass - the sub widget class to create
     * @return {object} the options
     */

    /**
     * Set the widget class for a part
     * @param {string} name - The part name
     * @param {Widget} widgetclass - The widget class
     * @param {object|Layout.composed~optionsCallback} [options] - The options to used to create the widget instance, or a function that will return thoses options
     * @memberof Layout.Composed
     */
    klass.setPart = function(name, widgetclass, options) {
        this._parts[name] = {};
        if(widgetclass)
            this._parts[name].widgetclass = widgetclass;
        else
            delete this._parts[name].widgetclass;
        if(options)
            this._parts[name].options = options;
        else
            delete this._parts[name].options;
    };
    
    /**
     * Remove a part
     * @param {string} name - The part name
     * @memberof Layout.Composed
     */
    klass.removePart = function(name) {
        if(!(name in this._parts))
            throw new WakError.LayoutComposed("Unknow part");
        delete this._parts[name];
    };
    
    /**
     * Return the list of the parts
     * @return {string[]}
     * @memberof Layout.Composed
     */
    klass.getParts = function() {
        return Object.keys(this._parts);
    };
    
    /**
     * Add methods that are proxy to the part
     * @param {Behavior|string[]} methods_or_behavior - List of methods name, or a behaviot
     * @param {string} name - The part name to proxy
     * @param {string} [prefix=''] - String to preprend to all functions created. Function name first letter will be put upper case to respect camelcase notation.
     * @param {string} [suffix=''] - String to append to all function created
     */
    klass.addProxiedMethods = function(methods_or_behavior, part, prefix, suffix) {
        prefix = prefix || '';
        var methods = [];
        if(Array.isArray(methods_or_behavior))
            methods = behaviors;
        if(methods_or_behavior.getMethods)
            methods = methods_or_behavior.getMethods();
        methods.forEach(function(k) {
            var n = prefix ? prefix + k.capitalize() : k;
            if(n in this.prototype) return;
            this.prototype[n] = function() {
                var p = this.getPart(part);
                if(!p)
                    throw new WakError.LayoutComposed("Part is undefined");
                if(typeof p[k] != 'function')
                    throw new WakError.LayoutComposed("Behavior is unsupported");
                return p[k].apply(p, arguments);
            };
        }.bind(this));
    };

    /**
     * Let the widget refire an event fired by the part
     * @param {Event} event - the event to listen and refire
     * @param {string} name - the part name to subscribe
     * @param {Event} [new_event] - if given change the event type
     */
    klass.addProxiedEvent = function(event, name, new_event) {
        if(!(name in this._parts))
            throw new WakError.LayoutComposed("Unknow part");
        var part = this._parts[name];
        part.events = part.events || [];
        part.events.push({ event: event, new_event: new_event });
    };
    
    /**
     * @class WakError.LayoutComposed
     * @augments WakError.Error
     */
    WakError.create('LayoutComposed');
    


    return klass;
});
