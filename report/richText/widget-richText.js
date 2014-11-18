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
    'RichText',   
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
        plainText,
        htmlObject;

        config      = config || {};
        htmlObject  = $(this.containerNode);
        plainText   = data.plainText == 'false' || data.plainText === false ? false : true;
        
        /*
         * For binded richtext
         */
        if (this.sourceAtt) {
            this.sourceAtt.addListener(function(e) {          
                if (data.link) {
                    htmlObject.html('<a href="' + data.link + '" target="' + data.target + '">' + e.data.widget.getFormattedValue() + '</a>');
                } else {         
                    htmlObject.html(e.data.widget.getFormattedValue(undefined, plainText));
                }
            }, {
                listenerID      : config.id,
                listenerType    : 'staticText',
                subID           : config.subID ? config.subID : null
            }, {
                widget:this
            });
        } else {
            text = this.getFormattedValue(htmlObject.html());   
            htmlObject.html(text);
        }
        
        text = htmlObject.html().replace(/\n/g, '<br/>');
        
        /*
         * Add link if exists
         */
        if (data.link) {
            htmlObject.html('<a href="' + data.link + '" target="' + data.target + '">' + text + '</a>');
        } else {
            htmlObject.html(text);
        }     
        
        switch (data.overflow) {     
            case 'Horizontal' :
                htmlObject.css({
                    'overflow-x' : 'auto',
                    'overflow-y' : 'hidden'
                });
                break;
                
            case 'Vertical' :
                htmlObject.css({
                    'overflow-x' : 'hidden',
                    'overflow-y' : 'auto'
                });
                break;
                
            case 'Both' :
                htmlObject.css({
                    'overflow-x' : 'auto',
                    'overflow-y' : 'auto'
                });
                break;
                
            case 'Hidden' :
            default :
                break;
        }
        
        /*
         * Remove useless attribute
         */
        htmlObject.removeAttr('data-link');
        
        if (data.autoWidth == 'true') {
            htmlObject.css('width', 'auto');
            htmlObject.css('min-width', htmlObject.width());
        }
    },{
        ready: function() {
            /*
             * Fix bug on "&" special char
             */
            this.$domNode.html(this.$domNode.html().replace(/&amp;/g, '&'));

        },

        setValue : function(value) {
            this.$domNode.html(value);
        }
    }
);

