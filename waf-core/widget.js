/** @module waf-core/widget */
WAF.define('waf-core/widget', function() {
    "use strict";
    var Class = WAF.require('waf-core/class'),
        WakError = WAF.require('waf-core/error');
    WAF.require('waf-behavior/methodshelper');

    var exports = {
        defaultBehaviors: []
    };
    var widgetCounter = 1;

    /**
     * @class BaseWidget
     * @augments Class.BaseClass
     * @param {HTMLElement|Widget) [node] - The html node to construct the widget from, or the master widget to clone
     * @param {object} [options] - Options to initialize the widget
     */
    var BaseWidget = Class.create();
    exports.BaseWidget = BaseWidget;
    /**
     * Widget node tagName. Used by the default _createDomNode function
     * @type string
     * @memberof BaseWidget
     * @public
     */
    BaseWidget.tagName = 'div';

    /**
     * Called to initialize inherited behaviors properties
     * @function _initProperties
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('_initProperties');
    /**
     * Called to initialize inherited behaviors
     * @function _initBehavior
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('_initBehavior');
    /**
     * Called to before init to finish the init of the behavior
     * @function _init
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('_init');
    /**
     * Call when destroying widget to let inherited behaviors unsetup thing correctly
     * @function _destroyBehavior
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('_destroyBehavior');
    /**
     * Called when enabling the widget to let inherited behavior do what they need
     * @function _enableBehavior
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('_enableBehavior');
    /**
     * Called when disabling the widget to let inherited behavior do what they need
     * @function _disableBehavior
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('_disableBehavior');
    /**
     * Called to initialize inherited behaviors of a cloned widget
     * @param {BaseWidget} master - The widget cloned from
     * @function _cloneBehavior
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('_cloneBehavior');
    /**
     * Called to when the widget is attached
     * @function _attachBehavior
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('_attachBehavior');
    /**
     * Called when the widget is detached
     * @function _detachBehavior
     * @private
     * @memberof BaseWidget
     * @instance
     */
    BaseWidget.stackInstanceMethods('_detachBehavior');
    /**
     * Default options values
     * @type object
     * @memberof BaseWidget
     */
    BaseWidget.defaultOptions = {};
    BaseWidget.mergeClassAttributeOnInherit('defaultOptions');
    /**
     * Options parsers. Functions called when an option is changed.
     * @type object
     * @memberof BaseWidget
     */
    BaseWidget.optionsParsers = {};
    BaseWidget.mergeClassAttributeOnInherit('optionsParsers');
    /**
     * Node Id prefix
     * @type string
     * @memberof BaseWidget
     */
    BaseWidget.idPrefix = 'widget';

    BaseWidget.addMethods(/** @lends BaseWidget.prototype */ {
        initialize: function(node, options) {
            this._initProperties();
            if (typeof node === 'string') {
                this.id = node;
                node = document.getElementById(node);
            }
            if (typeof node === 'object' && !(node instanceof HTMLElement) && !exports.isWidget(node)) {
                options = node;
                node = undefined;
            }
            this._initWidget(node, options);
        },
        _initWidget: function(node, options) {
            this._enabled = true;

            // options
            this.options = {};
            options = WAF.extend(this.options, this.constructor.defaultOptions, options);

            // node
            if(exports.isWidget(node)) {
                // clone node
                if (!this.id) {
                    this.id = this._getId();
                }
                options = WAF.clone(node.options);
                options.originalId = node.id;
                this._createDomNode(true);
            } else if (!node) {
                if (!this.id) {
                    this.id = this._getId();
                }
                this._createDomNode();
            } else {
                this.node = node;
                // options from dom
                var domOptions = this._getOptionsFromDomNode();
                WAF.extend(options, domOptions);
                if (this.node.id) {
                    this.id = this.node.id;
                }

                // children init
                if(this._initChildrenFromDom) {
                    this._initChildrenFromDom();
                }
            }

            if(this.id !== undefined) {
                exports._instances[this.id] = this;
                if(WAF.widgets && !(this.id in WAF.widgets)) {
                    WAF.widgets[this.id] = this;
                }
            }

            if(this._initBehavior) {
                this._initBehavior();
            }
            if(!exports.isWidget(node)) {
                // changeOptions() shouldn't be called when clonning
                // options-related tasks should be done by _cloneBehavior()
                this.options = {}; // reset options to force changeOptions to execute all optionsParsers
                this.changeOptions(options);
            } else {
                if(this._cloneBehavior) {
                    this._cloneBehavior(node);
                }
            }

            if(this._init) {
                this._init(this.options);
            }
            this.init(this.options);

            this._isReady = true; // retro compatibility
        },
        init: function() {
        }, // To be overrided
        /**
         * return a new id
         * @private
         */
        _getId: function() {
            var i; 
            do {
                i = this.constructor.idPrefix + widgetCounter++;
            } while(document.getElementById(i));
            return i;
        },
        /**
         * parse attributes starting with "data-" of the dom node and return and options object
         */
        _getOptionsFromDomNode: function() {
            var o = {};
            [].forEach.call(this.node.attributes, function(attr) {
                if (/^data-/.test(attr.name)) {
                    o[attr.name.substr(5)] = attr.value;
                }
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
            if(this.options[name] === value) {
                return;
            }

            this.options[name] = value;
            if(this.constructor.optionsParsers[name]) {
                this.constructor.optionsParsers[name].call(this, name, value);
            }
        },
        /**
         * change multiple options
         * @param {object} obj - options to change
         */
        changeOptions: function(obj) {
            for(var k in obj) {
                if(k !== k.toLowerCase()) {
                    obj[k.toLowerCase()] = obj[k];
                    delete obj[k];
                    k = k.toLowerCase();
                }
                this.changeOption(k, obj[k]);
            }
        },
        /**
         * Create the dom node of the widget and set this.node
         * The dom node is create using constructor.tagName
         * Children elements are created in the _createChildren functions of the inherited behaviors
         * @private
         */
        _createDomNode: function(nosubwidget) {
            this.node = document.createElement(this.constructor.tagName);
            this.node.id = this.id;
            this.node.setAttribute('data-type', this.kind);
            // TODO: other attributes ?
            if(this._createChildren) {
                this._createChildren(nosubwidget);
            }
        },
        /**
         * Return the dom node
         * @public
         */
        getNode: function() {
            return this.node;
        },
        /**
         * destroy the widget to prevent memory leaks
         * @public
         */
        destroy: function() {
            this.children().forEach(function(c) {
                c._detach();
                c.destroy();
            });
            
            if(this._destroyBehavior) {
                this._destroyBehavior();
            }

            // we try to prevent memory leaks by deleting everything we can
            if(this.id !== undefined) {
                delete exports._instances[this.id];
                if(WAF.widgets && WAF.widgets[this.id] === this) {
                    delete WAF.widgets[this.id];
                }
            }
            for (var k in this) {
                if (Object.hasOwnProperty(this, k)) {
                    delete this[k];
                }
            }
        },
        /**
         * Detach the widget from the widget tree
         * Set this.parentWidget to undefined and call the detachCallback installed by the parent
         */
        _detach: function() {
            if (this._detachCallback) {
                this._detachCallback();
            }
            this.parentWidget = undefined;
            this._detachCallback = undefined;
            if(this._detachBehavior) {
                this._detachBehavior();
            }
        },
        /**
         * Tell the widget that he is now attached to a new parent.
         * First detach the fidget if needed
         * Set this.parentWidget and the new detachCallback
         * @private
         */
        _attach: function(parnt, callback) {
            if (this.parentWidget && this.parentWidget !== parnt) {
                this._detach();
            }
            this.parentWidget = parnt;
            this._detachCallback = callback;
            if(this._attachBehavior) {
                this._attachBehavior();
            }
        },
        /**
         * Return all the children and subchildren of the widget
         * @returns {Widget[]} List of widgets
         * @public
         */
        allChildren: function() {
            var r = this.children();
            for (var i = 0, l = r.length; i < l; i++) {
                r = r.concat(r[i].allChildren());
            }
            return r;
        },
        /**
         * Disable the widget and all it's children
         * Call this._disableBehavior() to allow behaviors to handle the state
         * @param {boolean} [state=true] - If false, enable the widget
         * @public
         */
        disable: function(state) {
            if(state === false) {
                return this.enable();
            }
            this._enabled = false;

            if(this._disableBehavior) {
                this._disableBehavior();
            }

            this.children().forEach(function(c) {
                c.disable();
            });
        },
        /**
         * Enable the widget and all it's children
         * Call this._enableBehavior() to allow behaviors to handle the state
         * @param {boolean} [state=true] - If false, disable the widget
         * @public
         */
        enable: function(state) {
            if(state === false) {
                return this.disable();
            }
            this._enabled = true;

            if(this._enableBehavior) {
                this._enableBehavior();
            }

            this.children().forEach(function(c) {
                c.enable();
            });
        },
        /**
         * Tell if the widget is disabled
         * @returns {boolean} True if the widget is disabled
         * @public
         */
        disabled: function() {
            return !this._enabled;
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
            }
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
     * @method create
     * @public
     */
    exports.create = function createWidget(name, base, proto) {
        if(typeof base === 'object') {
            proto = base;
            base = undefined;
        }

        /**
         * @class Widget
         * @augments BaseWidget
         * @mixes DomHelper
         * @mixes Bindable
         * @mixes Position
         * @param {HTMLElement|Widget) [node] - The html node to construct the widget from, or the master widget to clone
         * @param {object} [options] - Options to initialize the widget
         */
        var _class = Class.create();
        _class.inherit(base || BaseWidget);
        /**
         * the kind of the widget
         * @type {string}
         * @memberof Widget
         * @instance
         * @public
         */
        _class.prototype.kind = name;
        _class.kind = name;
        _class.prototype.toString = function() { return '[' + name + ' #' + this.node.id + ']'; };
        /**
         * Intanciate children from the dom nodes that already exists. Use the _initChildrenFromDom() method of inherited behaviors.
         * @function _initChildrenFromDom
         * @private
         * @memberof Widget
         * @instance
         */
        _class._addMultiInheritedCaller('_initChildrenFromDom');
        /**
         * Create children. Use the _createChildren() method of inherited behaviors.
         * @function _createChildren
         * @private
         * @memberof Widget
         * @instance
         */
        _class._addMultiInheritedCaller('_createChildren');
        exports.defaultBehaviors.forEach(function(b) {
            _class.inherit(b);
        });
        /**
         * return the list of all direct children. Use the children() method of inherited behaviors.
         * @returns {Widget[]} List of children widgets
         * @function children
         * @memberof widget
         * @instance
         * @public
         */
        // this method is here because it shouldn't be overrided by inheritance.
        _class.prototype.children = function() {
            var r = [];
            _class.supers.forEach(function(supr) {
                if (supr.prototype.children) {
                    supr.prototype.children.call(this).forEach(function(w) {
                        if(r.indexOf(w) < 0) {
                            r.push(w);
                        }
                    });
                }
            }.bind(this));
            return r;
        };
        if(_class.classes) {
            _class.classes.push('waf-' + name.toLowerCase());
        }

        // Wrap inherit() to prevent inherit from two widgets
        var oldInherit = _class.inherit;
        _class.inherit = function() {
            var args = [].map.call(arguments, function(arg) {
                if(typeof arg === 'string') {
                    var module = WAF.require(arg);
                    if(module === undefined) {
                        var WakError = WAF.require('waf-core/error');
                        throw new WakError.Error("Can't inherit from unknown class '" + arg + "'");
                    }
                    return module;
                }
                return arg;
            });
            var _class = this;
            if(Class.inheritFrom(args[0], BaseWidget)) {
                if(_class.supers.length > Class.defaultBehaviors.length + exports.defaultBehaviors.length + 1) {
                    throw new WakError.Inherit("Widgets should inherit first from another widget");
                }
                _class = exports.create(name, args.shift());
                if(args.length) {
                    _class.inherit.apply(_class, args);
                }
            }
            for(var i = 1; i < args.length; i++) {
                if(Class.inheritFrom(args[i], BaseWidget)) {
                    throw new WakError.Inherit("Widgets should inherit first from another widget");
                }
            }
            oldInherit.apply(_class, args);
            return _class;
        };

        exports._upgradeWidget(_class, proto);
        return _class;
    };

    /**
     * Upgrade the prototype of a widget
     * @param {Widget} [_class]
     * @param {object} [proto]
     * @returns {Widget}
     * @private
     * @method _upgradeWidget
     */
    exports._upgradeWidget = function(_class, proto) {
        if(proto) {
            var properties = [];
            Object.keys(proto).forEach(function(key) {
                if(typeof proto[key] === 'function') {
                    _class.prototype[key] = proto[key];
                } else if(typeof proto[key] === 'object' && proto[key] instanceof PropertyDescriptor) {
                    proto[key].name = key;
                    properties.push(proto[key]);
                } else {
                    //FIXME: tagName hack on the class, should be on the prototype
                    _class[key] = proto[key];
                }
            });
            properties.sort(function(a, b) { return a.order < b.order ? -1 : (a.order > b.order ? 1 : 0); });
            properties.forEach(function(property) {
                _class.addProperty(property.name, property.options);
            });
        }
        return _class;
    };

    /**
     * Create a new subwidget class. Subwidget are widget that can't be used outside a predefined widget (ie: MenuItem outside MenuBar).
     * The main difference is that they don't have a waf-widget css class
     * @param {string} name - Widget name
     * @param {BaseWidget} [base=Widget] - The widget to inherit from
     * @returns {Widget} A new widget class
     * @method createSubWidget
     * @public
     */
    exports.createSubWidget = function createSubWidget(name, base) {
        var w = this.create.apply(this, arguments);
        w.removeClass('waf-widget');
        return w;
    };

    /**
     * Create a new instance of a widget given an existing dom node. If the dom node contains children dom nodes, it also create the corresponding children widgets.
     * @param {HTMLElement} node - The dom node
     * @returns {Widget|undefined} The new widget instance or undefined if no widget correspond
     * @method instanceFromDom
     */
    exports.instanceFromDom = function instanceWidgetFromDom(node) {
        if(node.id in this._instances) {
            throw new WakError.Exists('Widget is already instanciated');
        }
  
        var name = $(node).attr('data-type');
        var packge = $(node).attr('data-package');
        if(packge) {
            var module = WAF.require(packge);
            if(module && typeof module[name] === 'function') {
                return new module[name](node);
            }
            if(typeof module === 'function' && packge === name) {
                return new module(node);
            }
        } else if ($(node).find('[data-type][data-package]').length || $(node).find('[data-type=component]').length || node.getAttribute('data-type') === 'component') {
            return new (WAF.require('waf-widget/oldwidget'))(node);
        }
        return undefined;
    };

    exports._instances = {};
    /**
     * Return the widget corresponding to the id or dom node
     * If the dom node is not a widget, it walk up the tree and return the first corresponding widget
     * @param {string|HTMLElement} nodeOrId - Dom node or id to search
     * @returns {Widget|undefined} the widget or undefined if no widget found
     * @method get
     * @public
     */
    exports.get = function(nodeOrId) {
        if (typeof nodeOrId === 'object' && nodeOrId instanceof HTMLElement) {
            return exports.get(nodeOrId.id) || exports.get(nodeOrId.parentNode);
        }
        if (nodeOrId in this._instances) {
            return this._instances[nodeOrId];
        }
        return undefined;
    };

    /**
     * Tell if the object is a widget
     * @param {any} object - The object to test
     * @param {Class} [klass=BaseWidget] - Restrict to a particuliar class
     * @return {boolean}
     * @method isWidget
     * @public
     */
    exports.isWidget = function(obj, klass) {
        return Class.instanceOf(obj, klass || BaseWidget);
    };

    /**
     * Tell if the object is a widget
     * @param {Class} constr - The object to test
     * @param {Class} [klass=BaseWidget] - Restrict to a particuliar class
     * @return {boolean}
     * @method isWidgetClass
     * @public
     */
    exports.isWidgetClass = function(constr, klass) {
        return Class.inheritFrom(constr, klass || BaseWidget);
    };

    /**
     * return a property descriptor
     * @param {object} [options] - Property options
     * @return {PropertyDescriptor}
     * @method property
     * @public
     */
    exports.property = function(options) {
        return new PropertyDescriptor(options);
    };

    var propertyDescriptorOrder = 0;

    function PropertyDescriptor(options) {
        this.options = options;
        this.order = propertyDescriptorOrder++;
    }

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
