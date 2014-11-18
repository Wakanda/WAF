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
 * WAF widget global class
 *
 * @module  widget
 *
 * @class   WAF.Widget
 * @extends Object
 *
 * @author  The Wakanda Team
 * @date    august 2010
 * @version 0.1
 *
 */
/**
 * WAF Widget
 * @namespace WAF
 * @class Widget
 **/
WAF.Widget = function Widget () {
    var outWidget = null;
    outWidget = (typeof this === 'undefined') ? new WAF.Widget() : this;
    return outWidget;
};

/**
 * Generate an Id
 * @method _generateId
 * @return {string}
 */
WAF.Widget._generateId = function _generate_id(type) {
    var
    id,
    type;

    type    = type || '';
    id      = type + '' + Math.floor(Math.random()*100*100*99);

    if ($$(id)) {
        id = WAF.Widget._generateId();
    }

    return id;
};

/**
 * PUBLIC METHODS
 */      
/*
 * 
 * @namespace WAF.Widget
 * @method redraw
 */
WAF.Widget.prototype.redraw = function redraw () {
    throw new Error('method not yet implemented');
};        

/*WAF.Widget.prototype.setDatasource = function setDataSource (sourcePath, attr, preserveListener) {
    var myListeners, myListener, p, l, bindingInfo, option;
    
    preserveListener = preserveListener === undefined? true : preserveListener;
    attr = attr || {};
    myListeners = [];

    if (!sourcePath || sourcePath == '') {
        throw new Error('incorrect datasource');
    }

    for (p in attr) {
        this.config[p] = attr[p];
    }
    if (this.source) {
        for(p = 0, l = this.source._private.listeners.length; p < l; p++) {
            if (!this.source._private.listeners[p]) {
                continue;
            }
            if (this.config['id'] == this.source._private.listeners[p].id) {
                myListeners.push(this.source._private.listeners[p]);
                this.source.removeListener(this.source._private.listeners[p]);
            }
        }
    }


    bindingInfo = WAF.dataSource.solveBinding(sourcePath);

    this.source = bindingInfo.dataSource;
    if (this.source) {
        this.att = bindingInfo.dataClassAtt;
        this.sourceAtt = bindingInfo.sourceAtt;

        if (this.att !== null && typeof this.format === 'undefined') {
            this.format = this.att.defaultFormat;
        }

        if (preserveListener) {
            option = {
                listenerID : this.id,
                listenerType :this.kind,
                subID : this.config.subID ? this.config.subID : null
            };

            for(p = 0, l = myListeners.length; p < l; p++) {
                myListener = myListeners[p];
                this.source.addListener(myListener.eventKind, myListener.eventHandler, option, myListener.userData);
            }
            this.source.dispatch('onCollectionChange', {dispatcherTargetID : this.id});
        }
    }
}*/


WAF.Widget.prototype.rebuild = function() {
    var widget = WAF.config.widget,
    definition,
    lib = this.config['data-lib'],
    type = this.config['data-type'],
    component, parent, p, l;

    if (!this.domNode) {
        return false;
    }
    parent = this.domNode.parentNode;
    parent.replaceChild(this.domCloneNode, this.domNode);
    
    if (this.source) {
        for(p = 0, l = this.source._private.listeners.length; p < l; p++) {
            if (!this.source._private.listeners[p]) {
                continue;
            }
            if (this.id == this.source._private.listeners[p].id) {
                this.source.removeListener(this.source._private.listeners[p]);
            }
        }
        delete this.source;
    }
    delete WAF.widgets[this.id];
    
    definition = widget[lib][type];
    definition.onInit(this.initConf);
    component = WAF.widgets[this.id];
    
    if (component._callResizeEvents) {
        component._callResizeEvents('on');            
    }
    
    if (component.ready) {
        component.ready();
    }
    
    if (component.source) {
        component.source.dispatch('onCollectionChange', {dispatcherTargetID : component.id});
        component.source.dispatch('onCurrentElementChange', {dispatcherTargetID : component.id});
    }
}
        
/*
 * 
 * @namespace WAF.Widget
 * @method render
 */
WAF.Widget.prototype.render = function render (node) {
    throw new Error('method not yet implemented');    
};    
        
/*
 * 
 * @namespace WAF.Widget
 * @method move
 * @param {String} left left postion (in px)
 * @param {String} top top postion (in px)
 */
WAF.Widget.prototype.move = function move (left, top) {    
    this.setLeft(left);
    this.setTop(top);
};
 
/**
 * Check if a widget is visible
 * @namespace WAF.Widget
 * @method isVisible
 */
WAF.Widget.prototype.isVisible = function is_visible (  ) {
    this._isVisible = this.$domNode.css('visibility') == 'hidden' || this.$domNode.css('display') == 'none' ? false : true; 

    return this._isVisible;
}      

        
/*
 * Shox/Hide a widget
 * @namespace WAF.Widget
 * @method show
 */
WAF.Widget.prototype.toggle = function toggle ( type ) {
    if (!this.isVisible()) {
        this.show();
    } else {
        this.hide(type);
    }
};  

/*
 * Show a widget
 * @namespace WAF.Widget
 * @method show
 */
WAF.Widget.prototype.show = function show () {
    var labels = $('[for = ' + this.id + ']');
    var dateIcon = $('img[src="/waLib/WAF/widget/png/date-picker-trigger.png?id=' + this.id + '"]');
    
    
    if (this._hideType == 'visibility') {
        if (labels.length > 0) {
            $(labels[0]).css('visibility', 'visible');                    
        } 
        if (dateIcon.length > 0) {
            dateIcon.css('visibility', 'visible');                    
        }
        
        this.$domNode.css('visibility', 'visible');

        /*
         * Display forced hidden children
         */
        $.each(this.$domNode.find('*'), function(){
            var
            that;

            that = $(this);

            if (that.data('hasBeenHidden')) {
                that.css('visibility', 'visible');
            }
        });
    } else {
        if (labels.length > 0) {
            $(labels[0]).show();                        
        } 
        
        if (dateIcon.length > 0) {
            dateIcon.show();                    
        }
        
        this.$domNode.show();
    }     

    // hack for widgets that calculate width/height when object is hidden (for now, only applied to radioGroup)
    // fixes #WAK0084415
    if (this.config['data-hideonload'] === 'true') {
        this.getChildren().forEach(function(child) {
            if (typeof child !== 'undefined' && child.config['data-type'] === 'radioGroup') {
                child.rebuild();
            }
        });
    }
    
    this._isVisible = true;   
};
    
           
/*
 * Hide a widget 
 * @namespace WAF.Widget
 * @method hide
 */
