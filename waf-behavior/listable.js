WAF.define('waf-behavior/listable', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior'),
        Event = WAF.require('waf-core/event'),
        WakError = WAF.require('waf-core/error');

    /**
     * @class Listable
     * @augments Behavior.BaseBehavior
     */
    var klass = Behavior.create('Listable');
    var proto = klass.prototype;
    klass.inherit(WAF.require('waf-behavior/observable'));
    
    klass._listable_properties = {};
    /**
     * Add a new listable property
     * The listable API provide functions item, items, countItems, insertItem, appendItem, popItem, shiftItem, concatItems, firstItem, lastItem, removeAllItems (if property name is item)
     * The API fire Insert and Remove events
     * A listable property is bindable to a collection TODO
     * @param {string} name - property name
     * @param {object} options - properties options
     * @param {string} [options.pluralName] - plural name, if different from name + 's'
     * @param {Listable~InsertCallback} [options.inserter] - Function called when you insert an item
     * @param {Listable~GetCallback} [options.getter] - Function called to get an item value
     * @param {Listable~GetCallback} [options.remover] - Function called to remove an item
     * @param {Listable~CountCallback} [options.counter] - function called to get the number of elements
     * @param {string[]} [options.attributes] - list of attributes attributes (for object items)
     * @method addListableProperty
     */
    klass.addListableProperty = function(name, options) {
        this._listable_properties[name] = options || {};
        var fname = name.toCamelCase('-');
        var plural_fname = (options.pluralName || (fname + 's')).toCamelCase('-');
        var cfname = fname.capitalize();
        var cplural_fname = plural_fname.capitalize();

        // load initial datas
        this.optionsParsers[name] = function() {
            var list = this.options[name];
            if(!list) return;
            if(typeof list == "string")
                list = JSON.parse(list);
            this['concat' + cplural_fname](list);
        };

        // bind initial datasource collection
        this.optionsParsers['collection-' + name] = function() {
            var r = this.options['collection-' + name].split(';')
            var s = sources[r[0]];
            if(!s) return;

            var attributes_mapping;
            if(r.length > 1) {
                attributes_mapping = {};
                s.slice(1).forEach(function(v) { v = v.split('='); attribute_mapping[v[0]] = v[1]; });
            }

            this.bindDatasourceCollection(s, name, attributes_mapping);
        };
    };
    
    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof Listable
     * @instance
     * @method initProperties
     */
    proto.initProperties = function() {
        this._values = [];
        Object.keys(this.constructor._listable_properties).forEach(function(name) {
            var options = this.constructor._listable_properties[name];
            // prepare the names
            var fname = name.toCamelCase('-');
            var plural_fname = (options.pluralName || (fname + 's')).toCamelCase('-');
            var cfname = fname.capitalize();
            var cplural_fname = plural_fname.capitalize();

            // the array containing the actual property
            var list = [];

            /**
             * Get or set the item at index
             * @param {integer} index - index of the item
             * @param {any} [value] - new item value
             * @return {any} item value
             * @memberof Listable
             * @instance
             * @method 
             */
            if(!this[fname]) this[fname] = function(index, value) {
                if(arguments.length > 1) {
                    this['remove' + cfname](index);
                    this['insert' + cfname](index, value);
                }
                if(options.getter)
                    return options.getter.call(this, index);
                return list[index];
            };

            /**
             * Return a list of all the items
             * @return {integer} Number of items
             * @memberof Listable
             * @instance
             * @method 
             */
            if(!this[plural_fname]) this[plural_fname] = function() {
                if(options.getter) {
                    var r = [];
                    for(var i = 0, l = this['count' + cplural_fname](); i < l; i++)
                        r.push(this[fname](i));
                    return r;
                }
                return list.slice(0);
            };

            /**
             * Return the number of items
             * @return {integer} Number of items
             * @memberof Listable
             * @instance
             * @method 
             */
            if(!this['count' + cplural_fname]) this['count' + cplural_fname] = function() {
                if(options.counter)
                    options.counter.call(this);
                return list.length;
            };

            /**
             * Insert an item at index
             * @param {integer} index - index of the item
             * @param {any} [value] - new item value
             * @memberof Listable
             * @instance
             * @method 
             */
            if(!this['insert' + cfname]) this['insert' + cfname] = function(index, value) {
                var count = this['count' + cplural_fname]()
                if(index >= count) {
                    index = count;
                    list.push(value);
                } else {
                    list.splice(index, 0, value);
                }
                if(options.inserter)
                    index = options.inserter.call(this, index, value);
                this.fire(new Event.Insert(name, { index: index, value: value }));
                return index
            };

            /**
             * Remove item at index
             * @param {integer} index - index of the item
             * @return {any} the removed item
             * @memberof Listable
             * @instance
             * @method 
             */
            if(!this['remove' + cfname]) this['remove' + cfname] = function(index) {
                if(options.remover)
                    options.remover.call(this, index);
                var r = list.splice(index, 1);
                this.fire(new Event.Remove(name, { index: index, value: r }));
                return r[0];
            };

            // utility functions based on the functions above

            /**
             * Append an item at the end of the list
             * @param {any} [value] - new item value
             * @memberof Listable
             * @instance
             * @method 
             */
            if(!this['append' + cfname]) this['append' + cfname] = function(value) {
                return this['insert' + cfname](this['count' + cplural_fname](), value);
            };

            /**
             * Return the item at the end of the list
             * @return {any} item value
             * @memberof Listable
             * @instance
             * @method 
             */
            if(!this['first' + cfname]) this['first' + cfname] = function() {
                return this[fname](0);
            };

            /**
             * Return the item at the beggining of the list
             * @return {any} item value
             * @memberof Listable
             * @instance
             * @method 
             */
            if(!this['last' + cfname]) this['last' + cfname] = function() {
                return this[fname](this['count' + cplural_fname]() - 1);
            };

            /**
             * Return and remove the item at the end of the list
             * @return {any} item value
             * @memberof Listable
             * @instance
             * @method 
             */
            if(!this['pop' + cfname]) this['pop' + cfname] = function() {
                var r = this['last' + cfname]();
                this['remove' + cfname](this['count' + cplural_fname]() - 1);
                return r;
            };

            /**
             * Return and remove the item at the beggining of the list
             * @return {any} item value
             * @memberof Listable
             * @instance
             * @method 
             */
            if(!this['shift' + cfname]) this['shift' + cfname] = function() {
                var r = this['first' + cfname]();
                this['remove' + cfname](0);
                return r;
            };

            /**
             * Append the items at the end of the list
             * @param {any[]} [list] - array of items
             * @memberof Listable
             * @instance
             * @method 
             */
            if(!this['concat' + cplural_fname]) this['concat' + cplural_fname] = function(list) {
                for(var i = 0; i < list.length; i++)
                    this['append' + cfname](list[i]);
            };

            /**
             * Remove all items
             * @memberof Listable
             * @instance
             * @method 
             */
            if(!this['removeAll' + cplural_fname]) this['removeAll' + cplural_fname] = function(index) {
                while(this['count' + cplural_fname]())
                    this['remove' + cfname](0);
            };

        }.bind(this));
    };

    /**
     * Bind a datasource collection to a listable property
     * @param {Datasource} datasource - The datasource object
     * @param {string} property_name - The property to bind the collection
     * @param {object} [attributes_mapping] - The attribute name
     * @memberof Bindable
     * @instance
     * @method bindDatasourceCollection
     */
    proto.bindDatasourceCollection = function(datasource, property_name, attributes_mapping) {
        var property = this.constructor._listable_properties[property_name];
        if(!property) return;

        var concat = this['concat' + (options.pluralName || (name + 's')).toCamelCase('-').capitalize()].bind(this);

        if(!attributes_mapping) {
            if(!property.attributes || property.attributes.length) return;
            attributes_mapping = {};
            property.attributes.forEach(function(v) { attribute_mapping[v] = v; });
        }

        var attribute_mapping_length = Object.keys(attributes_mapping).length;
        var _updateCollection = function() {
            this.removeAll();
            var r = { length: 0 };
            for(var i = 0, l = this._datasource.length; i <l; i++) {
                (function(i) {
                    r[i] = {}
                    var n = attribute_mapping_length;
                    for(var k in attributes_mapping) {
                        datasource.getElement(ba.position, function(r) {
                            r[i][k] = r.getAttributeValue(attributes_mapping[k]);
                            n--;
                            if(!n) {
                                r.length++;
                                if(r.length >= datasource.length) {
                                    concat(r);
                                }
                            }
                        });
                    }
                })(i);
            }
        };
        this._subscriber = this._datasource.subscribe(Event.CollectionChange, _updateCollection.bind(this));
    
        this._updateCollection();
    
        return this._subscriber;
    };
    
    /**
     * @class Event.Listable
     * @augments Event.All
     */
    Event.create('Listable');
    /**
     * @class Event.Insert
     * @augments Event.Listable
     */
    Event.create('Insert', Event.Listable);
    /**
     * @class Event.Remove
     * @augments Event.Listable
     */
    Event.create('Remove', Event.Listable);


    return klass;
});
