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
 * Tag Property Descriptor Management
 * @namespace WAF.tags.list
 * @class PropertyDescriptor
 */
WAF.tags.list.PropertyDescriptor = function () {
    this._list = [];
    this._hash = {};
}


/**
 * Get all the structure in array
 * @namespace WAF.tags.list.PropertyDescriptor
 * @method toArray
 * @return {Array} array that represents the structures
 */
WAF.tags.list.PropertyDescriptor.prototype.toArray = function () {
    return this._list;    
};

/**
 * Get all the structure in hash map
 * @namespace WAF.tags.list.PropertyDescriptor
 * @method toHash
 * @return {Object} hashmap of the structure
 */
WAF.tags.list.PropertyDescriptor.prototype.toHash = function () {
    return this._hash;     
};

/**
 * Add an item (a descriptor of an attribute, event or style of a tag)
 * @namespace WAF.tags.list.PropertyDescriptor
 * @method add
 * @param {Object} item a tag descriptor attribute, event or style
 */
WAF.tags.list.PropertyDescriptor.prototype.add = function (item) {
    this._list.push(item);
    if (typeof item._name !== 'undefined') {
        this._hash[item._name] = item;
    }    
};

/**
 * Get the number of item in the catalog
 * @namespace WAF.tags.list.PropertyDescriptor
 * @method count
 * @return {Integer} number of item
 */
WAF.tags.list.PropertyDescriptor.prototype.count = function () {
    return this._list.length;
};

/**
 * 
 * @namespace WAF.tags.list.PropertyDescriptor
 * @method get
 * @param {Integer} position position of the item
 */
WAF.tags.list.PropertyDescriptor.prototype.get = function (position) {
    var result = null;

    if (position < this.count()) {
        result = this._list[position];
    }

    return result;
};

/**
 * Get a tag definition by its description
 * @namespace WAF.tags.list.PropertyDescriptor
 * @method getByDescription
 * @param {String} description description property to search
 */
WAF.tags.list.PropertyDescriptor.prototype.getByDescription = function (description) {
    var i = 0,
    result = null,
    desc = null,
    length = 0;

    length = this.count();

    for (i = 0; i < length; i++) {
        desc = this.get(i);
        if (desc.getDescription() == description) {
            result = desc;
            break;
        }
    }
    return result;
};

/**
 * Get a tag definition by its name
 * @namespace WAF.tags.list.PropertyDescriptor
 * @method getByName
 * @param {String} name name property to search
 */
WAF.tags.list.PropertyDescriptor.prototype.getByName = function (name) {
    return this._hash[name];
};

/**
 * Get a tag definition by its selector (for structure attribute)
 * @namespace WAF.tags.list.PropertyDescriptor
 * @method getBySelector
 * @param {String} selector selector to search
 */
WAF.tags.list.PropertyDescriptor.prototype.getBySelector = function (selector) {
    var i = 0,
    result = null,
    desc = null,
    length = 0;

    length = this.count();

    for (i = 0; i < length; i++) {
        desc = this.get(i);
        if (desc.getSelector() == selector) {
            result = desc;
            break;
        }
    }
    return result;
};

/**
 * Remove a property
 * @namespace WAF.tags.list.PropertyDescriptor
 * @method remove
 * @param {String} description description of the property to remove
 * @param {Boolean} byName true if we want to remove the property by name
 */
WAF.tags.list.PropertyDescriptor.prototype.remove = function (description , byName) {
    var i = 0,
    position = -1,
    length = 0;

    length = this.count();

    for (i = 0; i < length; i++) {
        if(byName){
            if (this.get(i).getName() == description) {
                position = i;
                break;
            }
        }
        else if (this.get(i).getDescription() == description) {
            position = i;
            break;
        }
    }    
    
    if (position != -1) {
        this._list = this._list.slice(0, position).concat(this._list.slice(position+1));
    }
};