WAF.Widget.prototype.hide = function hide ( type ) {
    var labels = $('[for = ' + this.id + ']');
    var dateIcon = $('img[src="/waLib/WAF/widget/png/date-picker-trigger.png?id=' + this.id + '"]');
    var jQueryObj = this.$domNode;
    if (type && type == 'visibility') {
        this._hideType = 'visibility';
        if (labels.length > 0) {
            $(labels[0]).css('visibility', 'hidden');                        
        } 
        
        if (dateIcon.length > 0) {
            dateIcon.css('visibility', 'hidden');
        }
        
        this.$domNode.css('visibility', 'hidden');    

        /*
         * Force visibility hidden on visible children
         */
        $.each(this.$domNode.find('*'), function(){
            var
            that;

            that = $(this);

            if (this.style.visibility == 'visible') {
                that
                .css('visibility', 'hidden')
                .data('hasBeenHidden', true);
            }
        });
    
    } else {
        this._hideType = 'display';
        if (labels.length > 0) {
            $(labels[0]).hide();                        
        } 
        
        if (dateIcon.length > 0) {
            dateIcon.hide();
        }

        this.$domNode.hide();  
    }
    
    if (jQueryObj.hasClass('hasDatepicker')) {
        jQueryObj.datepicker('hide');
    }

    this._isVisible = false;
};    
        
/*
 * 
 * @namespace WAF.Widget
 * @method destroy
 */
WAF.Widget.prototype.destroy = function destroy () {
    var childrens = this.getChildren(),
    length = childrens.length,
    i = 0,
    children = null;
    
    // remove listener to datasource if any
    if (this.source && this.source.removeListener) {
        this.source.removeListener({
            widgetId:this.id
        });
    }
    if (this.sourceAtt && this.sourceAtt.removeListener) {
        this.sourceAtt.removeListener({
            widgetId:this.id
        });;
    }
    if (this.sourceOut && this.sourceOut.removeListener) {
        this.sourceOut.removeListener({
            widgetId:this.id
        });
    }
    
    for (i = 0; i < length; i++) {
        children = childrens[i];                
        if (children.id) {
            if (WAF.widgets[children.id] && WAF.widgets[children.id].destroy) {
                WAF.widgets[children.id].destroy();
            }
        }
    }
    
    delete WAF.widgets[this.id];
    
    this.$domNode.remove();
};
        
        
/*
 * 
 * @namespace WAF.Widget
 * @method addListener
 * @param {String} event event name
 * @param {Function} callback callback
 * @param {JSON} options options
 * 
 */
WAF.Widget.prototype.addListener = function addListener (event, callback, options) {
    if (typeof options === 'undefined') {
        this.$domNode.bind(event, callback);
    } else {
        this.$domNode.bind(event, options, callback);
    }    
};
        
        
/*
 * 
 * @namespace WAF.Widget
 * @method removeListener
 * @param {String} event event name
 * @param {Function} callback callback
 */
WAF.Widget.prototype.removeListener = function removeListener (event, callback) {
    if (typeof callback === 'undefined') {
        this.$domNode.unbind(event);
    } else {
        this.$domNode.unbind(event, callback);
    }  
};
        
        
/*
 * 
 * @namespace WAF.Widget
 * @method setTabIndex
 * @param {String} index  
 */
WAF.Widget.prototype.setTabIndex = function setTabIndex (index) {
    throw new Error('method not yet implemented');
};

/*
 * 
 * @namespace WAF.Widget
 * @method setTabIndex
 * @param {String} index  
 */
WAF.Widget.prototype.setTabIndex = function getTabIndex () {
    throw new Error('method not yet implemented');
};
        
        
/*
 * 
 * @namespace WAF.Widget
 * @method focus
 * @param {boolean} active : add/remove focus on the widget
 */
WAF.Widget.prototype.focus = function focus (active) {
    var htmlObject = this.$domNode;
    
    if (typeof active === 'undefined') {
        active = true;
    }
  
    if (active) {
        htmlObject.focus();
        htmlObject.addClass("waf-state-focus");
    } else {
        htmlObject.blur();
        htmlObject.removeClass("waf-state-focus");
    }
};
        
        
/*
 * 
 * @namespace WAF.Widget
 * @method hasFocus
 */
WAF.Widget.prototype.hasFocus = function hasFocus () {
    return this.$domNode.is(':focus');
};
        
        
/*
 * 
 * @namespace WAF.Widget
 * @method setTextColor
 * @param {String} color color of the background
 */
WAF.Widget.prototype.setTextColor = function setTextColor (color) {
    switch (this.kind) {
        case 'dataGrid':
            $('#' + this.renderId).css('color', color);
            break;
        default:
            this.$domNode.css('color', color);
            break;
    }
};
        
        
/*
 * 
 * @namespace WAF.Widget
 * @method setBackgroundColor
 * @param {String} color color of the background
 */
WAF.Widget.prototype.setBackgroundColor = function setBackgroundColor (color) {  
    switch (this.kind) {
        case 'dataGrid':
            $('#' + this.renderId + ' .waf-dataGrid-body').css('background-color', color);
            break;
        default:
            this.$domNode.css('background-color', color);
            break;
    }           
};
    

/*
 * Called when the widget is resized
 * @namespace WAF.Widget
 * @method _callResizeEvents
 * @param {String} type 
 * @param {Event} event (if any)
 */
WAF.Widget.prototype._callResizeEvents = function resize (type, event) { 
    var that = null,
    events = null,
    htmlObject = null;
            
    that        = this;
    events      = WAF.events[that.id];
    htmlObject  = $(that.containerNode);
            
    type        = type || 'on';
    
    $(that).trigger('widgetResize', [type]);
            
    /*
     * Execute custom method
     */    
    switch(type) {
        case 'on':
            if (that.onResize) {
                that.onResize(event);
            }

            break;
                    
        case 'start':
            if (that.startResize) {
                that.startResize(event);
            }

            break;
                    
        case 'stop':
            if (that.stopResize) {
                that.stopResize(event);
            }

            break;
    }

    /*
     * Execute resize event
     */
    if (events) {
        $.each(WAF.events[that.id], function () {
            if (
                ( this.name == 'onResize'    && type == 'on' )
                ||  ( this.name == 'startResize' && type == 'start' )
                ||  ( this.name == 'stopResize'  && type == 'stop' ) ) {
                this.fn(event);
            }
        });
    }
    
    if (WAF.PLATFORM.modulesString != "mobile") {
        
        $.each(htmlObject.children(), function() {
            var
            child,
            childWidget,
            checkResize;

            child       = $(this);
            childWidget = $$(child.prop('id'));
                    
            if (childWidget && childWidget._checkResize) {
                        
                /*
                 * Check if the children is resizable (depending on constraints)
                 */
                checkResize = childWidget._checkResize();

                if (childWidget && (checkResize.x == true || checkResize.y == true) && childWidget._callResizeEvents) {
                    childWidget._callResizeEvents(type, event);
                }
            }
        });       
    }        
    
}; 

/*
 * Enable resize
 * @namespace WAF.Widget
 * @method resizable
 * @param {boolean} active : add/remove resizable on the widget
 */
WAF.Widget.prototype.resizable = function (active) {
    var 
    that,
    htmlObject;
    
    htmlObject  = '';
    that        = this;
    active      = typeof(active) != 'undefined' ? active : true;
    htmlObject  = $(this.containerNode);
            
    if (active && this._callResizeEvents) {
        htmlObject.resizable({                
            start : function(e) {
                that._callResizeEvents('start', e);
            },
            resize : function(e) {
                that._callResizeEvents('on', e);
            },
            stop : function(e) {
                that._callResizeEvents('stop', e);
            }
        });
    } else {
        htmlObject.resizable('destroy');
    }      
} 


