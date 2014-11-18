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
WAF.Widget.provide(/**
 *
 * @class TODO: give a name to this class (ex: WAF.widget.DataGrid)
 * @extends WAF.Widget
 */
    'TextField', {}, /**
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
    function WAFWidget(config, data, shared){
        var that, htmlObject;

        that = this;
        htmlObject = $(this.containerNode);

        /*
	 * To prevent browser input autofill
	 */
        htmlObject.prop("name", that.id + parseInt(Math.random() * 100000));


        /*
	 * Add placeholder if specified (simultating it if needed
	 */
        if (config['placeholder'] !== undefined) {
            htmlObject.attr('placeholder', config['placeholder']);

            // simulates placeholder if needed
            if (WAF.PLATFORM.html5Support[this.domNode.tagName.toLowerCase()]['placeholder'] === false) {

                // html5 schim for feature-less browsers (ie: IE9)
                htmlObject.focus(function() {
                    var input = $(this);

                    if (input.val() == input.attr('placeholder')) {
                        input.val('');
                    }
                }).blur(function() {
                    var input = $(this);
                    if (input.val() == '' || input.val() == input.attr('placeholder')) {
                        input.val(input.attr('placeholder'));
                    }
                }).blur();

                $('[placeholder]').parents('form').submit(function() {
                    $(this).find('[placeholder]').each(function() {
                        var input = $(this);
                        if (input.val() == input.attr('placeholder')) {
                            input.val('');
                        }
                    })
                });
            }	// /placeholder
        }

        /*
	 * Transform somes value into boolean
	 */
        data['datapicker-on'] = WAF.utils.getBoolValue(data['datapicker-on']);
        data['datapicker-icon-only'] = WAF.utils.getBoolValue(data['datapicker-icon-only']);
        data['password'] = WAF.utils.getBoolValue(data['password']);
        data['readOnly'] = WAF.utils.getBoolValue(data['readOnly']);

        var dataTheme = htmlObject.data("theme");
        if (dataTheme == null || dataTheme == "") {
            dataTheme = "";
            var existingClasses = htmlObject.prop('class');
            existingClasses.split(" ").forEach(function(className){
                if (className != "inherit" && className.substr(0, 4) != "waf-") {
                    dataTheme += className + " ";
                }
            });
        }

        htmlObject.attr('readOnly', data['readOnly'] || false);
        /*
	 * ------------ <MOUSE EVENTS> ------------
	 * To change status
	 */
        htmlObject.hover(function(){
            if (that.getState() != 'focus') {
                that.setState('hover');
            }

        }, function(){
            if (that.getState() == 'focus') {
                that.setState('focus');
            } else {
                that.setState('default');
            }
        });

        htmlObject.unbind('focusin');
        htmlObject.unbind('focusout');

        htmlObject.bind('focusin', {}, function(e){
            that.setState('focus');
        });

        htmlObject.bind('focusout', {}, function(e){
            that.removeState('focus');
        });
        /*
	 * ------------ </MOUSE EVENTS> ------------
	 */
        /*
	 * Set input as password field if defined
	 */
        if (data.password) {
            document.getElementById(config.id).setAttribute('type', 'password');
        }

        /*
	 * If widget is binded
	 */
        var text, widget, widgetID, items, enumValueList, mustAutoComplete, dateOptions, autoCompleteWidget, dateIcon, htmlObject, isParentMatrix, dateIconLeft;

        widget = that;
        widgetID = widget.id;
        enumValueList = [];
        htmlObject = $('#' + widgetID);

        if (this.sourceAtt) {
            this.sourceAtt.addListener(function(e){
                var widget = e.data.widget;
                var widgetID = widget.id;
                var htmlObject = $('#' + widgetID);
                widget.clearErrorMessage();

                /*
			 * change input type for mobile depending on attribute's type
			 */
                if (WAF.PLATFORM.isTouch) {
                    switch (widget.att.type) {
                        case "date":
                            if (WAF.PLATFORM.OS === "iOs" && WAF.PLATFORM.OSVersion >= 5 && config["data-datapicker-on"] === "true") {
                                htmlObject.get()[0].type = "date";
                            }
                            else if (config["data-datapicker-on"] === "true" && htmlObject.scroller) {

                                $.scroller.settings.dateOrder = "ddmmyy";
                                $.scroller.settings.dateFormat = "dd/mm/yy";

                                htmlObject.scroller();
                            }
                            break;
                        default:
                    }
                }

                /*
			 * Set the value
			 */
                if (!widget.att.simple) {
                    text = "";

                    // case of dataSource var/array/object

                    if (widget && widget.source && widget.source._private && widget.source._private.sourceType &&
                        (widget.source._private.sourceType == 'scalar' || widget.source._private.sourceType == 'array' || widget.source._private.sourceType == 'object')) {
                        if (widget.isInFocus) {
                            text = widget.sourceAtt.getValueForInput();
                        }
                        else {
                            text = widget.getFormattedValue();
                        }
                    }

                }
                else {
                    if (widget.isInFocus) {
                        text = widget.sourceAtt.getValueForInput();
                    }
                    else {
                        text = widget.getFormattedValue();
                    }
                }

                /*
			 *  specific task if mobile & date
			 */
                if (widget.att.type === 'date' && WAF.PLATFORM.isTouch && WAF.PLATFORM.OS === "iOs" && WAF.PLATFORM.OSVersion >= 5 && config["data-datapicker-on"] === "true") {
                    var date = new Date(text), y = date.getFullYear(), d = date.getDate(), m = date.getMonth() + 1;

                    if (d < 10) {
                        d = "0" + d;
                    }

                    if (m < 10) {
                        m = "0" + m;
                    }

                    text = y + "-" + m + "-" + d;
                }

                htmlObject.val(text);

            }, {
                id: config.id,
                listenerID: config.id,
                listenerType: 'textInput',
                subID: config.subID ? config.subID : null
            }, {
                widget: this
            });

            // end of onAttributeChange
            isParentMatrix = htmlObject.parents('.waf-matrix');

            if (widget.att.enumeration != null && !widget.att.readOnly && !widget.sourceAtt.readOnly) {
                items = widget.att.enumeration.item;

                for (var i = 0, nb = items.length; i < nb; i++) {
                    enumValueList.push(items[i].name);
                }
            }

            mustAutoComplete = WAF.utils.getBoolValue(data.autocomplete);

            if (enumValueList.length > 0) {
                if (isParentMatrix.length == 0 || (typeof e != 'undefined' && e.subID && isParentMatrix.length != 0)) {
                    htmlObject.data('enumValueList', enumValueList).autocomplete({
                        source: function(request, response){
                            response($.grep($(this.element.context).data('enumValueList'), function(item, index){
                                return item.toLowerCase().indexOf(request.term.toLowerCase()) === 0;
                            }));
                        }

                    });

                    autoCompleteWidget = htmlObject.autocomplete('widget');

                    if (isParentMatrix.length == 0) {
                        htmlObject.blur(that.autocompleteBlur);
                    }
                }

            }
            else if (mustAutoComplete) {
                if (isParentMatrix.length == 0 || (typeof e != 'undefined' && e.subID && isParentMatrix.length != 0)) {
                    htmlObject.autocomplete({
                        source: function(request, response){
                            var url = '/rest/' + widget.source.getDataClass().getName() + '/' + widget.att.name;

                            $.ajax({
                                url: url,
                                data:{
                                    "$distinct" : true,
                                    "$top"      : 20,
                                    "$filter"   : '"' + widget.att.name + '=:1' + '"',
                                    "$params"   : "'"+JSON.stringify([request.term+'*'])+"'"
                                },
                                success: function(data){
                                    response($.map(data, function(item){
                                        return {
                                            value: item
                                        }
                                    }));
                                }

                            });
                        }

                    });

                    autoCompleteWidget = htmlObject.autocomplete('widget');
                    autoCompleteWidget.addClass(dataTheme);

                    if (isParentMatrix.length == 0) {
                        htmlObject.blur(that.autocompleteBlur);
                    }
                }

            /*
			 * case of calendar
			 */
            }
            else {
                if (widget.att.type == 'date') {
                    var lang = WAF.utils.getBrowserLang();
                    dateOptions = $.datepicker.regional[lang] || {};
                    $.datepicker.setDefaults(dateOptions);
                    var dateInputFormat = dateOptions.dateFormat || "m/d/yy";

                    dateOptions.changeMonth = true;
                    dateOptions.changeYear = true;

                    if (data['datapicker-on']) {
                        if (!WAF.PLATFORM.isTouch || WAF.PLATFORM.OS != "iOs") {
                            /*
						 * If icon only active => add calendar button
						 */
                            if (data['datapicker-icon-only']) {
                                dateOptions.showOn = "button";
                                dateOptions.buttonImage = "/waLib/WAF/widget/png/date-picker-trigger.png?id=" + widgetID;
                                dateOptions.buttonImageOnly = true;
                            }
                            else {
                                dateOptions.buttonImageOnly = false;
                                dateOptions.showOn = "focus";
                            }

                            dateOptions.beforeShow = function() {
                                // hack to force the z-index of the datepicker to be the z-index of the container of the textField + 1
                                setTimeout(function(){
                                    var p = htmlObject;
                                    while(p.parent().get(0) !== document.body)
                                        p = p.parent();
//                                    $('#ui-datepicker-div').css('z-index', parseFloat(p.css('z-index')) + 1);
                                    $('#ui-datepicker-div').css('z-index', 99);
                                }, 0);

                                // do not display the datePicker if the textField is readOnly
                                if (typeof htmlObject.attr('readonly') !== 'undefined' || widget.isDisabled()) {
                                    return false;
                                } else {
                                    return true;
                                }
                            };

                            dateOptions.onClose = function(dateText, inst){
                                var value, sourceAtt;

                                if (widget.format != null && widget.format.format != null) {
                                    sourceAtt = widget.sourceAtt;
                                    if (sourceAtt != null) {
                                        value = sourceAtt.getValue();
                                    }

                                    this.value = widget.getFormattedValue(value);
                                }
                                widget.$domNode.trigger('change');
                            };

                            dateOptions.onSelect = function(dateText, inst){};


                            /*
						 * Fix bug on calendar on textfield into a matrix
						 */
                            if (isParentMatrix.length == 0 || (typeof e != 'undefined' && e.subID && isParentMatrix.length != 0)) {
                                htmlObject.datepicker(dateOptions);
                                htmlObject.datepicker("widget").addClass(dataTheme);
                            }

                            /*
						 * Get linked calendar button
						 */
                            if (data['datapicker-icon-only'] && htmlObject[0]) {
                                dateIcon = $('img[src="/waLib/WAF/widget/png/date-picker-trigger.png?id=' + widgetID + '"]');

                                dateIconLeft = htmlObject.position().left + htmlObject[0].offsetWidth;

                                dateIcon.css({
                                    'position': 'absolute',
                                    'left': dateIconLeft + 'px',
                                    'top': htmlObject.css('top'),
                                    'cursor': 'pointer'
                                });
                            }
                        }
                    }
                }
            }

            /*
		 * Set the same as the htmlobject css to the autocomplete
		 */
            if (autoCompleteWidget != null) {
                ["font-family", "font-size", "font-style", "font-variant", "font-weight", "text-align", "letter-spacing", "background-color", "color"].forEach(function(elem){
                    autoCompleteWidget.css(elem, htmlObject.css(elem));
                });
            }

            /*
		 * Change datasource value on change event
		 */
            htmlObject.unbind('change', that.change)
            htmlObject.bind('change', {}, that.change);
            if (WAF.PLATFORM.isTouch && widget.att.type === 'date') {
                htmlObject.unbind('blur', that.blur)
                htmlObject.bind('blur', {}, that.blur);
            }

            /*
		 * Remove formatted value on focus
		 */
            htmlObject.bind('focus', function(event){
                var widget, sourceAtt;

                widget = WAF.widgets[this.id];
                widget.isInFocus = true;

                if (widget.format != null && widget.format.format != null) {
                    sourceAtt = widget.sourceAtt;

                    if (sourceAtt != null) {

                        /*
					 * change input type for mobile depending on attribute's type just before editing
					 */
                        if (WAF.PLATFORM.isTouch) {
                            switch (widget.att.type) {
                                case "number":
                                    htmlObject.get()[0].type = "number";
                                    break;
                                default:
                            }
                        }


                        this.value = sourceAtt.getValueForInput();
                    }
                }
            });

            /*
		 * Reset formatted value on blur
		 */
            htmlObject.bind('blur', function(event){
                var widget, value, sourceAtt;

                widget = WAF.widgets[this.id];
                value = '';

                widget.isInFocus = false;

                if (widget.format != null && widget.format.format != null) {
                    sourceAtt = widget.sourceAtt;
                    if (sourceAtt != null) {
                        value = sourceAtt.getValue();
                    }

                    /*
				 * change back input type for mobile depending on attribute's type after edition
				 */
                    if (WAF.PLATFORM.isTouch) {
                        switch (widget.att.type) {
                            case "number":
                                htmlObject.get()[0].type = "text";
                                break;
                            default:
                        }
                    }

                    this.value = widget.getFormattedValue(value);
                }
            });

            /*
		 * Active/Desactive input depending on readOnly attribute
		 */

            if (widget.att.readOnly || widget.sourceAtt.readOnly) {
                htmlObject.disabled = true;
            }
            else {
                htmlObject.disabled = false;
            }

        }
        else {

            this._tmpVal = htmlObject.prop('value');
            if (this._tmpVal && this._tmpVal.replace()) {
                this._tmpVal = this._tmpVal.replace(/&quot;/g, '"');
            }
            text = this.getFormattedValue(htmlObject.val());
            if (text && text.replace()) {
                text = text.replace(/&quot;/g, '"');
            }
            htmlObject.val(text);

            htmlObject.focusin(function(){
                if (that._tmpVal) {
                    $(this).val(that._tmpVal);
                }
            });

            htmlObject.focusout(function(){
                that._tmpVal = $(this).val();
                if (that._tmpVal) {
                    $(this).val(that.getFormattedValue(that._tmpVal));
                }
            });
        }
    }, {
        /*
	 * TextField widget blur event function for Mobile
	 */
        blur: function(){

            WAF.widgets[this.id].change();

        },

        /*
	 * TextField widget change event function
	 */
        change: function(){
            var widget, value, sourceAtt, validation, str, dtObj, y, m, d;

            widget = WAF.widgets[this.id];

            if (widget != null) {
                if (widget.doNotUpdate) {
                    widget.doNotUpdate = false;
                }
                else {
                    sourceAtt = widget.sourceAtt;

                    if (WAF.PLATFORM.isTouch && widget.att.type === "date") {

                        str = document.getElementById(this.id).value.replace(/[\/\-]/gi, "!");
                        dtObj = str.split('!');

                        if (dtObj.length === 3) {
                            if (dtObj[0].length === 4) {
                                y = dtObj[0];
                                m = dtObj[1];
                                d = dtObj[2];
                            } else {
                                y = dtObj[2];
                                m = dtObj[1];
                                d = dtObj[0];
                            }
                            var date = new Date(y, (m - 1), d);
                        }

                        value = sourceAtt.normalize(date);

                    } else {
                        value = sourceAtt.normalize(this.value);
                    }

                    validation = sourceAtt.validate(value);

                    if (validation.valid) {

                        if (WAF.PLATFORM.isTouch) {

                            //window.setTimeout(function(){ rm setTimeOut for WAK0089554

                                sourceAtt.setValue(value, {
                                    dispatcherID: widget.divID
                                });
                                widget.clearErrorMessage();

                            //},0);

                        } else {

                            sourceAtt.setValue(value, {
                                dispatcherID: widget.divID
                            });
                            widget.clearErrorMessage();

                        }

                    }
                    else {
                        sourceAtt.setValue(value, {
                            dispatcherID: widget.divID
                        });
                        widget.setErrorMessage({
                            message: validation.messages.join(", "),
                            tooltip: false
                        });
                    }
                }


            }
        },

        /*
	 * TextField autocomplete widget blur event function
	 */
        autocompleteBlur: function(event){
            var widget, sourceAtt;

            widget = WAF.widgets[this.id];
            sourceAtt = widget.sourceAtt;

            if (this.value !== sourceAtt.getValue()) {
                sourceAtt.setValue(this.value, {
                    dispatcherID: this.id
                });
            }
        },

        /**
	 * Custom setValue
	 * @param {string} value new value
	 */
        setValue : function (value) {
            this.$domNode.val(value);
            this._tmpVal = value;
            /*
    	     * Trigger change event
    	     */
            this.$domNode.trigger('change');
        }

    });

