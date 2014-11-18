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
//// "use strict";

/*global WAF,window*/

/*jslint white: true, browser: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */

WAF.Widget.provide(
    'Dialog', 
    {
        
        classes : {
            titlebar    : {
                classname   : 'waf-widget-header waf-dialog-header',
                subwidgets  : {
                    iconimage   : 'waf-dialog-header-icon',
                    title       : 'waf-dialog-header-title',
                    buttons     : 'waf-dialog-header-buttons',
                    close       : 'waf-dialog-header-close',
                    minimize    : 'waf-dialog-header-minimize',
                    maximize    : 'waf-dialog-header-maximize'
                }
            },
            content     : {
                classname   : 'waf-widget-body waf-dialog-body'
            },
            toolbar     : {
                classname   : 'waf-widget-footer waf-dialog-footer'
            }
        },
        Z_INDEX : 100001,
        minimizedInfo : {
            height          : 28,
            width           : 165,
            'margin-top'    : 10,
            'margin-left'   : 10
        },
        minimizePosition : [],
        refreshMinimized : function(parent){
            var
            shared,
            minInfo,
            position,
            dialogSet;
            
            shared      = this;
            dialogSet   = parent.children('.waf-dialog.minimized');
            //            dialogSet   = dialogSet.reverse();
            minInfo     = shared.minimizedInfo;
            position    = {
                bottom  : minInfo['margin-top'],
                left    : minInfo['margin-left']
            };
            
            $.each(dialogSet, function(){
                var
                widget,
                htmlObj;
                
                widget  = $$($(this).prop('id'));
                htmlObj = widget.$domNode;
                
                htmlObj.css({
                    bottom  : position.bottom,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
                    left    : position.left
                });

                if(position.left + minInfo.width > parent.width()){
                    position.left   =  minInfo['margin-left'];
                    position.bottom += minInfo.height + minInfo['margin-top'];
                }
                else{
                    position.left +=  minInfo.width + minInfo['margin-left'];
                }
            })
        },
        /**
          * A Private shared Method
          *
          * @/private
          * @/shared
          * @/method privateMinimize
          * @/param {String} inWidget
          **/
        privateMinimize: function privateMinimize(inWidget) {
            var
            i,
            pos,
            utils,
            shared,
            htmlObj,
            oldInfo,
            minInfo,
            position,
            subWidgets,
            widgetParent,
            minimizePosition;
            
            shared              = this;
            minimizePosition    = shared.minimizePosition;
            minInfo             = shared.minimizedInfo;
            htmlObj             = inWidget.$domNode;
            widgetParent        = htmlObj.parent();
            oldInfo             = inWidget._private.oldInfo;
            pos                 = inWidget.getPosition();
            utils               = inWidget._private.utils;
            subWidgets          = inWidget._subWidgets();
            
            for(i = 0 ; position = minimizePosition[i] ; i++){
                if(position.parent.equals(widgetParent)){
                    
                    if(!oldInfo.minimized){
                        if(position.left + minInfo.width > widgetParent.width() && position.left != minInfo['margin-left']){
                            position.left   =  minInfo['margin-left'];
                            position.bottom += minInfo.height + minInfo['margin-top'];
                        }
                        
                        inWidget._setOldInfo({
                            height	: inWidget.getHeight(),
                            width	: inWidget.getWidth(),
                            left	: pos.left,
                            top         : pos.top,
                            right       : pos.right,
                            bottom      : pos.bottom
                        });
                        
                        htmlObj.bind({
                            click : function(e){
                                var
                                target  = e.target,
                                minBtn  = subWidgets.titlebar.subwidgets.minimize;

                                if(minBtn && target.id !== minBtn.id && target.parentElement.id !== minBtn.id){
                                    inWidget.minimizeDialog();
                                }
                            },
                            mouseover : function(){
                                htmlObj.css({
                                    opacity : 0.9
                                });
                            },
                            mouseout : function(){
                                htmlObj.css({
                                    opacity : 1
                                });
                            }
                        });
                        
                        subWidgets.titlebar.subwidgets.close && subWidgets.titlebar.subwidgets.close.$domNode.hide();
                        subWidgets.titlebar.subwidgets.minimize && subWidgets.titlebar.subwidgets.minimize.$domNode.hide();
                        subWidgets.titlebar.subwidgets.maximize && subWidgets.titlebar.subwidgets.maximize.$domNode.hide();
                        htmlObj.find('.waf-dialog-footer').css('display', 'none');
                        htmlObj.css({
                            width   : minInfo.width,
                            height  : minInfo.height,
                            top     : 'auto',
                            bottom  : position.bottom,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
                            left    : position.left,
                            cursor  : 'pointer'
                        });
                        
                        if(position.left + minInfo.width > widgetParent.width()){
                            position.left   =  minInfo['margin-left'];
                            position.bottom += minInfo.height + minInfo['margin-top'];
                        }
                        else{
                            position.left +=  minInfo.width + minInfo['margin-left'];
                        }
                        
                        if(utils.isResizable()){
                            inWidget.resizable(false);
                        }
                        if(utils.isDraggable()){   
                            inWidget.draggable(false);

                            if(subWidgets.titlebar.tag){
                                var
                                titlebar;
                                
                                titlebar = subWidgets.titlebar.tag.$domNode;
                                titlebar.css({
                                    cursor : 'pointer'
                                });
                            }
                        }
                        htmlObj.addClass('minimized');
                    }
                    
                    else{
                        htmlObj.css({
                            width   : oldInfo.width,
                            height  : oldInfo.height,
                            top     : oldInfo.top,
                            left    : oldInfo.left,
                            bottom  : oldInfo.bottom,
                            cursor  : 'auto',
                            opacity : 1
                        });
                        
                        if(utils.isResizable()){
                            utils.makeResizable();
                        }
                        if(utils.isDraggable()){   
                            utils.makeDraggable();
                        }
                        
                        htmlObj.unbind('click');
                        htmlObj.unbind('mouseover');
                        htmlObj.unbind('mouseout');
                        
                        subWidgets.titlebar.subwidgets.close && subWidgets.titlebar.subwidgets.close.$domNode.show();
                        subWidgets.titlebar.subwidgets.minimize && subWidgets.titlebar.subwidgets.minimize.$domNode.show();
                        subWidgets.titlebar.subwidgets.maximize && subWidgets.titlebar.subwidgets.maximize.$domNode.show();
                        htmlObj.find('.waf-dialog-footer').css('display', 'block');
                        position.left -= minInfo.width + minInfo['margin-left'];
                        htmlObj.removeClass('minimized');
                        
                        shared.refreshMinimized(htmlObj.parent());
                    }
                    
                    break;
                }
            }
            
            if(i === minimizePosition.length){
                
                minimizePosition.push({
                    parent  : widgetParent,
                    bottom  : minInfo['margin-top'],
                    left    : 2*minInfo['margin-left'] + minInfo.width
                });
                        
                subWidgets.titlebar.subwidgets.close && subWidgets.titlebar.subwidgets.close.$domNode.hide();
                subWidgets.titlebar.subwidgets.minimize && subWidgets.titlebar.subwidgets.minimize.$domNode.hide();
                subWidgets.titlebar.subwidgets.maximize && subWidgets.titlebar.subwidgets.maximize.$domNode.hide();
                htmlObj.find('.waf-dialog-footer').css('display', 'none');
                inWidget._setOldInfo({
                    height	: inWidget.getHeight(),
                    width	: inWidget.getWidth(),
                    left	: pos.left,
                    top         : pos.top,
                    right       : pos.right,
                    bottom      : pos.bottom
                });
                
                htmlObj.css({
                    width   : minInfo.width,
                    height  : minInfo.height,
                    top     : 'auto',
                    bottom  : minInfo['margin-top'],
                    left    : minInfo['margin-left'],
                    cursor  : 'pointer'
                });
                        
                if(utils.isResizable()){
                    inWidget.resizable(false);
                }
                if(utils.isDraggable()){   
                    inWidget.draggable(false);
                    htmlObj.css({
                        cursor : 'auto'
                    });

                    if(subWidgets.titlebar.tag){
                        titlebar = subWidgets.titlebar.tag.$domNode;
                        titlebar.css({
                            cursor : 'pointer'
                        });
                    }
                }
                
                htmlObj.bind({
                    click : function(e){
                        var
                        target  = e.target,
                        minBtn  = subWidgets.titlebar.subwidgets.minimize;

                        if(minBtn && target.id !== minBtn.id && target.parentElement.id !== minBtn.id){
                            inWidget.minimizeDialog();
                        }
                    },
                    mouseover : function(){
                        htmlObj.css({
                            opacity : 0.9
                        });
                    },
                    mouseout : function(){
                        htmlObj.css({
                            opacity : 1
                        });
                    }
                });
                htmlObj.addClass('minimized');
            }
            
            inWidget._private.oldInfo.minimized = !inWidget._private.oldInfo.minimized;
        }
    },
    function WAFWidget(config, data, shared) {
        var
        that    = this,
        classes = shared.classes,
        htmlObj = $('#' + config.id);
        
        that._private           = that._private || {};
        that._private.classes   = classes;
        that._private.shared    = shared;
        that._private.buttons   = [];
        that._private.oldInfo   = {
            maximized : false,
            minimized : false
        };
        
        $.fn.equals = $.fn.equals || function(compareTo) {
            if (!compareTo || this.length != compareTo.length) {
                return false;
            }
            for (var i = 0; i < this.length; ++i) {
                if (this[i] !== compareTo[i]) {
                    return false;
                }
            }
            return true;
        };
        
        that._private.utils = {
            isModal : function(){
                return config['data-modal'] === 'true';
            },
            isDraggable : function(){
                return config['data-draggable'] === 'true';
            },
            isResizable : function(){
                return config['data-resizable'] === 'true';
            },
            toFront     : function(){
                return config['data-front'] === 'true';
            },
            makeDraggable : function(){
                var
                utils,
                subWidgets;
                
                utils       = that._private.utils;
                subWidgets  = that._private.subWidgets;
                
                htmlObj.draggable({
                    cancel: "." + classes.content.classname + ", ." + classes.titlebar.subwidgets.close + " , ." + classes.titlebar.subwidgets.maximize + " , ." + classes.titlebar.subwidgets.maximize + " , ." + classes.titlebar.subwidgets.iconimage,
                    handle: "." + classes.titlebar.classname.split(' ')[0] + "." + classes.titlebar.classname.split(' ')[1],
                    containment: "document",
                    zIndex  : function(){
                        if(utils.isModal() ){
                             return shared['Z_INDEX'];
                        }
                        
                        return null;
                    }.call(),
                    stop: function(event, ui) {
                        if(utils.isModal() ){
                            htmlObj.css({
                                'z-index' : shared['Z_INDEX']
                            });
                        }
                    },
                    drag : function(){
                        $('.waf-dialog-ismodal').css('zIndex' , shared['Z_INDEX'])
                    }
                });
                
                htmlObj.css({
                    cursor : 'auto'
                });
                
                if(subWidgets.titlebar.tag){
                    var
                    titlebar;

                    titlebar = subWidgets.titlebar.tag.$domNode;
                    titlebar.css({
                        cursor : 'move'
                    });
                }
            },
            makeResizable : function(){
                htmlObj.resizable();
            },
            makeModal : function(){
                var
                modal,
                modalW,
                modalH;
                
                modal   = htmlObj.parent().children('.waf-dialog-fade');
                
                if(modal.length == 0){
                    modal = $('<div class="waf-dialog-fade"></div>');
                }
                
                if(config['data-hideOnOutsideClick'] == 'true'){
                    modal.click(function(){
                        $(this).parent().children('.waf-dialog-ismodal').each(function(){
                            var widget = $(this).data('widget');

                            if(widget){
                                widget.closeDialog();
                            }
                        });
                    });
                }
                
                htmlObj.css('z-index', shared['Z_INDEX']);
                htmlObj.addClass('waf-dialog-ismodal');
                htmlObj.data('widget' , that);
                
                htmlObj.parent().append(modal);
                
                switch(that.domNode.parentNode.nodeName){
                    case 'SECTION':
                        var
                        parent = htmlObj.parent().parent();
                        
                        modalW = parent.width();
                        modalH = parent.height();
                        
                        break;
                    case 'BODY':
                        modalW = '100%';
                        modalH = '100%';
                        
                        modal.css({
                            'position' : 'fixed'
                        });
                        
                        break;
                    default:
                        modalW = htmlObj.parent().width();
                        modalH = htmlObj.parent().height();
                        
                        break;
                }
                
                modal.css({
                    'filter': 'alpha(opacity=50)',
                    'width' : modalW,
                    'height': modalH
                }).fadeIn();
            },
            bringToFront : function(){
                if(this.isModal()){
                    htmlObj.css('z-index', shared['Z_INDEX']);
                }
                else{
                    htmlObj.css('z-index', '99999');
                }
            }
        }
    },
    {
        ready   : function(shared){
            var
            content,
            that,
            utils,
            config,
            classes,
            htmlObj,
            subWidgets;
            
            this._private.subWidgets = this._subWidgets(classes);
            
            classes     = this._private.classes;
            utils       = this._private.utils;
            subWidgets  = this._private.subWidgets;
            config      = this.config;
            htmlObj     = this._getHtmlObject();
            content     = subWidgets.content.tag;
            that        = this;
            
            if(utils.isDraggable()){
                utils.makeDraggable();
            }
            
            if(utils.isResizable()){
                utils.makeResizable();
            }
            
            if(utils.isModal() && config['data-hideonload'] !== 'true'){
                utils.makeModal();
            }
            
            if(utils.toFront()){
                utils.bringToFront();
            }
            
            htmlObj.find('.waf-dialog-header').trigger("drag");
            
            if(config['data-load'] && config['data-load'] != '' && content){
                var
                frame,
                bodyHTMLobj;
                
                bodyHTMLobj = content.$domNode;
                bodyHTMLobj.empty();
                frame      = $('<iframe>');
                
                frame.prop({
                    src     : config['data-load']
                });
                
                frame.addClass('waf-dialog-iframe');

                frame.appendTo(bodyHTMLobj);
            }
            
            // Auto open :
            if(config['data-hideonload'] === 'true'){
                this.closeDialog();
            }
            
            htmlObj
            .prop( "tabIndex", -1)
            .keydown(function( event ) {
                if ( !event.isDefaultPrevented() && event.keyCode && event.keyCode === $.ui.keyCode.ESCAPE ) {
                    that.closeDialog();
                    event.preventDefault();
                }
            });
            
            if(subWidgets.titlebar.subwidgets.maximize){
                WAF.addListener(subWidgets.titlebar.subwidgets.maximize.id, "click", this.maximizeDialog , "WAF");
            }
            
            if(subWidgets.titlebar.subwidgets.minimize){
                WAF.addListener(subWidgets.titlebar.subwidgets.minimize.id, "click", this.minimizeDialog , "WAF");
            }
            
            if(subWidgets.titlebar.subwidgets.close){
                WAF.addListener(subWidgets.titlebar.subwidgets.close.id, "click", this.closeDialog , "WAF");
            }
        },
        _subWidgets : function(){
            var
            res,
            linkedTags,
            classes;
            
            if(this._private && this._private.subWidgets){
                return this._private.subWidgets;
            }
            
            classes = this._private.classes;
            
            res = {
                titlebar    : {
                    tag         : null,
                    subwidgets  : {
                        iconimage   : null,
                        title       : null,
                        close       : null,
                        minimize    : null,
                        maximize    : null
                    }
                },
                content     : {
                    tag         : null
                },
                toolbar     : {
                    tag         : null
                }
            };
            
            linkedTags = this.getLinks();
            
            for(var i = 0 , widget; widget = linkedTags[i] ; i++ ){
                var
                htmlObj;
                
                htmlObj = widget.$domNode;
                widget._private = widget._private || {};
                widget._private.dialogWidget = this;
                
                if(htmlObj.hasClass(classes.titlebar.classname)){
                    res.titlebar.tag = widget;
                    continue;
                }
                
                else if(htmlObj.hasClass(classes.titlebar.subwidgets.iconimage)){
                    res.titlebar.subwidgets.iconimage = widget;
                    continue;
                }
                
                else if(htmlObj.hasClass(classes.titlebar.subwidgets.title)){
                    res.titlebar.subwidgets.title = widget;
                    continue;
                }
                
                else if(htmlObj.hasClass(classes.titlebar.subwidgets.close)){
                    res.titlebar.subwidgets.close = widget;
                    continue;
                }
                
                else if(htmlObj.hasClass(classes.titlebar.subwidgets.minimize)){
                    res.titlebar.subwidgets.minimize = widget;
                    continue;
                }
                
                else if(htmlObj.hasClass(classes.titlebar.subwidgets.maximize)){
                    res.titlebar.subwidgets.maximize = widget;
                    continue;
                }
                
                else if(htmlObj.hasClass(classes.content.classname)){
                    res.content.tag = widget;
                    continue;
                }
                
                else if(htmlObj.hasClass(classes.toolbar.classname)){
                    res.toolbar.tag = widget;
                    continue;
                }
            }
            
            this._private = this._private || {};
            this._private.subWidgets    = res;
            
            return res;
        },
        closeDialog : function(){
            var
            htmlObj,
            modal,
            dw;
            
            if(this.kind === 'dialog'){
                dw = this;
            }
            
            else if(this._private && this._private.dialogWidget){
                dw = this._private.dialogWidget; 
            }
            
            htmlObj = dw._getHtmlObject();
            modal = htmlObj.parent().children('.waf-dialog-fade');
            
            htmlObj.hide();
            
            if(htmlObj.parent().children('.waf-dialog-ismodal:visible').length == 0){
                modal.hide();
            }
        },
        displayDialog : function(){
            var
            htmlObj,
            modal,
            utils,
            dw;
            
            if(this.kind === 'dialog'){
                dw = this;
            }
            
            else if(this._private && this._private.dialogWidget){
                dw = this._private.dialogWidget; 
            }
            
            htmlObj = dw._getHtmlObject();
            utils   = dw._private.utils;
            
            if(utils.isModal()){
                utils.makeModal();
            }
            
            htmlObj.show();
        },
        destroy : function(){
            var childrens = this.getChildren(),
            length = childrens.length,
            i = 0,
            children = null;
            
            for (i = 0; i < length; i++) {
                children = childrens[i];                
                if (children.id) {
                    delete WAF.widgets[children.id];
                }
            }
    
            delete WAF.widgets[this.id]
    
            this.$domNode.remove();
            this.$domNode.parent().children('.waf-dialog-fade').hide();
        },
        maximizeDialog : function(){
            var
            dw,
            pos,
            oldInfo,
            htmlObj,
            utils,
            subWidgets;
            
            if(this.kind === 'dialog'){
                dw = this;
            }
            
            else{
                dw = this._private.dialogWidget; 
            }
            
            if(!dw){
                return false;
            }
            
            htmlObj     = dw._getHtmlObject();
            oldInfo     = dw._private.oldInfo;
            utils       = dw._private.utils;
            subWidgets  = dw._subWidgets();

            if(!oldInfo.maximized){
                pos     = dw.getPosition();
                
                dw._setOldInfo({
                    height	: dw.getHeight(),
                    width	: dw.getWidth(),
                    left	: pos.left,
                    top         : pos.top,
                    right       : pos.right,
                    bottom      : pos.bottom
                });

                htmlObj.css({
                    width   : '100%',
                    height  : '100%',
                    top     : 0,
                    left    : 0
                });

                if(utils.isResizable()){
                    dw.resizable(false);
                }
                if(utils.isDraggable()){   
                    dw.draggable(false);
                    htmlObj.css({
                        cursor : 'auto'
                    });
                    
                    if(subWidgets.titlebar.tag){
                        var
                        titlebar;

                        titlebar = subWidgets.titlebar.tag.$domNode;
                        titlebar.css({
                            cursor : 'auto'
                        });
                    }
                }
            }

            else{
                htmlObj.css({
                    width   : oldInfo.width,
                    height  : oldInfo.height,
                    top     : oldInfo.top,
                    left    : oldInfo.left
                });
                
                if(utils.isResizable()){
                    utils.makeResizable();
                }
                    
                if(utils.isDraggable()){
                    utils.makeDraggable();
                }
            }

            dw._private.oldInfo.maximized = !dw._private.oldInfo.maximized;
        },
        minimizeDialog : function(){
            var
            dw;
            
            if(this.kind === 'dialog'){
                dw = this;
            }
            
            else{
                dw = this._private.dialogWidget; 
            }
            
            if(!dw){
                return;
            }
            
            dw._private.shared.privateMinimize(dw);
        },
        _setOldInfo : function(info){
            this._private.oldInfo = info;
        },
        _getOldInfo : function(){
            return this._private.oldInfo;
        },
        _getHtmlObject : function(){
            return this.$domNode;
        },
        _createNew : function(config){
            var
            temp,
            that,
            title,
            classes,
            htmlObj,
            content,
            toolbar,
            titlebar,
            contentW,
            btnClose,
            imageIcon,
            defaultConf,
            titleWidget,
            btnMaximize,
            btnMinimize;
            
            classes = this._private.classes;
            
            defaultConf = {
                title           : 'Dialog Title',
                icon            : {
                    url     : '/walib/WAF/widget/dialog/images/alert.png',
                    display : true
                },
                buttons         : [],
                content         : null,
                toolBar         : true,
                titleBar        : true,
                closeButton     : true,
                maximizeButton  : true,
                minimizeButton  : true
            }

            config = $.extend(true, defaultConf , config);

            for(var i in defaultConf){
                if(config[i] == 'undefined' || config[i] == null){
                    config[i] = defaultConf[i];
                }
            }
            
            htmlObj = this._getHtmlObject();
            that    = this;
            
            function addButtonToToolbar(i , config){
                var
                button;
                
                config.title    = config.title      || 'Button ' + i;
                config['class'] = config['class']   || '';
                
                button = $('<button>').prop({
                    'id'                    : that.id + '_button' + i,
                    'class'                 : 'waf-widget waf-button default inherited'
                })
                .data({
                	'text'             : config.title,
                    'constraint-right' : "true",
                    'constraint-bottom': "false",
                    'constraint-left'  : "false",
                    'constraint-top'   : "true"
                });

                button.css({
                    width       : 100,
                    height      : 30,
                    top         : 5,
                    right       : 5 + (5 + 100)*i,
                    position    : 'absolute'
                });
                
                button.addClass(config['class']);
                
                button.bind(config);

                button.appendTo(toolbar);

                new WAF.widget.Button({
                    'id'        : that.id + '_button' + i,
                    'class'     : 'waf-widget waf-button default inherited',
                    'data-theme': 'metal inherited',
                    'data-text' : config.title
                });
            }
            
            if(config.titleBar){
                var
                xButton = 8;
                
                titlebar = $('<div>').prop({
                    id                      : this.id + '_titlebar',
                    'class'                 : "waf-widget waf-container default inherited " + classes.titlebar.classname
                })
                .data({
                    'constraint-right' : "true",
                    'constraint-bottom': "false",
                    'constraint-left'  : "true",
                    'constraint-top'   : "true"
                });

                titlebar.css({
                    top     : 0,
                    height  : 28,
                    left    : 0,
                    right   : 0,
                    position: 'absolute'
                });

                titlebar.appendTo(htmlObj);

                new WAF.widget.Container({
                    'id'        : this.id + '_titlebar',
                    'class'     : 'waf-widget waf-container default inherited ' + classes.titlebar.classname,
                    'data-theme': 'metal inherited'
                });

                title = $('<div>').prop({
                    id                      : this.id + '_title',
                    'class'                 : "waf-widget waf-richText default inherited " + classes.titlebar.subwidgets.title
                })
                .data({
                    'constraint-right' : "true",
                    'constraint-bottom': "false",
                    'constraint-left'  : "true",
                    'constraint-top'   : "true",
                    'autowidth'        : "false"
                });

                title.css({
                    top     : 6,
                    height  : 14,
                    left    : 0,
                    right   : 0,
                    position: 'absolute'
                });

                title.appendTo(titlebar);

                titleWidget = new WAF.widget.RichText({
                    'id'            : this.id + '_title',
                    'class'         : 'waf-widget waf-richText default inherited ' + classes.titlebar.subwidgets.title,
                    'data-theme'    : 'metal inherited',
                    'data-autowidth': "false",
                    'data-text'     : config.title
                });
                titleWidget.setValue(config.title);
                
                if(config.icon.display){
                    imageIcon = $('<div>').prop({
                        id                      : this.id + '_icon',
                        'class'                 : "waf-widget waf-image default inherited " + classes.titlebar.subwidgets.iconimage
                    })
                    .data({
                        'constraint-right' : "false",
                        'constraint-bottom': "false",
                        'constraint-left'  : "true",
                        'constraint-top'   : "true",
                        'src'              : config.icon.url,
                        'fit'              : '0'
                    });

                    imageIcon.css({
                        top     : 2,
                        height  : '20px',
                        width   : '20px',
                        left    : 2,
                        position: 'absolute'
                    });

                    imageIcon.appendTo(titlebar);

                    new WAF.widget.Image({
                        'id'        : this.id + '_icon',
                        'class'     : 'waf-widget waf-image default inherited ' + classes.titlebar.subwidgets.iconimage,
                        'data-theme': 'metal inherited',
                        'data-src'  : config.icon.url || defaultConf.icon.url,
                        'data-fit'  : '0'
                    });
                }
                
                if(config.closeButton){

                    btnClose = $('<button>').prop({
                        'id'                    : this.id + '_close',
                        'class'                 : 'waf-widget waf-button default inherited ' + classes.titlebar.subwidgets.buttons + ' ' + classes.titlebar.subwidgets.close
                    })
                    .data({
                        'text'             : 'x',
                        'constraint-right' : "true",
                        'constraint-bottom': "false",
                        'constraint-left'  : "false",
                        'constraint-top'   : "true"
                    });

                    btnClose.css({
                        width       : 15,
                        height      : 15,
                        top         : 5,
                        right       : xButton,
                        position    : 'absolute',
                        'z-index'   : 4
                    });

                    btnClose.appendTo(titlebar);
                    xButton += 19;

                    new WAF.widget.Button({
                        'id'        : this.id + '_close',
                        'class'     : 'waf-widget waf-button default inherited ' + classes.titlebar.subwidgets.buttons + ' ' + classes.titlebar.subwidgets.close,
                        'data-theme': 'metal inherited',
                        'data-text' : 'x'
                    });
                }
                
                if(config.maximizeButton){
                    
                    btnMaximize = $('<button>').prop({
                        'id'                    : this.id + '_maximize',
                        'class'                 : 'waf-widget waf-button default inherited ' + classes.titlebar.subwidgets.buttons + ' ' + classes.titlebar.subwidgets.maximize
                    })
                    .data({
                    	'text'             : '+',
                        'constraint-right' : "true",
                        'constraint-bottom': "false",
                        'constraint-left'  : "false",
                        'constraint-top'   : "true"
                    });

                    btnMaximize.css({
                        width       : 15,
                        height      : 15,
                        top         : 5,
                        right       : xButton,
                        position    : 'absolute',
                        'z-index'   : 4
                    });

                    btnMaximize.appendTo(titlebar);
                    xButton += 19;
                    
                    new WAF.widget.Button({
                        'id'        : this.id + '_maximize',
                        'class'     : 'waf-widget waf-button default inherited ' + classes.titlebar.subwidgets.buttons + ' ' + classes.titlebar.subwidgets.maximize,
                        'data-theme': 'metal inherited',
                        'data-text' : '+'
                    });
                }
                
                if(config.minimizeButton){
                    
                    btnMinimize = $('<button>').prop({
                        'id'                    : this.id + '_minimize',
                        'class'                 : 'waf-widget waf-button default inherited ' + classes.titlebar.subwidgets.buttons + ' ' + classes.titlebar.subwidgets.minimize
                    })
                    .data({
                        'text'             : '+',
                        'constraint-right' : "true",
                        'constraint-bottom': "false",
                        'constraint-left'  : "false",
                        'constraint-top'   : "true"
                    });

                    btnMinimize.css({
                        width       : 15,
                        height      : 15,
                        top         : 5,
                        right       : xButton,
                        position    : 'absolute',
                        'z-index'   : 4
                    });

                    btnMinimize.appendTo(titlebar);
                    xButton += 19;
                    
                    new WAF.widget.Button({
                        'id'        : this.id + '_minimize',
                        'class'     : 'waf-widget waf-button default inherited ' + classes.titlebar.subwidgets.buttons + ' ' + classes.titlebar.subwidgets.minimize,
                        'data-theme': 'metal inherited',
                        'data-text' : '-'
                    });
                }
            }
            
            content = $('<div>').prop({
                id                      : this.id + '_content',
                'class'                 : "waf-widget waf-container default inherited " + classes.content.classname
            })
            .data({
                'constraint-right' : "true",
                'constraint-bottom': "true",
                'constraint-left'  : "true",
                'constraint-top'   : "true"
            });
            
            if(config.titleBar){
                content.css({
                    top     : 30,
                    left    : 0,
                    right   : 0,
                    bottom  : 42,
                    position: 'absolute'
                });
            }
            
            else{
                content.css({
                    top     : 0,
                    left    : 0,
                    right   : 0,
                    bottom  : 42,
                    position: 'absolute'
                });
            }
            
            content.appendTo(htmlObj);
            
            contentW = new WAF.widget.Container({
                'id'        : this.id + '_content',
                'class'     : 'waf-widget waf-container default inherited ' + classes.content.classname,
                'data-theme': 'metal inherited'
            });
            
            if(config.toolBar){
                toolbar = $('<div>').prop({
                    id                      : this.id + '_toolbar',
                    'class'                 : "waf-widget waf-container default inherited " + classes.toolbar.classname
                })
                .data({
                    'constraint-right' : "true",
                    'constraint-bottom': "true",
                    'constraint-left'  : "true",
                    'constraint-top'   : "false"
                });

                toolbar.css({
                    height  : 40,
                    left    : 0,
                    right   : 0,
                    bottom  : 0,
                    position: 'absolute'
                });

                toolbar.appendTo(htmlObj);

                new WAF.widget.Container({
                    'id'        : this.id + '_toolbar',
                    'class'     : 'waf-widget waf-container default inherited ' + classes.toolbar.classname,
                    'data-theme': 'metal inherited'
                });
            
                if(Raphael.is(config.buttons , 'array')){
                    $.each(config.buttons , function(key , value){
                        addButtonToToolbar(key , value);
                    })
                }
            }
            
            else{
                contentW.setHeight('100%');
                contentW.setWidth('100%');
            }
            
            this.ready();
        }
    }
    );
