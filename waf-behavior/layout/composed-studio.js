(function() {
    "use strict";
    var Composed = WAF.require('waf-behavior/layout/composed');
    Composed.inherit(WAF.require('waf-behavior/studio'));

    Composed.prototype._behaviorChildIsSubWidget = function(widget) {
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

    Composed.doAfterClassMethod('addAliasProperty', function(aliasName, part, name) {
        var widgetClass = this._parts[part].widgetClass;
        var property = WAF.extend({}, widgetClass._properties[name]);
        property.functionName = String.toCamelCase(aliasName);

        var Properties = WAF.require('waf-behavior/properties');
        var custom = Properties._propertiesCustomHelper;
        custom(property, 'afterAddStudio').call(this, aliasName, property);
    });

})();