/*
 * Enable draggable
 * @namespace WAF.Widget
 * @method draggable
 * @param {boolean} active : add/remove draggable on the widget
 * @param {boolean} doNotSetFlag: set to true to leave the internal draggable flag untouched
 */
WAF.Widget.prototype.draggable = function draggable (active, doNotSetFlag) {
    var 
    htmlObject;
    
    htmlObject  = null;
    active      = typeof(active) != 'undefined' ? active : true;
    
    htmlObject  = $(this.containerNode);
            
    if (this.kind != 'autoForm' && this.kind != 'queryForm' && active != false) {
        htmlObject.css('cursor', 'pointer');
    } else {
        htmlObject.css('cursor', '');
    }
    
    var isDisabled = (typeof this.isDisabled == "function") ? this.isDisabled() : false;   
            
    if (active && !isDisabled) {
        htmlObject.draggable({
            start : function (event, ui){             
                var label = $$(this.id).getLabel();
                
                if (label) {
                    this._posLabelBeforeDrag = {
                        top  : parseInt(label.$domNode.css('top'), 10),
                        left : parseInt(label.$domNode.css('left'), 10)                        
                    }
                }                              
                this._zindexBeforeDrag = $(this).css('zIndex');                                
            },
            drag: function(event, ui) {  
                var label = $$(this.id).getLabel(),
                originalPosition = ui.originalPosition,
                newPosition = ui.position,
                difLeft = newPosition.left - originalPosition.left,
                difTop = newPosition.top - originalPosition.top,
                labelLeft = 0,
                labelTop = 0;
                                              
                if (label && this._posLabelBeforeDrag) {                                        
                    labelTop  = this._posLabelBeforeDrag.top + difTop;
                    labelLeft = this._posLabelBeforeDrag.left + difLeft
  
                    label.$domNode.css('left', labelLeft + 'px');
                    label.$domNode.css('top', labelTop + 'px');
                } 
            },
            stop : function (event, ui){
                $(this).css('zIndex', this._zindexBeforeDrag);                                
            },
            cancel : ".waf-widget-body,input,textarea,button,select,option",
            stack   : '.waf-widget',
            zIndex  : 99999
        }).bind('click', function(event) {  // fixes bug #WAK0083155: elements that aren't part of the cancel option (that includes imageButton, icon,...) do not cause blur to be triggered when clicked on them
            $(this).find(':focus').each(function() {
                // do not blur its own target nor elements that are parts of the same composed element (ie: combobox) since this would prevent elements from getting focus
                if (event.target !== this && (!$(event.target).parents('[data-type=combobox]')[0] || ($(event.target).parents('[data-type=combobox]')[0] !== $(this).parents('[data-type=combobox]')[0]))) {
                    $(this).blur();
                }
            });
        });
        
        if (doNotSetFlag !== true) {
            this._draggable = true;
        }        
    } else {
        htmlObject.draggable('destroy');
        
        if (doNotSetFlag !== true) {
            this._draggable = false;
        }
    }
}

/**
 * Return the value with its format applyed
 * @namespace WAF.Widget
 * @method getFormattedValue
 * @param {String} value
 * @return {String}
 * @private
 **/ 
WAF.Widget.prototype.getFormattedValue = function getFormattedValue (value, encode) {
    var test = '',
    result = '';
        
    if (value === undefined) {
        if (this.sourceAtt == null) {
            if (this.att != null && this.source.getAttribute(this.att.name)){
                value = this.source.getAttribute(this.att.name).getValue();
            }
        } else {
            value = this.sourceAtt.getValue();
        }
    }

    /*
     * Format widget value depending on attribute format 
     */
    if (this.sourceAtt && this.format && !this.format.format) {
        this.format = this.sourceAtt.dataClassAtt.defaultFormat;
    }
                
    if (typeof (value) == 'number') {
        result = WAF.utils.formatNumber(value, this.format);
    } else if (this.att && this.att.type == 'date') {
        result = WAF.utils.formatDate(value,this.format);
    } else if (this.att && this.att.type == 'image') {
        if (value) {
            if (value.__deferred) {
                value = value.__deferred.uri;
            } else {
                value = value[0].__deferred[0].uri; 
            }				
        } else {
            value = '';
        }
        result = value;
    } else if (typeof (value) == 'string') {
        result = WAF.utils.formatString(value, this.format);
        if (this.kind === 'textField') {
        //result = value;
        } else{
            if (encode != false) {
                result = htmlEncode(result, true, 4);
            } 
        /*else {
                result = value;
            }*/
        }
    } else {
        if (value == null){
            result = '';
        } else{
            result = String(value);
        }
    }
        
    return result;
}                                           

/**
 * Set the current theme of the widget
 * @namespace WAF.Widget
 * @method addClass
 * @return {String}
 **/ 
WAF.Widget.prototype.addClass = function(theme) {
    this.$domNode.addClass(theme);
}

/**
 * Set the current theme of the widget
 * @namespace WAF.Widget
 * @method removeClass
 * @return {String}
 **/ 
WAF.Widget.prototype.removeClass = function(theme) {
    this.$domNode.removeClass(theme);
}

/**
 * et the value showned by the widget, if any
 * @namespace WAF.Widget
 * @method getValue
 * @return {String}
 **/ 
WAF.Widget.prototype.getValue = function () {
    var value = '',
    kind = this.kind;      
     
    switch (kind) {
        case 'combobox':
            value = $('#' + this.id + ' select').val();
            break;
            
        case 'richText':
            value = this._value;
            break;

        case 'checkbox':
            if (this.$domNode.hasClass('waf-state-selected')) {
                value = 'checked';
            }
            break;

        case 'radioGroup':

            value = $('#' + this.id + ' .waf-state-selected input').val();
            break;

        case 'label':
            value = this.$domNode.text();
            break;

        default:
            value = this.$domNode.val();
            break;
    }
        
    return value;
}

/**
 * Set the value to a widget
 * @namespace WAF.Widget
 * @method setValue
 * @return {String}
 **/ 
