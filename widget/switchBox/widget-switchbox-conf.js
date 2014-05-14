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
    packageName: 'Widget/switchbox',
    type: 'switchbox',
    lib: 'WAF',
    description: 'Switch',
    category: 'Form Controls',
    img: '/walib/WAF/widget/switchBox/icons/widget-switchbox.png',
    tag: 'div',
    aspectRatio: true,
    attributes: [
        {
            name: 'type',
            defaultValue: 'checkbox'
        },
        {
            name: 'data-binding',
            description: 'Source',
            context: ['allowBind']
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
            description: 'On by default',
            type: 'checkbox',
            onclick: function() {
                D.getCurrent().slide(this.htmlObject[0].checked);
            },
            context: ['protected']
        },
        {
            name: 'data-off',
            description: 'Off text',
            type: 'textField',
            defaultValue: 'OFF',
            category: 'Texts',
            context: ['protected']
        },
        {
            name: 'data-on',
            description: 'On text',
            type: 'textField',
            defaultValue: 'ON',
            category: 'Texts',
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
        }
    ],
    style: [
        {
            name: 'width',
            defaultValue: '77px'
        },
        {
            name: 'height',
            defaultValue: '27px'
        }],
    events: [
        {
            name: 'touchstart',
            description: 'On Touch Start',
            category: 'Touch Events'
        },
        {
            name: 'touchmove',
            description: 'On Touch Move',
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
    structure: [
        {
            description: 'off container',
            selector: '.waf-switchbox-off',
            style: {
                //text        : true,
                background: true,
                //border      : true,
                gradient: true
            }
        },
        {
            description: 'on container',
            selector: '.waf-switchbox-on',
            style: {
                //text        : true,
                background: true,
                //border      : true,
                gradient: true
            }
        },
        {
            description: 'switch',
            selector: '.waf-switchbox-switch',
            style: {
                background: true,
                //border      : true,
                gradient: true
            }
        },
        {
            description: 'off text',
            selector: '.waf-switchbox-label-off',
            style: {
                text: true
            }
        },
        {
            description: 'on text',
            selector: '.waf-switchbox-label-on',
            style: {
                text: true
            }
        }],
    //},
    onInit: function(config) {
        return new WAF.widget.SwitchBox(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var
        i,
        htmlObject,
        slideObject,
        icon,
        icons,
        url,
        path,
        imgHtml,
        cssClass,
        theme,
        state = false;

        htmlObject = $('#' + tag.getId());
        slideObject = htmlObject.find(".waf-switchbox-container");

        /*htmlObject.unbind("click");
         htmlObject.bind("click",function(){ 
         
         var pos = Math.abs(parseInt(slideObject.css("margin-left")));
         if (!state) {
         tag.slide(true);
         state = true;
         } else {
         tag.slide(false);
         state = false;
         }
         
         });*/

        if (config["data-off"] === null) {
            config["data-off"] = "";
        }

        if (config["data-on"] === null) {
            config["data-on"] = "";
        }

        checkboxHtml = "<div class='waf-switchbox-container'><div class='waf-switchbox-on'><span class='waf-switchbox-label-on'>" + config["data-on"] + "</span></div><div class='waf-switchbox-switch'></div><div class='waf-switchbox-off'><span class='waf-switchbox-label-off'>" + config["data-off"] + "</span></div></div>";

        htmlObject.html(checkboxHtml);

        if (isResize) {
            htmlObject.css('line-height', tag.getHeight() + 'px');
        }

        tag.setCss('line-height', tag.getHeight() + 'px');

        tag.slide = function switchBox_slide(state) {

            window.setTimeout(function() {
                var contSize = Math.round(htmlObject.get()[0].offsetWidth / 1.6);
                if (!state) {

                    /*$('#'+tag.getId()).find(".waf-switchbox-container").animate({
                     marginLeft: -contSize+"px"
                     }, 500);*/
                    $('#' + tag.getId()).find(".waf-switchbox-container").css("margin-left", -contSize + "px");

                } else {

                    /*$('#'+tag.getId()).find(".waf-switchbox-container").animate({
                     marginLeft: "0px"
                     }, 500);*/
                    $('#' + tag.getId()).find(".waf-switchbox-container").css("margin-left", "0px");
                }

            }, 0);

        };

        if (config['data-checked'] === "false" || config['data-checked'] === "") {
            tag.slide(false);
        }

    }
});
