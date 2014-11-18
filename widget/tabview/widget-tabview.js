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
     * @extends WAF.Widget
     */
    'TabView',
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
     * @default TODO: set to the name to this class (ex: WAF.widget.DataGrid)
     **/
    function WAFWidget(config, data, shared) {
        this.padding = data.padding ? parseInt(data.padding) : 5;

        /*
         * Add orientation class
         */
        this.$domNode.addClass('waf-tabView-menu-position-' + data['menu-position'].replace(/\s+/g, '-'));

        this._position = data['menu-position'];

        switch(this._position) {
            case 'top left':
            case 'top right':
            case 'bottom left':
            case 'bottom right':
                this._display = 'horizontal';
                break;

            case 'left top':
            case 'right top':
            case 'left bottom':
            case 'right bottom':
                this._display = 'vertical';
                break;
        }




        this._closableTabs = !data['closable-tabs'] || data['closable-tabs'] == 'false' ? false : true;
    },{

        _menuBar            : null,

        _closableTabs       : false,

        _containers         : [],

        _componentsLoaded   : {},

        _menuItemLastWidth  : 0,

        _menuItemLastHeight : 0,

        _closeButtonMarge   : 10,

        _selected           : null,

        _position           : null,

        _tabWidth           : null,

        _tabSelectedWidth   : null,

        _tabHeight          : null,

        _tabSelectedHeight  : null,

        /**
         * Executed when the widget is ready
         * @method ready
         */
        ready : function tabview_ready () {
            var
            tabView,
            menuBar,
            menuItems,
            containers,
            closeButton;

            tabView     = this;
            menuBar     = this._getMenuBar();

            if (menuBar) {
                containers  = this._getContainers();
                menuItems   = menuBar.getMenuItems();

                /*
                 * Default select the first tab
                 */
                tabView.selectTab(1);

                /*
                 * Add onclick function on menu items
                 */
                $.each(menuItems, function(i){
                    /*
                     * Select the correct tab on menu item click
                     */
                    this.onClick = function () {
                        tabView.selectTab(this.$domNode.parent().find('li').index(this.$domNode) + 1);
                    }

                    this.$domNode.addClass('waf-tabView-tab');

					if (this.getWidth(true) > tabView._menuItemLastWidth) {
						tabView._menuItemLastWidth = this.getWidth(true);
					}

                    tabView._menuItemLastHeight = this.getHeight();

                    /*
                     * Add close button
                     */
                    if (tabView._closableTabs) {
                        tabView._addCloseButton(this);
                    }

                });

                /*
                 * Add resizable cosntraints
                 */
                this.$domNode.resizable( "option", "minWidth", menuBar.$domNode.width() + (this.padding * 2) + 2);
                this.$domNode.resizable( "option", "minHeight", menuBar.$domNode.height());

                /*
                 * Add resizable cosntraints
                 */
                if (WAF.PLATFORM.modulesString === "mobile") {
                    if (this._display === 'horizontal') {
                        this.$domNode.find(".waf-tabView-menuBar").css("width", "100% !important");
                    } else {
                        //wait for onResize event to work !!
                        //this.$domNode.find(".waf-tabView-menuBar").css("height", this.$domNode.height()+"px !important");
                    }

                } else {
                     if (this._display == 'horizontal') {
                        menuBar.$domNode.css('width', '100%');
                    }

                }
            }

        },

        /**
         * Add a close button on the menu item
         * @method _addCloseButton
         * @param {object} menuItem
         */
        _addCloseButton : function tabview_addCloseButton (menuItem) {
            var
            marge,
            closeButton;

            marge = this._closeButtonMarge;

            /*
             * Append close button
             */
            closeButton = $('<button>');
            closeButton
                .addClass('waf-tabView-closeButton')
                .css('top', (menuItem.getHeight()/2) - 4 +'px')
                .bind('click', {menuItem : menuItem, tabView : this}, function(e){
                    e.data.tabView.removeTab(e.data.menuItem.getIndex() + 1);
                });

            menuItem.$domNode
                .append(closeButton);

            /*
             * Resize menu items width
             */
            menuItem.setWidth(menuItem.getWidth() + marge);
        },

        /**
         * Select a tabview tab
         * @method selectTab
         * @param {number} index : index of the tab to select
         */
        selectTab : function tabview_select_tab (index) {
            var
            i,
            tabView,
            menuItem,
            menuItems,
            container,
            menuItemsL,
            containerChildren,
            selectedMenuItem;

            tabView = this;

            /*
             * Hide existing date picker
             */
            $('.hasDatepicker').datepicker('hide');

            $.each(this._getContainers(), function(i){
                if (i != (index - 1)) {
                    this.hide('visibility');
                    $("#"+this.id).addClass('displayNone');
                    $("#"+this.id).css("zIndex", -1);
                } else {
                    this.show();
                    $("#"+this.id).removeClass('displayNone');
                    $("#"+this.id).css("zIndex", 1);
                }
            });

            /*
             * Add active state on menu item
             */
            menuItems   = this._getMenuBar().getMenuItems();
            menuItemsL  = menuItems.length;

            /*
             * Remove state on other
             */
            if (WAF.PLATFORM.modulesString === "mobile") {
                for (i = 0; i < menuItemsL; i += 1) {
                    menuItem = menuItems[i];
                    if (i == (index-1)) {
                        menuItem.$domNode
                            .addClass('waf-state-selected')
                        selectedMenuItem = menuItem;
                    } else {
                        menuItem.$domNode
                            .removeClass('waf-state-selected')
                    }
                }
            } else {
                var
                menuItemWidth,
                menuItemHeight;

                for (i = 0; i < menuItemsL; i += 1) {
                    menuItem        = menuItems[i];
                    menuItemWidth   = menuItem.$domNode.outerWidth();
                    menuItemHeight  = menuItem.$domNode.outerHeight();

                    if (!tabView._tabSelectedHeight)    tabView._tabSelectedHeight  = menuItemHeight + 1;
                    if (!tabView._tabHeight)            tabView._tabHeight          = menuItemHeight;
                    if (!tabView._tabSelectedWidth)     tabView._tabSelectedWidth   = menuItemWidth + 1;
                    if (!tabView._tabWidth)             tabView._tabWidth           = menuItemWidth;

                    if (i == (index-1)) {
                        menuItem.$domNode
                            .addClass('waf-state-selected')

                            if (tabView._display == 'horizontal') {
                                menuItem.$domNode.css('height', tabView._tabSelectedHeight + 'px');
                            } else {
                                menuItem.$domNode.css('width', tabView._tabSelectedWidth + 'px');
                            }

                            if (tabView._position == 'bottom right' || tabView._position == 'bottom left') {
                                menuItem.$domNode.css('top', '-1px');
                            }

                            if (tabView._position == 'right top' || tabView._position == 'right bottom') {
                                menuItem.$domNode.css('left', '-1px');
                            }

                        selectedMenuItem = menuItem;
                    } else {
                        menuItem.$domNode
                            .removeClass('waf-state-selected')

                            if (tabView._display == 'horizontal') {
                                menuItem.$domNode.css('height', tabView._tabHeight + 'px');
                            } else {
                                menuItem.$domNode.css('width', tabView._tabWidth + 'px');
                            }

                            if (tabView._position == 'bottom right' || tabView._position == 'bottom left') {
                                menuItem.$domNode.css('top', '0px');
                            }

                            if (tabView._position == 'right top' || tabView._position == 'right bottom') {
                                menuItem.$domNode.css('left', '0px');
                            }
                    }
                }
            }


            /*
             * If children is a component => load it
             */
            container           = this.getContainer(index);
            containerChildren   = container.getChildren();

            $.each(containerChildren, function() {
                if (this.kind == 'component' && !tabView._componentsLoaded[this.id]) {
                    tabView._componentsLoaded[this.id] = true;
                    this.loadComponent();
                }
            });

            this._selected = index;

            if (this.onSelect) {
                this.onSelect(index, selectedMenuItem, container);
            }
        },

        /**
         * Get the menuBar linked widget of the tabview
         * @method _getMenuBar
         */
        _getMenuBar : function tabview_get_menu_bar () {
            var
            menuBar;

            if (!this._menuBar) {
                $.each(this.getLinks(), function(){
                    if (this.kind == 'menuBar') {
                        menuBar = this;
                    }
                });

                this._menuBar = menuBar;
            } else {
                menuBar = this._menuBar;
            }

            return menuBar;
        },

        /**
         * Get the containers linked widgets of the tabview
         * @method _getContainers
         */
        _getContainers : function tabview_get_containers () {
            var
            i,
            j,
            k,
            that,
            link,
            item,
            links,
            itemsL,
            linksL,
            result,
            itemLinks,
            itemLinksL;

            that    = this;
            result  = [];

            if (this._containers.length == 0) {
                links   = this.getLinks();
                linksL  = links.length;


                for (i = 0; i < linksL; i += 1) {
                    link = links[i];

                    if (link && link.kind == 'menuBar') {
                        items   = link.getMenuItems();
                        itemsL  = items.length;

                        for (j = 0; j < itemsL; j += 1) {
                            item        = items[j];
                            itemLinks   = item.getLinks();
                            itemLinksL  = itemLinks.length;

                            for (k = 0; k < itemLinksL; k += 1) {
                                if (itemLinks[k].kind == 'container') {
                                    result.push(itemLinks[k]);
                                    break;
                                }
                            }
                        }
                        break;
                    }
                };

                this._containers = result;
            } else {
                result = this._containers;
            }

            return result;
        },

        /**
         * Get a specific container of the tabview
         * @method getContainer
         * @param {number} index : index of the tab to select
         * @return {object} container
         */
        getContainer : function tabview_get_container (index) {
            var
            result;
            if (this._containers) {
                result = this._containers[index - 1];
            }

            return result;
        },

        /**
         * Resize method called during resize
         * @method onResize
         */
        onResize : function tabview_resize() {
            $.each(this.getLinks(), function(){
                if (this.onResize) {

                    this.onResize();
                }
            });
        },

        /**
         * Add a tab
         * @method addTab
         * @param {string} label : label of the new tab
         */
        addTab : function tabview_add_tab(label, closable) {
            var tabs,
				tabLi,
				tabId,
				calcul,
				tabCss,
				newSize,
				tabView,
				menuBar,
				tabWidth,
				menuItem,
				tabHeight,
				tabWidget,
				containers,
				totalWidth,
				totalHeight,
				containerId,
				menuBarWidth,
				containerDiv,
				menuBarHeight,
				menuBarMargin,
				containerInfo,
				containerWidget;

            tabView         = this;

            menuBar         = this._getMenuBar();

            containerId     = WAF.Widget._generateId('container');
            tabId           = WAF.Widget._generateId('menuItem');
            menuBarMargin   = parseInt(menuBar.config['data-tab-margin']);

            containers      = this.$domNode.children('.waf-container');
            tabs            = menuBar.$domNode.children('.waf-menuItem');
            index           = containers.length + 1;

            tabWidth        = tabs.outerWidth();
            tabHeight       = menuBar.$domNode.height();

            tabCss          = {};

            totalWidth      = 0;
            totalHeight     = 0;

            $.each(tabs, function(i){
                var
                that;

                that = $(this);

                totalWidth   += that.outerWidth();
                totalHeight  += that.outerHeight();

                if (i != tabs.length - 1) {
                   totalWidth  += menuBarMargin;
                   totalHeight += menuBarMargin;
                }
            });

            /*
             * Get containers size and position
             */
            containerInfo   = {
                left    : containers.css('left'),
                top     : containers.css('top'),
                bottom  : containers.css('bottom'),
                right   : containers.css('right')
            }

            /*
             * Create tab
             */
            tabLi = $('<li id="' + tabId + '" data-type="menuItem" data-lib="WAF"/>');

			// last child isn't the last one anymore since we add a new one: remove the class to stay coherent
			// and to prevent the use of hacks in width calculation
			//
			menuBar.$domNode.find('.waf-menuItem:last-child').removeClass('waf-menuItem-last');

            if (tabView._display == 'horizontal') {
                tabCss['margin-left']   = 0;	//parseInt($(tabs[tabs.length-1]).css('margin-right')) == 0 ? menuBarMargin + 'px' : '0px';
                tabHeight               = menuBar.$domNode.height();
                tabWidth                = this._menuItemLastWidth;

                /*
                 * resize menuBar
                 */
                if (closable) {
                    tabWidth += tabView._closeButtonMarge;
                }

                menuBarWidth    = menuBar.getWidth();
                calcul          = (totalWidth + tabWidth + menuBarMargin);

                if (calcul >= menuBarWidth) {
                    menuBar.setWidth(calcul);
                }

            } else {
                tabCss['margin-top']    = parseInt($(tabs[tabs.length-1]).css('margin-bottom')) == 0 ? menuBarMargin + 'px' : '0px';
                tabWidth                = menuBar.$domNode.width();
                tabHeight               = tabs._menuItemLastHeight;

                /*
                 * resize menuBar
                 */
                menuBarHeight  = menuBar.getHeight() + tabHeight + menuBarMargin;
                menuBar.setHeight(menuBarHeight);
            }

            tabCss.width    = tabView._menuItemLastWidth + 'px';
            tabCss.height   = tabView._menuItemLastHeight + 'px';

            tabLi.css(tabCss);

            tabLi.prop('class', tabs.prop('class').replace(/waf-state-active|waf-menuItem-first/g, 'waf-menuItem-last'));

			// TODO: menuItems added by the designer have a <div class="waf-richText..."> instead of this <p/>
			//		 there should be only one menuItem type...
            tabLi.html('<p class="waf-menuItem-text waf-menuItem-icon-top" style="height:20px;width:90px">' + label + '</p>')

            tabLi.appendTo(menuBar.$domNode);

			menuItem = new WAF.widget.MenuItem({id: tabId});

            /*
             * Add close button
             */
            if (closable) {
                tabView._addCloseButton(menuItem);
            }

            tabWidget = $$(tabId);

            /*
             * Add tabview select function on click event
             */
            tabWidget.onClick = function () {
                tabView.selectTab(this.$domNode.parent().find('li').index(this.$domNode) + 1);
            }

            /*
             * Create Container
             */
            containerDiv = $('<div id="' + containerId + '" data-type="container" data-lib="WAF" data-constraint-top="true" data-constraint-right="true" data-constraint-left="true" data-constraint-bottom="true" >');

            containerDiv.css({
                bottom      : containerInfo.bottom,
                right       : containerInfo.right,
                left        : containerInfo.left,
                top         : containerInfo.top,
                position    : 'absolute'
            });

            containerDiv.prop('class', containers.prop('class'));

            containerDiv.appendTo(this.$domNode);
            new WAF.widget.Container({id: containerId});
            containerWidget = $$(containerId);

            containerWidget.hide('visibility');

            this._containers.push(containerWidget);

            /*
             * Link widget each other
             */
            this.link(containerWidget);
            tabWidget.link(containerWidget);
            containerWidget.link(tabWidget);

            /*
             * Resize tabview
             */
            if (tabView._display == 'horizontal') {
                newSize = menuBar.getWidth() + menuBarMargin + this.padding;

                if (newSize > tabView.getWidth()) {
                    tabView.setWidth(newSize);
                }
            } else {
                newSize = menuBar.getHeight() + menuBarMargin + this.padding;
                if (newSize > tabView.getHeight()) {
                    tabView.setHeight(newSize);
                }
            }

            /*
             * Update resizable limit
             */
            this.$domNode.resizable( "option", "minWidth", menuBar.$domNode.width() + (this.padding * 2) + 2);
            this.$domNode.resizable( "option", "minHeight", menuBar.$domNode.height());

            /*
             * Select the new tab
             */
            this.selectTab(this.countTabs());

            this.$domNode.find("button.waf-tabView-closeButton").show();

        },

        /**
         * Remove a tab
         * @method removeTab
         * @param {number} index : index of the tab to remove
         */
        removeTab : function tabview_remove_tab(index) {
            var
            i,
            tab,
            tabs,
            links,
            menuBar,
            newLink,
            tabLinks,
            newLinks,
            toSelect,
            newLinksL,
            container,
            menuItem1,
            menuItem2,
            iToSelect,
            containers;

            index      -= 1;
            menuBar     = this._getMenuBar();
            tabs        = this._getMenuBar().getChildren();
            tab         = tabs[index];
            tabLinks    = tab.getLinks();
            for (i = 0; i < tabLinks.length; i += 1) {
                if (tabLinks[i].kind == "container") {
                    container = tabLinks[i];
                }
            }

            iToSelect   = this.getSelectedTab().index;

            if (iToSelect == tabs.length) {
                toSelect = iToSelect - 1;
            } else {
                toSelect = iToSelect;
            }

            /*
             * Prevent last menu item delete
             */
            if (tabs.length == 1) {
                return false;
            }

            /*
             * Call custom before remove function
             */
            if(this.beforeRemove) {
                this.beforeRemove((index + 1), tab, container);
            }

            /*
             * Destroy tab
             */
            tab.destroy();

            /*
             * Destroy container
             */
            if (container) {
                container.destroy();
            }

            /*
             * Remove reference from attribute
             */
            links       = [];
            containers  = [];
            newLinks    = this.getLinks();
            newLinksL   = newLinks.length;

            for (i = 0; i < newLinksL; i += 1) {
                newLink =  newLinks[i];

                links.push(newLink.id);

                if (this.kind == 'container') {
                    containers.push(containers);
                }
            }

            this._containers = containers;

            this.$domNode.data('linked-tag', links.join(','));

            this.selectTab(toSelect);

            menuItem1 = menuBar.getMenuItem(index-1);
            menuItem2 = menuBar.getMenuItem(index);

            if (menuItem1 && menuItem2) {
                if (parseInt(menuItem1.$domNode.css('margin-right'), 10) !== 0 && parseInt(menuItem2.$domNode.css('margin-left'), 10) !== 0) {
                    menuItem2.$domNode.css('margin-left', 0);
                }
            } else if (!menuItem1 && menuItem2) {
                menuItem2.$domNode.css('margin-left', 0);
            }

            if (this.countTabs() === 1) {
                this.getSelectedTab().menuItem.$domNode.find("button.waf-tabView-closeButton").hide();
            }
        },

        /**
         * Get the number of tabs
         * @metod counTabs
         * @return {number} number of tabs
         */
        countTabs : function tabview_count_tabs(){
            return this._getContainers().length;
        },

        /**
         * Get the selected tab and container
         * @method getSelected
         * @return {object} : index, tab, container
         */
        getSelectedTab : function tabview_get_selected(){
            return {
                index       : this._selected,
                menuItem    : this._getMenuBar().getMenuItems()[this._selected-1],
                container   : this.getContainer(this._selected)
            }
        },

        /**
         * Get the selected container
         * @method getSelectedContainer
         * @return {object} container
         */
        getTabContainer : function tabview_get_selected_container(){
            return this.getSelectedTab().container;
        },

        _tmpVisible : [],

        /**
         * Custom hide function
         * @method hide
         * @param {string} type
         */
        hide : function tabview_hide ( type ) {
            var
            i,
            link,
            links,
            linksLength;

            this._tmpVisible = [];

            if (type && type == 'visibility') {
                links = this.getLinks();
                linksLength = links.length;
                for (i = 0; i < linksLength; i += 1) {
                    link = links[i];

                    if (link.$domNode.css('visibility') == 'visible') {
                        link.hide('visibility');
                        this._tmpVisible.push(link);
                    }
                }
            }

            /*
             * Call super class disable function
             */
            WAF.Widget.prototype.hide.call(this);
        },

        /**
         * Custom show function
         * @method hide
         */
        show : function tabview_show () {
            var
            i,
            link,
            linksLength;

            linksLength = this._tmpVisible.length;

            for (i = 0; i < linksLength; i += 1) {
                link = this._tmpVisible[i];
                link.show();
            }

            /*
             * Call super class disable function
             */
            WAF.Widget.prototype.show.call(this);
        },

        /**
         * Custom disable function (disable sub widgets)
         * @method disable
         * @param {number} index : tab to disable (optional)
         */
        disable : function tabview_disable(index) {
            var
            i,
            children,
            menuItem,
            container,
            childrenLength;

            /*
             * If index, disable selected tab
             */
            if (index) {
                container = this.getContainer(index);

                if (container) {
                    menuItem = container.getLinks()[0];

                    container.disable();
                    menuItem.disable();
                }
            } else {
                children = this.getChildren();
                childrenLength = children.length;

                /*
                 * Disable all sub widgets
                 */
                for (i = 0; i < childrenLength; i += 1) {
                    children[i].disable();
                }

                /*
                 * Call super class disable function
                 */
                WAF.Widget.prototype.disable.call(this);
            }
        },


        /**
         * Custom enable function (enable sub widgets)
         * @method enable
         * @param {number} index : tab to enable (optional)
         */
        enable : function tabview_enable(index) {
            var
            i,
            children,
            menuItem,
            container,
            childrenLength;

            /*
             * If index, disable selected tab
             */
            if (index) {
                container = this.getContainer(index);

                if (container) {
                    menuItem = container.getLinks()[0];

                    container.enable();
                    menuItem.enable();
                }
            } else {
                children = this.getChildren();
                childrenLength = children.length;

                /*
                 * Enable all sub widgets
                 */
                for (i = 0; i < childrenLength; i += 1) {
                    children[i].enable();
                }

                /*
                 * Call super class enable function
                 */
                WAF.Widget.prototype.enable.call(this);
            }
        }
    }
);
