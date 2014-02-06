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
 * Structure of the Tag
 * @namespace WAF.tags.descriptor
 * @class Structure
 * @params {Object} config parameters
 */
WAF.tags.descriptor.Structure = function(config) {
    config = config || {};

    config.description = config.description || '';
    config.selector    = config.selector    || '';
    config.style       = config.style       || {};
    config.state       = config.state       || {};
    config.hidden      = config.hidden      || false;
    config.group       = config.group       || null;

    // properties inherited from config
    this._description = config.description;
    this._selector    = config.selector;
    this._style       = config.style;
    this._states      = config.state;
    this._hidden      = config.hidden;
    this._group       = config.group;

};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.Structure
 * @method getDescription
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Structure.prototype.getDescription = function () {
    return this._description;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.Structure
 * @method getSelector
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Structure.prototype.getSelector = function () {
    return this._selector;
};

/**
 * Get the value a style of the current structure
 * @namespace WAF.tags.descriptor.Structure
 * @method getStyle
 * @param {String} styleName name of the style
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Structure.prototype.getStyle = function (styleName) {
    return this._style[styleName];
};;

/**
 * Get the states of the current structure
 * @namespace WAF.tags.descriptor.Structure
 * @method getState
 * @param {String} styleName name of the style
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Structure.prototype.getStates = function () {
    return this._states;
};

/**
 * Get the group of the current structure
 * @namespace WAF.tags.descriptor.Structure
 * @method getGroup
 * @return {String} the group of the attribute
 */
WAF.tags.descriptor.Structure.prototype.getGroup = function () {
    return this._group;
};

/**
 * Check if the structure is visible
 * @namespace WAF.tags.descriptor.Structure
 * @method isVisible
 * @return {boolean}
 */
WAF.tags.descriptor.Structure.prototype.isVisible = function () {
    var
    result;
    
    result = this._hidden == true ? false : true;
    
    return result;
};

/**
 * Get all the name of style for the current structure
 * @namespace WAF.tags.descriptor.Structure
 * @method getStyles
 * @param
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Structure.prototype.getStyles = function () {
    var result = [],
    styleName = '';

    for (styleName in this._style) {
        result.push(styleName);
    }

    return result;
};