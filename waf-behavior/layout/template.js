WAF.define(
'waf-behavior/layout/template',
[
    'waf-core/behavior',
    'waf-core/event',
    'waf-core/error',
    'waf-core/template'
],
function(Behavior, Event, WakError, Template) {
    "use strict";

    var tplBehavior = Behavior.create();

    // extend behavior with needed methods
    WAF.extend(tplBehavior.prototype, {
        _initBehavior: function() {
            this._hooks = {};
            this.mapping = {};
        },
        setTemplate: function(handlebarTpl) {
            if (typeof handlebarTpl !== undefined) {
                this._template = new Template(handlebarTpl, true);
                this._templateCache = '';
            }

            return this._template || null;
        },
        resetTemplateCache: function() {
            this._templateCache = '';
        },
        setHook: function(hookName, fn) {
            this._hooks[hookName] = fn;
        },
        setVarAttributeMapping: function(variables) {
            var hooks = this._hooks,
                hook = null,
                that = this;
            
            // when running inside the Designer we have no datasources
            if (typeof Designer === 'undefined') {
                variables.forEach(function(elt) {
                    that._template.setHelper(elt.variable, function() {
                        hook = hooks[elt.variable];
                        if (hook) {
                            return hook(this[elt.attribute]);
                        } else {
                            return this[elt.attribute];
                        }
                    });
                });
            }
//            console.log('setVarAttributesMapping');
//            for (var tplName in map) {
//                this._template.setHelper(tplName, function(row) {
//                    hook = that
//                    return row[map[tplName]];
//                });
//            }
        },
        renderTemplate: function(data, appendContent) {
            var convertedData = [];
            
            if (appendContent === true) {
                this._templateCache += this._template.render(data);
            } else {
                this._templateCache = this._template.render(data);
            }
            
            return this._templateCache;
        },
        updateDom: function(appendContent) {
            if (appendContent === true) {
                $(this.node).append(this._templateCache);

            } else {
                $(this.node).html(this._templateCache);
            }
        }
    });

    return tplBehavior;
});
