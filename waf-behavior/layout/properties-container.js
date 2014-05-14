WAF.define('waf-behavior/layout/properties-container', ['waf-core/behavior'], function(Behavior) {
    "use strict";
    var klass = Behavior.create();

    /**
     * Add a listable property for the container
     * @params {WidgetClass} [options.defaultWidgetClass] - default widget class to instanciate when inserting new items
     * @params {function} [options.defaultWidgetClass] - the default widget class (if ommit, the defaut is the container restricted widget
     * @params {function} [options.getNewWidget] - get a new widget for the given items
     * @params {function} [options.getValueFromWidget] - get the value from the given widget (used to initialize the list from the dom)
     * @params {function} [options.modifyWidget] - modify the widget at index with the new value
     */
    klass.addContainerProperty = function(name, options) {
        var blockListUpdate = false;

        this.prototype.detachWidget = function(index) {
            this.$super('detachWidget')(index);
            if(!blockListUpdate) {
                this[name].remove(index);
            }
        };
        this.prototype.insertWidget = function(index, widget) {
            this.$super('insertWidget')(index, widget);
            if(!blockListUpdate) {
                this[name].insert(index, options.getValueFromWidget.call(this, widget));
            }
        };
        this.prototype.moveWidget = function(from, to) {
            this.$super('moveWidget')(from, to);
            if(!blockListUpdate) {
                this[name].move(from, to);
            }
        };

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
                this._properties[name].attributes.forEach(function(attr) {
                    result[attr.name] = attr.name in widget && widget[attr.name]();
                });
                return {};
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


        this.addProperty(name, {
            type: 'list',
            attributes: options.attributes || [],
            onInsert: function(data) {
                blockListUpdate = true;
                var widget = options.getNewWidget.call(this, data.value);
                this.insertWidget(data.index, widget);
                blockListUpdate = false;
            },
            onRemove: function(data) {
                blockListUpdate = true;
                this.detachWidget(data.index);
                blockListUpdate = false;
            },
            onMove: function(data) {
                blockListUpdate = true;
                this.moveWidget(data.from, data.to);
                blockListUpdate = false;
            },
            onModify: function(data) {
                blockListUpdate = true;
                options.modifyWidget.call(this, data.index, data.value);
                blockListUpdate = false;
            },
            defaultValueCallback: function() {
                return this.widgets().map(options.getValueFromWidget.bind(this));
            },
            domAttribute: false
        });
    
    };

    return klass;
});
