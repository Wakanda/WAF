(function() {
    "use strict";
    /* global Designer */
    var Properties = WAF.require('waf-behavior/properties');

    Properties.types.datasource.attribute = { typeValue: 'datasource' };
    Properties.types.datasource.afterAddStudio = function(name, property) {
        var klass = this;
        var lname = name.toLowerCase();
        var category = name.capitalize() + ' property';

        function show(value) {
            if(!value) {
                Designer.ui.form.property.showAttribute('data-' + lname);
                if(property.attributes && property.attributes.length) {
                    property.attributes.forEach(function(attribute) {
                        Designer.ui.form.property.showAttribute('data-' + lname + '-attribute-' + attribute.name.toLowerCase());
                    });
                }
                Designer.ui.form.property.hideAttribute('data-static-' + lname);
            } else {
                Designer.ui.form.property.hideAttribute('data-' + lname);
                if(property.attributes && property.attributes.length) {
                    property.attributes.forEach(function(attribute) {
                        Designer.ui.form.property.hideAttribute('data-' + lname + '-attribute-' + attribute.name.toLowerCase());
                    }.bind(klass));
                }
                Designer.ui.form.property.showAttribute('data-static-' + lname);
            }
        }
        if(property.attributes && property.attributes.length) {
            klass.addAttribute('data-static-binding-' + lname, {
                category: category,
                description: 'Static values',
                type: 'checkbox',
                onclick: function() {
                    show(this.getValue());
                },
                domAttribute: false
            });
        }

        klass.addAttribute('data-' + lname, {
            category: category,
            description: 'Source',
            defaultValue: klass._properties[name].defaultValue,
            typeValue: 'datasource',
            filterRelatedEntity: true,
            filterFlatAttribute: true,
            onblur: function() {
                var tag = this.data.tag;
                if(property.attributes && property.attributes.length) {
                    var dsname = tag.getAttribute('data-' + lname).getValue();
                    var attributes = Designer.ds.getAttributesNameFromPath(dsname, { filterRelatedEntity: true, filterRelatedEntities: true });
                    property.attributes.forEach(function(attribute) {
                        var attributeName = 'data-' + lname + '-attribute-' + attribute.name.toLowerCase();
                        var value = '';
                        if(attributes.indexOf(attribute.name) >= 0) {
                            value = attribute.name;
                        }
                        tag.getAttribute(attributeName).setValue(value);
                        Designer.ui.form.property.setAttributeValue(attributeName, value);
                    });
                }
            }
        });

        if(property.attributes && property.attributes.length) {
            property.attributes.forEach(function(attribute) {
                klass.addAttribute('data-' + lname + '-attribute-' + attribute.name.toLowerCase(), {
                    description: attribute.name.capitalize() + ' attribute',
                    category: category,
                    typeValue: 'datasource',
                    prefixDatasourceAttribute: 'data-' + lname
                });
            }.bind(klass));


            // Static binding
            klass.addAttribute('data-static-' + name, {
                //category: category,
                description: name.capitalize() + ' values',
                type: 'grid',
                columns: property.attributes.map(function(att) {
                    return WAF.extend({ type: 'textField' }, att);
                }),
                afterReady: function() {
                    // afterReady is fired before the form is added to Designer.ui.form.property.forms, so we need to defer the execution
                    setTimeout(function() {
                        show(this.data.tag.getAttribute('data-static-binding-' + lname).getValue() === 'true');
                    }.bind(this), 0);
                }
            });
        }

        // add the change event
        klass.addEvent('change', {
            targets: Object.keys(klass._properties),
            category: 'Property Events'
        });
    };

    Properties.types.datasource.afterRemoveStudio = function(name, property) {
        var klass = this;
        var lname = name.toLowerCase();

        klass.removeAttribute('data-static-binding-' + lname);
        klass.removeAttribute('data-' + lname);
        if(property.attributes) {
            property.attributes.forEach(function(attribute) {
                klass.removeAttribute('data-' + lname + '-attribute-' + attribute.name.toLowerCase());
            }.bind(klass));
        }
        klass.removeAttribute('data-static-' + name);
        if(Object.keys(this._properties).length === 0) {
            klass.removeEvent('change');
        }
    };


})();