WAF.Widget.prototype.setValue = function (value) {
    var kind = this.kind,
    noChange = false;

    switch (kind) {
        case 'combobox':
            $('#' + this.id + ' select').combobox('setValue' , value);
            break;

        case 'richText':
            this.$domNode.text(value);
            break;

        case 'checkbox':
            if (value == 'checked') {
                this.$domNode.addClass('waf-state-selected');
            } else {
                this.$domNode.removeClass('waf-state-selected');
            }
            break;

        case 'radioGroup':
            var radio = $('#' + this.id + ' [value="' + value + '"]');

            this.$domNode.find('input[type=radio]:checked').attr('checked', false);

            // in case we try to check an unknown radio value we simply do nothing
            if (radio.length) {
                radio.prop('checked', 'checked');            
                this.$domNode.find('.waf-radio').removeClass('waf-state-selected');
                // if $$('radioGroup').setValue() is called on documentLoad, the html isn't ready yet
                // so the <li> gets the class added instead of the parent <div> (which is added later in the widget creation
                // This later breaks setValue()
                if (radio.parent().is('div')) {
                    radio.parent().addClass('waf-state-selected');
                }
                this._value = value;
            } else if (typeof value === 'string' && value.length === 0) {
				// in case we're clearing the radio group we need to remove all entries and set the value to undefined (default value
				// when no element is selected in the radioGroup
				this.$domNode.find('input[type=radio]').remove();
				this.$domNode.find('.waf-radio').remove();

				this._value = undefined;
            } else{
                noChange = true;
            }
            break;

        case 'slider':
            this.$domNode.slider('value', value);
            break;

        case 'label':
            this.$domNode.text(value);
            break;

        default:
            this.$domNode.val(value);
            break;
    }
    /*
     * Trigger change event
     * FIXME: does it make sense to trigger change if oldValue == newValue ?
     */
    if (noChange === false) {
        this.$domNode.trigger('change');
    }
}
    
    
/*
 * Check if a widget is resizable depending on its position constraints
 * @namespace WAF.Widget
 * @method checkResize
 * @return {object}
 */
WAF.Widget.prototype._checkResize = function checkResize() {
    var result = '',
    htmlObject = '';
            
    htmlObject  = $(this.containerNode);
    result      = {};         
            
    if (htmlObject.attr('data-constraint-right') == 'true' && htmlObject.attr('data-constraint-left') == 'true') {
        result.x = true;
    }
            
    if (htmlObject.attr('data-constraint-top') == 'true' && htmlObject.attr('data-constraint-bottom') == 'true') {
        result.y = true;
    }            
            
    return result;
}

/*
 * Get the error div of the widget
 * @namespace WAF.Widget
 * @method getErrorDiv
 * @return {JQueryObj}
 */
WAF.Widget.prototype.getErrorDiv = function() {
    var div = this.errorDiv;
    
    if (typeof div === 'string') {
        if (div == '') {
            div = null;
        } else {
            div = $('#' + div);
        }
    }
    
    return div;
}
    
/*
 * Set the error div of the widget
 * @namespace WAF.Widget
 * @method setErrorDiv
 * @param {string}
 */  
WAF.Widget.prototype.setErrorDiv = function (div) {
    if (typeof div === 'string') {
        if (div == '') {
            div = null;
        } else {
            div = $('#' + div);
        }
    }
    
    this.errorDiv = div;
}

/*
 * @namespace WAF.Widget
 * @method setLabelText
 * @result {Widget.widget.Label} Label
 */  
WAF.Widget.prototype.setLabelText = function (value) {    
    if (this.kind == 'button') {
        this.$domNode.text(value);                        
    } else {                    
        var labels = $('[for = ' + this.id + ']');
    
        if (labels.length > 0) {
            $(labels[0]).text(value);                        
        }   
    }
}


/*
 * @namespace WAF.Widget
 * @method setLabelTextColor
 * @result {Widget.widget.Label} Label
 */  
WAF.Widget.prototype.setLabelTextColor = function (value) {
    var labels = $('[for = ' + this.id + ']');
    
    if (labels.length > 0) {
        $(labels[0]).css('color', value);                        
    } 
}


/*
 * @namespace WAF.Widget
 * @method getLinks
 * @result {Array} List of linked widgets
 */  
WAF.Widget.prototype.getLinks = function () {
    var
    i,
    attr,
    widget,
    widgets,
    linkedTags,
    linkedTagsLength;
    
    attr = this.$domNode.attr('data-linked-tag');
    
    if (attr) {
        linkedTags          = attr.split(',');
        widgets             = [];
        linkedTagsLength    = linkedTags.length;
        
        for (i = 0; i < linkedTagsLength; i += 1) {
            widget = $$(linkedTags[i]);
            
            if (widget) {
                widgets.push($$(linkedTags[i]));
            }
        }
    }
    
    return widgets;
}

/**
 * link a widget with an other one
 * @namespace WAF.Widget
 * @method link
 * @param {object} widget : widget to link with
 */  
WAF.Widget.prototype.link = function (widget) {
    var
    attr,
    value;
    
    attr = this.$domNode.attr('data-linked-tag');
    
    value = attr ? attr + ',' + widget.id : widget.id; 
    
    this.$domNode.attr('data-linked-tag', value);
}

/**
 * unlink a widget from an other one
 * @namespace WAF.Widget
 * @method unlink
 * @param {object} widget : widget to link with
 */  
WAF.Widget.prototype.unlink = function (widget) {
    var
    i,
    list,
    attr,
    value,
    newList,
    listLength;
    
    newList     = [];
    attr        = this.$domNode.attr('data-linked-tag');
    
    list        = attr.split(',');    
    listLength  = list.length;
    
    for (i = 0; i < listLength; i += 1) {
        if (list[i] != widget.id) {
            newList.push(list[i]);
        }
    }
    
    this.$domNode.attr('data-linked-tag', newList.join(','));
}

/**
 * Set the width of the widget
 * @namespace WAF.Widget
 * @method setWidth
 * @param {number} value : width value
 */  
WAF.Widget.prototype.setWidth = function (value) {
    /*
     * Set dom node width
     */
    this.$domNode.width(value);
    
    /*
     * Call resize function
     */
    if (this._callResizeEvents) {
        this._callResizeEvents('stop');
    }
}

/**
 * Set the height of the widget
 * @namespace WAF.Widget
 * @method setHeight
 * @param {number} value : height value
 */  
WAF.Widget.prototype.setHeight = function (value) { 
    /*
     * Set dom node height
     */
    this.$domNode.height(value);
    
    /*
     * Call resize function
     */
    if (this._callResizeEvents) {
        this._callResizeEvents('stop');
    }
}

/**
 * Set the height and the height of the widget
 * @namespace WAF.Widget
 * @method resize
 * @param {number} width
 * @param {number} height
 */  
WAF.Widget.prototype.resize = function (width, height) {   
    /*
     * Set dom node width
     */
    this.$domNode.width(width);
    
    /*
     * Set dom node height
     */
    this.$domNode.height(height);
    
    /*
     * Call resize function
     */
    if (this._callResizeEvents) {
        this._callResizeEvents('stop');
    }
}

/**
 * Get the width of the widget
 * @namespace WAF.Widget
 * @method getWidth
 * @return {number} width value
 */  
WAF.Widget.prototype.getWidth = function (includeMargin) {
    if (includeMargin === true) {
        return this.$domNode.outerWidth(true);
    } else {
        return this.$domNode.outerWidth();
    }
}

/**
 * Get the height of the widget
 * @namespace WAF.Widget
 * @method getHeight
 * @return {number} height value
 */  
WAF.Widget.prototype.getHeight = function () {
    return this.$domNode.outerHeight();
}

/**
 * Get the position info
 * @namespace WAF.Widget
 * @method getPosition
 * @return {object} left, top, bottom, right
 */  
