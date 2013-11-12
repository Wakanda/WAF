(function() {
    "use strict";
    var Container = WAF.require('waf-behavior/layout/container'),
        Class = WAF.require('waf-core/class');

    Container.containerChildrenAreSubWidgets = function(state) {
        this._children_are_sub_widgets = (state === undefined || state);
    };

    Container.prototype._childIsSubWidget = function(widget) {
        if(~this.indexOfWidget(widget))
            return this.constructor._children_are_sub_widgets;
        return false;
    };

    Container.wrap('_containerInsertDomNode', function(original, index, widget) {
        if (Class.instanceOf(widget, WAF.require('waf-behavior/layout/container')) && Class.instanceOf(widget, WAF.require('waf-behavior/studio'))) {
            Designer.html.attachHtml(this.id, widget.getNode());
        } else {
            original(index, widget);
        }
    });
})()

