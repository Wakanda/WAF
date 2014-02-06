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
    packageName: 'Widget/select',
    type: 'select',
    lib: 'WAF',
    description: 'Select',
    category: 'Form Controls',
    img: '/walib/WAF/widget/select/icons/widget-select.png',
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
            name: 'data-errorDiv',
            description: 'Error ID'
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
            name: 'data-limit',
            description: 'Display limit',
            type: 'textField',
            defaultValue: '20'
        }/*,
         {
         name         : 'data-options',
         description  : 'Options',
         type         : 'grid',
         defaultValue : '[]',
         reloadOnChange  : true,
         displayEmpty    : true, // if false grid is hidden if empty
         newRowEmpty     : false,
         columns      : [
         {
         name  : 'Value',
         type  : 'textField'
         },
         {
         name  : 'Label',
         type  : 'textField'
         },
         {
         name  : 'Selected',
         type  : 'radio'
         } 
         
         ],
         onRowClick : function(data) { 
         
         },
         afterRowAdd : function(data) {
         
         },
         afterRowDelete : function(data) {
         
         },
         ready       : function() {
         
         }                           
         }*/],
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
            defaultValue: '196px'
        },
        {
            name: 'height',
            defaultValue: '20px'
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
        state: [/*{
         label   : 'hover',
         cssClass: 'waf-state-hover'
         },*/{
                label: 'active',
                cssClass: 'waf-state-active'
            }]
    }/*,
     structure: [{
     description : 'Text',
     selector    : '.waf-select-label',
     style: {
     text        : true,
     background  : true,
     gradient    : true,
     textShadow  : true,
     innerShadow : true,
     border      : true
     },
     state : [{
     label   : 'hover',
     cssClass: 'waf-state-hover'
     },{
     label   : 'active',
     cssClass: 'waf-state-active'
     }]
     },{
     description : 'Background',
     selector    : '.waf-select-mask',
     style       : {
     background  : true,
     gradient    : true,
     border      : true
     },
     state : [{
     label   : 'hover',
     cssClass: 'ui-state-hover',
     find    : '.ui-button'
     },{
     label   : 'active',
     cssClass: 'ui-state-active',
     find    : '.ui-button'
     }]
     }]*/,
    onInit: function(config) {
        var widget = new WAF.widget.Select(config);

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
        options = [],
        markup,
        visibleTextField,
        visibleText = "...",
        selectMask,
        selectLabel,
        selectButton,
        selectIcon,
        selectElement;

        tagWidth = tag.getWidth();
        tagHeight = tag.getHeight();
        tagTheme = D.getById("waf-body").getTheme();
        htmlObject = $('#' + tag.getId());
        buttonSize = 25;
        borderSize = parseInt(tag.getComputedStyle('border-width')) * 2;

        if (config["data-binding"] === "" && config["data-binding-options"] != null) {
            tag.getAttribute("data-binding-options").setValue("");
        }

        options = tag.getOptions();

        // markup = 
        // '<div class="waf-select-mask"><span class="waf-select-label"></span><span class="waf-select-icon"></span></div>'+
        // '<select name="">';

        selectMask = $('<div class="waf-select-mask"></div>');
        selectLabel = $('<span class="waf-select-label"></span>');
        selectButton = $('<span class="waf-select-button"></span>');
        selectIcon = $('<span class="waf-icon waf-icon-svg waf-select-icon">');
        selectIcon.svg({
            loadURL: '/walib/WAF/widget/select/skin/' + tagTheme + '/svg/widget-select-skin-' + tagTheme + '.svg',
            onLoad: function(svg) {
                svg.configure({
                    width: '100%',
                    height: '100%',
                    preserveAspectRatio: 'none'
                });
            }
        });
        selectButton.append(selectIcon);

        selectElement = '<select name="">';

        if (options && (options != undefined || options.length != 0)) {
            $.each(options, function(index, val) {

                if (index === 0) {
                    visibleText = val["label"];
                }

                if (val.Selected) {
                    select += '<option value="' + val["value"] + '" selected>' + val["label"] + '</option>';
                    visibleText = val["label"];
                } else {
                    selectElement += '<option value="' + val["value"] + '">' + val["label"] + '</option>';
                }
            });
        } else {
            visibleText = "...";
        }

        selectElement += '</select>';

        selectLabel
        .css('line-height', tagHeight - borderSize + 'px')
        .html(visibleText);

        selectMask.append(selectLabel, selectButton);
        htmlObject
        .empty()
        .append(selectMask, selectElement);


    }
});
