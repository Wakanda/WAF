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
    packageName: 'Widget/menuItem',
    type: 'menuItem',
    lib: 'WAF',
    description: 'Menu Item',
    category: 'Hidden',
    img: '/walib/WAF/widget/menuItem/icons/widget-menuItem.png',
    tag: 'li',
    hasOverlay: false,
    attributes: [{
            name: 'data-text',
            description: 'Text',
            context: ['protected'],
            ready: function() {
                var
                tag;

                tag = this.data.tag;

                this.setValue(tag.getText());
            },
            onchange: function() {
                var
                tag;

                tag = this.data.tag;

                tag.setText(this.getValue());
            }
        }, {
            name: 'data-icon',
            type: 'file',
            description: 'Icon URL',
            context: ['protected'],
            ready: function() {
                var
                tag,
                contentWidget;

                tag = this.data.tag;
                contentWidget = tag.getContentWidget();

                if (contentWidget && contentWidget.getType() == 'icon') {
                    this.setValue(contentWidget.getPath());
                }

            },
            onchange: function() {
                var
                tag,
                linkedTags,
                iconTag;

                tag = this.data.tag;

                if (this.getValue() == "") {
                    linkedTags = tag.getLinks();
                    for (var i = 0; i < linkedTags.length; i++) {
                        if (linkedTags[i].isIcon()) {
                            iconTag = linkedTags[i];
                            break;
                        }
                    }
                    Designer.tag.deleteWidgets(iconTag);
                }
                else {
                    tag.setIcon(this.getValue());
                }
            }
        }, {
            name: 'data-items',
            description: 'Menu items',
            type: 'grid',
            domAttribute: false,
            columns: [{
                    type: 'button',
                    buttonType: 'image',
                    icon: 'edit'
                }, {
                    type: 'textField'
                }],
            ready: function(argument) {
                var
                i,
                tag,
                item,
                items,
                itemsL,
                subMenu;

                tag = this.data.tag;
                subMenu = tag.getSubMenu();

                /*
                 * Do not display if menu item is inside a tabview
                 */
                if (tag.getParent().getParent().getType() == 'tabView') {
                    this.formPanel.htmlObject.hide();
                }

                if (subMenu) {
                    items = subMenu.getItems(undefined, true);
                    itemsL = items.length;

                    for (i = 0; i < itemsL; i += 1) {
                        item = items[i];
                        this.addRow([{
                                type: 'button',
                                buttonType: 'image',
                                icon: 'edit',
                                data: {item: item},
                                onclick: function() {
                                    this.data.item.setCurrent();
                                    D.tag.refreshPanels();
                                }
                            }, {
                                type: 'textField',
                                value: item.getText ? item.getText() : '',
                                data: {item: item},
                                onchange: function(argument) {
                                    this.data.item.setText(this.getValue());
                                }
                            }], false, true, false);
                    }
                }
            },
            afterRowAdd: function(data) {
                var
                input,
                newItem;

                input = data.items[1];

                /*
                 * Add new menu item
                 */
                newItem = this.data.tag.addMenuItem();

                data.items[0].htmlObject.bind('click', {item: newItem}, function(e) {
                    e.data.item.setCurrent();
                    D.tag.refreshPanels();
                });

                /*
                 * Change input value
                 */
                input.setValue(newItem.getText());
                input.data = {
                    item: newItem
                };

                input.onchange = function(argument) {
                    this.data.item.setText(this.getValue());
                };
            },
            afterRowDelete: function(data) {
                var
                menuItem;

                menuItem = data.items[1].data.item;

                menuItem.remove(false);
            },
            afterRowSort: function(data) {
                var
                tag,
                subMenu;

                tag = this.data.tag;
                subMenu = tag.getSubMenu();

                /*
                 * Call menubar sort function
                 */
                subMenu.sort(data.movedIndex, data.index);

            }
        }],
    events: [{
            name: 'click',
            description: 'On Click',
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
            name: 'onmouseup',
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
        } /*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/],
    style: [{
            name: 'width',
            defaultValue: function() {
                var result;
                if (typeof Designer !== "undefined") {
                    if (Designer.isMobile) {
                        result = "60px";
                    } else {
                        result = "110px";
                    }
                    return result;
                }
            }.call()
        },
        {
            name: 'height',
            name        : 'height',
            defaultValue: function(config) {
                var devaultValue = '22px';
                if (config && config.parent && config.parent.getLevel() == 0) {
                    devaultValue = '50px';
                }
                return devaultValue;
            }.call()
        }],
    properties: {
        style: {
            theme: false,
            fClass: true,
            text: true,
            background: true,
            border: true,
            sizePosition: true,
            label: true,
            textShadow: true,
            innerShadow: true,
            shadow: true,
            disabled: ['left', 'top', 'z-index']
        },
        state: [{
                label: 'hover',
                cssClass: 'waf-state-hover',
                mobile: false
            }, {
                label: 'active',
                cssClass: 'waf-state-active',
                mobile: true
            }, {
                label: 'selected',
                cssClass: 'waf-state-selected',
                mobile: true
            }, {
                label: 'disabled',
                cssClass: 'waf-state-disabled',
                mobile: true
            }]
    },
    structure: [{
            description: 'submenu bars',
            selector: '.waf-menuBar',
            style: {
                theme: true,
                fClass: true,
                text: false,
                background: true,
                border: true,
                label: true,
                shadow: true,
                disabled: ['border-radius']
            }
        }, {
            description: 'submenu items',
            selector: '.waf-menuItem',
            style: {
                theme: false,
                fClass: true,
                text: true,
                background: true,
                border: true,
                sizePosition: true,
                textShadow: true,
                innerShadow: true,
                shadow: true
            },
            state: [{
                    label: 'hover',
                    cssClass: 'waf-state-hover',
                    find: '.waf-menuItem',
                    mobile: false
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-menuItem',
                    mobile: true
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-menuItem',
                    mobile: true
                }, {
                    label: 'disabled',
                    cssClass: 'waf-state-disabled',
                    find: '.waf-menuItem',
                    mobile: true
                }]
        }],
    onInit: function(config) {
        var widget = new WAF.widget.MenuItem(config);
        return widget;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
    },
    onCreate: function(tag, param) {
        var
        jQTag,
        menuBar,
        lastClass,
        borderTop,
        firstClass,
        menuItemsI,
        borderLeft,
        menuBarSize,
        menuItemsSize;

        firstClass = 'waf-menuItem-first';
        lastClass = 'waf-menuItem-last';
        menuBar = tag.getParent();
        jQTag = $(tag);

        defaultText = menuBar.getParent().getType() == 'tabView' ? '[Tab {1}]' : '[Item {1}]';

        /**
         * Get the formatted default text of the menu item
         * @function getDefaultText
         * @param {number} index menu item index
         * @return {string}
         */
        tag.getDefaultText = function menuitem_get_default_text(index) {
            return defaultText.replace('{1}', index);
        }

        /*
         * To prevent default resize actions
         */
        tag._preventResizeActions = true;

        /**
         * Get the content widget (richtext or icon)
         * @function getContentWidget
         * @return {object} widget
         */
        tag.getContentWidget = function menuitem_get_content_widget() {
            var
            type,
            child,
            result,
            children,
            childrenL;

            children = this.getChildren();
            childrenL = children.length;

            for (i = 0; i < childrenL; i += 1) {
                child = children[i];

                if (child) {
                    type = child.getType();

                    if (!child.isDeleted() && (type == 'icon' || type == 'richText')) {
                        result = child;
                        break;
                    }
                }
            }

            return result;
        }

        /**
         * Get the index of the widget into the menubar
         * @function getIndex
         * @return {number} index
         */
        tag.getIndex = function menuitem_get_index() {
            var
            i,
            result,
            menuItems;

            menuItems = menuBar.getItems(false, true);
            menuItemsL = menuItems.length;

            for (i = 0; i < menuItemsL; i += 1) {
                if (menuItems[i] == this) {
                    result = i;
                    break;
                }
            }

            return result;
        }

        /**
         * Custom resize function
         * @function _resize
         * @param {object}
         */
        tag._resize = function menuitem_resize(params) {
            var
            dif,
            index,
            menuBar,
            barSizes,
            prevItem,
            newWidth,
            newHeight,
            orientation,
            oldHeight,
            oldWidth,
            contentWidget;

            newHeight = params.size.height;
            newWidth = params.size.width;
            oldHeight = params.originalSize.height;
            oldWidth = params.originalSize.width;
            menuBar = this.getParent();
            if (!menuBar || !menuBar.getOrientation)
                return;
            barSizes = menuBar.getSize();
            contentWidget = this.getContentWidget();
            orientation = menuBar.getOrientation();
            index = this.getIndex();

            if (!D.env._prevenItemstResize) {
                Designer.beginUserAction('070');

                D.env._prevenItemstResize = true;

                var action = new Designer.action.ResizeMenuItem({
                    val: 1,
                    oldVal: 0,
                    tagId: this.id,
                    data: {
                        moveX: D.env._MoveX,
                        moveY: D.env._MoveY,
                        barSizes: barSizes,
                        newSizes: {
                            width: newWidth,
                            height: newHeight
                        },
                        oldSizes: {
                            width: oldWidth,
                            height: oldHeight
                        }
                    }
                });

                Designer.getHistory().add(action);

                prevItem = menuBar.getItems(undefined, true)[index - 1];

                /*
                 * Change menubar min size
                 */
                switch (menuBar.getOrientation()) {
                    case 'horizontal':
                        if (newWidth) {
                            dif = oldWidth - newWidth;
                            menuBar.minWidth -= dif;

                            if (D.env._MoveX) {
                                D.env._MoveX = null;

                                if (index == 0) {
                                    menuBar.setX(menuBar.getX() + dif);
                                    menuBar.setWidth(menuBar.getWidth() - dif);
                                } else if (prevItem) {
                                    prevItem.setWidth(prevItem.getWidth() + dif);
                                }
                            }
                        }
                        break;

                    case 'vertical':
                        if (newHeight) {
                            dif = oldHeight - newHeight;
                            menuBar.minHeight -= dif;

                            if (D.env._MoveY) {
                                D.env._MoveY = null;

                                if (index == 0) {
                                    menuBar.setY(menuBar.getY() + dif);
                                    menuBar.setHeight(menuBar.getHeight() - dif);
                                } else if (prevItem) {
                                    prevItem.setHeight(prevItem.getHeight() + dif);
                                }
                            }
                        }
                        break;
                }

                /*
                 * Resize menubar if necessary
                 */
                menuBar.checkSize();

                D.env._prevenItemstResize = false;
            }

            /*
             * Reset text widget size line height
             */
            if (contentWidget && contentWidget.getType() == 'richText') {
                if (newHeight) {
                    contentWidget.setHeight(newHeight);
                }

                if (newWidth) {
                    contentWidget.setWidth(newWidth);
                }
            }
        }

        /**
         * Private clean content widget function
         * @function _cleanContentWidget
         * @param {object} content widget [optional]
         */
        tag._cleanContentWidget = function(widget) {
            var
            that,
            size,
            subMenu,
            orientation,
            contentWidget;

            that = this;
            contentWidget = widget || this.getContentWidget();

            subMenu = this.getSubMenu();

            if (contentWidget) {
                /*
                 * On file drop, automatically trigger menuitem drop event
                 */
                if (contentWidget.getType() == 'richText') {
                    /*
                     * Remove overlay
                     */
                    if (contentWidget.hasOverlay()) {
                        contentWidget.removeOverlay();
                    }

                    contentWidget.getHtmlObject().addClass('waf-menuItem-text');

                    /*
                     * Remove resize handle on content widget
                     */
                    contentWidget.resizeHandles = 'none';

                    $(contentWidget).bind('onWidgetFocus', function(e, type) {
                        /*
                         * Auto focus on content widget's parent
                         */
                        if (this.getParent().getType() != 'document') {
                            this.getParent().setCurrent();
                        }
                    });

                    $(contentWidget).bind('onFileDrop', {tag: this}, function(e, data) {
                        /*
                         * Trigger menu item file drop
                         */
                        if (this.getType() != 'icon') {
                            $(e.data.tag).trigger('onFileDrop', data);
                        }
                    });
                } else {
                    /*
                     * On icon destroy, set label as text
                     */
                    $(contentWidget)
                    .bind('onWidgetDestroy', {tag: this}, function(e) {
                        var
                        text,
                        label;

                        label = this.getLabel();

                        text = label ? label.getAttribute('data-text').getValue() : that.getDefaultText('');

                        if (label && label.status != 'destroy')
                            e.data.tag.setText(text);
                    })
                    .bind('onCreateLabel', {tag: this}, function(e, label) {
                        var
                        tag;

                        tag = e.data.tag;

                        tag.resetIconPosition();

                        $(label)
                        /*
                         * Refresh icon position on label position change
                         */
                        .bind('onPositionChange', {tag: tag}, function(e) {
                            e.data.tag.resetIconPosition();
                        })
                        /*
                         * Refresh icon position on label destroy
                         */
                        .bind('onWidgetDestroy', {tag: tag}, function(e) {
                            e.data.tag.resetIconPosition();
                        });
                    });
                }

                /*
                 * Force subMenu position to fix bug
                 */
                if (subMenu) {
                    orientation = this.getParent().getOrientation();
                    size = this.getSize();

                    if (orientation == 'horizontal') {
                        subMenu.getHtmlObject().css({
                            'top': size.height + 'px',
                            'left': '0px'
                        });
                    } else {
                        subMenu.getHtmlObject().css({
                            'left': size.width + 'px',
                            'top': '0px'
                        });
                    }

                    /*
                     * Remove overlay on submenu
                     */
                    if (subMenu.hasOverlay()) {
                        subMenu.removeOverlay();
                    }
                }
            }
        }

        /**
         * Get the text value
         * @function getText
         * @return {string} value
         */
        tag.getText = function menuItem_get_text() {
            var
            value,
            contentLabel,
            contentWidget;

            contentWidget = this.getContentWidget();

            if (contentWidget) {
                if (contentWidget.getType() == 'richText') {
                    value = contentWidget.getAttribute('data-text').getValue();
                } else {
                    contentLabel = contentWidget.getLabel();
                    if (contentLabel) {
                        value = contentLabel.getAttribute('data-text').getValue();
                    }
                }
            }

            return value;
        }

        /**
         * Set the text value
         * @function setText
         * @param {string} value
         */
        tag.setText = function menuItem_set_text(value) {
            var
            size,
            width,
            height,
            contentConfig,
            contentWidget;

            size = this.getSize();
            width = size.width;
            height = size.height;
            contentWidget = this.getContentWidget();

            if (contentWidget && contentWidget.getType() != 'container') {
                if (contentWidget.getType() == 'richText') {
                    contentWidget.getAttribute('data-text').setValue(value);
                    contentWidget.onDesign(true);
                    contentWidget.domUpdate();
                }
            } else {
                contentConfig = {
                    type: 'richText',
                    parent: this,
                    silentMode: true,
                    hasOverlay: false,
                    width: width,
                    height: height,
                    attr: {
                        'data-text': value,
                        'data-autoWidth': 'false'
                    }
                }

                contentWidget = D.createTag(contentConfig);

                $(contentWidget).bind('onReady', {menuItem: this}, function(e, data) {
                    var
                    menuItem,
                    firstParent;

                    menuItem = e.data.menuItem;
                    firstParent = menuItem.getParent().getParent();

                    if (data.from == 'redo') {
                        /*
                         * Force table cell display on redo
                         */
                        this.getHtmlObject().css('display', 'table-cell');

                        /*
                         * Force focus on menu item if submenu
                         */
                        if (firstParent.getType() == 'menuItem') {
                            firstParent.setCurrent();
                        }
                    }
                })

                contentWidget.link(this);
                this.link(contentWidget);

                this._cleanContentWidget(contentWidget);
            }

            return contentWidget;
        }

        /**
         * Set the icon of the widget
         * @function setIcon
         * @param {string} path [optional]
         * @param {string} label [optional]
         * @param {string} labelPos [optional]
         */
        tag.setIcon = function menuItem_set_icon(path, label, labelPos) {
            var
            size,
            width,
            height,
            labelWidget,
            contentConfig,
            contentWidget;

            size = this.getSize();
            width = size.width;
            height = size.height;
            contentWidget = this.getContentWidget();
            orientation = this.getParent().getOrientation();

            if (contentWidget) {
                /*
                 * If content widget already exists => destroy it
                 * and create an icon widget
                 */
                if (contentWidget.getType() == 'richText') {

                    if (typeof label == 'undefined') {
                        label = this.getText();
                    }
                    contentWidget.remove();

                    tag.setIcon(path, label);
                } else if (path) {
                    contentWidget.getAttribute('data-image-state1').setValue(path);
                    contentWidget.domUpdate();
                    contentWidget.onDesign(true);
                }

            } else {
                contentConfig = {
                    type: 'icon',
                    parent: this,
                    silentMode: true,
                    attr: {
                        'data-label': label,
                        'data-label-position': labelPos ? labelPos : orientation == 'horizontal' ? 'bottom' : 'right'
                    }
                }

                if (path) {
                    contentConfig.attr['data-image-state1'] = path;
                }

                contentWidget = D.createTag(contentConfig);

                labelWidget = contentWidget.getLabel();

                $(labelWidget)
                /*
                 * Refresh icon position on label position change
                 */
                .bind('onPositionChange', {tag: this}, function(e) {
                    e.data.tag.resetIconPosition();
                })
                /*
                 * Refresh icon position on label destroy
                 */
                .bind('onWidgetDestroy', {tag: this}, function(e) {
                    e.data.tag.resetIconPosition();
                });


                this.resetIconPosition(contentWidget, width, height, orientation);

                contentWidget.link(this);
                this.link(contentWidget);

                this._cleanContentWidget(contentWidget);
            }


            contentWidget.setAsSubWidget(true);
            contentWidget.lock();
            this.unlock();

            contentWidget.getHtmlObject().bind('click', {contentWidget: contentWidget}, function(e) {
                e.data.contentWidget.unlock();
            });

            return contentWidget;
        }

        /**
         * Reset the icon widget position
         * @function resetIconPosition
         * @param {object} icon [optional]
         * @param {number} width [optional]
         * @param {number} height [optional]
         * @param {string} orientation [optional]
         */
        tag.resetIconPosition = function menuitem_reset_icon_position(icon, width, height, orientation) {
            var
            top,
            left,
            width,
            label,
            height,
            iconSize;

            icon = icon || this.getContentWidget();
            orientation = orientation || this.getParent().getOrientation();

            if (!width && !height) {
                size = this.getSize();
                height = size.height;
                width = size.width;
            }

            if (icon && icon.getType() == 'icon') {
                iconSize = icon.getSize();
                label = icon.getLabel();
                labelPos = icon.getAttribute('data-label-position').getValue();

                /*
                 * Position icon widget
                 */
                top = (height - iconSize.height) / 2;
                left = (width - iconSize.width) / 2;

                if (label && !label.isDeleted()) {
                    switch (labelPos) {
                        case 'top':
                            top += (label.getHeight() / 2);
                            break;

                        case 'bottom':
                            top -= (label.getHeight() / 2);
                            break;

                        case 'left':
                            left += (label.getWidth() / 2);
                            break;

                        case 'right':
                            left -= (label.getWidth() / 2);
                            break;
                    }
                }

                icon.setXY(left, top, true);

                /*
                 * Refresh label position
                 */
                if (label) {
                    label._refreshPosition();
                }
            }
        }

        /**
         * Add a menuitem to the submenu of the menu item
         * @function addSubMenu 
         */
        tag.addMenuItem = function menuItem_add_menuitem() {
            var
            newItem,
            subMenu,
            menuBar,
            subConfig,
            itemSizes,
            orientation;

            menuBar = this.getParent();
            orientation = menuBar.getOrientation() == 'horizontal' ? 'vertical' : 'horizontal';

            /*
             * Get submenu if exists
             */
            subMenu = this.getSubMenu();
            itemSizes = this.getSize();

            /*
             * Create submenu if doesn't exists
             */
            if (!subMenu) {
                subConfig = {
                    type: 'menuBar',
                    parent: this,
                    silentMode: true,
                    width: itemSizes.width,
                    height: 10,
                    hasOverlay: false,
                    data: {
                        'noItems': true
                    },
                    attr: {
                        'data-display': 'vertical'
                    }
                };

                switch (orientation) {
                    case 'horizontal':
                        subConfig.left = itemSizes.width;
                        break;

                    case 'vertical':
                        subConfig.top = itemSizes.height;
                        break;
                }

                subMenu = D.createTag(subConfig);
                subMenu.getHtmlObject().show();
            }

            newItem = subMenu.addMenuItem({
                focusOnMenu: false
            });


            return newItem;
        };

        /**
         * Get the last index of the menubar
         * @return {number} last index
         */
        tag.getLastIndex = function menuitem_get_last_index() {
            var
            item,
            parent,
            itemIndex,
            menuBarItems;

            parent = this.getParent();
            menuBarItems = parent.getItems(undefined, true);
            item = menuBarItems[menuBarItems.length - 2];

            if (item && item.getText) {
                itemIndex = item.getText().match(/[0-9]+/);
            }

            if (itemIndex) {
                itemIndex = parseInt(itemIndex[0], 10);
            } else {
                itemIndex = menuBar._lastIndex || 0;
            }

            itemIndex += 1;

            return itemIndex;
        };

        /**
         * Get the submenu of the menu item if exists
         * @function getSubMenu
         * @return {object}
         */
        tag.getSubMenu = function menuitem_get_submenu() {
            var
            i,
            child,
            result,
            children,
            childrenL;

            children = this.getChildren();
            childrenL = children.length;

            for (i = 0; i < childrenL; i += 1) {
                child = children[i];

                if (child && child.getType() == 'menuBar') {
                    result = child;
                    break;
                }
            }

            return result;
        }

        if (!param._isLoaded) {
            tag.setText(tag.getDefaultText(tag.getLastIndex()));

            menuItemsI = menuBar.checkSize();
        }


        /*
         * On resize event
         */
        jQTag.bind('onResize', function(e, sizeParams) {
            // prevent call to resize event incorectly being called when menu item's parent is the document (prevents a crash on undo)
            if (this.getParent().isDocument())
                return;

            var
            menuBar,
            subMenu;

            subMenu = this.getSubMenu();
            menuBar = this.getParent();

            this._resize(sizeParams);

            /*
             * Resize submenu
             */
            if (subMenu) {
                switch (menuBar.getOrientation()) {
                    case 'horizontal':
                        subMenu.setY(this.getHeight());
                        break;

                    case 'vertical':
                        subMenu.setX(this.getWidth());
                        break;
                }
            }

            /*
             * Resize content widget if it is an icon
             */
            this.resetIconPosition();
        });

        /*
         * On Widget Destroy event
         */
        jQTag.bind('onWidgetDestroy', {menuBar: menuBar}, function(e) {
            var
            info,
            borders,
            menuBar,
            prevItem,
            nextItem,
            menuItems,
            menuItemsL;

            menuBar = e.data.menuBar;
            menuItems = menuBar.getItems(undefined, true);
            menuItemsL = menuItems.length;
            prevItem = menuItems[menuItemsL - 1];

            /*
             * Change menubar min size
             */
            switch (menuBar.getOrientation()) {
                case 'horizontal':
                    menuBar.minWidth -= this._tmpSizeWidth;
                    break;

                case 'vertical':
                    menuBar.minHeight -= this._tmpSizeHeight;
                    break;
            }

            /*
             * If latest menu item => destroy menubar
             */
            if (menuItemsL == 0) {
                menuBar.remove(false);
            }

            menuBar._setClasses();

            /*
             * Resize menubar if it's a submenu
             */
            if (menuBar._isSubMenu) {
                info = menuBar.itemsInfo();
                borders = menuBar.getBorders();

                if (info.orientation == 'horizontal') {
                    menuBar.setWidth(info.size + borders.LR);
                } else {
                    menuBar.setHeight(info.size + borders.TB);
                }

                if (D.getCurrent() == this) {
                }
            }
        });

        /*
         * Icon label custom on file drop event
         * Trigger icon onFileDrop event
         */
        jQTag.bind('onFileDrop', function(e, data) {
            var
            iconWidget,
            contentWidget;

            contentWidget = this.getContentWidget();

            if (contentWidget.getType() == 'icon') {
                iconWidget = contentWidget;
            } else {
                iconWidget = this.setIcon();
            }

            data.keepSize = true;
            $(iconWidget).trigger('onFileDrop', data);
        });


        /*
         * On focus event
         * Remove absolute position and set menu item as sub widget
         */
        jQTag.bind('onWidgetFocus', function(e) {
            var
            subMenu;

            subMenu = this.getSubMenu();

            if (subMenu) {
                subMenu.getHtmlObject().show();
            }
        });

        /*
         * On ready event
         * Remove absolute position and set menu item as sub widget
         */
        jQTag.bind('onReady', {isLoaded: param._isLoaded}, function(e, data) {
            var
            i,
            j,
            that,
            child,
            pClass,
            menuBar,
            subChild,
            children,
            childrenL,
            iconValue,
            textValue,
            subChildren,
            labelWidget,
            orientation,
            pClassSplit,
            subChildrenL,
            contentWidget;

            that = this;
            menuBar = this.getParent();
            orientation = menuBar.getOrientation ? menuBar.getOrientation() : '';
            data = data || {};

            if (e.data.isLoaded) {
                menuBar._lastIndex = menuBar._lastIndex || 0;
                menuBar._lastIndex += 1;
            }

            /*
             * @DEPRECATED : to keep retrocompatibility
             */
            if (data.from == 'load' && data.children) {
                children = data.children;
                childrenL = children.length;

                for (i = 0; i < childrenL; i += 1) {
                    child = children[i];

                    if (child.tagName === 'p') {

                        // Get the icon position class
                        pClass = child.getAttribute('class');
                        pClassSplit = pClass.split('waf-menuItem-icon-');
                        pClass = pClassSplit[1] ? pClassSplit[1] : ''

                        subChildren = children[i].getChildNodes();
                        subChildrenL = subChildren.length;

                        for (j = 0; j < subChildrenL; j += 1) {
                            subChild = subChildren[j];

                            if (subChild.tagName === "span") {
                                textValue = subChild._json.childNodes[0].nodeValue;
                            } else if (subChild.tagName === "img") {
                                iconValue = subChild.getAttribute('src');
                            }
                        }

                        if (iconValue) {
                            if (pClass == 'right')
                                pClass = 'left';
                            else if (pClass == 'left')
                                pClass = 'right';
                            else if (pClass == 'top')
                                pClass = 'bottom';
                            else if (pClass == 'bottom')
                                pClass = 'top';

                            this.setIcon(iconValue, textValue, pClass);
                        } else {
                            this.setText(textValue);
                        }
                    }
                }
            }

            if (e.data.isLoaded) {
                this._cleanContentWidget();
            }

            this.getHtmlObject()
            /*
             * To fix focus bugs
             */
            .bind('mouseover', function function_name(e) {
                var
                htmlObject;

                htmlObject = $(this);

                Designer.env.subElement.hover = {
                    elt: this,
                    tag: that
                }

                if (e.altKey) {
                    D.ui.focus.overFeedback.show(htmlObject.parent());
                } else {
                    D.ui.focus.overFeedback.show(htmlObject);
                }
                return false;
            })
            .bind('click', function function_name(e) {
                if (e.altKey) {
                    that.getParent().setCurrent();
                    D.tag.refreshPanels();
                    return false;
                }
            })
            .css('position', 'relative');

            /*
             * Set element as subWidget
             */
            this.setAsSubWidget(true);

            /*
             * Set resize handle to left and right only
             */
            switch (orientation) {
                case 'horizontal':
                    this.resizeHandles = 'e, w';
                    break;

                case 'vertical':
                    this.resizeHandles = 'n, s';
                    break;
            }

            contentWidget = this.getContentWidget();

            if (contentWidget) {
                labelWidget = contentWidget.getLabel();

                if (labelWidget) {
                    $(labelWidget)
                    /*
                     * Refresh icon position on label position change
                     */
                    .bind('onPositionChange', {tag: this}, function(e) {
                        e.data.tag.resetIconPosition();
                    })
                    /*
                     * Refresh icon position on label destroy
                     */
                    .bind('onWidgetDestroy', {tag: this}, function(e) {
                        e.data.tag.resetIconPosition();
                    });
                }

                if (contentWidget.getType() == 'icon') {
                    contentWidget.setAsSubWidget(true);
                    contentWidget.lock();
                    this.unlock();

                    contentWidget.getHtmlObject().bind('click', {contentWidget: contentWidget}, function(e) {
                        e.data.contentWidget.unlock();
                    });
                }
            }

            if (data.from == 'redo' && menuBar._setClasses) {
                menuBar._setClasses();
            }
        });

    }
});
