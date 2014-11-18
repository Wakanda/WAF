WAF.define('waf-behavior/layout/repeater', function() {    
    "use strict";
    var Behavior = WAF.require('waf-core/behavior'),
        klass = Behavior.create(),
        proto = klass.prototype;

    klass.inherit('waf-behavior/layout/container');

    klass.linkDatasourcePropertyToRepeater = function(property) {
        this._repeatedProperty = property;
    };

    function accessor(that) {
        return that[that.constructor._repeatedProperty];
    }

    klass.repeatedWidget = function(widget) {
        if(arguments.length) {
            this._repeatedWidget = widget;
        }
        return this._repeatedWidget;
    };

    klass.mapAttributesToRepeatedWidgetProperties = function(options) {
        this._mapAttributesToRepeatedWidgetProperties = options;
    };

    proto._initBehavior = function() {
        if(!accessor(this)) {
            return;
        }

        var widgetClass = this.constructor.repeatedWidget();
        if(widgetClass) {
            this.repeatedWidget(new widgetClass());
        }

        if(this.countWidgets()) {
            this.repeatedWidget(this.widget(0));
            this.detachWidget(0);
        }

        var _updatePage = function() {
            if(!this.repeatedWidget()) {
                return;
            }
            var datasource = accessor(this)();
            if(!datasource) {
                return;
            }

            this.detachAndDestroyAllWidgets();

            var start = accessor(this).start();
            var end = start + accessor(this).pageSize();
            end = Math.min(end, datasource.length);
            for(var i = start; i < end; i++) {
                var widget = this.getNewItem(i);
                this.attachWidget(widget);
                widget.propagate('bindDatasourceElement', datasource, i);
            }
        };

        accessor(this).onPageChange(_updatePage);
        _updatePage.call(this);
        accessor(this).onChange(_updatePage);
    };

    proto._init = function() {
        if(!accessor(this)) {
            return;
        }
        // map attributes
        var myBinding = accessor(this).boundDatasource();
        for(var attribute in this.constructor._mapAttributesToRepeatedWidgetProperties) {
            var mapping = this.constructor._mapAttributesToRepeatedWidgetProperties[attribute];
            if(typeof mapping === 'string') {
                mapping = { property: mapping };
            }

            var widget = this.repeatedWidget();
            if(mapping.getWidget) {
                widget = mapping.getWidget(widget);
            }

            if(widget && widget[mapping.property] && !widget[mapping.property].boundDatasource()) {
                var binding = WAF.extend({}, myBinding.attributes[attribute]);
                binding.formatters = (binding.formatters || []).concat(mapping.formatters || []);
                widget[mapping.property].bindDatasource(binding);
            }
        }
    };

    proto.repeatedWidget = function(widget) {
        if(arguments.length) {
            this._repeatedWidget = widget;
        }
        return this._repeatedWidget;
    };

    proto.getNewItem = function(position) {
        return this.repeatedWidget().clone();
    };

    return klass;
});
