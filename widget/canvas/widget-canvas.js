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
    'Canvas',
    {
        
    },
    function WAFWidget(config, data, shared) {
        var
        url,
        ctx,
        that,
        width,
        height,
        canvas,
        sourceAtt;
        
        that        = this;
        sourceAtt   = that.sourceAtt;
        canvas      = that.getCanvas();
        
        $(canvas).attr({
            width   : that.getWidth(),
            height  : that.getHeight()
        });
        
        width       = canvas.width;
        height      = canvas.height;
        ctx         = that.get2DContext();
        
        ctx.clearRect(0, 0, width, height);
        
        if (sourceAtt) {
            sourceAtt.addListener(function(e) {
                url = e.data.widget.getFormattedValue();
                
                ctx.clearRect(0, 0, width, height);
                
                if (url == null || url == "") {
//                    ctx.fillStyle = "rgb(200,0,0)";
//                    ctx.fillRect(0, 0, width / 2, height / 2);
//                    ctx.fillStyle = "rgba(0, 50, 200, 0.5)";
//                    ctx.fillRect(width / 2 - width / 6, height / 2 - height / 6, width / 2 + width / 6, height / 2 + height / 6);
                }
                
                else{
                    var img = new Image();
                    img.onload = function(){
                        ctx.drawImage(img,0,0,width,height);
                    };
                    img.src = url;
                }
            },{
                id: config.id
            },{
                widget:this
            });
        }
        
        else if(config['data-src'] && config['data-src'] != ''){
            url     = config['data-src'];
            
            var img = new Image();
            img.onload = function(){
                ctx.drawImage(img,0,0,width,height);
            };
            img.src = url;
        }
        
        else{
//            ctx.fillStyle = "rgb(200,0,0)";
//            ctx.fillRect(0, 0, width / 2, height / 2);
//            ctx.fillStyle = "rgba(0, 50, 200, 0.5)";
//            ctx.fillRect(width / 2 - width / 6, height / 2 - height / 6, width / 2 + width / 6, height / 2 + height / 6);
        }
    },
    {
        get2DContext : function(){
            var
            ctx,
            canvas;
            
            canvas  = this.$domNode[0];
            ctx     = canvas.getContext("2d");
            
            return ctx;
        },
        getCanvas : function(){
            return this.$domNode[0];
        }
    }

);