WAF.Widget.prototype.getPosition = function () {
    var left = this.$domNode.css('left'),
    top = this.$domNode.css('top'),
    bottom = this.$domNode.css('bottom'),
    right = this.$domNode.css('right');

    if (left === 'auto') {
        left = this.$domNode.offset().left;
    }
    if (top === 'auto') {
        top = this.$domNode.offset().top;
    }
    if (bottom === 'auto') {
        bottom = $(window).height() - this.$domNode.offset().top - this.$domNode.outerHeight(false);
    }
    if (right === 'auto') {
        right = $(window).width() - this.$domNode.offset().left - this.$domNode.outerWidth(false);
    }
        
    return {
        left    : parseInt(left, 10),
        top     : parseInt(top, 10),
        bottom  : parseInt(bottom, 10),
        right   : parseInt(right, 10)
    }
}


/**
 * Set a widget parent to another widget
 * @method setParent
 * @param {object} widget : widget to define as parent
 */
WAF.Widget.prototype.setParent = function setParent (widget) {
    if (widget) {
        this.$domNode.appendTo(widget.$domNode);
    }
}; 

/**
 * Add a child widget to another widget
 * @method addChild
 * @param {object} widget : widget to define as child
 */
WAF.Widget.prototype.addChild = function setParent (widget) {
    if (widget) {
        widget.$domNode.appendTo(this.$domNode);
    }
}; 

/**
 * Add children widgets to another widget
 * @method addChildren
 */
WAF.Widget.prototype.addChildren = function setParent () {
    var
    i,
    widget,
    argumentsLength;

    argumentsLength = arguments.length;
        
    if (argumentsLength > 0) {
        for (i = 0; i < argumentsLength; i += 1) {
            widget = arguments[i];
            if (widget) {
                widget.$domNode.appendTo(this.$domNode);
            }
        }
    }
}; 

/**
 * Move a widget to indicated position
 * @method _moveTo
 * @param {string} type : type of the position (left, top, right, bottom)
 * @param {number} pos : position
 * @param {boolean} moveLabel : true to also move label
 */
WAF.Widget.prototype._moveTo = function move_to (type, pos, moveLabel) {
    var
    diff,
    label,
    newPos,
    oldPos,
    marginLeft = 0,
    marginTop = 0,
    labelHtml;
    
    pos = pos == 'auto' ? pos : pos || pos == 0 ? parseInt(pos) + 'px' : 'auto';
    
    oldPos = type == 'left' || type == 'right' ? this.$domNode.offset().left : this.$domNode.offset().top;
        
    if (pos != 'auto') {
        switch(type) {
            case 'left':
                this.setRight('auto', false);
                break;
                
            case 'top':
                this.setBottom('auto', false);
                break;
                
            case 'bottom':
                this.setTop('auto', false);
                break;
                
            case 'right':
                this.setLeft('auto', false);
                break;
        }
    }
    
    this.$domNode.css(type, pos); 
    
    
    /*
     * Also move label if exists
     */
    if (this.label && moveLabel !== false) {
        labelHtml   = $(this.label);
        label       = $$(labelHtml.prop('id'));
        
        if ( type == 'left' || type == 'right' ) {
            newPos = this.$domNode.offset().left;
            diff =  newPos - oldPos;
            marginLeft = parseInt(this.$domNode.parent().css('border-left-width'), 10);
            label.setLeft(label.$domNode.offset().left - this.$domNode.offsetParent().offset().left + diff - marginLeft); 
        } else {
            newPos = this.$domNode.offset().top; 
            diff =  newPos - oldPos;
            marginTop = parseInt(this.$domNode.parent().css('border-top-width'), 10);
            label.setTop(label.$domNode.offset().top - this.$domNode.offsetParent().offset().top + diff - marginTop);   
        }
    } 
}

/**
 * Set the left position of a widget
 * @method setLeft
 * @param {number} pos : position
 * @param {boolean} moveLabel : true to also move label
 */
WAF.Widget.prototype.setLeft = function setLeft (pos, moveLabel) {
    this._moveTo('left', pos, moveLabel);
}; 

/**
 * Set the top position of a widget
 * @method setTop
 * @param {number} pos : position
 * @param {boolean} moveLabel : true to also move label
 */
WAF.Widget.prototype.setTop = function setTop (pos, moveLabel) {
    this._moveTo('top', pos, moveLabel);
}; 

/**
 * Set the bottom position of a widget
 * @method setBottom
 * @param {number} pos : position
 * @param {boolean} moveLabel : true to also move label
 */
WAF.Widget.prototype.setBottom = function setBottom (pos, moveLabel) {
    this._moveTo('bottom', pos, moveLabel);
}; 

/**
 * Get the current state
 * @function getState
 * @return {string}
 */
WAF.Widget.prototype.getState = function getState () {
    if (!this._currentState) {
        this._currentState = 'default';
    }

    return this._currentState;
};

/**
 * Set the state of a widget
 * @method setState
 * @param {string} value : state value
 * @param {boolean} force : if true, will change the state, weather or not it is disabled
 */
WAF.Widget.prototype.setState = function setState (value, force) {
    var label,
        nState,
        classes,
        htmlObject;
    
    label = this.getLabel();
        
    force = force || false;
    value = value || 'default';

    if (!this._disabled || force) {
        htmlObject = this.$domNode;
        
        classes = htmlObject.attr('class');

        // do not remove 'selected' state: it has to be removed implicitly using removeState
        // see #WAK0087094
        classes = classes.replace(/(\s|^)waf-state-((?!selected)[^\s])+/g, '');
        
        // add the new state
        htmlObject.attr('class', jQuery.trim(classes) + ' waf-state-' + value);
        
        if (value && value.match(/default|state1/)) {
            this._tmpState = value;
        }
            
//        if (value == 'disabled') {
//            htmlObject.removeClass('waf-state-hover');
//            htmlObject.removeClass('waf-state-active');
//            htmlObject.removeClass('waf-state-focus');
//        }
//        
//        if (value == 'hover') {
//            htmlObject.removeClass('waf-state-active');
//            htmlObject.removeClass('waf-state-default');
//        }
//
//        if (value == 'active') {
//            htmlObject.removeClass('waf-state-hover');
//            htmlObject.removeClass('waf-state-default');
//        }
//
//        if (value == 'focus') {
//            console.log('focus, removing disabled');
//            htmlObject.removeClass('waf-state-hover');
//            htmlObject.removeClass('waf-state-default');
//            htmlObject.removeClass('waf-state-disabled');
//        }
//
//        if (value == 'default') {
//            htmlObject.removeClass('waf-state-hover');
//            htmlObject.removeClass('waf-state-active');
//            htmlObject.removeClass('waf-state-focus');
//            htmlObject.removeClass('waf-state-disabled');
//
//            this._tmpState = nState;
//        }            
//                
//        if (value == 'state2') {
//            htmlObject.removeClass('waf-state-state3');
//        }
//
//        if (value == 'state3') {
//            htmlObject.removeClass('waf-state-state2');
//        }
//
//        if (value == 'state1') {
//            htmlObject.removeClass('waf-state-state2');
//            htmlObject.removeClass('waf-state-state3');
//            htmlObject.removeClass('waf-state-state4');
//
//            this._tmpState = value;
//        }
    }

    if (label) {
        label.setState(value);
    }

    this._currentState = value;
}; 

