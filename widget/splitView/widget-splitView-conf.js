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
WAF.addWidget({

    /**
    *  Widget Descriptor
    *
    */

    /* PROPERTIES */
    packageName: 'Widget/splitView',
    // {String} internal name of the widget
    type        : 'splitView',

    // {String} library used ('waf', 'jquery', 'extjs', 'yui') (optional)
    lib         : 'WAF',

    // {String} display name of the widget in the GUI Designer
    description : 'Split View',

    // {String} category in which the widget is displayed in the GUI Designer
    category    : 'Containers/Placeholders',

    // {String} image of the tag to display in the GUI Designer (optional)
    img         : '/walib/WAF/widget/splitView/icons/widget-splitView.png',

    // {Array} css file needed by widget (optional)
    css         : [],

    // {Array} script files needed by widget (optional)
    include     : [],

    // {String} type of the html tag ('div' by default)
    tag         : 'div',

    containArea : true,

    // {Array} attributes of the widget. By default, we have 3 attributes: 'data-type', 'data-lib', and 'id', so it is unnecessary to add them
    //
    // @property {String} name, name of the attribute (mandatory)
    // @property {String} description, description of the attribute (optional)
    // @property {String} defaultValue, default value of the attribute (optional)
    // @property {'string'|'radio'|'checkbox'|'textarea'|'dropdown'|'integer'} type, type of the field to show in the GUI Designer (optional)
    // @property {Array} options, list of values to choose for the field shown in the GUI Designer (optional)
    attributes  : [
    {
        name            : 'data-theme',
        visibility      : 'hidden',
        defaultValue    : 'inherited'
    }],

    // {Array} default height and width of the container for the widget in the GUI Designer
    //
    // @property {String} name, name of the attribute
    // @property {String} defaultValue, default value of the attribute
    style: [
    {
        name        : 'width',
        defaultValue: '40px'
    },
    {
        name        : 'height',
        defaultValue: '40px'
    }],

    // {Array} events ot the widget
    //
    // @property {String} name, internal name of the event (mandatory)
    // @property {String} description, display name of the event in the GUI Designer
    // @property {String} category, category in which the event is displayed in the GUI Designer (optional)
    events: [ ],

    // {JSON} panel properties widget
    //
    // @property {Object} enable style settings in the Styles panel in the Properties area in the GUI Designer
    properties: {
        style: {
            theme       : true,                 // false to not display the "Theme" option in the "Theme & Class" section

            //    theme : {
            //    	roundy: false		//all the default themes are displayed by default. Pass an array with the
            //   }				//themes to hide ('default', 'inherited', roundy, metal, light)

            fClass      : true,                 // true to display the "Class" option in the "Theme & Class" section
            text        : true,                 // true to display the "Text" section
            background  : true,                 // true to display widget "Background" section
            border      : true,                 // true to display widget "Border" section
            sizePosition: true,                 // true to display widget "Size and Position" section
            label       : true,                 // true to display widget "Label Text" and "Label Size and Position" sections
            // For these two sections, you must also define the "data-label" in the Attributes array
            disabled     : ['border-radius']     // list of styles settings to disable for this widget
        }
    },

	structure: [

    ],

    /* METHODS */

    /*
    * function to call when the widget is loaded by WAF during runtime
    *
    * @param {Object} config contains all the attributes of the widget
    * @result {WAF.widget.Template} the widget
    */
    onInit: function (config) {
        var widget = new WAF.widget.SplitView(config);
        return widget;
    },

    /**
    * function to call when the widget is displayed in the GUI Designer
    *
    * @param {Object} config contains all the attributes for the widget
    * @param {Designer.api} set of functions used to be managed by the GUI Designer
    * @param {Designer.tag.Tag} container of the widget in the GUI Designer
    * @param {Object} catalog of dataClasses defined for the widget
    * @param {Boolean} isResize is a resize call for the widget (not currently available for custom widgets)
    */
    onDesign: function (config, designer, tag, catalog, isResize) {

         /*
         * Apply theme on widget theme's change
         */
         tag.onChangeTheme = function(theme) {
            /*var
            group;

            group = D.getGroup(this.getGroupId());

            if (group) {
                group.applyTheme(theme, this);
            }*/
        }

        window.setTimeout(function(){

            $(".waf-splitView-menuButton").hide();

        }, 0);

    },
    /**
     * call the first time in order to build the widget
     * @param {Designer.tag.Tag} container of the widget in the GUI Designer
     */
    onCreate: function ( tag , param) {

        $(tag).bind("onReady", function(){
            this.fix();

            var linkedWidget = this.getLinks();
            $.each(linkedWidget, function(index, value) {
                value.fix();
            });

        });


         if (!param._isLoaded) {

            $(tag).bind("onWidgetDrop", function(){
                this.setXY( 0, 0, true, true );
            });


            tag.forceTopConstraint();
            tag.forceLeftConstraint();
            tag.forceBottomConstraint();
            tag.forceRightConstraint();
            tag.setXY( 0, 0, true, true );
            tag.setPositionRight( "0px", true, true );
            tag.setPositionBottom( "0px", true, true );
            tag.updateZindex (0);

            window.setTimeout(function(){

                createStructure();

            }, 0);


         }


        function createStructure() {

            var
            containerDef    = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('container')),
            buttonDef       = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('button')),
            navViewDef      = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('navigationView')),
            container       = new Designer.tag.Tag(containerDef),
            widID           = tag.getId(),
            content,
            splittedContainer0,
            splittedContainer1;


            //the group
            tag.group = new Designer.ui.group.Group();
            group = tag.group;
            group.add(tag);

            //content
            content = new Designer.tag.Tag(containerDef);

            content.create({
            width      : tag.getWidth(),
            height     : tag.getHeight(),
            silentMode : true
            });

            content.setXY( 0, 0, true );
            content.getAttribute("data-hideSplitter").setValue("true");
            content.setParent( tag );
            content.forceTopConstraint();
            content.forceLeftConstraint();
            content.forceBottomConstraint();
            content.forceRightConstraint();
            group.add(content);
            content.fix();
            tag.link(content);
            content.setPositionBottom( "0px", true, true );
            content.setPositionRight( "0px", true, true );


            //split the main container
            content.split({
                position: 300
            });

            //get both the new containers created
            splittedContainer0 = content._containers[0];
            splittedContainer1 = content._containers[1];

            splittedContainer0.forceTopConstraint();
            splittedContainer0.forceLeftConstraint();

            splittedContainer1.forceTopConstraint();
            splittedContainer1.forceLeftConstraint();
            splittedContainer1.forceBottomConstraint();
            splittedContainer1.forceRightConstraint();
            splittedContainer1.setPositionBottom( "0px", true, true );
            splittedContainer1.setPositionRight( "0px", true, true );

            tag.link(splittedContainer0);
            tag.link(splittedContainer1);

            //navigation view
            nav = new Designer.tag.Tag(navViewDef);
            nav.create({
            width      : splittedContainer0.getWidth(),
            height     : splittedContainer0.getHeight(),
            silentMode : true,
            group      : group
            });
            nav.setXY( 0, 0, true );
            nav.setParent( splittedContainer0 );

            nav.setPositionBottom( "0px", true, true );
            nav.setPositionRight( "0px", true, true );
            nav.forceTopConstraint();
            nav.forceLeftConstraint();
            nav.forceRightConstraint();
            nav.forceBottomConstraint();
            //group.add(nav);

            //navigation view
            nav2 = new Designer.tag.Tag(navViewDef);
            nav2.create({
            width      : splittedContainer1.getWidth(),
            height     : splittedContainer1.getHeight(),
            silentMode : true,
            group      : group
            });
            nav2.setXY( 1, 0, true );
            nav2.setParent( splittedContainer1 );

            nav2.setPositionBottom( "0px", true, true );
            nav2.setPositionRight( "0px", true, true );
            nav2.forceTopConstraint();
            nav2.forceBottomConstraint();
            nav2.forceLeftConstraint();
            nav2.forceRightConstraint();
            //group.add(nav2);

            //button
            button = new Designer.tag.Tag(buttonDef);
            button.addContext(D.env.tagAttributes.context["protected"]);
            button.create({
                width:60,
                silentMode : true
            });
            button.getAttribute("data-text").setValue("Menu");
            button.getAttribute("class").setValue("waf-splitView-menuButton")
            button.setXY( 100, 7, true );
            button.setParent( splittedContainer1 );
            //group.add(button);

            //set button role
            content.getAttribute("data-popup-display-button").setValue(button.getId());

            content.domUpdate();

            //save group
            Designer.ui.group.save();

            $(".waf-splitView-menuButton").hide();

            //nav.addContext(D.env.tagAttributes.context["protected"]);
            //nav2.addContext(D.env.tagAttributes.context["protected"]);
            /*
            * Apply theme
            */
            //group.applyTheme(tag.getTheme(), tag);

        }

    }

});
