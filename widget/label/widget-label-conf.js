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
WAF.addWidget({
    packageName: 'Widget/label',
    type: 'label',
    lib: 'WAF',
    description: 'Label',
    category: 'Hidden',
    tag: 'label',
    attributes: [{
            name: 'data-text'
        },
        {
            name: 'data-linked' // DEPRECATED
        },
        {
            name: 'for'
        },
        {
            name: 'data-valign',
            defaultValue: 'middle'
        },
        {
            name: 'data-margin',
            defaultValue: '5'
        }],
    events: [
    ],
    style: [{
            name: 'width',
            defaultValue: '75px'
        },
        {
            name: 'height',
            defaultValue: '22px'
        }],
    onInit: function(config) {
        return new WAF.widget.Label(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var marginAttr = tag.getAttribute('data-margin'),
        margin = marginAttr ? parseInt(marginAttr.getValue()) : 5,
        htmlObject = tag.getHtmlObject(),
        width = tag.getWidth(),
        height = tag.getHeight(),
        minWidth = parseInt(tag.getComputedStyle('min-width')),
        maxWidth = parseInt(tag.getComputedStyle('max-width')),
        linked = tag.getLinkedTag(),
        text = tag.getAttribute('data-text').getValue(),
        labelTextAlign = tag.getComputedStyle('text-align'),
        tmpHtmlObject = null,
        tmpWidth = 0,
        tmpHeight = 0;

        htmlObject.prop('for', tag.getAttribute('for').getValue());
        
        
        /* METHODS */

        /*
         * get/create the temporary html object
         * @method _getTmpHtmlObject
         */
        tag._getTmpHtmlObject = function tag_createTmpHtmlObject(text) {
            var
            tmpHtmlObject;

            if ($('#waf-tmp-div').length > 0) {
                tmpHtmlObject = $('#waf-tmp-div');
            } else {
                tmpHtmlObject = $('<div id="waf-tmp-div">');
            }

            // Set the temporary html object
            tmpHtmlObject.appendTo('body');
            tmpHtmlObject.html(text);

            // Keep the same css as the tags
            tmpHtmlObject.css({
                'font-size': this.getComputedStyle('font-size'),
                'font-style': this.getComputedStyle('font-style'),
                'font-family': this.getComputedStyle('font-family'),
                'font-weight': this.getComputedStyle('font-weight'),
                'text-decoration': this.getComputedStyle('text-decoration'),
                'text-align': this.getComputedStyle('text-align'),
                'letter-spacing': this.getComputedStyle('letter-spacing'),
                'min-width': this.getComputedStyle('min-width'),
                'max-width': this.getComputedStyle('max-width'),
                'position': 'absolute',
                'z-index': '10000',
                'left': '-10000px',
                'top': '-10000px',
                'background': '#FFCC66'
            });

            return tmpHtmlObject;
        };

        /*
         * Refreh the label position depending on the linked widget position
         * @method _refreshPosition
         */
        tag._refreshPosition = function label_refreshPosition() {
            var left = 0,
            top = 0,
            padding = 5,
            linked = this.getLinkedTag(),
            width = this.getWidth(),
            height = this.getHeight(),
            position = -1;


            if (!isNaN(linked.getX()) && !isNaN(linked.getY())) {
                top = linked.getY();
                left = linked.getX();
            }

            position = linked.getAttribute('data-label-position').getValue();
            switch (position) {
                case 'left' :
                    left -= width + margin;
                    break;
                case 'top' :
                    top -= height + margin;
                    break;
                case 'right' :
                    left += linked.getWidth() + padding;
                    break;
                case 'bottom' :
                    top += linked.getHeight() + padding;
                    break;
            }

            if ((position === 'left' || position === 'right') && this.getAttribute('data-valign')) {
                switch (this.getAttribute('data-valign').getValue()) {
                    case 'top' :
                        top = linked.getY();
                        break;
                    case 'middle' :
                        top += (linked.getHeight() / 2) - (height / 2);
                        break;
                    case 'bottom' :
                        top = linked.getY() + linked.getHeight() - height;
                        break;
                }
            }

            if ((position === 'top' || position === 'bottom') && labelTextAlign) {
                switch (labelTextAlign) {
                    case 'center' :
                        left += (linked.getWidth() / 2) - (width / 2);
                        break;
                    case 'right' :
                        left = linked.getX() + linked.getWidth() - width;
                        break;
                }
            }

            this.setXY(left, top);
            this.setStyle('width', width + 'px');
            this.setStyle('height', height + 'px');

            if (linked.isFitToLeft()) {
                this.setStyle('left', left + 'px');
            }
            if (linked.isFitToTop()) {
                this.setStyle('top', top + 'px');
            }

            this.refreshPositionWithConstraints();

            if (isResize) {
                this.domUpdate();
            }
        };

        /**
         * Refresh position with contraints
         * @method refreshPositionWithConstraints
         */
        tag.refreshPositionWithConstraints = function refreshPositionWithConstraints() {
            var pos = null, obj = {}, domElt,
            linked = this.getLinkedTag(),
            parentElt = this.getParent(),
            parentBorder = 0,
            borderRight,
            borderLeft,
            borderTop,
            borderBottom,
            borderRightTmp,
            borderLeftTmp,
            borderTopTmp,
            borderBottomTmp,
            borderRightLeft,
            borderTopBottom,
            right, bottom;

            if (parentElt) {
                parentBorder = parseInt(parentElt.getComputedStyle('border-width')) * 2;
            }
		
            domElt = document.getElementById(this.getOverlayId());
            var tagParent = this.getParent();
            if (domElt) {
                obj.x = parseInt(domElt.style.left, 10);
                obj.y = parseInt(domElt.style.top, 10);
            }
            borderRight = 0;
            borderLeft = 0;
            borderTop = 0;
            borderBottom = 0;

            borderRightTmp = tagParent.getComputedStyle('border-right-width');
            borderLeftTmp = tagParent.getComputedStyle('border-left-width');
            borderTopTmp = tagParent.getComputedStyle('border-top-width');
            borderBottomTmp = tagParent.getComputedStyle('border-bottom-width');
            
            if (borderRightTmp) {
                borderRight = parseInt(borderRightTmp.replace('px', ''));
            }

            if (borderLeftTmp) {
                borderLeft = parseInt(borderLeftTmp.replace('px', ''));
            }
            
            if (borderTopTmp) {
                borderTop = parseInt(borderTopTmp.replace('px', ''));
            }

            if (borderBottomTmp) {
                borderBottom = parseInt(borderBottomTmp.replace('px', ''));
            }

            borderRightLeft = borderRight + borderLeft;
            borderTopBottom = borderTop + borderBottom;
		
            if (linked) {
                if (!linked.isFitToRight() && !this.isFitToRight()) {  // no right constraint                   
                    if (!parentElt.isDocument()) {
                        right = tagParent.getWidth() - (obj.x + this.getWidth() + borderRightLeft);
                        pos = parentElt.getWidth() - (right + this.getWidth());
                    } else {
                        pos = this.getStyle('left');
                    }
                    
                    pos -= parentBorder;
                    pos += 'px';
                    $('#' + this.getOverlayId()).css('left', pos);
                    this.style['left'] = pos;
                    $('#' + this.getOverlayId()).css('right', '');
                    this.style['right'] = '';
                } else { // right constraint                                                            
                    if (!linked.isFitToLeft() && !this.isFitToLeft()) {  // no left constraint
                        pos = (this.getStyle('right')) + 'px';
                        $('#' + this.getOverlayId()).css('right', pos);
                        this.style['right'] = pos;
                        $('#' + this.getOverlayId()).css('left', '');
                        this.style['left'] = '';
                    }
                }

                if (!linked.isFitToBottom() && !this.isFitToBottom()) { // no bottom constraint                    
                    if (!parentElt.isDocument()) {
                        bottom = tagParent.getHeight() - (obj.y + this.getHeight() + borderTopBottom);
                        pos = parentElt.getHeight() - (bottom + this.getHeight());
                    } else {
                        pos = this.getStyle('top');
                    }
                    pos -= parentBorder;
                    pos += 'px';
                    $('#' + this.getOverlayId()).css('top', pos);
                    this.style['top'] = pos;
                    $('#' + this.getOverlayId()).css('bottom', '');
                    this.style['bottom'] = '';
                } else { // bottom constraint                    
                    if (!linked.isFitToTop() && !this.isFitToTop()) { // no top contraint
                        pos = (this.getStyle('bottom')) + 'px';
                        $('#' + this.getOverlayId()).css('bottom', pos);
                        this.style['bottom'] = pos;
                        $('#' + this.getOverlayId()).css('top', '');
                        this.style['top'] = '';
                    }
                }
            }
        };

        /**
         * dblClickFn events
         * @method dblClickFn
         * @param {event} e
         */
        tag.dblClickFn = function tag_dblClickFn(e) {
            var text,
            editBox,
            linked,
            tmpHtmlObject,
            parentHtmlObject,
            tmpWidth,
            tmpHeight,
            htmlObject,
            tag;

            tag = e.data && e.data.tag ? e.data.tag : D.getCurrent();
            linked = tag.getLinkedTag();

            // Disable key event
            Designer.ui.core.disableKeyEvent();
            Designer.event.setListenerMode(false);
            tag.resize.lock(true);
            YAHOO.util.Event.stopEvent(e);
            $(this).prop('disabled', 'disabled');

            // Lock d&d
            tag.lock();
            tag.setFocus(true, false);

            linked.setFocus(false, false);

            htmlObject = tag.getHtmlObject();
            text = tag.getAttribute("data-text").getValue();

            if (htmlObject[0].tagName === 'LABEL') {
                tag._tmpHtmlObj = htmlObject[0].outerHTML;
            }

            tmpHtmlObject = tag._getTmpHtmlObject(text);
            parentHtmlObject = htmlObject.parent();

            parentHtmlObject.css('overflow', 'hidden');

            // Create edit box with the same css as the tag
            editBox = $('<textarea>');

            editBox.prop('id', tag.getId());
            // Keep the same css as the tag
            editBox.css({
                'font-size': tag.getComputedStyle('font-size'),
                'font-family': tag.getComputedStyle('font-family'),
                'font-style': tag.getComputedStyle('font-style'),
                'font-weight': tag.getComputedStyle('font-weight'),
                'text-decoration': tag.getComputedStyle('text-decoration'),
                'text-align': tag.getComputedStyle('text-align'),
                'background-color': tag.getComputedStyle('background-color'),
                'background-image': tag.getComputedStyle('background-image'),
                'text-shadow': tag.getComputedStyle('text-shadow'),
                'letter-spacing': tag.getComputedStyle('letter-spacing'),
                'border': 'none',
                'width': '100%',
                'height': '100%',
                'resize': 'none',
                'overflow': 'hidden'
            });

            editBox.text(text);
            parentHtmlObject.html(editBox);

            // Select the all text on focus
            editBox.select();

            // Add key events
            editBox.bind('keydown', {}, function(e) {
                var value = $(this).val();

                value += e.shiftKey && e.keyCode === 13 ? '<br />' : String.fromCharCode(e.keyCode);

                /**
                 * @method refresh
                 * @return {undefined}
                 */
                this.refresh = function() {
                    tmpHtmlObject.html(value.replace(/\n/g, '<br />') + '.');

                    // Change widget size only if auto width
                    tmpWidth = tmpHtmlObject.width();
                    tmpHeight = tmpHtmlObject.height();

                    if (tmpWidth > 0) {
                        tag.setWidth(tmpWidth, false);
                    }
                    if (tmpHeight > 0) {
                        tag.setHeight(tmpHeight, false);
                    }

                    tag._refreshPosition();
                };

                switch (e.keyCode) {
                    case 13:
                        this.blur();
                        break;
                    default:
                        if (e.keyCode >= 37 && e.keyCode <= 40) {
                            // DO NOTHING FOR ARROW KEYS
                        } else {
                            this.refresh();
                        }
                        break;
                }
            });

            // Save on blur
            editBox.bind('blur', {
                'tag': tag
            }, function(e) {
                var tag = e.data.tag,
                newValue = $(this).val(),
                linked = tag.getLinkedTag(),
                htmlObject = tag.getHtmlObject(),
                parent = htmlObject.parent();

                tag.getAttribute('data-text').setValue(newValue);
                linked.getAttribute('data-label').setValue(newValue);
                tag.update();
                tag.domUpdate();
                parent.html(tag._tmpHtmlObj);
                tag.getHtmlObject().html(newValue.replace(/\n/g, '<br />'));

                // unlock d&d
                tag.unlock();
                Designer.ui.core.enableKeyEvent();
                Designer.event.setListenerMode(true);
                tag.resize.unlock(true);

                if (newValue === '') {
                    Designer.tag.deleteWidgets(tag);
                } else {
                    tag.onDesign();
                    tag.setFocus(true);
                }
            });
        };

        /**
         * Change the position of the label
         * @method changePosition
         * @param {String} pos new position
         */
        tag.changePosition = function label_change_position(pos) {
            var linked = this.getLinkedTag();

            linked.getAttribute('data-label-position').setValue(pos);
            linked.domUpdate();
            linked.onDesign(true);

            $(this).trigger('onPositionChange');
        };

        if (linked) { // Add label text            
            setTimeout(function() {
                htmlObject.text(text);
                htmlObject.css('height', 'auto');
                
                if (isNaN(maxWidth)) {
                    maxWidth = 0;
                }
                
                tmpHtmlObject = tag._getTmpHtmlObject(text);
                tmpWidth = tmpHtmlObject.width();
                tmpHeight = tmpHtmlObject.height();

                if (tmpWidth < minWidth) {
                    tmpWidth = minWidth;
                }
                if (tmpWidth > maxWidth && maxWidth > 0) {
                    tmpWidth = maxWidth;
                }

                if (tmpWidth > 0 && (tmpWidth + 2 !== tag.getWidth())) {
                    Designer.disableNotification();
                    tag.setWidth(tmpWidth, false);
                    Designer.enableNotification();
                }

                if (tmpHeight > 0 && (tmpHeight !== tag.getHeight())) {
                    Designer.disableNotification();
                    tag.setHeight(tmpHeight, false);
                    Designer.enableNotification();
                }
                tag._refreshPosition();
                $(tag).trigger('textValueUpdated');
            }, 80);
        }

        htmlObject.unbind('dblclick').bind('dblclick', {tag: tag}, tag.dblClickFn);

        if (linked) {
            tag.addClass('waf-label-' + linked.getType().toLowerCase());
        }

        // calls onDesign once styles are inserted so that autoResize function may work properly
        // otherwise calculations could be wrong since CSS styles (like font-size) may not have been inserted yet
        if (!tag.binded && htmlObject.get(0) && htmlObject.get(0).addEventListener) {
            tag.binded = true;
            htmlObject.get(0).addEventListener('onWidgetCSSLoaded', function() {
                Designer.env.enableModificationNotification = false;
                tag.onDesign(false);
                Designer.env.enableModificationNotification = true;
            }, false);
        }
    }
});