/**
 * Remove a state on a widget
 * @method removeState
 * @param {string} value : state value
 */
WAF.Widget.prototype.removeState = function removeState (value) {
    this.$domNode.removeClass('waf-state-' + value);

    if (this._currentState == value) {
        this._currentState = null;
    }
    
    if (value === 'focus' && this.getLabel()) {
        this.getLabel().removeState(value);
    }
}


/**
 * Set the right position of a widget
 * @method setRight
 * @param {number} pos : position
 * @param {boolean} moveLabel : true to also move label
 */
WAF.Widget.prototype.setRight = function setRight (pos, moveLabel) {
    this._moveTo('right', pos, moveLabel);
}; 

/**
 * Check if a widget is disabled or not
 * @function isDisabled
 * @return {boolean}
 */
WAF.Widget.prototype.isDisabled = function isDisabled () {
    var
    result;

    result = false;

    if (this.$domNode.hasClass('waf-state-disabled') || this._disabled) {
        result = true;
    }

    return result;
}

/**
 * Disable the widget
 * @method disable
 */
WAF.Widget.prototype.disable = function disable () {
    var
    i,
    evt,
    label,
    child,
    children,
    tmpEvents,
    childrenLength;

    /*
     * To prevent dbl disable
     */
    if (this.isDisabled()) {
        return;
    } else {
        $(this.containerNode).css('pointer-events', 'none');
    }

    this._disabled  = true;
    label           = this.getLabel();

    /*
     * Add disable class & disabled attribute
     */
    this.$domNode
    .addClass('waf-state-disabled')
    .prop('disabled', 'disabled');    

    /*
     * Disable widget's events
     */
    this._tmpEvents = [];
    tmpEvents       = $._data(this.$domNode, 'events');

    for (i in tmpEvents) {
        evts = tmpEvents[i];

        for (var j = 0; j < evts.length; j += 1) {
            this._tmpEvents.push(evts[j]);
        }

        this.$domNode.off(i);
    }

    /*
     * Also disable children
     */
    children        = this.getChildren();
    childrenLength  = children.length;

    for (i = 0; i < childrenLength; i += 1) {
        child = children[i];
        child.disable();
    }

    /*
     * Also disable label
     */
    if (label) {
        label.disable();
    }

    // if widget is disabled, then it should not be draggable either
    this.draggable(false, true);
}; 

/**
 * Enable the widget
 * @method setReadOnly
 */
WAF.Widget.prototype.setReadOnly = function setReadOnly(value){
    this.$domNode[0].readOnly = value;
}

/**
 * Enable the widget
 * @method isReadOnly
 */
WAF.Widget.prototype.isReadOnly = function isReadOnly(){
    return this.$domNode[0].readOnly === true;
}


/**
 * Enable the widget
 * @method enable
 */
WAF.Widget.prototype.enable = function enable () {
    var
    i,
    evt,
    label,
    child,
    children,
    tmpEvents,
    childrenLength;

    /*
     * To prevent dbl enable
     */
    if (!this.isDisabled()) {
        return;
    } else {
        $(this.containerNode).css('pointer-events', '');
    }

    this._disabled  = false;
    label           = this.getLabel();

    /*
     * Remove disable class & disabled attribute
     */
    this.$domNode
    .removeClass('waf-state-disabled')
    .removeProp('disabled');    

    /*
     * Enable widget's events
     */
    for (i = 0; i < this._tmpEvents.length; i += 1) {
        evt = this._tmpEvents[i];

        this.$domNode.on(evt.type, evt.handler);
    }      

    /*
     * Also enable children
     */
    children        = this.getChildren();
    childrenLength  = children.length;

    for (i = 0; i < childrenLength; i += 1) {
        child = children[i];
        child.enable();
    }

    /*
     * Also enable label
     */
    if (label) {
        label.enable();
    }
    
    // we need to make the widget draggable again
    if (this._draggable === true) {
        this.draggable(true, true);
    }
}; 

/**
 * Initialize the widget
 * @namespace WAF.Widget
 * @method init
 * @param {Object} inClassName inConfiguration of the widget
 * @param {Object} inConfig inConfiguration of the widget
 **/
