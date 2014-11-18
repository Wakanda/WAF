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
     *      
     * @class TODO: give a name to this class (ex: WAF.widget.DataGrid)
     * @extends WAF.Widget
     */
    'Slider',   
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
     **/
    function WAFWidget(config, data, shared) {
        var that,
            sliderConfig,
            htmlObject;

        that            = this;
        htmlObject      = $(this.containerNode);    
        sliderConfig    = {};
        
        this._sliderConfig = sliderConfig;
        
        $.extend(this._sliderConfig, {
            min         : parseInt(data['minValue'])    || 0,
            max         : parseInt(data['maxValue'])    || 0,
            step        : parseInt(data['step'])        || 1,
            range       : data['range']                 || false,
            orientation : data['orientation']
        });

        /*
         * If widget is binded
         */
        if (this.sourceAtt) {
            var
            sliderConfig;

            /*
             * Extend slider config to set slide and start functions
             */
            $.extend(that._sliderConfig, {
                slide: function(e, ui) {
                    var
                    widget,
                    value,
                    sourceAtt;

                    widget      = WAF.widgets[this.id];
                    value       = ui.value;
                    sourceAtt   = widget.source.getAttribute(widget.att.name);

                    sourceAtt.setValue(value, {
                        dispatcherID    :   widget.id
                    });
                },
                start : function (e, ui) {
                    var
                    dsPos,
                    widget;

                    dsPos = $(this).parent().data('dspos');
                    if (dsPos) {
                        widget = WAF.widgets[this.id];
                        widget.source.select(parseInt(dsPos));
                    }
                }
            });
                
            this.sourceAtt.addListener(function(e) {
                var 
                widget,
                isParentMatrix,
                htmlObject,
                widgetID;
                
                widget          = e.data.widget;       
                widgetID        = widget.id;
                htmlObject      = $('#' + widgetID);
                isParentMatrix  = htmlObject.parents('.waf-matrix');

                /*
                 * Set value depending on datasource value
                 */                
                if (isParentMatrix.length == 0 || (e.subID && isParentMatrix.length != 0)) {
                    
                    widget._sliderConfig.value = widget.sourceAtt.getValue();                    
        
                    /*
                     * Create jquery ui slider depending on the platform
                     */
                     $.extend(sliderConfig, {
                        create: function(event, ui) {
                            if (WAF.onAllScriptsLoaded !== null) {
                                WAF.onAllScriptsLoaded.done(function() {
                                    $(htmlObject).trigger('slidecreate');
                                });
                            }
                        }
                     });
                    
                     if ( WAF.PLATFORM.modulesString === "mobile" ) {
                        htmlObject.slider(sliderConfig).addTouch();
                     } else {
                         htmlObject.slider(sliderConfig);
                     }

                     widget._initValue = widget.getValue(); 
                }
				
				/*
                if (widget._sliderConfig.orientation === 'horizontal') {
                    htmlObject.find('.ui-slider-handle').css({
                        height      : htmlObject.height() + 14 + 'px',
                        lineHeight  : htmlObject.height() + 10 + 'px'
                    });
                } else {
                    htmlObject.find('.ui-slider-handle').width(htmlObject.width() + 14);
                }
                */


            },{
                id: config.id,
                listenerID      : config.id,
                listenerType    : 'slider',
                subID           : config.subID ? config.subID : null
            }, {
                widget          :this,
                sliderConfig    : that._sliderConfig
            });
            
        } else {        
            /*
             * Create jquery ui slider depending on the platform
             */
            
             $.extend(that._sliderConfig, {
                create: function(event, ui) {
                    if (WAF.onAllScriptsLoaded !== null) {                    
                        WAF.onAllScriptsLoaded.done(function() {
                            $(htmlObject).trigger('slidecreate');
                        });
                    }
                }
             });
            
            if ( WAF.PLATFORM.modulesString === "mobile" ) { 
                //could look at  WAF.PLATFORM.type (tablet, phone...) to go deeper on a platform-specific code
                //call addTouch defined in jquery.ui.ipad.altfix.js
                window.setTimeout(function(){
                    //temp fix
                    if (!htmlObject) {
                        htmlObject = $(this.containerNode);
                    }
                    htmlObject.slider(that._sliderConfig).addTouch();         
                }, 100);
                
            } else {
                htmlObject.slider(that._sliderConfig);
            }

            this._initValue = this.getValue();

			//this._redrawHandle(data.orientation);
        }

    },{
		_redrawHandle: function(orientation) {
			var htmlObject = this.$domNode;
		
			/*
			if (orientation === 'horizontal') {
                htmlObject.find('.ui-slider-handle').css({
                    height      : htmlObject.height() + 14 + 'px',
                    lineHeight  : htmlObject.height() + 10 + 'px'
                });
            } else {
                htmlObject.find('.ui-slider-handle').width(htmlObject.width() + 14);
            }
            */
		},
        ready : function slider_ready () {
        },

        /**
         * Custom getValue function
         * @method getValue
         * @return {number|array} value or values (if many handle)
         */
        getValue : function slider_get_value() {
            var
            result;

            if (this.$domNode.slider('option', 'values')) {
                result = this.$domNode.slider('option', 'values');
            } else {
                result = this.$domNode.slider('value');
            }

            return result;
        },

        /**
         * Add a new handle on the slide
         * @method addHandle
         */
        addHandle : function slider_add_handle(number) {
            var
            value,
            handle1,
            handle2,
            that = this;

            value   = this.getValue();
            
            if (typeof(value) == 'object') {
                this._sliderConfig.value    = number;
                this._sliderConfig.values   = null;
                this._sliderConfig.step   = null;
                this._sliderConfig.range   = this.config['data-range'];
            } else {
                handle1 = value;
                handle2 = number;

                if (handle1 > handle2) {
                    handle2 = handle1;
                    handle1 = number;
                }

                this._sliderConfig.range    = true;
                this._sliderConfig.values   = [handle1, handle2];
                this._sliderConfig.value    = null;
            }

			this._sliderConfig.orientation = this.getOrientation();

            this.$domNode.slider('destroy');
            
             $.extend(this._sliderConfig, {
                create: function(event, ui) {
                    if (WAF.onAllScriptsLoaded !== null) {                    
                        WAF.onAllScriptsLoaded.done(function() {
                            $(that.$domNode).trigger('slidecreate');
                        });
                    }
                }
             });
            
            this.$domNode.slider(this._sliderConfig);
        },
                
        /**
         * Disable the slider
         * @method disable
         */
        disable : function slider_disable () {
            this.$domNode.slider('disable');   
            
            /*
             * Call super class enable function
             */
            WAF.Widget.prototype.disable.call(this);
        },
        
        /**
         * Enable the slider
         * @method enable
         * @param {boolean} disable
         */
        enable : function slider_enable () {                
            this.$domNode.slider('enable');     
            
            /*
             * Call super class enable function
             */
            WAF.Widget.prototype.enable.call(this);
        },
        
        /**
         * Get the minimum value of the slider
         * @method getMin
         */
        getMin: function slider_get_min() {
            return this.$domNode.slider( "option", "min" );
        },
        
        
        /**
         * Get the maximum value of the slider
         * @method getMin
         */
        getMax: function slider_get_max() {
            return this.$domNode.slider( "option", "max" );
        },
        
        
        /**
         * Get the step value of the slider
         * @method getStep
         */
        getStep: function slider_get_step() {
            return this.$domNode.slider( "option", "step" );
        },
        
        
        /**
         * Get the range of the slider
         * @method getRange
         */
        getRange: function slider_get_range() {
            return this.$domNode.slider( "option", "range" );
        },
        
        /**
         * Get the range of the slider
         * @method getRange
         */
        getOrientation: function slider_get_orientation() {
            return this.$domNode.slider( "option", "orientation" ); 
        },
        
        /**
         * Set the minimum value of the slider
         * @method setMin
         * @param {number} value
         */
        setMin: function slider_set_min(value) {
            this.$domNode.slider( "option", "min", value );
            this._sliderConfig.min = value;
        },
        
        /**
         * Set the maximum value of the slider
         * @method setMin
         * @param {number} value
         */
        setMax: function slider_set_max(value) {
            this.$domNode.slider( "option", "max", value );
            this._sliderConfig.max = value;
        },
        
        /**
         * Set the step value of the slider
         * @method setStep
         * @param {number} value
         */
        setStep: function slider_set_step(value) {
            this.$domNode.slider( "option", "step", value );
            this._sliderConfig.step = value;
        },
        
        /**
         * Set the range of the slider
         * @method setRange
         * @param {number} value
         */
        setRange: function slider_set_range(range) {
            var
            rangeHtml;
            
            rangeHtml = this.$domNode.children('.ui-slider-range');
            
            if (range == 'min') {
                rangeHtml.show();
                rangeHtml.removeClass('ui-slider-range-max');
                rangeHtml.addClass('ui-slider-range-min');
            }
            
            if (range == 'max') {
                rangeHtml.show();
                rangeHtml.removeClass('ui-slider-range-min');
                rangeHtml.addClass('ui-slider-range-max');
            }
            
            if (range == 'none') {
                rangeHtml.hide();
            }
            
            this.$domNode.slider( "option", "range", range );
            
            /*
             * Force set value to rebuild range
             */
            this.setValue(this.getValue());
        },
        
        /**
         * Change the orientation of the slider
         * @method setOrientation
         * @param {string|boolean} value
         */
        setOrientation: function slider_set_orientation(value) {
            var
            width,
            height,
            pos = false;
            
            value = value.toLowerCase();
            
            if (this.getOrientation() != value) {
                width   = this.getWidth();
                height  = this.getHeight();
                
                this.setWidth(height);
                this.setHeight(width);
                
                if (value == 'vertical') {
                    this.$domNode.children('.ui-slider-range').css({
                        width : '100%',
                        left : '0%',
                        top: ''
                    });
                    pos = {'left' : ''};
                } else {
                    this.$domNode.children('.ui-slider-range').css({
                        height : '100%',
                        top : '0%',
                        left: ''
                    });
                    pos = {'bottom' : ''};
                }
				//this._redrawHandle(value);
            }
            this.$domNode.slider( "option", "orientation", value );  
            if(pos) $('.ui-slider-handle', this.$domNode).css(pos);
        },
        
        /**
         * Enable to set values when there is many handles
         * @method setValues
         * @param {array} values
         */
        setValues : function slider_set_values (values) {
            var
            i,
            length;
            
            length = values.length;

            if (!this.isDisabled()) {            
                for (i = 0; i < length; i += 1) {
                    this.$domNode.slider( "values" , i , values[i]);
                }
            }
        },

        /**
         * Custom clear function
         * @method clear
         */
        clear : function slider_clear () {
            if (typeof this._initValue == 'object') {
                this.setValues(this._initValue);
            } else {
                this.setValue(this._initValue);
            }
        }
    }
);