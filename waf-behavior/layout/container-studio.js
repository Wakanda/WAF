(function() {
    "use strict";
    /* global Designer */
    var Container = WAF.require('waf-behavior/layout/container'),
    Class = WAF.require('waf-core/class');
    Container.inherit(WAF.require('waf-behavior/studio'));

    Container.containerChildrenAreSubWidgets = function(state) {
        this._childrenAreSubWidgets = (state === undefined || state);
    };

    Container.prototype._studioCanDrop = function() {
        return !this.constructor._childrenAreSubWidgets;
    };

    Container.prototype._behaviorChildIsSubWidget = function(widget) {
        if (this.indexOfWidget(widget) >= 0) {
            return this.constructor._childrenAreSubWidgets;
        }
        return false;
    };

    Container.setBehaviors({isContainer: true}); // Unless explicitly unset, all containers are containers ;-)

    Container.doAfterClassMethod('addIndexedEvent', function(event, newEvent) {
        this.addEvent(newEvent || event);
    });

    Container.wrap('_containerInsertDomNode', function(_containerInsertDomNode, index, widget) {
        if(widget.isSubWidget() || !widget._tag) {
            _containerInsertDomNode(index, widget);
        } else {
            // let the studio take care of inserting the node
            if($(widget.node).parents().slice(0, 3).index(this._getContainerNode()) < 0) {
                widget._tag.setParent(this._tag);
            }
        }
    });

    Container.wrap('_containerRemoveDomNode', function(_containerRemoveDomNode, widget) {
        if(widget.isSubWidget() || !widget._tag) {
            _containerRemoveDomNode(widget);
        } else {
            // Remove tag with overlay
            if($(widget.node).parents().slice(0, 3).index(this._getContainerNode()) >= 0) {
                widget._tag.getOverlayHtmlObject().remove();
            }
        }
    });
})();

