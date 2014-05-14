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
    packageName: 'Widget/progressBar',
    type: 'progressBar',
    lib: 'WAF',
    description: 'Progress Bar',
    category: 'Misc. Controls',
    img: '/walib/WAF/widget/progressBar/icons/widget-progressBar.png',
    tag: 'div',
    attributes: [
        {
            name: 'data-progressinfo',
            description: 'Progress reference',
            typeValue: 'jsId'
        },
        {
            name: 'class',
            description: 'css class'
        },
        {
            name: 'data-showstop',
            description: 'Show stop button',
            type: 'checkbox',
            defaultValue: 'false'
        },
        {
            name: 'data-no-empty-display',
            description: "Hide if inactive",
            type: 'checkbox',
            defaultValue: 'false'
        },
        {
            name: 'data-label',
            description: 'Label',
            defaultValue: 'Progress on {curValue} out of {maxValue}'
        },
        {
            name: 'data-label-position',
            description: 'label position',
            defaultValue: 'top'
        }
    ],
    events: [
        /*{
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/
    ],
    style: [
        {
            name: 'width',
            defaultValue: '300px'
        },
        {
            name: 'height',
            defaultValue: function() {
                var result;
                if (typeof Designer !== "undefined") {
                    if (Designer && Designer.isMobile) {
                        result = "21px";
                    } else {
                        result = "20px";
                    }
                    return result;
                }
            }.call()
        }],
    properties: {
        style: {
            theme: true,
            fClass: true,
            text: false,
            background: true,
            border: true,
            sizePosition: true,
            shadow: true,
            disabled: ['border-radius']
        }
    },
    structure: [{
            description: 'range',
            selector: '.waf-progressBar-range',
            style: {
                background: true,
                text: true
            }
        }],
    onInit: function(config) {
        var progress = new WAF.widget.ProgressBar(config);
        return progress;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var height = tag.getHeight(),
        label = tag.getLabel();

        if (label) {
            label.getAttribute('data-text').setValue(tag.getAttribute('data-label').getValue());
            label.onDesign();
        }

        if (!isResize) {
            /*
             * add range div
             */
            $('<div class="waf-progressBar-range"><span>30%</span></div>')
            .css({
                width: '30%',
                lineHeight: height + 'px',
                '-webkit-background-size': height + 'px ' + height + 'px',
                '-moz-background-size': height + 'px ' + height + 'px',
                backgroundSize: height + 'px ' + height + 'px'
            }).appendTo('#' + tag.getId());
        } else {
            $('#' + tag.getId()).children('.waf-progressBar-range')
            .css({
                lineHeight: height + 'px',
                '-webkit-background-size': height + 'px ' + height + 'px',
                '-moz-background-size': height + 'px ' + height + 'px',
                backgroundSize: height + 'px ' + height + 'px'
            })
        }
    }
});
