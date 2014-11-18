(function() {
    "use strict";
    var Widget = WAF.require('waf-core/widget');
    Widget.defaultBehaviors.push('waf-behavior/studio');


    /**
     * Create the dom node of the widget and set this.node
     * The dom node is create using constructor.tagName
     * Children elements are created in the _createChildren functions of the inherited behaviors
     * @private
     */
    Widget.BaseWidget.prototype._createDomNode = function(nosubwidget) {
        var packageName = this.constructor._getConf()['packageName'].replace('/package.json', '');

        this.node = document.createElement(this.constructor.tagName);
        this.node.id = this.id;
        this.node.setAttribute('data-type', this.kind);
        this.node.setAttribute('data-package', packageName);
        if (this._createChildren) {
            this._createChildren(nosubwidget);
        }
    };

    Widget.BaseWidget.doAfter('_attach', function(parnt, callback) {
        if(Designer.env.enableTagCreation && parnt._tag) {
            Designer.html.initTags({
                'id': parnt.node.id,
                'parentTag': parnt._tag
            });
        }
    });

    Widget.BaseWidget.wrap('_detach', function(_detach) {
        var parnt = this.parentWidget;
        _detach();
        if(Designer.env.enableTagCreation && parnt && parnt.node && parnt.node.id && parnt._tag) {
            if(Designer.ui.outlineTag.getNodeByProperty('tagId', Designer.getById(parnt.node.id).id)) {
                Designer.html.initTags({
                    'id': parnt.node.id,
                    'parentTag': parnt._tag
                });
            }
        }
    });

    var instanceFromDom = Widget.instanceFromDom;
    Widget.instanceFromDom = function(node) {
        var widget = instanceFromDom.call(this, node);
        if(!widget) {
            return widget;
        }
        if(widget.id === 'waf_selection') {
            return undefined;
        }
        if(/-waf-status-deleted/.test(widget.id)) {
            return undefined;
        }
        return widget;
    };

})();
