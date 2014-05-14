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
    packageName: 'Widget/textField',
    type: 'textField',
    lib: 'WAF',
    description: 'Text Input',
    category: 'Form Controls',
    img: '/walib/WAF/widget/textField/icons/widget-textField.png',
    tag: 'input',
    attributes: [
        {
            name: 'type',
            defaultValue: 'text'
        },
        {
            name: 'data-binding',
            description: 'Source',
            context: ['allowBind']
        },
        {
            name: 'data-errorDiv',
            description: 'Error ID',
            context: ['protected']
        },
        {
            name: 'value',
            description: 'Default value',
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
            name: 'data-label',
            description: 'Label',
            defaultValue: 'Label'
        },
        {
            name: 'data-label-position',
            description: 'Label position',
            defaultValue: 'left'
        },
        {
            name: 'data-autocomplete',
            description: 'Autocomplete',
            type: 'checkbox'
        },
        {
            name: 'data-multiline',
            description: 'Multiline',
            type: 'checkbox',
            defaultValue: 'false'
        },
        {
            name: 'data-readOnly',
            description: 'Read only',
            type: 'checkbox',
            typeValue: 'bool',
            defaultValue: 'false',
            context: ['protected']
        },
        {
            name: 'data-password',
            description: 'Password field',
            type: 'checkbox',
            defaultValue: 'false',
            context: ['protected']
        },
        {
            name: 'data-datapicker-on',
            description: 'Enable datepicker',
            type: 'checkbox',
            typeValue: 'bool',
            defaultValue: 'true',
            context: ['protected']
            //platform: 'desktop'
        },
        {
            name: 'data-datapicker-icon-only',
            description: 'Show datepicker button',
            type: 'checkbox',
            typeValue: 'bool',
            defaultValue: 'false',
            platform: 'desktop'
        },
        {
            name: 'tabindex',
            description: 'Tabindex'
        },
        {
            name: 'placeholder',
            description: 'Input placeholder',
            type: 'string',
            context: ['protected']
        }],
    events: [
        {
            name: 'blur',
            description: 'On Blur',
            category: 'Focus Events'
        },
        {
            name: 'change',
            description: 'On Change',
            category: 'Focus Events'
        },
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
            name: 'focus',
            description: 'On Focus',
            category: 'Focus Events'
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
            name: 'keydown',
            description: 'On Key Down',
            category: 'Keyboard Events'
        },
        {
            name: 'keyup',
            description: 'On Key Up',
            category: 'Keyboard Events'
        },
        {
            name: 'select',
            description: 'On Select',
            category: 'Keyboard Events'
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
    style: [
        {
            name: 'width',
            defaultValue: '130px'
        },
        {
            name: 'height',
            defaultValue: function() {
                var result;
                if (typeof Designer !== "undefined") {
                    if (Designer.isMobile) {
                        result = "40px";
                    } else {
                        result = "22px";
                    }
                    return result;
                }

            }.call()
        }],
    properties: {
        style: {
            theme: {
                'roundy': false
            },
            fClass: true,
            text: true,
            background: true,
            border: true,
            sizePosition: true,
            label: true,
            dropShadow: true,
            innerShadow: true,
            textShadow: true,
            disabled: []
        },
        state: [{
                label: 'hover',
                cssClass: 'waf-state-hover'
            }, {
                label: 'focus',
                cssClass: 'waf-state-focus'
            }, {
                label: 'disabled',
                cssClass: 'waf-state-disabled'
            }]
    },
    onInit: function(config) {
        var widget = new WAF.widget.TextField(config);

        // add in WAF.widgets
        widget.kind = config['data-type']; // kind of widget
        widget.id = config['id']; // id of the widget
        widget.renderId = config['id']; // id of the tag used to render the widget
        widget.ref = document.getElementById(config['id']); // reference of the DOM instance of the widget
        WAF.widgets[config['id']] = widget;

        return widget;
    },
    onDesign: function(config, designer, tag, catalog, isResize) { 
        var
        value,
        multiline,
        htmlObject,
        htmlElement;

        htmlObject = tag.getHtmlObject();
        htmlElement = htmlObject[0];
        multiline = tag.getAttribute('data-multiline').getValue(),
        placeHolder = tag.getAttribute('placeholder').getValue(),
        value = tag.getAttribute('value').getValue();

        /*
         * Change tag type into textarea if multiline
         */
        if (tag._config.changeType && htmlElement && htmlElement.tagName == "INPUT" && multiline == 'true') {
            tag._config.changeType(tag, 'textarea');
        }

        /*
         * Change tag type into input if not multiline
         */
        if (tag._config.changeType && htmlElement && htmlElement.tagName == "TEXTAREA" && multiline == 'false') {
            tag._config.changeType(tag, 'input');
        }

        /*
         * Add default value
         */
        if (value) {
            htmlObject.val(value);
        } else if (tag.getSource()) {
            htmlObject.val('[' + tag.getSource() + ']');
        } else {
            htmlObject.val('');
        }

        htmlObject.attr('placeholder', placeHolder);

        //FIX ME : force matrix rebuild in order to re calculate positions of textfield
        var parent = tag.getParents()[0];
        if (isResize === undefined && parent && parent.isMatrix() && D.env.transCodeId === "004") {
            window.setTimeout(function(){
                parent.rebuild();    
            },0);
        }
    },
    onCreate: function(tag, param) {
        var
        htmlObject;

        htmlObject = tag.getHtmlObject();

        /*
         * Dblclick event
         */
        htmlObject.bind('dblclick', {tag: tag}, function(e) {
            var
            tag,
            source,
            htmlObject;

            tag = e.data.tag;
            htmlObject = $(this);
            source = tag.getSource();

            if (htmlObject.val() === '[' + source + ']') {
                htmlObject.val('');
            }

            htmlObject.css('cursor', 'text');

            /*
             * Force focus on widget
             */
            tag.setFocus(true);

            /*
             * Lock d&d
             */
            tag.lock();

            htmlObject.css('cursor ', 'text');

            /*
             * Disable the events key
             */
            Designer.ui.core.disableKeyEvent();

            Designer.event.setListenerMode(false);
            tag.resize.lock(true);
            YAHOO.util.Event.stopEvent(e);

            htmlObject.focus();
            htmlObject.select();

            /*
             * Force focus on widget on click
             */
            htmlObject.unbind('click');
            htmlObject.bind('click', {}, function(e) {
                tag.setFocus(true)
            });

            htmlObject.unbind('keydown');
            htmlObject.bind('keydown', function(e) {
                if (e.keyCode === 13 && (!e.shiftKey || tag.getAttribute('data-multiline').getValue() === 'false')) {
                    $(this).blur();
                }
            });

            htmlObject.unbind('blur');
            htmlObject.bind('blur', {}, function(e) {
                var
                htmlObject;

                htmlObject = $(this);

                htmlObject.css('cursor', 'move');

                if (D.getCurrent() && D.getCurrent() === tag) {
                    tag.setResizable(true);
                }

                tag.getAttribute('value').setValue(htmlObject.val());

                tag.save(false, true, false);

                Designer.ui.core.enableKeyEvent();

                Designer.event.setListenerMode(true);
                tag.resize.unlock(true);


                /*
                 * Unlock d&d
                 */
                tag.unlock();

                htmlObject.css('cursor ', 'move');
            });

        });
    },
    /**
     * Change the widget tag type
     * @method changeType
     * @param {object} tag
     * @param {string} type
     */
    changeType: function(tag, type) {
        var
        i,
        tagId,
        value,
        event,
        events,
        source,
        newStyle,
        newClass,
        htmlObject,
        tmpHtmlObject;

        tagId = tag.getId();
        htmlObject = $('#' + tagId);
        value = tag.getAttribute('value').getValue();
        source = tag.getSource();
        newClass = htmlObject.attr('class');
        newStyle = htmlObject.attr('style');
        events = $._data(htmlObject, 'events');

        tmpHtmlObject = $('<' + type + '/>').attr('id', 'tmp-' + tagId);
        tmpHtmlObject.appendTo('#' + tag.overlay.id + ' .bd');

        tmpHtmlObject.addClass(newClass);
        tmpHtmlObject.attr('style', newStyle);

        if (!value && source) {
            value = '[' + source + ']';
        }

        htmlObject.remove();

        if (type === 'textarea') {
            tmpHtmlObject.html(value);
        } else {
            tmpHtmlObject.val(value);

            document.getElementById('tmp-' + tagId).setAttribute('type', 'text')
        }

        tmpHtmlObject.prop('id', tagId);

        /*
         * Reapply events
         */
        for (i in events) {
            event = events[i][0];

            tmpHtmlObject.bind(event.type, event.data, event.handler);
        }
    }
});
