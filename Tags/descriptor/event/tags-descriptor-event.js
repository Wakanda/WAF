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
 * Event of the Tag
 * @namespace WAF.tags.descriptor
 * @class Event
 * @params {Object} config parameters
 */
WAF.tags.descriptor.Event = function(config) {
    config = config || {};

    config.name        = config.name         || '';
    config.description = config.description  || '';
    config.handlername = config.handlername  || '';
    config.category = config.category        || '';

    // properties inherited from config
    this._name         = config.name;
    this._description  = config.description;
    this._category     = config.category;
    
    // value
    this._handlername  = config.handlername;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.Event
 * @method getDefaultValue
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Event.prototype.getName = function () {
    return this._name;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.Event
 * @method getDescription
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Event.prototype.getDescription = function () {
    return this._description;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.Event
 * @method getHandlerName
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Event.prototype.getHandlerName = function () {
    return this._handlername;
};

/**
 * Get the value of the category of the attribute
 * @namespace WAF.tags.descriptor.Event
 * @method getCategory
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Event.prototype.getCategory = function () {
    return this._category;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.Event
 * @method setHandlerName
 * @paramn {name} the name of the handler
 */
WAF.tags.descriptor.Event.prototype.setHandlerName = function (name) {
    this._handlername = name;
};