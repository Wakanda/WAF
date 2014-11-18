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
     * WAF Menu widget
     *
     * @class WAF.widget.Menu
     * @extends WAF.Widget
     */
    'MenuBar',
    
    
    {
        // Shared private properties and methods
        // NOTE: "this" is NOT available in this context
        
        
    },
        
    /**
     * @constructor
     * @param {Object} inConfig configuration of the widget
     */

    /**
     * The constructor of the widget
     *
     * @property constructor
     * @type Function
     * @default WAF.widget.GoogleMap
     **/
    function (inConfig, inData, shared) {
        var 
        i,
        theme,
        level,
        themes,
        classes,
        direction,
        isSubmenu,
        tabMargin,
        parentsBar,
        htmlObject,
        parentClasses,
        htmlObjectItem,
        htmlObjectItems,
        htmlObjectItemsLenght;            
            
        htmlObject          = this.$domNode;      
        htmlObjectItems     = htmlObject.children('.waf-menuItem');
        htmlObjectItemsLength = htmlObjectItems.length;
        level				= inData.level || 0;
        classes             = htmlObject.prop('class');
        isSubmenu           = level > 0;
        parentsBar          = htmlObject.parents('.waf-menuBar');
        parentClasses       = isSubmenu ? htmlObject.parents('.waf-menuBar').prop('class') : '';
        tabMargin           = inData['tab-margin'] || 0;        

        level               = parentsBar.length;

        htmlObject.addClass('waf-menuBar-' + inData.display);
        
        /*if (WAF.PLATFORM.modulesString == "mobile") {
            htmlObject[0].style.width = "100% !important";
        }*/

        // Setting the theme
        if (inData.theme) {
           htmlObject.addClass(inData.theme);
        }
        
        themes = [];
        
        for (i in WAF.widget.themes) {
            theme = WAF.widget.themes[i].key;
            if (classes.match(theme)) {                
               if (isSubmenu) {
                   htmlObject.removeClass(theme);
                   htmlObjectItems.removeClass(theme);
               }
            }
            
            if (parentClasses.match(theme)) {   
                themes.push(theme);
            }
        }
                      
        if (isSubmenu) {
            htmlObject.addClass(themes.join(' '));
            htmlObjectItems.addClass(themes.join(' '));
        }
        
        
		// Setting classes
		for (var i = 0; i < htmlObjectItemsLength; i++) {
			htmlObjectItem = htmlObjectItems.eq(i);

            // Setting position first
			if (i == 0) {
				htmlObjectItem.addClass('waf-menuItem-first');
			} else {
				htmlObjectItem.removeClass('waf-menuItem-first');
			}
			
            htmlObjectItem
                // Setting level
    			.addClass('waf-menuItem-level-' + level)

                // Setting direction
                .removeClass('waf-menuItem-horizontal waf-menuItem-vertical')
                .addClass('waf-menuItem-' + inData.display);
    			
            // Setting position last
			if (i == (htmlObjectItemsLength - 1)) {
				htmlObjectItem.addClass('waf-menuItem-last');
			} else {
				htmlObjectItem.removeClass('waf-menuItem-last');
			}
		}

        /*
         * @DEPRECATED : Add margin (margin is now set into the css style sheet)
         * @DEPRECATED : Add margin (margin is now set into the css style sheet)
         */
        if (tabMargin) {            
            switch (inData.display) {
                case 'horizontal':
                    htmlObject.children('li:not(:last-child)').css({'margin-right': tabMargin + 'px'});   
                    break;

                case 'vertical':
                    htmlObject.children('li:not(:last-child)').css({'margin-bottom': tabMargin + 'px'}); 
                    break;
            }
        }
    }, {
        /**
         * Get the menu items of the menubar
         * @method getMenuItems
         * @return {array} list of menu items
         */
        getMenuItems : function menubar_get_menuitems () {
            var
            items;
            
            items = [];
            
            $.each(this.$domNode.children(), function() {
                items.push($$($(this).prop('id')));
            });
            
            return items;
        },
        
        /**
         * Get a specific menu item
         * @method getMenuItem
         * @return {object} menu item
         */
        getMenuItem : function menubar_get_menuitem (index) {            
            return this.getMenuItems()[index];
        },
       
        setWidth : function menuitem_set_width(value) {
            /*
             * Set dom node width
             */
            this.$domNode.css('cssText', 'width:' +  value + 'px !important')

            /*
             * Call resize function
             */
            this._callResizeEvents('stop');
        },
       
        setHeight : function menuitem_set_height(value) {
            /*
             * Set dom node width
             */
            this.$domNode.css('cssText', 'height:' +  value + 'px !important')

            /*
             * Call resize function
             */
            this._callResizeEvents('stop');
        },

        /**
         * Get the selected menu item
         * @method getSelectedMenuItem
         * @return {object} selected menu item
         */
        getSelectedMenuItem : function getSelectedMenuItem () {
            var
            index,
            result;

            index = this.$domNode.children('li').index(this.$domNode.children('.waf-state-selected'));

            if (index != -1) {
                result = this.getMenuItem(index);
            } else {
                result = null;
            }

            return result;
        }
    }
);
