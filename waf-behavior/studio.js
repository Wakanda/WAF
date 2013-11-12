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
    var Behavior = WAF.require('waf-core/behavior');

    Behavior.Studio = Behavior.create('Studio');

    // CLASS PROPERTIES

    /***
     * Default configuration file
     * @type _configuration
     */
    Behavior.Studio._configuration = {
        type: '',
        description: '',
        category: '',
        attributes: [],
        style: {},
        structures: [],
        events: [],
        on: [],
        panels: {
        },
        options: {
        }
    };

    /*
     * GUI Designer Tag linked to the widget
     * @type _tag
     */
    Behavior.Studio._tag;

    // CLASS METHODS

    // PRIVATE

    /**
     * Get the configuration file
     * well formated for the GUI Designer
     * @returns {Object}
     */
    Behavior.Studio._getConf = function() {
        // define configuration file
        var configuration = {
            'attributes': this._configuration.attributes || [],
            'category': this._configuration.category || 'Custom Widgets',
            'description': this._configuration.description || this.prototype.kind,
            'events': this._configuration.events || [],
            'img': this._configuration.icon || '/icons/widget.png',
            'isCustom': 'true',
            'lib': this._configuration.lib,
            'properties': {},
            'style': [],
            'structure': this._configuration.structures || [],
            'tag': this._configuration.tag,
            'template': this._configuration.template || '',
            'behaviors': this._configuration.behaviors || {
                isContainer: false
            },
            'type': this._configuration.type || this.prototype.kind
        },
        length = 0,
        i = 0,
        event;

        // style panel
        configuration.properties.style = this._configuration.panels.style ||
        {
            'theme': false,
            'fClass': true,
            'text': false,
            'background': true,
            'border': true,
            'sizePosition': true,
            'label': true,
            'disabled': ['border-radius']
        };

        // style panel
        configuration.properties.state = this._configuration.panels.state || [];

        // style panel
        configuration.properties.state = this._configuration.panels.state || [];

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
        length = this._configuration.on.length;
        for (i = 0; i < length; i++) {
            event = this._configuration.on[i];
            configuration[event.name] = event.callback;
        }

        // return created configuration object with options added (like bindable,...)
        return WAF.extend(true, configuration, this._configuration.options);
    };

    // PUBLIC

    // set complex properties

    /**
     * Define new attributes for the widget
     * @method addAttributes
     * @param {Array} attributes array of attributes
     */
    Behavior.Studio.addAttributes = function(attributes) {
        var that = this;

        if (Array.isArray(attributes)) {
            attributes.forEach(function(attribute) {
                that.addAttribute(attribute);
            });
        } else {
            that.addAttribute(attributes);
        }
    };

    /**
     * Define new option for the widget configuration
     * @method addOption
     * @param {String} name
     * @param {String} value
     */
    Behavior.Studio.addOption = function(name, value) {
        this._configuration.options[name] = value;
    };

    /**
     * Define a new attribute for the widget
     * @method addAttribute
     * @param {Object} attribute
     */
    Behavior.Studio.addAttribute = function(attribute) {
        // set or upgrade the attribute
        if(!this._configuration.attributes.some(function(obj) {
            if(obj.name == attribute.name) {
                attribute = WAF.extend(obj, attribute);
                return true;
            }
        })) this._configuration.attributes.push(attribute);

        // set the default description
        if(attribute.description === undefined)
            attribute.description = attribute.name.replace(/^data-/, '').split('-').map(String.capitalize).join(' ');
        
        // set the default value if we knew it
        if(!('defaultValue' in attribute)) {
            var m = /^data-(.*)/.exec(attribute.name);
            if(m && m[1] in this._properties && 'default_value' in this._properties[m[1]]) {
                attribute.defaultValue = this._properties[m[1]].default_value;
            }
        }
    };

    /**
     * Define new events for the widget
     * @method addEvents
     * @param {Array} events array of events
     */
    Behavior.Studio.addEvents = function(events) {
        var that = this;

        events.forEach(function(event) {
            that.addEvent(event)
        });
    };

    /**
     * Define a new event for the widget
     * @method addEvent
     * @param {Object} event
     */
    Behavior.Studio.addEvent = function(event) {
        if(!this._configuration.events.some(function(obj) {
            if(obj.name == event.name) {
                event = WAF.extend(obj, event);
                return true;
            }
        })) this._configuration.events.push(event);
        if(event.description === undefined)
            event.description = 'On ' + event.name;
        
    };

    /**
     * Define a new structure for the widget
     * @method addStructure
     * @param {Object} structure
     */
    Behavior.Studio.addStructure = function(structure) {
        this._configuration.structures.push(structure);
    };

    /**
     * Define a new structure for the widget
     * @method addStructures
     * @param {Array} structure array of sructure
     */
    Behavior.Studio.addStructures = function(structure) {
        if (Array.isArray(structure)) {
            this._configuration.structures = structure;
        }
    };

    // simple property

    /**
     * Define the default width the widget
     * @param {String} width
     * @method setWidth
     */
    Behavior.Studio.setWidth = function(width) {
        this._configuration.style.width = width + 'px';
    };

    /**
     * Define the default height the widget
     * @param {String} height
     */
    Behavior.Studio.setHeight = function(height) {
        this._configuration.style.height = height + 'px';
    };

    /**
     * Define the description of the widget
     * @param {String} description
     */
    Behavior.Studio.setDescription = function(description) {
        this._configuration.description = description;
    };

    /**
     * Define the icon of the widget
     * @param {String} icon
     */
    Behavior.Studio.setIcon = function(icon) {
        this._configuration.icon = icon;
    };

    /**
     * Define the library used by the widget
     * @param {String} name
     */
    Behavior.Studio.setLib = function(name) {
        this._configuration.lib = name;
    };

    /**
     * Define the panel style
     * (default area that user can see)
     * @param {String} panel
     */
    Behavior.Studio.setPanelStyle = function(panel) {
        this._configuration.panels.style = panel;
    };

    /**
     * Define the position of the label
     * @method setLabelPosition
     * @param {top|bottom|left|right} position position of the label
     */
    Behavior.Studio.setLabelPosition = function(position) {
        this._configuration.attributes.push({
            name: 'data-label-position',
            description: 'Label position',
            defaultValue: position
        });
    };

    /**
     * Define the state style
     * (default area that user can see)
     * @param {String} status
     */
    Behavior.Studio.addState = function(status) {
        if (!this._configuration.panels.state) {
            this._configuration.panels.state = [];
        }
        this._configuration.panels.state.push(status);
    };

    /**
     * Define the tag of the widget
     * @param {String} name
     * @deprecated  
     */
    Behavior.Studio.setTag = function(name) {
        this._configuration.tag = name;
    };

    /**
     * Define the tag of the widget
     * @param {String} name
     */
    Behavior.Studio.setTagName = function(name) {
        this._configuration.tag = name;
    };

    /**
     * Define the state style
     * (default area that user can see)
     * @param {String} status
     */
    Behavior.Studio.addState = function(status) {
        if (!this._configuration.panels.state) {
            this._configuration.panels.state = [];
        }
        this._configuration.panels.state.push(status);
    };

    /**
     * Define the tag of the widget
     * @param {String} name
     * @deprecated  
     */
    Behavior.Studio.setTag = function(name) {
        this._configuration.tag = name;
    };

    /**
     * Define the category of the widget (new api)
     * @param {String} name
     */
    Behavior.Studio.setCategory = function(name) {
        this._configuration.category = name;
    };

    /**
     * The the configuration of the studio
     * @param {String} configuration
     */
    Behavior.Studio.setConf = function(configuration) {
        this._configuration = configuration;
    };

    /**
     * Set the template of a widget
     * @param {String} html
     */
    Behavior.Studio.setTemplate = function(html) {
        this._configuration.template = html;
    };

    /**
     * Set the behaviors of a widget
     * @param {Object} behaviors
     */
    Behavior.Studio.setBehaviors = function(behaviors) {
        this._configuration.behaviors = behaviors;
    };

    /**
     * Define an event
     * @param {String} name
     * @param {Function} callback
     */
    Behavior.Studio.on = function(name, callback) {
        this._configuration.on.push({
            'name': 'on' + WAF.capitalize(name),
            'callback': function(event) {
                try {
                    callback.call(this, event);
                } catch (e) {
                    console.log('Errors in executing widget event', e, event);
                    Designer.ui.dialog.show("Errors in executing widget event", 'See console logs for more information', {
                        'text-align': 'left'
                    }, 500);
                }
            }
        });
    };

    // INSTANCE METHODS

    /**
     * Synchronize the widget with its tag
     * (no refresh of the panel)
     */
    Behavior.Studio.prototype.studioSync = function() {
        var id = this.options.id,
        tag = Designer.getById(id);

        tag.setWidget(this);
        this._tag = tag;
    };

    /**
     * Change the CSS of the file linked to the page
     * @param {String} property
     * @param {String} value
     */
    Behavior.Studio.prototype.studioCss = function(property, value) {
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
     */
    Behavior.Studio.prototype.studioVal = function(attribute, value) {
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
     */
    Behavior.Studio.prototype.studioParent = function(widget) {
        if (widget & widget.id) {
            this._tag.setParent(widget._tag);
        } else {
            this._tag.setParent(null);
        }
    };

    /**
     * Synchronize the widget with the panel property
     */
    Behavior.Studio.prototype.studioPanelRefresh = function() {
        Designer.tag.refreshPanels();
    };

    /**
     * Tel if the widget is part of a parent widget
     * @returns {boolean}
     */
    Behavior.Studio.prototype.isSubWidget = function() {
        if(!this.parent_widget) return false;
        return this.parent_widget._childIsSubWidget(this);
    };

    Behavior.Studio.prototype._childIsSubWidget = function(widget) {
        // ask all behaviors if it thinks that the widget is a subwidget
        return this.constructor.supers.some(function(sup) {
            if('_childIsSubWidget' in sup.prototype)
                return sup.prototype._childIsSubWidget.call(this, widget);
        }.bind(this));
    };

    return Behavior.Studio;
});
