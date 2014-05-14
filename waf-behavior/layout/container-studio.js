(function() {
    "use strict";
    /* global Designer */
    var Container = WAF.require('waf-behavior/layout/container'),
    Class = WAF.require('waf-core/class');
    Container.inherit(WAF.require('waf-behavior/studio'));

    Container.containerChildrenAreSubWidgets = function(state) {
        this._childrenAreSubWidgets = (state === undefined || state);
    };

    Container.prototype._behaviorChildIsSubWidget = function(widget) {
        if (this.indexOfWidget(widget) >= 0) {
            return this.constructor._childrenAreSubWidgets;
        }
        return false;
    };

    Container.wrap('_containerInsertDomNode', function(original, index, widget) {
        if (Class.instanceOf(widget, WAF.require('waf-behavior/layout/container')) && Class.instanceOf(widget, WAF.require('waf-behavior/studio'))) {
            Designer.html.attachHtml(this.id, widget.getNode(), {original: original, index: index, widget: widget});
        } else {
            original(index, widget);
        }
    });

    Container.addEvent('insertWidget');
    Container.addEvent('detactWidget');
    Container.setBehaviors({isContainer: true}); // Unless explicitly unset, all containers are containers ;-)

    Container.doAfterClassMethod('addIndexedEvent', function(event, newEvent) {
        this.addEvent(newEvent || event);
    });

})();

