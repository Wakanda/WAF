WAF.define('waf-widget/repeater', function() {
    "use strict";
    var Widget = WAF.require('waf-core/widget'),
        Event = WAF.require('waf-core/event');

    var klass = Widget.create('Repeater');
    klass.inherit(WAF.require('waf-behavior/layout/repeater'));
    
    return klass;
});
