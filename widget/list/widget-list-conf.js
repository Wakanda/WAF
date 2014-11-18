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
    packageName: 'Widget/list',
    // {String} internal name of the widget
    type: 'listView',
    // {String} library used ('waf', 'jquery', 'extjs', 'yui') (optional)
    lib: 'WAF',
    // {String} display name of the widget in the GUI Designer
    description: 'List View',
    // {String} category in which the widget is displayed in the GUI Designer
    category: 'Automatic Controls',
    // {String} image of the tag to display in the GUI Designer (optional)
    img: '/walib/WAF/widget/list/icons/widget-list.png',
    // {Array} css file needed by widget (optional)
    css: [],
    // {Array} script files needed by widget (optional)
    include: [],
    // {String} type of the html tag ('div' by default)
    tag: 'div',
    containArea: false,
    resizable: true,
    bindable: 'EntityModel,relatedEntities', //relatedEntity

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
            name: 'data-binding',
            description: 'Source'
        },
        {
            name: 'data-label-position',
            description: 'Label position',
            defaultValue: 'top'
        },
        {
            name: 'data-inset',
            category: "User interface options",
            description: 'Inset',
            defaultValue: 'true',
            type: "checkbox",
            ready: function() {

                var textField = $(this.htmlObject[0]),
                that = this;

                textField.change(function() {
                    var tag = that.data.tag;
                    tag.toggleInset(this.checked);
                });

            }
        },
        {
            name: 'data-image',
            category: "User interface options",
            description: 'Side image',
            defaultValue: 'false',
            type: "checkbox",
            ready: function() {

                var textField = $(this.htmlObject[0]),
                that = this;

                if (!this.data.tag.getAttribute("data-binding").getValue()) {
                    this.htmlObject[0].disabled = true;
                }

                textField.change(function() {
                    var tag = that.data.tag;
                    tag.toggleSideImage(this.checked);
                });

            }
        },
        {
            name: 'data-number',
            category: "User interface options",
            description: 'Numerical value',
            defaultValue: 'false',
            type: "checkbox",
            ready: function() {

                var textField = $(this.htmlObject[0]),
                that = this;

                if (!this.data.tag.getAttribute("data-binding").getValue()) {
                    this.htmlObject[0].disabled = true;
                }

                textField.change(function() {
                    var tag = that.data.tag;
                    tag.toggleNumber(this.checked);
                });

            }
        },
        {
            name: 'data-multi',
            category: "User interface options",
            description: 'Second text',
            defaultValue: 'false',
            type: "checkbox",
            ready: function() {

                var textField = $(this.htmlObject[0]),
                that = this;

                if (!this.data.tag.getAttribute("data-binding").getValue()) {
                    this.htmlObject[0].disabled = true;
                }


                textField.change(function() {
                    var tag = that.data.tag;
                    tag.toggleMultiLine(this.checked);
                });

            }
        },
        {
            name: 'data-nextButton',
            category: "User interface options",
            description: 'Next button',
            defaultValue: 'true',
            type: "checkbox",
            ready: function() {

                var textField = $(this.htmlObject[0]),
                that = this;

                if (!this.data.tag.getAttribute("data-binding").getValue()) {
                    this.htmlObject[0].disabled = true;
                }


                textField.change(function() {
                    var tag = that.data.tag;
                    tag.toggleNextButton(this.checked);
                });

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
            defaultValue: '320px'
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
        /*{
         name       : 'click',
         description: 'On Click',
         category   : 'Mouse Events'
         },
         {
         name       : 'dblclick',
         description: 'On Double Click',
         category   : 'Mouse Events'
         },
         {
         name       : 'mousedown',
         description: 'On Mouse Down',
         category   : 'Mouse Events'
         },
         {
         name       : 'mouseout',
         description: 'On Mouse Out',
         category   : 'Mouse Events'
         },
         {
         name        : 'mouseover',
         description: 'On Mouse Over',
         category   : 'Mouse Events'
         },
         {
         name       : 'mouseup',
         description: 'On Mouse Up',
         category   : 'Mouse Events'
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
            text: false, // true to display the "Text" section
            background: false, // true to display widget "Background" section
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

        var widget = new WAF.widget.list(config);

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

        var $container,
        $mainLabel,
        mainLabelID,
        rowID,
        row,
        imgDef,
        secondLabelDef,
        num,
        img,
        secondLabel,
        actionCode = D.env.transCodeId,
        attributes = null,
        refreshMainLabel = false,
        refreshSecondLabel = false,
        refreshMainImg = false,
        refreshNumber = false,
        $container = $("#" + config.id),
        $matrix = $container.find(".waf-list-matrix"),
        matrixID,
        matrix,
        theSource;

        if ($matrix.length > 0) {
            matrixID = $matrix.get()[0].id;
            matrix = D.getById(matrixID);
        }

        if (actionCode != "004" && actionCode != "036" && actionCode != "046") { //004 = drop source on widget tag.doNotUpdate || isResize ||

            if (isResize) {
                matrix.rebuild();
            }
            return;

        }

        if (actionCode === "046") {
            config["data-binding"] = null;
            tag._currentDS = null;
            tag.addSplash();
        }

        if ($matrix.length != 0 && config["data-binding"] && (!tag._currentDS || tag._currentDS != config["data-binding"])) {

            Designer.beginUserAction('096');
            var action = new Designer.action.dropDataSource({
                val: '0',
                oldVal: '1',
                tagId: tag.getId(),
                data: {
                    widgetId: tag.getId(),
                    ds: config["data-binding"]
                }
            });

            Designer.getHistory().add(action);

            if (tag._currentDS && tag._currentDS != config["data-binding"]) {
                tag.resetConfig();
            }

            tag._currentDS = config["data-binding"];

            tag.getAttribute("data-binding").setValue(config["data-binding"]);

            $container.find(".waf-list-splash").remove();

            theSource = D.getDatasources().getByName(config["data-binding"]);

            switch (true) {
                case theSource.isRelatedEntityModel():
                    attributes = D.getDatasources().getByName(theSource.getEntityModelTargetName()).getDefinition().attributes;
                    break;
                case theSource.isArray():
                    attributes = D.getDatasources().getByName(config["data-binding"]).getAttributes();
                    break;
                default:
                    attributes = D.getDatasources().getByName(config["data-binding"]).getDefinition().attributes;
            }

        } else if (!config["data-binding"]) {
            tag.resetConfig();
        }

        if (attributes != null) {

            mainLabel = tag.getDomElementByClass("waf-list-mainLabel");
            mainLabel = D.getById(mainLabel.id);

            rowID = $container.find(".waf-list-row").get()[0].id;
            row = D.getById(rowID);

            $.each(attributes, function(index, value) {

                if (value.type === "string" && !refreshMainLabel) {

                    refreshMainLabel = true;
                    mainLabel.getAttribute("data-binding").setValue(config["data-binding"] + "." + value.name);

                } else if (value.type === "string" && refreshMainLabel && !refreshSecondLabel) {

                    refreshSecondLabel = true;
                    secondLabel = tag.addSecondLabel(value);

                }

                if (value.type === "number" && !refreshNumber) {

                    refreshNumber = true;
                    num = tag.addNumber(value);

                }


                if (value.type === "image" && !refreshMainImg) {

                    refreshMainImg = true;
                    img = tag.addImage(value);
                    if (refreshSecondLabel) {
                        mainLabel.setXY(50, 8, true);
                        secondLabel.setXY(50, 25, true);
                    } else {
                        mainLabel.setXY(50, 13, true);
                    }

                }
            });

            if (refreshMainLabel) {
                mainLabel.refresh();
            }

            if (refreshNumber) {
                num.refresh();
            }

            if (refreshSecondLabel) {
                secondLabel.refresh();
            }

            if (refreshMainImg) {
                img.refresh();
            }

            window.setTimeout(function() {
                matrix.rebuild();
            }, 0);

        }


        tag.buildStructure = function() {

            mainLabel = tag.getDomElementByClass("waf-list-mainLabel");
            mainLabel = D.getById(mainLabel.id);

            rowID = $container.find(".waf-list-row").get()[0].id;
            row = D.getById(rowID);

            refreshMainLabel = false;
            refreshSecondLabel = false;
            refreshNumber = false;
            refreshMainImg = false;

            $.each(attributes, function(index, value) {

                if (value.type === "string" && !refreshMainLabel) {
                    refreshMainLabel = true;
                    mainLabel.getAttribute("data-binding").setValue(config["data-binding"] + "." + value.name);

                } else if (value.type === "string" && refreshMainLabel && !refreshSecondLabel) {

                    refreshSecondLabel = true;
                    secondLabel = tag.addSecondLabel(value);

                }

                if (value.type === "number" && !refreshNumber) {

                    refreshNumber = true;
                    num = tag.addNumber(value);

                }


                if (value.type === "image" && !refreshMainImg) {

                    refreshMainImg = true;
                    img = tag.addImage(value);
                    if (refreshSecondLabel) {
                        mainLabel.setXY(50, 8, true);
                        secondLabel.setXY(50, 25, true);
                    } else {
                        mainLabel.setXY(50, 13, true);
                    }

                }
            });

            if (refreshMainLabel) {
                mainLabel.refresh();
            }

            if (refreshNumber) {
                num.refresh();
            }

            if (refreshSecondLabel) {
                secondLabel.refresh();
            }

            if (refreshMainImg) {
                img.refresh();
            }
        }

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

        var widgetId = tag.getId(),
        htmlObject = $('#' + widgetId),
        context = D.env.tagAttributes.context.tag,
        contextProtected = D.env.tagAttributes.context["protected"],
        contextAllowBind = D.env.tagAttributes.context["allowBind"];

        tag.getDomElementByClass = function(elementClass) {

            var elements,
            selection = null;

            elements = htmlObject.find("." + elementClass + ":not(.waf-matrix-clone)");

            if (elements.length > 0) {
                $.each(elements, function(index, value) {
                    if (value.id.split("waf-status-deleted").length === 1) {
                        selection = value;
                        return false;
                    }
                });
            }

            return selection;

        }

        tag.resetConfig = function() {

            if (tag.getAttribute("data-image").getValue() == "true") {
                tag.getAttribute("data-image").setValue("false");
                tag.toggleSideImage(false);
            }

            if (tag.getAttribute("data-number").getValue() == "true") {
                tag.getAttribute("data-number").setValue("false");
                tag.toggleNumber(false);
            }

            if (tag.getAttribute("data-multi").getValue() == "true") {
                tag.getAttribute("data-multi").setValue("false");
                tag.toggleMultiLine(false);
            }

            var mainLabel = tag.getDomElementByClass("waf-list-mainLabel");
            mainLabel = D.getById(mainLabel.id);
            mainLabel.getAttribute("data-binding").setValue(" ");
            mainLabel.refresh();
            tag.addSplash();
        }

        tag.findAttributeByType = function(theType) {

            var result = null,
            attributes = D.getDatasources().getByName(tag.getAttribute("data-binding").getValue()).getDefinition().attributes,
            string = false;

            $.each(attributes, function(index, value) {

                if (value.type === theType) {
                    if (value.type == "string" && !string) { //we want the second string
                        string = true;
                    } else {
                        result = value;
                        return false;
                    }

                }

            });

            return result;
        }

        tag.addSecondLabel = function(value) {

            var secondLabelDef,
            secondLabel,
            rowID,
            row,
            group,
            hasImage = tag.getAttribute("data-image").getValue(),
            hasNumber = tag.getAttribute("data-number").getValue();

            rowID = htmlObject.find(".waf-list-row").get()[0].id;
            row = D.getById(rowID);

            tag.getAttribute("data-multi").setValue("true");

            secondLabelDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('richText'));
            secondLabel = new Designer.tag.Tag(secondLabelDef);
            //secondLabel.addAttribute(context);
            //secondLabel.getAttribute(context).setValue('["'+contextProtected+'", "'+contextAllowBind+'"]');
            secondLabel.addContext(contextProtected + " " + contextAllowBind);
            secondLabel.addAttribute("data-inline");
            secondLabel.getAttribute("data-inline").setValue("true");
            secondLabel.getAttribute("data-autoWidth").setValue("false");
            secondLabel.create({
                id: D.tag.getNewId("secondText"),
                width: "200",
                height: "20",
                silentMode: true
            });

            if (hasImage === "true" || hasImage === true) {
                secondLabel.setXY(50, 25, true);
            } else {
                secondLabel.setXY(20, 25, true);
            }
            secondLabel._linkedWidget = tag;
            secondLabel.addClass('waf-list-secondLabel');
            secondLabel.setParent(row);
            secondLabel.forceRightConstraint();

            if (hasNumber === true || hasImage === "true") {
                secondLabel.setPositionRight("40px", false, false);
            } else {
                secondLabel.setPositionRight("70px", false, false);
            }

            mainLabel = tag.getDomElementByClass("waf-list-mainLabel");
            mainLabel = D.getById(mainLabel.id);

            if (hasImage === "true" || hasImage === true) {
                mainLabel.setXY(50, 8, true);
            } else {
                mainLabel.setXY(20, 8, true);
            }

            if (value) {
                secondLabel.getAttribute("data-binding").setValue(tag.getAttribute("data-binding").getValue() + "." + value.name);
            }

            group = tag.group;
            group.add(secondLabel);
            tag.link(secondLabel);

            return secondLabel;
        }

        tag.addImage = function(value) {

            var imgDef,
            img,
            rowID,
            row,
            $secondLabel,
            mainLabel,
            $mainLabel,
            group,
            secondLabel;

            rowID = htmlObject.find(".waf-list-row").get()[0].id;
            row = D.getById(rowID);

            tag.getAttribute("data-image").setValue("true");
            imgDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('image'));
            img = new Designer.tag.Tag(imgDef);
            //img.addAttribute(context);
            //img.getAttribute(context).setValue('["'+contextProtected+'", "'+contextAllowBind+'"]');
            img.addContext(contextProtected + " " + contextAllowBind);
            img.create({
                id: D.tag.getNewId("sideImage"),
                width: "35",
                height: "35",
                silentMode: true
            });
            img.setXY(5, 5, true);
            img._linkedWidget = tag;
            img.addClass('waf-list-image');
            img.setParent(row);
            if (value) {
                img.getAttribute("data-binding").setValue(tag.getAttribute("data-binding").getValue() + "." + value.name);
            }

            mainLabel = tag.getDomElementByClass("waf-list-mainLabel");
            mainLabel = D.getById(mainLabel.id);
            secondLabel = tag.getDomElementByClass("waf-list-secondLabel");

            if (secondLabel) {
                secondLabel = D.getById(secondLabel.id);
                mainLabel.setXY(50, 8, true);
                secondLabel.setXY(50, 25, true);
            } else {
                mainLabel.setXY(50, 13, true);
            }

            group = tag.group;
            group.add(img);
            tag.link(img);

            return img;

        }

        tag.addNumber = function(value) {

            var numberDef,
            num,
            rowID,
            row,
            group;

            tag.getAttribute("data-number").setValue("true");

            rowID = htmlObject.find(".waf-list-row").get()[0].id;
            row = D.getById(rowID);

            numberDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('richText'));
            num = new Designer.tag.Tag(numberDef);
            //num.addAttribute(context);
            //num.getAttribute(context).setValue('["'+contextProtected+'", "'+contextAllowBind+'"]');
            num.addContext(contextProtected + " " + contextAllowBind);
            num.getAttribute("data-autoWidth").setValue("true");
            num.create({
                id: D.tag.getNewId("numberValue"),
                width: "30",
                height: "20",
                silentMode: true
            });
            num.setXY(254, 12, true);
            num._linkedWidget = tag;
            num.addClass('waf-list-number');
            num.setParent(row);
            num.forceRightConstraint();
            num.removeLeftConstraint();
            num.setPositionRight("40px", false, false);

            if (value) {
                num.getAttribute("data-binding").setValue(tag.getAttribute("data-binding").getValue() + "." + value.name);
            }

            group = tag.group;
            group.add(num);
            tag.link(num);

            var mLabel,
            sLabel;

            mLabel = tag.getDomElementByClass("waf-list-mainLabel");
            mLabel = D.getById(mLabel.id);

            sLabel = tag.getDomElementByClass("waf-list-secondLabel");

            mLabel.setPositionRight("70px", false, false);

            if (sLabel) {
                sLabel = D.getById(sLabel.id);
                sLabel.setPositionRight("70px", false, false);
            }

            return num;
        }

        tag.addNextButton = function() {

            var numberDef,
            num,
            rowID,
            row,
            button,
            buttonDef,
            group,
            group = tag.group;
            ;

            rowID = htmlObject.find(".waf-list-row").get()[0].id;
            row = D.getById(rowID);

            tag.getAttribute("data-nextButton").setValue("true");

            buttonDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('button'));

            button = new Designer.tag.Tag(buttonDef);
            //button.addAttribute(context);
            //button.getAttribute(context).setValue('["'+contextProtected+'"]');
            button.addContext(contextProtected);
            button.create({
                id: D.tag.getNewId("nextButton"),
                width: "25",
                height: "25",
                silentMode: true
            });
            button.setXY(250, 10, true);
            button._linkedWidget = row;
            button.addClass('waf-list-buttonGoTo');
            button.getAttribute("data-text").setValue(" ");
            button.setParent(row);
            button.forceRightConstraint();
            button.removeLeftConstraint();
            button.setPositionRight("10px", false, false);
            group.add(button);
            tag.link(button);

            group = tag.group;
            group.add(button);
            tag.link(button);

            return button;

        }

        tag.toggleInset = function(isInset, desableUndo) {


            if (!desableUndo) {
                var tagid = tag.getId();
                this.manageUndoRedo({
                    widgetId: tagid,
                    propertyName: "inset",
                    isInset: isInset
                },
                tagid
                );
            }


            if (isInset) {
                tag.addClass("widget-list-inset");
                //tag.getLabel().show();
                //tag.getLabel().getAttribute("data-hideonload").setValue("false");
            } else {
                tag.removeClass("widget-list-inset");
                //tag.getLabel().hide();
                //tag.getLabel().getAttribute("data-hideonload").setValue("true");
            }

        }

        tag.toggleMultiLine = function(isMultiline) {

            var left = 20,
            tagid = tag.getId(),
            theValue,
            theLabel;

            this.manageUndoRedo({
                widgetId: tagid,
                propertyName: "multiline"
            },
            tagid
            );

            if (isMultiline) {

                theValue = this.findAttributeByType("string");

                if (theValue) {
                    theLabel = tag.addSecondLabel(theValue);
                    theLabel.refresh();
                    tag.refreshMatrix();
                } else {
                    tag.addSecondLabel();
                }


            } else {

                var secondLabel,
                mainLabel;

                mainLabel = tag.getDomElementByClass("waf-list-mainLabel");
                mainLabel = D.getById(mainLabel.id);

                secondLabel = tag.getDomElementByClass("waf-list-secondLabel");
                secondLabel = D.getById(secondLabel.id);

                if (tag.getAttribute("data-image").getValue() === true || tag.getAttribute("data-image").getValue() === "true") {
                    left = 50;
                }

                mainLabel.setXY(left, 13, true);

                if (secondLabel) {
                    secondLabel.remove();
                    tag.selectWidget();
                }

            }

        }

        tag.toggleSideImage = function(hasSideImage) {

            var tagid = tag.getId(),
            theValue,
            theLabel;

            this.manageUndoRedo({
                widgetId: tagid,
                propertyName: "sideImage"
            },
            tagid
            );

            if (hasSideImage) {

                theValue = this.findAttributeByType("image");

                if (theValue) {
                    theLabel = tag.addImage(theValue);
                    theLabel.refresh();
                } else {
                    tag.addImage();
                }

                tag.refreshMatrix();


            } else {

                var image,
                mainLabel,
                secondLabel;

                image = tag.getDomElementByClass("waf-list-image");
                image = D.getById(image.id);

                mainLabel = tag.getDomElementByClass("waf-list-mainLabel");
                mainLabel = D.getById(mainLabel.id);

                secondLabel = tag.getDomElementByClass("waf-list-secondLabel");

                if (secondLabel) {
                    secondLabel = D.getById(secondLabel.id);
                    mainLabel.setXY(20, 8, true);
                    secondLabel.setXY(20, 25, true);
                } else {
                    mainLabel.setXY(20, 13, true);
                }

                if (image) {
                    image.remove();
                    tag.selectWidget();
                }

            }

        }

        tag.toggleNumber = function(hasNumber) {

            var tagid = tag.getId();

            this.manageUndoRedo({
                widgetId: tagid,
                propertyName: "number"
            },
            tagid
            );

            var mLabel,
            sLabel,
            theValue,
            theLabel;

            mLabel = tag.getDomElementByClass("waf-list-mainLabel");
            mLabel = D.getById(mLabel.id);

            sLabel = tag.getDomElementByClass("waf-list-secondLabel");

            if (sLabel) {
                sLabel = D.getById(sLabel.id);
            }

            if (hasNumber) {

                theValue = this.findAttributeByType("number");

                if (theValue) {
                    theLabel = tag.addNumber(theValue);
                    theLabel.refresh();
                } else {
                    tag.addNumber();
                }

                tag.refreshMatrix();

            } else {

                var num;

                num = tag.getDomElementByClass("waf-list-number");
                num = D.getById(num.id);

                if (num) {
                    mLabel.setPositionRight("40px", false, false);
                    if (sLabel) {
                        sLabel.setPositionRight("40px", false, false);
                    }
                    num.remove();
                    tag.selectWidget();
                }
            }
        }

        tag.toggleNextButton = function(hasButton) {

            var tagid = tag.getId();

            this.manageUndoRedo({
                widgetId: tagid,
                propertyName: "nextButton"
            },
            tagid
            );


            if (hasButton) {

                tag.addNextButton();
                tag.refreshMatrix();

            } else {

                var button;

                button = tag.getDomElementByClass("waf-list-buttonGoTo");
                button = D.getById(button.id);

                if (button) {
                    button.remove();
                    tag.selectWidget();
                }

            }

        }

        tag.manageUndoRedo = function(data, tagid) {

            Designer.beginUserAction('097');

            var action = new Designer.action.addListProperty({
                val: '0',
                oldVal: '1',
                tagId: tagid,
                data: data
            });

            Designer.getHistory().add(action);
        }

        tag.refreshMatrix = function() {
            var $matrix = htmlObject.find(".waf-list-matrix"),
            matrixID = $matrix.get()[0].id,
            matrix = D.getById(matrixID);

            window.setTimeout(function() {
                matrix.rebuild();
            }, 0);
        }

        tag.selectWidget = function() {

            window.setTimeout(function() {
                var tag = Designer.tag.getTagById(widgetId);
                tag.setCurrent();
                Designer.tag.refreshPanels();
            }, 0);

        }

        tag.addSplash = function() {

            var markup = '<div class="waf-list-splash"><p>Drop a datasource here to set up this widget.</p></div>';
            htmlObject.append(markup);
            tag._currentDS = null;
        }

        tag.removeSplash = function() {

            htmlObject.find(".waf-list-splash").remove();
        }


        if (param.group) {
            tag.group = param.group;
        } else {
            tag.group = new Designer.ui.group.Group();
        }

        /*
         * Create structure if no init has been done else apply events
         */
        if (!param._isLoaded) {

            var
            group,
            matrixDef,
            listRowDef,
            matrix,
            $matrix,
            listRow,
            mainLabelDef,
            mainLabel,
            buttonDef,
            button;

            group = tag.group;
            group.add(tag);

            matrixDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('matrix'));
            listRowDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('container'));
            mainLabelDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('richText'));
            buttonDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('button'));

            if (tag.getAttribute("data-inset").getValue()) {
                tag.addClass('widget-list-inset');
            } else {
                tag.getLabel().hide();
                tag.removeClass('widget-list-inset');
            }

            matrix = new Designer.tag.Tag(matrixDef);
            //matrix.addAttribute(context);
            //matrix.getAttribute(context).setValue('["'+contextProtected+'"]');
            matrix.addContext(contextProtected);
            matrix.create({
                id: D.tag.getNewId("container"),
                width: tag.getWidth(),
                height: tag.getHeight(),
                silentMode: true
            });
            matrix._linkedWidget = tag;
            matrix.setXY(0, 0, true);
            matrix.addClass('waf-list-matrix');
            matrix.setParent(tag);
            matrix.getAttribute("data-margin").setValue("0");
            matrix.forceTopConstraint();
            matrix.forceBottomConstraint();
            matrix.forceLeftConstraint();
            matrix.forceRightConstraint();
            matrix.setPositionBottom("0px", false, false);
            matrix.setPositionRight("0px", false, false);
            group.add(matrix);
            tag.link(matrix);
            //lock the widget
            matrix.fix();

            listRow = new Designer.tag.Tag(listRowDef);
            //listRow.addAttribute(context);
            //listRow.getAttribute(context).setValue('["'+contextProtected+'"]');
            listRow.addContext(contextProtected);
            listRow.create({
                id: D.tag.getNewId("row"),
                width: tag.getWidth(),
                height: "48",
                silentMode: true
            });
            listRow.setXY(0, 0, true);
            listRow._linkedWidget = tag;
            listRow.addClass('waf-list-row');
            listRow.setParent(matrix);
            listRow.forceRightConstraint();
            listRow.setPositionRight("0px", false, false);
            group.add(listRow);
            tag.link(listRow);

            mainLabel = new Designer.tag.Tag(mainLabelDef);
            //mainLabel.addAttribute(context);
            //mainLabel.getAttribute(context).setValue('["'+contextProtected+'", "'+contextAllowBind+'"]');
            mainLabel.addContext(contextProtected + " " + contextAllowBind);
            mainLabel.getAttribute("data-autoWidth").setValue("false");
            mainLabel.addAttribute("data-inline");
            mainLabel.getAttribute("data-inline").setValue("true");
            mainLabel.create({
                id: D.tag.getNewId("mainText"),
                width: "200",
                height: "20",
                silentMode: true
            });
            mainLabel.setXY(20, 13, true);
            mainLabel._linkedWidget = listRow;
            mainLabel.addClass('waf-list-mainLabel');
            mainLabel.setParent(listRow);
            mainLabel.forceRightConstraint();
            mainLabel.setPositionRight("40px", false, false);
            mainLabel.setPositionBottom("0px", false, false);
            group.add(mainLabel);
            tag.link(mainLabel);

            button = new Designer.tag.Tag(buttonDef);
            //button.addAttribute(context);
            //button.getAttribute(context).setValue('["'+contextProtected+'", "'+contextAllowBind+'"]');
            button.addContext(contextProtected + " " + contextAllowBind);
            button.create({
                id: D.tag.getNewId("goTo"),
                width: "25",
                height: "25",
                silentMode: true
            });
            button.setXY(290, 10, true);
            button._linkedWidget = listRow;
            button.addClass('waf-list-buttonGoTo');
            button.getAttribute("data-text").setValue(" ");
            button.setParent(listRow);
            button.forceRightConstraint();
            button.removeLeftConstraint();
            button.setPositionRight("10px", false, false);
            group.add(button);
            tag.link(button);

            //group.applyTheme(tag.getTheme(), tag);
            Designer.ui.group.save();

            //matrix.hide();

        } else {

            tag._currentDS = tag.getAttribute("data-binding").getValue();

        }

        if (!tag._currentDS) {
            tag.addSplash();
        }


        window.setTimeout(function() {

            if (!listRow) {
                $listRow = htmlObject.find(".waf-list-row");
                listRow = D.getById($listRow.get()[0].id);
            }

            if (!matrix) {
                $matrix = htmlObject.find(".waf-list-matrix");
                matrix = D.getById($matrix.get()[0].id);
            }

            matrix._childTag = listRow;



        }, 0);

    }

});
