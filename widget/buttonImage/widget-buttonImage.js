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
WAF.Widget.provide(

    /**
     *      
     * @class TODO: give a name to this class (ex: WAF.widget.DataGrid)
     * @extends WAF.Widget
     */
    'ButtonImage',   
    {        
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
     **/
    function WAFWidget(config, data, shared) {  
        var
        that,
        htmlObject;
        
        that        = this;
        htmlObject  = this.$domNode;
        
        /*
         * BUTTON NAVIGATION
         */
        htmlObject.bind('click', {}, function(e) {
            var target, link;
            link = that.$domNode.attr('data-link');
            target = that.$domNode.attr('data-target');
            if (link) {
            //if (data['link']) {
                switch(target) {
                    case '_blank':
                        window.open(link);
                        break;

                    default :
                        window.location = link;
                        break;
                }
            } else {
                e.preventDefault();
            }
        });
        
        /*
         * Add actions on data source if button is binded
         */
        if (this.source) {  
            htmlObject.bind('click', {}, function(e){
                switch (data['action']) {
                    case 'create' :
                        that.source.addNewElement();
                        break;
                        
                    case 'save' :
                        that.source.save();
                        break;
                        
                    case 'next' :
                        that.source.selectNext();
                        break;
                        
                    case 'previous' :
                        that.source.selectPrevious();
                        break;
                        
                    case 'last' :
                        var length = that.source._private.entityCollection.length;
                        that.source.select( parseInt(length-1) );
                        break;
                        
                    case 'first' :
                        that.source.select(0);
                        break;                        
                        
                    case 'remove' :
                        that.source.removeCurrent();
                        break;
                        
                    default:
                        break;
                }
            })
        }
    },{
        /**
         * Custom ready function
         * @method ready
         */
        ready : function (){    
            var
            that,
            icon,
            htmlObject;

            that        = this;
            htmlObject  = this.$domNode;
            icon        = this.getIcon();
            

            /*
             * ------------ <MOUSE EVENTS> ------------
             * To change status
             */

            if (WAF.PLATFORM.isTouch) {

                htmlObject.bind('touchstart', {}, function(e) { 
                    that.setState('active');
                    icon.setState('active');

                    htmlObject._state = 'active';
                });

                htmlObject.bind('touchend', {}, function(e) { 
                    that.setState('default');
                    icon.setState('default');

                    htmlObject._state = null;
                });

            } else {

                htmlObject.hover(
                    function () {
                        that.setState('hover');
                        icon.setState('hover');

                    },
                    function () {
                        if (!that.isDisabled()) {                        
                            that.setState('default');
                            icon.setState('default');
                        }
                    }
                );

                htmlObject.bind('mousedown', {}, function(e) {
                    if (that.isDisabled()) return;
                    that.setState('active');
                    icon.setState('active');

                    htmlObject._state = 'active';
                });

                htmlObject.bind('mouseup', {}, function(e) {
                    if (!that.isDisabled()) {
                        that.setState('hover');
                        icon.setState('hover');
                    }

                    htmlObject._state = null;
                });

                htmlObject.focusin(function() {
                    if (htmlObject._state != 'active') {
                        that.setState('focus');
                    }
                });

                htmlObject.focusout(function() {
                    that.setState('default');
                });   
                /*
                 * ------------ </MOUSE EVENTS> ------------
                 */
            }


   
        },

        /**
         * Custom setState function
         * @method setState
         * @param {string} state : value of the state
         */
         setState : function setState (state) { 
            var icon;
                         
            /*
             * Call super class setState function
             */
            WAF.Widget.prototype.setState.apply(this, arguments);

            if (state == "active") {
                // do not append class as it is added when calling parent method
                // this.$domNode.addClass("waf-state-active");
            } else {
                this.$domNode.removeClass("waf-state-active");
            }

            /*
             * Set icon state
             */
             icon = this.getIcon();
             icon.setState(state);
         },
        
        /**
         * Get icon state
         * @method _getIconState
         * @return {string} state value
         */
        _getIconState : function buttonImage_get_icon_state () {
            var
            nState;

            switch(state) {
                case 'waf-state-hover':
                    nState = 'waf-state-state2';
                    break;

                case 'waf-state-active':
                    nState = 'waf-state-state3';
                    break;                        

                case 'waf-state-disabled':
                    nState = 'waf-state-state4';
                    break;

                default:
                    nState = 'waf-state-state1';
                    break;
            }
            
            return nState;
        },
        
        /**
         * Get icon widget
         * @method getIcon
         * @return {object} icon widget
         */
        getIcon : function buttonImage_get_icon () {
            return this.getLinks()[0];
        },
        
        
        /**
         * Custom getValue function
         * @method getValue
         * @param {string} value
         */
        getValue : function buttonImage_set_value (value) {
            return this.$domNode.text();
        },
        
        /**
         * Custom setValue function
         * @method setValue
         * @param {string} value
         */
        setValue : function buttonImage_set_value (value) {
            this.$domNode.text(value);
        },      
        
        /**
         * Custom disable function (enable sub widgets)
         * @method enable
         */
        disable : function buttonImage_disable() {
            /*
             * Disable icon
             */
            this.getIcon().disable();
            
            // remove over effect if any
            this.$domNode.trigger('mouseout');            
            
            /*
             * Call super class disable function
             */
            WAF.Widget.prototype.disable.call(this);
        },        
        
        /**
         * Custom enable function (enable sub widgets)
         * @method enable
         */
        enable : function buttonImage_enable() {  
            /*
             * Enable icon
             */
            this.getIcon().enable();      

            /*
             * Call super class enable function
             */
            WAF.Widget.prototype.enable.call(this);    
        },
        
        setURL : function(lnk, target) {
            if (target) {
                this.$domNode.attr('data-target', target);
            }
            this.$domNode.attr('data-link', lnk);
        },
        getURL : function() {
            return this.$domNode.attr('data-link');
        }
    }
);
