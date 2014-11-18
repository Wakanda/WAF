(function() {
    "use strict";
    /* global Designer */
    var Properties = WAF.require('waf-behavior/properties');

    //Properties.types.template.attribute = { typeValue: 'datasource' };
    Properties.types.template.afterAddStudio = function(name, property) {
        var klass = this;
        var lname = name.toLowerCase();
        var category = String.capitalize(name) + ' property';

        var previousValue, attributeFilter;

        var comboOptions = [];
        if(property.templates) {
            comboOptions = property.templates.map(function(temp) {
                return { key: temp.template, value: temp.name };
            });
        }
        if('datasourceProperty' in property) {
            if(!(property.datasourceProperty in klass._properties)) {
                throw 'Unknow datasource property "' + property.datasourceProperty +'" for template property "' + name + '"';
            }
            var dsName = 'data-' + property.datasourceProperty.toLowerCase();
            attributeFilter = new RegExp('^' + dsName + '-attribute-');
            var dsCategory = klass._configuration.attributes[dsName].category;

            var updateDatasourceAttributes = function(tag) {
                var widget = tag.getWidget();
                if(previousValue === widget[property.functionName]()) {
                    return;
                }
                previousValue = widget[property.functionName]();

                var attributes = widget[property.functionName].attributes();

                // Remove previous attributes
                tag.config.attributes = tag.config.attributes.filter(function(i) {
                    if(!attributeFilter.test(i.name)) {
                        return true;
                    }
                    tag._attributes.remove(i.name);
                    return false;
                });

                // Add new attributes
                attributes.forEach(function(attribute) {
                    var attributeName = dsName + '-attribute-' + attribute.toLowerCase();
                    tag.addAttribute(attributeName);
                    tag.config.attributes.push({
                        name : attributeName,
                        description: attribute.capitalize() + ' attribute',
                        category: dsCategory,
                        type: 'textField',
                        typeValue: 'datasource',
                        prefixDatasourceAttribute: dsName
                    });
                });

                // static binding
                tag.config.attributes.some(function(staticAttribute) {
                    if(staticAttribute.name !== 'data-static-' + property.datasourceProperty.toLowerCase()) {
                        return false;
                    }
                    staticAttribute.columns = attributes.map(function(name) {
                        return { name: name, type: 'textField' };
                    });
                    return true;
                });
                Designer.tag.refreshPanels();
            };

            klass._addAttribute('data-' + lname, {
                type: 'dropdown',
                category: category,
                options: comboOptions,
                defaultValue: comboOptions[0].key,
                onchange: function( data) {
                    updateDatasourceAttributes(this.data.tag);
                }
            });

            klass._studioOn('propertyPanelReady', function() {
                updateDatasourceAttributes(Designer.getCurrent());
            });

        } else {
            attributeFilter = new RegExp('^data-' + lname + '-(attribute|binding)-');

            var updateTemplateAttributes = function(tag) {
                var widget = tag.getWidget();
                if(previousValue === widget[property.functionName]()) {
                    return;
                }
                previousValue = widget[property.functionName]();

                var attributes = widget[property.functionName].attributes();

                // Remove previous attributes
                tag.config.attributes = tag.config.attributes.filter(function(i) {
                    if(!attributeFilter.test(i.name)) {
                        return true;
                    }
                    tag._attributes.remove(i.name);
                    return false;
                });

                // Add new attributes
                attributes.forEach(function(attribute) {
                    var attributeName = 'data-' + lname + '-attribute-' + attribute.toLowerCase();
                    tag.addAttribute(attributeName);
                    tag.config.attributes.push({
                        name : attributeName,
                        description: attribute.capitalize() + ' attribute',
                        category: category,
                        type: 'textField',
                        tooltip: 'coucou'
                    });

                    attributeName = 'data-' + lname + '-binding-' + attribute.toLowerCase();
                    tag.addAttribute(attributeName);
                    tag.config.attributes.push({
                        name : attributeName,
                        description: attribute.capitalize() + ' source',
                        category: category,
                        type: 'textField',
                        typeValue: 'datasource'
                    });
                });

                Designer.tag.refreshPanels();
            };

            klass._addAttribute('data-' + lname, {
                type: 'combobox',
                category: category,
                options: comboOptions,
                defaultValue: comboOptions[0].key,
                onchange: function( data) {
                    updateTemplateAttributes(this.data.tag);
                }
            });

            klass._studioOn('propertyPanelReady', function() {
                updateTemplateAttributes(Designer.getCurrent());
            });

        }
    };

    //Properties.types.template.afterInitBehaviorStudio = function(name, property) {
    //};

})();
