(function() {
    "use strict";
    var Properties = WAF.require('waf-behavior/properties');

    var custom = Properties._propertiesCustomHelper;

    Properties.types.list.afterAddStudio = function(name, property) {
        var klass = this;
        var lname = name.toLowerCase();

        var columns = [];
        if(!property.attributes) {
            columns.push({ name: '', type: 'textField' });
        } else {
            columns = property.attributes.map(function(column) {
                if(!((column.type || '*') in Properties.types) || !custom(column, 'listable')) {
                    throw 'Unsupported attribute type "' + column.type + '" in list property "' + name + '".';
                }
                var attribute = custom(column, 'attribute');
                if(typeof attribute === 'function') {
                    attribute = attribute.call(this, name, column);
                }
                attribute = WAF.extend({
                    type: 'textField',
                    name: column.name,
                    defaultValue: column.defaultValue,
                    onchange: function(data) {
                        var widget = this.data.tag.getWidget();
                        var row = this.row;
                        var index = row.grid.getRows().indexOf(row);
                        var element = widget[property.functionName](index);
                        if(column.name === '') {
                            element = custom(column, 'normalize').call(widget, this.getValue());
                        } else {
                            element[column.name] = custom(column, 'normalize').call(widget, this.getValue());
                        }
                        widget[property.functionName](index, element);
                    }
                }, attribute);
                if(attribute.type === 'checkbox') {
                    attribute.onclick = attribute.onchange;
                    delete attribute.onchange;
                }
                return attribute;
            });
        }

        // add the grid attribute
        klass._addAttribute('data-' + lname, {
            type: 'grid',
            columns: columns,
            ready: function() {
                // fill the list with all the previous values
                if(this.json && this.json.length) {
                    return;
                }

                var widget = this.data.tag.getWidget();
                var attribute = this.data.tag._config.attributes
                        .filter(function(a) { return a.name === 'data-' + lname; })[0];
                widget[property.functionName]().forEach(function(item) {
                    this.addRow(columns.map(function(column, i) {
                        return WAF.extend(WAF.clone(attribute.columns[i]), {
                            value: column.name === '' ? item : item[column.name]
                        });
                    }), /* fromInit= */false, /* silentMode= */true, /* save= */false);
                }.bind(this));
            },
            afterRowAdd: function(data) {
                // fill the new row with the default values
                var widget = this.data.tag.getWidget();
                var element = {};
                columns.forEach(function(column, i) {
                    var value = column.defaultValue;
                    var attribute = property.attributes && property.attributes[i] || column;
                    if(attribute.defaultValueCallback) {
                        value = attribute.defaultValueCallback.call(widget, attribute);
                    }
                    data.items[i].setValue(value || '');
                    element[column.name] = value;
                    if(column.name === '') {
                        element = value;
                    }
                });
                widget[property.functionName].push(element);
            },
            afterRowSort: function(data) {
                var widget = this.data.tag.getWidget();
                widget[property.functionName].move(data.movedIndex, data.index);
            },
            afterRowDelete: function(data) {
                var widget = this.data.tag.getWidget();
                widget[property.functionName].remove(data.index);
            }
        });
        if('domAttribute' in property) {
            klass._addAttribute('data-' + lname, { domAttribute: property.domAttribute });
        }

        // add the events
        klass.addEvent('change', {
            targets: Object.keys(klass._properties),
            category: 'Property Events'
        });
        var eventOptions = {
            category: 'Property Events',
            targets: Object.keys(klass._properties).filter(function(k) { return klass._properties[k].type === 'list'; })
        };
        klass.addEvent('insert', eventOptions);
        klass.addEvent('remove', eventOptions);
        klass.addEvent('modify', eventOptions);
        klass.addEvent('move', eventOptions);
    };

    Properties.types.list.afterRemoveStudio = function(name, property) {
        var klass = this;
        var lname = name.toLowerCase();

        klass._removeAttribute('data-' + lname);
        if(Object.keys(klass._properties).length === 0) {
            klass.removeEvent('change');
        }
        if(Object.keys(klass._properties).filter(function(name) { return klass._properties[name].type === 'list'; }).length === 0) {
            klass.removeEvent('insert');
            klass.removeEvent('remove');
            klass.removeEvent('modify');
            klass.removeEvent('move');
        }
    };

})();