WAF.Widget.prototype.init = function init (inClassName, inConfig) {    
    var 
    itemName, 
    item,
    binding,
    bindingInfo,
    id,
    i,
    widget,
    resizeWidgets,
    resizableWidgets; 
    
     
    itemName            = '';
    item                = '';
    binding             = '';
    bindingInfo         = '';
    id                  = '';
    widget              = '';
    resizeWidgets       = '';
    resizableWidgets    = '';
    
    
    if (typeof inConfig === 'undefined') {
        throw new Error('inConfig not defined');
    }
    
    function getUuidlet () {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }    
            
    /**
     * The id of the widget
     * @namespace WAF.Widget
     * @property id
     * @type String
     **/          
    if ('id' in inConfig) {
        this.id = inConfig.id;
    } else {
        this.id = inClassName.toLowerCase() + '-' + getUuidlet() + '-' + getUuidlet() + '-' + getUuidlet() + '-' + getUuidlet() + getUuidlet() + getUuidlet();  
    }
    
    /**
     * The kind of the widget
     *
     * @property kind
     * @type String
     * @default googleMap
     **/
    if ('data-type' in inConfig) {
        this.kind = inConfig['data-type'];
    } else {        
        this.kind = inClassName.substr(0, 1).toLowerCase() + inClassName.substr(1);       
    }
        
    
    /**
     * The divID of the widget (by default the same as the id property)
     *
     * @property divID
     * @type String
     * @deprecated already defined by the id property
     **/
    this.divID = ('divID' in inConfig) ? inConfig.divID : this.id;
    
    
    /**
     * The renderId of the widget (by default the same as the id property)
     *
     * @property renderId
     * @type String
     **/
    this.renderId = ('renderId' in inConfig) ? inConfig.renderId : this.id;

    /**
     * Config as widget property to be used by the matrix
     *
     * @property config
     * @type Object
     **/
    this.config = inConfig;
    
    /**
     * The reference of the DOM node Element of the widget
     *
     * @property containerNode
     * @type HTMLElement
     **/
    this.containerNode = document.getElementById(this.id);
    
    /**
     * 
     *
     * @property domNode
     * @type Object
     **/
    this.domNode = document.getElementById(this.id);
    this.domCloneNode = this.domNode ? this.domNode.cloneNode(true) : null;
    this.initConf = inConfig;
    /**
     * 
     *
     * @property $domNode 
     * @type Object
     **/
    this.$domNode = $(document.getElementById(this.id)); 
    
    if (this.containerNode === null) {
        if ('div, span, img'.indexOf(inConfig.tagName) != -1) {
            throw new Error('Bad tagName in config !');   
        }
        this.containerNode = document.createElement('div');
    }
    
       
    /**
     * The reference of the DOM node Element of the widget
     * @namespace WAF.Widget
     * @property ref
     * @type HTMLElement
     * @todo Should be replaced by the <code>containerNode</code> property
     **/
    this.ref = this.containerNode;
        
    
    /**
     * The label widget of the current widget
     *
     * @property ref
     * @type WAF.widget.Label
     **/
    this.label = null;
    
    // on design
    for (itemName in WAF.widgets) {
        if (WAF.widgets.hasOwnProperty(itemName)) {
            item = WAF.widgets[itemName];
            if (item.type === 'label' && item.ref['for'] === this.id) {
                this.label = item;
                break;
            }
        }
    }
    
    // on runtime
    if (typeof Designer === 'undefined') {
        var labels = $('label');
        for (i = 0; i < labels.length; i++) {
            if (labels[i].getAttribute('for') == this.id) {
                this.label = labels[i];
                break;
            }
        }
    }
            
    /**
     * @property errorDiv
     */
    this.errorDiv = null;
    
    // retro compatibility
    if (typeof inConfig['data-error-div'] !== 'undefined') {
        if (inConfig['data-error-div'] != null && typeof inConfig['data-errorDiv'] === 'undefined') {
            inConfig['data-errorDiv'] = inConfig['data-error-div'];    
        }
    }
 
    /**
    * The id of the container for error information
    *
    * @property errorDiv
    * @type String|undefined
    **/
    this.errorDiv = inConfig['data-errorDiv'];
              
    /**
     * Clear the error message from the associated error display widget
     *
     * @method clearErrorMessage
     **/
    this.clearErrorMessage = function(){
        var errorobj = this.errorDiv !== '' ? document.getElementById(this.errorDiv) : null; // To prevent warning

        if (this.errorDiv && typeof this.errorDiv == "object") {
            errorobj = this.errorDiv[0];
        }

        this.$domNode.removeClass("AF_InputError");
        this.$domNode.addClass("AF_InputOK");

        /*
         * Do not execute bt methods on mobile
         */
        if (WAF.PLATFORM.modulesString !== 'mobile') {
            this.$domNode.bt();
        }

        if (errorobj != null) {
            $(errorobj).removeClass("AF_ErrorMessageWrong");
            $(errorobj).addClass("AF_ErrorMessage");
            $(errorobj).html("");
        }
    }
    
    /**
     * Display an error message from the associated error display widget
     * @namespace WAF.Widget
     * @method setErrorMessage
     * @param {Object} param Parameters
     **/          
    this.setErrorMessage = function (param) {
        var errorobj = null;

        param         = param         || {};
        param.message = param.message || ''; 
        param.tooltip = param.tooltip || false;            
                    
        if (typeof this.errorDiv === 'string') {
            if (this.errorDiv != '') { 
                errorobj = document.getElementById(this.errorDiv);
            }
        } else {
            errorobj = this.errorDiv;
        }
        
        this.$domNode.addClass("AF_InputError");
        this.$domNode.removeClass("AF_InputOK");                     

        if (errorobj != null) {
            $(errorobj).addClass("AF_ErrorMessageWrong");
            $(errorobj).removeClass("AF_ErrorMessage");
            $(errorobj).html(param.message);
        } else {
            alert(param.message);
        }
        
        if (param.tooltip) {
            /*
             * Do not execute bt methods on mobile
             */
            if (WAF.PLATFORM.modulesString !== 'mobile') {
                this.$domNode.bt(param.message, {
                    offsetParent:this.$domNode.parent()
                });
            }
            this.$domNode.parent().css('overflow', 'visible');
        }
    }
    
    
    /**
     * The representation format of the value     
     * @property format
     * @type {String|undefined}
     **/
    this.format = { 
        format: inConfig['data-format']
    };
          
    
    /**
     * isInFocus
     *
     * @property isInFocus
     * @type Boolean
     * @default false
     **/
    this.isInFocus = false;
    binding     = inConfig['data-binding'] || '';
    if (typeof Designer === 'undefined' && WAF.dataSource) {
        bindingInfo = WAF.dataSource.solveBinding(binding);
    }

    if (bindingInfo) {
        this.source = bindingInfo.dataSource;
    }
    
    if ('source' in this) {
        this.att = bindingInfo.dataClassAtt;
        this.sourceAtt = bindingInfo.sourceAtt;
        // if no format is defined, set the potential default format 
        if (this.att !== null && typeof this.format === 'undefined') {
            this.format = this.att.defaultFormat;
        }
        
    }                              
            
    // add the widget instance to the widget instance list    
    WAF.widgets[this.id] = this;
        
    /*
     * Force resize on window event
     */
    WAF.widgets._length = WAF.widgets._length || 0;
    WAF.widgets._length += 1;
    
    /*
     * When the last widget is ready
     */
    if (WAF.Widget._lastWidget == this.id && !WAF.widgets._isReady) {
        resizableWidgets = $('body').children('.waf-container[data-constraint-right],.waf-container[data-constraint-bottom],' +
            '.waf-matrix[data-constraint-right],waf-matrix[data-constraint-bottom],' +
            '.waf-splitView[data-constraint-right],waf-splitView[data-constraint-bottom],' +
            '.waf-navigationView[data-constraint-right],waf-navigationView[data-constraint-bottom],' +
            '.waf-component[data-constraint-right],.waf-component[data-constraint-bottom]');
		
        if (resizableWidgets.length == 0) {
            var component;
            component = $('body').find('.waf-component');
            if ($(window).width() &&  component.length && component.parent().length && component.parent().get(0).tagName != 'BODY') {
                resizableWidgets = component;  
            }
        } 
        /*
         * Resize widgets with constraints
         * @namespace WAF.Widget
         * @method resizeWidgets
         */
        resizeWidgets = function resizeWidgets() {
           
            $.each(resizableWidgets, function(i) {
                id      = $(this).prop('id');
                widget  = $$(id);

                if (widget && widget._callResizeEvents) {
                    widget._callResizeEvents('on');            
                }
            });
        };
        
        /*
         * Force resize on load
         */         
        setTimeout(resizeWidgets, 1);
        
        /*
         * Force resize on window resize
         */
        $(window).resize(resizeWidgets);    
        
        /*
         * To prevent bubbling
         */
        $('label').bind('click', {}, function() {
            $('#' + $(this).prop('for')).trigger('click');
            $('#' + $(this).prop('for')).select();
            return false;
        });
        
        WAF.Widget.ready();
    }
    
    if (!this.clear) {
        /*
         * Clear widgets values
         * @namespace WAF.Widget
         * @method clear
         */
        this.clear = function clear () {
            var htmlObject = null;

            htmlObject = $(this.containerNode);

            switch (this.kind) {
                case 'textField':
                    htmlObject.val('');
                    break;

                case 'richText':
                case 'container':
                    htmlObject.html('');
                    break;

                case 'slider':
                    htmlObject.slider( 'value' , 0);       
                    break;

                default:
                    // non-implemented & non-overrided clear methods will throw an exception: throw isn't useful for every widgets (ex: switchbox)
                    throw('The clear() method for the widget ' + this.kind + ' is depreciated and is likely to be removed in a future release.');
                break;
            }

        } 
    }

    // hide widget on load
    if (this.config['data-hideonload'] === 'true') {

        this.$domNode.css("visibility", "hidden");
        var that = this;
        window.setTimeout(function() {
            that.$domNode.hide();
            that.$domNode.css("visibility", "visible");
        },100);
        
        
    }
};


