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
    'SwitchBox',
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
        checkboxHtml,
        readOnly,
        icon,
        theme,
        themes,
        definedTheme,
        classes,
        htmlObject,
        imgHtml,
        icons,
        cssClass,
        contSize,
        slideObject,
        that    = this,
        xValue  = null,
        hasMove = false;

        this.lastValue = false;

        config      = config || {};

        htmlObject  = $(this.containerNode);
        classes     = htmlObject.prop('class');
        themes      = [];

        if (config["data-off"] === null) {
            config["data-off"] = "";
        }

        if (config["data-on"] === null) {
            config["data-on"] = "";
        }

        checkboxHtml = "<div class='waf-switchbox-container'><div class='waf-switchbox-on'><span class='waf-switchbox-label-on'>"+config["data-on"]+"</span></div><div class='waf-switchbox-switch'></div><div class='waf-switchbox-off'><span class='waf-switchbox-label-off'>"+config["data-off"]+"</span></div></div>";
        htmlObject.html(checkboxHtml);

        slideObject = htmlObject.find(".waf-switchbox-container");
        offObject   = htmlObject.find(".waf-switchbox-off");
        onObject    = htmlObject.find(".waf-switchbox-on");
		// console.log(htmlObject, htmlObject[0], htmlObject[0].offsetWidth, htmlObject[0].offsetWidth/1.6);
        // contSize    = Math.round(htmlObject[0].offsetWidth/1.6);
        contSize    = Math.round(htmlObject.outerWidth()/1.6);
		// console.log(htmlObject[0].offsetWidth, htmlObject[0].offsetWidth/1.6, Math.round(htmlObject[0].offsetWidth/1.6));
	    // console.log(htmlObject.outerWidth(), htmlObject.outerWidth()/1.6, Math.round(htmlObject.outerWidth()/1.6));

        // slideObject.css("width", slideObject.get()[0].offsetWidth+"px");
        slideObject.css("width", slideObject.width() + "px");
		// console.log(slideObject.get()[0].offsetWidth+"px", slideObject.outerWidth() + "px");

        this.slide = function slide(goToState, noSlideEffect) {
                var
                pos     = Math.abs(parseInt(slideObject.css("margin-left"))),
                newPos,
                state   = true;

                xValue = null;

                if (hasMove) {
                    hasMove = false;
                    if (pos != contSize && pos != 0) {
                        if (pos > (contSize+2)/2) {
                            newPos = contSize;
                        } else {
                            newPos = 0;
                        }
                    }
                } else {

                    if (typeof(goToState) != "undefined") {
                        if (!goToState) {
                            newPos = contSize;
                        } else {
                            newPos = 0;
                        }

                    } else {
                        if (pos === 0) {
                            newPos = contSize;
                        } else {
                            newPos = 0;
                        }
                    }
                }

                if (newPos === contSize) {
                    state = false;
                }

                this.lastValue = state;

                if (typeof(goToState) === "undefined" && that.sourceAtt) {
                    updateDataState(state);
                }

                if (noSlideEffect) {
                    slideObject.css("margin-left", -newPos+"px");
                } else {
                    slideObject.animate({
                        marginLeft: -newPos+"px"
                        },
                        300, function() {

                        }
                    );
                }
        }

        /*
        * Check the box if checked is true
        */
        if(data.checked === 'false' || data.checked === null) {
            this.slide( false, true, false );
        }

        if (!WAF.PLATFORM.isTouch) {

             /*
             * ------------ <MOUSE EVENTS> ------------
             * To change status
             */
             htmlObject.find(".waf-switchbox-switch").bind('click',function(e){
                 that.slide();
             });

             offObject.bind('click',function(e){
                 that.slide();
             });

             onObject.bind('click',function(e){
                 that.slide();
             });

        } else {

            /*
            * ------------ <TOUCH EVENTS> ------------
            * To change status
            */

            htmlObject.find(".waf-switchbox-switch").bind('touchmove',function(e) {
                hasMove = true;
                e.preventDefault();
                var
                touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0],
                diff,
                currentMarginLeft,
                newPos;

                diff = xValue - touch.pageX;
                xValue = touch.pageX;

                currentMarginLeft = Math.abs(parseInt(slideObject.css("margin-left"))) ;
                newPos = currentMarginLeft + diff;

                if (newPos < contSize+1 && newPos > -1) {
                    slideObject.css("margin-left", -newPos+"px");
                }
            });

            htmlObject.find(".waf-switchbox-switch").bind('touchstart',function(e){
                xValue = e.originalEvent.touches[0].pageX;
            });

            htmlObject.find(".waf-switchbox-switch").bind('touchend',function(e){
                that.slide();
            });

            offObject.bind('touchend',function(e){
                that.slide();
            });

            onObject.bind('touchend',function(e){
                that.slide();
            });

         }



        function updateDataState(state) {
            var
            widget,
            sourceAtt,
            value;

            widget      = WAF.widgets[config.id];
            sourceAtt   = widget.source.getAttribute(widget.att.name);
            value       = '';

            /*if(state) {
                value = sourceAtt.normalize('true');
            } else {
                value = sourceAtt.normalize('false');
            }*/

            sourceAtt.setValue(state, {
                dispatcherID: config.id
            });

            widget.clearErrorMessage();

        }
        /*
         * Data sources binded
         */
        if (that.sourceAtt) {
           /*
           * Save value if binding "in" is defined
           */
           that.sourceAtt.addListener(function(e) {
                var
                widget,
                widgetID,
                htmlObject,
                checkboxHtml,
                value;

                widget          = e.data.widget;
                widgetID        = widget.id;
                htmlObject      = $('#' + widgetID);

                this.htmlObject = htmlObject;

                widget.clearErrorMessage();

                    value = widget.sourceAtt.getValue();

                    if (!value || value === 'false') {
                       that.slide(false);
                    } else {
                       that.slide(true);
                    }
            }, {
                id: config.id,
                listenerID      : config.id,
                listenerType    : 'checkBox',
                subID           : config.subID ? config.subID : null
            },{
                widget  : this
            });
        }
    }, {
        /**
        * setValue
        *
        * @/shared
        * @/method setValue
        **/
        setValue: function setValue(param) {
            var value = this.getValue();

            if (!this.isDisabled() && typeof(param) != 'undefined') {
                if (param === true) {
                    this.slide(true);
                    value = true;
                }
                if (param === false) {
                    this.slide(false);
                    value = false;
                }
            }

            return value;
        },
        /**
        * toggleSlide
        *
        * @/shared
        * @/method toggleSlide
        **/
        toggleSlide: function toggleSlide() {
            this.slide();
        },
        /**
        * getValue
        *
        * @/shared
        * @/method getValue
        **/
        getValue: function getValue() {

            /*var margin = parseInt($("#" + this.id).find(".waf-switchbox-container").css("margin-left")),
                value = false;

            if (margin === 0) {
                value = true;
            }*/

            return this.lastValue;
        },
        disable: function() {
            var cont = $("#" + this.id);
            cont.addClass("waf-state-disabled");
            cont.find('input[type=checkbox]').attr('disabled', 'disabled');
            cont.css("opacity", "0.5").css("pointer-events", "none");
        },
        enable: function() {
            var cont = $("#" + this.id);
            cont.removeClass("waf-state-disabled");
            cont.find('input[type=checkbox]').removeAttr('disabled');
            cont.css("opacity", "1").css("pointer-events", "auto");
        }
    }
);
