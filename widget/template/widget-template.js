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
     * TODO: Write a description of this WAF widget
     *
     * @class TODO: give a name to this class (ex: WAF.widget.DataGrid)
     * @extends WAF.Widget
     */
    '', // TODO: set the widget constructor name in CamelCase (ex: "DataGrid")
    
                
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

        // PUT THE CODE OF THE WIDGET HERE

        // /**
        //  * A Private property
        //  *
        //  * @/private
        //  * @/property privateProperty
        //  **/
        // var privateProperty
               
        // /**
        //  * A Private Method
        //  *
        //  * @/private
        //  * @/method privateMethod
        //  **/
        // function privateMethod() {
        //    can work on the widget instance through inWidget
        // }

       
        /* Example of use of a private shared method: */
        
        // result = shared.privateSharedMethod(this);


        /* Example of use of a public shared method (from the prototype of the constructor): */
        
        // result = this.publicSharedMethod();
        
        /* Example of use of a new listener to a specific datasource event */
        
        var eventHandlerFunction = function(event) {
            var widget = event.data.widget;
            var source = event.dataSource;
            
            // PUT THE CODE TO EXECUTE WHEN THE EVENT HAPPENS HERE
        }

        if ('source' in this) {
            this.source.addListener('onAttributeChange', eventHandlerFunction, {
                attributeName: this.att.name
            }, {
                widget:this
            });
        }

    },
    
                
    {
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


    // /**
    //  * A Public shared Method
    //  *
    //  * @/shared
    //  * @/method publicSharedMethod
    //  **/
    // publicSharedMethod: function publicSharedMethod() {
    //    can work on the widget instance through "this"
    // }        
    }

    );
