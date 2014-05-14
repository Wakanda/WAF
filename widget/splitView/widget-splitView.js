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
    'SplitView', // TODO: set the widget constructor name in CamelCase (ex: "DataGrid")
    
                
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

        /*var
        containerID = config.id,
        $container  = $('#'+containerID),
        that        = this;*/

        
/*        var eventHandlerFunction = function(event)
        {
            var widget = event.data.widget;
            var source = event.dataSource;
        }

        if ('source' in this) {
          
        }
*/
    },
    
                
    {
        
    /**
     * Custom ready function
     * @method ready
     */
    ready : function splitView_ready(){

        /*
        * put all waf-navigationView-view to 100% to solve resize issue
        */

        var widID           = this.id,
            $cont           = $("#"+widID),
            navViewWidgets  = $(document.body).find(".waf-navigationView"),
            navParent       = navViewWidgets.parent();
        
        $("#"+widID).find(".waf-split-container").css("height", "auto");
        //$("#"+widID).find(".waf-navigationView-view").css("width", "auto");
  
    },
    
    onResize: function() {

       /* var widID           = this.id,
            $cont           = $("#"+widID),
            navViewWidgets  = $(document.body).find(".waf-navigationView"),
            navParent       = navViewWidgets.parent();

        $.each(navParent, function(index, value) { console.log(value.style.visibility)
             if ($(value).hasClass("waf-container-split-mobile")) {
                window.setTimeout(function(){ 
                    $$(value.children[0].id).onContainerResize();
                }, 0);
             }
        });    
*/
            

        /*if (backButton.length != 0) {
            backButtonWidth = parseInt(backButton.css("width").split("px")[0]);
        }    
                        
        window.setTimeout(function(){

            if (!$$(navID).hasBackButton) {
                $(menuButton).css("left", "0px");
            } else {
                $(menuButton).css("left", backButtonWidth + 20 + "px");
            }    
            
            
        }, 100);    */

            
    },
        
    // [Prototype]
    // The public shared properties and methods inherited by all the instances
    // NOTE: "this" is available in this context
    // These methods and properties are available from the constructor through "this" 
    // NOTE 2: private properties and methods are not available in this context


    // /**
    //  * A Public shared Property
    //  *
    //  * @/shared
    //  * @/property publicSharedProperty
    //  **/
    // publicSharedProperty: 12,

    /**
    * goToPreviousView
    *
    * @/shared
    * @/method goToPreviousView
    **/
    publicMeth: function publicMeth( ) {

       
        
     }        
    }

    );
