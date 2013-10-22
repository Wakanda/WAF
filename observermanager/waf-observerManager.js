/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


WAF.observerManager = (function() {
    var observerStorage = {};
    var api = {};
    
    api.addObserver = function(args) {

        
        var obsrvr = args.observer;
        var target = args.target;
        var prop = args.property || null;
        var eventKind = args.event;
        
        if (obsrvr instanceof WAF.Observer) {
            console.log('addEVENT', obsrvr);
            
            if (!(eventKind in observerStorage)) {
                observerStorage[eventKind] = {};
            }
            
            if (!(target in observerStorage[eventKind])) {
                observerStorage[eventKind][target] = [];
            }
            
            if (observerStorage[eventKind][target].indexOf(obsrvr) < 0) {
                observerStorage[eventKind][target].push(obsrvr);
            }
        }
    }
    
    api.notify = function(event) {
        console.log(observerStorage, event);
        if (event) {
            
            
            var target = event.target;
            var evType = event.eventType;

            if (observerStorage[evType] && observerStorage[evType][target]) {
                //console.log('founded', observerStorage[evType][targetId]);
                var obsrvrCollection = observerStorage[evType][target];
                if (obsrvrCollection) {
                    for (var i = 0; i < obsrvrCollection.length; i++) {
                        obsrvrCollection[i].notify(event);
                    }
                }
            }
        }
    }
    
    return api;
})();



WAF.defineCustom = function (widgetName) {
        WAF.define(widgetName);
    }
    
    WAF.define = function(widgetName, custom) {
        console.log('define called');
        var namespace, widgetDefinition, newWidgetDef;

        if (typeof custom == 'undefined') {
            custom = true;
        }

        if (custom) {
            namespace = WAF.customWidgets;
        } else {
            namespace = WAF.customWAFWidgets;
        }


        widgetDefinition = function() {
            var attributeStorage, methodStorage, useStorage, widgetInherited, observableAttributeStorage;

            attributeStorage = {};

            observableAttributeStorage = {};

            methodStorage = {};

            useStorage = [];

            widgetInherited;


            this.addMethod = function(name, fn) {
                methodStorage[name] = fn;
                return this;
            }

            this.addAttribute = function(name, value, observable) {

                if (attributeStorage[name] || observableAttributeStorage[name]) {
                    delete attributeStorage[name];
                    delete observableAttributeStorage[name];
                }

                if (observable) {
                    observableAttributeStorage[name] = value;
                } else {
                    attributeStorage[name] = value;
                }

                return this;
            }

            this.use = function(feature) {
                if (useStorage.indexOf(feature) < 0) {
                    useStorage.push(feature);
                }
                return this;
            }

            this.inherit = function(widget) {
                widgetInherited = widget;
                return this;
            }

            this.getAttributes = function() {
                return attributeStorage;
            }

            this.getObservableAttributes = function() {
                return observableAttributeStorage;
            }

            this.getMethods = function() {
                return methodStorage;
            }

            this.getUses = function() {
                return useStorage;
            }

            this.getInheritedWidget = function() {
                return widgetInherited;
            }


        }
        console.log('add to namespace', widgetName);
        namespace[widgetName] = newWidgetDef = new widgetDefinition();

        return newWidgetDef;
    }
    
    
    WAF.loadWidgets = function() {
        var wid, widgetDef;
        
        console.log('emit event : beforeWidgetCreation');
        WAF.initWidgetInProcess = 1;
        
        for (wid in WAF.customWidgets) {
            widgetDef = WAF.customWidgets[wid];
            if (WAF.widget[wid]) {
                continue;
            }
            WAF.buildWidgetConstructor(widgetDef, wid);
        }
        delete WAF.initWidgetInProcess;
    }