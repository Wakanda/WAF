WAF.define('waf-behavior/layout/container', function() {
    "use strict";
    var Class = WAF.require('waf-core/class'),
    Behavior = WAF.require('waf-core/behavior'),
    Event = WAF.require('waf-core/event'),
    WakError = WAF.require('waf-core/error'),
    Widget = WAF.require('waf-core/widget');

    /**
     * @class Layout.Container
     * @augments Observable
     */
    var klass = Behavior.create('Layout.Container');
    var proto = klass.prototype;
    klass.inherit(WAF.require('waf-behavior/observable'));

    // Instance methods
    /**
     * Detach the widget at index
     * @param {integer} index
     * @memberof Layout.Container
     * @instance
     * @method detachWidget
     */
    proto.detachWidget = function(index) {
        if (typeof index != 'number')
            index = this.indexOfWidget(index);
        if (index < 0 || index >= this._children.length)
            return;
        var widget = this._children[index];
        this._children.splice(index, 1);
        this._containerRemoveDomNode(widget);
        this.constructor._indexed_events.forEach(function(e) {
            widget.unsubscribe(e.event, undefined, this);
        }.bind(this));
        if (this._last_widget_index == index)
            this._last_widget_index = undefined;
        this.fire(new Event.DetachWidget({widget: widget, index: index}));
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
        if (this._restrict && !Class.instanceOf(widget, this._restrict))
            throw new WakError.Container("Wrong widget type: " + this._restrict);
        widget.detach();
        index = Math.min(index, this.countWidgets());
        this._children.splice(index, 0, widget);

        this._containerInsertDomNode(index, widget);

        widget.attach(this, function() {
            this.detachWidget(this.indexOfWidget(widget));
        }.bind(this));

        this.constructor._indexed_events.forEach(function(e) {
            if (widget.subscribe) {
                widget.subscribe(e.event, function(event) {
                    var index = this.indexOfWidget(widget);
                    this.fire(new (e.new_event || e.event)(event, {index: index, widget: widget}));
                }.bind(this), this);
            }
        }.bind(this));
        this.fire(new Event.InsertWidget({widget: widget, index: index}));
        this._last_widget_index = index;
        return index;
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
        var i = this.countWidgets()
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
     * Detach all widgets
     * @memberof Layout.Container
     * @instance
     * @method detachAllWidgets
     */
    proto.detachAllWidgets = function() {
        while (this._children.length)
            this.detachWidget(0);
    };

    /**
     * Detach and destroy all widgets
     * @memberof Layout.Container
     * @instance
     * @method detachAndDestroyAllWidgets
     */
    proto.detachAndDestroyAllWidgets = function() {
        while (this._children.length)
            this.detachWidget(0).destroy();
    };

    /**
     * Return the last inserted or appended widget (not the widget at the end of the conatiner)
     * @returns {Widget} 
     * @memberof Layout.Container
     * @instance
     * @method lastWidget
     */
    proto.lastWidget = function() {
        if (typeof this._last_widget_index == 'undefined')
            throw new WakError.Container("Widget not found");
        return this.widget(this._last_widget_index);
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
            var w = this.widget(i);
            if (w[funcname])
                r.push(w[funcname].apply(w, [].slice.call(arguments, 1)));
        }
        return r;
    };

    /**
     * Called to initialize behaviors of a cloned widget
     * @param {BaseWidget} master - The widget cloned from
     * @private
     * @memberof Layout.Container
     * @instance
     * @method cloneBehavior
     */
    proto.cloneBehavior = function(master) {
        master.invoke('clone').forEach(this.attachWidget.bind(this));
    };

    /**
     * Intanciate children from the dom nodes that already exists.
     * @private
     * @memberof Layout.Container
     * @instance
     * @method initChildrenFromDom
     */
    proto.initChildrenFromDom = function(widget) {
        var that = this;
        $(this._container_node || this.node).children('[data-type][data-package]').each(function(i) {
            try {
                var w = Widget.instanceFromDom(this)
                if (w)
                    that.attachWidget(w);
            } catch (e) {
                if (!(e instanceof WakError.Exists))
                    throw e;
            }
        });
    };

    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof Layout.Container
     * @instance
     * @method initProperties
     */
    proto.initProperties = function() {
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
        if (arguments.length)
            this._restrict = widget;
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
        var insert_node = this._container_node || this.getNode();
        var node = widget.getNode();

        if (this._isReady || node.parentNode != insert_node) {
            if (index >= this._children.length - 1)
                insert_node.appendChild(node)
            else
                insert_node.insertBefore(node, this._children[index + 1].getNode());
        }
    }

    /**
     * Remove a domnode
     * @param {Widget} widget
     * @private
     * @memberof Layout.Container
     * @instance
     * @method _containerRemoveDomNode
     */
    proto._containerRemoveDomNode = function(widget) {
        widget.getNode().parentNode.removeChild(widget.getNode());
    };

    // Class Methods
    /**
     * Restict the inserted widget to be member of the class
     * @param {Widget}
     * @memberof Layout.Container
     * @method restrictWidget
     */
    klass.restrictWidget = function(widget) {
        if (arguments.length)
            this._restrict = widget;
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
     * Created methods can be prefixed and suffixed. The argument of the methods is the index if default_index is undefined. The default index can be an integer or a function that return an integer.
     * @param {Behavior|string[]} methods_or_behavior - List of methods name, or a behaviot
     * @param {string} [prefix='indexed'] - String to preprend to all functions created. Function name first letter will be put upper case to respect camelcase notation.
     * @param {string} [suffix=''] - String to append to all function created
     * @param {integer|Layout.Container~indexCallback} [default_index] - The default index to use, or function to get it
     * @memberof Layout.Container
     * @method addIndexedMethods
     */
    klass.addIndexedMethods = function(methods_or_behavior, prefix, suffix, default_index) {
        if (typeof prefix != 'string' && typeof default_index == 'undefined') {
            default_index = prefix;
            prefix = undefined;
        }
        if (typeof suffix != 'string' && typeof default_index == 'undefined') {
            default_index = suffix;
            suffix = undefined;
        }
        if (typeof prefix == 'undefined')
            prefix = 'indexed';
        suffix = suffix || '';
        var methods = [];
        if(Array.isArray(methods_or_behavior))
            methods = behaviors;
        if(methods_or_behavior.getMethods)
            methods = methods_or_behavior.getMethods();
        methods.forEach(function(k) {
            var n = k + suffix;
            if (prefix)
                n = prefix + n[0].toUpperCase() + n.substr(1);
            this.prototype[n] = function() {
                var index = arguments[0];
                if (typeof default_index != 'undefined')
                    index = typeof default_index == 'function' ? default_index.apply(this, arguments) : default_index;
                var w = this.widget(index);
                if (!w)
                    throw new WakError.Container("Widget is undefined");
                if (typeof w[k] != 'function')
                    throw new WakError.Container("Behavior is unsupported");
                if (typeof default_index != 'undefined') {
                    return w[k].apply(w, arguments);
                } else {
                    return w[k].apply(w, [].slice.call(arguments, 1));
                }
            };
        }.bind(this));
    };

    klass._indexed_events = [];

    /**
     * Let the widget refire an event fired by contained widget
     * Add an index and widget property to the event datas
     * @param {Event} event - the event to listen and refire
     * @param {Event} [new_event] - if given change the event type
     * @memberof Layout.Container
     * @method addIndexedEvent
     */
    klass.addIndexedEvent = function(event, new_event) {
        this._indexed_events.push({event: event, new_event: new_event});
    };

    /**
     * @class Event.Container
     * @augments Event.All
     */
    Event.create('Container')
    /**
     * @class Event.AttachWidget
     * @augments Event.Container
     */
    Event.create('AttachWidget', Event.Container);
    /**
     * @class Event.InsertWidget
     * @augments Event.Container
     */
    Event.create('InsertWidget', Event.AttachWidget);
    /**
     * @class Event.DetachWidget
     * @augments Event.Container
     */
    Event.create('DetachWidget', Event.Container);

    /**
     * @class WakError.Container
     * @augments WakError.Error
     */
    WakError.create('Container');


    return klass;
});
