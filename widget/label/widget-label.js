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
    'Label',   
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
        htmlObject,
        forAttr,
        minWidth;

        htmlObject  = $(this.containerNode);
        
        minWidth    = parseInt(htmlObject.css('min-width'));
        
        /*
         * Remove label if for is unvalid
         */
        forAttr     = htmlObject.prop('for');
        if (forAttr) {
            if ($('#' + htmlObject.prop('for')).length === 0) {
                htmlObject.remove();
            }
        } else {
            htmlObject.remove();
        }

        if (minWidth === 0) {
            //htmlObject.css('width', 'auto');
        }
    }, {
        ready : function () {
            this.linkedWidget = $$(this.$domNode.prop('for'));
            
            /*
             * Hide label on load if associated widget is hidden
             */
            if (this.linkedWidget && this.linkedWidget.$domNode && this.linkedWidget.$domNode.attr('data-hideonload') === 'true') {
                this.hide();
            }
        }
    }
);
    