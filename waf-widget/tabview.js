WAF.define('waf-widget/tabview', function() {
    "use strict";
    var Widget = WAF.require('waf-core/widget'),
    Event = WAF.require('waf-core/event');

    WAF.require('waf-widget/menu');

    Widget.create('TabView');
    Widget.TabView.inherit(WAF.require('waf-behavior/layout/multicontainer'));
    Widget.TabView.inherit(WAF.require('waf-behavior/layout/composed'));
    Widget.TabView.addClassOption('menu_position', {
        'top-left': 'waf-tabview-menu-position-top-left',
        'top-right': 'waf-tabview-menu-position-top-right',
        'left-top': 'waf-tabview-menu-position-left-top',
        'left-bottom': 'waf-tabview-menu-position-left-bottom',
        'bottom-left': 'waf-tabview-menu-position-bottom-left',
        'bottom-right': 'waf-tabview-menu-position-bottom-right',
        'right-top': 'waf-tabview-menu-position-right-top',
        'right-bottom': 'waf-tabview-menu-position-right-bottom',
    }, 'top-left');

    Widget.createSubWidget('TabViewMenuBar')
    Widget.TabViewMenuBar.inherit(Widget.ToggleMenuBar);
    Widget.TabViewMenuBar.removeClass('waf-togglemenubar');
    Widget.TabViewMenuBar.prototype.init = function() {
        $(this.node).find('>div>ul').addClass('waf-skin-tabs');
        this.$super('init')();
    };
    Widget.TabView.setPart('menubar', Widget.TabViewMenuBar, function() {
        // set the default menu options
        var r = {};
        if (this.options['tab-minsize'])
            r['menu-minsize'] = this.options['tab-minsize'];
        return r;
    });

    Widget.TabView.prototype.init = function() {
        var menubar = this.getPart('menubar');
        this._menubar_select_subscriber = menubar.subscribe(Event.Select, function(event) {
            this.currentPageIndex(event.data.index);
        }, this);

        menubar.subscribe(Event.Close, function(event) {
            this.removePage(event.data.index);
        }, this);
        
        if (this.countPages() > 0 && this.currentPageIndex() === undefined) {
            this.currentPageIndex(0);
        }
    };

    Widget.TabView.prototype.insertPage = function(index, options) {
        var menubar = this.getPart('menubar');
        if (options.menu_button) {
            if (!menubar.contains(options.menu_button))
                menubar.insertItem(index, options.menu_button);
        } else {
            menubar.insertItem(index, options.title);
            options.menu_button = menubar.lastWidget();
            if('close_button' in options)
                options.menu_button.changeOption('close_button', options.close_button);
        }
        var p = this.$super('insertPage')(index, options);
        if (this.countPages() == 1) {
            this.currentPageIndex(0);
        }
        return p;
    };
    Widget.TabView.prototype.removePage = function(index) {
        this.getPart('menubar').removeItem(index);
        return this.$super('removePage')(index);
    };

    Widget.TabView.prototype.currentPageIndex = function(index) {
        if (typeof index == 'number') {
            if(this._menubar_select_subscriber)
                this._menubar_select_subscriber.pause();
            this.getPart('menubar').select(index);
            if(this._menubar_select_subscriber)
                this._menubar_select_subscriber.resume();
        }
        return this.$super('currentPageIndex').apply(this, arguments);
    };

    Widget.TabView.options_parsers.close_button = function() {
        this.getPart('menubar').changeOption('close_button', this.options.close_button);
    };

    Widget.createSubWidget('TabViewContainer')
    Widget.TabViewContainer.inherit(WAF.require('waf-behavior/layout/container'));
    //Widget.TabViewContainer.tagname = 'section';
    Widget.TabViewContainer.addClass('waf-skin-box');
    Widget.TabView.defaultContainer(Widget.TabViewContainer);


});
