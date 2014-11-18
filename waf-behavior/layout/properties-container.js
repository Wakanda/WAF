WAF.define('waf-behavior/layout/properties-container', ['waf-core/behavior', 'waf-behavior/properties'], function(Behavior, Properties) {
    "use strict";
    var klass = Behavior.create();
    klass.inherit('waf-behavior/layout/container');

    /**
     * Add a listable property for the container
     * @params {string} name
     * @params {object} [options]
     * @params {WidgetClass} [options.defaultWidgetClass] - default widget class to instanciate when inserting new items (if ommited, the defaut is the container's restricted widget)
     * @params {function} [options.getNewWidget] - get a new widget for the given items
     * @params {function} [options.getValueFromWidget] - get the value from the given widget (used to initialize the list from the dom)
     * @params {function} [options.modifyWidget] - modify the widget at index with the new value
     * @method linkListPropertyToContainer
     */
    klass.linkListPropertyToContainer = function(name, options) {
        if(!(name in this._properties)) {
            throw 'Unknown property: "' + name + '"';
        }

        var property = this._properties[name];

        if(property.type !== 'list') {
            throw 'Property "' + name + '" must be of type list.';
        }

        // default options
        options = WAF.extend({
            getNewWidget: function(item) {
                var WidgetClass = options.defaultWidgetClass || this._restrict;
                var widget = new WidgetClass();
                for(var k in item) {
                    if(k in widget) {
                        widget[k](item[k]);
                    }
                }
                return widget;
            },
            getValueFromWidget: function(widget) {
                var result = {};
                property.attributes.forEach(function(attr) {
                    result[attr.name] = attr.name in widget && widget[attr.name]();
                });
                return result;
            },
            modifyWidget: function(index, item) {
                var widget = this.widget(index);
                for(var k in item) {
                    if(k in widget) {
                        widget[k](item[k]);
                    }
                }
            }
        }, options || {});

        // We override the containers methods
        this.prototype.detachWidget = function(index) {
            var ret = this.$super('detachWidget')(index);
            if(this[property.functionName] && !this[property.functionName]._blockListUpdate) {
                this[property.functionName]._blockContainerUpdate = true;
                this[property.functionName].remove(index);
                this[property.functionName]._blockContainerUpdate = false;
            }
            return ret;
        };
        this.prototype.insertWidget = function(index, widget) {
            var ret = this.$super('insertWidget')(index, widget);
            if(this[property.functionName] && !this[property.functionName]._blockListUpdate) {
                this[property.functionName]._blockContainerUpdate = true;
                this[property.functionName].insert(index, options.getValueFromWidget.call(this, widget));
                this[property.functionName]._blockContainerUpdate = false;
            }
            return ret;
        };
        this.prototype.moveWidget = function(from, to) {
            var ret = this.$super('moveWidget')(from, to);
            if(this[property.functionName] && !this[property.functionName]._blockListUpdate) {
                this[property.functionName]._blockContainerUpdate = true;
                this[property.functionName].move(from, to);
                this[property.functionName]._blockContainerUpdate = false;
            }
            return ret;
        };

        // If the user have already defined callbacks, we save them
        var oldCallbacks = {};
        ['onInsert', 'onRemove', 'onMove', 'onModify'].forEach(function(key) {
            if(key in property && property[key] !== Properties.types['list'].options[key]) {
                oldCallbacks[key] = property[key];
            }
        }.bind(this));

        // We upgrade the property with our callbacks and options
        WAF.extend(property, {
            onInsert: function(data) {
                if(!this[property.functionName]._blockContainerUpdate) {
                    this[property.functionName]._blockListUpdate = true;
                    var widget = options.getNewWidget.call(this, data.value);
                    this.insertWidget(data.index, widget);
                    this[property.functionName]._blockListUpdate = false;
                }
                if(oldCallbacks.onInsert) {
                    oldCallbacks.onInsert.call(this, data);
                }
            },
            onRemove: function(data) {
                if(!this[property.functionName]._blockContainerUpdate) {
                    this[property.functionName]._blockListUpdate = true;
                    this.detachWidget(data.index);
                    this[property.functionName]._blockListUpdate = false;
                }
                if(oldCallbacks.onRemove) {
                    oldCallbacks.onRemove.call(this, data);
                }
            },
            onMove: function(data) {
                if(!this[property.functionName]._blockContainerUpdate) {
                    this[property.functionName]._blockListUpdate = true;
                    this.moveWidget(data.from, data.to);
                    this[property.functionName]._blockListUpdate = false;
                }
                if('onMove' in oldCallbacks) {
                    if(oldCallbacks.onMove) {
                        oldCallbacks.onMove.call(this, data);
                    }
                } else {
                    this[property.functionName]._blockContainerUpdate = true;
                    // default move callback, could be overided by custom onMove
                    this.fire('remove', name, { value: data.value, index: data.from });
                    this.fire('insert', name, { value: data.value, index: data.to });
                    this[property.functionName]._blockContainerUpdate = false;
                }
            },
            onModify: function(data) {
                if(!this[property.functionName]._blockContainerUpdate) {
                    this[property.functionName]._blockListUpdate = true;
                    options.modifyWidget.call(this, data.index, data.value);
                    this[property.functionName]._blockListUpdate = false;
                }
                if('onModify' in oldCallbacks) {
                    if(oldCallbacks.onModify) {
                        oldCallbacks.onModify.call(this, data);
                    }
                } else {
                    this[property.functionName]._blockContainerUpdate = true;
                    // default modify callback, could be overided by custom onModify
                    this.fire('remove', name, { value: data.oldValue, index: data.index });
                    this.fire('insert', name, { value: data.value, index: data.index });
                    this[property.functionName]._blockContainerUpdate = false;
                }
            },
            defaultValueCallback: function() {
                this[property.functionName]._blockListUpdate = false;
                this[property.functionName]._blockContainerUpdate = false;
                return this.widgets().map(options.getValueFromWidget.bind(this));
            },
            domAttribute: false
        });

    };

    return klass;
});
