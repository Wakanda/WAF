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
    packageName: 'Widget/popover',
    // {String} internal name of the widget
    type: 'popover',
    // {String} library used ('waf', 'jquery', 'extjs', 'yui') (optional)
    lib: 'WAF',
    // {String} display name of the widget in the GUI Designer
    description: 'Popover',
    // {String} category in which the widget is displayed in the GUI Designer
    category: 'Containers/Placeholders',
    // {String} image of the tag to display in the GUI Designer (optional)
    img: '/walib/WAF/widget/popover/icons/widget-popover.png',
    // {Array} css file needed by widget (optional)
    css: [],
    // {Array} script files needed by widget (optional)
    include: [],
    // {String} type of the html tag ('div' by default)
    tag: 'div',
    containArea: true,
    /*bindable    : 'EntityModel,relatedEntity,relatedEntities',*/
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
            name: 'data-label-position',
            description: 'Label position',
            defaultValue: 'top'
        },
        {
            name: 'data-header',
            description: 'Show header',
            defaultValue: 'false',
            type: "checkbox",
            context: ["disallowDrodAndBind"],
            ready: function() {

                var input = $(this.htmlObject[0]),
                that = this,
                tagID = that.data.tag.getId();

                input.change(function() {
                    var tag = that.data.tag;
                    tag.toggleHeader(this.checked);
                });

            }
        },
        {
            name: 'data-footer',
            description: 'Show footer',
            defaultValue: '',
            type: "checkbox",
            context: ["disallowDrodAndBind"],
            ready: function() {

                var input = $(this.htmlObject[0]),
                that = this;

                input.change(function() {
                    var tag = that.data.tag;
                    tag.toggleFooter(this.checked);
                });

            }
        },
        {
            name: 'data-button',
            description: 'Linked button ID',
            defaultValue: '',
            type: "textfield",
            context: ["disallowDrodAndBind"],
            ready: function() {



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
            defaultValue: '220px'
        },
        {
            name: 'height',
            defaultValue: '300px'
        }],
    // {Array} events ot the widget
    //
    // @property {String} name, internal name of the event (mandatory)
    // @property {String} description, display name of the event in the GUI Designer
    // @property {String} category, category in which the event is displayed in the GUI Designer (optional)
    events: [
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
        }
    ],
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
            text: false, // true to display the "Text" section
            background: true, // true to display widget "Background" section
            border: true, // true to display widget "Border" section
            sizePosition: true, // true to display widget "Size and Position" section
            label: true, // true to display widget "Label Text" and "Label Size and Position" sections
            // For these two sections, you must also define the "data-label" in the Attributes array
            disabled: ['border-radius']     // list of styles settings to disable for this widget
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
    onInit: function(config) {

        var widget = new WAF.widget.Popover(config);

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

        if (!tag.moveArrow) {

            tag.moveArrow = function(buttonID) {

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
                arrowWidth = 25;
                htmlObject = $('#' + tag.getId()),
                up = false,
                down = false,
                left = false,
                right = false;

                button = Designer.tag.getTagById(buttonID);
                $button = $("#" + buttonID);
                $tag = $("#" + tag.getId());
                buttonOffset = $button.offset();
                tagOffset = $tag.offset();
                buttonX = buttonOffset.left;
                buttonY = buttonOffset.top;
                pointX = buttonX + (button.getWidth() / 2);
                pointY = buttonY + (button.getHeight() / 2);
                tagX = tagOffset.left;
                tagY = tagOffset.top;
                tagHeight = tag.getHeight();
                tagWidth = tag.getWidth();

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

        if (config["data-button"]) {
            window.setTimeout(function() {
                tag.moveArrow(config["data-button"]);
            }, 0);


            /*$("#"+config["data-button"]).bind("touchend", function(){
             tag.show();
             });*/
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

    },
    /**
     * call the first time in order to build the widget
     * @param {Designer.tag.Tag} container of the widget in the GUI Designer
     */
    onCreate: function(tag, param) {

        var context = D.env.tagAttributes.context.tag,
        contextProtected = D.env.tagAttributes.context["protected"],
        contextAllowDrop = D.env.tagAttributes.context["allowDrop"],
        contextAllowPaste = D.env.tagAttributes.context["allowPaste"],
        undoMessageTitle = "All the widgets in the elementName have been deleted.",
        undoMessageContent = "You can retrieve them by unding the action if you'd like.";

        tag.getActiveContainer = function() {
            var activeContainer = tag;

            tag.getChildren().forEach(function(child) {
                var htmlObject = child.getHtmlObject()[0];

                if (htmlObject.className.match(/waf-popover-body/)) {
                    activeContainer = child;
                }
            });

            return activeContainer;
        }

        tag.toggleHeader = function(addHeader) {

            var headerRef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('container')),
            tagID = tag.getId(),
            htmlObject = $('#' + tagID),
            header,
            contentID = htmlObject.find(".waf-popover-body").get()[0].id,
            content = Designer.tag.getTagById(contentID),
            headerID,
            $header,
            group;

            if (addHeader) {

                Designer.beginUserAction('088');
                var action = new Designer.action.addPopoverHeader({
                    val: '0',
                    oldVal: '1',
                    tagId: tagID,
                    data: {
                        widgetId: tagID
                    }
                });

                Designer.getHistory().add(action);

                content.setXY(5, 35, true);

                group = Designer.getGroup(tag.getGroupId());

                header = new Designer.tag.Tag(headerRef);
                header.addContext(contextProtected + " " + contextAllowDrop);
                header.create({
                    id: D.tag.getNewId("header"),
                    width: tag.getWidth(),
                    height: "35",
                    silentMode: true
                });
                header.setXY(0, 0, true);
                header._linkedWidget = tag;
                header.addClass('waf-popover-header');
                header.setParent(tag);
                header.forceRightConstraint();
                header.setPositionRight("0px", true, false);
                group.add(header);
                tag.link(header);
                Designer.ui.group.save();

                htmlObject.find(".waf-popover-header").click(
                function(e) {
                    if (!e.altKey) {
                        event.stopPropagation();
                        event.preventDefault();
                        tag.setCurrent();
                        Designer.tag.refreshPanels();
                    }
                }
                );

            } else {

                Designer.beginUserAction('089');
                var action = new Designer.action.removePopoverHeader({
                    val: '0',
                    oldVal: '1',
                    tagId: tag.getId(),
                    data: {
                        widgetId: tag.getId(),
                        contentID: contentID
                    }
                });

                Designer.getHistory().add(action);

                content.setXY(5, 5, true);

                $header = htmlObject.find(".waf-popover-header");
                headerID = $header.get()[$header.length - 1].id;
                header = Designer.tag.getTagById(headerID);

                D.util.notify(undoMessageTitle.replace("elementName", "header"), undoMessageContent, 0);

                window.setTimeout(function() {
                    header.remove();
                }, 0);

            }
        }

        tag.toggleFooter = function(addFooter) {

            var footerRef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('container')),
            tagID = tag.getId(),
            htmlObject = $('#' + tagID),
            footer,
            contentID = htmlObject.find(".waf-popover-body").get()[0].id,
            content = Designer.tag.getTagById(contentID),
            $footer,
            footerID,
            group;

            if (addFooter) {

                Designer.beginUserAction('090');
                var action = new Designer.action.addPopoverFooter({
                    val: '0',
                    oldVal: '1',
                    tagId: tagID,
                    data: {
                        widgetId: tagID,
                        contentID: contentID
                    }
                });

                Designer.getHistory().add(action);

                content.setPositionBottom("45px", true, false);

                group = Designer.getGroup(tag.getGroupId());

                footer = new Designer.tag.Tag(footerRef);
                footer.addContext(contextProtected + " " + contextAllowDrop);
                footer.create({
                    id: D.tag.getNewId("footer"),
                    width: tag.getWidth(),
                    height: "40",
                    silentMode: true
                });
                footer.setXY(0, tag.getHeight() - 42, true);
                footer._linkedWidget = tag;
                footer.addClass('waf-popover-footer');
                footer.setParent(tag);
                footer.forceRightConstraint();
                footer.setPositionRight("0px", true, false);
                footer.forceBottomConstraint();
                footer.setPositionBottom("0px", true, false);
                footer.removeTopConstraint();
                group.add(footer);
                tag.link(footer);
                Designer.ui.group.save();
                htmlObject.find(".waf-popover-footer").click(
                function(e) {
                    if (!e.altKey) {
                        event.stopPropagation();
                        event.preventDefault();
                        tag.setCurrent();
                        Designer.tag.refreshPanels();
                    }
                }
                );

            } else {

                Designer.beginUserAction('091');
                var action = new Designer.action.removePopoverFooter({
                    val: '0',
                    oldVal: '1',
                    tagId: tag.getId(),
                    data: {
                        widgetId: tag.getId(),
                        contentID: contentID
                    }
                });

                Designer.getHistory().add(action);

                content.setPositionBottom("5px", true, false);

                $footer = htmlObject.find(".waf-popover-footer");
                footerID = $footer.get()[$footer.length - 1].id;
                footer = Designer.tag.getTagById(footerID);

                D.util.notify(undoMessageTitle.replace("elementName", "footer"), undoMessageContent, 0);

                window.setTimeout(function() {
                    footer.remove();
                }, 0);

            }

        }

        var htmlObject = $('#' + tag.getId()),
        contentRef,
        content;

        var markup = '<div class="waf-popover-arrow waf-popover-arrow-top"><span></span></div>';

        htmlObject.append(markup);

        if (!param._isLoaded) {

            tag.addContext(D.env.tagAttributes.context.disallowDrodAndBind);

            if (param.group) {
                tag.group = param.group;
            } else {
                tag.group = new Designer.ui.group.Group();
                tag.group.add(tag);
            }

            tag.getAttribute("data-hideonload").setValue("true");

            contentRef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('container'));

            content = new Designer.tag.Tag(contentRef);
            content.addContext(contextProtected + " " + contextAllowDrop + " " + contextAllowPaste);
            content.create({
                id: D.tag.getNewId("content"),
                width: "200",
                height: "200",
                silentMode: true
            });
            content.setXY(5, 5, true);
            content._linkedWidget = tag;
            content.addClass('waf-popover-body');
            content.setParent(tag);
            content.forceRightConstraint();
            content.setPositionRight("5px", true, false);
            content.forceBottomConstraint();
            content.setPositionBottom("5px", true, false);
            tag.group.add(content);
            tag.link(content);
            content.domUpdate();
            Designer.ui.group.save();
        }

        window.setTimeout(function() {

            htmlObject.find(".waf-popover-body").click(
            function(e) {
                if (!e.altKey) {
                    event.stopPropagation();
                    event.preventDefault();
                    tag.setCurrent();
                    Designer.tag.refreshPanels();
                }
            }
            );

            htmlObject.find(".waf-popover-header").click(
            function(e) {
                if (!e.altKey) {
                    event.stopPropagation();
                    event.preventDefault();
                    tag.setCurrent();
                    Designer.tag.refreshPanels();
                }
            }
            );

            htmlObject.find(".waf-popover-footer").click(
            function(e) {
                if (!e.altKey) {
                    event.stopPropagation();
                    event.preventDefault();
                    tag.setCurrent();
                    Designer.tag.refreshPanels();
                }
            }
            );
        }, 0)


    }

});
