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
 * Style properties of the Tag
 * @namespace WAF.tags.descriptor
 * @class PropertyStyle
 * @params {Object} config parameters
 */
WAF.tags.descriptor.PropertyStyle = function(config) {
    config = config || {};

    if (typeof config.fClass === 'undefined') {
        config.fClass = true;
    }
    if (typeof config.text === 'undefined') {
        config.text = true;
    }
    if (typeof config.background === 'undefined') {
        config.background = true;
    }
    if (typeof config.border === 'undefined') {
        config.border = true;
    }
    if (typeof config.sizePosition === 'undefined') {
        config.sizePosition = true;
    }
    if (typeof config.label === 'undefined') {
        config.label = true;
    }    

    // properties inherited from config

    /**
     * fClass
     * @private
     * @property fClass
     * @type Boolean
     * @default true
     */
    this._fClass = config.fClass;
    this._text = config.text;
    this._background = config.background;
    this._border = config.border;
    this._sizePosition = config.sizePosition;
    this._label = config.label;

};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.PropertyStyle
 * @method getFClass
 * @return {Boolean} the value of the attribute
 */
WAF.tags.descriptor.PropertyStyle.prototype.getFClass = function () {
    return this._fClass;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.PropertyStyle
 * @method getText
 * @return {Boolean} the value of the attribute
 */
WAF.tags.descriptor.PropertyStyle.prototype.getText = function () {
    return this._text;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.PropertyStyle
 * @method getBackground
 * @return {Boolean} the value of the attribute
 */
WAF.tags.descriptor.PropertyStyle.prototype.getBackground = function () {
    return this._background;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.PropertyStyle
 * @method getBorder
 * @return {Boolean} the value of the attribute
 */
WAF.tags.descriptor.PropertyStyle.prototype.getBorder = function () {
    return this._border;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.PropertyStyle
 * @method getSizePosition
 * @return {Boolean} the value of the attribute
 */
WAF.tags.descriptor.PropertyStyle.prototype.getSizePosition = function () {
    return this._sizePosition;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.PropertyStyle
 * @method getLabel
 * @return {Boolean} the value of the attribute
 */
WAF.tags.descriptor.PropertyStyle.prototype.getLabel = function () {
    return this._label;
};