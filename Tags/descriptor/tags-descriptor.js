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
WAF.tags.descriptor = {
}


/**
 * TagDescriptor
 * @namespace WAF.tags
 * @class Descriptor
 * @params {Object} config parameters
 */
WAF.tags.Descriptor = function(config) {
    var i = 0,
    length = 0,
    attribute = {};

    config = config || {};
    config.packageName = config.packageName || '';
    config.type = config.type || '';
    config.lib = config.lib || 'WAF';
    config.description = config.description || '';
    config.category = config.category || '';
    config.img = config.img || '';
    config.css = config.css || [];
    config.include = config.include || [];
    config.tag = config.tag || 'div';
    config.onDesign = config.onDesign || function() {
    };
    config.onInit = config.onInit || function() {
    };
    config.attributes = config.attributes || [];
    config.structure = config.structure || [];
    config.events = config.events || [];
    config.style = config.style || [];
    config.properties = config.properties || {};
    config.menuItems = config.menuItems || [];
    config.template = config.template || '';
    config.behaviors = config.behaviors || {
        isContainer: false
    };

    this._config = config;

    // properties inherited from config
    this._packageName = config.packageName;
    this._type = config.type;
    this._lib = config.lib;
    this._description = config.description;
    this._category = config.category;
    this._img = config.img;
    this._css = config.css;
    this._include = config.include;
    this._tag = config.tag;
    this._onDesign = config.onDesign;
    this._onInit = config.onInit;
    this._properties = config.properties;
    this._menuItems = config.menuItems;
    this._template = config.template;
    this._behaviors = config.behaviors;

    // property for design only
    this._internalId = -1;

    // list
    this._attributes = new WAF.tags.list.PropertyDescriptor();
    length = config.attributes.length;

    // add default attributes

    // id
    attribute = new WAF.tags.descriptor.Attribute({
        name: 'id',
        description: 'ID'
    });
    attribute.setDescriptor(this);
    this._attributes.add(attribute);

    // data-type
    attribute = new WAF.tags.descriptor.Attribute({
        name: 'data-type',
        description: 'type',
        defaultValue: config.type
    });
    attribute.setDescriptor(this);
    this._attributes.add(attribute);

    // data-hideOnLoad
    attribute = new WAF.tags.descriptor.Attribute({
        name: 'data-hideonload',
        description: 'Hide widget on load',
        defaultValue: false
    });
    attribute.setDescriptor(this);
    this._attributes.add(attribute);

    // data-lib
    attribute = new WAF.tags.descriptor.Attribute({
        name: 'data-lib',
        description: 'library',
        defaultValue: config.lib
    });
    attribute.setDescriptor(this);
    this._attributes.add(attribute);

    for (i = 0; i < length; i++) {
        attribute = new WAF.tags.descriptor.Attribute(config.attributes[i]);
        attribute.setDescriptor(this);
        this._attributes.add(attribute);
    }

    this._style = new WAF.tags.list.PropertyDescriptor();
    length = config.style.length;
    for (i = 0; i < length; i++) {
        this._style.add(new WAF.tags.descriptor.Style(config.style[i]));
    }

    this._events = new WAF.tags.list.PropertyDescriptor();
    length = config.events.length;
    for (i = 0; i < length; i++) {
        this._events.add(new WAF.tags.descriptor.Event(config.events[i]));
    }

    this._menuItems = new WAF.tags.list.PropertyDescriptor();
    length = config.menuItems.length;
    for (i = 0; i < length; i++) {
        this._menuItems.add(new WAF.tags.descriptor.MenuItem(config.menuItem[i]));
    }

    if (config.columns) {
        this._columns = new WAF.tags.list.Column();
    } else {
        this._columns = null;
    }

    if (config.properties.style) {
        this._propertyStyle = new WAF.tags.descriptor.PropertyStyle(config.properties.style);
    } else {
        this._propertyStyle = null;
    }

    this._structure = new WAF.tags.list.PropertyDescriptor();
    length = config.structure.length;
    for (i = 0; i < length; i++) {
        this._structure.add(new WAF.tags.descriptor.Structure(config.structure[i]));
    }

    /*
     * If the tag has a label => auto add label into the structure
     */
    if (this.getAttribute('data-label')) {
        this._structure.add(new WAF.tags.descriptor.Structure({
            description: 'label',
            selector: 'waf-label'
        }));
    }

}

/**
 * Get the configuration file of the descriptor
 * @namespace WAF.tags.Descriptor
 * @method getConfig
 * @return {String} the value of the attribute
 */
WAF.tags.Descriptor.prototype.getConfig = function() {
    return this._config;
};

/**
 * Get the internal id of the descriptor
 * @namespace WAF.tags.Descriptor
 * @method getConfig
 * @return {String} the value of the attribute
 */
