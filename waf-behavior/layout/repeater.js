WAF.define('waf-behavior/layout/repeater', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior'),
        Event = WAF.require('waf-core/event'),
        WakError = WAF.require('waf-core/error');
    var klass = Behavior.create('Layout.Repeater');
    var proto = klass.prototype;
    klass.inherit(WAF.require('waf-behavior/layout/container'));
    
    proto.initBehavior = function() {
        var n = this.countWidgets() - 1;
        if(~n) {
            this.repeatedWidget(this.widget(n));
            this.detachWidget(n);
        }
    }
    
    proto.repeatedWidget = function(widget) {
        if(arguments.length)
            this._original = widget;
        return this.original;
    }
    
    proto.bindDatasourceCollection = function(datasource) {
        this._datasource = datasource;
        
        this._subscriber = this._datasource.subscribe(Event.CollectionChange, this._updateCollection.bind(this));
    
        this._updateCollection();
    
        return this._subscriber;
    };
    
    proto._updateCollection = function() {
        if(!this.repeatedWidget()) // no widget to repeat
            return undefined;

        this.detachAndDestroyAllWidgets();
        for(var i = 0, l = this._datasource.length; i <l; i++) {
            var w = this.getNewItem(i);
            this.attachWidget(w);
            w.propagate('bindDatasourceElement', this._datasource, i);
            w.propagate('subscribe', Event.Focus, function(event, user_data) {
                this._datasource.select(user_data.position);
            }, this, { position: i });
        }
    };
    
    proto.getNewItem = function(position) {
        return this.repeatedWidget().clone();
    };
    
    klass.optionsParsers.collection = function(name) {
        var s = sources[this.options.collection];
        if(!s) return;
        this.bindDatasourceCollection(s);
    };


    return klass;
});
