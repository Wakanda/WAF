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

WAF.define('waf-behavior/studio', function() {
    "use strict";
    /* global Designer */
    var Behavior = WAF.require('waf-core/behavior'),
    Widget = WAF.require('waf-core/widget');

    var Studio = Behavior.create();

    // CLASS PROPERTIES

    /***
     * Default configuration file
     * @type _configuration
     */
    Studio._configuration = {
        category: 'Custom Widgets',
        hidden: false,
        attributes: {},
        style: {},
        structures: {},
        events: {},
        on: {},
        states: {},
        panels: {},
        options: {},
        behaviors: {
            isContainer: false
        }
    };
    // allow inheritance for this elements
    Studio.mergeClassAttributeOnInherit('_configuration.attributes');
    Studio.mergeClassAttributeOnInherit('_configuration.style');
    Studio.mergeClassAttributeOnInherit('_configuration.structures');
    Studio.mergeClassAttributeOnInherit('_configuration.events');
    Studio.mergeClassAttributeOnInherit('_configuration.on');
    Studio.mergeClassAttributeOnInherit('_configuration.states');
    //Studio.mergeClassAttributeOnInherit('_configuration.panels'); //FIXME: panel inheritance ?
    Studio.mergeClassAttributeOnInherit('_configuration.options');
    Studio.mergeClassAttributeOnInherit('_configuration.behaviors');

    // CLASS METHODS

    // PRIVATE

    /**
     * Get the configuration file
     * well formated for the GUI Designer
     * @returns {Object}
     * @method _getConf
     */
    Studio._getConf = function() {

        // define configuration file
        var configuration = {
            'attributes': [],
            'category': this._configuration.hidden ? 'Hidden' : this._configuration.category || Studio._configuration.category,
            'description': this._configuration.description || this.prototype.kind,
            'events': [],
            'img': this._configuration.icon || '/icons/widget.png',
            'isCustom': 'true',
            'lib': this._configuration.lib,
            'properties': {
                'state': [],
                'style': this._configuration.panels.style || {
                    'theme': false,
                    'fClass': true,
                    'text': false,
                    'background': true,
                    'border': true,
                    'sizePosition': true,
                    'label': true,
                    'disabled': ['border-radius']
                }
            },
            'style': [],
            'structures': [],
            'tag': this._configuration.tag || this.tagName,
            'template': this._configuration.template || '',
            'behaviors': this._configuration.behaviors || {
                'isContainer': false
            },
            'type': this._configuration.type || this.prototype.kind,
            'packageName': this._configuration.packageName + '/package.json'
        };

        // style
        if (typeof this._configuration.style.width !== 'undefined') {
            configuration.style.push({
                'name': 'width',
                'defaultValue': this._configuration.style.width
            });
        }

        if (typeof this._configuration.style.height !== 'undefined') {
            configuration.style.push({
                'name': 'height',
                'defaultValue': this._configuration.style.height
            });
        }

        // GUI events
        Object.keys(this._configuration.on).forEach(function(eventName) {
            var callbacks = this._configuration.on[eventName];
            configuration[eventName] = function(event) {
                callbacks.forEach(function(callback) {
                    try {
                        callback.call(this, event);
                    } catch (e) {
                        var errorMessage = '',
                        length = 0,
                        i = 0,
                        taberrorInfoKind = Object.keys(e),
                        errorInfoKind = '';

                        console.error('GUI Designer> Errors in executing widget event', name, e, event);

                        if (typeof event !== 'undefined' && event.getType) {
                            errorMessage += "Widget type: " + event.getType() + "<br>";
                        }
                        if (typeof event !== 'undefined' && event.getAttribute && event.getAttribute('id')) {
                            errorMessage += "Widget ID: " + event.getAttribute('id').getValue() + "<br>";
                        }

                        if (typeof e.message !== 'undefined') {
                            errorMessage += "Error message: " + e.message + "<br>";
                        }

                        length = taberrorInfoKind.length;
                        for (i = 0; i < length; i++) {
                            errorInfoKind = taberrorInfoKind[i];
                            if (errorInfoKind !== 'sourceId') {
                                errorMessage += errorInfoKind.substr(0, 1).toUpperCase() + errorInfoKind.substr(1, errorInfoKind.length) + ": " + e[errorInfoKind] + "<br>";
                            }
                        }

                        errorMessage += "</div>";

                        Designer.ui.dialog.show('Error(s) occured during the widget\'s ' + String.capitalize(name) + ' event', errorMessage, {
                            'text-align': 'left'
                        }, 500);
                    }
                }.bind(this));
            };
        }.bind(this));

        // create ordered list of attributes, events, and structures
        // based on defined order, or on order property
        ['attributes', 'events', 'structures', 'states'].forEach(function(k) {
            var dest = configuration[k];
            if (k === 'states') {
                dest = configuration.properties.state;
            }
            var source = this._configuration[k];
            var order = this._configuration[k + '_order'] || [];
            var key = {
                structures: 'selector',
                states: 'label'
            }[k] || 'name';
            order.forEach(function(name) {
                if (name in source) {
                    var o = {};
                    o[key] = name;
                    dest.push(WAF.extend(source[name], o));
                }
            });
            var l = [];
            for (var name in source) {
                if (order.indexOf(name) < 0) {
                    var o = {};
                    o[key] = name;
                    l.push(WAF.extend(source[name], o));
                }
            }
            l.sort(function(a, b) {
                return (a.order || 0) - (b.order || 0);
            });
            if (k === 'states') {
                configuration.properties.state = dest.concat(l);
            } else {
                configuration[k] = dest.concat(l);
            }
        }.bind(this));

        // GUI disgner expect structure instead of structures
        configuration.structure = configuration.structures;

        // return created configuration object with options added (like bindable,...)
        return WAF.extend(true, configuration, this._configuration.options);
    };

    // PUBLIC

    // set complex properties

    /**
     * Define new option for the widget configuration
     * @method addOption
     * @param {String} name
     * @param {String} value
     * @method addOption
     */
    Studio.addOption = function(name, value) {
        this._configuration.options[name] = value;
    };

    /**
     * Define a new attribute for the widget
     * @method _addAttribute
     * @param {string|Object} name - attribute name, or object defining the attribute
     * @param {Object} [attribute] - object defining the attribute
     * @method _addAttribute
     * @private
     */
    Studio._addAttribute = function(name, attribute) {
        if (typeof name === 'object') {
            return this._addAttribute(name.name, name);
        }
        attribute = attribute || {};

        // set or upgrade the attribute
        this._configuration.attributes[name.toLowerCase()] = attribute = WAF.extend(this._configuration.attributes[name.toLowerCase()] || {}, attribute);

        // set the default description
        if (attribute.description === undefined) {
            attribute.description = name.replace(/^data-/, '').split('-').map(String.capitalize).join(' ');
        }

        // order attributes globally, this way, inherited attributes are not mixed with new attributes
        if (!('order' in attribute)) {
            attribute.order = attributeCounter++;
        }
    };
    var attributeCounter = 0;

    /**
     * Remove an attribute for the widget
     * @method _addAttribute
     * @param {string} name - attribute name
     * @method _removeAttribute
     * @private
     */
    Studio._removeAttribute = function(name) {
        delete this._configuration.attributes[name.toLowerCase()];
    };

    /**
     * Define a new event for the widget
     * @method addEvent
     * @param {string|Event|object} name - Event name
     * @param {object} [event] - Object defining the event
     * @param {string} [event.description]
     * @method addEvent
     * @public
     */
    Studio.addEvent = function(name, event) {
        if (typeof name === 'object') {
            return this.addEvent(name.name, name);
        }

        if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) {
            throw new Error('"' + name + '" is an incorrect event name: event must start with a lowercase letter and can only contain letters & numbers');
        }

        this._configuration.events[name] = event = WAF.extend(
        {category: 'General Events'},
        this._configuration.events[name] || {},
        event
        );

        if (event.description === undefined) {
            event.description = 'On ' + name[0].toUpperCase() + name.substr(1);
        }
    };

    /**
     * Define a new structure for the widget
     * @method addStructure
     * @param {string|object} selector - selector of the structure, or object defining the structure
     * @param {Object} [structure] - object defining the structure
     * @method addStructure
     */
    Studio.addStructure = function(selector, structure) {
        if (typeof selector === 'object') {
            return this.addStructure(selector.selector, selector);
        }
        this._configuration.structures[selector] = structure = WAF.extend(this._configuration.structures[selector] || {}, structure);

        if (structure.description === undefined) {
            structure.description = selector;
        }
    };

    /**
     * Define the state style
     * (default area that user can see)
     * @param {String} label
     * @param {String} state
     * @method addState
     * @public
     */
    Studio.addState = function(label, state) {
        if (typeof label === 'object') {
            return this.addState(label.label, label);
        }

        this._configuration.states[label] = state = WAF.extend(this._configuration.states[label] || {
            cssClass: 'waf-state-' + label,
            find: '',
            mobile: label !== 'hover'
        }, state);
    };

    // addEvents, addStructures, addStates
    // removeEvent, removeStructure, removeState
    // orderEvents, orderStructures, orderStates
    ['event', 'structure', 'state'].forEach(function(k) {
        Studio['remove' + k.capitalize()] = function(name) {
            if (name in this._configuration[k + 's']) {
                delete this._configuration[k + 's'][name];
            }
        };

        Studio['order' + k.capitalize() + 's'] = function(order) {
            this._configuration[k + 's_order'] = order;
        };

        Studio['add' + k.capitalize() + 's'] = function() {
            var that = this;

            for (var i = 0; i < arguments.length; i++) {
                if (Array.isArray(arguments[i])) {
                    arguments[i].forEach(function(o) {
                        that['add' + k.capitalize()](o);
                    });
                } else {
                    that['add' + k.capitalize()](arguments[i]);
                }
            }
        };

    });

    // simple property

    /**
     * Define the default width the widget
     * @param {String} width
     * @method setWidth
     * @method setWidth
     * @public
     */
    Studio.setWidth = function(width) {
        this._configuration.style.width = width + 'px';
    };

    /**
     * Define the default height the widget
     * @param {String} height
     * @method setHeight
     * @public
     */
    Studio.setHeight = function(height) {
        this._configuration.style.height = height + 'px';
    };

    /**
     * Define the description of the widget
     * @param {String} description
     * @method setDescription
     * @deprecated now description is set on the package.json file
     * we keep this API only for compatibility 
     */
    Studio.setDescription = function(description) {
        this._configuration.description = description;
    };

    /**
     * Define the icon of the widget
     * @param {String} icon
     * @method setIcon
     * @deprecated now icon is set on the package.json file
     * we keep this API only for compatibility 
     */
    Studio.setIcon = function(icon) {
        this._configuration.icon = icon;
    };

    /**
     * Define the library used by the widget
     * @param {String} name
     * @method setLib
     */
    Studio.setLib = function(name) {
        this._configuration.lib = name;
    };

    /**
     * Define the panel style
     * (default area that user can see)
     * @param {String} panel
     * @method setPanelStyle
     * @public
     */
    Studio.setPanelStyle = function(panel) {
        this._configuration.panels.style = panel;
    };

    /**
     * Let the widget support label
     * @method addLabel
     * @param {object} [options]
     * @param {string} [options.defaultValue=Label]
     * @param {string} [options.position=left] - top, bottom, left, right
     * @method addLabel
     * @public
     */
    Studio.addLabel = function(options) {
        options = options || {};
        // Fixme avoid using data-label in futur version 
        this._addAttribute('data-label', {
            description: 'Label',
            defaultValue: 'defaultValue' in options ? (options.defaultValue || '') : 'Label'
        });
        this._addAttribute('data-label-position', {
            description: 'Label position',
            defaultValue: options.position || 'left'
        });
    };

    /**
     * Define the tag of the widget
     * @param {String} name
     * @deprecated  
     * @method setTag
     */
    Studio.setTag = function(name) {
        this._configuration.tag = name;
    };

    /**
     * Define the tag of the widget
     * @param {String} name
     * @method setTagName
     */
    Studio.setTagName = function(name) {
        this._configuration.tag = name;
    };

    /**
     * Define the category of the widget (new api)
     * @param {String} name
     * @method setCategory
     * @deprecated now category is set on the package.json file
     * we keep this API only for compatibility 
     */
    Studio.setCategory = function(name) {
        this._configuration.category = name;
    };

    /**
     * Set the widget in the Hidden category
     * @method hideWidget
     * @public
     */
    Studio.hideWidget = function() {
        this._configuration.hidden = true;
    };

    /**
     * Set the widget in the Hidden category
     * @method showWidget
     * @public
     */
    Studio.showWidget = function() {
        this._configuration.hidden = false;
    };

    /**
     * The the configuration of the studio
     * @param {String} configuration
     * @method setConf
     */
    Studio.setConf = function(configuration) {
        this._configuration = configuration;
    };

    /**
     * Set the template of a widget
     * @param {String} html
     * @method setTemplate
     */
    Studio.setTemplate = function(html) {
        this._configuration.template = html;
    };

    /**
     * Set the behaviors of a widget
     * @param {Object} behaviors
     * @method setBehaviors
     */
    Studio.setBehaviors = function(behaviors) {
        this._configuration.behaviors = behaviors;
    };

    /**
     * Add an inline edition of an attribute (aka. edit on double click
     * @param {string} property
     * @param {string} [selector] css - selector to put the edit part on the right html element
     * @method addInlineEdit
     */
    /*
    Studio.addInlineEdit = function(property, selector) {
        // TODO
    };
    */

    /**
     * Define an event
     * @param {String} name
     * @param {Function} callback
     * @method _studioOn
     * @private
     */
    Studio._studioOn = function(name, callback) {
        name = 'on' + String.capitalize(name);
        this._configuration.on[name] = this._configuration.on[name] || [];
        this._configuration.on[name].push(callback);
    };

    /**
     * Run a callback when the widget is resized in the studio
     * @param {Function} callback
     * @method studioOnResize
     * @private
     */
    Studio.studioOnResize = function(callback) {
        this._studioOn('resize', function() {
            callback.call(this);
        });
    };

    // INSTANCE METHODS

    /**
     * Synchronize the widget with its tag
     * (no refresh of the panel)
     * @method studioSync
     */
    Studio.prototype.studioSync = function() {
        var id = this.options.id,
        tag = Designer.getById(id);

        tag.setWidget(this);
        this._tag = tag;
    };

    /**
     * Change the CSS of the file linked to the page
     * @param {String} property
     * @param {String} value
     * @method studioCss
     */
    Studio.prototype.studioCss = function(property, value) {
        function getCss(tag, property) {
            switch (property) {
                case 'top':
                case 'bottom':
                case 'right':
                case 'left':
                case 'z-index':
                    return tag.getStyle(property);
                default:
                    return tag.getComputedStyle(property);
            }
        }

        function setCss(tag, property, value) {
            value = typeof value === 'string' && value || value.toString();

            var cleanVal = value.replace('px', '').trim();

            switch (property) {
                case 'top':
                case 'bottom':
                case 'right':
                case 'left':
                case 'width':
                case 'height':
                    tag.savePosition(property, cleanVal, false);
                    break;
                case 'z-index':
                    tag.updateZindex(cleanVal);
                    break;
                default:
                    tag.setCss(property, cleanVal);
                    break;
            }
        }

        if (typeof value === 'undefined') {
            return getCss(this._tag, property);
        } else {
            setCss(this._tag, property, value);
        }
    };

    /**
     * Change the HTML of the widget tag
     * @param {String} attribute
     * @param {String} value
     * @method studioVal
     */
    Studio.prototype.studioVal = function(attribute, value) {
        var tagAttribute = this._tag.getAttribute(attribute),
        result = null;
        if (typeof value === 'undefined') {
            if (tagAttribute) {
                result = tagAttribute.getValue();
            }
            return result;
        } else {
            if (tagAttribute) {
                tagAttribute.setValue(value);
                this._tag.domUpdate();
            }
        }
    };

    /**
     * Attach the widget to another widget
     * @param {type} widget
     * @method studioParent
     */
    Studio.prototype.studioParent = function(widget) {
        if (widget && widget.id) {
            this._tag.setParent(widget._tag);
        } else {
            this._tag.setParent(null);
        }
    };

    /**
     * Synchronize the widget with the panel property
     * @method studioPanelRefresh
     */
    Studio.prototype.studioPanelRefresh = function() {
        Designer.tag.refreshPanels();
    };

    Studio.whenInherited = function(klass) {
        // retrieve the package name (only for widgets)
        if ('waf-core/widget' in WAF.require.modules && WAF.require('waf-core/widget').isWidgetClass(klass)) {
            klass._configuration.packageName = Studio.currentPackageName;

            klass._addAttribute('data-package', {
                defaultValue: klass._configuration.packageName,
                visibility: 'hidden'
            });
        } else {
            // Don't inherit _getConf on behaviors
            delete klass._getConf;
        }
    };


    /**
     * Tel if the widget is part of a parent widget
     * @returns {boolean}
     * @method isSubWidget
     */
    Studio.prototype.isSubWidget = function() {
        if (!this.parentWidget) {
            return false;
        }
        return this.parentWidget._childIsSubWidget(this);
    };

    Studio.prototype._childIsSubWidget = function(widget) {
        // ask all behaviors if it thinks that the widget is a subwidget
        return this.constructor.supers.some(function(sup) {
            if ('_behaviorChildIsSubWidget' in sup.prototype) {
                return sup.prototype._behaviorChildIsSubWidget.call(this, widget);
            }
        }.bind(this));
    };

    /**
     * Return the selected sub widget
     * @param {mouseEvent} event
     * @returns {widget|undefined}
     */
    Studio.prototype.getSelectedSubWidget = function(event) {
        var widget = WAF.require('waf-core/widget').get(event.target);
        if(widget) {
            var w = widget;
            while(w !== this) {
                if(w._studioUnselectable) {
                    return this;
                }
                w = w.parentWidget;
            }
        }
        return widget;
    };

    /**
     * True if the user can drop a widget inside the widget
     * @returns {boolean}
     */
    Studio.prototype.studioCanDrop = function() {
        return this.constructor.supers.some(function(behavior) {
            if(behavior.prototype._studioCanDrop) {
                return behavior.prototype._studioCanDrop.call(this);
            }
            return false;
        }.bind(this));
    };

    return Studio;
});
