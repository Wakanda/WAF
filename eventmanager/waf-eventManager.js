/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

WAF.eventManager = {
    domNodeObserved : {
        
    },
    
    fireEvent : function(event, target) {
        console.log('EVENT fired =>', event, target);
        //var eventWAF = this.buildEvent(event, target);
        
        WAF.observerManager.notify(event, target);
    },
    
    buildEvent : function(event, target) {
        var wEvent;
        console.log('build', event);
        var targetId = target;
        
        if (targetId.indexOf('.') > 0) {
            var arr = targetId.split('.');
            targetId = arr[0];
        }
        
        
        if (typeof event == 'object' && event.type) {
            wEvent = new WAF.Event('domEvent', event.type, target, event);
        } else if (targetId in sources) {
            wEvent = new WAF.Event('dsEvent', event, target, event);
        } else if (targetId in WAF.widgets) {
            wEvent = new WAF.Event('widgetEvent', event, target, event);
        }
        console.log(wEvent);
        return wEvent;
    },
    
    observeDomNode : function(event, obj) {
        if (!this.domNodeObserved[obj] || this.domNodeObserved[obj].indexOf(event) < 0) {
            var node = obj;
            var that = this;
            if (node) {
                node.addEventListener(event, function(e) {
                    var ev = new WAF.Event({
                        target : node,
                        eventType : e.type,
                        eventKind : 'domEvent',
                        event : e
                    });
                    that.fireEvent(ev);
                }, false);
            }
            if (!this.domNodeObserved[obj]) {
                this.domNodeObserved[obj] = [];
            }
            
            this.domNodeObserved[obj].push(event);
        }
    }
};