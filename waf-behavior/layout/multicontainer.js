WAF.define('waf-behavior/layout/multicontainer', function() {
    "use strict";
    var Class = WAF.require('waf-core/class'),
        Behavior = WAF.require('waf-core/behavior'),
        WakError = WAF.require('waf-core/error'),
        Widget = WAF.require('waf-core/widget');

    /**
     * @class Layout.MultiContainer
     * @augments Layout.Container
     */
    var klass = Behavior.create();
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
     * @method currentPageIndex
     */
    proto.currentPageIndex = function(index) {
        if(typeof index === 'number') {
            if(index < 0 || index >= this._children.length) {
                throw new WakError.Container("Page not found");
            }
            this.invoke('removeClass', 'waf-state-active');
            this._currentPage = index;
            this._children[this._currentPage].addClass('waf-state-active');
            this.fire('select', { index: index, widget: this._children[this._currentPage] });
        }
        return this._currentPage;
    };
    
    /**
     * Return the current page 
     * @return {Container} The current page
     * @memberof Layout.MultiContainer
     * @instance
     * @method currentPage
     */
    proto.currentPage = function() {
        if(typeof this._currentPage === 'undefined') {
            throw new WakError.Container("Page not found");
        }
        return this.page(this._currentPage);
    };
    
    /**
     * Set the current page as the last inserted or appended page
     * @memberof Layout.MultiContainer
     * @instance
     * @method lastPageAsCurrentPage
     */
    proto.lastPageAsCurrentPage = function() {
        this.currentPageIndex(this._lastWidgetIndex);
    };
    
    /**
     * Add a new page
     * @param {object|Container} options - Options to create the container or a container
     * @param {Container} [options.container] - The container to insert
     * @param {Container} [options.containerClass] - The container class to use to create the page
     * @returns {integer} page index
     * @memberof Layout.MultiContainer
     * @instance
     * @method addPage
     */
    proto.addPage = function(options) {
        return this.insertPage(this.countPages(), options);
    };
    
    /**
     * Remove page at index 
     * @param {integer} index
     * @memberof Layout.MultiContainer
     * @instance
     * @method removePage
     */
    proto.removePage = function(index) {
        this.detachWidget(index);
        if(index === this._currentPage) {
            this.currentPage(index >= this._children.length ? index -1 : index);
        } else if(this._currentPage > index) {
            this._currentPage--;
        }
        if(this._currentPage < 0) {
            this._currentPage = undefined;
        }
    };
    
    /**
     * Insert page at index
     * @param {integer} index
     * @param {object|Container} [options] - Options to create the container or a container
     * @param {Container} [options.container] - The container to insert
     * @param {Container} [options.containerClass] - The container class to use to create the page
     * @returns {integer} the page index
     * @memberof Layout.MultiContainer
     * @instance
     * @method insertPage
     */
    proto.insertPage = function(index, options) {
        var p;
        options = options || {};
        if(Class.instanceOf(options, this._restrict)) {
            p = options;
        } else {
            p = options.container || new (options.containerClass || this._defaultContainerClass)(options);
        }
        index = this.insertWidget(index, p);
        if(index <= this._currentPage) {
            this._currentPage++;
        }
        if(Array.isArray(options.content)) {
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
     * @method _initProperties
     */
    proto._initProperties = function() {
        this._defaultContainerClass = this.constructor._defaultContainerClass || Widget.Container;
    };
    
    /**
     * Return or set the default container class to create new pages
     * By default its a Widget.Container
     * @param {ContainerClass} [containerClass] - If given set the container class
     * @memberof Layout.MultiContainer
     * @instance
     * @method defaultContainerClass
     */
    proto.defaultContainerClass = function(containerClass) {
        if(arguments.length) {
            this._defaultContainerClass = containerClass || this.constructor._defaultContainerClass || Widget.Container;
        }
        return this._defaultContainerClass;
    };
    
    // Too many methods (30+) to document...
    klass.addIndexedMethods(WAF.require('waf-behavior/layout/container'), 'page');
    klass.addIndexedMethods(WAF.require('waf-behavior/layout/container'), 'currentPage', '', function() { return this._currentPage; });
    klass.addIndexedMethods(WAF.require('waf-behavior/layout/container'), 'lastPage',  '', function() { return this._lastWidgetIndex; });
    
    // Class methods
    /**
     * Return or set the default container class to create new pages
     * By default its a Widget.Container
     * @param {ContainerClass} [containerClass] - If given set the container class
     * @memberof Layout.MultiContainer
     * @method defaultContainer
     */
    klass.defaultContainer = function(widget) {
        if(arguments.length) {
            this._defaultContainerClass = widget || Widget.Container;
        }
        return this._defaultContainerClass;
    };


    return klass;
});
