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
    packageName: 'Widget/dialog',
    type: 'dialog',
    lib: 'WAF',
    description: 'Dialog',
    category: 'Containers/Placeholders',
    img: '/walib/WAF/widget/dialog/icons/widget-dialog.png',
    tag: 'div',
    containArea: true,
    attributes: [{
            name: 'data-load',
            description: 'HTML file to include'
        }, {
            name: 'data-resizable',
            description: 'Resizable',
            type: 'checkbox',
            onclick: function() {
                this.data.tag.getAttribute('data-resizable').setValue((this.data.tag.getAttribute('data-resizable').getValue() !== 'true') + "");
                D.tag.refreshPanels();
            }
        }, {
            name: 'data-draggable',
            description: 'Draggable',
            type: 'checkbox'
        }, {
            name: 'data-modal',
            description: 'Modal',
            type: 'checkbox',
            onclick: function() {
                var data = this.data,
                tag = data.tag;

                if (this.getValue()) {
                    tag.getAttribute('data-front').setValue('true');
                    tag.getAttribute(data.aName).setValue('true');
                } else {
                    tag.getAttribute(data.aName).setValue('false');
                }

                tag.getAttribute('data-hideOnOutsideClick').setVisibility(this.getValue());
                D.tag.refreshPanels();
            }
        }, {
            name: 'data-front',
            description: 'Float on top',
            type: 'checkbox',
            defaultValue: 'true'
        }, {
            name: 'data-hideOnOutsideClick',
            defaultValue: 'false',
            type: 'checkbox',
            description: 'Hide on outside click'
        }
    ],
    style: [{
            name: 'width',
            defaultValue: '294px'
        }, {
            name: 'height',
            defaultValue: '211px'
        }
    ],
    // {Array} events ot the widget
    // 
    // @property {String} name, internal name of the event (mandatory)     
    // @property {String} description, display name of the event in the GUI Designer
    // @property {String} category, category in which the event is displayed in the GUI Designer (optional)
    events: [{
            name: 'click',
            description: 'On Click',
            category: 'Mouse Events'
        }, {
            name: 'dblclick',
            description: 'On Double Click',
            category: 'Mouse Events'
        }, {
            name: 'mousedown',
            description: 'On Mouse Down',
            category: 'Mouse Events'
        }, {
            name: 'mouseout',
            description: 'On Mouse Out',
            category: 'Mouse Events'
        }, {
            name: 'mouseover',
            description: 'On Mouse Over',
            category: 'Mouse Events'
        }, {
            name: 'mouseup',
            description: 'On Mouse Up',
            category: 'Mouse Events'
        },{
            name: 'startResize',
            description: 'On Start Resize',
            category: 'Resize'

        },
        {
            name: 'onResize',
            description: 'On Resize',
            category: 'Resize'

        },
        {
            name: 'stopResize',
            description: 'On Stop Resize',
            category: 'Resize'

        },
        /*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/
    ],
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
            disabled: [] // list of styles settings to disable for this widget
        }
    },
    structure: [],
    onInit: function(config) {
        var widget = new WAF.widget.Dialog(config);
        return widget;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
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
    onCreate: function(tag, param) {
        var
        btnOK,
        group,
        toolbar,
        classes,
        titleBar,
        btnCancel,
        context = D.env.tagAttributes.context;

        /**
         *Classes name
         */
        tag.getAttribute('class').setValue(tag.getAttribute('class').getValue() + ' ' + 'waf-container');
        tag.getAttribute('data-hideOnOutsideClick').setVisibility(false);

        tag._classes = {
            titlebar: {
                classname: 'waf-widget-header waf-dialog-header',
                subwidgets: {
                    iconimage: 'waf-dialog-header-icon',
                    title: 'waf-dialog-header-title',
                    buttons: 'waf-dialog-header-buttons',
                    close: 'waf-dialog-header-close',
                    minimize: 'waf-dialog-header-minimize',
                    maximize: 'waf-dialog-header-maximize'
                }
            },
            content: {
                classname: 'waf-widget-body waf-dialog-body'
            },
            toolbar: {
                classname: 'waf-widget-footer waf-dialog-footer'
            }
        }

        /**
         * Sub widget click function
         * @method _subWidgetsClickFn
         */
        tag._subWidgetsClickFn = function() {
            if (D.getCurrent() != tag) {
                tag.setCurrent();
                D.tag.refreshPanels();
            }

            return false;
        }

        /**
         * Get linked Widgets
         * @method _subWidgets
         */
        tag._subWidgets = function() {
            var
            res,
            classes,
            linkedTags;

            classes = tag._classes;

            if (this._private && this._private.subWidgets) {
                return this._private.subWidgets;
            }

            res = {
                titlebar: {
                    tag: null,
                    subwidgets: {
                        iconimage: null,
                        title: null,
                        close: null,
                        minimize: null,
                        maximize: null
                    }
                },
                content: {
                    tag: null
                },
                toolbar: {
                    tag: null
                }
            };

            linkedTags = tag.getLinks();

            for (var i = 0, widget; widget = linkedTags[i]; i++) {
                var
                htmlObj;

                htmlObj = widget.getHtmlObject();

                if (htmlObj.hasClass(classes.titlebar.classname)) {
                    res.titlebar.tag = widget;
                    continue;
                } else if (htmlObj.hasClass(classes.titlebar.subwidgets.iconimage)) {
                    res.titlebar.subwidgets.iconimage = widget;
                    continue;
                } else if (htmlObj.hasClass(classes.titlebar.subwidgets.title)) {
                    res.titlebar.subwidgets.title = widget;
                    continue;
                } else if (htmlObj.hasClass(classes.titlebar.subwidgets.close)) {
                    res.titlebar.subwidgets.close = widget;
                    continue;
                } else if (htmlObj.hasClass(classes.titlebar.subwidgets.minimize)) {
                    res.titlebar.subwidgets.minimize = widget;
                    continue;
                } else if (htmlObj.hasClass(classes.titlebar.subwidgets.maximize)) {
                    res.titlebar.subwidgets.maximize = widget;
                    continue;
                } else if (htmlObj.hasClass(classes.content.classname)) {
                    res.content.tag = widget;
                    continue;
                } else if (htmlObj.hasClass(classes.toolbar.classname)) {
                    res.toolbar.tag = widget;
                    continue;
                }
            }

            this._private = this._private || {};
            this._private.subWidgets = res;

            return res;
        }

        /**
         * add widget
         * @method _addWidget
         */
        tag._addWidget = function add_widget(config) {
            var
            group,
            widget,
            groupId,
            allFits,
            reloadTag,
            defaultConfig,
            camelCaseFits;

            allFits = ['top', 'left', 'right', 'bottom'];
            camelCaseFits = ['Top', 'Left', 'Right', 'Bottom']
            groupId = tag.getGroupId();
            group = Designer.getGroup(groupId);
            reloadTag = false;
            defaultConfig = {
                fit: [],
                height: null,
                width: null,
                left: null,
                top: null,
                type: 'button',
                parent: this,
                'class': null,
                attribs: null,
                'z-index': null,
                context: ''
            };

            config = $.extend(true, defaultConfig, config);

            widget = Designer.createTag({
                type: config.type,
                width: config.width,
                height: config.height,
                fit: config.fit,
                silentMode: true,
                parent: config.parent,
                context: config.context

            });

            if (config['class']) {
                widget.getAttribute('class').setValue(widget.getAttribute('class').getValue() + ' ' + config['class']);
            }

            for (var i = allFits.length - 1, fit; fit = allFits[i]; i--) {
                if ($.inArray(fit, config.fit) >= 0 && i > 1) {
                    action = new Designer.action['Add' + camelCaseFits[i] + 'Constraint']({
                        tagId: widget.id,
                        tagHtmlId: widget.getId(),
                        oldVal: 1
                    });

                    Designer.getHistory().add(action);
                } else if ($.inArray(fit, config.fit) < 0 && i <= 1) {
                    action = new Designer.action['Remove' + camelCaseFits[i] + 'Constraint']({
                        tagId: widget.id,
                        tagHtmlId: widget.getId(),
                        oldVal: 1
                    });

                    Designer.getHistory().add(action);
                }
            }

            for (i = 0, fit; fit = allFits[i]; i++) {
                if ($.inArray(fit, config.fit) >= 0) {
                    widget.savePosition(fit, config[fit], false, false);

                    action = new Designer.action.ModifyStyleInline({
                        val: config[fit],
                        oldVal: 0.001,
                        tagId: widget.id,
                        tagHtmlId: widget.getId(),
                        prop: fit
                    });

                    Designer.getHistory().add(action);
                } else {
                    widget['setFitTo' + camelCaseFits[i]](false);
                    widget.savePosition(fit, null);
                }
            }

            if (config.attribs) {
                for (var attr in config.attribs) {
                    widget.getAttribute(attr).setValue(config.attribs[attr]);
                }

                reloadTag = true;
            }

            if (config['z-index']) {
                widget.updateZindex(-1);
                reloadTag = true;
            }

            if (reloadTag) {
                widget.refresh();
            }

            widget.setAsSubElement(true);
            widget.onClick = tag._subWidgetsClickFn;
            this.link(widget);
            group.add(widget);

            return widget;
        }

        if (!param._isLoaded) {
            tag.setCurrent();
            var
            toolbarHeight = 25,
            titlebarHeight = 25;

            classes = tag._classes;

            /**
             * Create the group
             */
            group = new Designer.ui.group.Group();

            group.add(tag);

            titleBar = tag._addWidget({
                fit: ['top', 'left', 'right'],
                height: titlebarHeight,
                top: 0,
                left: 0,
                right: 0,
                'class': classes.titlebar.classname,
                parent: tag,
                type: 'container'
            });

            var dTitle = tag._addWidget({
                fit: ['top', 'left', 'right'],
                height: 14,
                top: 6,
                left: 0,
                right: 0,
                'class': classes.titlebar.subwidgets.title,
                parent: titleBar,
                type: 'richText',
                'z-index': -1,
                attribs: {
                    'data-text': 'Dialog Title',
                    'data-autoWidth': 'false'
                }
            });

            action = new Designer.action.ModifyStyleInline({
                val: titleBar.getWidth(),
                oldVal: titleBar.getWidth() - 1,
                tagId: dTitle.id,
                tagHtmlId: dTitle.getId(),
                prop: "width"
            });

            Designer.getHistory().add(action);

            var dIcon = tag._addWidget({
                fit: ['top', 'left'],
                height: 20,
                top: 2,
                left: 2,
                'class': classes.titlebar.subwidgets.iconimage,
                parent: titleBar,
                width: 20,
                type: 'image',
                attribs: {
                    'data-src': '/walib/WAF/widget/dialog/images/alert.png'
                }
            });

            var dMaximaze = tag._addWidget({
                type: 'button',
                width: 15,
                height: 15,
                right: 27,
                top: 5,
                fit: ['right', 'top'],
                parent: titleBar,
                'class': classes.titlebar.subwidgets.buttons + ' ' + classes.titlebar.subwidgets.maximize,
                attribs: {
                    'data-text': '+'
                }
            });

            var dMinimize = tag._addWidget({
                type: 'button',
                width: 15,
                height: 15,
                right: 46,
                top: 5,
                fit: ['right', 'top'],
                parent: titleBar,
                'class': classes.titlebar.subwidgets.buttons + ' ' + classes.titlebar.subwidgets.minimize,
                attribs: {
                    'data-text': '-'
                }
            });

            var dClose = tag._addWidget({
                type: 'button',
                width: 15,
                height: 15,
                right: 8,
                top: 5,
                fit: ['right', 'top'],
                parent: titleBar,
                'class': classes.titlebar.subwidgets.buttons + ' ' + classes.titlebar.subwidgets.close,
                attribs: {
                    'data-text': 'x'
                }
            });

            var dMainContainer = tag._addWidget({
                fit: ['top', 'left', 'right', 'bottom'],
                top: titlebarHeight,
                left: 0,
                right: 0,
                bottom: toolbarHeight,
                'class': classes.content.classname,
                parent: tag,
                type: 'container',
                "context": context["protected"] + " " + context["allowDrop"] + " " + context["allowBind"]
            });

            toolbar = tag._addWidget({
                fit: ['bottom', 'left', 'right'],
                height: toolbarHeight,
                bottom: 0,
                left: 0,
                right: 0,
                top: null,
                'class': classes.toolbar.classname,
                parent: tag,
                type: 'container',
                "context": context["protected"]
            });

            btnCancel = tag._addWidget({
                type: 'button',
                width: 60,
                height: 20,
                right: 73,
                top: 2,
                fit: ['right', 'top'],
                parent: toolbar,
                attribs: {
                    'data-text': 'Cancel'
                },
                "context": context["protected"]
            });
            btnCancel.setRole('cancel');

            Designer.studio.createEvent('', btnCancel.getLib(), btnCancel.getId(), 'click', btnCancel.getType(), undefined, false);
            Designer.studio.setScriptEvent(btnCancel.getId(), btnCancel.getType(), 'click', "\t\t$$(" + (Designer.isComponent() ? 'getHtmlId("' : "'") + tag.getAttribute('id').getValue() + (Designer.isComponent() ? '")' : "'") + ").closeDialog(); //cancel button");

            btnCancel.getEvent('click').setHandlerName('click');

            btnOK = tag._addWidget({
                type: 'button',
                width: 60,
                height: 20,
                right: 8,
                top: 2,
                fit: ['right', 'top'],
                parent: toolbar,
                attribs: {
                    'data-text': 'OK'
                },
                "context": context["protected"]
            });
            btnOK.setRole('confirm');

            Designer.studio.createEvent('', btnOK.getLib(), btnOK.getId(), 'click', btnOK.getType(), undefined, false);
            Designer.studio.setScriptEvent(btnOK.getId(), btnOK.getType(), 'click', "\t\t$$(" + (Designer.isComponent() ? 'getHtmlId("' : "'") + tag.getAttribute('id').getValue() + (Designer.isComponent() ? '")' : "'") + ").closeDialog(); //ok button");

            btnOK.getEvent('click').setHandlerName('click');

            tag.addAttribute('data-linked-tag');
            tag.getAttribute('data-linked-tag').setValue([titleBar.getId(), dTitle.getId(), dIcon.getId(), dMaximaze.getId(), dMinimize.getId(), dClose.getId(), dMainContainer.getId(), toolbar.getId(), btnCancel.getId(), btnOK.getId()].join(','));

            D.ui.group.save();

            tag.onDesign(true);

        } else {
            /*
             * Execute script when widget is entirely loaded (with linked tags)
             */
            $(tag).bind('onReady', function() {
                var
                linkedWidgets;

                tag.getAttribute('data-hideOnOutsideClick').setVisibility(tag.getAttribute('data-modal').getValue() === 'true');

                linkedWidgets = tag.getLinks();

                for (var i = 0, widget; widget = linkedWidgets[i]; i++) {
                    widget.setAsSubWidget(true);
                    widget.onClick = tag._subWidgetsClickFn;
                }
            });
        }

        $('#textInput-data-load').css({
            'cursor': 'default'
        })
    }
});