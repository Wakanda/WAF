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
 * Tag Descriptor List Management
 * @namespace WAF.tags.list
 * @class Descriptor
 */
WAF.tags.list.Descriptor = function () {
    this._list = [];
}

/**
 * Add a tag descriptor in the list
 * @namespace WAF.tags.list.Descriptor
 * @method add
 * @param {WAF.tags.Descriptor} tag tag descriptor
 */
WAF.tags.list.Descriptor.prototype.add = function (tag) {
    this._list.push(tag);
};

/**
 * Get the number of tag definition in the catalog
 * @namespace WAF.tags.list.Descriptor
 * @method count
 * @return {Integer} number of element
 */
WAF.tags.list.Descriptor.prototype.count = function () {
    return this._list.length;
};

/**
 * Get a tag definition by its position
 * @namespace WAF.tags.list.Descriptor
 * @method get
 * @param {Integer} position position of the tag
 */
WAF.tags.list.Descriptor.prototype.get = function (position) {
    var result = null;

    if (position < this.count()) {
        result = this._list[position];
    }

    return result;
};

/**
 * Get a tag definition by its position
 * @namespace WAF.tags.list.Descriptor
 * @method get
 * @param {String} type type of the tag
 */
WAF.tags.list.Descriptor.prototype.getByType = function (type) {
    var i = 0,
    result = null,
    desc = null,
    length = 0;

    length = this.count();

    for (i = 0; i < length; i++) {
        desc = this.get(i);
        if (desc.getType() == type) {
            result = desc;
            break;
        }
    }
    return result;
};