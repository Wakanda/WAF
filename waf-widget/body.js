WAF.define('waf-widget/body', function() {
    "use strict";
    var Widget = WAF.require('waf-core/widget');
    var klass = Widget.create('Body');
    var proto = klass.prototype;

    klass.inherit(WAF.require('waf-behavior/layout/container'));
    klass.removeClass('waf-widget');
    klass.removeClass('waf-body');

    proto._initWidget = function(node, options) {
        if(!node) node = document.body;
        return this.$super('_initWidget')(node, options);
    };

    proto.position = function() {
        return {
               0: 0,   1: 0,
               x: 0,   y: 0,
            left: 0, top: 0,
            length: 2
        };
    };

    proto.absolutePosition = proto.position;

    return klass;
});
