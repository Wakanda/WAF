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
    'Button',   
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
        text,
        that,
        toinnerHTML,
        htmlObject,
        nb,
        thisI;
        
        that        = this;
        htmlObject  = this.$domNode;
        text        = data.text === "" ? data.action : data.text;
        nb          = 0;

        if (this._textValue) {
            text = this._textValue;
        }

        if (data['state-1'] && data.text === "") {
            text = "";
        }

        
        /*
         * Add button text
         */
        toinnerHTML = '<span class="text">' + text  + '</span>';
        
        /*
         * Add 4 states
         */
        for (var i = 1; i <= 4; i +=1) {
            if (data['state-' + i]) {
                toinnerHTML += '<img style="width:' + htmlObject.width() + 'px;height:' + htmlObject.height() + 'px;" src="' + data['state-' + i] + '" class="data-state-' + i +'" />';
                nb += 1;
            }
        }
        
        if (nb === 1) {
            toinnerHTML = '<img style="width:' + htmlObject.width() + 'px;height:' + htmlObject.height() + 'px;" src="' +  data['state-' + i]  + '" class="data-state-1 data-state-2 data-state-3 data-state-4" />';
        }     
        
        htmlObject.html(toinnerHTML);               

        /*
         * Fix button text position
         */
        htmlObject.children('.text').css('margin-top', '-' + parseInt(htmlObject.css('font-size'))/2 + 'px');

        
        /*
         * ------------ <MOUSE EVENTS> ------------
         * To change status
         */
         
         if (WAF.PLATFORM.isTouch) {
             
             htmlObject.bind('touchstart', {}, function(e) {
                that.setState('active');

                 htmlObject._state = 'active';
             });
             
             htmlObject.bind('touchend', {}, function(e) {
                that.setState('default');

                 htmlObject._state = null;
             });
             
         } else {
            htmlObject.hover(
                function () {
                    that.setState('hover');
                },
                function () {
                    that.setState('default');
                }
            );

            htmlObject.bind('mousedown', {}, function(e) {
                that.setState('active');

                htmlObject._state = 'active';
            });

            htmlObject.bind('mouseup', {}, function(e) {
                that.setState('hover');

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
         }
         
             
        /*
         * ------------ </MOUSE EVENTS> ------------
         */

        /*
         * BUTTON NAVIGATION
         */
        /*if (data['link']) {
            htmlObject.bind('click', {}, function(e) {
                switch(data['target']) {
                    case '_blank':
                        window.open(data['link']);
                        break;
                    
                    default :
                        window.location = data['link'];
                        break;
                }
            });
        } */
        
         
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

            var eventAction = "click";

            if (WAF.PLATFORM.isTouch) {
                eventAction = "touchstart";

            }

            htmlObject.bind(eventAction, {}, function(e){
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
        ready : function button_ready () {
            if (this.$domNode.data('action') && (this.$domNode.data('text') === '' || this.$domNode.data('text') == null)) {
                this._textValue = WAF.utils.ucFirst(this.$domNode.data('action'));
                this.$domNode.find('.text').html(this._textValue);
            }
        },

        /**
         * Custom getValue function
         * @method getValue
         * @param {string} value
         */
        getValue : function button_set_value (value) {
            return this.$domNode.text();
        },
        
        /**
         * Custom setValue function
         * @method setValue
         * @param {string} value
         */
        setValue : function button_set_value (value) {
            this.$domNode.text(value);
        },
        
        setURL : function(lnk, target) {
            if (target) {
                this.$domNode.attr('data-target', target);
            }
            this.$domNode.attr('data-link', lnk);
        },
        getURL : function() {
            return this.$domNode.attr('data-link');
        },
        disable : function() {
            this.$domNode.removeClass('waf-state-hover');
            WAF.Widget.prototype.disable.call(this);
        }
    }
);