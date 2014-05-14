WAF.define('waf-behavior/properties-list', function() {
    "use strict";
    /**
     * @param {object} property - properties property
     * @param {Listable~InsertCallback} [property.onInsert] - Function called when you insert an item
     * @param {Listable~RemoveCallback} [property.onRemove] - Function called to remove an item
     * @param {Listable~changeCallback} [property.onChange] - 
     * @param {Listable~MoveCallBack} [property.onModify] - Function called to modify an item
     * @param {Listable~MoveCallBack} [property.onMove] - Function called to move an item
     * @param {string[]} [property.attributes] - list of attributes attributes (for object items)
     */
    var Properties = WAF.require('waf-behavior/properties');


    Properties.types.list = {
        options: {
            bindable: false,
            onModify: function(data, name, property) {
                // default modify callback, could be overided by custom onModify
                this.fire('remove', name, { value: data.oldValue, index: data.index });
                this.fire('insert', name, { value: data.value, index: data.index });
            },
            onMove: function(data, name, property) {
                // default move callback, could be overided by custom onMove
                this.fire('remove', name, { value: data.value, index: data.from });
                this.fire('insert', name, { value: data.value, index: data.to });
            }
        },
        listable: false,
        normalize: function(list) {
            if(list === '') {
                return [];
            }
            if(typeof list === "string") {
                return JSON.parse(list);
            }
            return list;
        },
        afterAdd: function(name, property) {
            if(property.attributes) {
                property.attributes = property.attributes.map(function(attribute) {
                    return typeof attribute === 'string' ? { name: attribute } : attribute;
                });
            }
        },
        createAccessor: function(name, property, storage) {
            var self = this;

            storage[name] = [];

            // the array containing the actual property
            var subscribers = {
                'onInsert': undefined,
                'onRemove': undefined,
                'onMove': undefined,
                'onModify': undefined,
                'onChange': undefined
            };

            /**
             * Get or set the item at index
             * @param {integer} index - index of the item
             * @param {any} [value] - new item value
             * @return {any} item value
             * @memberof Listable
             * @instance
             * @method 
             */
            self[property.functionName] = function(index, value) {
                if(arguments.length === 2) {
                    if(index > storage[name].length) {
                        throw 'Index out of range for property "' + name + '"';
                    }
                    if(index === storage[name].length) {
                        self[property.functionName].push(index);
                    } else {
                        var oldValue = storage[name][index];
                        storage[name][index] = value;
                        self.fire('modify', name, { index: index, value: value, oldValue: oldValue });
                        self.fire('change', name, { value: storage[name], action: "modify" }, { once: true });
                    }
                    return storage[name][index];
                }
                if(arguments.length === 1) {
                    if(typeof index === 'number') {
                        return storage[name][index];
                    } else {
                        self[property.functionName].removeAll();
                        index = Properties.types.list.normalize.call(this, index);
                        self[property.functionName].concat(index);
                    }
                }
                return storage[name].slice(0);
            };

            /**
             * Return the number of items
             * @return {integer} Number of items
             * @memberof Listable
             * @instance
             * @method 
             */
            self[property.functionName].count = function() {
                return storage[name].length;
            };

            /**
             * Insert an item at index
             * @param {integer} index - index of the item
             * @param {any} [value] - new item value
             * @memberof Listable
             * @instance
             * @method 
             */
            self[property.functionName].insert = function(index, value) {
                var count = self[property.functionName].count();
                if(index >= count) {
                    index = count;
                    storage[name].push(value);
                } else {
                    storage[name].splice(index, 0, value);
                }
                self.fire('insert', name, { index: index, value: value });
                self.fire('change', name, { value: storage[name], action: "insert" }, { once: true });
                return index;
            };

            /**
             * Remove item at index
             * @param {integer} index - index of the item
             * @return {any} the removed item
             * @memberof Listable
             * @instance
             * @method 
             */
            self[property.functionName].remove = function(index) {
                var r = storage[name].splice(index, 1);
                self.fire('remove', name, { index: index, value: r[0] });
                self.fire('change', name, { value: storage[name], action: "remove" }, { once: true });
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
            self[property.functionName].push = 
            self[property.functionName].append = function(value) {
                return self[property.functionName].insert(self[property.functionName].count(), value);
            };

            /**
             * Return the item at the end of the list
             * @return {any} item value
             * @memberof Listable
             * @instance
             * @method 
             */
            self[property.functionName].first = function() {
                return self[property.functionName](0);
            };

            /**
             * Return the item at the beggining of the list
             * @return {any} item value
             * @memberof Listable
             * @instance
             * @method 
             */
            self[property.functionName].last = function() {
                return self[property.functionName](self[property.functionName].count() - 1);
            };

            /**
             * Return and remove the item at the end of the list
             * @return {any} item value
             * @memberof Listable
             * @instance
             * @method 
             */
            self[property.functionName].pop = function() {
                var r = self[property.functionName].last();
                self[property.functionName].remove(self[property.functionName].count() - 1);
                return r;
            };

            /**
             * Return and remove the item at the beggining of the list
             * @return {any} item value
             * @memberof Listable
             * @instance
             * @method 
             */
            self[property.functionName].shift = function() {
                var r = self[property.functionName].first();
                self[property.functionName].remove(0);
                return r;
            };

            /**
             * Append the items at the end of the list
             * @param {any[]} [list] - array of items
             * @memberof Listable
             * @instance
             * @method 
             */
            self[property.functionName].concat = function(list) {
                if(!list) {
                    return;
                }
                for(var i = 0; i < list.length; i++) {
                    self[property.functionName].append(list[i]);
                }
            };

            /**
             * Remove all items
             * @memberof Listable
             * @instance
             * @method 
             */
            self[property.functionName].removeAll = function() {
                while(self[property.functionName].count()) {
                    self[property.functionName].remove(0);
                }
            };

            /**
             * Move an item
             * @memberof Listable
             * @instance
             * @method
             */
            self[property.functionName].move = function(from, to) {
                var item = storage[name].splice(from, 1);
                if(item.length) {
                    storage[name].splice(to, 0, item[0]);
                }
                self.fire('move', name, { from: from, to: to, value: item[0] });
                self.fire('change', name, { value: storage[name], action: "move" }, { once: true });
            };

            // install default events
            Object.keys(subscribers).forEach(function(key) {
                var eventKind = key[2].toLowerCase() + key.substr(3);
                self[property.functionName][key] = function(callback) {
                    return self.subscribe(eventKind, name, function(event) {
                        callback.call(self, event.data, name, property);
                    }, self);
                };
            });
        }
    };

    return undefined;
});
