WAF.define('waf-behavior/layout/multicontainer', function() {
    "use strict";
    var Class = WAF.require('waf-core/class'),
        Behavior = WAF.require('waf-core/behavior'),
        Event = WAF.require('waf-core/event'),
        WakError = WAF.require('waf-core/error'),
        Widget = WAF.require('waf-core/widget');

    /**
     * @class Layout.MultiContainer
     * @augments Layout.Container
     */
    var klass = Behavior.create('Layout.MultiContainer');
    var proto = klass.prototype;
    klass.inherit(WAF.require('waf-behavior/layout/container'));
    klass.restrictWidget(WAF.require('waf-behavior/layout/container'));
    
    // Instance methods
    /**
     * Return or change the current page index
     * @param {integer} [index] - If given change the current page
     * @return {integer} The current page index
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.currentPageIndex = function(index) {
        if(typeof index == 'number') {
            if(index < 0 || index >= this._children.length)
                throw new WakError.Container("Page not found");
            this.invoke('removeClass', 'waf-state-active');
            this._current_page = index;
            this._children[this._current_page].addClass('waf-state-active');
            this.fire(new Event.Select({ index: index, widget: this._children[this._current_page] }));
        }
        return this._current_page;
    };
    
    /**
     * Return the current page 
     * @return {Container} The current page
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.currentPage = function() {
        if(typeof this._current_page == 'undefined')
            throw new WakError.Container("Page not found");
        return this.page(this._current_page);
    };
    
    /**
     * Set the current page as the last inserted or appended page
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.lastPageAsCurrentPage = function() {
        this.currentPageIndex(this._last_widget_index);
    };
    
    /**
     * Add a new page
     * @param {object|Container} options - Options to create the container or a container
     * @param {Container} [options.container] - The container to insert
     * @param {Container} [options.container_class] - The container class to use to create the page
     * @returns {integer} page index
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.addPage = function(options) {
        return this.insertPage(this.countPages(), options);
    };
    
    /**
     * Remove page at index 
     * @param {integer} index
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.removePage = function(index) {
        this.detachWidget(index);
        if(index == this._current_page)
            this.currentPage(index >= this._children.length ? index -1 : index);
        else if(this._current_page > index)
            this._current_page--;
        if(this._current_page < 0)
            this._current_page = undefined;
    };
    
    /**
     * Insert page at index
     * @param {integer} index
     * @param {object|Container} [options] - Options to create the container or a container
     * @param {Container} [options.container] - The container to insert
     * @param {Container} [options.container_class] - The container class to use to create the page
     * @returns {integer} the page index
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.insertPage = function(index, options) {
        var p;
        options = options || {};
        if(Class.instanceOf(options, this._restrict))
            p = options;
        else
            p = options.container || new (options.container_class || this._default_container_class)(options);
        index = this.insertWidget(index, p);
        if(index <= this._current_page)
            this._current_page++;
        if(typeof options.content == 'array') {
            options.content.forEach(function(e) {
                p.attachWidget(e);
            });
        }
        return index;
    };
    
    /**
     * Get or set the page at index
     * @param {integer} index
     * @param {Container} [page] - If given, replace the page at index
     * @returns {Container} 
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.page           = proto.widget;
    /**
     * Return an array of all the pages
     * @returns {Container[]}
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.pages          = proto.widgets;
    /**
     * return the numbers of pages
     * @returns {integer}
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.countPages     = proto.countWidgets;
    /**
     * Remove all the pages
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.removeAllPages = proto.detachAllWidgets;
    /**
     * Remove and destroy all the pages
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.destroyAllPages = proto.detachAndDestroyAllWidgets;
    /**
     * Return the last inserted or appended pages (not the page at the end of the conatiner)
     * @returns {Container} 
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.lastPage       = proto.lastWidget;
    
    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.initProperties = function() {
        this._default_container_class = this.constructor._default_container_class || Widget.Container;
    };
    
    /**
     * Return or set the default container class to create new pages
     * By default its a Widget.Container
     * @param {ContainerClass} [container_class] - If given set the container class
     * @memberof Layout.MultiContainer
     * @instance
     */
    proto.defaultContainerClass = function(container_class) {
        if(arguments.length)
            this._default_container_class = container_class || this.constructor._default_container_class || Widget.Container;
        return this._default_container_class;
    };
    
    // Too many methods (30+) to document...
    klass.addIndexedMethods(WAF.require('waf-behavior/layout/container'), 'page');
    klass.addIndexedMethods(WAF.require('waf-behavior/layout/container'), 'currentPage', '', function() { return this._current_page; });
    klass.addIndexedMethods(WAF.require('waf-behavior/layout/container'), 'lastPage',  '', function() { return this._last_widget_index; });
    
    // Class methods
    /**
     * Return or set the default container class to create new pages
     * By default its a Widget.Container
     * @param {ContainerClass} [container_class] - If given set the container class
     * @memberof Layout.MultiContainer
     */
    klass.defaultContainer = function(widget) {
        if(arguments.length)
            this._default_container_class = widget || Widget.Container;
        return this._default_container_class;
    };


    return klass;
});
