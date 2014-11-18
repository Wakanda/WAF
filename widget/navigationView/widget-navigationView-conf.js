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
    packageName: 'Widget/navigationView',
    // {String} internal name of the widget
    type: 'navigationView',
    // {String} library used ('waf', 'jquery', 'extjs', 'yui') (optional)
    lib: 'WAF',
    // {String} display name of the widget in the GUI Designer
    description: 'Navigation View',
    // {String} category in which the widget is displayed in the GUI Designer
    category: 'Containers/Placeholders',
    // {String} image of the tag to display in the GUI Designer (optional)
    img: '/walib/WAF/widget/navigationView/icons/widget-navigationView.png',
    // {Array} css file needed by widget (optional)
    css: [],
    // {Array} script files needed by widget (optional)
    include: [],
    // {String} type of the html tag ('div' by default)
    tag: 'div',
    getActiveContainer: function() {
        var views = this.getChildren()[0],
            activeView = views.getHtmlObject().find('.waf-navigationView-view:visible'),
            activeContainer = null;

        if (activeView.length) {
            activeContainer = D.tag.getTagById(activeView.attr('id')).getChildren()[1];
        }

        return activeContainer;
    },
    // {Array} attributes of the widget. By default, we have 3 attributes: 'data-type', 'data-lib', and 'id', so it is unnecessary to add them
    //
    // @property {String} name, name of the attribute (mandatory)
    // @property {String} description, description of the attribute (optional)
    // @property {String} defaultValue, default value of the attribute (optional)
    // @property {'string'|'radio'|'checkbox'|'textarea'|'dropdown'|'integer'} type, type of the field to show in the GUI Designer (optional)
    // @property {Array} options, list of values to choose for the field shown in the GUI Designer (optional)
    attributes: [
        {
            name: 'data-theme',
            visibility: 'hidden',
            defaultValue: 'inherited'
        },
        {
            name: '',
            description: '',
            defaultValue: '',
            type: '',
            options: []

        },
        {
            name: 'is-container',
            type: 'boolean',
            defaultValue: true,
            visibility: 'hidden',
        },
        {
            name: 'data-title',
            defaultValue: '',
            description: 'Title'
        },
        {
            name: 'data-views',
            description: 'Views',
            type: 'grid',
            defaultValue: "[{'Description':'New View', 'Index':'1'}]",
            //defaultValue : "[]",
            reloadOnChange: true,
            displayEmpty: true, // if false grid is hidden if empty
            newRowEmpty: false,
            columns: [
                {
                    name: 'Description',
                    type: 'textField'
                },
                {
                    name: 'Index',
                    type: 'textField',
                    disabled: true
                }
            ],
            onRowClick: function(data) {

                var
                index = data.getIndex(),
                tag = this.getData().tag,
                widID = tag.getId(),
                viewIndex = data._items[1].getValue(),
                viewTag = Designer.tag.getTagById($("#" + widID).find(".waf-navigation-view" + viewIndex).prop("id")),
                views = tag.getAttribute("data-views"),
                viewsValue,
                viewID,
                tags,
                theID,
                viewObj;

                viewObj = views.getValue();
                viewObj = $('<div/>').html(viewObj).text();
                viewsValue  = JSON.parse(viewObj.replace(/'/g, '"'));

                $('#waform-form-gridmanager-views-grid tr').removeClass('waform-state-selected');
                tag._selectedRow = index;
                $('#waform-form-gridmanager-views-grid tr[data-position=' + index + ']').addClass('waform-state-selected');

                tags = $("#" + widID).find(".waf-navigation-view" + viewIndex);

                $.each(tags, function(i, v) {
                    if (v.id.split("-")[3] != "deleted") {
                        Designer.tag.getTagById(v.id).show();
                    }
                });

                $.each(viewsValue, function(index, value) {
                    tags = $("#" + widID).find(".waf-navigation-view" + value.Index);
                    $.each(tags, function(i, v) {
                        theID = $(v).prop("id");
                        if (theID.split("-")[3] != "deleted") {
                            viewID = theID;
                        }
                    });

                    //viewID = $("#"+widID).find(".waf-navigation-view"+value.Index).prop("id");

                    if (viewID.split("-")[3] != "deleted" && value.Index != viewIndex) {
                        Designer.tag.getTagById(viewID).hide();
                    }
                });


            },
            beforeRowAdd: function(data) {

            },
            afterRowAdd: function(data) {

                var
                tag = this.getData().tag,
                widID = tag.getId(),
                action;

                Designer.beginUserAction('072');

                action = new Designer.action.AddNavigationView({
                    val: '0',
                    oldVal: '1',
                    tagId: this.id,
                    data: {
                        widgetId: widID,
                        widgetData: data
                    }
                });

                Designer.getHistory().add(action);

                this.data.tag.addNewView(data);

            },
            beforeRowDelete: function(data) {

                var
                tag = this.getData().tag,
                widID = tag.getId(),
                action;

                Designer.beginUserAction('073');

                action = new Designer.action.deleteNavigationView({
                    val: '0',
                    oldVal: '1',
                    tagId: this.id,
                    data: {
                        widgetId: widID,
                        widgetData: data
                    }
                });

                Designer.getHistory().add(action);

            },
            afterRowDelete: function(data) {

                this.data.tag.deleteView(data);

            },
            ready: function() {

                var
                tag = this.getData().tag;

                if (tag._selectedRow === null) {

                } else {
                    window.setTimeout(function() {
                        $('#waform-form-gridmanager-views-grid tr[data-position=' + tag._selectedRow + ']').addClass('waform-state-selected');
                    }, 0);
                }


            }
        }
    ],
    // {Array} default height and width of the container for the widget in the GUI Designer
    //
    // @property {String} name, name of the attribute
    // @property {String} defaultValue, default value of the attribute
    style: [
        {
            name: 'width',
            defaultValue: '40px'
        },
        {
            name: 'height',
            defaultValue: '40px'
        }],
    // {Array} events ot the widget
    //
    // @property {String} name, internal name of the event (mandatory)
    // @property {String} description, display name of the event in the GUI Designer
    // @property {String} category, category in which the event is displayed in the GUI Designer (optional)
    events: [
        {
            name: 'touchmove',
            description: 'On Touch Move',
            category: 'Touch Events'
        },
        {
            name: 'touchstart',
            description: 'On Touch Start',
            category: 'Touch Events'
        },
        {
            name: 'touchend',
            description: 'On Touch End',
            category: 'Touch Events'
        },
        {
            name: 'touchcancel',
            description: 'On Touch Cancel',
            category: 'Touch Events'
        }/*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/],
    // {JSON} panel properties widget
    //
    // @property {Object} enable style settings in the Styles panel in the Properties area in the GUI Designer
    properties: {
        style: {
            theme: true, // false to not display the "Theme" option in the "Theme & Class" section

            //    theme : {
            //    	roundy: false		//all the default themes are displayed by default. Pass an array with the
            //   }				//themes to hide ('default', 'inherited', roundy, metal, light)

            fClass: true, // true to display the "Class" option in the "Theme & Class" section
            text: true, // true to display the "Text" section
            background: true, // true to display widget "Background" section
            border: true, // true to display widget "Border" section
            sizePosition: true, // true to display widget "Size and Position" section
            label: true, // true to display widget "Label Text" and "Label Size and Position" sections
            // For these two sections, you must also define the "data-label" in the Attributes array
            disabled: ['border-radius']     // list of styles settings to disable for this widget
        }
    },
    structure: [
        {
            description: 'header',
            selector: '.waf-navigationView-header',
            style: {
                background: true,
                gradient: true,
                border: true,
                text: true,
                textShadow: true
            }
        },
        {
            description: 'content',
            selector: '.waf-navigationView-view',
            style: {
                background: true,
                gradient: true
            }
        },
        {
            description: 'footer',
            selector: '.waf-navigationView-footer',
            style: {
                background: true,
                gradient: true,
                border: true,
                text: true,
                textShadow: true
            }
        }
    ],
    /* METHODS */

    /*
     * function to call when the widget is loaded by WAF during runtime
     *
     * @param {Object} config contains all the attributes of the widget
     * @result {WAF.widget.Template} the widget
     */
    onInit: function(config) {

        var widget = new WAF.widget.NavigationView(config);

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
    onDesign: function(config, designer, tag, catalog, isResize) {

        if (tag.previousID) {
            if (tag.previousID != config.id) {


                tag.previousID = config.id;
                var newID = config.id;
                /**
                 * allow to set a widget as current widgets (select)
                 * @method selectWidget
                 * @param {string} widID : widget's id
                 */
                tag.selectWidget = null;
                tag.selectWidget = function() {
                    window.setTimeout(function() {
                        var tag = Designer.tag.getTagById(newID);
                        tag.setCurrent();
                        Designer.tag.refreshPanels();
                    }, 0);
                }
            }
        }

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

        /*if (tag.addBackButton) {
         tag.addBackButton();
         }*/

    },
    /**
     * call the first time in order to build the widget
     * @param {Designer.tag.Tag} container of the widget in the GUI Designer
     */
    onCreate: function(wid, param) {

        $(wid).bind("onReady", function() {

            this.fix();
            this.resizeHandles = 'none';

            var linkedWidget = this.getLinks();
            $.each(linkedWidget, function(index, value) {
                value.fix();
                value.resizeHandles = 'none';
            });

        });

        wid.previousID = wid.getId();

        var context = D.env.tagAttributes.context.tag,
        contextProtected = D.env.tagAttributes.context["protected"],
        contextAllowBind = D.env.tagAttributes.context["allowBind"],
        contextAllowDrop = D.env.tagAttributes.context["allowDrop"],
        contextAllowPaste = D.env.tagAttributes.context["allowPaste"];
        contextAllowRemove = D.env.tagAttributes.context["allowRemove"];

        wid.addContext(contextProtected + " " + contextAllowDrop + " " + contextAllowRemove);

        if (!wid.addNewView) {

            wid.selectFromOutline = function(view) {

                var widget = wid,
                viewIndex,
                widID = widget.getId(),
                viewTag = view,
                views = widget.getAttribute("data-views"),
                viewsValue,
                classes = $("#" + view.getId()).get()[0].className.split(" "),
                that = this,
                sp,
                viewID,
                theID,
                index,
                tags,
                viewObj = views.getValue();

                viewObj = $('<div/>').html(viewObj).text();
                viewsValue = JSON.parse(viewObj.replace(/'/g, '"'));

                $.each(classes, function(index, value) {
                    sp = value.split("waf-navigation-view");

                    if (sp[1] != undefined) {
                        that.index = parseInt(sp[1]);
                        return false;
                    }
                });

                viewIndex = this.index;

                tags = $("#" + widID).find(".waf-navigation-view" + viewIndex);

                $.each(tags, function(i, v) {
                    if (v.id.split("-")[3] != "deleted") {
                        Designer.tag.getTagById(v.id).show();
                    }
                });

                $.each(viewsValue, function(index, value) {
                    tags = $("#" + widID).find(".waf-navigation-view" + value.Index);
                    $.each(tags, function(i, v) {
                        theID = $(v).prop("id");
                        if (theID.split("-")[3] != "deleted") {
                            viewID = theID;
                        }
                    });

                    if (viewID.split("-")[3] != "deleted" && value.Index != viewIndex) {
                        Designer.tag.getTagById(viewID).hide();
                    }

                    if (parseInt(value.Index) === viewIndex) {
                        widget._selectedRow = index;
                    }
                });

                wid.selectWidget(view.getId());

            }


            /**
             * build a new view into the widget
             * @method addNewView
             * @param {object} data : data-views
             */
            wid.addNewView = function(data) {

                var
                wid = this,
                view,
                views = wid.getAttribute("data-views"),
                viewsValue,
                viewIndex = 1,
                group = Designer.getGroup(wid.getGroupId()),
                containerDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('container')),
                titleDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('richText')),
                buttonDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('button')),
                widID = wid.getId(),
                body,
                title,
                header,
                titleDef,
                backButton,
                indexArray,
                viewID,
                viewObj = views.getValue();

                viewObj = $('<div/>').html(viewObj).text();
                viewsValue = JSON.parse(viewObj.replace(/'/g, '"'));

                /*
                 * just compare 2 values
                 */
                function compare(a, b) {
                    return a - b;
                }

                if (wid._selectedRow != null) {
                    $('#waform-form-gridmanager-views-grid tr').removeClass('waform-state-selected');
                    //$('#waform-form-gridmanager-views-grid tr[data-position=' + wid._selectedRow + ']').removeClass('waform-state-selected');
                    $.each(viewsValue, function(index, value) {
                        if (index === wid._selectedRow) {
                            viewID = $("#" + widID).find(".waf-navigation-view" + value.Index).prop("id");
                            if (viewID.split("-")[3] != "deleted") {
                                Designer.tag.getTagById(viewID).hide();
                            }
                        }
                    });
                }

                wid._selectedRow = viewsValue.length;
                $('#waform-form-gridmanager-views-grid tr[data-position=' + wid._selectedRow + ']').addClass('waform-state-selected');

                //find available index to use
                indexArray = [];

                $.each(viewsValue, function(index, value) {
                    indexArray.push(parseInt(value["Index"]));
                });

                indexArray.sort(compare);

                //set index value
                if (data) {

                    $.each(indexArray, function(idx, val) {
                        if (val === viewIndex) {
                            viewIndex++;
                        }
                    });

                    data.items[1].setValue(viewIndex);
                }

                // view
                view = new Designer.tag.Tag(containerDef);
                //view.addAttribute(context);
                //view.getAttribute(context).setValue('["'+contextProtected+'", "'+contextAllowDrop+'"]');
                view.addContext(contextProtected + " " + contextAllowDrop);
                view.create({
                    id: D.tag.getNewId("view"),
                    width: wid.getWidth(),
                    height: wid.getHeight(),
                    silentMode: true
                });
                view._linkedWidget = wid//._content;
                view.setXY(0, 0, true);
                view.addClass('waf-navigationView-view waf-navigation-view' + viewIndex); //
                view.setParent(wid.getChildren()[0]); //wid._content
                view.forceTopConstraint();
                view.forceBottomConstraint();
                view.forceLeftConstraint();
                view.forceRightConstraint();
                view.setPositionBottom("0px", true, true);
                view.setPositionRight("0px", true, true);
                group.add(view);
                wid.link(view);

                $("#" + view.getId()).click(
                function(e) {
                    if (!e.altKey) {
                        event.stopPropagation();
                        event.preventDefault();
                        wid.selectWidget(widID);
                    }
                }
                );

                //lock the widget
                view.fix();


                //header
                header = new Designer.tag.Tag(containerDef);
                //header.addAttribute(context);
                //header.getAttribute(context).setValue('["'+contextProtected+'", "'+contextAllowDrop+'"]');
                header.addContext(contextProtected + " " + contextAllowDrop);
                header.create({
                    id: D.tag.getNewId("header"),
                    width: wid.getWidth(),
                    height: "44px",
                    silentMode: true
                });
                header._linkedWidget = view;
                header.setXY(0, 0, true);
                header.addClass('waf-navigationView-header waf-widget-header');
                header.setParent(view);
                header.forceTopConstraint();
                header.forceRightConstraint();
                header.forceLeftConstraint();
                header.setPositionRight("0px", true, true);
                group.add(header);
                wid.link(header);
                header.resizeHandles = 'none';
                $("#" + header.getId()).click(
                function(e) {
                    if (!e.altKey) {
                        event.stopPropagation();
                        event.preventDefault();
                        wid.selectWidget(widID);
                    }
                }
                );

                //lock the widget
                header.fix();

                //title
                title = new Designer.tag.Tag(titleDef);
                title.create({
                    id: D.tag.getNewId("title"),
                    width: wid.getWidth(),
                    height: "44px",
                    silentMode: true
                });
                title.getAttribute("data-text").setValue("View " + viewIndex);
                title.getAttribute("data-autoWidth").setValue("false");
                title.setXY(0, 0, true);
                title.addClass('waf-navigationView-title');
                title.setParent(header);
                title.forceTopConstraint();
                title.forceRightConstraint();
                title.forceLeftConstraint();
                title.forceBottomConstraint();
                title.setPositionRight("0px", true, true);
                title.setPositionBottom("0px", true, true);
                group.add(title);
                wid.link(title);
                title.resizeHandles = 'none';
                $("#" + title.getId()).click(
                function(e) {
                    if (!e.altKey) {
                        event.stopPropagation();
                        event.preventDefault();
                        wid.selectWidget(widID);
                    }
                }
                );


                //lock the widget
                title.fix();

                //back button
                backButton = new Designer.tag.Tag(buttonDef);
                //backButton.addAttribute(context);
                //backButton.getAttribute(context).setValue('["'+contextProtected+'"]');
                backButton.addContext(contextProtected);
                backButton.create({
                    id: D.tag.getNewId("backButton"),
                    width: "50px",
                    height: "29px",
                    silentMode: true
                });
                backButton.getAttribute("data-text").setValue("Back");
                backButton.addClass('waf-navigationView-header-back-button');
                backButton.setXY(20, 7, true);
                backButton.setParent(header);
                backButton.resizeHandles = 'none';
                $("#" + backButton.getId()).click(
                function(e) {
                    if (!e.altKey) {
                        event.stopPropagation();
                        event.preventDefault();
                        wid.selectWidget(widID);
                    }
                }
                );

                //content of the view
                body = new Designer.tag.Tag(containerDef);
                body.addContext(contextProtected + " " + contextAllowDrop + " " + contextAllowBind + " " + contextAllowPaste);
                body.create({
                    id: D.tag.getNewId("body"),
                    width: wid.getWidth(),
                    height: wid.getHeight(),
                    silentMode: true
                });
                body._linkedWidget = view;
                body.setXY(0, 44, true);
                body.addClass('waf-widget-body waf-navigationView-body');
                body.setParent(view);
                body.forceRightConstraint();
                body.forceLeftConstraint();
                body.forceBottomConstraint();
                body.setPositionBottom("0px", true, true);
                group.add(body);
                wid.link(body);
                body.resizeHandles = 'none';

                $("#" + body.getId()).click(
                function(e) {
                    if (!e.altKey) {
                        event.stopPropagation();
                        event.preventDefault();
                        wid.selectWidget(widID);
                    }
                }
                );

                //lock the widget
                body.fix();


                /*
                 * Apply theme
                 */
                //group.applyTheme(wid.getTheme(), wid);
                Designer.ui.group.save();

                $.each(viewsValue, function(index, value) {

                    viewID = $("#" + widID).find(".waf-navigation-view" + value.Index).prop("id");
                    if (viewID.split("-")[3] != "deleted") {
                        if (value.Index != viewIndex) {
                            Designer.tag.getTagById(viewID).hide();
                        } else {
                            Designer.tag.getTagById(viewID).show();
                        }
                    }
                });

            };

            /**
             * remove a view from the widget
             * @method deleteView
             * @param {object} data : data-views
             */
            wid.deleteView = function(data) {

                /*var
                 tag     = this.getData().tag,
                 widID   = tag.getId(),
                 action;*/

                var
                wid = this,
                widID = wid.getId(),
                viewIndexToRm = data.items[1].getValue(),
                viewID, //= $("#"+widID).find(".waf-navigation-view"+viewIndexToRm).prop("id"),
                tag, //= Designer.tag.getTagById(viewID),
                newIndex,
                views,
                viewsValue,
                tags,
                viewObj;

                tags = $("#" + widID).find(".waf-navigation-view" + viewIndexToRm);
                $.each(tags, function(i, v) {
                    theID = $(v).prop("id");
                    if (theID.split("-")[3] != "deleted") {
                        viewID = theID;
                    }
                });

                tag = Designer.tag.getTagById(viewID);
                Designer.tag.deleteWidgets(tag, true, true);
                $("#" + viewID).parent().parent().remove();
                Designer.tag.setCurrent(wid);
                Designer.tag.refreshPanels();
                wid.setResizable(true);

                views = wid.getAttribute("data-views");

                viewObj = views.getValue();
                viewObj = $('<div/>').html(viewObj).text();

                viewsValue = JSON.parse(viewObj.replace(/'/g, '"'));

                if (!viewsValue[data.index]) {
                    newIndex = data.index - 1;
                } else {
                    newIndex = data.index;
                }

                newIndex = parseInt(newIndex);

                if (newIndex != undefined && newIndex >= 0) {

                    viewTag = Designer.tag.getTagById($("#" + widID).find(".waf-navigation-view" + viewsValue[newIndex].Index).prop("id"));
                    tag._selectedRow = newIndex;

                    $('#waform-form-gridmanager-views-grid tr[data-position=' + newIndex + ']').addClass('waform-state-selected');

                    viewTag.show();
                }
            };

            /**
             * allow to set a widget as current widgets (select)
             * @method selectWidget
             * @param {string} widID : widget's id
             */
            wid.selectWidget = function(widID) {
                window.setTimeout(function() {
                    var tag = Designer.tag.getTagById(widID);
                    tag.setCurrent();
                    Designer.tag.refreshPanels();
                }, 0);
            }
        }

        var htmlObj = wid.getHtmlObject();

        /**
         * add back button markup to all views
         * @method addBackButton
         */
        /*wid.addBackButton = function() {
         var views = JSON.parse(wid.getAttribute("data-views").getValue().replace(/'/g, '"'));
         var widID = wid.getId();
         var $header;

         $.each(views, function(index, value) {
         if (index != 0) {
         $header = $("#"+widID+"_header"+value.Index +" .bd");
         $header.append('<div class="waf-navigationView-header-back-button"><span>Back</span></div>');
         }

         });
         }*/

        /*
         * Create structure if no init has been done else apply events
         */
        if (!param._isLoaded) { //!wid.getAttribute("data-initDone")

            $(wid).bind("onWidgetDrop", function() {
                this.setXY(0, 0, true, true);
            });

            wid.forceTopConstraint();
            wid.forceLeftConstraint();
            wid.forceBottomConstraint();
            wid.forceRightConstraint();
            wid.setPositionRight("0px", true, true);
            wid.setPositionBottom("0px", true, true);
            wid.setXY(0, 0, true, true);
            wid.updateZindex(0);


            //wid.addAttribute("data-initDone");
            //wid.getAttribute("data-initDone").setValue("true");
            createStructure();

        } else {

            window.setTimeout(function() {

                var viewObj = wid.getAttribute("data-views").getValue();
                viewObj = $('<div/>').html(viewObj).text();
                var views = JSON.parse(viewObj.replace(/\'/g, '"'));
                widID = wid.getId(),
                $wid = $("#" + widID);

                $.each(views, function(i, value) {

                    Designer.tag.getTagById($wid.find(".waf-navigation-view" + value.Index).attr("id"))._linkedWidget = wid;

                    $wid.find(".waf-navigationView-view").click(
                    function(e) {
                        if (!e.altKey) {
                            event.stopPropagation();
                            event.preventDefault();
                            wid.selectWidget(widID);
                        }
                    }
                    );
                    $wid.find(".waf-widget-header").click(
                    function(e) {
                        if (!e.altKey) {
                            event.stopPropagation();
                            event.preventDefault();
                            wid.selectWidget(widID);
                        }
                    }
                    );

                    $wid.find(".waf-navigationView-title").click(
                    function(e) {
                        if (!e.altKey) {
                            event.stopPropagation();
                            event.preventDefault();
                            wid.selectWidget(widID);
                        }
                    }
                    );

                    $wid.find(".waf-navigationView-header-back-button").click(
                    function(e) {
                        if (!e.altKey) {
                            event.stopPropagation();
                            event.preventDefault();
                            wid.selectWidget(widID);
                        }
                    }
                    );

                    $wid.find(".waf-navigationView-body").click(
                    function(e) {
                        if (!e.altKey) {
                            event.stopPropagation();
                            event.preventDefault();
                            wid.selectWidget(widID);
                        }
                    }
                    );
                });

                $wid.find(".waf-navigationView-content").click(
                function(e) {
                    if (!e.altKey) {
                        event.stopPropagation();
                        event.preventDefault();
                        wid.selectWidget(widID);
                    }
                }
                );

                $wid.find(".waf-widget-footer").click(
                function(e) {
                    if (!e.altKey) {
                        event.stopPropagation();
                        event.preventDefault();
                        wid.selectWidget(widID);
                    }
                }
                );


                /*
                 * Select first views
                 */
                wid._selectedRow = 0;
                var elem;
                var done = false;
                $.each(views, function(index, value) {
                    //elem =  $wid.find(".view"+value.Index);
                    //if (elem.length != 0) {
                    if (done) {
                        Designer.tag.getTagById($("#" + widID).find(".waf-navigation-view" + value.Index).prop("id")).hide();
                    } else {
                        done = true;
                    }

                    //}
                });

                /*elem = $wid.find(".view1");
                 if (elem.length != 0) {
                 Designer.tag.getTagById(elem.prop("id"));
                 }*/

                //wid.addBackButton();

            }, 0);


        }

        /**
         * build main widget structure
         * @method createStructure
         */
        function createStructure() {

            var
            containerDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('container')),
            container = new Designer.tag.Tag(containerDef),
            header,
            content,
            footer,
            group,
            widID = wid.getId();

            wid.resizeHandles = 'none';


            //the group
            if (param.group) {
                wid.group = param.group;
            } else {
                wid.group = new Designer.ui.group.Group();
            }

            group = wid.group;
            group.add(wid);

            //content
            content = new Designer.tag.Tag(containerDef);
            //content.addAttribute(context);
            //content.getAttribute(context).setValue('["'+contextProtected+'", "'+contextAllowDrop+'"]');
            content.addContext(contextProtected + " " + contextAllowDrop);
            content.create({
                id: D.tag.getNewId("viewManager"),
                width: wid.getWidth(),
                height: "418px",
                silentMode: true
            });
            //content._linkedWidget = container;
            content.setXY(0, 0, true);
            content.addClass('waf-navigationView-content');
            content.setParent(wid);//container
            content.forceTopConstraint();
            content.forceBottomConstraint();
            content.forceLeftConstraint();
            content.forceRightConstraint();
            content.setPositionBottom("44px", true, true);
            content.setPositionRight("0px", true, true);
            group.add(content);
            wid.link(content);
                       content.resizeHandles = 'none';

            $("#" + content.getId()).click(
            function(e) {
                if (!e.altKey) {
                    event.stopPropagation();
                    event.preventDefault();
                    wid.selectWidget(widID);
                }
            }
            );

            //lock the widget
            content.fix();

            wid._content = content;

            //footer
            footer = new Designer.tag.Tag(containerDef);
            //footer.addAttribute(context);
            //footer.getAttribute(context).setValue('["'+contextProtected+'", "'+contextAllowDrop+'"]');
            footer.addContext(contextProtected + " " + contextAllowDrop);
            footer.create({
                id: D.tag.getNewId("footer"),
                width: wid.getWidth(),
                height: "47px",
                silentMode: true
            });
            //footer._linkedWidget = container;
            footer.setXY(0, 416, true);
            footer.addClass('waf-widget-footer waf-navigationView-footer');
            footer.setParent(wid); //container
            footer.forceBottomConstraint();
            footer.forceRightConstraint();
            footer.removeTopConstraint();
            footer.setPositionBottom("0px", true, true);
            group.add(footer);
            wid.link(footer);
            footer.resizeHandles = 'none';
            footer.setWidth(wid.getWidth());

            //lock the widget
            footer.fix();

            $("#" + footer.getId()).click(
            function(e) {
                if (!e.altKey) {
                    event.stopPropagation();
                    event.preventDefault();
                    wid.selectWidget(widID);
                }
            }
            );

            Designer.ui.group.save();

            window.setTimeout(function() {
                wid.addNewView();
            }, 0);

        }
        ;
    }

});
