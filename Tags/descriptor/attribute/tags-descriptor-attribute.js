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
/**
 * Attribute of Tag Descriptor
 * @namespace WAF.tags.descriptor
 * @class Attribute
 * @params {Object} config parameters
 */
WAF.tags.descriptor.Attribute = function(config) {
    config = config || {};

    config.name             = config.name         || '';
    config.defaultValue     = typeof config.defaultValue == 'undefined' ? '' : config.defaultValue;
    config.typeValue        = config.typeValue    || '';
    config.description      = config.description  || '';
    config.tooltip          = config.tooltip      || '';
    config.type             = config.type         || '';
    config.options          = config.options      || '';
    config.tab              = config.tab          || '';
    if (typeof config.visibility === 'undefined') {
        config.visibility   = true;
    }
    
    if (typeof config.category === 'undefined') {
        config.category     = 0;
    }    

    this._config = config;
    // properties inherited from config
    this._name              = config.name;
    this._defaultValue      = config.defaultValue;
    this._description       = config.description;
    this._tooltip           = config.tooltip;
    this._type              = config.type;
    this._options           = config.options;
    this._category          = config.category;
    this._tab               = config.tab;
    this._typeValue         = config.typeValue;
    this._domAttribute      = config.domAttribute;
    this._visibility        = config.visibility;
    this._contextEnabled = config.contextEnabled || null;
    this._saveHistory       = typeof config.saveHistory == 'undefined' ? true : config.saveHistory;

    // property
    this._value             = '';
    this._oldValue          = '';
    this._descriptor        = {};
    this._onChangeStore = [];
};


// GETTER


/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method getName
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Attribute.prototype.getName = function () {
    return this._name;
};

/**
 * Get the value of the default value of the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method getDefaultValue
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Attribute.prototype.getDefaultValue = function () {
    return this._defaultValue;
};

/**
 * Get the type of the value of the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method getTypeValue
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Attribute.prototype.getTypeValue = function () {
    return this._typeValue;
};

/**
 * Get the value of the description of the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method getDescription
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Attribute.prototype.getDescription = function () {
    return this._description;
};

/**
 * Get the value of the desritor of the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method getDescriptor
 * @return {WAF.tags.Descriptor} the value of the attribute
 */
WAF.tags.descriptor.Attribute.prototype.getDescriptor = function () {
    return this._descriptor;
};

/**
 * Get the value of the options of the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method getOptions
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Attribute.prototype.getOptions = function () {
    var options = [];
    var i       = 0;

    if (this._options.length === 0) {
        for (i in this._options) {
            options.push(this._options[i]);
        }
    } else {
        options = this._options;
    }
    
    return options;
};

/**
 * Get the value of the tooltip of the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method getTooltip
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Attribute.prototype.getTooltip = function () {
    return this._tooltip;
};

/**
 * Get the value of the type of the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method getType
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Attribute.prototype.getType = function () {
    return this._type;
};

/**
 * Get the value of the type of the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method getVisibility
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Attribute.prototype.getVisibility = function () {
    return this._visibility;
};

/**
 * Get the value of the type of the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method getCategory
 * @return {Integer} the value of the attribute
 */
WAF.tags.descriptor.Attribute.prototype.getCategory = function () {
    return this._category;
};

/**
 * Get the tab where the attribute must be placed
 * @namespace WAF.tags.descriptor.Attribute
 * @method getTab
 * @return {String} name of the tab
 */
WAF.tags.descriptor.Attribute.prototype.getTab = function () {
    return this._tab;
};

/**
 * Get the value of the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method getValue
 * @return {String} value of the attribute
 */
WAF.tags.descriptor.Attribute.prototype.getValue = function () {    
    return this._value;
};

/**
 * Get the old value of the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method getOldValue
 * @return {String} value of the attribute
 */
WAF.tags.descriptor.Attribute.prototype.getOldValue = function () {    
    return this._oldValue;
};


// SETTER


/**
 * Set the value of the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method setValue
 * @param {String} value new value of the attribute
 */
WAF.tags.descriptor.Attribute.prototype.setValue = function (value) {        
    this._oldValue = this._value;
    this._value = value;
    
    if (this._value !== this._oldValue) {
        this.fireChange();
    }
};

/**
 * Set the descriptor to link to the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method setDescriptor
 * @param {WAF.tags.Descriptor} descriptor descriptor to link
 */
WAF.tags.descriptor.Attribute.prototype.setDescriptor = function (descriptor) {
    this._descriptor = descriptor;
};


     /**
     * Set the visibility of the attribute
     * @namespace Designer.tag.Attribute
     * @method setVisibility
     * @param {String} value the new value
     */
WAF.tags.descriptor.Attribute.prototype.setVisibility = function (value) {
        this._visibility = value;
    };

// PUBLIC METHODS


/**
 * Remove the attribute
 * @namespace WAF.tags.descriptor.Attribute
 * @method remove
 */
WAF.tags.descriptor.Attribute.prototype.remove = function () {    
    this.getDescriptor()._attributes.remove(this.getName());    
};


WAF.tags.descriptor.Attribute.prototype.fireChange = function() {
    for(var i = 0; i < this._onChangeStore.length; i++) {
        this._onChangeStore[i](this.getValue());
    }
}
    
WAF.tags.descriptor.Attribute.prototype.onChange = function(fn) {
    if (this._onChangeStore.indexOf(fn) < 0) {
        this._onChangeStore.push(fn);
    }
}
    
WAF.tags.descriptor.Attribute.prototype.removeChange = function(fn) {
    if (this._onChangeStore.indexOf(fn) >= 0) {
        this._onChangeStore.splice(this._onChangeStore.indexOf(fn), 1);
    }
}



