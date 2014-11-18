WAF.define('waf-behavior/layout/dropdownfield', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior'),
        Event = WAF.require('waf-core/event'),
        WakError = WAF.require('waf-core/error');
    var klass = Behavior.create()
    var proto = klass.prototype;
    klass.inherit(WAF.require('waf-behavior/layout/composed'));
    
    klass.setPart('field');
    klass.setPart('button');
    klass.setPart('menu');
    
    klass.addProxiedMethods(["value"], 'field');
    
    proto._initBehavior = function() {
        this.getPart('button').subscribe('action', function() {
            if(this._opened)
                this.close();
            else
                this.open();
        }.bind(this));
    };
    
    proto.open = function() {
        this.getPart('menu').show();
        this._opened = true;
    };
    
    proto.close = function() {
        this.getPart('menu').hide();
        this._opened = false;
    };
    
    proto.opened = function() {
        return this._opened;
    };
    
    


    return klass;
});
