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

    /**
     * WAF Menu widget
     *
     * @class WAF.widget.Menu
     * @extends WAF.Widget
     */
    'MenuItem',


    {
        // Shared private properties and methods
        // NOTE: "this" is NOT available in this context


    },

    /**
     * @constructor
     * @param {Object} inConfig configuration of the widget
     */

    /**
     * The constructor of the widget
     *
     * @property constructor
     * @type Function
     * @default WAF.widget.GoogleMap
     **/
    function (inConfig, inData, shared) {
        var
        htmlObject,
        height,
        width,
        paragraphe,
        padding,
        fnShow,
        fnHide,
        subMenuShow,
        parentSubMenuShow,
        parentBars,
        except,
        objHtmlText,
        widget,
        exceptItem;

        widget              = this;
        htmlObject          = $(this.containerNode);

        parentBars          = htmlObject.parents('.waf-menuBar');
        objHtmlText         = htmlObject.children('.waf-menuItem-text');
        height              = htmlObject.outerHeight();
        width               = htmlObject.outerWidth();
        paragraphe          = htmlObject.children('p');
        padding             = parseInt(htmlObject.css('padding-left'), 10);

        width               = (parseInt(width, 10) - (padding*2));
        height              = (parseInt(height, 10) - (padding*2));
        subMenuShow         = $(parentBars[parentBars.length - 1]).attr('data-subMenuShow');

        /*
        * force event type for mobile
        */
        if (WAF.PLATFORM.type !== "desktop") {
            subMenuShow = "click";
        }

        if (inData.theme) {
           htmlObject.addClass(inData.theme);
        }

        paragraphe.css({
            height  : height + 'px',
            width   : width + 'px'
        });

        // objHtmlText.html() && objHtmlText.html(objHtmlText.html().replace(/\n/g, '<br/>'));

        // Setting the theme
        if (inData.theme) {
           htmlObject.addClass(inData.theme);
        }

        /**
         * Display a submenu
         */

        fnShow = function fnShow (e) {
            var
            that,
            ul;

            that    = $(this);
            ul      = that.children('ul');

            /*
             * Prevent script execution if disabled
             */
            if (widget.isDisabled()) {
                return false;
            }

            if (e.type === 'click') {

                except      = '';
                exceptItem  = '';

                $('#' + widget.getParent().id +' .waf-menuItem .waf-menuBar').each(function(){
                    var thisBarId = $(this).prop('id');

                    parentBars.each(function() {
                        var thatElt = $(this);
                        if (thatElt.prop('id') === thisBarId) {
                            except += '[id!=' + thisBarId + ']';
                            exceptItem += '[id!=' + thatElt.parent().prop('id') + ']';
                        }
                    })
                });

                $('#' + widget.getParent().id +' .waf-menuItem .waf-menuBar' + except + '').fadeOut(200);
                $('#' + widget.getParent().id +' .waf-menuItem' + exceptItem + '').removeClass('waf-state-selected');
                that.addClass('waf-state-selected');



            } else {
                !(that.hasClass('waf-state-selected') || that.hasClass('waf-state-active'))  && that.addClass('waf-state-hover');
            }

            $('#' + that.prop('id') + '>ul>li>p').css('width', that.outerWidth() + 'px')

            ul.stop(true, true).fadeIn(100);
        }

        /**
         * Hide a submenu
         */
        fnHide = function fnHide (e) {
            var
            that,
            ul;

            /*
             * Prevent script execution if disabled
             */
            if (widget.isDisabled()) {
                return false;
            }

            that    = $(this);
            ul      = that.children('ul');
            ul.stop(true, true).fadeOut(200);

            if (e.type !== 'click') {
                that.removeClass('waf-state-hover waf-state-active');
            }
        }

        switch (subMenuShow) {
            case 'click' :
                htmlObject.click(fnShow);

                // Add hover class on hover
                htmlObject.hover(
                    function(e){
                        !($(this).hasClass('waf-state-selected') || $(this).hasClass('waf-state-active')) && $(this).addClass('waf-state-hover')
                    },
                    function(e){
                        $(this).removeClass('waf-state-hover')
                    }
                );
                break;

            default :
                htmlObject.mouseenter(fnShow);
                htmlObject.mouseleave(fnHide);
                break;
        }

        /*
         * Active state on mouse down
         */
        htmlObject.bind('mousedown', function(e) {
            var
            widget,
            htmlObject;

            htmlObject  = $(this);

            htmlObject
                .removeClass('waf-state-hover')
                .addClass('waf-state-active');

            e.stopPropagation();
        });

        /*
         * Remve state on mouse down
         */
        htmlObject.bind('mouseup', function(e) {
            var
            widget,
            htmlObject;

            htmlObject  = $(this);

            htmlObject.removeClass('waf-state-active');

            (subMenuShow !== 'click') && htmlObject.addClass('waf-state-hover')
        });

        htmlObject.bind('touchstart click', function(e) {
            var
            id,
            widget,
            htmlObject;

            htmlObject  = $(this);
            id          = htmlObject.prop('id');
            widget      = $$(id);

            htmlObject.parent().children("li").removeClass("waf-state-selected");
            htmlObject.addClass('waf-state-selected');

            if (widget.onClick) {
                widget.onClick();
            }
            e.stopPropagation();
        });
    }, {
        ready : function (argument) {
            var
            richText;

            richText = this.$domNode.children('.waf-richText');

            richText.addClass('waf-menuItem-text');

            /*
             * @DEPRECATED: Remove old paragraphe (paragraphes are deprecated)
             */
            if (richText.length > 0) {
                this.$domNode.find('p').remove();
                if (richText.css('top') != '0px') {
                    richText.css({
                        'top'   : '0px',
                        'left'  : '0px'
                    })
                }
            }
        },

        /**
         * Get the index of the menu item
         * @method getIndex
         * @return {number} index
         */
        getIndex : function menuitem_get_index() {
           return this.$domNode.index();
        },

        /**
         * Change the menu item
         */
        renameMenuItem : function menuitem_rename_menuItem(label) {
            var
            richText;
            richText = this.$domNode.children('.waf-menuItem-text');
            richText.html(label);
        },

        setWidth : function menuitem_set_width(value) {
            var
            tabs,
            menuBar,
            totalWidth,
            menuBarMargin;

            menuBar     = this.getParent();

            /*
             * Set dom node width
             */
            this.$domNode.width(value);

            /*
             * Call resize function
             */
            this._callResizeEvents('stop');

            /*
             * Resize menuItem
             */
            tabs            = menuBar.$domNode.children('.waf-menuItem');
            totalWidth      = 0;
            menuBarMargin   = parseInt(menuBar.config['data-tab-margin']);

            $.each(tabs, function(i){
               totalWidth += tabs.outerWidth();

               if (i != tabs.length-1) {
                    totalWidth += menuBarMargin;
               }


            });
            /*
             * Update only if the size is smaller than total size
             */
            if (totalWidth >= menuBar.getWidth()) {
                menuBar.setWidth(totalWidth);
            }

        }
    }

);
