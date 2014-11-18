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
    'Checkbox',   
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
        var
        i,
        icon,
        theme,
        icons,
        widget,
        themes,
        classes,
        imgHtml,
        readOnly,
        cssClass,
        htmlObject,
        definedTheme = WAF.pageTheme,
        checkboxHtml;

        config      = config || {};

        widget      = this;
        htmlObject  = this.$domNode;
        classes     = htmlObject.prop('class');
        themes      = [];

		// since we cannot rely on checkbox.is:checked nor checkbox.attr('checked'), we store the state of the checkbox there
		// for some odd reasons, chrome's is:checked status isn't updated in some cases
		this._checked = false;		

        /*
         * Get widget theme
         */
        /*for (i in WAF.widget.themes) {
            theme = WAF.widget.themes[i].key;
            if (classes.match(theme)) {
                themes.push(theme);
                
                if (theme != 'inherited') {
                    definedTheme = theme;
                }
            }
        }*/

        
        if (!definedTheme) {
            definedTheme = $("body").attr("data-theme");
        }    
        
        htmlObject.children().remove()
        
        $('<div class="waf-checkbox-box">').appendTo(htmlObject);        
        
        icons   = [];
        
        if (data['icon-default'])    icons.push({cssClass : 'waf-checkbox-icon-default',  value : data['icon-default']});
        if (data['icon-hover'])      icons.push({cssClass : 'waf-checkbox-icon-hover',    value : data['icon-hover']});
        if (data['icon-active'])     icons.push({cssClass : 'waf-checkbox-icon-active',   value : data['icon-active']});
        if (data['icon-selected'])   icons.push({cssClass : 'waf-checkbox-icon-selected', value : data['icon-selected']});
        if (data['icon-disabled'])   icons.push({cssClass : 'waf-checkbox-icon-disabled', value : data['icon-disabled']});

        cssClass    = 'waf-icon waf-checkbox-icon';
        
        if (icons.length == 0) {
            cssClass += ' waf-icon-svg';
        } else {
            cssClass += ' waf-icon-image';
        }

        icon    = $('<div class="' + cssClass + '">');
        
        /*
         * Img icon
         */
        if (icons.length > 0) {         
            for (i = 0; i < icons.length; i += 1) {   
                imgHtml = $('<img>');

                imgHtml.addClass(icons[i].cssClass);
                
                imgHtml.prop({
                    src : icons[i].value
                });

                imgHtml.appendTo(icon);
            }
        /*
         * Svg icon
         */
        } else {
            icon.svg({
                loadURL: '/walib/WAF/widget/checkbox/skin/general/svg/widget-checkbox-skin.svg',
                onLoad: function(svg) {
                    svg.configure({
                        width: '100%',
                        height: '100%',
                        preserveAspectRatio: 'none'
                    });
                }
            });
        }
            
        icon.appendTo(htmlObject);

        checkboxHtml = $('<input>').prop('type', 'checkbox');

        checkboxHtml.appendTo(htmlObject);
        
        /*
         * Check the box if checked is true
         */
        if (data.checked === 'true' || data.checked === true) {
			this._checked = true;
            checkboxHtml.prop('checked', 'checked');        
            htmlObject.addClass('waf-state-selected');
        } else {
			this._checked = false;
            checkboxHtml.removeProp('checked');
        }
        
        /*
         * ------------ <MOUSE EVENTS> ------------
         * To change status
         */
        htmlObject.hover(
            function () {
                widget.setState('hover');
            },
            function () {
                widget.setState('default');
            }
        );

        htmlObject.bind('mousedown', {widget : this}, function(e) {
            widget.removeState('selected');
            widget.setState('active');
        });

        htmlObject.bind('mouseup', {widget : this}, function(e) {
            widget.setState('hover');
        });

        checkboxHtml.bind('change', function() {
			widget._checked = !widget._checked;
			var value;

            if (widget._checked) {
				value = true;
                widget.setState('selected');
            } else {
				widget.removeState('selected');
                widget.setState('default');
				value = false;
            }

			if (widget.sourceAtt != null)
				widget._changeDsValue(value);
		});

        htmlObject.focusin(function() {
            widget.setState('focus'); 
        });

        htmlObject.focusout(function() {
            widget.setState('default'); 
        });
        
        /*
         * Active click on checkbox label to check/uncheck
         */
        $('label[for=' + widget.id + ']').bind('click', {widget: widget}, function(e) {
            widget.toggleCheckbox();
        });
        
        /*
         * ------------ </MOUSE EVENTS> ------------
         */
        
        /*
         * Data sources binded
         */
        if (this.sourceAtt) {    
            //checkboxHtml.unbind('click');
            
            readOnly    = this.att.readOnly;

			/*
            checkboxHtml.bind('click', {widget : this}, function(e) {
                var
                value;

                if (widget._checked) {
                    value = true;
                } else {
                    value = false;
                }

                e.data.widget._changeDsValue(value);
            })
			*/


            if (readOnly) {
                htmlObject.disabled = true;
            } else {
                htmlObject.disabled = false;
            }
            /*
             * Save value if binding "in" is defined
             */
            this.sourceAtt.addListener(function(e) {
                var 
                widget,
                widgetID,
                htmlObject,
                checkboxHtml,
                value;
                    
                widget          = e.data.widget;
                widgetID        = widget.id;
                htmlObject      = $('#' + widgetID);
                checkboxHtml    = htmlObject.find('input');
                
                widget.clearErrorMessage();                    
                    
                if (checkboxHtml.length > 0) {
                    value = widget.sourceAtt.getValue();      

                    if (!value || value === 'false') {
						widget._checked = false;
                        checkboxHtml[0].checked = false;
                        checkboxHtml.attr('checked', false);    
                        widget.removeState('selected');    
                        widget.setState('default');
                    } else {
                        checkboxHtml[0].checked = true;
						widget._checked = true;
                        checkboxHtml.attr('checked', 'checked');      
                        widget.setState('selected', true);
                    }
                }
            }, {
                listenerID      : config.id,
                id      : config.id,
                listenerType    : 'checkBox',
                subID           : config.subID ? config.subID : null
            },{
                widget  : this
            });
        }
    }, {   
        /**
          * Change the associated ds attribute value
          * @function _changeDsValue
          * @param {boolean} value
          */ 
        _changeDsValue : function(value) {
            var 
            widget,
            sourceAtt;

            checkboxHtml = this.$domNode.find('input');

            if (this.sourceAtt && !this.isDisabled()) {
                sourceAtt   = this.source.getAttribute(this.att.name);

                sourceAtt.setValue(value, {
                    dispatcherID: this.id
                });

                this.clearErrorMessage();
            }
        },

        /**
         * Check the checkbox
         * @method check
         */
        check : function checkbox_check() {    
            var
            htmlObject,
            checkboxHtml;

            if (this._checked !== true) {
                this._checked = true;

                htmlObject      = this.$domNode
                checkboxHtml    = htmlObject.find('input');
                
                htmlObject.removeClass("waf-state-active");
                
                htmlObject.addClass('waf-state-selected');
                
                checkboxHtml.attr('checked', 'checked');

                this.$domNode.trigger('change');

                this._changeDsValue(true);
            }            
        },
        
        /**
         * Uncheck the checkbox
         * @method uncheck
         * @param updateDs
         */
        uncheck : function checkbox_uncheck(updateDs) {    
            var
            htmlObject,
            checkboxHtml;

            if (this._checked !== false) {
    			this._checked = false;			

                htmlObject      = this.$domNode
                checkboxHtml    = htmlObject.find('input');
                
                htmlObject.removeClass("waf-state-active");
            
                htmlObject.removeClass('waf-state-selected');            
                
                checkboxHtml.attr('checked', false);

                this.$domNode.trigger('change');

                if (updateDs !== false) {
                    this._changeDsValue(false);
                }
            }
        },
        
        /**
         * Check or uncheck the checkbox
         * @method toggleCheckbox
         */
        toggleCheckbox : function checkbox_toggle_checkbox() {
            var
            htmlObject,
            checkboxHtml;
            
            htmlObject      = this.$domNode
            checkboxHtml    = htmlObject.find('input');
            
            if (this._checked) {
                this.uncheck();
            } else {
                this.check();
            }

            /*
             * Trigger on change event
             */
            // this.$domNode.trigger('change');
        },
        
        /**
         * Custom getValue function
         * @method getValue
         * @return {boolean}
         */
        getValue : function checkbox_get_value() {
			return this._checked;
        },

        disable: function() {
            this.$domNode.find('input').attr('disabled', 'disabled');
            WAF.Widget.prototype.disable.call(this);
            this.$domNode.addClass('waf-state-disabled');
        },

        enable: function() {
            this.$domNode.find('input').attr('disabled', false);
            WAF.Widget.prototype.enable.call(this);
            this.$domNode.removeClass('waf-state-disabled');
        },

        /**
         * Custom setValue function
         * @method getValue
         */
        setValue : function checkbox_set_value(value) {
            if (value) {
                this.check();
            } else {
                this.uncheck();
            }

            /*
             * Trigger on change event
             */
            //this.$domNode.trigger('change');
        },

        /**
         * Custom clear function
         * @method clear
         * @param updateDs
         */
        clear : function checkbox_clear(updateDs) {
            this.uncheck(updateDs);
        }
    }
);