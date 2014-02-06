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
    var Behavior = WAF.require('waf-core/behavior'),
        Class = WAF.require('waf-core/class'),
        Widget = WAF.require('waf-core/widget');

    var Studio = Behavior.create('Studio');

    // CLASS PROPERTIES

    /***
     * Default configuration file
     * @type _configuration
     */
    Studio._configuration = {
        category: 'Custom Widgets',
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

    /*
     * GUI Designer Tag linked to the widget
     * @type _tag
     */
    Studio._tag;

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
            'category': this._configuration.category || Studio._configuration.category,
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
            'tag': this._configuration.tag,
            'template': this._configuration.template || '',
            'behaviors': this._configuration.behaviors || {
                'isContainer': false
            },
            'type': this._configuration.type || this.prototype.kind,
            'packageName': this._configuration.packageName + '/package.json'
        };

        // Hide the widget if if doesn't directly inherit from Studio (ie: Studio is inherited from a behavior)
        if(!~this.supers.indexOf(Studio))
            configuration.category = 'Hidden';

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
        WAF.extend(configuration, this._configuration.on);

        // create ordered list of attributes, events, and structures
        // based on defined order, or on order property
        ['attributes', 'events', 'structures', 'states'].forEach(function(k) {
            var dest = configuration[k];
            if(k == 'states') dest = configuration.properties.state;
            var source = this._configuration[k];
            var order = this._configuration[k + '_order'] || [];
            var key = { 
                structures: 'selector',
                states: 'label'
            }[k] || 'name';
            order.forEach(function(name) {
                var o = {};
                o[key] = name;
                dest.push(WAF.extend(source[name], o));
            });
            var l = [];
            for(var name in source) {
                if(!~order.indexOf(name)) {
                    var o = {};
                    o[key] = name;
                    l.push(WAF.extend(source[name], o));
                }
            }
            l.sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
            configuration[k] = dest.concat(l);
        }.bind(this));

        // GUI disgner expect structure instead of structures
        configuration.structure = configuration.structures

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
     * @method addAttribute
     * @param {string|Object} name - attribute name, or object defining the attribute
     * @param {Object} [attribute] - object defining the attribute
     * @method addAttribute
     */
    Studio.addAttribute = function(name, attribute) {
        if(typeof name == 'object')
            return this.addAttribute(name.name, name);
        attribute = attribute || {};

        // set or upgrade the attribute
        this._configuration.attributes[name] = attribute = WAF.extend(this._configuration.attributes[name] || {}, attribute);

        // set the default description
        if(attribute.description === undefined)
            attribute.description = name.replace(/^data-/, '').split('-').map(String.capitalize).join(' ');
        
        // set the default value if we knew it
        if(!('defaultValue' in attribute)) {
            var m = /^data-(.*)/.exec(attribute.name);
            if(m && m[1] in this._properties && 'defaultValue' in this._properties[m[1]]) {
                attribute.defaultValue = this._properties[m[1]].defaultValue;
            }
        }
        // order attributes globally, this way, inherited attributes are not mixed with new attributes
        attribute.order = attribute_counter++;
    };
    var attribute_counter = 0;

    /**
     * Define a new event for the widget
     * @method addEvent
     * @param {string|Event|object} name - Event name
     * @param {object} [event] - Object defining the event
     * @param {string} [event.description]
     * @method addEvent
     */
    Studio.addEvent = function(name, event) {
        if(Class.inheritFrom(name, Event.All))
            name = name.kind;
        if(typeof name == 'object')
            return this.addEvent(name.name, name);

        this._configuration.events[name] = event = WAF.extend(this._configuration.events[name] || {}, event);
        
        if(event.description === undefined)
            event.description = 'On ' + name;
    };

    /**
     * Define a new structure for the widget
     * @method addStructure
     * @param {string|object} selector - selector of the structure, or object defining the structure
     * @param {Object} [structure] - object defining the structure
     * @method addStructure
     */
    Studio.addStructure = function(selector, structure) {
        if(typeof selector == 'object')
            return this.addStructure(selector.selector, selector);
        this._configuration.structures[selector] = structure = WAF.extend(this._configuration.structures[selector] || {}, structure);
        
        if(structure.description === undefined)
            structure.description = selector;
    };

    /**
     * Define the state style
     * (default area that user can see)
     * @param {String} status
     * @method addState
     */
    Studio.addState = function(label, state) {
        if(typeof state == 'object')
            return this.addState(label.label, label);

        this._configuration.states[label] = state = WAF.extend(this._configuration.states[label] || {
            cssClass: 'waf-state-hover' + label,
            find: '',
            mobile: label != 'hover'
        }, state);
    };

    // addAttributes, addEvents, addStructures, addStates
    // removeAttribute, removeEvent, removeStructure, removeState
    // orderAttributes, orderEvents, orderStructures, orderStates
    ['attribute', 'event', 'structure', 'state'].forEach(function(k) {
        Studio['remove' + k.capitalize()] = function(name) {
            if(name in this._configuration[k + 's'])
                delete this._configuration[k + 's'][name];
        }

        Studio['order' + k.capitalize() + 's'] = function(order) {
            this._configuration[k + 's_order'] = order;
        }

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
     */
    Studio.setWidth = function(width) {
        this._configuration.style.width = width + 'px';
    };

    /**
     * Define the default height the widget
     * @param {String} height
     * @method setHeight
     */
    Studio.setHeight = function(height) {
        this._configuration.style.height = height + 'px';
    };

    /**
     * Define the description of the widget
     * @param {String} description
     * @method setDescription
     */
    Studio.setDescription = function(description) {
        this._configuration.description = description;
    };

    /**
     * Define the icon of the widget
     * @param {String} icon
     * @method setIcon
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
     */
    Studio.setPanelStyle = function(panel) {
        this._configuration.panels.style = panel;
    };

    /**
     * Define the position of the label
     * @method setLabelPosition
     * @param {top|bottom|left|right} position position of the label
     * @method setLabelPosition
     */
    Studio.setLabelPosition = function(position) {
        this.addAttribute('data-label-position', {
            description: 'Label position',
            defaultValue: position
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
     */
    Studio.setCategory = function(name) {
        this._configuration.category = name;
    };

    /**
     * Set the widget in the Hidden category
     * @method hideWidget
     */
    Studio.hideWidget = function() {
        this.setCategory('Hidden');
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
     * @param {string} attribute
     * @param {string} [selector] css - selector to put the edit part on the right html element
     * @method addInlineEdit
     */
    Studio.addInlineEdit = function(property, selector) {
        // TODO
    };

    /**
     * Define an event
     * @param {String} name
     * @param {Function} callback
     * @method on
     */
    Studio.on = function(name, callback) {
        this._configuration.on[name] = function(event) {
            try {
                callback.call(this, event);
            } catch (e) {
                console.log('Errors in executing widget event', e, event);
                Designer.ui.dialog.show("Errors in executing widget event", 'See console logs for more information', {
                    'text-align': 'left'
                }, 500);
            }
        };
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
                    break;
                default:
                    return tag.getComputedStyle(property);
                    break;
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
        if (widget & widget.id) {
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
        // retrieve the package name
        klass._configuration.packageName = window.Designer && Designer.env && Designer.env.currentPackageName;

        klass.addAttribute('data-package', {
            defaultValue: klass._configuration.packageName,
            visibility: 'hidden'
        });
    };


    /**
     * Tel if the widget is part of a parent widget
     * @returns {boolean}
     * @method isSubWidget
     */
    Studio.prototype.isSubWidget = function() {
        if(!this.parentWidget) return false;
        return this.parentWidget._childIsSubWidget(this);
    };

    Studio.prototype._childIsSubWidget = function(widget) {
        // ask all behaviors if it thinks that the widget is a subwidget
        return this.constructor.supers.some(function(sup) {
            if('_childIsSubWidget' in sup.prototype)
                return sup.prototype._childIsSubWidget.call(this, widget);
        }.bind(this));
    };

    return Studio;
});
