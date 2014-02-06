(function() {
    "use strict";
    var Container = WAF.require('waf-behavior/layout/container'),
        Class = WAF.require('waf-core/class');
    Container.inherit(WAF.require('waf-behavior/studio'));

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

    Container.addEvent(Event.Container);
    Container.addEvent(Event.AttachWidget);
    Container.addEvent(Event.InsertWidget);
    Container.addEvent(Event.DetactWidget);
    Container.setBehaviors({ isContainer: false }); // Unless explicitly unset, all containers are containers ;-)

    var Studio = WAF.require('waf-behavior/studio');

    Studio.doAfterClassMethod('whenInherited', function(klass) {
        if(!Class.inheritFrom(klass, Container)) return;

        // add the events of the behavior and the indexed events
        klass._indexed_events.forEach(function(o) {
            klass.addEvent(o.new_event || o.event);
        });
    });

})()

