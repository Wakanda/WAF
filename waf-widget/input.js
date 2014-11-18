WAF.define('waf-widget/input', function() {
    "use strict";
    var Widget = WAF.require('waf-core/widget'),
        Event = WAF.require('waf-core/event');
    Widget.create('Input');
    Widget.Input.tagname = 'input';
    
    Widget.Input.inherit(WAF.require('waf-behavior/focus'));
    Widget.Input.inherit(WAF.require('waf-behavior/bindable'));
    
    Widget.Input.addDomAttributeProperty('value');
    
    Widget.Input.autoFireDomEvent('change', function() { this.value(this.value()); });
    
});
