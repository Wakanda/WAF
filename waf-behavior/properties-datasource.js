/** @module waf-behavior/properties-datasource */
WAF.define('waf-behavior/properties-datasource', function() {
    "use strict";
    /* global sources */
    var Properties = WAF.require('waf-behavior/properties');


    Properties.types.datasource = {
        createAccessor: function(name, property, storage) {
            Properties.types['*'].createAccessor.call(this, name, property, storage);

            var self = this;
            var accessor = self[property.functionName];

            /**
             * Return the list of all attributes
             * @returns {object[]}
             * @method attributes
             * @public
             */
            accessor.attributes = function() {
                return property.attributes;
            };

            /**
             * Return the daatsource attribute name for the given property attribute name
             * @param {string} name
             * @returns {string}
             * @method attributeFor
             * @public
             */
            accessor.attributeFor = function(n) {
                return accessor._mapping && accessor._mapping[n];
            };

            /**
             * Set the current mapping
             * keys are attribute names of the property, values are attribute names of the datasource
             * @param {object} map
             * @method setMapping
             * @public
             */
            accessor.setMapping = function(map) {
                accessor._mapping = map;
            };

            /**
             * Return a mapped element (an element with attribute mapped to there widget defined values)
             * If no attributes, return the original elemen
             * @param {object} element
             * @returns {object}
             * @method mapElement
             * @public
             */
            accessor.mapElement = function(element) {
                var result = {};
                if(!accessor._mapping) {
                    return element;
                }

                for(var k in accessor._mapping) {
                    result[k] = element[accessor._mapping[k]];
                }
                return result;
            };

            /**
             * call the callback with the mapped collection
             * @param {function} callback
             * @param {function} event
             * @method getCollection
             * @public
             */
            accessor.getCollection = function(callback, error) {
                var source = self[property.functionName]();
                if(!source) {
                    callback.call(self, []);
                    return;
                }

                source.getElements(0, source.length, function(event) {
                    var elements = event.elements;
                    if(accessor._mapping && !self.options['static-' + name.toLowerCase()]) {
                        elements = elements.map(accessor.mapElement);
                    }
                    callback.call(self, elements);
                }, error);
            };

            /**
             * install a callback on the collection change to get the mapped collection
             * if the datasource change, the callback will be installed to the new datasource
             * @param {function} callback
             * @param {function} event
             * @method onCollectionChange
             * @public
             */
            accessor.onCollectionChange = function(callback, error) {
                var subscriber;
                function subscribeDS() {
                    if(subscriber) {
                        subscriber.unsubscribe();
                    }
                    var source = self[property.functionName]();
                    if(!source) {
                        return;
                    }

                    subscriber = source.subscribe('collectionChange', function(event) {
                        accessor.getCollection(callback, error);
                    }, error);
                    accessor.getCollection(callback, error);
                }

                subscribeDS();
                accessor.onChange(subscribeDS);
            };

            if(property.attributes && property.attributes.length) {
                var map = {};
                var count = 0;
                property.attributes.forEach(function(attribute) {
                    var optionName = name.toLowerCase() + '-attribute-' + attribute.name.toLowerCase();
                    if(optionName in self.options) {
                        map[attribute.name] = self.options[optionName];
                        count ++;
                    }
                });
                accessor.setMapping(count ? map : undefined);
            }
        },
        afterAdd: function(name, property) {
            if(property.attributes) {
                property.attributes = property.attributes.map(function(attribute) {
                    return typeof attribute === 'string' ? { name: attribute } : attribute;
                });
            }

            this.optionsParsers['static-' + name.toLowerCase()] = function() {
                if(!this.options['static-' + name.toLowerCase()]) {
                    return;
                }

                var data = JSON.parse(this.options['static-' + name.toLowerCase()]);

                var source = new WAF.DataSourceVar({
                    "variableReference": data,
                    "data-attributes": property.attributes.map(function(att) { return att.name + ':' + (att.type || 'string'); }).join(','),
                });

                this[property.functionName](source);

            };
        },
        normalize: function(v) {
            if(typeof v === 'string') {
                return sources[v];
            }
            return v;
        },
        options: {
            bindable: false
        }
    };

    return undefined;
});
