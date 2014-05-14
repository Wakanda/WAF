WAF.define('waf-behavior/size', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior');
    WAF.require('waf-behavior/properties');

    /**
     * @class Size
     * @augments Style
     * @param {string} [options.min-width]
     * @param {string} [options.max-width]
     * @param {string} [options.min-height]
     * @param {string} [options.max-height]
     * @param {string} [options.resizable]
     */
    var klass = Behavior.create();
    var proto = klass.prototype;
    klass.inherit(WAF.require('waf-behavior/style'));
    
    /**
     * Get or set the width of the widget
     * @param {float} width - width in pixel
     * @returns {float} width in pixel
     * @memberof Size
     * @instance
     * @method width
     * @public
     */
    proto.width = function(width) {
        if(arguments.length) {
            this.style('width', width + 'px');
            this.fire('resize', {}, { once: true });
        }
        return $(this.node).width();
    };
    
    /**
     * Get or set the height of the widget
     * @param {float} height - height in pixel
     * @returns {float} height in pixel
     * @memberof Size
     * @instance
     * @method height
     * @public
     */
    proto.height = function(height) {
        if(arguments.length) {
            this.style('height', height + 'px');
            this.fire('resize', {}, { once: true });
        }
        return $(this.node).height();
    };
    
    /**
     * Get or set the size of the widget
     * @param {float} [width] - width in pixel
     * @param {float} [height] - height in pixel
     * @returns {object} [0] and width are width in pixel, [1] and height are height in pixel
     * @memberof Size
     * @instance
     * @method size
     * @public
     */
    proto.size = function(w, h) {
        if(arguments.length === 2) {
            this.width(w);
            this.height(h);
        }
        w = this.width();
        h = this.height();
        return {
            0: w,
            1: h,
            width: w,
            height: h,
            length: 2
        };
    };
    
    /**
     * Reset the width to auto
     * @memberof Size
     * @instance
     * @method autoWidth
     */
    proto.autoWidth = function() {
        this.style('width', 'auto');
    };
    
    /**
     * Reset the height to auto
     * @memberof Size
     * @instance
     * @method autoHeight
     */
    proto.autoHeight = function() {
        this.style('height', 'auto');
    };
    
//    /**
//     * Make the widget resizable at runtime
//     * @param {boolean} [state=true]
//     * @memberof Size
//     * @instance
//     * @method resizable
//     */
//    proto.resizable = function(state) {
//        if(typeof state === 'undefined') {
//            state = true;
//        }
//        if(state) {
//            this._resizable = true;
//    
//            $(this.node).resizable();
//            
//            $(this.node).resizable('option', 'minWidth', this._minWidth || 0);
//            
//            if(typeof this._maxWidth == 'number')
//                $(this.node).resizable('option', 'maxWidth', this._maxWidth);
//            else
//                $(this.node).resizable('option', 'maxWidth', null);
//    
//            $(this.node).resizable('option', 'minHeight', this._minHeight || 0);
//            
//            if(typeof this._maxHeight == 'number')
//                $(this.node).resizable('option', 'maxHeight', this._maxHeight);
//            else
//                $(this.node).resizable('option', 'maxHeight', null);
//        } else {
//            $(this.node).resizable('destroy');
//            delete this._resizable;
//        }
//    };
//    
//    klass.optionsParsers.resizable = function() {
//        this.resizable(this.options.resizable == 'true');
//    };
    
    /**
     * @private
     */
    proto._attachBehavior = function() {
        this._parentResizeSubscriber = this.parentWidget.subscribe('resize', function(event) {
            if(this.hasRelativeSize()) {
                this.fire('resize', {});
            }
        }, this);
    };

    /**
     * @private
     */
    proto._detachBehavior = function() {
        if(this._parentResizeSubscriber) {
            this._parentResizeSubscriber.unsubscribe();
            delete this._parentResizeSubscriber;
        }
    };

    /**
     * @private
     */
    proto.hasRelativeSize = function() {
        if(/%|em|rem/.test(this.getComputedStyle('width'))) {
            return true;
        }
        if(/%|em|rem/.test(this.getComputedStyle('height'))) {
            return true;
        }
        if(this.getComputedStyle('left') !== 'auto' && this.getComputedStyle('right') !== 'auto') {
            return true;
        }
        if(this.getComputedStyle('top') !== 'auto' && this.getComputedStyle('bottom') !== 'auto') {
            return true;
        }
        return false;
    };

    return klass;
});
