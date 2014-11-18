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
    packageName: 'Widget/radioGroup',
    type: 'radioGroup',
    lib: 'WAF',
    description: 'Radio Button Group',
    category: 'Form Controls',
    img: '/walib/WAF/widget/radiogroup/icons/widget-radiogroup.png',
    tag: 'ul',
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
            name: 'data-display',
            description: 'Display',
            type: 'dropdown',
            options: [{
                    key: 'vertical',
                    value: 'Vertical'
                }, {
                    key: 'horizontal',
                    value: 'Horizontal'
                }],
            defaultValue: 'vertical'
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
            name: 'data-icon-default',
            description: 'Source',
            tab: 'style',
            tabCategory: 'Icon',
            type: 'file',
            ready: function() {
                var
                selector;

                selector = this.data.tag.currentSelector;

                if (selector != '.waf-radio-box') {
                    this.formPanel.hide();
                }
            }
        },
        {
            name: 'data-icon-hover',
            description: 'Source',
            tab: 'style',
            tabCategory: 'Icon',
            type: 'file'
        },
        {
            name: 'data-icon-active',
            description: 'Source',
            tab: 'style',
            tabCategory: 'Icon',
            type: 'file'
        },
        {
            name: 'data-icon-selected',
            description: 'Source',
            tab: 'style',
            tabCategory: 'Icon',
            type: 'file'
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
            defaultValue: '100px'
        },
        {
            name: 'height',
            defaultValue: '25px'
        }],
    properties: {
        style: {
            theme: true,
            fClass: true,
            text: false,
            background: true,
            border: true,
            sizePosition: true,
            textShadow: false,
            dropShadow: true,
            innerShadow: true,
            label: true
        }
    },
    structure: [{
            description: 'radio button area',
            selector: '.waf-radio',
            style: {
                background: true,
                gradient: true,
                border: true,
                text: true,
                textShadow: true
            },
            state: [{
                    label: 'hover',
                    cssClass: 'waf-state-hover',
                    find: '.waf-radio',
                    mobile: false
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-radio',
                    mobile: true
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-radio',
                    mobile: true
                }]
        }, {
            description: 'radio button area - first',
            selector: '.waf-radio.waf-position-first',
            style: {
                background: true,
                gradient: true,
                border: true,
                text: true,
                textShadow: true
            },
            state: [{
                    label: 'hover',
                    cssClass: 'waf-state-hover',
                    find: '.waf-radio',
                    mobile: false
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-radio',
                    mobile: true
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-radio',
                    mobile: true
                }]
        }, {
            description: 'radio button area - last',
            selector: '.waf-radio.waf-position-last',
            style: {
                background: true,
                gradient: true,
                border: true,
                text: true,
                textShadow: true
            },
            state: [{
                    label: 'hover',
                    cssClass: 'waf-state-hover',
                    find: '.waf-radio'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-radio'
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-radio'
                }]
        }, {
            description: 'radio button',
            selector: '.waf-radio-box',
            style: {
                background: true,
                gradient: true,
                border: true
            },
            state: [{
                    label: 'hover',
                    cssClass: 'waf-state-hover',
                    find: '.waf-radio'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-radio'
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-radio'
                }]
        }
        /*,{
         description : 'radio text',
         selector    : 'label',
         style: {
         text        : true,
         textShadow  : true
         },
         state : [{
         label   : 'hover',
         cssClass: 'waf-state-hover',
         find    : '.waf-radio'
         },{
         label   : 'active',
         cssClass: 'waf-state-active',
         find    : '.waf-radio'
         },{
         label   : 'selected',
         cssClass: 'waf-state-selected',
         find    : '.waf-radio'
         }]
         },{
         description : 'icon',
         selector    : '.waf-radio-icon',
         style: {
         background  : true,
         shadow      : true
         },
         state : [{
         label   : 'hover',
         cssClass: 'waf-state-hover',
         find    : '.waf-radio'
         },{
         label   : 'active',
         cssClass: 'waf-state-active',
         find    : '.waf-radio'
         },{
         label   : 'selected',
         cssClass: 'waf-state-selected',
         find    : '.waf-radio'
         }]
         }*/],
    onInit: function(config) {
        return new WAF.widget.RadioGroup(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var
        icon,
        theme,
        states,
        $radio,
        radios,
        options,
        htmlObject,
        currentState,
        radiosLength,
        radioGroupLength;

        options = tag.getOptions();
        htmlObject = tag.getHtmlObject();
        theme = D.getById("waf-body").getTheme();

        htmlObject.children().remove();

        /*
         * Add display class
         */
        htmlObject.removeClass('waf-direction-horizontal waf-direction-vertical');
        htmlObject.addClass('waf-direction-' + tag.getAttribute("data-display").getValue());

        var dimension = config['data-display'] === 'horizontal' ? 'width' : 'height',
        value,
        obj,
        radioElem,
        halfRadioHeight;

        /*
         * Create a radio input
         * @method createRadio
         */
        tag.createRadio = function(option) {
            var
            radioLi,
            radioInput,
            radioLabel,
            radioDiv,
            attr,
            path,
            url,
            imgHtml,
            icons,
            cssClass,
            itemHeight;

            option = option || {};

            attr = {
                type: 'radio',
                name: tag.getId(),
                value: option.value
            }

            radioLi = $('<li>');

            radioDiv = $('<div class="waf-widget waf-subElement waf-radio ' + tag.getTheme() + '">');

            var radioBox = $('<div class="waf-radio-box">').appendTo(radioDiv);

            /*
             * Svg icon
             */

            icons = [];

            if (config['data-icon-default'])
                icons.push({
                    cssClass: 'waf-radio-icon-default',
                    value: config['data-icon-default']
                });
            if (config['data-icon-hover'])
                icons.push({
                    cssClass: 'waf-radio-icon-hover',
                    value: config['data-icon-hover']
                });
            if (config['data-icon-active'])
                icons.push({
                    cssClass: 'waf-radio-icon-active',
                    value: config['data-icon-active']
                });
            if (config['data-icon-selected'])
                icons.push({
                    cssClass: 'waf-radio-icon-selected',
                    value: config['data-icon-selected']
                });

            cssClass = 'waf-icon waf-radio-icon';

            if (icons.length == 0) {
                cssClass += ' waf-icon-svg';
            } else {
                cssClass += ' waf-icon-image';
            }

            icon = $('<div class="' + cssClass + '">');

            if (icons.length > 0) {
                for (i = 0; i < icons.length; i += 1) {
                    path = Designer.util.cleanPath(icons[i].value.replace('/', ''));
                    url = path.fullPath;

                    imgHtml = $('<img>');

                    imgHtml.addClass(icons[i].cssClass);

                    imgHtml.prop({
                        src: url
                    });

                    imgHtml.appendTo(icon);
                }
            } else {
                icon.svg({
                    loadURL: '/walib/WAF/widget/radiogroup/skin/' + theme + '/svg/widget-radiogroup-skin-' + theme + '.svg',
                    onLoad: function(svg) {
                        svg.configure({
                            width: '100%',
                            height: '100%',
                            preserveAspectRatio: 'none'
                        });
                    }
                });
            }

            icon.appendTo(radioBox);

            if (option.selected) {
                attr.checked = 'checked';
                radioDiv.addClass('waf-state-selected')
            }

            radioInput = $('<input>').attr(attr);
            radioInput.appendTo(radioDiv);

            radioDiv.appendTo(radioLi);

            if (option.label) {
                radioLabel = $('<label>').prop('for', attr.name).addClass(tag.getTheme()).html(option.label);
                //radioLabel.appendTo(radioLi);
                radioDiv.find('input').before(radioLabel);
            }

            return radioLi;
        }

        /*
         * If only one radio
         */
        if (!options || (options && options.length === 0)) {
            tag.createRadio().appendTo(htmlObject);
        } else {

            for (var i in options) {
                tag.createRadio(options[i]).appendTo(htmlObject);
            }
        }

        window.setTimeout(function() {
            radioGroupLength = htmlObject.children().length;
            value = 100 / radioGroupLength + '%';

            htmlObject.children().map(function(i) {
                obj = $(this);
                obj.css(dimension, value);
                itemHeight = obj.get()[0].offsetHeight;
                obj.css("line-height", itemHeight + "px");
                radioElem = obj.find(".waf-radio-box");
                halfRadioHeight = radioElem.get()[0].offsetHeight / 2;
                radioElem.css("margin-top", "-" + halfRadioHeight + "px");
            });

        }, 0);

        currentState = tag.getCurrentState();
        states = tag.getStates();
        radios = tag.getHtmlObject().find('.waf-radio');
        radiosLength = radios.length;
        ID = tag.getId();

        // Setting position
        tag._setPosition = function(ID) {

            var radios;
            var radiosLength;

            radios = $("#" + ID).find(".waf-radio");
            radiosLength = radios.length;

            radios && radios.map(function(i, radio) {

                if (!radio) {
                    return;
                }

                $radio = $(radio);

                if (i == 0) {
                    $radio.addClass('waf-position-first');
                } else {
                    $radio.removeClass('waf-position-first');
                }

                if (i == radiosLength - 1) {
                    $radio.addClass('waf-position-last');
                } else {
                    $radio.removeClass('waf-position-last');
                }
            });
        }

        window.setTimeout(function() {
            tag._setPosition(ID);
        }, 0)


        // Setting state
        for (i = 0; i < states.length; i += 1) {
            radios.removeClass(states[i].cssClass);
        }

        if (currentState) {
            radios.addClass(currentState.cssClass);
        }
    },
    onCreate: function(tag, param) {
        var radios = tag.getHtmlObject().find('.waf-radio');

        if (tag && tag._setPosition) {
            tag._setPosition(tag.getId());
        }

        if (param._isLoaded) {
            /*
             * Execute script when widget is entirely loaded (with linked tags) 
             */
            $(tag).bind('onReady', function() {
            });
        }
    }
});
