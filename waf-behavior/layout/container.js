WAF.define('waf-behavior/layout/container', function() {
    "use strict";
    var Class = WAF.require('waf-core/class'),
    Behavior = WAF.require('waf-core/behavior'),
    WakError = WAF.require('waf-core/error'),
    Widget = WAF.require('waf-core/widget');

    /**
     * @class Layout.Container
     * @augments Observable
     */
    var klass = Behavior.create();
    var proto = klass.prototype;
    klass.inherit(WAF.require('waf-behavior/observable'));

    // Instance methods
    /**
     * _Detach the widget at index
     * @param {integer} index
     * @memberof Layout.Container
     * @instance
     * @method detachWidget
     */
    proto.detachWidget = function(index) {
        if (typeof index !== 'number') {
            index = this.indexOfWidget(index);
        }
        if (index < 0 || index >= this._children.length) {
            return;
        }
        var widget = this._children[index];
        widget._detach();
        return widget;
    };

    /**
     * Return the index of the widget, or -1 if the widget wasn't found
     * @param {Widget} widget
     * @returns {integer}
     * @memberof Layout.Container
     * @instance
     * @method indexOfWidget
     */
    proto.indexOfWidget = function(widget) {
        return this._children.indexOf(widget);
    };

    /**
     * Insert a new widget at index
     * @param {integer} index
     * @param {Widget} widget
     * @returns {integer} The index of the inserted widget
     * @memberof Layout.Container
     * @instance
     * @method insertWidget
     */
    proto.insertWidget = function(index, widget) {
        if (this._restrict && !Class.instanceOf(widget, this._restrict)) {
            throw new WakError.Container("Wrong widget type: " + this._restrict.kind);
        }
        widget._detach();
        index = Math.min(index, this.countWidgets());
        this._children.splice(index, 0, widget);

        this._containerInsertDomNode(index, widget);

        widget._attach(this, function() {
            var index = this.indexOfWidget(widget);
            this._containerRemoveDomNode(widget);
            this._children.splice(index, 1);
            widget._detachCallback = undefined; // _detach call back is detachWidget(), we don't wan't to run it to time
            widget._detach();
            this.constructor._indexedEvents.forEach(function(indexedEvent) {
                widget.unsubscribe({ event: indexedEvent.event, observer: this });
            }.bind(this));
            if (this._lastWidgetIndex === index) {
                this._lastWidgetIndex = undefined;
            } else if (this._lastWidgetIndex > index) {
                this._lastWidgetIndex--;
            }
            this.fire('detachWidget', { widget: widget, index: index });
        }.bind(this));

        this.constructor._indexedEvents.forEach(function(indexedEvent) {
            if (widget.subscribe) {
                widget.subscribe(indexedEvent.event, function(event) {
                    var index = this.indexOfWidget(widget);
                    this.fire(indexedEvent.newEvent || indexedEvent.event, event.target, { parentEvent: event, index: index, widget: widget });
                }, this);
            }
        }.bind(this));
        this.fire('insertWidget', { widget: widget, index: index });
        this._lastWidgetIndex = index;
        return index;
    };

    /**
     * Move a widget
     * @param {integer} from
     * @param {integer} to
     * @memberof Layout.Container
     * @instance
     * @method moveWidget
     */
    proto.moveWidget = function(from, to) {
        var widget = this._children[from];
        if(widget === undefined) {
            return;
        }

        var lastWidget = this._children[this._lastWidgetIndex];

        this._children.splice(from, 1);
        this._children.splice(to, 0, widget);
        
        this._containerRemoveDomNode(widget);
        this._containerInsertDomNode(to, widget);
        
        this._lastWidgetIndex = this._children.indexOf(lastWidget);

        this.fire('moveWidget', { widget: widget, from: from, to: to });
    };

    /**
     * return the numbers of widgets contained
     * @returns {integer}
     * @memberof Layout.Container
     * @instance
     * @method countWidgets
     */
    proto.countWidgets = function() {
        return this._children.length;
    };

    /**
     * Return an array of all the contaiend widgets
     * @returns {Widget[]}
     * @memberof Layout.Container
     * @instance
     * @method widgets
     */
    proto.widgets = function() {
        return this._children.slice(0);
    };

    /**
     * Append a new widget at the end of the conatiner
     * @param {Widget} widget
     * @returns {integer} The index of the appended widget
     * @memberof Layout.Container
     * @instance
     * @method attachWidget
     */
    proto.attachWidget = function(widget) {
        var i = this.countWidgets();
        this.insertWidget(i, widget);
        return i;
    };

    /**
     * Get or set the widget at index
     * @param {integer} index
     * @param {Widget} [widget] - If given, replace the widget at index
     * @returns {Widget} 
     * @memberof Layout.Container
     * @instance
     * @method widget
     */
    proto.widget = function(index, widget) {
        if (widget) {
            this.detachWidget(index);
            this.insertWidget(index, widget);
        }
        return this._children[index];
    };

    /**
     * _Detach all widgets
     * @memberof Layout.Container
     * @instance
     * @method detachAllWidgets
     */
    proto.detachAllWidgets = function() {
        while (this._children.length) {
            this.detachWidget(0);
        }
    };

    /**
     * _Detach and destroy all widgets
     * @memberof Layout.Container
     * @instance
     * @method detachAndDestroyAllWidgets
     */
    proto.detachAndDestroyAllWidgets = function() {
        while (this._children.length) {
            this.detachWidget(0).destroy();
        }
    };

    /**
     * Return the last inserted or appended widget (not the widget at the end of the conatiner)
     * @returns {Widget} 
     * @memberof Layout.Container
     * @instance
     * @method lastWidget
     */
    proto.lastWidget = function() {
        if (typeof this._lastWidgetIndex === 'undefined') {
            throw new WakError.Container("Widget not found");
        }
        return this.widget(this._lastWidgetIndex);
    };

    /**
     * Return all the children that are parts of the widget
     * @returns {Widget[]} List of widgets
     * @private
     * @memberof Layout.Container
     * @instance
     */
    proto.children = proto.widgets;

    /**
     * Call a method on all contained widgets if the methods exists on the widget. Return an array with the results
     * @param {string} funcname - the name of the function
     * @param {any} [...args] - Arguments for the function
     * @returns {any[]} 
     * @memberof Layout.Container
     * @instance
     * @method invoke
     */
    proto.invoke = function(funcname) {
        var r = [];
        for (var i = 0, l = this.countWidgets(); i < l; i++) {
            var widget = this.widget(i);
            if (widget[funcname]) {
                r.push(widget[funcname].apply(widget, [].slice.call(arguments, 1)));
            }
        }
        return r;
    };

    /**
     * Called to initialize behaviors of a cloned widget
     * @param {BaseWidget} master - The widget cloned from
     * @private
     * @memberof Layout.Container
     * @instance
     * @method _cloneBehavior
     */
    proto._cloneBehavior = function(master) {
        master.invoke('clone').forEach(this.attachWidget.bind(this));
    };

    /**
     * Intanciate children from the dom nodes that already exists.
     * @private
     * @memberof Layout.Container
     * @instance
     * @method _initChildrenFromDom
     */
    proto._initChildrenFromDom = function(widget) {
        var that = this;
        $(this._getContainerNode()).children().each(function(i) {
            if(!(this.id in Widget._instances)) {
                var widget = that._instanceFromDom(this);
                if (widget && (!that._restrict || Class.instanceOf(widget, that._restrict))) {
                    that.attachWidget(widget);
                }
            }
        });
    };
    /**
     * Instanciate a widget from a dom node
     * throw if a widget for this dom node already exists
     * return undefined if no widget can be instanciate from this dom node
     * @param {DomNode} node
     * @return {Widget|undefined}
     * @private
     * @memberof Layout.Container
     * @instance
     * @method _instanceFromDom
     */
    proto._instanceFromDom = function(node) {
        return Widget.instanceFromDom(node);
    };

    /**
     * return the container node
     * Can be overriden by the widget
     * @private
     * @memberof Layout.Container
     * @instance
     * @method _getContainerNode
     */
    proto._getContainerNode = function() {
        return this.node;
    };

    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof Layout.Container
     * @instance
     * @method _initProperties
     */
    proto._initProperties = function() {
        this._children = [];
        this._restrict = this.constructor._restrict || Widget.BaseWidget;
    };

    /**
     * Restict the inserted widget to be member of the class
     * @param {Widget}
     * @memberof Layout.Container
     * @instance
     * @method restrictWidget
     */
    proto.restrictWidget = function(widget) {
        if (arguments.length) {
            this._restrict = widget;
        }
        return this._restrict;
    };

    /**
     * Insert a domnode
     * @param {integer} index
     * @param {Widget} widget
     * @private
     * @memberof Layout.Container
     * @instance
     * @method _containerInsertDomNode
     */
    proto._containerInsertDomNode = function(index, widget) {
        var node = widget.getNode();

        if (this._isReady || node.parentNode !== this._getContainerNode()) {
            if (index >= this._children.length - 1) {
                this._getContainerNode().appendChild(node);
            } else {
                this._getContainerNode().insertBefore(node, this._children[index + 1].getNode());
            }
        }
    };

    /**
     * Remove a domnode
     * @param {Widget} widget
     * @private
     * @memberof Layout.Container
     * @instance
     * @method _containerRemoveDomNode
     */
    proto._containerRemoveDomNode = function(widget) {
        if(widget.getNode().parentNode) {
            widget.getNode().parentNode.removeChild(widget.getNode());
        }
    };

    // Class Methods
    /**
     * Restict the inserted widget to be member of the class
     * @param {Widget}
     * @memberof Layout.Container
     * @method restrictWidget
     */
    klass.restrictWidget = function(widget) {
        if (arguments.length) {
            this._restrict = widget;
        }
        return this._restrict;

    };

    /**
     * Function that return an index
     * @callback Layout.Container~indexCallback
     * @this the current widget
     * @return {integer} the index
     */

    /**
     * Add methods to acces the methods in the list or in the behavior on the chidrens widgets
     * Created methods can be prefixed and suffixed. The argument of the methods is the index if defaultIndex is undefined. The default index can be an integer or a function that return an integer.
     * @param {Behavior|string[]} methodsOrBehavior - List of methods name, or a behaviot
     * @param {string} [prefix='indexed'] - String to preprend to all functions created. Function name first letter will be put upper case to respect camelcase notation.
     * @param {string} [suffix=''] - String to append to all function created
     * @param {integer|Layout.Container~indexCallback} [defaultIndex] - The default index to use, or function to get it
     * @memberof Layout.Container
     * @method addIndexedMethods
     */
    klass.addIndexedMethods = function(methodsOrBehavior, prefix, suffix, defaultIndex) {
        if (typeof prefix !== 'string' && typeof defaultIndex === 'undefined') {
            defaultIndex = prefix;
            prefix = undefined;
        }
        if (typeof suffix !== 'string' && typeof defaultIndex === 'undefined') {
            defaultIndex = suffix;
            suffix = undefined;
        }
        if (typeof prefix === 'undefined') {
            prefix = 'indexed';
        }
        suffix = suffix || '';
        var methods = [];
        if(Array.isArray(methodsOrBehavior)) {
            methods = methodsOrBehavior;
        }
        if(methodsOrBehavior.getMethods) {
            methods = methodsOrBehavior.getMethods();
        }
        methods.forEach(function(key) {
            var name = key + suffix;
            if (prefix) {
                name = prefix + name[0].toUpperCase() + name.substr(1);
            }
            this.prototype[name] = function() {
                var index = arguments[0];
                if (typeof defaultIndex !== 'undefined') {
                    index = typeof defaultIndex === 'function' ? defaultIndex.apply(this, arguments) : defaultIndex;
                }
                var widget = this.widget(index);
                if (!widget) {
                    throw new WakError.Container("Widget is undefined");
                }
                if (typeof widget[key] !== 'function') {
                    throw new WakError.Container("Behavior is unsupported");
                }
                if (typeof defaultIndex !== 'undefined') {
                    return widget[key].apply(widget, arguments);
                } else {
                    return widget[key].apply(widget, [].slice.call(arguments, 1));
                }
            };
        }.bind(this));
    };

    klass._indexedEvents = [];

    /**
     * Let the widget refire an event fired by contained widget
     * Add an index and widget property to the event datas
     * @param {Event} event - the event to listen and refire
     * @param {Event} [newEvent] - if given change the event type
     * @memberof Layout.Container
     * @method addIndexedEvent
     */
    klass.addIndexedEvent = function(event, newEvent) {
        this._indexedEvents.push({event: event, newEvent: newEvent});
    };

    /**
     * @class WakError.Container
     * @augments WakError.Error
     */
    WakError.create('Container');


    return klass;
});
