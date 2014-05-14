WAF.define('waf-behavior/layout/repeater', function() {    
    "use strict";
    /* global sources */
    var Behavior = WAF.require('waf-core/behavior'),
        klass = Behavior.create(),
        proto = klass.prototype,
        Template = WAF.require('waf-core/template');
    
    klass.inherit(WAF.require('waf-behavior/layout/container'));
    
    proto._initBehavior = function() {
        var n = this.countWidgets();
        if(n) {
            this.repeatedWidget(this.widget(n - 1));
            this.detachWidget(n - 1);
        }
    };
    
    proto.repeatedWidget = function(widget) {
        if(arguments.length) {
            this._original = widget;
        }
        return this._original;
    };
    
    proto.setDataTemplate = function(html) {
        if (typeof html !== undefined) {
            console.log('setting template to', html);
            this._template = new Template(html);
            this._templateCache = '';
        }
        
        return this._template || null;
    };    
    
    proto.bindDatasourceCollection = function(datasource) {
        this._datasource = datasource;
        
        this._subscriber = this._datasource.subscribe('collectionChange', this._updateCollection.bind(this));
    
        this._updateCollection();
    
        return this._subscriber;
    };
    
    proto._updateCollection = function() {
        var pos,
            dsLength,
            deferred = $.Deferred(),
            attributes,
            count = 0;
        
        // no widget/template to repeat        
        if (!this.repeatedWidget() && !this._template) {
            return undefined;
        }

        if (!this._template) {
            this.detachAndDestroyAllWidgets();
        } else {
            this._templateCache = '';
            
            deferred.done(function() {
                this.node.innerHTML = this._templateCache;
            });
        }
        
        attributes = this._datasource.getAttributeNames();
        
        for (pos = 0, dsLength = this._datasource.length; pos < dsLength; pos++) {
            if (this._template) {
                this._datasource.getElement(pos, function(event) {
                    var data = {};
                    
                    attributes.forEach(function(name) {
                        data[name] = event.element.getAttributeValue(name) || 'Not Set';
                    });
                    
                    this._templateCache += this._template.render(data);
                    
                    // TODO: use pageSize ?
                    if (++count === dsLength) {
                        deferred.resolveWith(this);
                    }
                }.bind(this));
                // TODO: handle focus 
            } else {
                var w = this.getNewItem(pos);
                this.attachWidget(w);
                w.propagate('bindDatasourceElement', this._datasource, pos);
                w.propagate('subscribe', 'focus', function(event, userData) {
                    this._datasource.select(userData.position);
                }, this, { position: pos });
            }
        }
    };
    
    proto.getNewItem = function(position) {
        return this.repeatedWidget().clone();
    };
    
    klass.optionsParsers.collection = function(name) {
        var s = sources[this.options.collection];
        if (!s) {
            return;
        }
        
        this.bindDatasourceCollection(s);
    };


    return klass;
});
