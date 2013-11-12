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
    packageName: 'Widget/yahooWeather',
    type: 'yahooWeather',
    lib: 'WAF',
    description: 'Yahoo! Weather',
    category: 'External Widgets',
    img: '/walib/WAF/widget/yahooWeather/icons/widget-yahooWeather.png',
    include: [],
    tag: 'div',
    attributes: [
        {
            name: 'data-binding',
            defaultValue: '',
            description: 'Source'
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
        },
        {
            name: 'data-unit',
            description: 'Temperature scale',
            defaultValue: 'c',
            type: 'dropdown',
            options: [{
                    key: 'c',
                    value: 'Celsius'
                }, {
                    key: 'f',
                    value: 'Fahrenheit'
                }
            ]}],
    style: [
        {
            name: 'width',
            defaultValue: '264px'
        },
        {
            name: 'height',
            defaultValue: '209px'
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
        }],
    properties: {
        style: {
            theme: false,
            fClass: true,
            text: false,
            background: true,
            border: true,
            sizePosition: true,
            label: true,
            disabled: ['border-radius']
        }
    },
    onInit: function(config) {
        var widget = new WAF.widget.YahooWeather(config);
        $('#' + config['id']).addClass('waf-widget waf-yahooWeather').children('div').addClass('waf-container');
        return widget;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var className;

        className = tag.getTheme();
        if (tag.getAttribute('class')) {
            className += ' ' + tag.getAttribute('class').getValue().replace(',', ' ');
        }

        $('#' + tag.getAttribute('id').getValue())
        .append(
        $('<img />')
        .attr({
            src: '../walib/WAF/widget/yahooWeather/png/preview.png',
            width: 264,
            height: 253
        })
        .css({
            position: 'absolute',
            top: '-45px'
        })
        )
        .addClass(className);
    }
});
