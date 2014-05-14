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

    /**
     * TODO: Write a description of this WAF widget
     *
     * @class TODO: give a name to this class (ex: WAF.widget.DataGrid)
     * @extends WAF.Widget
     */
    'Popover', // TODO: set the widget constructor name in CamelCase (ex: "DataGrid")
    
                
    {
    // Shared private properties and methods
    // NOTE: "this" is NOT available in this context to access the current to widget instance
    // These methods and properties are available from the constrctor through "shared"

    // /**
    //  * A Private shared Method
    //  *
    //  * @/private
    //  * @/shared
    //  * @/method privateSharedMethod
    //  * @/param {String} inWidget
    //  **/
    // privateSharedMethod: function privateSharedMethod(inWidget) {
    //    can work on the widget instance through inWidget
    // }
        
    },
            
    
    /**
     * @constructor
     * @param {Object} inConfig configuration of the widget
     */

    /**
     * The constructor of the widget
     *
     * @shared
     * @property constructor
     * @type Function
     * @default TODO: set to the name to this class (ex: WAF.widget.DataGrid)
     **/
    function WAFWidget(config, data, shared) {

        var
        containerID = config.id,
        $container  = $('#'+containerID),
        that        = this,
        $button     = $("#"+config["data-button"]);

        this.isActive = true;
        this.linkedButtonID = config["data-button"]; 

        var arrowMarkup = '<div class="waf-popover-arrow waf-popover-arrow-top"><span></span></div>';
        $container.append(arrowMarkup);

        if (config["data-hideonload"] === "true") {
            this.isVisible = false;
        } else {
            this.isVisible = true;
            this.refreshArrowPosition();
        }

        this._arrowSetted = false;

        //events
        if (WAF.PLATFORM.isTouch) {
            
            $button.bind("touchend", function(){
                that.toggle();
            });

        } else {
            
            $button.click(function(){
                that.toggle();
            });

        }
                

    },
    
                
    {
    // [Prototype]
    // The public shared properties and methods inherited by all the instances
    // NOTE: "this" is available in this context
    // These methods and properties are available from the constructor through "this" 
    // NOTE 2: private properties and methods are not available in this context


    /**
     * Custom ready function
     * @method ready
     */
    ready : function popover_ready(){

        //this.refreshArrowPosition();
      
        
    },
    
    onResize: function() {
        
    },

    /**
    * onContainerResize
    *
    * @/shared
    * @/method onContainerResize
    **/
    onContainerResize: function onContainerResize() {

       
    },
    toggle: function popover_toggle() {

        if (this.isVisible) {
            this.domNode.style.display = "none";
            this.isVisible = false;
        
        } else {

            if (this.isActive) {
                this.domNode.style.zIndex="99999";
                this.domNode.style.display = "block";
                this.isVisible = true;
                if (!this._arrowSetted) {
                    this._arrowSetted = true;
                    this.refreshArrowPosition();     
                }
            }
        }
    },
            
    hide: function popover_hide() {
        this.domNode.style.display = "none";
        this.isVisible = false;
    },
            
    show: function popover_hide() {
        if (this.isActive) {
            this.domNode.style.zIndex="99999";
            this.domNode.style.display = "block";
            this.isVisible = true;
            if (!this._arrowSetted) {
                this._arrowSetted = true;
                this.refreshArrowPosition();     
            }
        }
    },
    /*disable: function popover_disable() {
        this.isActive = false;
        this.hide();
        this.isVisible = false;
    },
    enable: function popover_enable() {
        this.isActive = true;
    },*/
    refreshArrowPosition : function popover_refreshArrowPosition() {
                
        var button,
            buttonX,
            buttonY,
            pointX,
            pointY,
            tagX,
            tagY,
            tagHeight,
            tagWidth,
            $button,
            buttonOffset,
            $tag, 
            tagOffset,
            buttonPos,
            tagPos,
            arrowWidth  = 25,
            buttonID    = this.linkedButtonID,
            htmlObject, 
            up,
            down,
            left,
            right;

        if (buttonID != null) {    

            htmlObject  = $('#' + this.id);
            up          = false;
            down        = false;
            left        = false;
            right       = false;    

            button      = $("#"+buttonID);
            $button     = $("#"+buttonID);
            $tag        = $("#"+this.id);
            buttonOffset = $button.offset(); 
            tagOffset   = $tag.offset();
            buttonPos   = button.position();
            buttonX     = buttonOffset.left;
            buttonY     = buttonOffset.top;
            pointX      = buttonX + (button.width() / 2);
            pointY      = buttonY + (button.height() / 2);
            tagPos      = htmlObject.position();
            tagX        = tagOffset.left;
            tagY        = tagOffset.top;
            tagHeight   = htmlObject.height();
            tagWidth    = htmlObject.width();

            if (pointY < tagY) { //case button is top
                up = true;
            }

            if (pointY > (tagY + tagHeight)) { //case button is bottom
                down = true;
            }

            if (!up & !down) {

                if (pointX < tagX) { //case button is left
                    left = true;
                }

                if (pointX > (tagX + tagWidth)) { //case button is right
                    right = true;
                }
            }

            switch (true) {
                case up :

                    newX = (pointX - tagX) - (arrowWidth / 2);

                    if (newX < 5) {
                        newX = 5;
                    }

                    if (newX > tagWidth - 30) {
                        newX = tagWidth - 30;
                    }

                    htmlObject.find(".waf-popover-arrow")
                        .css("left", newX + "px")
                        .css("top", "-9px")
                        .css("bottom", "")
                        .addClass("waf-popover-arrow-top")
                        .removeClass("waf-popover-arrow-bottom")
                        .removeClass("waf-popover-arrow-right")
                        .removeClass("waf-popover-arrow-left");
                                         
                break;
                case down :

                    newX = (pointX - tagX) - (arrowWidth / 2);

                    if (newX < 5) {
                        newX = 5;
                    }

                    if (newX > tagWidth - 40) {
                        newX = tagWidth - 40;
                    }

                    htmlObject.find(".waf-popover-arrow")
                        .css("left", newX + "px")
                        .css("bottom", "-11px")
                        .css("top", "")
                        .addClass("waf-popover-arrow-bottom")
                        .removeClass("waf-popover-arrow-top")
                        .removeClass("waf-popover-arrow-right")
                        .removeClass("waf-popover-arrow-left");
                                         
                break;
                case right:

                    newY = (pointY - tagY) - (arrowWidth / 2);

                    if (newY < 20) {
                        newY = 20;
                    }      

                    if (newY > tagHeight - 60) {
                        newX = tagHeight - 60;
                    }  

                    htmlObject.find(".waf-popover-arrow")
                        .css("top", newY + "px")
                        .css("right", "-18px")
                        .css("left", "")
                        .addClass("waf-popover-arrow-right")
                        .removeClass("waf-popover-arrow-top")
                        .removeClass("waf-popover-arrow-bottom")
                        .removeClass("waf-popover-arrow-left");

                break;
                case left:

                    newY = (pointY - tagY) - (arrowWidth / 2);

                    if (newY < 20) {
                        newY = 20;
                    }      

                    if (newY > tagHeight - 60) {
                        newX = tagHeight - 60;
                    }  

                    htmlObject.find(".waf-popover-arrow")
                        .css("top", newY + "px")
                        .css("left", "-16px")
                        .css("right", "")
                        .addClass("waf-popover-arrow-left")
                        .removeClass("waf-popover-arrow-top")
                        .removeClass("waf-popover-arrow-bottom")
                        .removeClass("waf-popover-arrow-right");
                break;
                default:
            }

        }

    }  

    }

);
