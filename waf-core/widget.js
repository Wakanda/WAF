/** @module waf-core/widget */
WAF.define('waf-core/widget', function() {
    "use strict";
    var Class = WAF.require('waf-core/class'),
        WakError = WAF.require('waf-core/error');
    WAF.require('waf-behavior/methodshelper');

    var exports = {
        default_behaviors: []
    };
    var widget_counter = 1;

    /**
     * @class BaseWidget
     * @augments Class.BaseClass
     * @param {HTMLElement|Widget) [node] - The html node to construct the widget from, or the master widget to clone
     * @param {object} [options] - Options to initialize the widget
     */
    var BaseWidget = Class.create('BaseWidget');
    /**
     * Widget node tagName. Used by the default createDomNode function
     * @type string
     * @memberof BaseWidget
     */
    BaseWidget.tagname = 'div';

    /**
     * Called to initialize inherited behaviors properties
     * @function initProperties
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('initProperties');
    /**
     * Called to initialize inherited behaviors
     * @function initBehaviors
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('initBehavior');
    /**
     * Call when destroying widget to let inherited behaviors unsetup thing correctly
     * @function destroyBehavior
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('destroyBehavior');
    /**
     * Called when enabling the widget to let inherited behavior do what they need
     * @function enableBehavior
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('enableBehavior');
    /**
     * Called when disabling the widget to let inherited behavior do what they need
     * @function disableBehavior
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('disableBehavior');
    /**
     * Called to initialize inherited behaviors of a cloned widget
     * @param {BaseWidget} master - The widget cloned from
     * @function cloneBehavior
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('cloneBehavior');
    /**
     * Default options values
     * @type object
     * @memberof BaseWidget
     */
    BaseWidget.default_options = {};
    BaseWidget.mergeClassAttributeOnInherit('default_options');
    /**
     * Options parsers. Functions called when an option is changed.
     * @type object
     * @memberof BaseWidget
     */
    BaseWidget.options_parsers = {};
    BaseWidget.mergeClassAttributeOnInherit('options_parsers');
    /**
     * Node Id prefix
     * @type string
     * @memberof BaseWidget
     */
    BaseWidget.id_prefix = 'widget';

    BaseWidget.addMethods(/** @lends BaseWidget.prototype */ {
        initialize: function(node, options) {
            this.initProperties();
            this.initWidget(node, options);
        },
        initWidget: function(node, options) {
            if (typeof node === 'string') {
                this.id = node;
                node = document.getElementById(node);
            }
            if (typeof node === 'object' && !(node instanceof HTMLElement) && !exports.isWidget(node)) {
                options = node;
                node = undefined;
            }

            this._enabled = true;

            // options
            this.options = WAF.clone(this.constructor.default_options);
            WAF.extend(this.options, options);

            // node
            if(exports.isWidget(node)) {
                // clone node
                if (!this.id)
                    this.id = this.getId();
                this.options = WAF.clone(node.options);
                this.options.original_id = node.id;
                this.createDomNode(true);
            } else if (!node) {
                if (!this.id)
                    this.id = this.getId();
                this.createDomNode();
            } else {
                this.node = node;
                // options from dom
                var domOptions = this.getOptionsFromDomNode();
                WAF.extend(this.options, domOptions);
                if (this.node.id)
                    this.id = this.node.id;

                // children init
                if(this.initChildrenFromDom)
                    this.initChildrenFromDom();
            }
            
            exports._instances[this.id] = this;
            if(WAF.widgets && !(this.id in WAF.widgets))
                WAF.widgets[this.id] = this;

            this.init();

            if(this.initBehavior)
                this.initBehavior();
            if(!exports.isWidget(node)) {
                // changeOptions() shouldn't be called when clonning
                // options related work should be done by cloneBehavior()
                this.changeOptions(this.options);
            } else {
                if(this.cloneBehavior)
                    this.cloneBehavior(node);
            }
            this._isReady = true; // retro compatibility
        },
        init: function() {
        }, // To be overrided
        /**
         * return a new id
         * @private
         */
        getId: function() {
            var i; 
            do {
                i = this.constructor.id_prefix + widget_counter++;
            } while(document.getElementById(i));
            return i;
        },
        /**
         * parse attributes starting with "data-" of the dom node and return and options object
         */
        getOptionsFromDomNode: function() {
            var o = {};
            [].forEach.call(this.node.attributes, function(attr) {
                if (/^data-/.test(attr.name))
                    o[attr.name.substr(5)] = attr.value;
            });
            return o;
        },
        /**
         * change an option value.
         * Call the corresponding option parser if it exists
         * @param {string} name - Option name
         * @param {any} value - Option value
         */
        changeOption: function(name, value) {
            this.options[name] = value;
            if(this.constructor.options_parsers[name])
                this.constructor.options_parsers[name].call(this, name, value);
        },
        /**
         * change multiple options
         * @param {object} obj - options to change
         */
        changeOptions: function(obj) {
            for(var k in obj)
                this.changeOption(k, obj[k]);
        },
        /**
         * Create the dom node of the widget and set this.node
         * The dom node is create using constructor.tagname
         * Children elements are created in the createChildren functions of the inherited behaviors
         * @private
         */
        createDomNode: function(nosubwidget) {
            this.node = document.createElement(this.constructor.tagname);
            this.node.id = this.id;
            this.node.setAttribute('data-type', this.kind);
            // TODO: other attributes ?
            if(this.createChildren)
                this.createChildren(nosubwidget);
        },
        /**
         * Return the dom node
         */
        getNode: function() {
            return this.node;
        },
        /**
         * destroy the widget to prevent memory leaks
         */
        destroy: function() {
            this.children().forEach(function(c) {
                c.detach();
                c.destroy();
            });
            
            if(this.destroyBehavior)
                this.destroyBehavior();

            // we try to prevent memory leaks by deleting everything we can
            delete exports._instances[this.id];
            for (var k in this)
                if (Object.hasOwnProperty(this, k))
                    delete this[k];
        },
        /**
         * Detach the widget from the widget tree
         * Set this.parent_widget to undefined and call the detachCallback installed by the parent
         */
        detach: function() {
            if (this._detachCallback)
                this._detachCallback();
            delete this.parent_widget;
            delete this._detachCallback;
        },
        /**
         * Tell the widget that he is now attached to a new parent.
         * First detach the fidget if needed
         * Set this.parent_widget and the new detachCallback
         * @private
         */
        attach: function(parnt, callback) {
            if (this.parent_widget && this.parent_widget !== parnt)
                this.detach();
            this.parent_widget = parnt;
            this._detachCallback = callback;
        },
        /**
         * Return all the children and subchildren of the widget
         * @returns {Widget[]} List of widgets
         */
        allChildren: function() {
            var r = this.children();
            for (var i = 0, l = r.length; i < l; i++)
                r = r.concat(r[i].allChildren());
            return r;
        },
        /**
         * Disable the widget and all it's children
         * Call this.disableBehavior() to allow behaviors to handle the state
         * @param {boolean} [state=true] - If false, enable the widget
         */
        disable: function(state) {
            if(state === false)
                return this.enable();
            this._enabled = false;

            if(this.disableBehavior)
                this.disableBehavior();

            this.children().forEach(function(c) {
                c.disable();
            });
        },
        /**
         * Enable the widget and all it's children
         * Call this.enableBehavior() to allow behaviors to handle the state
         * @param {boolean} [state=true] - If false, disable the widget
         */
        enable: function(state) {
            if(state === false)
                return this.disable();
            this._enabled = true;

            if(this.enableBehavior)
                this.enableBehavior();

            this.children().forEach(function(c) {
                c.enable();
            });
        },
        /**
         * Tell if the widget is disabled
         * @returns {boolean} True if the widget is disabled
         */
        disabled: function() {
            return this._enabled;
        },
        /**
         * Return a clone of the widget and his children
         * The clone widget is configured like the original (handlers, bindings, etc)
         * @returns {Widget} The new cloned instance
         */
        clone: function() {
            return new this.constructor(this);
        },
        /**
         * call a function (if it exists) on the widget and  each children.
         * @param {string} name - The function to call
         * @param {any} [...args] - Function arguments
         */
        propagate: function(name) {
            var args = [].slice.call(arguments, 0);
            if(this[name]) {
                this[name].apply(this, args.slice(1));
            };
            this.children().forEach(function(child) {
                child.propagate.apply(child, args);
            });
        }
    });
    BaseWidget = BaseWidget;

    /**
     * Create a new widget class
     * @param {string} name - Widget name
     * @param {BaseWidget} [base=Widget] - The widget to inherit from
     * @returns {Widget} A new widget class
     */
    exports.create = function createWidget(name, base) {
        /**
         * @class Widget
         * @augments BaseWidget
         * @mixes DomHelper
         * @mixes Bindable
         * @mixes Position
         * @param {HTMLElement|Widget) [node] - The html node to construct the widget from, or the master widget to clone
         * @param {object} [options] - Options to initialize the widget
         */
        var _class = Class.create(name);
        _class.inherit(arguments.length > 1 ? base : BaseWidget);
        /**
         * the kind of the widget
         * @type {string}
         * @memberof Widget
         * @instance
         */
        _class.prototype.kind = name;
        /**
         * Intanciate children from the dom nodes that already exists. Use the initChildrenFromDom() method of inherited behaviors.
         * @function initChildrenFromDom
         * @private
         * @memberof Widget
         * @instance
         */
        _class.addMultiInheritedCaller('initChildrenFromDom');
        /**
         * Create children. Use the createChildren() method of inherited behaviors.
         * @function createChildren
         * @private
         * @memberof Widget
         * @instance
         */
        _class.addMultiInheritedCaller('createChildren');
        exports.default_behaviors.forEach(function(b) {
            _class.inherit(b);
        });
        /**
         * return the list of all direct children. Use the children() method of inherited behaviors.
         * @returns {Widget[]} List of children widgets
         * @function children
         * @memberof widget
         * @instance
         */
        // this method is here because it shouldn't be overrided by inheritance.
        _class.prototype.children = function() {
            var r = [];
            _class.supers.forEach(function(supr) {
                if (supr.prototype.children)
                    r = r.concat(supr.prototype.children.call(this));
            }.bind(this));
            return r;
        };
        if(_class.classes)
            _class.classes.push('waf-' + name.toLowerCase());
        exports[name] = _class;

        // Wrap inherit() to prevent inherit from two widgets
        var old_inherit = _class.inherit;
        _class.inherit = function() {
            var args = [].slice.call(arguments, 0);
            var _class = this;
            if(Class.inheritFrom(args[0], BaseWidget)) {
                if(_class.supers.length > Class.default_behaviors.length + exports.default_behaviors.length + 1)
                    throw new WakError.Inherit("Widgets should inherit first from another widget");
                var _class = exports.create(name, args.shift());
                if(args.length)
                    _class.inherit.apply(_class, args)
            }
            for(var i = 1; i < args.length; i++)
                if(Class.inheritFrom(args[i], BaseWidget))
                    throw new WakError.Inherit("Widgets should inherit first from another widget");
            old_inherit.apply(_class, args);
            return _class;
        };

        return _class;
    };

    /**
     * Create a new subwidget class. Subwidget are widget that can't be used outside a predefined widget (ie: MenuItem outside MenuBar).
     * The main difference is that they don't have a waf-widget css class
     * @param {string} name - Widget name
     * @param {BaseWidget} [base=Widget] - The widget to inherit from
     * @returns {Widget} A new widget class
     */
    exports.createSubWidget = function createSubWidget(name, base) {
        var w = this.create.apply(this, arguments);
        w.removeClass('waf-widget');
        return w;
    };

    /**
     * Create a new instance of a widget
     * @param {string} name - Widget class name
     * @param {HTMLElement|Widget) [node] - The html node to construct the widget from, or the master widget to clone
     * @param {object} [options] - Options to initialize the widget
     * @returns {Widget} The new widget instance
     */
    exports.instance = function instanceWidget(name, node, options) {
        return new exports[name](node, options);
    };


    /**
     * Create a new instance of a widget given an existing dom node. If the dom node contains children dom nodes, it also create the corresponding children widgets.
     * @param {HTMLElement} node - The dom node
     * @returns {Widget|undefined} The new widget instance or undefined if no widget correspond
     */
    exports.instanceFromDom = function instanceWidgetFromDom(node) {
        if(node.id in this._instances) throw new WakError.Exists('Widget is already instanciated');

        var name = $(node).attr('data-type');
        if (name in exports)
            return new exports[name](node);
        if ($(node).find('[data-type]')) {
            return new exports.OldWidget(node);
        }                                               
        return undefined;
    };

    exports._instances = {};
    /**
     * Return the widget corresponding to the id or dom node
     * If the dom node is not a widget, it walk up the tree and return the first corresponding widget
     * @param {string|HTMLElement} node_or_id - Dom node or id to search
     * @returns {Widget|undefined} the widget or undefined if no widget found
     */
    exports.get = function(node_or_id) {
        if (typeof node_or_id === 'object' && node_or_id instanceof HTMLElement)
            return exports.get(node_or_id.id) || exports.get(node_or_id.parentNode);
        if (node_or_id in this._instances)
            return this._instances[node_or_id];
        return undefined;
    };

    /**
     * Tell if the object is a widget
     * @param {any} object - The object to test
     * @param {Class} [klass=BaseWidget] - Restrict to a particuliar class
     * @return {boolean}
     */
    exports.isWidget = function(obj, klass) {
        return Class.instanceOf(obj, klass || BaseWidget);
    };

    /**
     * @class WakError.Inherit
     * @augments WakError.Error
     */
    WakError.create('Inherit');
    /**
     * @class WakError.Exists
     * @augments WakError.Error
     */
    WakError.create('Exists');

    return exports;
});
