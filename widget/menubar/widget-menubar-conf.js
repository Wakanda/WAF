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
    packageName: 'Widget/menuBar',
    type: 'menuBar',
    lib: 'WAF',
    description: 'Menu Bar',
    category: 'Misc. Controls',
    img: '/walib/WAF/widget/menuBar/icons/widget-menuBar.png',
    tag: 'ul',
    attributes: [
        {
            name: 'class',
            description: 'Css class'
        },
        {
            name: 'data-level',
            visibility: 'hidden'
        },
        {
            name: 'data-display',
            description: 'Display',
            type: 'dropdown',
            options: [{
                    key: 'vertical',
                    value: 'Vertical'
                }, {
                    key: 'horizontal',
                    value: 'Horizontal'
                }],
            defaultValue: 'horizontal',
            saveHistory: false,
            onchange: function(argument) {
                this.data.tag.changeOrientation(this.getValue());
            }
        },
        {
            name: 'data-subMenuShow',
            description: 'Show submenus',
            type: 'dropdown',
            options: [{
                    key: 'hover',
                    value: 'On Mouse Over'
                }, {
                    key: 'click',
                    value: 'On Mouse Click'
                }],
            defaultValue: 'hover'
        },
        {
            name: 'data-tab-margin',
            description: 'Menu items margin',
            defaultValue: 0,
            typeValue: 'integer',
            slider: {
                min: -10,
                max: 10
            },
            saveHistory: false,
            ready: function() {
                var
                i,
                tag,
                selection,
                selectionL;

                tag = this.data.tag;
                selection = Designer.env.tag.selection;
                selectionL = selection.count();

                if (selectionL <= 0) {
                    tag._tmpMargin = tag.getAttribute('data-tab-margin').getValue();
                } else {
                    tag._tmpMargin = D.ui.selection.getAttribute('data-tab-margin').getValue();
                }
            },
            beforechange: function() {
                var
                i,
                tag,
                selection,
                selectionL;

                tag = this.data.tag;
                selection = Designer.env.tag.selection;
                selectionL = selection.count();

                if (selectionL <= 0) {
                    tag._tmpMargin = tag.getAttribute('data-tab-margin').getValue();
                } else {
                    tag._tmpMargin = D.ui.selection.getAttribute('data-tab-margin').getValue();
                }
            },
            onchange: function() {
                if (Designer.env.enableHistory) {
                    this.data.tag.setMargin(this.getValue(), true, false);
                }
            }
        },
        {
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
            ready: function() {
                var
                i,
                tag,
                item,
                items,
                itemsL;

                tag = this.data.tag;
                items = tag.getItems(undefined, true);
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
                            onchange: function() {
                                this.data.item.setText(this.getValue());
                            }
                        }], false, true, false);
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

                /*
                 * Add a menu item to the menu bar
                 * HACK: tabview and menubar (on its own) have different default width
                 * we make sure the added item has the correct size, no matter which
                 * context is used when creating it
                 */
                if (this.data.tag.getParent().isTabView()) {
                    newItem = this.data.tag.getParent().addTab();
                } else {
                    newItem = this.data.tag.addMenuItem();
                }

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
            canDeleteRow: function() {
                var tag = this.getData().tag;

                if (tag && tag.getItems(undefined, true).length > 1) {
                    return true;
                } else {
                    return false;
                }
            },
            afterRowSort: function(data) {
                /*
                 * Call menubar sort function
                 */
                this.data.tag.sort(data.movedIndex, data.index);

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
        }/*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/],
    style: [
        {
            name: 'width',
            defaultValue: function() {
                var result;
                if (typeof Designer !== "undefined") {
                    if (Designer.isMobile) {
                        result = "180px";
                    } else {
                        result = "332px";
                    }
                    return result;
                }
            }.call()
        },
        {
            name: 'height',
            defaultValue: '52px'
        }],
    properties: {
        style: {
            theme: true,
            fClass: true,
            text: false,
            background: true,
            border: true,
            sizePosition: true,
            label: true,
            shadow: true,
            disabled: ['border-radius']
        }
    },
    structure: [{
            group: 'all menu items',
            description: 'all menu items',
            selector: '.waf-menuItem',
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
                    find: '.waf-menuItem'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-menuItem'
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-menuItem'
                }, {
                    label: 'disabled',
                    cssClass: 'waf-state-disabled',
                    find: '.waf-menuItem'
                }]
        }, {
            group: 'all menu items',
            description: 'all menu items - first',
            selector: '.waf-menuItem-first',
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
                    find: '.waf-menuItem-first'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-menuItem-first'
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-menuItem-first'
                }, {
                    label: 'disabled',
                    cssClass: 'waf-state-disabled',
                    find: '.waf-menuItem'
                }]
        }, {
            group: 'all menu items',
            description: 'all menu items - last',
            selector: '.waf-menuItem-last',
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
                    find: '.waf-menuItem-last'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-menuItem-last'
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-menuItem-last'
                }, {
                    label: 'disabled',
                    cssClass: 'waf-state-disabled',
                    find: '.waf-menuItem'
                }]
        }, {
            group: 'main menu items',
            description: 'main menu items',
            selector: '.waf-menuItem-level-0',
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
                    find: '.waf-menuItem-level-0'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-menuItem-level-0'
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-menuItem-level-0'
                }, {
                    label: 'disabled',
                    cssClass: 'waf-state-disabled',
                    find: '.waf-menuItem'
                }]
        }, {
            group: 'main menu items',
            description: 'main menu items - first',
            selector: '.waf-menuItem-level-0.waf-menuItem-first',
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
                    find: '.waf-menuItem-level-0.waf-menuItem-first'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-menuItem-level-0.waf-menuItem-first'
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-menuItem-level-0.waf-menuItem-first'
                }, {
                    label: 'disabled',
                    cssClass: 'waf-state-disabled',
                    find: '.waf-menuItem'
                }]
        }, {
            group: 'main menu items',
            description: 'main menu items - last',
            selector: '.waf-menuItem-level-0.waf-menuItem-last',
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
                    find: '.waf-menuItem-level-0.waf-menuItem-last'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-menuItem-level-0.waf-menuItem-last'
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-menuItem-level-0.waf-menuItem-last'
                }, {
                    label: 'disabled',
                    cssClass: 'waf-state-disabled',
                    find: '.waf-menuItem'
                }]
        }, {
            group: 'submenu items',
            description: 'submenu items',
            selector: '.waf-menuItem .waf-menuItem',
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
                    find: '.waf-menuItem .waf-menuItem'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-menuItem .waf-menuItem'
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-menuItem .waf-menuItem'
                }, {
                    label: 'disabled',
                    cssClass: 'waf-state-disabled',
                    find: '.waf-menuItem'
                }]
        }, {
            group: 'submenu items',
            description: 'submenu items - first',
            selector: '.waf-menuItem .waf-menuItem-first',
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
                    find: '.waf-menuItem .waf-menuItem-first'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-menuItem .waf-menuItem-first'
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-menuItem .waf-menuItem-first'
                }, {
                    label: 'disabled',
                    cssClass: 'waf-state-disabled',
                    find: '.waf-menuItem'
                }]
        }, {
            group: 'submenu items',
            description: 'submenu items - last',
            selector: '.waf-menuItem .waf-menuItem-last',
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
                    find: '.waf-menuItem .waf-menuItem-last'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-menuItem .waf-menuItem-last'
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-menuItem .waf-menuItem-last'
                }, {
                    label: 'disabled',
                    cssClass: 'waf-state-disabled',
                    find: '.waf-menuItem'
                }]
        }],
    menu: [{
            icon: '/walib/WAF/widget/menubar/icons/round_plus.png',
            title: 'Add an item',
            callback: function() {
                /*
                 * Add a menu item to the menu bar
                 * HACK: tabview and menubar (on its own) have different default width
                 * we make sure the added item has the correct size, no matter which
                 * context is used when creating it
                 */
                if (this.getParent().isTabView()) {
                    this.getParent().addTab();
                } else {
                    this.addMenuItem();
                }

                /*
                 * Refresh property panel
                 */
                Designer.tag.refreshPanels();
            }
        }],
    onInit: function(config) {
        var widget = new WAF.widget.MenuBar(config);
        return widget;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {

        if (D.env.transCodeId === "036") {

            if (tag.getLinks()[0] && tag.getLinks()[0].isTabView()) {

                var tab = tag.getLinks()[0];
                D.getGroup(tab.getGroupId()).remove(tag);
                D.getGroup(tab.getGroupId()).add(tag);
                tab.unlink(tag);
                tab.link(tag);

            }
        }

        var
        htmlObject,
        orientation;
        htmlObject = tag.getHtmlObject();
        orientation = tag.__oldOrientation = tag.getAttribute('data-display').getValue();

        /*
         * Set widget class depending on orientation
         */
        htmlObject.addClass('waf-menuBar-' + orientation);

        if (Designer.env.design.status === "startDraw") {
            tag.initLater = true;
        }

        if (!tag.initDone && tag && Designer.env.design.status === null && tag.addDefaultTags && tag.initLater) {
            window.setTimeout(function(){
                tag.addDefaultTags();
            },0);
        }
    },
    onCreate: function(tag, param) {
        var
        i,
        level,
        jQTag;

        param.data = param.data || {};

        firstClass = 'waf-menuItem-first';
        lastClass = 'waf-menuItem-last';
        jQTag = $(tag);

        /**
         * Get the menubar items margin
         * @function getMargin
         * @return {number}
         */
        tag.getMargin = function menubar_get_margin() {
            return parseInt(this.getAttribute('data-tab-margin').getValue());
        }

        /**
         * Set the menubar items margin
         * @function setMargin
         * @param {number} value
         * @param {boolean} save to save menubar size
         * @param {boolean} force to foce data-tab-margin attribute to be setted
         */
        tag.setMargin = function menubar_set_margin(value, save, force) {
            var
            i,
            items,
            itemsL,
            oldVal,
            history,
            cssProp,
            iCssProp,
            htmlObject,
            addToWidth;

            items = this.getItems(undefined, true);
            itemsL = items.length;
            htmlObject = this.getHtmlObject();

            save = typeof save == 'undefined' ? true : save;
            force = typeof force == 'undefined' ? true : force;
            history = false;

            // Do not create a new action if this method has been called during the creation of a tabView
            // if it is a new action is started, undo would not remove the tabView which was created
            // fixes #WAK0087810
            if (!(D.env.transCodeId === 'PALETTE_DRAG' && D.env.lastWidgetIdCreated === this.getId())) {
            Designer.beginUserAction('083');
            }

            oldVal = typeof this._tmpMargin != 'undefined' ? this._tmpMargin : this.getMargin();

            if (D.env.enableHistory) {
                history = true;
                var action = new Designer.action.setMargin({
                    val: value,
                    oldVal: oldVal,
                    tagId: this.id,
                    data: {
                        oldWidth: this.getWidth(),
                        oldHeight: this.getHeight()
                    }
                });

                Designer.getHistory().add(action);

                Designer.disableHistory();
            }

            this._tmpMargin = null;

            if (force) {
                this.getAttribute('data-tab-margin').setValue(value);
            }

            if (this.getOrientation() == 'horizontal') {
                cssProp = 'margin-right';
                iCssProp = 'margin-bottom';
            } else {
                cssProp = 'margin-bottom';
                iCssProp = 'margin-right';
            }

            /*
             * Remove old margin
             */
            this.setCss(cssProp, value + 'px', '> .waf-menuItem:not(.waf-menuItem-last)');
            this.setCss(iCssProp, '0px', '> .waf-menuItem');

            addToWidth = this.getItems(undefined, true).length * value;

            /*
             * Resize menu bar if necessary
             */
            if (save) {
                this.checkSize();
            }

            if (history) {
                Designer.enableHistory();
            }
        }

        /**
         * Chech the margin and resize if necessary
         * @function checkMargin
         * @param {boolean} save to save menubar size
         */
        tag.checkMargin = function menubar_check_margin(save) {
            var
            margin;

            margin = this.getMargin();

            save = typeof save == 'undefined' ? true : save;

            /*
             * Check if a margin is defined on create
             */
            if (margin) {
                this.setMargin(margin, save, false);
            }
        }

        /**
         * Get the level of the menubar
         * @function getLevel
         * @return {number}
         */
        tag.getLevel = function menubar_get_level() {
            var
            parents,
            htmlObject;

            htmlObject = this.getHtmlObject();

            if (typeof this.level == 'undefined') {
                parents = htmlObject.parents('.waf-' + this.getType());
                this.level = parents.length;
            }

            if (this.level > 0) {
                htmlObject.addClass('waf-subWidget')
            }

            return this.level;
        }

        /**
         * Sort the menu items of the menu bar
         * @function sort
         * @param {number} from source index number
         * @param {number} to destination index number
         */
        tag.sort = function menubar_sort(from, to) {
            var
            ref,
            item,
            input,
            where,
            domEltLi1,
            domEltLi2,
            domEltBar,
            tmpDomElt,
            htmlObject;

            item = this.getItems(undefined, true)[from];
            htmlObject = item.getHtmlObject();
            ref = htmlObject.parent().children('li:not(:hidden)').eq(to);
            where = to > from ? 'after' : 'before';

            /*
             * Get dom object (from dom API)
             */
            domEltLi1 = Designer.env.document.getElementsByAttribute('li', 'id', item.getId())[0];
            domEltLi2 = Designer.env.document.getElementsByAttribute('li', 'id', ref.prop('id'))[0];
            domEltBar = Designer.env.document.getElementsByAttribute('ul', 'id', this.getId())[0];
            tmpDomElt = domEltLi1;

            Designer.beginUserAction('068');

            var action = new Designer.action.SortMenuItem({
                val: '0',
                oldVal: '1',
                tagId: this.id,
                data: {
                    oldIndex: from,
                    newIndex: to,
                    item: item,
                    where: where
                }
            });

            Designer.getHistory().add(action);

            domEltLi1.remove();

            /*
             * Move into dom
             */
            if (where == 'after') {
                ref.after(htmlObject);

                /*
                 * Move into dom api
                 */
                domEltBar.insertAfter(tmpDomElt, domEltLi2);
            } else {
                ref.before(htmlObject);

                /*
                 * Move into dom api
                 */
                domEltBar.insertBefore(tmpDomElt, domEltLi2);
            }

            this._setClasses();
        }

        /**
         * Add class on menu items dom element
         * @function _setClasses
         */
        tag._setClasses = function menubar_set_classes() {
            var
            level,
            items,
            menuBar,
            levelClass,
            orientation;

            menuBar = this;
            orientation = this.getOrientation();
            items = this.getItems(undefined, true);
            level = menuBar.getLevel();
            levelClass = 'waf-menuItem-level-' + level;

            $.each(items, function(i) {
                var
                classes,
                htmlObject;

                classes = [];
                htmlObject = this.getHtmlObject();

                classes.push('waf-menuItem-' + orientation);

                if (i == 0) {
                    classes.push(firstClass);
                } else {
                    htmlObject.removeClass(firstClass);
                }

                if (i == items.length - 1) {
                    classes.push(lastClass);
                } else {
                    htmlObject.removeClass(lastClass);
                }

                /*
                 * Default add level class
                 * @DEPRECATED
                 */
                if (!htmlObject.hasClass(levelClass)) {
                    classes.push(levelClass);
                }

                htmlObject.addClass(classes.join(' '));
            });
        }

        /**
         * Get the orientation of the widget
         * @function getOrientation
         * @return {string} horizontal|vertical
         */
        tag.getOrientation = function menubar_get_orientation() {
            return this.getAttribute('data-display').getValue();
        }

        /**
         * Change widget orientation
         * @function changeOrientation
         * @param {string} orientation
         */
        tag.changeOrientation = function menubar_change_orientation(orientation, sizes) {
            var
            size,
            parent,
            borders,
            newSize,
            itemsInfo,
            classToAdd,
            classToRemove;

            sizes = sizes || {};
            size = this.getSize();

            Designer.beginUserAction('MB_CHANGE_ORIENT');

            if (D.env.enableHistory) {
                var action = new Designer.action.ChangeMenubarOrientation({
                    val: orientation,
                    oldVal: orientation == 'horizontal' ? 'vertical' : 'horizontal',
                    tagId: this.id,
                    data: {
                        width: size.width,
                        height: size.height
                    }
                });

                Designer.getHistory().add(action);
            }

            tag.getAttribute('data-display').setValue(orientation);

            classToAdd = 'waf-menuItem-' + orientation;

            itemsInfo = this.itemsInfo({
                resizeHandles: orientation == 'horizontal' ? 'e, w' : 'n, s'
            });
            borders = this.getBorders();
            parent = this.getParent();

            switch (orientation) {
                case 'horizontal':
                    this.minWidth = itemsInfo.size + borders.LR;
                    this.minHeight = null;
                    classToRemove = 'waf-menuItem-vertical';

                    if (WAF.PLATFORM.modulesString === "touch" && parent && parent.getType() == 'tabView') {
                        this.setWidth(parent.getWidth());
                    } else {
                        this.setWidth(sizes.width || this.minWidth);
                    }
                    this.setHeight(sizes.height || itemsInfo.maxHeight + borders.TB);

                    this.getHtmlObject().removeClass('waf-menuBar-vertical')
                    break;

                case 'vertical':
                    this.minHeight = itemsInfo.size + borders.LR;
                    this.minWidth = 2;

                    if (WAF.PLATFORM.modulesString === "touch" && parent && parent.getType() == 'tabView') {
                        this.setHeight(parent.getHeight());
                    } else {
                        this.setHeight(sizes.height || this.minHeight);
                    }

                    newSize = sizes.width || itemsInfo.maxWidth + borders.TB;

                    this.setWidth(newSize);
                    classToRemove = 'waf-menuItem-horizontal';

                    this.getHtmlObject().removeClass('waf-menuBar-horizontal');
                    break;
            }

            /*
             * Remove orientation class on children
             */
            this.getHtmlObject().children('li')
            .removeClass(classToRemove)
            .addClass(classToAdd);

            this.checkMargin(false);
        }

        /**
         * Add a menu item widget
         * @function addMenuItem
         * @param {object}
         * @return {object} menuItem
         */
        tag.addMenuItem = function menubar_add_menu_item(param) {
            var
            width,
            height,
            parent,
            borders,
            menuItem,
            itemsInfo,
            orientation;

            borders = this.getBorders();
            param = param || {};
            orientation = this.getOrientation();

            if (param.optimize !== false) {
                Designer.env.enableModificationNotification = false;
            }

            /*
             * History for menu item add
             */
            if (!param.menuBarInit) {
                Designer.beginUserAction('040');

                var action = new Designer.action.AddMenuItem({
                    val: '0',
                    oldVal: '1',
                    tagId: this.id,
                    data: {
                        selectedTab: param.currentIndex,
                        orientation: orientation,
                        size: orientation == 'horizontal' ? this.getWidth() : this.getHeight()
                    }
                });

                Designer.getHistory().add(action);
            }

            if (param.width) {
                width = param.width;
                width -= borders.LR;
            }

            if (param.height) {
                height = param.height;
                height -= borders.TB;
            }

            parent = tag.getParent();

            switch (orientation) {
                case 'horizontal':
                    height = this.getHeight();

                    // @DIRTY
                    if (WAF.PLATFORM.modulesString === "touch" && parent && parent.getType() == 'tabView' && borders.TB == 0) {
                        borders.TB = 2;
                    }

                    height -= borders.TB;

                    if (param.parentPadding) {
                        this._parentPadding = param.parentPadding * 2;
                        height -= this._parentPadding;
                    }
                    break;

                case 'vertical':
                    width = this.getWidth();

                    // @DIRTY
                    if (WAF.PLATFORM.modulesString === "touch" && parent && parent.getType() == 'tabView' && borders.LR == 0) {
                        borders.LR = 2;
                    }

                    width -= borders.LR;

                    if (param.parentPadding) {
                        this._parentPadding = param.parentPadding * 2;
                        width -= this._parentPadding;
                    }
                    break;
            }


            menuItem = D.createTag({
                type: 'menuItem',
                height: height,
                width: width,
                silentMode: true,
                parent: tag,
                context: D.env.tagAttributes.context["protected"] + " " + D.env.tagAttributes.context["allowDrop"] + " " + D.env.tagAttributes.context["allowRemove"]
            });

            itemsInfo = this.itemsInfo();

            switch (orientation) {
                case 'horizontal':
                    this.minWidth = itemsInfo.size + borders.LR;
                    break;

                case 'vertical':
                    this.minHeight = itemsInfo.size + borders.TB;
                    break;
            }

            param.focusOnMenu = typeof param.focusOnMenu != 'undefined' ? param.focusOnMenu : true;

            if (param.focusOnMenu && this.getParent().getType() != 'tabView') {
                this.setResizable(true);
            }

            this._setClasses();

            $(this).trigger('afterAddItem', [menuItem, true]);

            if (param.optimize !== false) {
                Designer.env.enableModificationNotification = true;
                D.studio.setDirty();
            }

            return menuItem;
        }

        /**
         * Check if the menu items are out of menubar
         * @function checkSize
         * @return {object} menu items info
         */
        tag.checkSize = function menubar_check_size() {
            var
            info,
            borders,
            menuBarSize,
            menuItemsSize;

            info = this.itemsInfo();
            menuItemsSize = info.outerSize;
            borders = this.getBorders();

            switch (info.orientation) {
                case 'horizontal':
                    menuBarSize = this.getRealWidth();

                    // NOTE: when inside a tabview, this can get ignored,
                    // since the menuBar is constrainted to fit inside the tabview
                    if (menuItemsSize >= menuBarSize) {
                        this.setWidth(menuItemsSize);
                    }

                    this.minWidth = menuItemsSize;
                    break;

                case 'vertical':
                    menuBarSize = this.getRealHeight();

                    if (menuItemsSize > menuBarSize) {
                        this.setHeight(menuItemsSize + borders.TB);
                    }

                    this.minHeight = info.size + borders.TB;
                    break;
            }

            return info;
        }

        /**
         * Get children menu items info
         * @function itemsInfo
         * @return {object} info
         */
        tag.itemsInfo = function menubar_get_items_info(param) {
            var
            i,
            size,
            width,
            height,
            margin,
            menuItem,
            maxWidth,
            maxHeight,
            menuItems,
            menuItemsL,
            orientation,
            menuItemsWidth,
            menuItemsHeight;

            param = param || {};
            menuItems = this.getItems(undefined, true);
            menuItemsL = menuItems.length;

            menuItemsHeight = 0;
            menuItemsWidth = 0;
            maxHeight = 0;
            maxWidth = 0;
            orientation = this.getOrientation();
            margin = this.getMargin();

            for (i = 0; i < menuItemsL; i += 1) {
                menuItem = menuItems[i];
                size = menuItem.getSize(true);
                width = size.width;
                height = size.height;
                menuItemsWidth += width;
                menuItemsHeight += height;

                /*
                 * Add margin to size
                 */
                if (i != menuItemsL - 1) {
                    if (orientation == 'horizontal') {
                        menuItemsWidth += margin;
                    } else {
                        menuItemsHeight += margin;
                    }
                }

                if (height > maxHeight) {
                    maxHeight = height;
                }

                if (width > maxWidth) {
                    maxWidth = width;
                }

                if (menuItem._additionalHeight) {
                    maxHeight -= menuItem._additionalHeight;
                }

                if (menuItem._additionalWidth) {
                    maxWidth -= menuItem._additionalWidth;
                }

                if (param.resizeHandles) {
                    menuItem.resizeHandles = param.resizeHandles;
                }
            }

            if (orientation == 'horizontal') {
                size = menuItemsWidth;
                if (this._parentPadding) {
                    maxHeight += this._parentPadding;
                }
            } else {
                size = menuItemsHeight;
                if (this._parentPadding) {
                    maxWidth += this._parentPadding;
                }
            }

            return {
                length: menuItemsL,
                size: size,
                outerSize: size + (this.getWidth() - this.getRealWidth()), // FIXME: Add margins and borders, but don't work if the widget is left / right positionned and reaaly don't work if the menu is vertical !!!
                orientation: orientation,
                maxHeight: maxHeight,
                maxWidth: maxWidth
            }
        }

        /**
         * Get children menu items
         * @function getMenuItems
         * @param {force} boolean get destroyed children as well
         * @return {object} list of menu items
         */
        tag.getItems = function menubar_get_items(force, ignoreVisibility) {
            return this.getChildren(typeof force !== 'undefined' ? force : false, ignoreVisibility);
        }

        /**
         * Get the widget borders info
         * @function getBorders
         * @return {object}
         */
        tag.getBorders = function menubar_get_borders() {
            var
            top,
            left,
            right,
            bottom;

            left = parseInt(this.getComputedStyle('border-width'));
            top = left;
            right = left;
            bottom = left;

            return {
                left: left,
                top: top,
                right: right,
                bottom: bottom,
                LR: left + right,
                TB: top + bottom
            }
        }

        tag.addDefaultTags = function() {

            if (!param.data.noItems && !tag.initDone) {
                tag.initDone = true;
                /*
                 * Auto create 3 menu items
                 */
                for (i = 0; i < 3; i += 1) {
                    tag.addMenuItem({
                        menuBarInit: true,
                        width: param.data.itemsWidth,
                        optimize: false
                    });
                }
            }
        }

        if (!param._isLoaded) {
            jQTag.bind('onReady', {menuItem: tag}, function(e, data) {
                if (data && data.from == 'redo') {
                    return;
                }

                if (param.data.optimize !== false) {
                    Designer.env.enableModificationNotification = false;
                }

                /*
                 * Indicate that the menubar is a submenu
                 */
                if (this.getParent().getType() === 'menuItem') {
                    this._isSubMenu = true;
                }

                /*
                 * Check menubar items margin and resize if necessary
                 */
                this.checkMargin(true);

                if (!param.data.noItems && !tag.initDone && !tag.initLater) {
                    tag.addDefaultTags();
                }
                //tag.initDone = true;
                // if (!Designer.env.design.status) {

                //     for (i = 0; i < 3; i += 1) {
                //         tag.addMenuItem({
                //             menuBarInit: true,
                //             width: param.data.itemsWidth,
                //             optimize: false
                //         });
                //     }
                // }

                if (param.data.optimize !== false) {
                    Designer.env.enableModificationNotification = true;
                    D.studio.setDirty();
                }

                /*
                 * Auto resize menubar on mobile (same size of menu items total size)
                 */
                if (WAF.PLATFORM.modulesString == "touch" && this.getOrientation() == "horizontal") {
                    var
                    info,
                    borders;

                    info = this.itemsInfo();
                    borders = this.getBorders();

                    this.setWidth(info.outerSize, false);
                }

            });
        } else {
            jQTag.bind('onReady', {menuItem: tag}, function(e, data) {
                var
                info,
                item,
                items,
                itemsL,
                borders,
                htmlObject;

                info = this.itemsInfo();
                borders = this.getBorders();
                items = this.getItems(data && data.from === 'redo' ? true : false, true);
                itemsL = items.length;
                htmlObject = this.getHtmlObject();
                levelClass = 'waf-menuBar-level' + this.getLevel();

                if (info.orientation == 'horizontal') {
                    this.minWidth = info.size + borders.LR;
                } else {
                    this.minHeight = info.size + borders.TB;
                }

                this._setClasses();

                /*
                 * Indicate that the menubar is a submenu
                 */
                if (this.getParent().getType() === 'menuItem') {
                    this._isSubMenu = true;
                }

                /*
                 * Default add level class
                 * @DEPRECATED
                 */
                if (!htmlObject.hasClass(levelClass)) {
                    htmlObject.addClass(levelClass);
                }

                /*
                 * Check menubar items margin
                 */
                this.checkMargin(true);
            });
        }

        /*
         * Resize menu items on menubar resize
         */
        jQTag.bind('onResize', {menuItem: tag}, function(e, sizeParams) {
            var
            i,
            item,
            items,
            width,
            height,
            itemsL,
            subMenu,
            borders,
            newWidth,
            newHeight,
            orientation;

            items = this.getItems(undefined, true);
            borders = this.getBorders();
            itemsL = items.length;
            orientation = this.getOrientation();
            newHeight = sizeParams.size.height;
            newWidth = sizeParams.size.width;

            D.env._prevenItemstResize = true;

            for (i = 0; i < itemsL; i += 1) {
                item = items[i];
                subMenu = item.getSubMenu();

                switch (orientation) {
                    case 'horizontal':
                        if (newHeight) {
                            height = newHeight;
                            if (this._parentPadding) {
                                height -= this._parentPadding;
                            }
                            item.setHeight(height - borders.TB);
                        }

                        /*
                         * Reset position of sub menu
                         */
                        if (subMenu) {
                            subMenu.setXY(0, newHeight, true);
                        }

                        break;

                    case 'vertical':
                        if (newWidth) {
                            width = newWidth;
                            if (this._parentPadding) {
                                width -= this._parentPadding;
                            }
                            item.setWidth(width - borders.LR);
                        }

                        /*
                         * Reset position of sub menu
                         */
                        if (subMenu) {
                            subMenu.setXY(newWidth, 0, true);
                        }
                        break;
                }
            }

            /*
             * Auto resize menubar on mobile (same size of menu items total size)
             */
            if (WAF.PLATFORM.modulesString == "touch" && orientation == "horizontal") {
                var
                info;

                info = this.itemsInfo();
                this.setWidth(info.size + borders.LR, false);
            }

            D.env._prevenItemstResize = false;
        });
    }
});
