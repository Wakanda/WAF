/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


WAF.behaviors = {

    'multi-editable' : {
        setMultiValue : function() {
            
        },
        getMultiValue : function() {
            
        },
        onBeforeInit : ['setMultiValue']
    },

    'single-editable' : {
        value : null,
        oldValue : null,
        setValue : function(val) {
            if (this.value != val) {
                this.oldValue = this.value;
                this.value = val;
                return true;
            } else {
                return false;
            }
        },
        getValue : function() {
            return this.value;
        }
    },  


    'visible' : {
        enable : function() {

        },
        disable : function() {
            
        },
        isDisabled : function() {
            
        }
    }, 

    'iconible' : {
        setIcon : function() {
            
        },
        setIconCoordinates : function() {
            
        },
        getIcon : function() {
            
        }
    },  

    'selectionable' : {
        isSelected : function() {        
        },
        unselect : function() {        
        },
        getSelection : function() {        
        }
    },

    'multi-selectionable' : {
        isMultiSelected : function() {        
        },
        multiUnselect : function() {        
        },
        getMultiSelection : function() {        
        }
    }, 

    'displayable' : {
        display : function() {         
        },
        setDisplayType : function() {         
            //vertical, horizontal
        },   
        setDisplayMaxValue : function () {

        },
        setDisplayMinValue : function () {
            
        }
    }, 


    'splitable' : {
        split : function() {           
        },
        splitVertical : function() {           
        },
        splitHorizontal : function() {           
        }
    }, 


    'groupable' : {
        group : function() {           
        },
        unGroup : function() {           
        }
    }, 


    'collapsible' : {
        collapse : function() {           
        },
        collapseAll : function() {           
        },
        expand : function() {           
        },
        expandAll : function() {           
        }
    },     

    'indexable' : {
        setTabIndex : function() {
            
        },
        getTabIndex : function() {
            
        }
    }, 

    'labelable' : {
        setLabel : function() {
            
        },
        getLabel : function() {
            
        }
    }, 


    'resizable' : {
        resize : function() {
            
        }
    }, 

    'rebuildable' : {
        rebuild : function() {
            
        },
        redraw : function() {
            
        }
    }, 


    'focusible' : {
        setFocus : function() {
            
        },
        hasFocus : function() {
            
        }
    },

 
    'draggable' : {
        draggable : function() {
            
        }
    },
    

    'positionable' : {
        position : function() {
            
        },
        setPosition: function() {
            
        },
        getPosition: function() {
            
        }
    }, 


   'single-layered' : {
        setSingleLayer: function(domID) {
        }        
    },
   
   'multi-layered' : {
        setFooter: function(domID) {
        },        
        setContent: function(domID) {
        },
        setHeader: function(domID) {
        }
    },


    'rendereable' : {
        htmlObjectRender : null,
        init : function() {
            //this.htmlObjectRender
            
            console.log('rendering widget');
        },
        render : function() {
            
        }
    },

    'event' : {
        fireEvent : function(eventType) {
            WAF.eventManager.fireEvent({
                event : eventType,
                target : this.id
            });
        }
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