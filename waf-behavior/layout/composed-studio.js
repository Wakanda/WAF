(function() {
    "use strict";
    var Composed = WAF.require('waf-behavior/layout/composed');

    Composed.prototype._childIsSubWidget = function(widget) {
        // currently, a composed is allway a subwidget
        for(var k in this._parts) {
            if(this._parts[k].widget === widget) {
                return true;
            }
        }
        return false;
    };

    Composed.doAfterClassMethod('addProxiedEvent', function(event, name, newEvent) {
        this.addEvent(newEvent || event);
    });

})();
