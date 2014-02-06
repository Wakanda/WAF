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
 * Columns of Tag Descriptor
 * @namespace WAF.tags.descriptor
 * @class Column
 * @params {Object} config parameters
 */
WAF.tags.descriptor.Column = function(config) {
    var length = 0,
    i = 0;
        
    config = config || {};

    config.attribute = config.attribute || '';
    
    // property
    this._columns = null;
    this._position = -1;
    
    this._attributes = new WAF.tags.list.PropertyDescriptor();
    
    // default property for attributes
    if (WAF.config.widget.datagrid) {
        this.configColumn = WAF.config.widget.datagrid;
    } else {
        this.configColumn = {
            columns: {
                attributes : [    
                {
                    name       : 'sourceAttID'        
                },
                {
                    name       : 'colID'        
                },
                {
                    name       : 'format'        
                },
                {
                    name       : 'width'        
                },
                {
                    name       : 'title'        
                },
                {
                    name       : 'readOnly'        
                }
                ]
            }
        };
    }
    
    if(config.attributes){
        for(var _i = 0 , attr; attr = config.attributes[_i] ; _i++){
            this.configColumn.columns.attributes.push(attr);
        }
    }
    
    length = this.configColumn.columns.attributes.length;
    for (i = 0; i < length; i++) {
        this._attributes.add(new WAF.tags.descriptor.AttributeColumn(this.configColumn.columns.attributes[i]));
    }
};


// GETTER


/**
 * Get the list of the attribute descriptor
 * @namespace WAF.tags.descriptor.Column
 * @method getAttributes
 * @return {WAF.tags.list.PropertyDescriptor} list of the attributes
 */
WAF.tags.descriptor.Column.prototype.getAttributes = function () {
    return this._attributes;
};

/**
 * Get the value of the name of the attribute
 * @namespace WAF.tags.descriptor.Column
 * @method getAttribute
 * @param {String} name name
 * @return {WAF.tags.descriptor.Attribute} attribute descriptor
 */
WAF.tags.descriptor.Column.prototype.getAttribute = function (name) {
    return this._attributes.getByName(name);
};

/**
 * Get the list of column
 * @namespace WAF.tags.descriptor.Column
 * @method getColumns
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Column.prototype.getColumns = function () {
    return this._columns;
};


/**
 * Get the value of the column position
 * @namespace WAF.tags.descriptor.Column
 * @method getPosition
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Column.prototype.getPosition = function () {
    return this._position;
};


// SETTER

/**
 * Get the list of column
 * @namespace WAF.tags.descriptor.Column
 * @method setColumns
 * @return {String} the value of the attribute
 */
WAF.tags.descriptor.Column.prototype.setColumns = function (value) {
    this._columns = value;
};

/**
 * Set the value of the column position
 * @namespace WAF.tags.descriptor.Column
 * @method setPosition
 * @param {String} value new value of the attribute
 */
WAF.tags.descriptor.Column.prototype.setPosition = function (value) {    
    // refresh the column list
    this.getColumns()._list.splice(this.getPosition(), 1);
    this.getColumns()._list.splice(value, 0 , this); 
              
    this.getColumns()._refreshPosition();
};


// PUBLIC METHODS


/**
 * Remove the attribute
 * @namespace WAF.tags.descriptor.Column
 * @method remove
 */
WAF.tags.descriptor.Column.prototype.remove = function () {    
    this.getColumns().remove(this.getPosition());    
};