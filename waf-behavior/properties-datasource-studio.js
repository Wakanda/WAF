(function() {
    "use strict";
    /* global Designer */
    var Properties = WAF.require('waf-behavior/properties');

    Properties.types.datasource.attribute = { typeValue: 'datasource' };
    Properties.types.datasource.afterAddStudio = function(name, property) {
        var klass = this;
        var lname = name.toLowerCase();
        var category = String.capitalize(name) + ' property';

        function show(value) {
            var widget = Designer.getCurrent().getWidget();
            var attributes = widget[property.functionName].attributes();
            if(!value) {
                Designer.ui.form.property.showAttribute('data-' + lname);
                if(attributes && attributes.length) {
                    attributes.forEach(function(attribute) {
                        Designer.ui.form.property.showAttribute('data-' + lname + '-attribute-' + attribute.name.toLowerCase());
                    });
                }
                Designer.ui.form.property.hideAttribute('data-static-' + lname);
            } else {
                Designer.ui.form.property.hideAttribute('data-' + lname);
                if(attributes && attributes.length) {
                    attributes.forEach(function(attribute) {
                        Designer.ui.form.property.hideAttribute('data-' + lname + '-attribute-' + attribute.name.toLowerCase());
                    }.bind(klass));
                }
                Designer.ui.form.property.showAttribute('data-static-' + lname);
            }
        }
        var showStaticBinding = property._showStaticBinding || (property.attributes && property.attributes.length);
        if(showStaticBinding) {
            klass._addAttribute('data-static-binding-' + lname, {
                category: category,
                description: 'Static values',
                type: 'checkbox',
                onclick: function() {
                    show(this.getValue());
                },
                domAttribute: false
            });
        }

        klass._addAttribute('data-' + lname, {
            category: category,
            description: 'Source',
            defaultValue: klass._properties[name].defaultValue,
            typeValue: 'datasource',
            filterRelatedEntity: true,
            filterFlatAttribute: true,
            onblur: function() {
                var tag = this.data.tag;
                var widget = Designer.getCurrent().getWidget();
                var attributes = widget[property.functionName].attributes();
                if(attributes && attributes.length) {
                    var dsname = tag.getAttribute('data-' + lname).getValue();
                    var dsAttributes = Designer.ds.getAttributesNameFromPath(dsname, { filterRelatedEntity: true, filterRelatedEntities: true });
                    attributes.forEach(function(attribute) {
                        var attributeName = 'data-' + lname + '-attribute-' + attribute.name.toLowerCase();
                        var value = '';
                        if(dsAttributes.indexOf(attribute.name) >= 0) {
                            value = attribute.name;
                        }
                        tag.getAttribute(attributeName).setValue(value);
                        Designer.ui.form.property.setAttributeValue(attributeName, value);
                    });
                }
            }
        });

        if(showStaticBinding) {
            (property.attributes || []).forEach(function(attribute) {
                klass._addAttribute('data-' + lname + '-attribute-' + attribute.name.toLowerCase(), {
                    description: attribute.name.capitalize() + ' attribute',
                    category: category,
                    typeValue: 'datasource',
                    prefixDatasourceAttribute: 'data-' + lname
                });
            }.bind(klass));


            // Static binding
            klass._addAttribute('data-static-' + lname, {
                //category: category,
                description: name.capitalize() + ' values',
                type: 'grid',
                columns: (property.attributes || []).map(function(att) {
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

        klass._removeAttribute('data-static-binding-' + lname);
        klass._removeAttribute('data-' + lname);
        if(property.attributes) {
            property.attributes.forEach(function(attribute) {
                klass._removeAttribute('data-' + lname + '-attribute-' + attribute.name.toLowerCase());
            }.bind(klass));
        }
        klass._removeAttribute('data-static-' + name);
        if(Object.keys(this._properties).length === 0) {
            klass.removeEvent('change');
        }
    };

    Properties.types.datasource.afterInitBehaviorStudio = function(name, property) {
        var lname = name.toLowerCase();
        var category = String.capitalize(name) + ' property';
        var that = this;
        var accessor = this[property.functionName];
        accessor.show = function() {
            accessor._hide = false;
            var tag = Designer.env.tag.current;
            if(tag && tag.getWidget && tag.getWidget() === that) {
                Designer.ui.form.property.showCategory(category);
                if(tag.getAttribute('data-static-binding-' + lname) && tag.getAttribute('data-static-binding-' + lname).getValue() === 'true') {
                    Designer.ui.form.property.showAttribute('data-static-' + lname);
                }
            }
        };
        accessor.hide = function() {
            accessor._hide = true;
            if(Designer.env.tag.current && Designer.env.tag.current.getWidget && Designer.env.tag.current.getWidget() === that) {
                Designer.ui.form.property.hideCategory(category);
                Designer.ui.form.property.hideAttribute('data-static-' + lname);
            }
        };
    };


})();
