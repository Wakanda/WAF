WAF.define('waf-widget/button', function() {
    "use strict";
    var Widget = WAF.require('waf-core/widget'),
        Event = WAF.require('waf-core/event');
    var klass = Widget.create('Button', WAF.require('waf-widget/text'));

    klass.tagname = 'button';
    klass.removeClass('waf-text');

    klass.inherit(WAF.require('waf-behavior/focus'));

    klass.autoFireDomEvent('click', Event.Action);

    return klass;
});
