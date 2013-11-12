WAF.define('waf-behavior/size', function() {
    var Behavior = WAF.require('waf-core/behavior'),
        Event = WAF.require('waf-core/event'),
        WakError = WAF.require('waf-core/error');
    WAF.require('waf-behavior/propertieshelper');

    /**
     * @class Size
     * @augments Style
     * @param {string} [options.min-width]
     * @param {string} [options.max-width]
     * @param {string} [options.min-height]
     * @param {string} [options.max-height]
     * @param {string} [options.resizable]
     */
    var klass = Behavior.create('Size');
    var proto = klass.prototype;
    klass.inherit(WAF.require('waf-behavior/style'));
    
    /**
     * Get or set the width of the widget
     * @param {float} width - width in pixel
     * @returns {float} width in pixel
     * @memberof Size
     * @instance
     */
    proto.width = function(width) {
        if(arguments.length) {
            if(width < (this._min_width || 0))
                throw new WakError.Width(width + ' is < ' + this._min_width);
            if(this._max_width && width > this._max_width)
                throw new WakError.Width(width + ' is > ' + this._max_width);
            this.style('width', width + 'px');
        }
        return this.node.offsetWidth;
    };
    
    /**
     * Get or set the height of the widget
     * @param {float} height - height in pixel
     * @returns {float} height in pixel
     * @memberof Size
     * @instance
     */
    proto.height = function(height) {
        var e = $(this.node);
        if(arguments.length) {
            if(height < (this._min_height || 0))
                throw new WakError.height(height + ' is < ' + this._min_height);
            if(this._max_height && height > this._max_height)
                throw new WakError.height(height + ' is > ' + this._max_height);
            this.style('height', height + 'px');
        }
        return this.node.offsetHeight;
    };
    
    /**
     * Get or set the size of the widget
     * @param {float} [width] - width in pixel
     * @param {float} [height] - height in pixel
     * @returns {object} [0] and width are width in pixel, [1] and height are height in pixel
     * @memberof Size
     * @instance
     */
    proto.size = function(w, h) {
        if(arguments.length == 2) {
            this.width(w);
            this.height(h);
        }
        var w = this.width();
        var h = this.height();
        return {
                0: w,      1: h,
            width: w, height: h,
            length: 2
        };
    };
    
    /**
     * Reset the width to auto
     * @memberof Size
     * @instance
     */
    proto.autoWidth = function() {
        this.style('width', 'auto');
    };
    
    /**
     * Reset the height to auto
     * @memberof Size
     * @instance
     */
    proto.autoHeight = function() {
        this.style('height', 'auto');
    };
    
    /**
     * Make the widget resizable at runtime
     * @param {boolean} [state=true]
     * @memberof Size
     * @instance
     */
    proto.resizable = function(state) {
        if(typeof state == 'undefined') state = true;
        if(state) {
            this._resizable = true;
    
            $(this.node).resizable();
            
            $(this.node).resizable('option', 'minWidth', this._min_width || 0);
            
            if(typeof this._max_width == 'number')
                $(this.node).resizable('option', 'maxWidth', this._max_width);
            else
                $(this.node).resizable('option', 'maxWidth', null);
    
            $(this.node).resizable('option', 'minHeight', this._min_height || 0);
            
            if(typeof this._max_height == 'number')
                $(this.node).resizable('option', 'maxHeight', this._max_height);
            else
                $(this.node).resizable('option', 'maxHeight', null);
        } else {
            $(this.node).resizable('destroy');
            delete this._resizable;
        }
    };
    
    klass.options_parsers.resizable = function() {
        this.resizable(this.options.resizable == 'true');
    };
    
    
    klass.addProperty('min_width',  undefined, undefined, function() { klass.options_parsers.resizable.call(this, this._resizable); });
    klass.addProperty('max_width',  undefined, undefined, function() { klass.options_parsers.resizable.call(this, this._resizable); });
    klass.addProperty('min_height', undefined, undefined, function() { klass.options_parsers.resizable.call(this, this._resizable); });
    klass.addProperty('max_height', undefined, undefined, function() { klass.options_parsers.resizable.call(this, this._resizable); });
    
    
    /**
     * @class Error.Size
     * @augments Error.Error
     */
    WakError.create('Size');
    /**
     * @class Error.Width
     * @augments Error.Size
     */
    WakError.create('Width', WakError.Size)
    /**
     * @class Error.Height
     * @augments Error.Size
     */
    WakError.create('Height', WakError.Size)


    return klass;
});
