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
//// "use strict";

/*global WAF,window*/

/*jslint white: true, browser: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */

WAF.Widget.provide(
    'Calendar', // TODO: set the widget constructor name in CamelCase (ex: "DataGrid")
    {
        
    },
    function WAFWidget(config, data, shared) {
        var
        that,
        sourceAtt,
        htmlObject;
        
        that        = this;
        htmlObject  = that.$domNode;
        sourceAtt   = this.sourceAtt;
        
        htmlObject.DatePicker({
            flat        : true,
            format      : config['data-format']?config['data-format']:"dd/mm/yy",
            date        : config['data-mode'] == "single"?"":[],
            calendars   : config['data-calendars'],
            mode        : config['data-mode'],
            starts      : isNaN(parseInt(config['data-start'])) ? 1 : parseInt(config['data-start']),
            onChange: function(formated , dates) {
                if(sourceAtt){
                    sourceAtt.setValue(that.getValue());
                    
                    if(config['data-save'] === 'true' && !(that._changeFromDs)){
                        that.source.save();
                    }
                }
                
                that.events && that.events.onChange && that.events.onChange({
                    formatted : formated , 
                    dates : dates
                });
            },
            onShow : function(){
                that.events && that.events.onShow && that.events.onShow(arguments);
                that._update_size();
            },
            onBeforeShow : function(){
                that.events && that.events.onBeforeShow && that.events.onBeforeShow(arguments)
            },
            onHide : function(){
                that.events && that.events.onHide && that.events.onHide(arguments)
            },
            onViewChange : function(e){
                that._update_size();
            }
        });
        
        htmlObject.bind({
            'click': function(ev){
                if(this._clicktime){
                    if(new Date() - this._clicktime < 300){
                        $(this).trigger('dblclick');
                    }
                    
                    delete this._clicktime;
                }else{
                    this._clicktime = new Date();
                }
                return false;
            }
        });
        
        if (sourceAtt) {
            sourceAtt.addListener(function(e) {
                var
                widget;
                
                widget  = e.data.widget;
                
                if(widget._modified){
                    widget._modified = false;
                    return;
                }
                
                if(sourceAtt.getValue() && sourceAtt.getValue().getTime() != widget.getValue().getTime()){
                    that._changeFromDs = true;
                    widget.setValue(sourceAtt.getValue() , true);
                    that._changeFromDs = false;
                }
            },{
                id: config.id
            },{
                widget:this
            });
        } else {
            this.setValue(Date.now(), true);	
        }
    },          
    {
        _getDatePicker : function(){
            return this.$domNode;
        },
        _getDatePickerData : function(){
            var
            htmlObj;
            
            htmlObj = this._getDatePicker();
            
            if(htmlObj){
                return htmlObj.children('.datepicker').data('datepicker');
            }
            
            return htmlObj;
        },
        _prepareDate : function (options) {
            var tmp, that = this;
            if (options.mode == 'single') {
                tmp = new Date(options.date);
                return [that._formatDate(tmp, options.format), tmp, options.el];
            } else {
                tmp = [[],[], options.el];
                $.each(options.date, function(nr, val){
                    var date = new Date(val);
                    tmp[0].push(that._formatDate(date, options.format));
                    tmp[1].push(date);
                });
                return tmp;
            }
        },
        _formatDate : function(date, format) {
            return $.datepicker.formatDate(format, date);
        },
        _update_size : function(){
            var
            htmlObj,
            datepicker,
            dpContainer;
            
            htmlObj     = this.$domNode;
            datepicker  = htmlObj.find('.datepicker');
            dpContainer = datepicker.find('.datepickerContainer');
            
            htmlObj.height($(dpContainer.find('tr').get(0)).height() + datepicker.find('.datepickerBorderT').height() + datepicker.find('.datepickerBorderB').height());
            htmlObj.width($(dpContainer.find('tr').get(0)).width() + datepicker.find('.datepickerBorderL').width() + datepicker.find('.datepickerBorderR').width());
        },
        _getCalOptions : function(){
            var
            cal,
            htmlObj;
            
            htmlObj = this._getDatePicker();
            cal     = $('#' + htmlObj.data('datepickerId'));
            
            return cal.data('datepicker');
        },
        setValue : function(date , shiftTo){
            var
            data,
            htmlObj;
            
            if(date == null){
                this.clear();
                return;
            }
            
            htmlObj = this._getDatePicker();
            shiftTo = shiftTo == null ? true : shiftTo;
            
            data    = this._getDatePickerData();
            
            if(htmlObj){
                htmlObj.DatePickerSetDate(date, shiftTo);
                data.onChange.apply(htmlObj.children('.datepicker'), this._prepareDate(data));
            }
        },
        getValue : function(formated){
            var
            htmlObj;
            
            htmlObj = this._getDatePicker();
            
            if(htmlObj){
                return htmlObj.DatePickerGetDate(formated);
            }
            
            return htmlObj;
        },
        show : function(state){
            var
            hide,
            htmlObj;
            
            htmlObj = this._getDatePicker();
            hide    = state === false;
            
            if(htmlObj){
                var doIt = (hide && htmlObj.is(':visible')) || (!hide && !htmlObj.is(':visible'));
                
                if(doIt){
                    this.$domNode[hide?'hide':'show']();
                    htmlObj[hide?'DatePickerHide':'DatePickerShow']();
                    
                    // Fix bug WAK0081427
                    if(hide){
                        $('#' + $(htmlObj).data('datepickerId')).data('datepicker').onHide($(this))
                    }
                }
            }
            
            this.getLabel() && this.getLabel()[hide?'hide':'show']();
        },
        hide : function(state){
            this.show(false);
        },
        clear : function(){
            var
            htmlObj;
            
            htmlObj = this._getDatePicker();
            
            if(htmlObj){
                var
                opts;
            
                opts    = this._getCalOptions();
                
                if(opts.mode != 'single'){
                    htmlObj.DatePickerClear();
                }
                else{
                    opts.date = null;
                    htmlObj.find('.datepickerSelected').removeClass('datepickerSelected');
                }
            }
        },
        getSelectionMode : function(){
            var
            data;
            
            data = this._getDatePickerData();
            return data.mode;
        }
    }
    );
