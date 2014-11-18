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
    packageName: 'Widget/combobox',
    type: 'combobox',
    lib: 'WAF',
    description: 'Combo Box',
    category: 'Form Controls',
    img: '/walib/WAF/widget/combobox/icons/widget-combobox.png',
    tag: 'div',
    attributes: [
        {
            name: 'class',
            description: 'Css class'
        },
        {
            name: 'data-binding',
            description: 'Choice source'
        },
        {
            name: 'data-binding-out',
            description: 'Value source',
            typeValue: 'datasource'
        },
        {
            name: 'data-binding-options',
            visibility: 'hidden'
        },
        {
            name: 'data-binding-key',
            description: 'Key',
            type: 'dropdown',
            options: ['']
        },
        {
            name: 'data-format',
            description: 'Format'
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
            name: 'data-autoDispatch',
            description: 'Auto-dispatch',
            type: 'checkbox',
            defaultValue: 'true'
        },
        {
            name: 'tabindex',
            description: 'Tabindex'
        },
        {
            name: 'data-editable',
            description: 'Autocomplete',
            type: 'checkbox',
            defaultValue: 'true'
        },
        {
            name: 'data-limit',
            description: 'Display limit',
            type: 'textField',
            defaultValue: '20'
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
            name: 'onmouseup',
            description: 'On Mouse Up',
            category: 'Mouse Events'
        }/*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/],
    style: [
        {
            name: 'width',
            defaultValue: '164px'
        },
        {
            name: 'height',
            defaultValue: '24px'
        }],
    properties: {
        style: {
            theme: true,
            fClass: true,
            text: true,
            background: true,
            gradient: true,
            border: true,
            sizePosition: true,
            shadow: true,
            disabled: []
        },
        state: [{
                label: 'hover',
                cssClass: 'waf-state-hover'
            }, {
                label: 'active',
                cssClass: 'waf-state-active'
            }, {
                label: 'disabled',
                cssClass: 'waf-state-disabled'
            }]
    },
    structure: [{
            description: 'input',
            selector: 'input',
            style: {
                text: true,
                background: true,
                gradient: true,
                textShadow: true,
                innerShadow: true,
                border: true
            },
            state: [{
                    label: 'hover',
                    cssClass: 'waf-state-hover'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active'
                }, {
                    label: 'disabled',
                    cssClass: 'waf-state-disabled'
                }]
        }, {
            description: 'button',
            selector: 'button',
            style: {
                background: true,
                gradient: true,
                border: true
            },
            state: [{
                    label: 'hover',
                    cssClass: 'ui-state-hover',
                    find: '.ui-button'
                }, {
                    label: 'active',
                    cssClass: 'ui-state-active',
                    find: '.ui-button'
                }, {
                    label: 'disabled',
                    cssClass: 'ui-state-disabled',
                    find: '.ui-button'
                }]
        }, {
            description: 'list',
            selector: '.waf-combobox-list',
            style: {
                text: true,
                background: true,
                gradient: true,
                textShadow: true,
                innerShadow: true,
                border: true
            }
        }],
    onInit: function(config) {
        var widget = new WAF.widget.Combobox(config);

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
        htmlObject,
        htmlSelect,
        htmlInput,
        htmlButton,
        borderSize,
        buttonSize,
        tagWidth,
        tagHeight,
        options;

        tagWidth = tag.getWidth();
        tagHeight = tag.getHeight();
        htmlObject = $('#' + tag.getId());
        buttonSize = 29;
        borderSize = parseInt(tag.getComputedStyle('border-width'), 10) * 2;

        tag.showList = function combobox_show_list() {
            // body...
        };

        htmlObject.children().remove();

        htmlSelect = $('<select>').appendTo(htmlObject);
        options = tag.getOptions();

        for (var i in options) {
            var attr = {
                value: options[i].value
            };

            if (options[i].selected) {
                attr.selected = 'selected';
            }

            htmlSelect.append($('<option/>').prop(attr).html(options[i].label));
        }

        htmlSelect.combobox();

        htmlInput = htmlObject.children('input');
        htmlButton = htmlObject.children('button');

        htmlObject.parent().css({
            'overflow': 'hidden'
        });


        htmlInput.css({
            'width': (tagWidth - buttonSize - borderSize) + 'px',
            'height': (tagHeight - borderSize) + 'px',
            'cursor': 'move'
        });

        htmlButton.css({
            'width': buttonSize + 'px',
            'height': (tagHeight - borderSize) + 'px',
            'cursor': 'move'
        });

        htmlButton.bind('click', {}, function(e) {
            htmlInput.autocomplete('close');
        });


        htmlInput.autocomplete("widget").remove();

        if (tag.currentSelector && tag.currentSelector != -1) {
            D.tag.showComboboxAutocomplete(/waf-combobox-list/.test(tag.currentSelector) ? true : false);
        }

    }
});
