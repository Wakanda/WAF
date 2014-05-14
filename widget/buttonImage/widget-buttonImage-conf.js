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
    packageName: 'Widget/buttonImage',
    type: 'buttonImage',
    lib: 'WAF',
    description: 'Image Button',
    category: 'Form Controls',
    bindable: 'EntityModel,relatedEntity,relatedEntities',
    img: '/walib/WAF/widget/buttonImage/icons/widget-buttonImage.png',
    tag: 'div',
    attributes: [
        {
            name: 'data-binding',
            description: 'Source',
            onchange: function() {
                if (!this.getValue()) {
                    $('#dropdown-data-action').parent().parent().hide();
                } else {
                    $('#dropdown-data-action').parent().parent().show();
                }
            }
        },
        {
            name: 'data-action',
            description: 'Action',
            defaultValue: 'simple',
            type: 'dropdown',
            options: [{
                    key: 'create',
                    value: 'Create'
                }, {
                    key: 'simple',
                    value: 'Simple'
                }, {
                    key: 'save',
                    value: 'Save'
                }, {
                    key: 'next',
                    value: 'Next'
                }, {
                    key: 'previous',
                    value: 'Previous'
                }, {
                    key: 'last',
                    value: 'Last'
                }, {
                    key: 'first',
                    value: 'First'
                }, {
                    key: 'remove',
                    value: 'Remove'
                }],
            onchange: function() {
                /*
                 * Auto change image button label
                 */
                this.data.tag._changeLabel(WAF.utils.ucFirst(this.getValue()));

                D.tag.refreshPanels();
            },
            ready: function() {
                if (!this.data.tag.getSource()) {
                    this.getHtmlObject().parent().parent().hide();
                }
            }
        },
        {
            name: 'class',
            description: 'Css class'
        },
        {
            name: 'data-text',
            description: 'Text',
            /*
             * Get label text
             */
            ready: function() {
                var
                i,
                tag,
                icon,
                data,
                label,
                diffLabel,
                selection,
                selectionL,
                labelValue;

                selection = Designer.env.tag.selection;
                selectionL = selection.count();

                if (selectionL <= 0) {
                    data = this.data;
                    tag = data.tag;
                    icon = tag.getLinks()[0];

                    if (typeof icon !== 'undefined') {
                        label = icon.getLabel();
                    }

                    if (label && label.status != 'destroy') {
                        this.setValue(label.getAttribute('data-text').getValue());
                    } else {
                        this.setValue('');
                    }
                } else {
                    diffLabel = false;

                    for (i = 0; i < selectionL; i += 1) {
                        tag = selection.get(i);
                        icon = tag.getLinks()[0];

                        if (!icon) {
                            continue;
                        }

                        label = icon.getLabel();

                        if (labelValue && labelValue != label.getAttribute('data-text').getValue()) {
                            diffLabel = true;
                            break;
                        }

                        labelValue = label.getAttribute('data-text').getValue();
                    }
                    if (!diffLabel && labelValue) {
                        this.setValue(labelValue);
                    } else {
                        this.setValue('');
                    }
                }
                if (icon) {
                    icon.addContext("protected allowResize");
                }
                if (label) {
                    label.addContext("protected");
                }
            },
            /*
             * Change label text
             */
            onchange: function() {
                var
                i,
                tag,
                selection,
                selectionL;

                selection = Designer.env.tag.selection;
                selectionL = selection.count();

                if (selectionL <= 0) {
                    /*
                     * Auto change image button label
                     */
                    this.data.tag._changeLabel(this.getValue(), true);
                } else {
                    for (i = 0; i < selectionL; i += 1) {
                        tag = selection.get(i);

                        tag._changeLabel(this.getValue(), true);
                    }
                }
            }
        },
        {
            name: 'data-link',
            description: 'URL',
            onchange: function() {
                if (!this.getValue()) {
                    $('#dropdown-data-target').parent().parent().hide();
                } else {
                    $('#dropdown-data-target').parent().parent().show();
                }
            }
        },
        {
            name: 'data-target',
            description: 'Target',
            type: 'dropdown',
            options: ['_blank', '_self'],
            defaultValue: '_blank',
            ready: function() {
                if (this.data.tag.getAttribute('data-link') && !this.data.tag.getAttribute('data-link').getValue()) {
                    this.getHtmlObject().parent().parent().hide();
                }
            }
        },
        {
            name: 'tabindex',
            description: 'Tabindex'
        }],
    events: [{
            name: 'click',
            description: 'On Click',
            category: 'Mouse Events'
        },
        {
            name: 'dblclick',
            description: 'On Double Click',
            category: 'Mouse Events'
        },
        {
            name: 'mousedown',
            description: 'On Mouse Down',
            category: 'Mouse Events'
        },
        {
            name: 'mouseout',
            description: 'On Mouse Out',
            category: 'Mouse Events'
        },
        {
            name: 'mouseover',
            description: 'On Mouse Over',
            category: 'Mouse Events'
        },
        {
            name: 'mouseup',
            description: 'On Mouse Up',
            category: 'Mouse Events'
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
    style: [,
        {
            name: 'width',
            defaultValue: '130px'
        },
        {
            name: 'height',
            defaultValue: function() {
                var result;
                if (typeof Designer !== "undefined") {
                    if (Designer.isMobile) {
                        result = "29px";
                    } else {
                        result = "45px";
                    }
                }

                return result;
            }.call()
        }],
    properties: {
        style: {
            theme: {
                'roundy': false
            },
            fClass: true,
            text: false,
            background: true,
            border: true,
            sizePosition: true,
            shadow: true,
            textShadow: false,
            innerShadow: true,
            label: false
        },
        state: [{
                label: 'hover',
                cssClass: 'waf-state-hover',
                find: '',
                mobile: false
            }, {
                label: 'active',
                cssClass: 'waf-state-active',
                find: '',
                mobile: true
            }, {
                label: 'focus',
                cssClass: 'waf-state-focus',
                find: '',
                mobile: true
            }, {
                label: 'disabled',
                cssClass: 'waf-state-disabled',
                find: '',
                mobile: true
            }]
    },
    onInit: function(config) {
        new WAF.widget.ButtonImage(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        if (isResize) {
            /*
             * Center content
             */
            tag._centerContent();
        }
    },
    onCreate: function(tag, param) {

        var icon,
        group,
        iconLabel;

        /**
         * Get the linked icon widget
         * @method getWidgetIcon
         * @return {object}
         */
        tag.getWidgetIcon = function buttonImage_get_widget_label() {
            var icon = this.getLinks()[0] || null;

            return icon;
        }

        /**
         * Get the linked label widget
         * @method getWidgetLabel
         * @return {object}
         */
        tag.getWidgetLabel = function buttonImage_get_widget_label() {
            var icon,
            label;

            icon = this.getWidgetIcon();
            label = icon.getLabel() || null

            if (label.status == "destroy") {
                label = null;
            }

            return label;
        }

        /**
         * Change the label value of the linked icon
         * @method _autoChangeLabel
         * @param {string} newValue
         * @param {boolean} force : force label change
         */
        tag._changeLabel = function buttonImage_change_label(newValue, force) {
            var icon,
            label,
            value,
            attribute;

            icon = this.getWidgetIcon();
            label = icon.getLabel();

            if (label && label.status != 'destroy') {

                attribute = label.getAttribute('data-text');
                value = attribute.getValue();

                /*
                 * Destroy label if no value
                 */
                if (newValue == '') {
                    D.tag.deleteWidgets(label, undefined, undefined, false);
                }

                if (force || value == "[" + this.getId() + "]" || /create|save|next|previous|simple|last|first|remove/.test(value.toLowerCase())) {
                    attribute.setValue(newValue);

                    icon.getAttribute('data-label').setValue(newValue);
                    icon.domUpdate();
                    icon.onDesign(true);
                    
                    label.domUpdate();
                    //ugly bind due to a setTimeout in the label widget
                    $(label).bind('textValueUpdated', function() {
                        tag._centerContent();
                    });
                    
                    label.onDesign(true);

                }
            } else {
                /*
                 * Create label widget
                 */
                icon.getAttribute('data-label').setValue(newValue);
                D.tag.setLabel(icon)
                icon.onDesign(true);
                icon.domUpdate();

            }
        }

        tag._bindIconEvents = function(icon) {
            var iconLabel = icon.getLabel();

            /*
             * Prevent binding on icon and label
             */
            if (icon) {
                icon.preventBinding = true;
            }

            icon._inButton = true;

            /*
             * Center content on icon design change
             */
            $(icon).unbind('onWidgetDesign').bind('onWidgetDesign', function() {
                var
                button;

                button = this.getLinks()[0];

                if (button) {
                    button._centerContent();
                }

                /*
                 * Refresh focus position
                 */
                Designer.ui.focus.setPosition(icon);
                Designer.ui.focus.setSize(icon);
            });

            if (iconLabel && iconLabel.status != 'destroy') {

                iconLabel.preventBinding = true;
                /*
                 * Center content on icon design change
                 */
                $(iconLabel).unbind('onWidgetDesign').bind('onWidgetDesign', function() {
                    var
                    icon,
                    button;

                    icon = this.getLinkedTag();
                    button = icon.getLinks()[0];

                    if (button) {
                        button._centerContent();
                    }

                    /*
                     * Refresh focus position
                     */
                    Designer.ui.focus.setPosition(icon);
                    Designer.ui.focus.setSize(icon);
                });


                /*
                 * Icon label custom on file drop event
                 * Trigger icon onFileDrop event
                 */
                $(iconLabel).bind('onFileDrop', {tag: tag}, function(e, data) {

                    data.keepSize = true;
                    $(e.data.tag).trigger('onFileDrop', data);
                });

                /*
                 * Icon label custom on destroy event
                 * Reset position
                 */
                $(iconLabel).bind('onWidgetDestroy', {tag: tag}, function() {
                    // tag._centerContent();
                })
            }

            /*
             * Widgeticon  custom on state change event
             * Also change parent widget states
             */
            $(icon).bind('onStateChange', function() {
                var state,
                button,
                stateObj,
                buttonState,
                buttonStateObj;

                button = this.getLinks()[0];

                stateObj = this.getCurrentState();
                state = stateObj ? stateObj.cssClass : '';
                buttonStateObj = button.getCurrentState();
                buttonState = buttonStateObj ? buttonStateObj.cssClass : '';

                /*
                 * Get equivalence
                 */
                switch (state) {
                    case 'waf-state-state2':
                        state = 'waf-state-hover';
                        break;

                    case 'waf-state-state3':
                        state = 'waf-state-active';
                        break;

                    case 'waf-state-state4':
                        state = 'waf-state-disabled';
                        break;

                    default:
                        state = '';
                        break;
                }

                /*
                 * Change button state
                 */
                if (buttonState == 'waf-state-focus' && state == '') {
                    // DO NOTHING
                } else if (buttonState != state) {
                    button.changeState(state);
                }
            });

            /*
             * Icon label custom on destroy event
             * Reset position
             */
            $(icon).bind('onWidgetDestroy', {tag: tag}, function() {
                if (tag.status != 'destroy') {
                    D.tag.deleteWidgets(tag);
                }
            });
        };

        /**
         * Init widget : bind custom events
         * @method _init
         */
        tag._init = function buttonImage_init(fromRedo) {
            var icon,
            iconLabel;

            icon = this.getLinks(fromRedo === true)[0];
            // iconLabel   = icon.getLabel();      

            tag._bindIconEvents(icon);

            /*
             * Widget custom on file drop event
             * Trigger icon onFileDrop event
             */
            $(tag).bind('onFileDrop', {}, function(e, data) {
                var icon = this.getLinks()[0];

                data.silentMode = true;

                data.keepSize = true;
                $(icon).trigger('onFileDrop', data);

                this.setCurrent();
                D.tag.refreshPanels();
            });

            /*
             * Widget custom dom update event
             * Remove useless attributes
             */
            $(tag).bind('onDomUpdate', function(e, element) {
                element.removeAttribute('data-text');
            });

            /*
             * Widget custom on state change event
             * Also change sub widgets  states
             */
            $(tag).bind('onStateChange', function() {
                var icon,
                state,
                nState,
                stateObj,
                iconState,
                iconLabel,
                iconStateObj,
                disableButton;

                icon = this.getWidgetIcon();
                stateObj = this.getCurrentState();
                state = stateObj ? stateObj.cssClass : '';
                iconStateObj = icon.getCurrentState();
                iconState = iconStateObj ? iconStateObj.cssClass : '';
                iconLabel = icon.getLabel();

                /*
                 * Get equivalence
                 */
                switch (state) {
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

                /*
                 * Change icon state
                 */
                if (iconState != nState) {
                    icon.changeState(nState);

                    if (iconLabel) {
                        iconLabel.changeState(nState);
                    }
                }
            });
        }

        // on WidgetCopy we automatically copy the icon of the original image
        $(tag).bind('onWidgetCopy', function(e, originalElement, copyParams) {
            if (originalElement && originalElement.getLinks().length) {
                var icon = originalElement.getLinks()[0].copy(copyParams.inPlace, copyParams.silentMode, this)[0];
                if (icon) {
                    this._setIcon(icon);
                    icon.refresh();
                }
            }
        });

        /**
         * Center the content of the widget
         * @method _centerContent
         */
        tag._centerContent = function buttonImage_center_content() {
            var icon,
            newTop,
            newLeft,
            labelPos,
            eltWidth,
            tagWidth,
            eltHeight,
            tagHeight,
            iconLabel,
            iconWidth,
            iconHeight,
            iconMargin;

            icon = this.getLinks()[0];
            tagWidth = this.getWidth();
            tagHeight = this.getHeight();

            if (!icon) {
                return;
            }

            iconWidth = eltWidth = icon.getWidth();
            iconHeight = eltHeight = icon.getHeight();
            iconLabel = icon.getLabel();

            /*
             * Include label size to position calcul
             */
            if (iconLabel && iconLabel.status != 'destroy') {
                labelPos = icon.getAttribute('data-label-position').getValue();
                iconMargin = parseInt(iconLabel.getAttribute('data-margin').getValue())

                switch (labelPos) {
                    case 'left':
                        eltWidth += iconLabel.getWidth() + iconMargin;
                        newLeft = (tagWidth / 2) + (eltWidth / 2) - iconWidth;
                        newTop = (tagHeight / 2) - (eltHeight / 2);

                        break;

                    case 'right':
                        eltWidth += iconLabel.getWidth() + iconMargin;
                        newLeft = (tagWidth / 2) - (eltWidth / 2);
                        newTop = (tagHeight / 2) - (eltHeight / 2);

                        break;

                    case 'top':
                        eltHeight += iconLabel.getHeight() + iconMargin;
                        newLeft = (tagWidth / 2) - (eltWidth / 2);
                        newTop = (tagHeight / 2) + (eltHeight / 2) - iconHeight;

                        break;

                    case 'bottom':
                        eltHeight += iconLabel.getHeight() + iconMargin;
                        newLeft = (tagWidth / 2) - (eltWidth / 2);
                        newTop = (tagHeight / 2) - (eltHeight / 2);

                        break;
                }

            } else {
                newLeft = (tagWidth / 2) - (eltWidth / 2);
                newTop = (tagHeight / 2) - (eltHeight / 2);
            }

            icon.setXY(newLeft, newTop, true, false);

            if (iconLabel && iconLabel.status != 'destroy') {
                /*
                 * Refresh label position
                 */
                iconLabel._refreshPosition();
            }

        };

        tag._setIcon = function(icon) {
            icon.setParent(this);
            if (icon.getLabel()) {
                icon.getLabel().setParent(this);
            }

            /*
             * Link widgets
             */
            icon.link(this);
            this.link(icon);

            /*
             * Group widgets
             */
            group = new Designer.ui.group.Group();
            group.add(this);
            group.add(icon);
            group.add(icon.getLabel());

            /*
             * Save the group
             */
            Designer.ui.group.save();

            /*
             * Create a label to the icon
             */
            // D.tag.setLabel(icon);

            iconLabel = icon.getLabel();

            /*
             * Set label align if not defined
             */
            if (iconLabel && iconLabel.status != 'destroy') {
                iconLabel.getAttribute('data-valign').setValue('middle');
                iconLabel.setCss('text-align', 'center');
                iconLabel.setCss('position', 'absolute');
            }

            // be sure to center label/icon
            tag._centerContent();
        }

        if (param.fromCopy) {
            // do nothing
        } else if (!param._isLoaded) {
            /*
             * Create icon widget with label
             */
            icon = D.createTag({
                type: 'icon',
                silentMode: true,
                parent: tag,
                width: 24,
                height: 24,
                left: 5,
                top: 10,
                attr: {
                    'data-label': '[' + tag.getId() + ']',
                    'data-label-position': 'right'
                }
            });

            tag._setIcon(icon);

            /*
             * Center content
             */
            tag._centerContent();

            /*
             * Init button
             */
            tag._init();
        } else {
            $(tag).bind('onReady', function(e, data) {

                /*
                 * Init button
                 */
                this._init(data && data.from && data.from == 'redo');
            });
        }
    }
});
