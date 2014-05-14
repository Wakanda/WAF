WAF.define('waf-widget/container', function() {
    "use strict";
    var Widget = WAF.require('waf-core/widget');

    var klass = Widget.create('Container');
    klass.inherit(WAF.require('waf-behavior/layout/container'));
    
    return klass;
});
