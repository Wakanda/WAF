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
    packageName: 'Widget/richText',
    type: 'richText',
    lib: 'WAF',
    description: 'Text',
    category: 'Form Controls',
    img: '/walib/WAF/widget/richText/icons/widget-richText.png',
    include: [],
    tag: 'div',
    attributes: [
        {
            name: 'data-binding',
            description: 'Source',
            context: ['protected']
        },
        {
            name: 'class',
            description: 'Css class'
        },
        {
            name: 'data-format',
            description: 'Format',
            context: ['protected']
        },
        {
            name: 'data-autoWidth',
            description: 'Auto resize',
            type: 'checkbox',
            defaultValue: 'true'
        },
        {
            name: 'data-label',
            description: 'Label',
            ready: function() {
                var
                i,
                tag,
                selection,
                selectionL;


                selection = Designer.env.tag.selection;
                selectionL = selection.count();

                if (selectionL <= 0) {
                    if (!this.data.tag.getAttribute('data-binding').getValue()) {
                        this.getHtmlObject().parent().parent().hide();
                    }
                } else {
                    if (!D.ui.selection.getAttribute('data-binding').getValue()) {
                        this.getHtmlObject().parent().parent().hide();
                    }
                }
            }
        },
        {
            name: 'data-text',
            description: 'Text',
            type: 'textarea',
            context: ['protected']
        },
        {
            name: 'data-inline',
            visibility: 'hidden'
        },
        {
            name: 'data-labelFor',
            visibility: 'hidden'
        },
        {
            name: 'data-label-position',
            description: 'Label position',
            defaultValue: 'left'
        },
        {
            name: 'data-link',
            description: 'URL',
            context: ['protected'],
            onchange: function() {
                if (!this.getValue()) {
                    $('#dropdown-data-target').parent().parent().hide();
                } else {
                    $('#dropdown-data-target').parent().parent().show();
                }
            }
        },
        {
            name: 'data-target',
            description: 'Target',
            type: 'dropdown',
            options: ['_blank', '_self'],
            defaultValue: '_blank',
            context: ['protected'],
            ready: function() {
                var
                i,
                tag,
                selection,
                selectionL;


                selection = Designer.env.tag.selection;
                selectionL = selection.count();

                if (selectionL <= 0) {
                    if (!this.data.tag.getAttribute('data-link').getValue()) {
                        this.getHtmlObject().parent().parent().hide();
                    }
                } else {
                    if (!D.ui.selection.getAttribute('data-link').getValue()) {
                        this.getHtmlObject().parent().parent().hide();
                    }
                }
            }
        },
        {
            name: 'data-overflow',
            description: 'Scrollbar',
            type: 'dropdown',
            options: ['Hidden', 'Horizontal', 'Vertical', 'Both'],
            defaultValue: 'Hidden'
        },
        {
            name: 'data-plainText',
            description: 'Plain text',
            type: 'checkbox',
            defaultValue: 'true',
            context: ['protected']
        }],
    style: [
        {
            name: 'width',
            defaultValue: '50px'
        },
        {
            name: 'height',
            defaultValue: '16px'
        }],
    events: [
        {
            name: 'click',
            description: 'On Click',
            category: 'Mouse Events'
        },
        {
            name: 'dblclick',
            description: 'On Double Click',
            category: 'Mouse Events'
        },
        {
            name: 'mousedown',
            description: 'On Mouse Down',
            category: 'Mouse Events'
        },
        {
            name: 'mouseout',
            description: 'On Mouse Out',
            category: 'Mouse Events'
        },
        {
            name: 'mouseover',
            description: 'On Mouse Over',
            category: 'Mouse Events'
        },
        {
            name: 'mouseup',
            description: 'On Mouse Up',
            category: 'Mouse Events'
        },
        {
            name: 'touchstart',
            description: 'On Touch Start',
            category: 'Touch Events'
        },
        {
            name: 'touchend',
            description: 'On Touch End',
            category: 'Touch Events'
        },
        {
            name: 'touchcancel',
            description: 'On Touch Cancel',
            category: 'Touch Events'
        }/*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/],
    properties: {
        style: {
            theme: false,
            fClass: true,
            text: true,
            background: true,
            border: true,
            sizePosition: true,
            label: true,
            textShadow: true,
            dropShadow: true,
            innerShadow: true,
            disabled: ['border-radius']
        }
    },
    onInit: function(config) {
        return new WAF.widget.RichText(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var
        text,
        htmlObject,
        tmpWidth,
        tmpHeight,
        tagWidth,
        tagHeight,
        split,
        attrText,
        plainText,
        tmpHtmlObject;

        htmlObject = tag.getHtmlObject();

        tagWidth = tag.getWidth();
        tagHeight = tag.getHeight();

        attrText = tag.getAttribute('data-text').getValue();
        plainText = tag.getAttribute('data-plainText').getValue() == 'true';

        /*
         * Get the source as text value
         */
        if (tag.getSource()) {
            text = '[' + tag.getSource() + ']';
            if (attrText) {
                text = attrText;
            }

            tag._oldTextValue = null;

            tag._oldLabelValue = tag.getAttribute('data-label').getValue();

            tag._oldSource = tag.getSource();
        } else {

            /*
             * if a label exist, clear it
             */
            if (tag._oldLabelValue) {
                tag.getAttribute('data-label').setValue('');
            }

            if (tag.getLabel()) {
                D.tag.deleteWidgets(tag.getLabel());
                tag._linkedTag = null;
            }

            text = tag.getAttribute('data-text').getValue();

            if (tag.getAttribute('data-inline') && tag.getAttribute('data-inline').getValue() == 'true') {
                text = text.replace(/\n/g, ' ');
                tag.setAttribute('data-text', text);
                tag.domUpdate();
            }

            tag._oldLabelValue = null;

            tag._oldTextValue = text;
        }

        //tag.getAttribute('data-text').setValue(text);

        if (tag.getAttribute('data-link').getValue()) {
            htmlObject.addClass('link');
        }

        text = text.replace(/\n/g, '<br />');

        /*
         * get/create the temporary html object
         */
        tag._getTmpHtmlObject = function tag_createTmpHtmlObject(text) {
            var
            tmpHtmlObject;

            if ($('#waf-tmp-div').length > 0) {
                tmpHtmlObject = $('#waf-tmp-div');
            } else {
                tmpHtmlObject = $('<div id="waf-tmp-div">');
            }

            /*
             * Set the temporary html object
             */
            tmpHtmlObject.appendTo('body');
            tmpHtmlObject.html(text);

            tmpHtmlObject.css({
                /*
                 * Keep the same css as the tag
                 */
                'font-size': this.getComputedStyle('font-size'),
                'font-style': this.getComputedStyle('font-style'),
                'font-family': this.getComputedStyle('font-family'),
                'font-weight': this.getComputedStyle('font-weight'),
                'text-decoration': this.getComputedStyle('text-decoration'),
                'text-align': this.getComputedStyle('text-align'),
                'letter-spacing': this.getComputedStyle('letter-spacing'),
                'position': 'absolute',
                'z-index': '10000',
                'left': '-1000px',
                'top': '-1000px',
                'background': '#FFCC66'
            });

            return tmpHtmlObject;
        }

        tmpHtmlObject = tag._getTmpHtmlObject(text);

        tmpWidth = tmpHtmlObject.width();
        tmpHeight = tmpHtmlObject.height();
        /*
         * Add text to html object
         */
        if (plainText) {
            htmlObject.text(text);
        } else {
            htmlObject.html(text);
        }

        /*
         * If autocomplete, resize the htmlobject depending on temporary html object
         */
        if (tag.getAttribute('data-autoWidth').getValue() === 'true') {
            if (tmpWidth > 0 && tmpWidth != tagWidth) {
                tag.setWidth(tmpWidth);
            }

            if (tmpHeight > 0 && tmpHeight != tagHeight && !tag.isFitToBottom()) {
                tag.setHeight(tmpHeight);
            }
        }

        /*
         * DblClick event
         */
        tag.dblClickFn = function tag_dblClickFn(e) {
            var
            text,
            editBox,
            tmpHtmlObject,
            tmpWidth,
            tmpHeight,
            htmlObject,
            tag;

            tag = e.data && e.data.tag ? e.data.tag : D.getCurrent();
            /*
             * Disable key event
             */
            Designer.ui.core.disableKeyEvent();
            Designer.event.setListenerMode(false);
            tag.resize.lock(true);
            YAHOO.util.Event.stopEvent(e);
            $(this).prop('disabled', 'disabled');

            /*
             * Lock d&d
             */
            tag.lock();
            tag.setFocus(true, false);

            if (!e.data) {
                D.tag.refreshPanels();
            }

            htmlObject = tag.getHtmlObject();
            text = tag.getAttribute("data-text").getValue();


            tmpHtmlObject = tag._getTmpHtmlObject(text);

            /*
             * Create edit box with the same css as the tag
             */
            if (tag.getParent().getType() == 'menuItem' || tag.getAttribute('data-inline').getValue() == 'true') {
                editBox = $('<input>')
                .attr('value', text);

            } else {
                editBox = $('<textarea>')
                .html(text);
            }

            editBox.css({
                /*
                 * Keep the same css as the tag
                 */
                'font-size': 'inherit',
                'font-family': 'inherit',
                'font-style': 'inherit',
                'font-weight': 'inherit',
                'text-decoration': 'inherit',
                'text-align': 'inherit',
                'background-color': 'transparent',
                'border': 'none',
                'width': '100%',
                'height': '100%',
                'resize': 'none'
            });

            htmlObject.html(editBox);


            /*
             * Select the all text on focus
             */
            editBox.select();


            /*
             * Add key events
             */
            editBox.bind('keydown', {}, function(e) {
                var
                value;

                value = $(this).val();

                value += e.shiftKey && e.keyCode == 13 ? '<br />' : String.fromCharCode(e.keyCode);

                this.refresh = function() {

                    if (tag.getAttribute('data-inline') && tag.getAttribute('data-inline').getValue() == 'true') {
                        tmpHtmlObject.html(value.replace(/\n/g, ' ') + '-');


                    } else {
                        tmpHtmlObject.html(value.replace(/\n/g, '<br />') + '-');
                    }


                    /*
                     * Change widget size only if auto width
                     */
                    if (tag.getAttribute('data-autoWidth').getValue() === 'true') {
                        tmpWidth = tmpHtmlObject.width();
                        tmpHeight = tmpHtmlObject.height();

                        if (tmpWidth > 0) {
                            tag.setWidth(tmpWidth, false);
                        }

                        if (tmpHeight > 0 && !tag.isFitToBottom()) {
                            tag.setHeight(tmpHeight, false);
                        }
                    }

                }

                switch (e.keyCode) {
                    /*
                     * Save on enter key down (except holding shift)
                     */
                    case 13:
                        if (tag.getAttribute('data-inline').getValue() == 'true') {
                            e.preventDefault();
                            this.blur();
                            break;
                        }

                        if (!e.shiftKey) {
                            this.blur();
                        } else {
                            this.refresh();
                        }
                        break;

                        /*
                         * Resize on key event
                         */
                    default:
                        if (e.keyCode >= 37 && e.keyCode <= 40) {
                            // DO NOTHING FOR ARROW KEYS
                        } else {
                            this.refresh();
                        }
                        break;
                }
            });


            /*
             * Save on blur
             */
            editBox.bind('blur', {
                tag: tag
            }, function(e) {
                var
                tag,
                newValue;

                tag = e.data.tag;
                newValue = $(this).val();

                if (tag.getAttribute('data-inline') && tag.getAttribute('data-inline').getValue() == 'true') {
                    newValue = newValue.replace(/\n/g, ' ');
                }

                tag.getAttribute('data-text').setValue(newValue);

                tag.update();
                tag.domUpdate();

                D.tag.refreshPanels();


                tag.getHtmlObject().html(newValue.replace(/\n/g, '<br />'));

                /*
                 * unlock d&d
                 */
                tag.unlock();
                Designer.ui.core.enableKeyEvent();
                Designer.event.setListenerMode(true);
                tag.resize.unlock(true);

            })
        }

        htmlObject.bind('dblclick', {
            tag: tag
        }, tag.dblClickFn);

        // calls onDesign once styles are inserted so that autoResize function may work properly
        // otherwise calculations could be wrong since CSS styles (like font-size) may not have been inserted yet
        // this fixes #WAK0078446

        if (!tag.binded && htmlObject.get(0) && htmlObject.get(0).addEventListener) {
            tag.binded = true;
            htmlObject.get(0).addEventListener('onWidgetCSSLoaded', function() {
                Designer.env.enableModificationNotification = false;
                tag.onDesign(true);
                Designer.env.enableModificationNotification = true;
            }, false);
        }

        /*
         * Remove temporary objects
         */
        tmpHtmlObject.remove();
    }
});
