(function() {
    var Listable = WAF.require('waf-behavior/listable');

    Listable.doAfterClassMethod('addListableProperty', function(name, options) {
        var fname = name.toCamelCase('-');
        var plural_fname = (options.pluralName || (name + 's')).toCamelCase('-');
        var cfname = fname.capitalize();
        var cplural_fname = plural_fname.capitalize();

        // add the collection binding attribute
        this.addAttribute('data-collection-' + name, {
            description: name.split('-').map(String.capitalize).join(' ') + ' collection binding',
            typeValue: 'datasource' // FIXME: How to express it should be a collection ?
        });

        // add the grid attribute
        var columns = [];
        if(!options.attributes) {
            columns.push('');
        } else {
            columns = options.attributes;
        }
        this.addAttribute('data-' + name, {
            descrition: (options.pluralName || (name + 's')),
            type: 'grid',
            domAttribute: false,
            column_names: columns,
            ready: function() {
                // fill the list with all the previous values
                var widget = this.data.tag.getWidget();
                var attribute = this.data.tag._config.attributes
                        .filter(function(a) { return a.name == 'data-' + name })[0];
                widget[plural_fname]().forEach(function(item) {
                    this.addRow(columns.map(function(c, i) {
                        return WAF.extend(WAF.clone(attribute.columns[i]), {
                            value: c == '' ? item : item[c]
                        });
                    }), false, true, false);
                }.bind(this));
            },
            afterRowAdd: function(data) {
                // fill with the default values
                var widget = this.data.tag.getWidget();
                var col_conf = widget.constructor._configuration.attribute_columns['data-' + name];
                columns.forEach(function(c, i) {
                    if(c in col_conf) {
                        var d = col_conf[c].defaultValue;
                        if(typeof d == 'function') {
                            d = d.call(widget, c);
                        }
                        data.items[i].setValue(d || '');
                    }
                });
            },
            onsave: function(data) {
                // save the new list
                // FIXME: support more specific changes instead of replacing the whole list
                var widget = data.tag.getWidget();
                var list = data.value.rows.map(function(row) {
                    var o = {}
                    row.forEach(function(attribute) {
                        var name = attribute.component.name || '';
                        var value = attribute.value;
                        o[name] = value;
                    }.bind(this));
                    if(!options.attributes) o = o[''];
                    return o;
                }.bind(this));
                widget['removeAll' + cplural_fname]();
                widget['concat' + cplural_fname](list);
            },
            // onRowClick: function(item) {
            // },
            // canDeleteRow: function() {
            //     return true;
            // },
            // afterRowDelete: function(data) {
            // },
            // afterRowSort: function(data) {
            //     var widget = this.data.tag.getWidget();
            //     menu.sort(data.movedIndex, data.index);
            // },
        });
        this._configuration.attribute_columns['data-' + name] = {};
    });

    // Upgrade the studio behavior with methods specific to listable attribute
    var Studio = WAF.require('waf-behavior/studio');
    
    Studio._configuration.attribute_columns = {};
    Studio.mergeClassAttributeOnInherit('_configuration.attribute_columns.*');

    /**
     * Define a new grid attribute for the widget
     * @param {string} property_name - listable property name
     * @param {string} [attribute_name] - attribute name if this is a list of objects
     * @param {Object} [options] - object defining the attribute
     * @method addListableAttributeColumn
     * @memberof Studio
     */
    Studio.addListableAttributeColumn = function(property_name, attribute_name, options) {
        if(typeof attribute_name != 'string') {
            options = attribute_name;
            attribute_name = '';
        }
        var ac = this._configuration.attribute_columns;
        ac['data-' + property_name] = ac['data-' + property_name] || {};
        ac['data-' + property_name][attribute_name] = WAF.extend(ac['data-' + property_name][attribute_name] || {}, options);
    };

    Studio.wrapClassMethod('_getConf', function(_getConf) {
        var configuration = _getConf()

        // columns
        configuration.attributes.forEach(function(attribute) {
            if(attribute.name in this._configuration.attribute_columns && attribute.column_names) {
                attribute.columns = attribute.column_names.map(function(n) {
                    var o = WAF.extend({ type: 'textField' }, this._configuration.attribute_columns[attribute.name][n] || {});
                    o.name = n;
                    //o.saveUnity = true; // call the onsave function with only the modified element
                    return o;
                }.bind(this));
                console.log(attribute, this._configuration);
            }
        }.bind(this));

        return configuration
    });
})();