WAF.tags.Descriptor.prototype.getInternalId = function() {
    return this._internalId;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method getPackageName
 * @return {String} the value of the attribute
 */
WAF.tags.Descriptor.prototype.getPackageName = function() {
    return this._packageName;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method getType
 * @return {String} the value of the attribute
 */
WAF.tags.Descriptor.prototype.getType = function() {
    return this._type;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method getLib
 * @return {String} the value of the attribute
 */
WAF.tags.Descriptor.prototype.getLib = function() {
    return this._lib;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method getDescription
 * @return {String} the value of the attribute
 */
WAF.tags.Descriptor.prototype.getDescription = function() {
    return this._description;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method getBehaviors
 * @return {String} the value of the attribute
 */
WAF.tags.Descriptor.prototype.getBehaviors = function() {
    return this._behaviors;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method getCategory
 * @return {String} the value of the attribute
 */
WAF.tags.Descriptor.prototype.getCategory = function() {
    return this._category;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method getCategory
 * @return {WAF.tags.list.column} the value of the attribute
 */
WAF.tags.Descriptor.prototype.getColumns = function() {
    return this._columns;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method getImg
 * @return {String} the value of the attribute
 */
WAF.tags.Descriptor.prototype.getImg = function() {
    return this._img;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method getCss
 * @return {String} the value of the attribute
 */
WAF.tags.Descriptor.prototype.getCss = function() {
    return this._css;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method getInclude
 * @return {String} the value of the attribute
 */
WAF.tags.Descriptor.prototype.getInclude = function() {
    return this._include;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method getTag
 * @return {String} the value of the attribute
 */
WAF.tags.Descriptor.prototype.getTag = function() {
    return this._tag;
};

/**
 * Get the template of the tag
 * @namespace WAF.tags.Descriptor
 * @method getTemplate
 * @return {String} the template of the tag
 */
WAF.tags.Descriptor.prototype.getTemplate = function() {
    return this._template;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method onDesign
 * @param {Designer.api} designer set of functions for gui designer management
 * @param {Designer.ui.Tag} tag container of the tag in the designer
 * @param {Object} catalog catalog of DataClasses
 * @param {Boolean} isResize is a resize call
 */
WAF.tags.Descriptor.prototype.onDesign = function(designer, tag, catalog, isResize) {
    return this._onDesign(designer, tag, catalog, isResize);
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method onInit
 * @param {Object} param all the of attributes of the html tag
 */
WAF.tags.Descriptor.prototype.onInit = function(param) {
    return this._onInit(param);
};

/**
 * Get the list of the attribute descriptor
 * @namespace WAF.tags.Descriptor
 * @method getAttributes
 * @return {WAF.tags.list.PropertyDescriptor} list of the attributes
 */
WAF.tags.Descriptor.prototype.getAttributes = function() {
    return this._attributes;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method getAttribute
 * @param {String} name name
 * @return {WAF.tags.descriptor.Attribute} attribute descriptor
 */
WAF.tags.Descriptor.prototype.getAttribute = function(name) {
    return this._attributes.getByName(name);
};

WAF.tags.Descriptor.prototype.getAttributeOptions = function(name, column) {
    var i, max,
        options = null,
        attribute = null;
    
    for (i = 0, max = this.config.attributes.length; i < max; i++) {
        attribute = this.config.attributes[i];
        
        if (attribute.name === name) {
            options = typeof column !== 'undefined' ? attribute.columns[column].options : attribute.options;
            break;
        }
    }
    
    return options;
};

/**
 * Get the list of datasource attributes of a widget
 * @namespace WAF.tags.Descriptor
 * @method getDataSourceAttributes
 * @param {String}
 * @return {Object} list of attributes
 */
WAF.tags.Descriptor.prototype.getDataSourceAttributes = function() {
    var
    i,
    result,
    attribute,
    attributes,
    attributeLength;

    result = [];
    attributes = this.getAttributes();
    attributeLength = attributes.count();

    for (i = 0; i < attributeLength; i += 1) {
        attribute = attributes.get(i);
        if (attribute.getTypeValue() === 'datasource' || attribute.getName() === 'data-binding') {
            result.push(attribute);
        }
    }

    return result;
};

/**
 * Get the list of the event descriptor
 * @namespace WAF.tags.Descriptor
 * @method getEvents
 * @return {WAF.tags.list.PropertyDescriptor} list of the events
 */
WAF.tags.Descriptor.prototype.getEvents = function() {
    return this._events;
};

/**
 * Get an event description by its name
 * @namespace WAF.tags.Descriptor
 * @method getEvent
 * @return {WAF.tags.descriptor.Event} Event descriptor
 */
WAF.tags.Descriptor.prototype.getEvent = function(name) {
    return this._events.getByName(name);
};

/**
 * Get the list of the style descriptor
 * @namespace WAF.tags.Descriptor
 * @method getStyles
 * @return {Designer.list.TagPropertyDescriptor} list of the style
 */
WAF.tags.Descriptor.prototype.getStyles = function() {
    return this._style;
};

/**
 * Get an style description by its name
 * @namespace WAF.tags.Descriptor
 * @method getStyle
 * @return {WAF.tags.descriptor.Style} style descriptor
 */
WAF.tags.Descriptor.prototype.getStyle = function(name) {
    return this._style.getByName(name);
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.Descriptor
 * @method getPropertyStyle
 * @return {WAF.tags.descriptor.PropertyStyle} propertyStyle descriptor
 */
WAF.tags.Descriptor.prototype.getPropertyStyle = function() {
    return this._propertyStyle;
};


/**
 * Get the list of the structure descriptor
 * @namespace WAF.tags.Descriptor
 * @method getStructures
 * @return {Designer.list.TagPropertyDescriptor} list of the structure
 */
WAF.tags.Descriptor.prototype.getStructures = function() {
    return this._structure;
};

/**
 * Get the list of subItems descriptor
 * @namespace WAF.tags.Descriptor
 * @method getSubItems
 * @return {Designer.list.TagPropertyDescriptor} list of subitems
 */
WAF.tags.Descriptor.prototype.getMenuItems = function() {
    return this._menuItems;
};

// Setter

/**
 * Set the internal id of the descriptor
 * @namespace WAF.tags.Descriptor
 * @method setInternalId
 * @param {String} value the value of the attribute
 */
WAF.tags.Descriptor.prototype.setInternalId = function(value) {
    this._internalId = value;
};

/**
 * Set the template of the tag
 * @namespace WAF.tags.Descriptor
 * @method setTemplate
 * @param {String} value the value of the attribute
 */
WAF.tags.Descriptor.prototype.setTemplate = function(value) {
    this._template = value;
};

/**
 * Set the template of the tag
 * @namespace WAF.tags.Descriptor
 * @method setBehaviors
 * @param {String} value the value of the attribute
 */
WAF.tags.Descriptor.prototype.setBehaviors = function(value) {
    this._behaviors = value;
};

// Add

/**
 * Add a new attribute to the descriptor
 * @namespace WAF.tags.Descriptor
 * @method addAttribute
 * @param {String} name name of the attribute to add to the descriptor
 */
WAF.tags.Descriptor.prototype.addAttribute = function(name) {
    var attribute = null;
    if (!this._attributes.getByName(name)) {
        attribute = new WAF.tags.descriptor.Attribute({
            name: name,
            description: name
        });
        attribute.setDescriptor(this);
        this._attributes.add(attribute);
    }
};

/**
 * Add a new menuItem to the descriptor
 * @namespace WAF.tags.Descriptor
 * @method addMenuItem
 * @param {Object} config menuItem properties
 * @param {Function} callback callback
 */
WAF.tags.Descriptor.prototype.addMenuItem = function(config, callback) {
    var
    menuItem,
    tagDefinition,
    subMenu,
    direction,
    borderLeft,
    borderTop,
    parentBar;

    config = config || {};
    config.parent = this;
    parentBar = this.getParent();
    borderLeft = parentBar ? parseInt(parentBar.getComputedStyle('border-width')) : 0;
    borderTop = borderLeft;

    if (this.isMenuBar()) {
        menuItem = new WAF.tags.descriptor.MenuItem(config);
        menuItem.init();

        this._menuItems.add(menuItem);

        this.onDesign({
            resize: true,
            redrawItems: false // to do not redraw all menu items of the menubar
        });

        menuItem.getTag().domUpdate();
    } else { // if the current tag is not a menubar => create one    
        if (this._menuBar) {
            subMenu = this._menuBar;
        } else {
            tagDefinition = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('menuBar'));

            subMenu = new Designer.tag.Tag(tagDefinition);
            subMenu.create({
                parent: this,
                width: this.getWidth() + 'px'
            });
            subMenu.save(false, false);
            subMenu.setParent(this);
        }

        D.tag.displayParentsMenuBar(this)

        direction = this.getParent().getAttribute('data-display').getValue();

        if (direction === 'horizontal') {
            subMenu.setXY(0, this.getHeight() + borderTop, true);
        } else {
            subMenu.setXY(this.getWidth() + borderLeft, 0, true);
        }

        subMenu.getAttribute('data-display').setValue('vertical');

        subMenu.addMenuItem(config);
    }
    this.setResizable(true);



    if (this.getParent().isMenuItem()) {
        this.getParent().displayInfo();
    }

    if (callback) {
        callback(menuItem);
    }

    /**
     * Call custom after add item event
     */
    $(this).trigger('afterAddItem', [menuItem, config.silentMode]);

};