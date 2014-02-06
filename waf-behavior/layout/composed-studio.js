(function() {
    "use strict";
    var Class = WAF.require('waf-core/class');
    var Composed = WAF.require('waf-behavior/layout/composed');

    Composed.prototype._childIsSubWidget = function(widget) {
        // currently, a composed is allway a subwidget
        for(var k in this._parts)
            if(this._parts[k].widget == widget)
                return true;
        return false;
    };

    var Studio = WAF.require('waf-behavior/studio');

    Studio.doAfterClassMethod('whenInherited', function(klass) {
        if(!Class.inheritFrom(klass, Composed)) return;

        // add the proxied events
        for(var k in klass._parts) {
            klass._parts[k].events.forEach(function(o) {
                klass.addEvent(o.new_event || o.event);
            });
        }
    });

})()