/**
 * Provide a Widget Class from a name, a constructor, a prototype, and a private shared object
 *
 * @namespace WAF.Widget
 * @static
 * @method provide
 *
 * @param {String} name Required. The name of the widget constructor (ex: Datagrid)
 * @param {Object} shared The private properties and methods shared between all the instances
 * @param {Function} construct Required. The constructor used to create the widget instance
 * @param {Object} proto The public shared properties and methods inherited by all the instances
 *
 * @return {Function} The constructor of the widget
 * 
 * @throw {Error} If the constructor name is not valid or if the constructor is not a function
 **/          
WAF.Widget.provide = function provide(name, shared, construct, proto, custom) {
    
    var ThisConstructor, thisPrototype, itemName, tmpConstructor;
    // Create the 'shared' private object
    shared = arguments[1];
    
    // Check the parameters validity
    
    if (typeof name !== 'string' || name.length < 2) {
        throw new Error('The constructor name is missing or too short');
    }

    if (typeof construct !== 'function') {
        throw new Error('The constructor function is missing or is not a function');
    }
    
    // Create the widget Constructor    
    
    //to get the good type WAF.customWidget or WAF.widget instead of ThisConstructor
    ThisConstructor = WAF.widget[name] = function(config, data) {

    //tmpConstructor = function() {return function (config, data) { 
        var itemName = '', 
        outWidget = null;     
        
        if (data === undefined) {
            data = {};
            for (itemName in config) {
                if (itemName.substr(0, 5) === 'data-') {
                    data[itemName.substr(5)] = config[itemName];
                }
            }
        }
        
        if (typeof this === 'undefined') {        
            outWidget = new ThisConstructor(config, data);        
        } else {       
            this.init(name, config);
            
            this.create = construct;
            this.create(config, data, shared);
            delete this.create;
            
            outWidget = this;            
        }                   
        
        /*
         * Append resizable method if defined
         */
        if (data && data.resizable == 'true' && this.kind != 'autoform') {
            this.resizable();
        }

        /*
         * Append resizable method if defined
         */  
        if (data && data.draggable == 'true') {
            this.draggable();
        }     
    
        this._shared = shared;
        
        return outWidget;      
    }//;}
    
    //var ref = custom ? WAF.customWidget : WAF.widget;
    //ThisConstructor = ref[name] = tmpConstructor();
    
    // Extend the provided Widget from WAF.Widget    
    try {
        ThisConstructor.name = name;
    } catch (e) {
        
    } 
    thisPrototype = ThisConstructor.prototype = new WAF.Widget();
    thisPrototype.constructor = ThisConstructor;
    
    // Add its own prototype properties and methods to the Constructor    
    for (itemName in proto) {
        if (proto.hasOwnProperty(itemName)) {
            thisPrototype[itemName] = proto[itemName];
        }
    }
    
    itemName = undefined;
};


/**
 * Get the label widget of the widget
 * @namespace WAF.Widget
 * @method getLabel
 * @return {object} label widget, undefined if widget has no label
 **/
WAF.Widget.prototype.getLabel = function () {
    var
    labelId;
    
    labelId = $(this.label).prop('id');
    
    return $$(labelId);
}


/**
 * Get the widget parent
 * @namespace WAF.Widget
 * @method getParent
 * @return {object} parent widget
 **/
WAF.Widget.prototype.getParent = function () {
    var
    parentHtml;
    
    parentHtml = this.$domNode.parent();
    
    return $$(parentHtml.prop('id'));
}

/**
 * Get widget children
 * @namespace WAF.Widget
 * @method getChildren
 * @return {array} list of children widgets
 **/
WAF.Widget.prototype.getChildren = function () {
    var
    widget,
    children,
    htmlObject;
    
    htmlObject  = this.$domNode;
    children    = [];

    if (this.kind && this.kind == 'component') {    
        $.each(htmlObject.children().children(), function(i) {
            widget = $$($(this).prop('id'));
        
            if (widget) {
                children.push(widget);
            }
        });
    } else {
        $.each(htmlObject.children(), function(i) {
            widget = $$($(this).prop('id'));
        
            if (widget) {
                children.push(widget);
            }
        });
    }
    
    return children;
}


/**
 * Executed when all widgets are loaded
 * @method readys
 */
WAF.Widget.ready = function () {
    var
    i,
    widget;
        
    /*
     * Add custom widgets ready
     */
    for (i in WAF.widgets) {
        widget = WAF.widgets[i];
        
        if (widget.insideComponent === true) {
            continue;
        }
        
        if (widget.ready) {         
            widget.ready(widget._shared);
        }
    }
    
    WAF.widgets._isReady = true;
}

/*
 * Open container in a panel
 * @namespace WAF
 * @method openContainerInAPanel
 * @param {String} divID
 * @param {String} config
 */
WAF.openContainerInAPanel = function openContainerInAPanel (divID, config) {
    var formdiv = '',
    already = '',
    off = '',
    h = '',
    w = '',
    title = '';
    
    formdiv = $('#'+divID);
    already = formdiv.attr('data-inPanel');
    if (already == '1') {
        if (formdiv.prop('type') == 'textarea') {
            formdiv = formdiv.parent();
        }
        formdiv.dialog('open');
    } else {	
        formdiv.attr('data-inPanel', '1');

        off = formdiv.offset();
        h = formdiv.height();
        w = formdiv.width();
		
        formdiv.css('position', 'relative');
        formdiv.css('top','0px');
        formdiv.css('left','0px');

        if (formdiv.prop('type') == 'textarea') {
            formdiv.wrap('<div></div>');
            formdiv.css('width', '100%');
            formdiv.css('height', '100%');
            formdiv = formdiv.parent();
            formdiv.css('position', 'relative');
            formdiv.css('top','0px');
            formdiv.css('left','0px');
        }
        title = config.title;
        if (title == null)  {
            title = '';
        }
        formdiv.dialog({ 
            dialogClass: 'waf-container-panel ' + formdiv.prop('class'),
            title      : title,
            position   : [off.left, off.top],
            width      : w,
            height     :h
        });
		
    }
}

/*
 * Get the last dom element to define the lastWidget
 * Get the last non-new widget
 */
Object.defineProperty(WAF.Widget, "_lastWidget", {
    get: (function() {
        var last_widget; // cache result

        return function() {
            if(last_widget) return last_widget;

            var Widget = WAF.require.modules['waf-core/widget'];
            if(!Widget)
                return last_widget = $('.waf-widget:last').prop('id');

            var widgets = $('.waf-widget');
            for(var i = widgets.length - 1; ~i; i--) {
                if(!(widgets.get(i).getAttribute('data-package') in WAF.require.modules)) {
                    return last_widget = widgets.get(i).id;
                }
            }
            return undefined;
        }
    })()
});
