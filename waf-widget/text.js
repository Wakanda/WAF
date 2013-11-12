WAF.define('waf-widget/text', function() {
    "use strict";
    var Widget = WAF.require('waf-core/widget');
    var klass = Widget.create('Text');

    klass.addDomHtmlProperty('value');

    return klass;
});
