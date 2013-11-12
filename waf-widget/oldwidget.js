WAF.define('waf-widget/oldwidget', function() {
    "use strict";
    var Widget = WAF.require('waf-core/widget');
    var klass = Widget.create('OldWidget');
    klass.inherit(WAF.require('waf-behavior/layout/container'));

    klass.removeClass('waf-oldwidget');

    klass.options_parsers = {}; // deactivate all options parsers
    klass.prototype.initBehavior = function() {}; // deactivate behaviors
    
    return klass;
});
