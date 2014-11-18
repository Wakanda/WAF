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
     * @class TODO: give a name to this class (ex: WAF.widget.DataGrid)
     * @extends WAF.Widget
     */
    'Container',    
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

        var
        widget,
        htmlObject,
        splitted,
        splitter,
        container,
        splitType,
        splittedLength,
        splitterTop,
        splitterLeft,
        splitterHeight,
        splitterWidth,
        splitterConfig,
        tagWidth,
        tagHeight,
        splitterCss,
        parent,
        dragMethod,
        scrollable;
        
        widget          = this;
        htmlObject      = $(this.containerNode);

        (config["data-scrollable"] == "true") ? scrollable = true : scrollable = false;

        splitted        = htmlObject.children('.waf-split-container');
        splittedLength  = splitted.length;
        splitterConfig  = {};
        splitterCss     = {};
        tagWidth        = this.containerNode.offsetWidth;
        tagHeight       = this.containerNode.offsetHeight;        
        parent          = htmlObject.parent();

        htmlObject.children('.waf-splitter').remove();

        //add scroll for mobile
        if (WAF.PLATFORM.modulesString == "mobile" && scrollable && splittedLength === 0) {
            $("#"+config.id).css("-webkit-overflow-scrolling", "touch").css("overflow", "scroll");
        }

        /*
         * Check if the container get splitted containers
         */
        if (splittedLength > 0) {           
            splitType = this._getSplitType();

            switch(splitType) {
                case 'horizontally':   
                    splitterLeft    = 0;
                    splitterHeight  = widget._splitterHeight;
                    splitterWidth   = htmlObject.width(); 
                    splitterTop     = parseInt($(splitted[0]).css('height')) - (splitterHeight/2);
                    
                    this._tmpPosition = splitterTop;
                    
                    splitterCss['border-top'] = splitterCss['border-bottom'] = '1px solid #AEAEAE';
                    
                    splitterConfig  = {                        
                        axis    : 'y'
                    }
                    
                    dragMethod = function(e, ui) {
                        var
                        calcul,
                        splitted,
                        htmlObject;
                        
                        splitted    = e.data.splitted;
                        htmlObject  = e.data.htmlObject;
                            
                        calcul      = ui.position.top + (splitterHeight/2);
                        
                        widget._tmpPosition = calcul;
                        
                        $.each(splitted, function() {
                            var
                            container,
                            tagHeight;

                            tagHeight = htmlObject.height();
                            container = $(this);                                

                            if (container.is(":first-child")) {
                                container.css('height', calcul + 'px');
                            } else {
                                container.css('top', calcul + 'px');
                                container.css('height', ((tagHeight - ui.position.top) - (splitterHeight/2)) + 'px');
                            }   

                            if ($$(container.prop('id'))) {
                                $$(container.prop('id'))._resizeSplitters();
                            }
                        });
                        }
                    
                    break;

                case 'vertically': 
                    splitterTop     = 0;
                    splitterWidth   = widget._splitterWidth;
                    splitterHeight  = htmlObject.height();  
                    splitterLeft    = parseInt($(splitted[0]).css('width')) - (splitterWidth/2);
                    
                    this._tmpPosition = splitterLeft;
                    
                    splitterCss['border-left'] = splitterCss['border-right'] = '1px solid #AEAEAE';
                    
                    splitterConfig  = {                        
                        axis    : 'x'
                    }                    
                   
                    dragMethod = function(e, ui) {
                        var
                        splitted,
                        htmlObject;
                        
                        splitted    = e.data.splitted;
                        htmlObject  = e.data.htmlObject;
                        
                        widget._saveSplitPosition(ui.position.left);
                        
                        $.each(splitted, function() {
                            var
                            calcul,
                            container,
                            tagWidth;

                            tagWidth    = htmlObject.width();
                            container   = $(this);       
                            
                            calcul      = ui.position.left + (splitterWidth/2);
                            
                            widget._tmpPosition = calcul;
                            
                            if (container.is(":first-child")) {
                                container.css('width', calcul + 'px');
                            } else {
                                container.css('left', calcul + 'px');
                                container.css('width', ((tagWidth - ui.position.left) - (splitterWidth/2)) + 'px');
                            }   

                            if ($$(container.prop('id'))) {
                                $$(container.prop('id'))._resizeSplitters();
                            }
                        });
                        }
                    
                    break;
            }
            
            splitterConfig.containment = 'parent';
            
            $.extend(splitterCss, {
                'width'         : splitterWidth + 'px',
                'height'        : splitterHeight + 'px',
                'left'          : splitterLeft + 'px',
                'top'           : splitterTop + 'px',
                'cursor'        : splitType == 'horizontally' ? 'row-resize' : 'col-resize',
                'z-index'       : 8888888
            });
            
            splitter    = $('<div>');

            splitter
                .prop('id', 'waf-splitter-' + htmlObject.prop('id'))
                .addClass('waf-splitter')
                .css(splitterCss)
                .draggable(splitterConfig)
                .appendTo(htmlObject) 
                .bind( "drag", {
                        splitted    : splitted,
                        htmlObject  : htmlObject
                    }, dragMethod)
                .bind( "dblclick", function(){
                    widget.toggleSplitter();
                });

            widget._splitter = splitter;
            
            //  && htmlObject.parents('[data-hideSplitter="true"]').length == 0
            if ((!data.hideSplitter || data.hideSplitter !== 'true')) {
            } else {
                splitter.css('visibility', 'hidden');
            }
            
            this._initTmpPosition = this._tmpPosition;
            this._lastSetSize     = null;
            
            splitted        = widget.$domNode.children('.waf-split-container');
            splittedLength  = splitted.length;
            /*
             * Case of loaded from a component into GUI
             */
            if (this.$domNode.parents('#cms-body').length > 0) {
                var checkResize = this._checkResize();
                
                if (checkResize && this._callResizeEvents) {
                    this._callResizeEvents('on');
                    $(window).resize(function(){
                        if (checkResize.x || checkResize.y) {
                            widget._callResizeEvents('on');
                        }
                    });
                }
            }
        }   
    },{      
        ready : function(){
            var
            that,
            orient,
            splitted,
            splittedLength;
            
            that            = this;
            splitted        = this.$domNode.children('.waf-split-container');
            splittedLength  = splitted.length;
            if (splittedLength > 0) { 
                $.each(splitted, function(){
                    that._splitted.push($$($(this).prop('id')));
                });                
            
                /*
                 * @todo : USE LINK TO ASSOCIATE BUTTON TO SPLIT CONTAINER
                 */
                this._button = $$(this.config['data-popup-display-button']);
                
                if (this._button) {
                    this._button.hide();            
                    
                    if (WAF.PLATFORM.isTouch) {                            
                        this._button.$domNode.bind('touchstart', {that : this}, function(e){
                            e.data.that._displayFloatContainer();
                        });
                        
                    } else {
                    
                        this._button.$domNode.bind('click', {that : this}, function(e){
                            e.data.that._displayFloatContainer();
                        });
                    }
                }
                    
            }
            
            if (this._button) {
                this._splitter.hide();
            }            
            
            orient = (window.outerWidth <  window.outerHeight) ? "profile" : "landscape";  

            if (this._button) {
                /*
                 * Default display
                 */
                if (orient == 'profile') {
                    this.mobileSplitView(true);
                } else {
                    this.mobileSplitView(false);
                }
                
                /*
                 * Orientation change + touchstart events for mobile device
                 */
                if( WAF.PLATFORM.isTouch ) {
                    
                    $("body").bind('touchstart', {that : this}, function(e) { 
                                                
                        var parentContainerID = $(e).closest(".waf-split-container")[0] && (e.target).closest(".waf-split-container")[0].id,
                            loatContainer,
                            win     = $(window);
                            orient  = (win.width() <  win.height()) ? "profile" : "landscape";

                        if (parentContainerID && e.target.id != e.data.that._button.id && e.target.offsetParent.id != e.data.that._button.id && parentContainerID != that._splitted[0].id && orient == 'profile') {

                            floatContainer  = e.data.that._splitted[0];

                            if (floatContainer.$domNode[0].style.visibility === "visible") {
                                floatContainer.toggle('visibility');
                            }

                        }

                    });
                    
                    $(window).bind('orientationchange', {widget: that}, function (e) { 
                        var 
                        orient,
                        widget,
                        win = $(window);
                        
                        widget  = e.data.widget;
                        orient  = (win.width() < win.height()) ? "profile" : "landscape";  

                        if (orient == 'profile') {
                            widget.mobileSplitView(true);
                        } else {
                            widget.mobileSplitView(false);
                        }
                        
                        if (widget._callResizeEvents) {        
                            widget._callResizeEvents('on');
                        }
                    })
                } 
            } 
        },
        
        _button : null,
        
        _splitType : null,
        
        _splitted : [],
        
        _tmpPosition : 0,
        
        _display : false,
        
        /**
         * Resize method called during resize
         * @method onResize
         */
        onResize : function container_resize() {   
            if (this.hasSplitter()) {
                this._resizeSplitters('on');
            } else {
                $.each(this.getChildren(), function() {
                    if (this._callResizeEvents) {
                        this._callResizeEvents('on');
                    }
                });
            }
        },  
        
        /**
         * Show or hide the splitter and the left/top splitted container
         * @method toggleSplitter
         */
        toggleSplitter : function container_toggle_splitter() { 
            if (this._tmpPosition <= 2) {
                this._tmpPosition = this._lastSetSize ? this._lastSetSize : this._initTmpPosition;
                this.expandSplitter(); 
            } else {
                if (this._splitStatus == 'collapse' && this._lastSetSize != this.getSplitPosition()) {
                    this.expandSplitter(); 
                } else {
                    this.collapseSplitter();
                }
            }
        },
        
        /**
         * Hide the splitter and the left/top splitted container
         * @method collapse
         */
        collapseSplitter : function container_collapse_splitter() { 
            this._splitStatus = "collapse";
            this.setSplitPosition(0,false,false);
        },
        
        /**
         * Show the splitter and the left/top splitted container
         * @method expand
         */
        expandSplitter : function container_expand_splitter() {
            this._tmpPosition = this._lastSetSize ? this._lastSetSize : this._initTmpPosition;
            
            this._splitStatus = "expand";
            this.setSplitPosition(this._tmpPosition,false,false);
        },
        
        /*
         * Indicate if the container has a splitter
         * @method hasSplitter
         * @return {boolean}
         */
        hasSplitter : function container_has_splitter() {
            var
            result;
            
            result = false;
            
            if (this._hasSplitter) {
                result = this._hasSplitter;
            } else {            
                if (this.$domNode.find('.waf-splitter').length > 0) {
                    result = true;
                    this._hasSplitter = result;
                }
            }
            
            return result;
        },        
        
        /*
         * Resize method called on stop resize
         * @method onResize
         */
        stopResize : function container_stop_resize() {   
            if (this.hasSplitter()) {
                this._resizeSplitters('stop');
            } else {
                $.each(this.getChildren(), function() {
                    if (this._callResizeEvents) {
                        this._callResizeEvents('stop');
                    }
                });
            }
        },    
        
        /*
         * Resize method called on start resize
         * @method onResize
         */
        startResize : function container_start_resize() {   
            if (this.hasSplitter()) {
                this._resizeSplitters('start');
            } else {
                $.each(this.getChildren(), function() {
                    if (this._callResizeEvents) {
                        this._callResizeEvents('start');
                    }
                });
            }
        },       
        
        /*
         * Get the position of the splitter
         * @method getSplitPosition
         * @param {number} value position to define
         */
        getSplitPosition   : function container_get_split_size() {
            var
            splitter,
            splitType,
            htmlObject,
            position;
            
            splitType   = this._getSplitType();   
            htmlObject  = $(this.containerNode);
            
            
            splitter    = htmlObject.children('.waf-splitter');  
            
            if (splitType === 'horizontally') {
                position = parseInt(splitter.css('top'));
            } else {
                position = parseInt(splitter.css('left'));
            }
            
            return position;
        },
        
        /*
         * Set the position of the splitter
         * @method setSplitPosition
         * @param {number} value position to define
         */
        setSplitPosition   : function container_set_split_size(value, force, forgetSet) {
            var
            widget,
            htmlObject,
            splitter,
            splitted,
            splitterSize,
            splitType,
            tagSize;
            
            widget          = this;
            htmlObject      = $(this.containerNode);
            splitted        = htmlObject.children('.waf-split-container');
            splitter        = htmlObject.children('.waf-splitter');     
                       
            splitType = this._getSplitType();            
            
            switch(splitType) {
                case 'horizontally': 
                    splitterSize    = widget._splitterHeight;
                    tagSize         = htmlObject.height();
                    
                    if (value > tagSize) {
                        value = tagSize - splitterSize;
                    }
                    
                    splitter.css('top', value + 'px');
                    
                    $.each(splitted, function() {
                        var
                        calcul,
                        container;
                        
                        if (force) {
                            calcul = 0;
                        } else {
                            calcul = (splitterSize/2);
                        }
                        
                        container = $(this);       

                        if (container.is(":first-child")) {
                            container.css('height', (value + calcul) + 'px');
                        } else {
                            container.css('top', value + calcul);
                            container.css('height', ((tagSize - value) - calcul) + 'px');
                        }   

                        $$(container.prop('id'))._resizeSplitters();
                    });
                    break;
                    
                case 'vertically': 
                    splitterSize    = widget._splitterWidth;                     
                    tagSize         = htmlObject.width();                      
                    
                    if (value > tagSize) {
                        value = tagSize - splitterSize;
                    }
                    
                    splitter.css('left', value + 'px');
                    
                    $.each(splitted, function() {
                        var
                        calcul,
                        container;
                        
                        if (force) {
                            calcul = 0;
                        } else {
                            calcul = (splitterSize/2);
                        }
                        
                        container = $(this);       

                        if (container.is(":first-child")) {
                            container.css('width', (value + calcul) + 'px');
                        } else {
                            container.css('left', value + calcul);
                            container.css('width', ((tagSize - value) - calcul) + 'px');
                        }   

                        $$(container.prop('id'))._resizeSplitters();
                    });
                    break;
            }
            
            if(typeof forgetSet === 'undefined' || forgetSet !== false){
                this._lastSetSize = value;
            }
            
            
        },
        
        /*
         * Splitter default width
         */
        _splitterWidth : 5,
        
        /*
         * Splitter default height
         */
        _splitterHeight : 5,
        
        /*
         * Get the type of the split (horizontal/vertical)
         * @method _getSplitType
         * @return {string}
         */
        _getSplitType : function container_get_split_type() {
            var
            children,
            splitType;
            
            children = $(this.containerNode).children();
            
            if (this._splitType != null) {
                splitType = this._splitType;
            } else {
                /*
                 * Get splitter type
                 */
                if (children.length > 1) {
                    if ($(children[0]).css('left') == '0px' && $(children[1]).css('left') == '0px') {
                        splitType   = 'horizontally';
                    } else {
                        splitType   = 'vertically';
                    }
                } else {
                    splitType = '';
                }
                
                this._splitType = splitType;
            }
            
            return splitType;            
        },
        
        /*
         * Resize splitter containers inside this container
         * @method _resizeSplitters
         */
        _resizeSplitters : function container_resize_splitter(type) { 
            var
            that,
            child,
            orient,
            children,
            thatHeight,
            thatWidth,
            splitType,
            splitter,
            container;
            
            that        = $(this.containerNode);
            container   = this;
            children    = that.children(':not(.waf-split-container-float)');
            
            type        = type || 'on';
            
            if (children.length > 0) {
                /*
                 * Hide overflow if container as splitted containers
                 */
                that.css('overflow', 'hidden');
            }            
                
            thatHeight  = parseInt(that.css('height'));
            thatWidth   = parseInt(that.css('width'));            

            splitter    = that.children('.waf-splitter');   

            /*
             * Get splitter type
             */
            splitType = this._getSplitType();
                        
            $.each(children, function(e){
                var
                calcul,
                containerX,
                containerY,
                childWidget,
                checkResize;
                
                child       = $(this);
                childWidget = $$(child.prop('id'));
                containerX  = parseInt(child.css('left'));
                containerY  = parseInt(child.css('top'));
                
                child.resizeChildren = that.resizeChildren;                
                                
                //if (checkResize.x && checkResize.y) {
                   
                if (child.is('.waf-split-container')) {                            
                    switch(splitType) {
                        case 'horizontally':

                            if (containerY != 0 || container._display) {
                                calcul = thatHeight - containerY;
                                child.css('height', calcul + 'px');
                            }
                            child.css('width', thatWidth + 'px');

                            splitter.css('width', thatWidth + 'px');                            
                            
                            break;

                        case 'vertically':
                            if (containerX != 0 || container._display) {
                                calcul = thatWidth - containerX;
                                child.css('width', calcul + 'px');
                            }
                            child.css('height', thatHeight + 'px');

                            splitter.css('height', thatHeight + 'px');
                            break;
                    } 
                    
                    if (childWidget) {
                        childWidget._resizeSplitters(type);
                    }
                }

                if (childWidget && childWidget._checkResize) {
                    checkResize = childWidget._checkResize();                    
                
                    if (checkResize.x || checkResize.y) {
                        childWidget._callResizeEvents(type);
                    }
                    
                }
            });  
            
            
            if (this._button) {                
                //if( !WAF.PLATFORM.isTouch ) {       
                    var orient,
                        win = $(window);
                        
                    orient = (win.width() <  win.height()) ? "profile" : "landscape";  

                    if (orient == 'profile') {
                        container.mobileSplitView(true);
                    } else {
                        container.mobileSplitView(false);
                    }
                //}
            }
        },
        
        /**
         * Save the splittter position into private property
         * @method _saveSplitPosition
         * @param {number} position : position of the splitter
         */
        _saveSplitPosition: function container_save_split_position(position) {    
            var
            dsPos,
            dsParent,
            htmlObject;
            
            htmlObject = $('#' + this.id);
            
            if (htmlObject.data('dsPos')) {
                dsPos = htmlObject.prop('id') + '-' + htmlObject.data('dsPos');
            } else {
                dsParent = htmlObject.parents('[data-dsPos]');
                
                if (dsParent.length > 0) {
                    dsPos = htmlObject.prop('id') + '-' + dsParent.data('dsPos');
                }
            }
            
            if (!WAF._tmpSplitPosition) {
                WAF._tmpSplitPosition = {};
            }
            
            if (dsPos) {
                WAF._tmpSplitPosition[this.id] = position;
            } 
        },

        _displayFloatContainer : function() {
            var
            top,
            left,
            buttonHtml,
            thatOffset,
            containerHtml,
            floatContainer;

            buttonHtml      = this._button.$domNode;
            floatContainer  = this._splitted[0];
            containerHtml   = floatContainer.$domNode;
            buttonOffset    = buttonHtml.offset();
            left            = buttonOffset.left;
            top             = buttonOffset.top + buttonHtml.height() + 15;

            floatContainer.toggle('visibility');

            containerHtml
                .addClass('waf-container-split-mobile');

            if (buttonOffset.top < window.innerHeight/2) { 
                containerHtml
                    .css({
                        left    : left + 'px',
                        top     : top + 'px',
                        width   : this._initTmpPosition + 'px'
                    })
            } else { 
                containerHtml
                    .css({
                        left    : left + 'px',
                        top     : '15px',
                        bottom  : window.innerHeight - buttonOffset.top + 10 + 'px',
                        width   : this._initTmpPosition + 'px'
                    })
            }
        },
        
        /**
         * Display the splitter has a mobile splitview
         * @method mobileSplitView
         * @param {boolean} mobile : true to display as mobile
         */
        mobileSplitView : function container_mobile_split_view (mobile) {
            var
            that,
            splitted,
            firstSplitted,
            firstSplitWidth;
            
            if (mobile == this._display || !this._splitter) {
                return false;
            }
            
            that            = this;
            this._display   = mobile;   
            firstSplitted   = this._splitted[0];

            if (mobile) {

                splitted = firstSplitted.$domNode;
                
                /*
                 * Collapse splitted
                 */
                this.setSplitPosition(0, true);
                
                splitted
                    .css({
                        'width'     : this._initTmpPosition + 'px',
                        'position'  : 'fixed',
                        //'height'    : splitted.height() + 'px',
                        'z-index'   : 10
                    })
                    .addClass('waf-split-container-float')
                    //.appendTo('body');


                firstSplitted.hide('visibility');                

                this._splitted[1].$domNode.css({
                    'left'      : '0px',
                    'width'     : window.innerWidth + 'px',
                    'z-index'   : 9
                });

                /*
                 * Hide splitter
                 */
                this._splitter.css('visibility', 'hidden');

                this._button.show();       

                firstSplitted._callResizeEvents('on');
                this._splitted[1]._callResizeEvents('on');
            } else {
                firstSplitted.show();

                firstSplitted.$domNode
                    .css({
                        'left'      : 0,
                        'top'       : 0,
                        'z-index'   : 9,
                        'position'  : 'absolute',
                        'height'    : this.getHeight()
                    })
                    .removeClass('waf-split-container-float')
                    //.appendTo(that.$domNode)
                    .removeClass('waf-container-split-mobile');

                this._button.hide();
               
                firstSplitWidth = firstSplitted.$domNode.width();
                
                this._splitted[1].$domNode.css({
                    'left'      : firstSplitted.$domNode.width() + 'px',
                    'z-index'   : 10,
                    'width'     : window.innerWidth - firstSplitWidth
                });
                
                firstSplitted._callResizeEvents('on');
                this._splitted[1]._callResizeEvents('on');
            }
        }
    }
);
