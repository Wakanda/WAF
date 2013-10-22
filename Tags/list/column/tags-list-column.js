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
 * Columns Descriptor Management
 * @namespace WAF.tags.list
 * @class Column
 */
WAF.tags.list.Column = function () {
    this._list = [];
}


// PRIVATE METHODS


/**
 * Refresh the position of all columns
 * @namespace WAF.tags.list.Column
 * @method _refreshPosition
 * @private
 */
WAF.tags.list.Column.prototype._refreshPosition = function () {
    var i = 0,
    length = this.count(),
    column = null;

    for (i = 0; i < length; i++) {
        column = this.get(i);
        column._position = i;
    }
    
};


// PUBLIC METHODS


/**
 * Add an column
 * @namespace WAF.tags.list.Column
 * @method add
 * @param {WAF.tags.descriptor.Column} column a column
 */
WAF.tags.list.Column.prototype.add = function (column) {
    this._list.push(column);
    
    // refresh the position of the item
    this._refreshPosition(); 
    
    // refresh the reference to the column list
    column.setColumns(this);
};

/**
 * Get the number of item in the catalog
 * @namespace WAF.tags.list.Column
 * @method count
 * @return {Integer} number of item
 */
WAF.tags.list.Column.prototype.count = function () {
    return this._list.length;
};


/**
 * Remove all the columns from the list
 * @namespace WAF.tags.list.Column
 * @method clear
 */
WAF.tags.list.Column.prototype.clear = function () {
    this._list = [];
};

/**
 * 
 * @namespace WAF.tags.list.Column
 * @method get
 * @param {Integer} position position of the item
 */
WAF.tags.list.Column.prototype.get = function (position) {
    var result = null;

    if (position < this.count()) {
        result = this._list[position];
    }

    return result;
};

/**
 * Get a tag definition by its description
 * @namespace WAF.tags.list.Column
 * @method getByColId
 * @param {String} colid colId property to search
 */
WAF.tags.list.Column.prototype.getByColId = function (colid) {
    var i = 0,
    result = null,
    desc = null,
    length = 0;

    length = this.count();

    for (i = 0; i < length; i++) {
        desc = this.get(i);
        if (desc.getAttribute('colID').getValue() == colid) {
            result = desc;
            break;
        }
    }
    return result;
};

/**
 * Get a tag definition by its name
 * @namespace WAF.tags.list.Column
 * @method getByName
 * @param {Array} name name property to search
 */
WAF.tags.list.Column.prototype.getByAttribute = function (name) {
    var i = 0,
    result = [],
    desc = null,
    length = 0;

    length = this.count();

    for (i = 0; i < length; i++) {
        desc = this.get(i);
        if (desc.getName() == name) {
            result.push(desc);
        }
    }
    return result;
};

/**
 * Remove a property
 * @namespace WAF.tags.list.Column
 * @method remove
 * @param {String} position position of the column to remove
 */
WAF.tags.list.Column.prototype.remove = function (position) {         
    if (position != -1) {
        this._list = this._list.slice(0, position).concat(this._list.slice(position+1));
    }
    this._refreshPosition();
    
};

/**
 * Get the column property into string
 * @namespace WAF.tags.list.Column
 * @method toString
 */
WAF.tags.list.Column.prototype.toString = function () { 
    var length = this.count(),
    i = 0,
    j = 0,
    attributeLength = 0,
    column = null,
    result = [],
    columnProp = {},
    cleanResult = '',
    attributeName = '',
    value = '';
    
    for (i = 0; i < length; i++) {
        column = this.get(i);
        
        columnProp = {};
        attributeLength = column.getAttributes().count();
        
        for (j = 0; j < attributeLength; j++) {
            attributeName = column.getAttributes().get(j).getName();
            if (column.getAttribute(attributeName).getValue() != '') {
                value = column.getAttribute(attributeName).getValue();
                
                if (attributeName == 'width' && (typeof value === 'undefined' || value == NaN)) {
                    value = '70';
                }
                
                columnProp[attributeName] = escape(value); 
            } else {
                if (column.getAttribute(attributeName).getDefaultValue() != '') {
                    columnProp[attributeName] = escape(column.getAttribute(attributeName).getDefaultValue()); 
                }
            }
    
        }
       
        result.push(columnProp);
    }        
    
    cleanResult = JSON.stringify(result).replace(/"/g,"\'"); 
    return cleanResult;              
};

/**
 * Get the column property into array
 * @namespace WAF.tags.list.Column
 * @method toArray
 */
WAF.tags.list.Column.prototype.toArray = function () { 
    var length = this.count(),
    attributeLength = 0,
    attributeName = '',
    i = 0,
    j = 0,
    column = null,
    result = [],
    columnProp = {};
    
    for (i = 0; i < length; i++) {
        column = this.get(i);
        
        columnProp = {};
        attributeLength = column.getAttributes().count();
        
        for (j = 0; j < attributeLength; j++) {
            attributeName = column.getAttributes().get(j).getName();
            if (column.getAttribute(attributeName).getValue() != '') { 
                columnProp[attributeName] = column.getAttribute(attributeName).getValue(); 
            } else {
                if (column.getAttribute(attributeName).getDefaultValue() != '') {
                    columnProp[attributeName] = column.getAttribute(attributeName).getDefaultValue(); 
                }
            }
    
        }

        result.push(columnProp);
    }        
    
    return result;             
};