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
    packageName:'Widget/checkbox',
    type: 'checkbox',
    lib: 'WAF',
    description: 'Checkbox',
    category: 'Form Controls',
    img: '/walib/WAF/widget/checkbox/icons/widget-checkbox.png',
    tag: 'div',
    attributes: [
        {
            name: 'type',
            defaultValue: 'checkbox'
        },
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
            name: 'data-checked',
            description: 'Checked',
            type: 'checkbox'
        },
        {
            name: 'data-label',
            description: 'Label',
            defaultValue: 'Label'
        },
        {
            name: 'data-label-position',
            description: 'Label position',
            defaultValue: 'right'
        },
        {
            name: 'tabindex',
            description: 'Tabindex'
        },
        {
            name: 'data-icon-default',
            description: 'Source (default)',
            tab: 'style',
            tabCategory: 'Icon',
            type: 'file'
        },
        {
            name: 'data-icon-hover',
            description: 'Source (hover)',
            tab: 'style',
            tabCategory: 'Icon',
            type: 'file'
        },
        {
            name: 'data-icon-active',
            description: 'Source (active)',
            tab: 'style',
            tabCategory: 'Icon',
            type: 'file'
        },
        {
            name: 'data-icon-selected',
            description: 'Source (selected)',
            tab: 'style',
            tabCategory: 'Icon',
            type: 'file'
        },
        {
            name: 'data-icon-disabled',
            description: 'Source (disabled)',
            tab: 'style',
            tabCategory: 'Icon',
            type: 'file'
        }],
    style: [
        {
            name: 'width',
            defaultValue: '16px'
        },
        {
            name: 'height',
            defaultValue: '16px'
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
            name: 'focus',
            description: 'On Focus',
            category: 'Focus Events'
        },
        {
            name: 'click',
            description: 'On Click',
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
        }/*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/],
    properties: {
        style: {
            theme: true,
            fClass: true,
            text: false,
            background: true,
            border: false,
            sizePosition: true,
            label: true,
            disabled: ['border-radius']
        }
    },
    structure: [{
            description: 'box',
            selector: '.waf-checkbox-box',
            style: {
                background: true,
                gradient: true,
                border: true
            },
            state: [{
                    label: 'hover',
                    cssClass: 'waf-state-hover'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active'
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected'
                }, {
                    label: 'focus',
                    cssClass: 'waf-state-focus'
                }, {
                    label: 'disabled',
                    cssClass: 'waf-state-disabled'
                }]
        }/*,{
         description : 'icon',
         selector    : '.waf-checkbox-icon',
         style: {
         background  : true,
         shadow      : true
         },
         state : [{
         label   : 'hover',
         cssClass: 'waf-state-hover'
         },{
         label   : 'active',
         cssClass: 'waf-state-active'
         },{
         label   : 'selected',
         cssClass: 'waf-state-selected'
         }]
         }*/],
    onInit: function(config) {
        return new WAF.widget.Checkbox(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var
        i,
        htmlObject,
        icon,
        icons,
        url,
        path,
        imgHtml,
        cssClass,
        theme;

        htmlObject = $('#' + tag.getId());
        theme = $.trim(tag.getTheme().replace('inherited', ''));

        if (!isResize) {
            $('<div class="waf-checkbox-box">').appendTo(htmlObject);

            icons = [];

            if (config['data-icon-default'])
                icons.push({
                    cssClass: 'waf-checkbox-icon-default',
                    value: config['data-icon-default']
                });
            if (config['data-icon-hover'])
                icons.push({
                    cssClass: 'waf-checkbox-icon-hover',
                    value: config['data-icon-hover']
                });
            if (config['data-icon-active'])
                icons.push({
                    cssClass: 'waf-checkbox-icon-active',
                    value: config['data-icon-active']
                });
            if (config['data-icon-selected'])
                icons.push({
                    cssClass: 'waf-checkbox-icon-selected',
                    value: config['data-icon-selected']
                });
            if (config['data-icon-disabled'])
                icons.push({
                    cssClass: 'waf-checkbox-icon-disabled',
                    value: config['data-icon-disabled']
                });

            cssClass = 'waf-icon waf-checkbox-icon';
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
                    //url = 'http://kpitalrisk.free.fr/images/stars/17000/s_toto1.jpg'

                    imgHtml = $('<img>');

                    imgHtml.addClass(icons[i].cssClass);

                    imgHtml.prop({
                        src: url
                    });

                    imgHtml.appendTo(icon);
                }
            } else {
                icon.svg({
                    loadURL: '/walib/WAF/widget/checkbox/skin/' + theme + '/svg/widget-checkbox-skin-' + theme + '.svg',
                    onLoad: function(svg) {
                        svg.configure({
                            width: '100%',
                            height: '100%',
                            preserveAspectRatio: 'none'
                        });
                    }
                });
            }

            icon.appendTo(htmlObject);
        }
    }
});
