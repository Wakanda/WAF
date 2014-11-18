/** @module waf-behavior/properties-template */
WAF.define('waf-behavior/properties-template', [ 'waf-core/binding-parser' ], function(Parser) {
    "use strict";
    /* global Handlebars */
    var Properties = WAF.require('waf-behavior/properties');

    function extractVariables(statements, variables) {
        statements.forEach(function(node) {
            if (node.type === 'mustache' && variables.indexOf(node.id.string) === -1) {
                variables.push(node.id.string);
            } else if (node.type === 'block') {
                extractVariables(node.program.statements, variables);
                
                if (node.inverse.statements) {
                    extractVariables(node.inverse.statements, variables);
                }
            }
        });
    }

    Properties.types.template = {
        createAccessor: function(name, property, storage) {
            var self = this;

            var attributes = [];
            var attributeValues = {};
            var boundAttributes = {};
            var datasourceAccessor;
            var templates = {};
            var template;

            // overwrite the accessor
            Properties.types['*'].createAccessor.call(this, name, property, storage);
            var originalAccessor = self[property.functionName];
            var accessor = self[property.functionName] = function(newValue) {                
                if(arguments.length) {
                    if(newValue == null) {
                        template = undefined;
                        attributes = [];
                    } else {
                        template = Handlebars.compile(newValue);
                        
                        attributes.length = 0;
                        
                        // get the list of (unique) attributes
                        extractVariables(Handlebars.parse(newValue).statements, attributes);
                    }

                    // unsubscribe attributes that no longer exist
                    for(var attributeName in attributeValues) {
                        if(attributes.indexOf(attributeName) < 0) {
                            delete attributeValues[attributeName];
                            if(attributeName in boundAttributes) {
                                boundAttributes[attributeName].unsubscribe();
                                delete boundAttributes[attributeName];
                            }
                        }
                    }
                }
                return originalAccessor.apply(self, arguments);
            };
            // copy original accessor methods
            Object.keys(originalAccessor).forEach(function(key) {
                accessor[key] = originalAccessor[key];
            });


            property.templates = property.templates || [];
            property.templates.forEach(function(template) {
                templates[template.name] = template.template;
            });

            if(property.datasourceProperty) {
                var dsProperty = self.constructor._properties[property.datasourceProperty];
                datasourceAccessor = self[dsProperty.functionName];
                if(!datasourceAccessor) {
                    throw 'Unknown datasource property "' + property.datasourceProperty +'" for template property "' + name + '".';
                }
                datasourceAccessor.attributes = function() {
                    return accessor.attributes().map(function(n) { return { name: n, type: 'string' }; });
                };
            }

            /**
             * Return the list of templates
             * @returns {object[]}
             * @method <templateProperty>.templates
             */
            accessor.templates = function() {
                return property.templates || [];
            };

            /**
             * get or set the current template from the predefined list
             * @param {string} [name]
             * @returns {string|null}
             * @method <templateProperty>.select
             */
            accessor.select = function(name) {
                if(name in templates) {
                    accessor(templates[name]);
                    return name;
                }
                for(var key in templates) {
                    if(accessor() === templates[key]) {
                        return key;
                    }
                }
                return null;
            };

            /**
             * render the template with the given object
             * if no object, or if missing vaues in object, get the values from the last values of attributes
             * @param {object} [object]
             * @returns {string}
             * @method <templateProperty>.render
             */
            accessor.render = function(object) {
                object = object || {};
                if(!template) {
                    template = Handlebars.compile(accessor());
                }

                accessor.attributes().forEach(function(attributeName) {
                    if(attributeName in object) {
                        return;
                    }
                    object[attributeName] = accessor.attribute(attributeName);
                });
                return template(object);
            };

            /**
             * return the list of attributes for the current attributes
             * @returns {string[]}
             * @method <templateProperty>.attributes
             */
            accessor.attributes = function() {
                return attributes;
            };

            /**
             * set the callback to trigger when a new render was done.
             * The callback receive a list of string as argument if the template is linked to a datasourceProperty
             * Else the callback receive the rendered string as argument
             * @param {function} callback
             * @return {Subscriber}
             * @method <templateProperty>.onDataChange
             */
            accessor.onDataChange = function(callback) {
                if(property.datasourceProperty) {
                    return datasourceAccessor.onPageChange(function(elements) {
                            callback.call(self, elements.map(accessor.render));
                    });
                } else {
                    return self.subscribe('dataChange', name, function(event) {
                        callback.call(self, accessor.render());
                    }, this);
                }
            };

            /**
             * get or set an attribute value
             * trigger a dataChange if needed
             * @param {string} name
             * @param {any} [value]
             * @returns {any}
             * @method <templateProperty>.attribute
             */
            accessor.attribute = function(attributeName, value) {
                if(arguments.length > 1) {
                    var oldValue = attributeValues[attributeName];
                    attributeValues[attributeName] = value;
                    if(oldValue !== value) {
                        self.fire('dataChange', name);
                    }
                }
                if(attributeName in attributeValues) {
                    return attributeValues[attributeName];
                }
                return null;
            };

            /**
             * set a binding for an attribute
             * @param {string} name
             * @param {string|object} binding
             * @returns {Subscriber}
             * @method <templateProperty>.bindAttribute
             */
            accessor.bindAttribute = function(attributeName, binding) {
                if(attributeName in boundAttributes) {
                    boundAttributes[attributeName].unsubscribe();
                    delete boundAttributes[attributeName];
                }

                if(typeof binding === 'string') {
                    binding = Parser.parse(binding);
                }
                binding = WAF.extend({
                    callback: function(value) {
                        accessor.attribute(attributeName, value);
                    }
                }, binding);

                attributeValues[attributeName] = null;
                boundAttributes[attributeName] = self.bindDatasourceAttribute(binding);
                return boundAttributes[attributeName];
            };
        },
        installCallbacks: function(name, property) {
            Properties.types['*'].installCallbacks.call(this, name, property);

            var lname = name.toLowerCase();
            var accessor = this[property.functionName];
            accessor.attributes().forEach(function(attribute) {
                if((lname + '-attribute-' + attribute.toLowerCase()) in this.options) {
                    accessor.attribute(attribute, this.options[lname + '-attribute-' + attribute.toLowerCase()]);
                }
                if((lname + '-binding-' + attribute.toLowerCase()) in this.options) {
                    accessor.bindAttribute(attribute, this.options[lname + '-binding-' + attribute.toLowerCase()]);
                }
            }.bind(this));
        }
    };
});

