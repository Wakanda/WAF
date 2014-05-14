/*
 * This file is part of Wakanda software, licensed by 4D under
 *  (i) the GNU General Public License version 3 (GNU GPL v3), or
 *  (ii) the Affero General Public License version 3 (AGPL v3) or
 *  (iii) a commercial license.
 * This file remains the exclusive property of 4D and/or its licensors
 * and is protected by national and international legislations.
 * In any event, Licensee's compliance with the terms and conditions
 * of the applicable license constitutes a prerequisite to any use of this file.
 * Except as otherwise expressly stated in the applicable license,
 * such license does not include any other license or rights on this file,
 * 4D's and/or its licensors' trademarks and/or other proprietary rights.
 * Consequently, no title, copyright or other proprietary rights
 * other than those specified in the applicable license is granted.
 */

/**
 * 
 * @namespace WAF.classes
 * @class Widget
 */
WAF.classes.Widget = function () {
    this.observableAttribute = [];
    this.id;
    this.data = {};
};

/**
 * 
 * @namespace WAF
 * @method  buildWidgetConstructor
 * @param {Object} definition
 * @param {String} widgetName
 * @static
 */
WAF.buildWidgetConstructor = function(definition, widgetName) {
    var methodList, 
    attributeList, 
    observableAttributeList, 
    widParentDef, 
    widParent, 
    prot, 
    uses, 
    protParent, 
    protInterface, 
    count, 
    ressourceInterface, 
    p, 
    i, 
    v, 
    observableAttr, 
    observableParentAttr, 
    parentAttr, 
    widgetAttr, 
    behaviorAttr, 
    mapStorageFn, 
    parentBehaviorAtrr;

    prot = new WAF.classes.Widget();
    protParent = {};
    protInterface = {};
    observableAttr = {};
    widgetAttr = {};
    behaviorAttr = {
        behaviors: []
    };
    mapStorageFn = [];
    methodList = definition.getMethods();
    attributeList = definition.getAttributes();
    observableAttributeList = definition.getObservableAttributes();
    widParentDef = definition.getInheritedWidget();
    uses = definition.getUses();

    //Inheritance between widget
    //If the parent widget is not implemented yet we create it

    if (widParentDef) {
        var parentDef = WAF.customWidgets[widParentDef];
        if (!WAF.widget[widParentDef]) {
            arguments.callee(parentDef, widParentDef);
        }

        widParent = new WAF.widget[widParentDef]();
        observableParentAttr = widParent.__getObservableAttr();
        parentAttr = widParent.__getAttr();
        parentBehaviorAtrr = widParent.__getBehaviorAttr();
        mapStorageFn = widParent.__getBehaviorInitFn();

        for (p in observableParentAttr) {
            observableAttr[p] = observableParentAttr[p];
        }

        for (p in parentAttr) {
            behaviorAttr[p] = parentBehaviorAtrr[p];
        }

        for (p in parentAttr) {
            widgetAttr[p] = parentAttr[p];
        }

        delete widParent.__getObservableAttr;
        delete widParent.__getAttr;
        delete widParent.__getBehaviorAttr;
        delete widParent.__getBehaviorInitFn;

        for (p in widParent) {
            if (typeof widParent[p] === 'function') {
                prot[p] = protParent[p] = widParent[p];
            }
        }
    }

    //Append the ressource API to the current widget proto
    count = behaviorAttr['behaviors'].length;
    for (i = 0; i < uses.length; i++) {
        if (count && behaviorAttr['behaviors'].indexOf(uses[i]) >= 0) {
            continue;
        }

        //Retreive the ressource
        ressourceInterface = WAF.behaviors[uses[i]];

        for (p in ressourceInterface) {
            if (typeof ressourceInterface[p] === 'function') {
                if (p === 'init') {
                    mapStorageFn.push(ressourceInterface[p]);
                    continue;
                }
                prot[p] = protInterface[p] = ressourceInterface[p];
            } else {
                behaviorAttr[p] = ressourceInterface[p];
            }
        }
        behaviorAttr['behaviors'].push(uses[i]);
    }

    //Append the user's method to the widget proto

    for (v in methodList) {
        if (protParent[v] || protInterface[v]) {
            prot[v] = (function(name, fn) {
                var prot = protParent[name] ? protParent : protInterface;
                return function() {
                    var ctxTmp = this.Base;
                    this.Base = prot[name];
                    var result = fn.apply(this, arguments);
                    this.Base = ctxTmp;
                    return result;
                };
            })(v, methodList[v]);

        } else {
            prot[v] = methodList[v];
        }
    }
    prot['init'] = prot['init'] || function() {
    };

    for (v in observableAttributeList) {
        observableAttr[v] = observableAttributeList[v];
    }

    for (v in attributeList) {
        widgetAttr[v] = attributeList[v];
    }

    var widFn = (function(oAttr, attr, behavAtrr, behavInitFn) {

        WAF.widget[widgetName] = function Widget(config) {
            var p, l, _ctx, _observableProperty, _attrBehavior, _behavFn, _attrList;
            _ctx = this;
            _observableProperty = oAttr || {};
            _attrBehavior = behavAtrr || {};
            _behavFn = behavInitFn || [];
            _attrList = attr || {};

            for (p in config) {
                if (p.substr(0, 5) === 'data-') {
                    this.data[p.substr(5)] = config[p];
                }
            }

            //Don't send event and don't exec the user's constructor 
            //while widget initialization is in progress'

            if (!WAF.initWidgetInProcess) {

                for (p in _attrBehavior) {
                    this[p] = _attrBehavior[p];
                }

                for (p in _attrList) {
                    this[p] = _attrList[p];
                }

                for (p in oAttr) {
                    (function(propName) {
                        Object.defineProperty(
                        _ctx,
                        propName,
                        {
                            set: function(value) {
                                var event = new WAF.Event({
                                    target: (_ctx.id + '.' + propName),
                                    eventType: 'change',
                                    property: propName,
                                    eventKind: 'widgetPropertyEvent',
                                    event: {value: value}
                                });
                                WAF.eventManager.fireEvent(event);
                                _observableProperty[propName] = value;
                            },
                            get: function() {
                                return _observableProperty[propName];
                            }
                        });
                    })(p);
                }

                this.id = (config && ('id' in config)) ? config.id : null;
                if (this.id) {
                    WAF.widgets[this.id] = this;
                }

                for (p = 0, l = _behavFn.length; p < l; p++) {
                    _behavFn[p].apply(this);
                }

                //WAF.eventManager.fireEvent('before init', this.id);
                this.init.apply(this, arguments);
                //WAF.eventManager.fireEvent('after init', this.id);

            } else {
                //method that is use only while the init widget process

                this.__getObservableAttr = function() {
                    return _observableProperty;
                };

                this.__getBehaviorAttr = function() {
                    return _attrBehavior;
                };

                this.__getAttr = function() {
                    return _attrList;
                };

                this.__getBehaviorInitFn = function() {
                    return _behavFn;
                };
            }
        };
        return WAF.widget[widgetName];
    })(observableAttr, widgetAttr, behaviorAttr, mapStorageFn);

    widFn.prototype = prot;
    //WAF.widget[widgetName] = widFn;
};