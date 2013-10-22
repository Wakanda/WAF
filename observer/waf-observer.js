/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


WAF.Observer = function() {
    var storage = {};
    var storagePropertyChange = {};
    this.observe = function(args) {
        var fn, event, target, eventKind, property, id;
        
        fn = args.fn;
        event = args.event;
        target = args.target;
        property = args.property || null;
        
        if (!event || !target || !fn) {
            //ERROR
            return false;
        }
        
        if (target instanceof WAF.Widget2) {
            eventKind = 'widgetEvent';
            if (property) {
                eventKind = 'widgetPropertyEvent';
            }
        }
        
        if (target instanceof HTMLElement) {
            eventKind = 'domEvent';
        }
        
        if (target instanceof WAF.DataSourceEm || target instanceof WAF.DataSourceVar) {
            eventKind = 'dsEvent';
        }
        
        if (eventKind == 'widgetPropertyEvent') {
            if (!(target in storagePropertyChange)) {
                storagePropertyChange[target] = {};
            }
            
            if (!(property in storagePropertyChange[target])) {
                storagePropertyChange[target][property] = [];
            }
            
            storagePropertyChange[target][property].push(fn);
        } else {
        
            if (eventKind == 'domEvent') {
                WAF.eventManager.observeDomNode(event, target);
            }

            if (!(eventKind in storage)) {
                storage[eventKind] = {};
            }

            if (!(event in storage[eventKind])) {
                storage[eventKind][event] = {};
            }

            if (!(target in storage[eventKind][event])) {
                storage[eventKind][event][target] = [];
            }

            storage[eventKind][event][target].push(fn);
        }
        
        WAF.observerManager.addObserver({
            observer: this,
            target: target,
            event: event,
            property: property
        });
    }
    
    
    this.notify = function(event) {
        console.log('notif', storage, event);
        var callbackCollection, target, evType, eventKind, property, i;
        if (event) {
            
            target = event.target;
            evType = event.eventType;
            eventKind = event.eventKind;
            property = event.property;
            
            if (eventKind == 'widgetPropertyEvent') {
                if (storagePropertyChange[target] && storagePropertyChange[target][property]) {
                    callbackCollection = storagePropertyChange[target][property];
                }
            } else {
                if (storage[eventKind] && storage[eventKind][evType] && storage[eventKind][evType][target]) {
                    callbackCollection = storage[eventKind][evType][target];
                }
            }
            if (callbackCollection) {
                for (i = 0; i < callbackCollection.length; i++) {
                    callbackCollection[i](event);
                }
            }
        }
    }
};


    
