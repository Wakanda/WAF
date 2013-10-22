/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


/*WAF.widget = {};
console.log('emit event : beforeWidgetCreation');
WAF.initWidgetInProcess = 1;

for (var wid in WAF.customWidgets) {
    var widgetDef = WAF.customWidgets[wid];
    if (WAF.widget[wid]) {
        continue;
    }

    (*/

WAF.Widget2 = function Widget () {
    this.observableAttribute = [];
    this.id;
    this.domNode;
    this.kind;
    this.ressources = [];
    this.data = {};
    this.onBeforeInitMethod = [];
    this.onAfterInitMethod = [];
}

WAF.buildWidgetConstructor = function(definition, widgetName) {
    var methodList, attributeList, observableAttributeList, widParentDef, prot, uses, protParent, count, ressourceInterface, p, i, v, observableAttr, observableParentAttr, privateMember;

    prot = new WAF.Widget2();
    protParent = {};
    observableAttr = {};

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

        var widParent = new WAF.widget[widParentDef]();
        observableParentAttr = widParent.__getObservableAttr();

        for(var p in observableParentAttr) {
            observableAttr[p] = observableParentAttr[p];
        }

        delete widParent.__getObservableAttr;
        delete widParent.onBeforeInitMethod;
        delete widParent.onAfterInitMethod;

        for(p in widParent) {
            prot[p] = protParent[p] = widParent[p];
        }
    }

    //Append the ressource API to the current widget proto
    count = prot['ressources'].length;
    for(i = 0; i < uses.length; i++) {
        if (count && prot['ressources'].indexOf(uses[i]) >= 0) {
            continue;
        }

        //Retreive the ressource
        ressourceInterface = WAF.resources[uses[i]];

        for(p in ressourceInterface) {

            if (p == 'onBeforeInit' || p == 'onAfterInit') {
                var initInterfaceMethod = ressourceInterface[p];
                for (v = 0; v < initInterfaceMethod.length; v++) {
                    if (prot[p + 'Method'].indexOf(initInterfaceMethod[v]) < 0) {
                        prot[p + 'Method'].push(initInterfaceMethod[v]);
                    }
                }
                continue;
            }

            prot[p] = (function(name, fn) {
                return function() {
                    console.log('emit normal event : ', name);
                    WAF.eventManager.fireEvent(name, this.id);
                    return fn.apply(this, arguments);
                }
            })(p, ressourceInterface[p]);
        }
        prot['ressources'].push(uses[i]);
    }

    //Append the user's method to the widget proto

    for (v in methodList) {
        if (protParent[v]) {
            prot[v] = (function(name, fn) {
                var fnStr = fn.toString();

                if (fnStr.indexOf('this.Base') >= 0) {
                    return function() {
                        var ctxTmp = this.Base;
                        this.Base = protParent[name];
                        var result = fn.apply(this, arguments);        
                        this.Base = ctxTmp;
                        return result;
                    };
                } else {
                    return function() {
                        var ctxTmp = this.Base;
                        this.Base = protParent[name];
                        var event = new WAF.Event({
                            target : this,
                            eventType : name,
                            eventKind : 'widgetEvent',
                            event : {args : arguments}
                        });
                        WAF.eventManager.fireEvent(event);
                        
                        var result = fn.apply(this, arguments);        
                        this.Base = ctxTmp;

                        return result;
                    };
                }
            })(v, methodList[v]);
        } else {
            prot[v] = (function(name, fn) {
                return function() {
                    //console.log('emit normal event : ', name);
                    var event = new WAF.Event({
                        target : this,
                        eventType : name,
                        eventKind : 'widgetEvent',
                        event : {args : arguments}
                    });
                    
                    WAF.eventManager.fireEvent(event);
                    
                    return fn.apply(this, arguments);
                }
            })(v, methodList[v]);
        }
    }

    for (v in attributeList) {
        prot[v] = attributeList[v];
    }
    
    for (v in observableAttributeList) {
        observableAttr[v] = observableAttributeList[v];
    }

    var widFn = (function(oAttr) {
        var initMethod = prot['init'] || function() {};
        return function Widget(config) {
            var p;
            var ctx = this;
            var _observableProperty = oAttr || {};  
            for (p in config) {
                if (p.substr(0, 5) === 'data-') {
                    this.data[p.substr(5)] = config[p];
                }
            }
            
            //Don't send event and don't exec the user's constructor 
            //while widget initialization is in progress'

            if (!WAF.initWidgetInProcess) {
                for(p in oAttr) {
                    (function(propName) {
                        Object.defineProperty(
                        ctx,
                        propName, 
                        {
                            set : function(value) {
                                var event = new WAF.Event({
                                    target : ctx,
                                    eventType : 'change',
                                    property : propName,
                                    eventKind : 'widgetPropertyEvent',
                                    event : {value : value}
                                });
                                WAF.eventManager.fireEvent(event);
                                _observableProperty[propName] = value;
                            },

                            get : function() {
                                return _observableProperty[propName];
                            }
                        });
                    })(p);
                }
                
                this.id = (config && ('id' in config)) ? config.id : null;
                WAF.widgets[this.id] = this;
                this.domNode = document.getElementById(this.id);
                
                for (p = 0; p < this.onBeforeInitMethod.length; p++) {
                    if (this[this.onBeforeInitMethod[p]]) {
                        this[this.onBeforeInitMethod[p]]();
                    }
                }
                
                WAF.eventManager.fireEvent('before init', this.id);
                initMethod.apply(this, arguments);
                WAF.eventManager.fireEvent('after init', this.id);

                for (p = 0; p < this.onAfterInitMethod.length; p++) {
                    if (this[this.onAfterInitMethod[p]]) {
                        this[this.onAfterInitMethod[p]]();
                    }
                }

                delete this.onBeforeInitMethod;
                delete this.onAfterInitMethod;
            } else {
                //method that is use only while the init widget process
                this.__getObservableAttr = function() {
                    return _observableProperty;
                }
            }
        };
    })(observableAttr);
    
    widFn.prototype = prot;
    WAF.widget[widgetName] = widFn;
}
