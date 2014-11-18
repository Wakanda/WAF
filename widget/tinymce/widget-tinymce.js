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

    'TinyMCE',
    {
        
    },
    function WAFWidget(config, data, shared) {
        
    },
    {
        ready : function(){
            var
            that,
            config,
            source,
            parent,
            htmlObj,
            position,
            elements,
            textArea,
            wysiwygConf,
            tinyMCEinst,
            domAttributes;
            
            config      = this.config;
            htmlObj     = this.$domNode;
            position    = {
                top     : htmlObj.css('top'),
                left    : htmlObj.css('left'),
                right   : htmlObj.css('right'),
                bottom  : htmlObj.css('bottom')
            };
            parent          = htmlObj.parent();
            domAttributes   = htmlObj[0].attributes;
            
            textArea = $('<textarea>');
            
            for(var i = 0 ; i < domAttributes.length ; i++){
                var 
                attr        = domAttributes[i];
                
                if(attr.name != 'data-elements'){
                    textArea[0].setAttribute(attr.name, attr.value);
                }
            }
            
            htmlObj.remove();
            textArea.appendTo(parent)
            
            source          = this.source;
            that            = this;
            that.$domNode   = textArea;
            
            elements = JSON.parse(config['data-elements'].replace(/'/g,'"'));
            wysiwygConf = {
                mode : "exact",
                elements : textArea.prop('id'),
                plugins : "autolink,lists,spellchecker,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,\n\
                            insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,\n\
                                nonbreaking,xhtmlxtras,template",
                theme : "advanced",
                theme_advanced_toolbar_location : config['data-toolbar-location'],
                theme_advanced_toolbar_align : config['data-toolbar-align'],
                theme_advanced_resizing : false,
                theme_advanced_statusbar_location : "bottom",
                constrain_menus : true,
                skin : "o2k7",
                skin_variant : "silver",
                convert_urls:true,
                relative_urls:false,
                remove_script_host:false,
            
                save_enablewhendirty : true,
                save_onsavecallback : function save_it(){
                    if(source && tinyMCEinst){
                        var cm = that.getControlManager();
                    
                        source.save({
                            onSuccess : function(){
                                cm.setDisabled('save' , true);
                            }
                        });
                    }
                },
                onchange_callback : function(){
                    source && that.sourceAtt.setValue(tinyMCEinst.getContent());
                },
                content_css : "/walib/WAF/widget/tinymce/css/content.css",
                oninit : function(){
                    var
                    parent;
                    
                    parent      = $('#' + that.id + '_parent');
                    // keep a reference to the widget's dom element used for user interactions
                    // this is used in WAF.widget.disable/enable in order to block user interations
                    // in such a case (see bug #WAK0081875 & #WAK0081624)                    
                    that.containerNode = parent.get(0);
                    
                    parent.css({
                        'top'       : position.top,
                        'left'      : position.left,
                        'bottom'    : position.bottom,
                        'right'     : position.right,
                        'position'  : 'absolute'
                    });
                    
                    if(config['data-draggable'] === 'true'){
                        parent.draggable({
                            handle  : '#' + that.id + '_toolbargroup',
                            cancel  : '.mceIcon'
                        });
                    }
                    
                    // Add attribs
                    tinyMCEinst     = that.getWysiwygInstance();
                    tinyMCEinst.theme.resizeTo(that.getWidth(), that.getHeight());
                    
                    $('#tinymce', tinyMCEinst.getDoc()).on('blur',function(){
                        var cm = that.getControlManager();
                        if(source){
                            if(tinyMCEinst.getContent() != that.sourceAtt.getValue()){
                                cm.setDisabled('save' , false);
                            }
                            else if(source && config['data-save'] === 'true'){
                                that.sourceAtt.setValue(tinyMCEinst.getContent());
                                source.save({
                                    onSuccess : function(){
                                        cm.setDisabled('save' , true);
                                    }
                                });
                            }
                        }
                    });
                    
                    // Setup events
                    var evts = that.events;
                    for(i in evts){
                        switch(i){
                            case 'onInit'               :
                                tinyMCEinst.onInit.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onInit && evts.onInit(e);
                                });
                                break;
                            case 'onClick'              :
                                tinyMCEinst.onClick.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onClick && evts.onClick(e);
                                });
                            case 'onPaste'              :
                                tinyMCEinst.onPaste.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onPaste && evts.onPaste(e);
                                });
                                break;
                            case 'onKeyUp'              :
                                tinyMCEinst.onKeyUp.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onKeyUp && evts.onKeyUp(e);
                                });
                                break;
                            case 'onSubmit'             :
                                tinyMCEinst.onSubmit.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onSubmit && evts.onSubmit(e);
                                });
                                break;
                            case 'onMouseUp'            :
                                tinyMCEinst.onMouseUp.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onMouseUp && evts.onMouseUp(e);
                                });
                                break;
                            case 'onKeyDown'            :
                                tinyMCEinst.onKeyDown.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onKeyDown && evts.onKeyDown(e);
                                });
                                break;
                            case 'onKeyPress'           :
                                tinyMCEinst.onKeyPress.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onKeyPress && evts.onKeyPress(e);
                                });
                                break;
                            case 'onActivate'           :
                                tinyMCEinst.onActivate.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onActivate && evts.onActivate(e);
                                });
                                break;
                            case 'onDblClick'           :
                                tinyMCEinst.onDblClick.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onDblClick && evts.onDblClick(e);
                                });
                                break;
                            case 'onMouseDown'          :
                                tinyMCEinst.onMouseDown.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onMouseDown && evts.onMouseDown(e);
                                });
                                break;
                            case 'onSetContent'         :
                                tinyMCEinst.onSetContent.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onSetContent && evts.onSetContent(e);
                                });
                                break;
                            case 'onContextMenu'        :
                                tinyMCEinst.onContextMenu.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onContextMenu && evts.onContextMenu(e);
                                });
                                break;
                            case 'onBeforeGetContent'   :
                                tinyMCEinst.onBeforeGetContent.add(function(ed, e) {
                                    var  evts = that.events;
                                    evts.onBeforeGetContent && evts.onBeforeGetContent(e);
                                });
                                break;
                        }
                    }
                
                    if(source){
                        var
                        cm,
                        content;
                        
                        cm = that.getControlManager();
                        content = that.sourceAtt.getValue() || "";
                        tinyMCEinst.setContent(content);
                    
                        source.addListener("all",function(e){

                            switch(e.eventKind){
                                case "onElementSaved"           :
                                case "onCollectionChange"       :
                                case "onCurrentElementChange"   :
                                    content = that.sourceAtt.getValue() || "";
                                    tinyMCEinst.setContent(content);
                                    cm.setDisabled('save' , true);
                                    break;
                            }
                        }, {
                            id: this.id
                        });
                    }
                    /**
                     * 
                     */
                    var
                    htmlParent  = that.$domNode.parent(),
                    domNode     = $('#' + that.id),
                    resizeH     = domNode.attr('data-constraint-top') == 'true' && domNode.attr('data-constraint-bottom') == 'true',
                    resizeW     = domNode.attr('data-constraint-left') == 'true' && domNode.attr('data-constraint-right') == 'true';
                    
                    if(( resizeH || resizeW ) && htmlParent.prop('id') == $('body').prop('id')){
                        var originalSize = {
                            width: $(window).width(),
                            height: $(window).height()
                        }
                        
                        domNode.find('table.mceLayout').css('width','100%')
                        
                        $(window).resize(function(){
                            if(tinyMCEinst){
                                if(resizeH && resizeW){
                                    tinyMCEinst.theme.resizeBy($(this).width() - originalSize.width , $(this).height() - originalSize.height);
                                }

                                else if(resizeH){
                                    tinyMCEinst.theme.resizeBy(0 , $(this).height() - originalSize.height);
                                }

                                else if(resizeW){
                                    tinyMCEinst.theme.resizeBy( $(this).width() - originalSize.width , 0 );
                                }
                                
                                originalSize = {
                                    width: $(this).width(),
                                    height: $(this).height()
                                }
                            }
                        });
                    }
                    
                    
                    that._isLoaded = 1;
                    that._executeQueue();
                    
                },
                
                // Events
                inline_styles : true,
                convert_fonts_to_spans : true
            };
        
            for(var i = 0 , element , j = 1 , k = 0 ; element = elements[i] ; i++ , k++){
                wysiwygConf['theme_advanced_buttons' + j] = wysiwygConf['theme_advanced_buttons' + j] || "";
            
                if(element.key === '_'){
                    j++;
                    k = -1;
                    continue;
                }
                if(k>0){
                    wysiwygConf['theme_advanced_buttons' + j] += ',';
                }
            
                wysiwygConf['theme_advanced_buttons' + j] += element.key;
            }
        
            wysiwygConf['theme_advanced_buttons' + (j + 1)] = "";
            
            if(config['data-resizable'] === 'true'){
                wysiwygConf.theme_advanced_resizing = true;
            }
            
            if(typeof tinyMCE != 'undefined'){
                tinyMCE.baseURL = location.protocol + '//' + location.host + '/waLib/WAF/lib/tiny_mce';
                tinyMCE.init(wysiwygConf);
            }
            else{
                $.getScript('/waLib/WAF/lib/tiny_mce/tiny_mce.js').done(function(){
                    tinyMCE.baseURL = location.protocol + '//' + location.host + '/waLib/WAF/lib/tiny_mce';
                    tinyMCE.init(wysiwygConf);
                })
            }
            
            this._tinyMCEConfig = wysiwygConf;
            
            tinymce.dom.Event._pageInit();
        },
        getWysiwygInstance : function(){
            if(typeof tinyMCE != 'undefined'){
                return tinyMCE.getInstanceById(this.id);
            }
        },
        getControlManager : function(){
            var
            cm,
            inst;
            
            inst = this.getWysiwygInstance();
            cm = inst.controlManager;
            
            return cm;
        },

        _executeQueue: function() {
            if (!this._queue) {
                return;
            }
            
            for(var p in this._queue) {
                if (this[p]) {
                    this[p](this._queue[p]);
                }
            }
            
            this._queue = {};
        },

        getValue : function(){
            return this.getWysiwygInstance().getContent();
        },

        setValue : function(content){
            if (this.getWysiwygInstance()) {
                return this.getWysiwygInstance().setContent(content);
            } else {
                if (!this._queue) {
                    this._queue = {};
                }
                
                if (!this._loaded) {
                    this._queue['setValue'] = content;
                }
            }
        },

        onResize : function(){
            var
            inst        = this.getWysiwygInstance(),
            parent      = this.getParent(),
            domNode     = $('#' + this.id),
            position    = this.getPosition(),
            resizeH     = domNode.attr('data-constraint-top') == 'true' && domNode.attr('data-constraint-bottom') == 'true',
            resizeW     = domNode.attr('data-constraint-left') == 'true' && domNode.attr('data-constraint-right') == 'true',
            div         = $('#' + this.id + '_over').length == 0 ? $('<div>').attr('id' , this.id + '_over') : $('#' + this.id + '_over');
            
            div.css({
                top     : 0,
                left    : 0,
                width   : $('#wysiwyg1_tbl').width(),
                height  : $('#wysiwyg1_tbl').height(),
                position: 'absolute'
            }).appendTo($('#' + this.id + '_parent'));
            
            if(inst){
                var
                mceFirst    = $('#' + this.id + '_parent').find('.mceFirst'),
                mceLast     = $('#' + this.id + '_parent').find('.mceLast');
                
                if(resizeH && resizeW){
                    inst.theme.resizeTo(parent.getWidth() - position.left - position.right , parent.getHeight() - position.top - position.bottom - mceFirst.height() - mceLast.height());
                }
                
                else if(resizeH){
                    inst.theme.resizeTo(this.getWidth() , parent.getHeight() - position.top - position.bottom - mceFirst.height() - mceLast.height());
                }
                
                else if(resizeW){
                    inst.theme.resizeTo(parent.getWidth() - position.left - position.right , this.getHeight() - mceFirst.height() - mceLast.height());
                }
            }
        },
        stopResize : function(){
            $('#' + this.id + '_over').length != 0 && $('#' + this.id + '_over').remove();
        },
        getParent : function(){
            var
            parentHtml;

            parentHtml = $('#' + this.id + '_parent').parent();
            
            return $$(parentHtml.prop('id'));
        }
    }
);
