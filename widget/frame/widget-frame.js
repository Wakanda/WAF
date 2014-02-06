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
    'Frame',
    {
        
    },
    function WAFWidget(config, data, shared) {
        var
        url,
        that,
        frame,
        htmlObj,
        sourceAtt;
        
        htmlObj     = this.$domNode;
        frame       = $('#' + config.id + '-frame');
        sourceAtt   = this.sourceAtt;
        that        = this;
            
        if(frame.length < 1 ){
            frame     = $('<iframe>');
            
            frame.attr({
                id      : config.id + '-frame',
                src     : config['data-src'],
                width   : '100%',
                height  : '100%'
            });
            
            frame.css({
                top         : 0,
                left        : 0
            });
            
            htmlObj.append(frame);
            
            frame.load(function(e){
                var
                myEvent = $.extend(true, e, $.Event("onLoad"));
                
                $(that).trigger(myEvent);
            });
            
            if (sourceAtt) {
                sourceAtt.addListener(function(e) {
                    var
                    widget;
                    
                    widget  = e.data.widget;
                    url     = widget.getFormattedValue();
                    
                    frame.attr('src' , url);
                    
                    if(widget.events && widget.events.onLoad){
                        frame.load(that.events.onLoad);
                    }
                },{},{
                    widget:this
                });
            }
        }
    },
    {
        getFrame : function(){
            return $('#' + this.id + '-frame');
        },
        getSourcePage : function(){
            return this.getFrame().attr('src');
        },
        load : function(url){
            this.getFrame().attr('src' , url);
        },
        clear : function(){
            this.getFrame().removeAttr('src');
        },
        setValue : function(url){
            this.load(url);
        },
        getValue : function(){
            return this.getSourcePage();
        },
        redraw: function(){
            var frame = this.getFrame();
            frame.attr('src' , frame.attr('src'));
        }
    }

    );