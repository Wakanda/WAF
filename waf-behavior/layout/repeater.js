WAF.define('waf-behavior/layout/repeater', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior'),
        Event = WAF.require('waf-core/event'),
        WakError = WAF.require('waf-core/error');
    var klass = Behavior.create('Layout.Repeater');
    var proto = klass.prototype;
    klass.inherit(WAF.require('waf-behavior/layout/container'));
    
    proto.initBehavior = function() {
        this._original = this.widget(0) || new Widget.Container();
        this.detachWidget(0);
    }
    
    proto.bindDatasourceCollection = function(datasource) {
        this._datasource = datasource;
        
        this._subscriber = this._datasource.subscribe(Event.CollectionChange, this._updateCollection.bind(this));
    
        this._updateCollection();
    
        return this._subscriber;
    };
    
    proto._updateCollection = function() {
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
        return this._original.clone();
    };
    
    klass.options_parsers.collection = function(name) {
        var s = sources[this.options.collection];
        if(!s) return;
        this.bindDatasourceCollection(s);
    };


    return klass;
});
