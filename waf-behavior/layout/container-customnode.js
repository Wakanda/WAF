WAF.define('waf-bahavior/layout/container-customnode', ['waf-behavior/layout/container'], function(Container) {
    "use strict";

    Container.wrap('_instanceFromDom', function(_instanceFromDom, node) {
        var widget = _instanceFromDom(node);
        if(!this.constructor._containerDisableCustomNodes && !widget && node.id) {
            widget = new (WAF.require('waf-widget/oldwidget'))(node);
        }
        if(!widget) {
            return widget;
        }
        // waf_selection is an element of the GUI designer that should not be included as a custom widget
        if(widget.id === 'waf_selection') {
            return undefined;
        }
        if(/-waf-status-deleted/.test(widget.id)) {
            return undefined;
        }
        return widget;
    });

    Container.containerDisableCustomNodes = function() {
        this._containerDisableCustomNodes = true;
    };


    return Container;
});

