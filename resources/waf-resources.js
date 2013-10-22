/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


WAF.resources = {
    'saisie' : {
        setValue : function() {
            
        },
        getValue : function() {
            
        },
        onBeforeInit : ['setValue']
    },
    
    'drag' : {
        draggable : function() {
            
        },
        onAfterInit : ['draggable']
    },
    

    'rendering' : {
        htmlObjectRender : null,
        map : function() {
            //this.htmlObjectRender
            console.log('rendering widget');
        },
        render : function() {
            
        },
        onBeforeInit : ['map'],
        onAfterInit : ['map']
    },
    
    'observer' : {
        observerInstance : null,
        observe : function(callback, event, id) {
            if (!(this.observerInstance instanceof WAF.Observer)) {
                this.observerInstance = new WAF.Observer();
            }
            this.observerInstance.observe(callback, event, id);
        }
    }
};