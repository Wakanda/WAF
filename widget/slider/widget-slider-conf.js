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
    packageName: 'Widget/slider',
    type: 'slider',
    lib: 'WAF',
    description: 'Slider',
    category: 'Form Controls',
    img: '/walib/WAF/widget/slider/icons/widget-slider.png',
    tag: 'div',
    attributes: [
        {
            name: 'data-binding',
            description: 'Source'
        },
        {
            name: 'class',
            description: 'Css class'
        },
        {
            name: 'data-errorDiv',
            description: 'Error ID'
        },
        {
            name: 'data-minValue',
            description: 'Minimum value',
            defaultValue: '0',
            typeValue: 'integer'
        },
        {
            name: 'data-maxValue',
            description: 'Maximum value',
            defaultValue: '100',
            typeValue: 'integer'
        },
        {
            name: 'data-step',
            description: 'Step',
            defaultValue: '1',
            typeValue: 'integer'
        },
        {
            name: 'data-orientation',
            description: 'Orientation',
            type: 'dropdown',
            options: [{
                    key: 'vertical',
                    value: 'Vertical'
                }, {
                    key: 'horizontal',
                    value: 'Horizontal'
                }],
            defaultValue: 'horizontal'
        }
        ,
        {
            name: 'data-range',
            description: 'Range',
            type: 'dropdown',
            options: [{
                    key: '',
                    value: 'None'
                }, {
                    key: 'min',
                    value: 'Min'
                }, {
                    key: 'max',
                    value: 'Max'
                }],
            defaultValue: 'min'
        },
        {
            name: 'data-label',
            description: 'Label',
            defaultValue: ''
        },
        {
            name: 'data-label-position',
            description: 'Label position',
            defaultValue: 'left'
        }],
    events: [
        {
            name: 'slidecreate',
            description: 'On Create',
            category: 'Slider Events'
        },
        {
            name: 'slidestart',
            description: 'On Start',
            category: 'Slider Events'
        },
        {
            name: 'slide',
            description: 'On Slide',
            category: 'Slider Events'
        },
        {
            name: 'slidechange',
            description: 'On Change',
            category: 'Slider Events'
        },
        {
            name: 'slidestop',
            description: 'On Stop',
            category: 'Slider Events'
        }/*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/
    ],
    style: [
        {
            name: 'width',
            defaultValue: '162px'
        },
        {
            name: 'height',
            defaultValue: function() {
                var result;
                if (typeof Designer !== "undefined") {
                    if (Designer.isMobile) {
                        result = "11px";
                    } else {
                        result = "6px";
                    }
                    return result;
                }
            }.call()
        }],
    properties: {
        style: {
            theme: {
                roundy: false
            },
            fClass: true,
            text: false,
            background: true,
            border: true,
            sizePosition: true,
            label: true,
            shadow: false,
            disabled: ['border-radius']
        },
        state: [{
                label: 'disabled',
                cssClass: 'waf-state-disabled'
            }]
    },
    structure: [{
            description: 'range',
            selector: '.ui-slider-range',
            style: {
                background: true
            }
        }, {
            description: 'handle',
            selector: '.ui-slider-handle',
            style: {
                background: true
            },
            state: [{
                    label: 'hover',
                    cssClass: 'ui-state-hover',
                    find: '.ui-slider-handle'
                }, {
                    label: 'active',
                    cssClass: 'ui-state-active',
                    find: '.ui-slider-handle'
                }]
        }],
    onInit: function(config) {
        var slider = new WAF.widget.Slider(config);
        return slider;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var slider,
        tmpValue = '',
        orientation;

        slider = tag.getHtmlObject();
        orientation = tag.getAttribute('data-orientation').getValue();

        if (!isResize) {
            // change style size if orientation has changed
            if (tag.tmpOrientation && tag.tmpOrientation != orientation) {
                tmpValue = tag.style.width;
                tag.style.width = tag.style.height;
                tag.style.height = tmpValue;


                tag.tmpOrientation = orientation;

                $("#" + tag.overlay.id).css({
                    width: tag.style.width,
                    height: tag.style.height
                });

                tag.update();
            }

            $(slider)
            .slider('destroy')
            .slider({
                disabled: true,
                range: tag.getAttribute('data-range').getValue(),
                //step: 5,
                'orientation': orientation,
                value: 36
            })
            .addClass('waf-widget waf-slider ' + tag.getTheme());

            tag.tmpOrientation = orientation;
        }

        /**
         * Redraw the handle of the slider
         * @function _redrawHandle
         */
        tag._redrawHandle = function slider_redraw_handle() {
            var
            width,
            height,
            orientation;

            slider = this.getHtmlObject();
            orientation = this.getAttribute('data-orientation').getValue();

            if (orientation === 'horizontal') {
                height = slider.innerHeight() + 12;

                $(slider).find('.ui-slider-handle').css({
                    height: height + 'px',
                    lineHeight: parseInt(this.style.height, 10) + 10 + 'px'
                });
            } else {
                width = slider.innerWidth() + 12;
                $(slider).find('.ui-slider-handle').width(width);
            }
        };

        $(tag).on('onResize', function() {
            /*this._redrawHandle();*/
        });

        /*
         if (tag._redrawHandle) {
         tag._redrawHandle();
         }
         */
    },
    onCreate: function(tag, param) {
    }
});
