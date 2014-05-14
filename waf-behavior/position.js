WAF.define('waf-behavior/position', function() {
    "use strict";
    var Behavior = WAF.require('waf-core/behavior');
    WAF.require('waf-behavior/properties');

    /**
     * @class Position
     * @augments Size
     * @param {string} [options.constraint-top]
     * @param {string} [options.constraint-left]
     * @param {string} [options.constraint-bottom]
     * @param {string} [options.constraint-right]
     * @param {string} [options.draggable]
     */
    var klass = Behavior.create();
    var proto = klass.prototype;
    klass.inherit(WAF.require('waf-behavior/size'));
    
    
    /**
     * Get or set the left position of the widget relatively to it's container left content border
     * @param {float} x - Left offset in pixel
     * @returns {float} Left offset in pixel
     * @memberof Position
     * @instance
     * @public
     */
    // TODO: manage constraints for left, top, right and bottom
    // Analyse CSS ? Just follow the constraints value ?
    proto.left = function(x) {
        if(arguments.length) {
            this.style('left', x + 'px');
        }
        return this.node.offsetLeft;
    };
    
    /**
     * Get or set the top position of the widget relatively to it's container top content border
     * @param {float} x - top offset in pixel
     * @returns {float} top offset in pixel
     * @memberof Position
     * @instance
     * @method top
     * @public
     */
    proto.top = function(y) {
        if(arguments.length) {
            this.style('top', y + 'px');
        }
        return this.node.offsetTop;
    };
    
    /**
     * Set the right position of the widget relatively to it's container right content border
     * @param {float} x - right offset in pixel
     * @memberof Position
     * @instance
     * @method right
     * @public
     */
    proto.right = function(x) {
        if(arguments.length) {
            this.style('right', x + 'px');
        }
        // TODO add a return value
    };
    
    /**
     * Set the bottom position of the widget relatively to it's container bottom content border
     * @param {float} x - bottom offset in pixel
     * @memberof Position
     * @instance
     * @method bottom
     * @public
     */
    proto.bottom = function(y) {
        if(arguments.length) {
            this.style('bottom', y + 'px');
        }
        // TODO add a return value
    };
    
    /**
     * Change the position and the size of the widget so the left offset is 0 and the other offsets don't change
     * @memberof Position
     * @instance
     * @method fitToLeft
     * @public
     */
    proto.fitToLeft = function() {
        var right = $(this.node).css('right') !== 'auto';
        if(!right) {
            this.width(this.left() + this.width());
        } else {
            this.autoWidth();
        }
        this.left(0);
    };
    
    /**
     * Change the position and the size of the widget so the top offset is 0 and the other offsets don't change
     * @memberof Position
     * @instance
     * @method fitToTop
     * @public
     */
    proto.fitToTop = function() {
        var bottom = $(this.node).css('bottom') !== 'auto';
        if(!bottom) {
            this.height(this.top() + this.height());
        } else {
            this.autoHeight();
        }
        this.top(0);
    };
    
    /**
     * Change the position and the size of the widget so the right offset is 0 and the other offsets don't change
     * @memberof Position
     * @instance
     * @method fitToRight
     * @public
     */
    proto.fitToRight = function() {
        var left = $(this.node).css('left') !== 'auto';
        if(!left) {
            this.width(this.left() + this.width());
        } else {
            this.autoWidth();
        }
        this.right(0);
    };
    
    /**
     * Change the position and the size of the widget so the bottom offset is 0 and the other offsets don't change
     * @memberof Position
     * @instance
     * @method fitToBottom
     * @public
     */
    proto.fitToBottom = function() {
        var top = $(this.node).css('top') !== 'auto';
        if(!top) {
            this.height(this.top() + this.height());
        } else {
            this.autoHeight();
        }
        this.bottom(0);
    };
    
    /**
     * Get or set the position relative to its container content border
     * @param {float} x - right offset in pixel
     * @param {float} y - top offset in pixel
     * @returns {object} left offset is in [0], .x or .left, top offset in [1], .y and .top
     * @memberof Position
     * @instance
     * @method position
     * @public
     */
    proto.position = function(x, y) {
        if(arguments.length === 2) {
            this.left(x);
            this.top(y);
        }
        x = this.left();
        y = this.top();
        return {
            0: x,
            1: y,
            x: x,
            y: y,
            left: x,
            top: y,
            length: 2
        };
    };
    
    /**
     * Get the absolute position (offset from the upper left corner of the page
     * @returns {object} left offset is in [0], .x or .left, top offset in [1], .y and .top
     * @memberof Position
     * @instance
     * @method absolutePosition
     * @public
     */
    proto.absolutePosition = function() {
        var ab = this.parentWidget.absolutePosition();
        var p = this.position();
        var s = this.parentWidget.contentOffset ? this.parentWidget.contentOffset() : { x: 0, y: 0 };
        return {
            0: ab.x + p.x + s.x,
            1: ab.y + p.y + s.y,
            x: ab.x + p.x + s.x,
            y: ab.y + p.y + s.y,
            left: ab.x + p.x + s.x,
            'top': ab.y + p.y + s.y,
            length: 2
        };
    };
    
//    /**
//     * Get or set the constraints
//     * @param {object} constraints
//     * @param {boolean} constraints.top
//     * @param {boolean} constraints.right
//     * @param {boolean} constraints.bottom
//     * @param {boolean} constraints.left
//     * @returns {object} object with top, right, bottom and left boolean value of each constraints
//     * @memberof Position
//     * @instance
//     * @method constraints
//     */
//    proto.constraints = function(constraints) {
//        if(arguments.length) {
//            if(typeof constraints !== 'object') {
//                constraints = {
//                    'top':  arguments[0],
//                    right:  arguments[1],
//                    bottom: arguments[2],
//                    left:   arguments[3]
//                };
//            }
//            for(var k in constraints) {
//                if(typeof constraints[k] !== 'undefined') {
//                    this._constraints[k] = constraints[k];
//                }
//            }
//            if(this._constraints.left && !this._constraints.right) {
//                this.left(this.left());
//            }
//            if(!this._constraints.left && this._constraints.right) {
//                this.right(this.right());
//            }
//            if(this._constraints.left && this._constraints.right) {
//                this.autoWidth();
//            }
//    
//            if(this._constraints.top && !this._constraints.bottom) {
//                this.top(this.top());
//            }
//            if(!this._constraints.top && this._constraints.bottom) {
//                this.bottom(this.bottom());
//            }
//            if(this._constraints.top && this._constraints.bottom) {
//                this.autoHeight();
//            }
//        }
//        return this.constraints;
//    };
//    
//    klass.optionsParsers['constraint-left'] = // FIXME: find a way to prevent the parsers to be launched many times...
//    klass.optionsParsers['constraint-right'] = 
//    klass.optionsParsers['constraint-top'] = 
//    klass.optionsParsers['constraint-bottom'] = function() {
//        var c = {},
//        that = this;
//        
//        ['left', 'right', 'top', 'bottom'].forEach(function(d) {
//            if(that.options['constraint-' + d] === 'true') {
//                c[d] = true;
//            }
//            if(that.options['constraint-' + d] === 'false') {
//                c[d] = false;
//            }
//        });
//        this.constraints(c);
//    };
//   
//   /**
//    * Called to initialize behaviors properties
//    * @private
//    * @memberof Position
//    * @instance
//    * @method _initProperties
//    */
//   proto._initProperties = function() {
//       this._constraints = {};
//   };
//   
//    /**
//     * Make the widget dragable at runtime
//     * @param {boolean} [state=true]
//     * @memberof Position
//     * @instance
//     * @method draggable
//     */
//    proto.draggable = function(state) {
//        if(typeof state === 'undefined') {
//            state = true;
//        }
//        var zIndex;
//        if (state) {
//            $(this.node).draggable({
//                start : function (event){
//                    zIndex = $(this).css('zIndex');
//                },
//                stop : function (event){
//                    $(this).css('zIndex', zIndex);
//                },
//                cancel : ".waf-widget-body,input,textarea,button,select,option",
//                stack   : '.waf-widget',
//                zIndex  : 99999
//            });
//        } else {
//            $(this.node).draggable('destroy');
//        }
//    };
//    
//    klass.optionsParsers.draggable = function() {
//        this.draggable(this.options.draggable === 'true');
//    };

    var Widget = WAF.require('waf-core/widget');
    Widget.defaultBehaviors.push(klass); // By inheritance, add Style and Size

    return klass;
});
