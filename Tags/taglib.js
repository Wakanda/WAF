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
/**
 * Core Element of WAF Framework
 *
 * @author			erwan carriou
 * @date			march 2010
 * @version			0.9
 *
 * @note
 */


// DATASOURCE
WAF.addWidget({
    type: 'dataSource',
    lib: 'WAF',
    description: 'Source',
    category: 'Data Source',
    img: '../icons/dataSource.png',
    tag: 'meta',
    attributes: [
        {
            name: 'data-source',
            description: 'Source',
            category: 'General'
        },
        {
            name: 'data-source-type',
            description: 'Kind of source',
            tooltip: 'array, object, scalar, dataClass',
            defaultValue: 'dataClass',
            visibility: 'hidden',
            type: 'dropdown',
            options: ['array', 'object', 'scalar', 'dataClass'],
            category: 'General'
        },
        {
            name: 'data-dataType',
            description: 'Variable Type',
            defaultValue: 'string',
            type: 'dropdown',
            options: [{
                    key: 'string',
                    value: 'String'
                }, {
                    key: 'number',
                    value: 'Number'
                }, {
                    key: 'boolean',
                    value: 'Boolean'
                }, {
                    key: 'date',
                    value: 'Date'
                }],
            tooltip: 'if source kind is scalar, then is used :  number, string, date, ...',
            category: 'General'
        },
        {
            name: 'data-attributes',
            description: 'Attributes',
            visibility: 'hidden',
            tooltip: 'property1:type1, property2:type2, ....  par ex  name:string,salary:number',
            category: 'General'
        },
        {
            name: 'data-autoLoad',
            defaultValue: 'true',
            type: 'checkbox',
            description: 'Initial Query'
        },
        {
            name: 'data-initialQueryString',
            defaultValue: '',
            description: 'Initial Query String'
        },
        {
            name: 'data-initialOrderBy',
            defaultValue: '',
            description: 'Initial Order By'
        },
        {
            name: 'name',
            defaultValue: 'WAF.config.datasources',
            visibility: 'hidden'
        },
        {
            name: 'content',
            defaultValue: '',
            visibility: 'hidden'
        }
    ],
    style: [
        {
            name: 'width',
            defaultValue: '1px'
        },
        {
            name: 'height',
            defaultValue: '1px'
        }],
    events: [
        {
            name: 'onAttributeChange',
            description: 'On Change',
            category: 'Datasource Events'
        },
        {
            name: 'onBeforeCurrentElementChange',
            description: 'On Before Current Element Change',
            category: 'Datasource Events'
        },
        {
            name: 'onCurrentElementChange',
            description: 'On Current Element Change',
            category: 'Datasource Events'
        },
        {
            name: 'onElementSaved',
            description: 'On Element Saved',
            category: 'Datasource Events'
        },
        {
            name: 'onCollectionChange',
            description: 'On Collection Change',
            category: 'Datasource Events'
        }
    ],
    onInit: function(config) {
        config['binding'] = config['data-source'];
        if (config['data-autoLoad'] === null) {
            config['data-autoLoad'] = 'true';
        }
        return WAF.dataSource.create(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
    }
});


// DOCUMENT
WAF.addWidget({
    type: 'document',
    lib: 'WAF',
    description: 'Document',
    category: 'Hidden',
    img: '../icons/document.png',
    tag: 'div',
    attributes: [
        {
            name: 'id',
            visibility: 'hidden'
        },
        {
            name: 'data-title',
            description: 'Title'
        },
        {
            name: 'data-entire-model',
            defaultValue: 'false',
            type: 'checkbox',
            description: 'Load entire model',
            onclick: function(value) {
                var tabMeta = Designer.env.document.getElementsByAttribute('meta', 'name', 'WAF.catalog'),
                meta = {},
                tabLine = null,
                retLine = null,
                dcName = '',
                name = '',
                dsNames = [],
                hashRestrict = {},
                tabRestrict = [],
                customRestrict = '',
                restrict = '',
                i = 0,
                length = 0;

                if (tabMeta.length === 0) {
                    for (dcName in Designer.env.ds.dataClassesUsed) {
                        dsNames.push(dcName);
                    }

                    restrict = dsNames.join(',');

                    tabLine = Designer.env.document.createTextNode('\t\t');
                    Designer.env.document.head.appendChild(tabLine);

                    meta = Designer.env.document.createElement('meta');
                    meta.setAttribute('name', 'WAF.catalog');
                    meta.setAttribute('content', restrict);

                    Designer.env.document.head.appendChild(meta);

                    retLine = Designer.env.document.createTextNode('\n');
                    Designer.env.document.head.appendChild(retLine);

                } else {

                    meta = tabMeta[0];

                    customRestrict = meta.getAttribute('content');

                    if (!this.htmlObject[0].checked) {
                        for (dcName in Designer.env.ds.dataClassesUsed) {
                            dsNames.push(dcName);
                        }

                        restrict = dsNames.join(',');

                        if (restrict) {
                            if (customRestrict) {
                                customRestrict = customRestrict + ',' + restrict;
                            } else {
                                customRestrict = restrict;
                            }
                        }

                        // remove redondance
                        tabRestrict = customRestrict.split(',');
                        length = tabRestrict.length;
                        for (i = 0; i < length; i++) {
                            hashRestrict[tabRestrict[i].trim()] = 'ok';
                        }

                        tabRestrict = [];
                        for (name in hashRestrict) {
                            if (name !== '*') {
                                tabRestrict.push(name);
                            }
                        }
                        customRestrict = tabRestrict.join(',');

                        meta.setAttribute('content', customRestrict);
                    } else {
                        meta.setAttribute('content', '*');

                    }

                }
                Designer.studio.setDirty();

            }
        },
        {
            name: 'data-platform',
            description: 'Target',
            category: 'Platform',
            type: 'dropdown',
            options: [
                {
                    key: 'desktop',
                    value: 'Desktop'
                },
                {
                    key: 'auto',
                    value: 'Automatic'
                },
                {
                    key: 'smartphone',
                    value: 'Smartphone'
                },
                {
                    key: 'tablet',
                    value: 'Tablet'
                }
            ],
            defaultValue: 'desktop',
            ready: function() {
                this.formPanel.hide();
            }
        },
        {
            name: 'data-viewport-width',
            description: 'Width',
            category: 'Viewport',
            type: 'textefield',
            defaultValue: 'device-width',
            autocomplete: ["device-width", "320", "768"],
            onchange: function() {

                manageViewportMetaTag("width", this.htmlObject[0].value);

            },
            ready: function() {

                $(this.formPanel._htmlObject).find(".actions").click(function() {

                    (D.prop_section_Viewport_isOpen) ? D.prop_section_Viewport_isOpen = false : D.prop_section_Viewport_isOpen = true;

                });

                if (D.prop_section_Viewport_isOpen === undefined || !D.prop_section_Viewport_isOpen) {
                    $(this.formPanel._htmlObject).removeClass("selected");
                    D.prop_section_Viewport_isOpen = false;
                }

                if (!D.env.platform || D.env.platform === "desktop") {
                    this.formPanel.hide();
                }

            }
        },
        {
            name: 'data-viewport-height',
            description: 'Height',
            category: 'Viewport',
            type: 'textefield',
            defaultValue: '',
            autocomplete: ["device-height", "480", "1024"],
            onchange: function() {

                manageViewportMetaTag("height", this.htmlObject[0].value);

            }
        },
        {
            name: 'data-viewport-initial-scale',
            description: 'Initial Scale',
            category: 'Viewport',
            type: 'textefield',
            defaultValue: '1.0',
            style: {
                width: '50px'
            },
            onchange: function() {

                manageViewportMetaTag("initial-scale", this.htmlObject[0].value);

            }
        },
        {
            name: 'data-viewport-maximum-scale',
            description: 'Maximum Scale',
            category: 'Viewport',
            type: 'textefield',
            defaultValue: '1.0',
            style: {
                width: '50px'
            },
            onchange: function() {

                manageViewportMetaTag("maximum-scale", this.htmlObject[0].value);

            }
        },
        {
            name: 'data-viewport-minimum-scale',
            description: 'Minimum Scale',
            category: 'Viewport',
            type: 'textefield',
            defaultValue: '1.0',
            style: {
                width: '50px'
            },
            onchange: function() {

                manageViewportMetaTag("minimum-scale", this.htmlObject[0].value);

            }
        },
        {
            name: 'data-viewport-user-scalable',
            description: 'User Scalable',
            category: 'Viewport',
            type: 'checkbox',
            defaultValue: true,
            onclick: function() {

                manageViewportMetaTag("user-scalable", this.htmlObject[0].checked);

            }
        },
        {
            name: 'data-apple-meta-tags-web-app',
            description: 'Web App Capable',
            category: 'iOs Meta Tags',
            type: 'checkbox',
            defaultValue: false,
            onclick: function() {

                // Add both Android & Apple-specific tags (Android should support apple's tag for a while but it is supposed to be removed soon
                var metaTags = ['apple-mobile-web-app-capable', 'mobile-web-app-capable'],
                that = this;

                metaTags.forEach(function(tagName) {
                    var tabMeta = Designer.env.document.getElementsByAttribute('meta', 'name', tagName),
                    meta = {},
                    tabLine = null,
                    retLine = null;

                    if (tabMeta.length === 0) {

                        tabLine = Designer.env.document.createTextNode('\t\t');
                        Designer.env.document.head.appendChild(tabLine);

                        meta = Designer.env.document.createElement('meta');
                        meta.setAttribute('name', tagName);
                        meta.setAttribute('content', "yes");

                        Designer.env.document.head.appendChild(meta);

                        retLine = Designer.env.document.createTextNode('\n');
                        Designer.env.document.head.appendChild(retLine);

                    } else {

                        meta = tabMeta[0];

                        if (!that.htmlObject[0].checked) {
                            meta.setAttribute('content', "no");
                        } else {
                            meta.setAttribute('content', "yes");
                        }

                    }
                });


                Designer.studio.setDirty();
            },
            ready: function() {

                if (!D.env.platform || D.env.platform === "desktop") {
                    this.formPanel.hide();
                } else {

                    $(this.formPanel._htmlObject).find(".actions").click(function() {

                        (D.prop_section_iosTag_isOpen) ? D.prop_section_iosTag_isOpen = false : D.prop_section_iosTag_isOpen = true;

                    });

                    if (D.prop_section_iosTag_isOpen === undefined || !D.prop_section_iosTag_isOpen) {
                        $(this.formPanel._htmlObject).removeClass("selected");
                        D.prop_section_iosTag_isOpen = false;
                    }
                }

            }
        },
        {
            name: 'data-apple-meta-tags-tel',
            description: 'Format Detection',
            category: 'iOs Meta Tags',
            type: 'checkbox',
            defaultValue: true,
            onclick: function() {

                var tabMeta = Designer.env.document.getElementsByAttribute('meta', 'name', 'format-detection'),
                meta = {},
                tabLine = null,
                retLine = null;

                if (tabMeta.length === 0) {

                    tabLine = Designer.env.document.createTextNode('\t\t');
                    Designer.env.document.head.appendChild(tabLine);

                    meta = Designer.env.document.createElement('meta');
                    meta.setAttribute('name', 'format-detection');
                    meta.setAttribute('content', "telephone=no");

                    Designer.env.document.head.appendChild(meta);

                    retLine = Designer.env.document.createTextNode('\n');
                    Designer.env.document.head.appendChild(retLine);

                } else {

                    meta = tabMeta[0];

                    if (!this.htmlObject[0].checked) {
                        meta.setAttribute('content', "telephone=no");
                    } else {
                        meta.setAttribute('content', "telephone=yes");
                    }

                }

                Designer.studio.setDirty();
            }
        },
        {
            name: 'data-apple-meta-tags-status-bar',
            description: 'Status Bar Style',
            category: 'iOs Meta Tags',
            type: 'dropdown',
            options: [
                {
                    key: 'default',
                    value: 'Default'
                },
                {
                    key: 'black',
                    value: 'Black'
                },
                {
                    key: 'black-translucent',
                    value: 'Black Translucent'
                }
            ],
            onchange: function() {

                var tabMeta = Designer.env.document.getElementsByAttribute('meta', 'name', 'apple-mobile-web-app-status-bar-style'),
                meta = {},
                tabLine = null,
                retLine = null,
                newValue = this.htmlObject[0].value;

                if (tabMeta.length === 0) {

                    tabLine = Designer.env.document.createTextNode('\t\t');
                    Designer.env.document.head.appendChild(tabLine);

                    meta = Designer.env.document.createElement('meta');
                    meta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
                    meta.setAttribute('content', newValue);

                    Designer.env.document.head.appendChild(meta);

                    retLine = Designer.env.document.createTextNode('\n');
                    Designer.env.document.head.appendChild(retLine);

                } else {

                    meta = tabMeta[0];
                    meta.setAttribute('content', newValue);

                }

                Designer.studio.setDirty();
            },
            defaultValue: 'default'
        },
        {
            name: 'data-workspace-device',
            description: 'Device',
            type: 'combo',
            reloadTag: true,
            ready: function() {
                var
                i,
                tag,
                json,
                device;

                tag = this.data.tag;
                json = Designer.resources.device;
                device = tag.getAttribute('data-workspace-device').getValue();

                if (!Designer.isNewPage()) {
                    this.addOption('custom', 'Custom');
                } else {
                    this._input.attr('disabled', 'disabled');
                    this._input.autocomplete('disable');
                }

                for (i in json) {
                    this.addOption(i, i);
                }

                this.select(device ? device : 'custom');

                //just remove scrollbar if needed
                if (D.isMobile) {
                    $("#waf-body").css("overflow", "hidden");
                }

                //this._parent.parent().hide();

            },
            onchange: function() {
                var
                tag,
                data,
                info,
                value,
                width,
                sizes,
                height;

                data = this.getData();
                value = this.getValue();
                tag = data.tag;
                info = D.util.getWorkspaceInfo(value, tag.getAttribute('data-workspace-orientation').getValue());

                tag.getAttribute('data-workspace-height').setValue(String(info.height));
                tag.getAttribute('data-workspace-width').setValue(String(info.width));

                $('#textInput-data-workspace-width').val(info.width);
                $('#textInput-data-workspace-height').val(info.height);

                $('#select-data-workspace-orientation').val(info.orientation);

                if (value === "custom") {
                    $("#textInput-data-workspace-width").get()[0].disabled = false;
                    $("#textInput-data-workspace-height").get()[0].disabled = false;
                    $("#select-data-workspace-orientation").closest("tr").hide();
                } else {
                    $("#textInput-data-workspace-width").get()[0].disabled = true;
                    $("#textInput-data-workspace-height").get()[0].disabled = true;
                    $("#select-data-workspace-orientation").closest("tr").show();
                }

                //manage scrollbar
                if (D.isMobile) {
                    $("#waf-body").css("overflow", "hidden");
                } else {
                    $("#waf-body").css("overflow", "auto");
                }

                tag.domUpdate();

            },
            category: 'Workspace'
        },
        {
            name: 'data-workspace-orientation',
            description: 'Orientation',
            type: 'select',
            reloadTag: true,
            options: [{
                    key: 'portrait',
                    value: 'Portrait'
                }, {
                    key: 'landscape',
                    value: 'Landscape'
                }],
            category: 'Workspace',
            ready: function() {
                var
                tag,
                attr,
                data,
                device,
                deviceVal;

                data = this.data;
                tag = data.tag;
                attr = tag.getAttribute('data-workspace-orientation');

                deviceVal = tag.getAttribute('data-workspace-device').getValue();

                if (deviceVal) {
                    device = Designer.resources.device[deviceVal];
                }

                if (!attr.getValue() && device) {
                    attr.setValue(device.defaultOrientation);
                }

                if (deviceVal === "custom") {
                    this.getHtmlObject().closest("tr").hide();
                }
            },
            beforechange: function() {
                var
                tag,
                info,
                data,
                width,
                height,
                oldValue,
                newValue;

                data = this.data;
                tag = data.tag;

                info = D.util.getWorkspaceInfo(tag.getAttribute('data-workspace-device').getValue(), this.getValue());

                tag.getAttribute('data-workspace-height').setValue(String(info.height));
                tag.getAttribute('data-workspace-width').setValue(String(info.width));

                $('#textInput-data-workspace-width').val(info.width);
                $('#textInput-data-workspace-height').val(info.height);

                D.env.workspace.orientation = info.orientation;
                D.env.workspace.height = info.height;
                D.env.workspace.width = info.width;

                tag.domUpdate();
            }
        },
        {
            name: 'data-workspace-width',
            description: 'Width',
            reloadTag: true,
            style: {
                width: '50px'
            },
            category: 'Workspace',
            onblur: function() {
                var
                tag,
                data,
                info,
                width,
                height,
                device,
                deviceInfo,
                orientation;

                data = this.data;
                tag = data.tag;

                width = this.getValue();
                height = tag.getAttribute('data-workspace-height').getValue();
                device = tag.getAttribute('data-workspace-device').getValue();
                orientation = tag.getAttribute('data-workspace-orientation').getValue();

                info = D.util.getWorkspaceInfo(device, orientation);

                if (width != info.width || height != info.height) {
                    waForm.components.get('combo-data-workspace-device').select('custom');
                }
            },
            ready: function() {
                var data = this.data,
                tag = data.tag,
                device = tag.getAttribute('data-workspace-device').getValue();

                if (device != "custom") {
                    this.getHtmlObject()[0].disabled = true;
                }
            }
        },
        {
            name: 'data-workspace-height',
            description: 'Height',
            reloadTag: true,
            style: {
                width: '50px'
            },
            category: 'Workspace',
            ready: function() {
                var data = this.data,
                tag = data.tag,
                device = tag.getAttribute('data-workspace-device').getValue();

                if (device != "custom") {
                    this.getHtmlObject()[0].disabled = true;
                }
            }
        },
        {
            name: 'data-texture-header',
            defaultValue: '',
            visibility: 'hidden',
            description: 'Header Texture'
        },
        {
            name: 'data-texture-footer',
            defaultValue: '',
            visibility: 'hidden',
            description: 'Footer Texture'
        },
        {
            name: 'class',
            description: 'Css class'
        },
        {
            name: 'data-group',
            defaultValue: '',
            visibility: 'hidden',
            description: 'Group'
        }
    ],
    events: [
        {
            name: 'onLoad',
            description: 'On Load',
            category: 'UI Events'
        }],
    style: [
        {
            name: 'z-index',
            defaultValue: '0'
        },
        {
            name: 'width',
            defaultValue: '0px'
        },
        {
            name: 'height',
            defaultValue: '0px'
        }],
    properties: {
        style: {
            theme: {
                /*
                 'orange'    : false,
                 'blue'      : false,
                 'inherited' : false,
                 'roundy'    : false
                 */
            },
            fClass: true,
            text: false,
            background: true,
            border: false,
            sizePosition: false,
            label: false
        }
    },
    onInit: function(config) {
        var
        i;

        // Hide displayed submenus
        if (WAF.PLATFORM.isTouch) {

            $(document).bind('touchstart', function() {
                if (event.target.nodeName == "HTML") {
                    $('.waf-menuItem .waf-menuBar').fadeOut(200, function() {
                        $('.waf-menuItem').not('.waf-tabView-tab').removeClass('waf-state-selected').removeClass('waf-state-active').removeClass('waf-state-hover');
                    });
                }

            });

        } else {

            $(document).bind('click', function() {
                $('.waf-menuItem .waf-menuBar').fadeOut(200);
                $('.waf-menuItem').not('.waf-tabView-tab').removeClass('waf-state-selected');
            });

        }

        /*
         * For Display block on oldest pages
         */
        $('body').css('display', 'block').addClass("waf-theme");

        /*for (i in WAF.widget.themes) {
         $('body').removeClass(WAF.widget.themes[i].key);
         }*/

    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var
        i,
        body,
        info,
        width,
        height,
        device,
        bgElement,
        marginTop,
        marginLeft,
        widthValue,
        orientation,
        heightValue,
        bgElementLayout,
        workspace = Designer.env.workspace;

        body = $('#waf-body');
        bgElement = $('#yui-gen7');

        device = tag.getAttribute('data-workspace-device').getValue();

        if (!Designer.isNewPage()) {
            if (!device) {

                if (Designer.env.platform == 'smartphone') {

                    device = "Apple iPhone";
                    orientation = Designer.resources.device[device].defaultOrientation;
                    widthValue = Designer.resources.device[device].width;
                    heightValue = Designer.resources.device[device].height;


                } else if (Designer.env.platform == 'tablet') {

                    device = "Apple iPad";
                    orientation = Designer.resources.device[device].defaultOrientation;
                    widthValue = Designer.resources.device[device].height;
                    heightValue = Designer.resources.device[device].width;

                }

                tag.getAttribute('data-workspace-device').setValue(device);
                tag.getAttribute('data-workspace-orientation').setValue(orientation);
                tag.getAttribute('data-workspace-width').setValue(widthValue);
                tag.getAttribute('data-workspace-height').setValue(heightValue);

            } else {

                orientation = tag.getAttribute('data-workspace-orientation').getValue();
                widthValue = tag.getAttribute('data-workspace-width').getValue();
                heightValue = tag.getAttribute('data-workspace-height').getValue();

            }
        } else {
            orientation = tag.getAttribute('data-workspace-orientation').getValue();
            widthValue = tag.getAttribute('data-workspace-width').getValue();
            heightValue = tag.getAttribute('data-workspace-height').getValue();
        }


        info = D.util.getWorkspaceInfo(device, orientation);

        width = !widthValue || widthValue == 'auto' ? null : parseInt(widthValue);
        height = !heightValue || heightValue == 'auto' ? null : parseInt(heightValue);

        if (width) {
            marginLeft = ($('#yui-gen6').width() / 2) - width / 2;
        } else {
            width = '100%';
            marginLeft = 'auto';
        }

        if (height) {
            marginTop = ($('#yui-gen6').height() / 2) - height / 2;
        } else {
            height = '100%';
            marginTop = 'auto';
        }

        if (marginLeft < 0) {
            marginLeft = 0;
        }

        if (marginTop < 0) {
            marginTop = 0;
        }


        body.css({
            'height': height,
            'width': width,
            'margin-top': marginTop,
            'margin-left': marginLeft,
            'z-index': 0
        });

        if (width != tag._tmpWidth || height != tag._tmpHeight) {
            Designer.resizeConstraintsWidgets();
        }

        tag._tmpWidth = width;
        tag._tmpHeight = height;

        bgElementLayout = bgElement.children('.yui-layout-bd');

        /*
         * Add background device
         */
        switch (device.toLowerCase()) {
            case 'ipad':
            case 'tablet':

                if (info.orientation == 'landscape') {
                    bgElementLayout.css('background-position', (marginLeft - 301) + 'px ' + (marginTop - 260) + 'px');
                } else {
                    bgElementLayout.css('background-position', (marginLeft - 180) + 'px ' + (marginTop - 240) + 'px');
                }
                break;

            case 'iphone':
            case 'smartphone':

                if (info.orientation == 'landscape') {
                    bgElementLayout.css('background-position', (marginLeft - 209) + 'px ' + (marginTop - 108) + 'px');
                } else {
                    bgElementLayout.css('background-position', (marginLeft - 108) + 'px ' + (marginTop - 208) + 'px');
                }
                break;

            default:
                /*bgElement.removeClass('studio-workspace-ipad');
                 bgElement.removeClass('studio-workspace-iphone');*/
                break;
        }

        if (info.orientation == 'landscape') {
            /*bgElement.addClass('studio-workspace-landscape');
             bgElement.removeClass('studio-workspace-portrait');*/
            bgElementLayout.css('background-image', 'url("/Resources/Web Components/GUIDesigner/images/' + workspace.backgroundImageLandscape + '")');
        } else {
            /*bgElement.addClass('studio-workspace-portrait');
             bgElement.removeClass('studio-workspace-landscape');*/
            bgElementLayout.css('background-image', 'url("/Resources/Web Components/GUIDesigner/images/' + workspace.backgroundImagePortrait + '")');
        }
    },
    onCreate: function(tag, param) {
        /*
         * Widget custom on file drop event
         */
        $(tag).bind('onFileDrop', function(e, data) {
            var
            tag,
            ext,
            tmp,
            reg,
            path,
            image,
            mouseX,
            mouseY,
            cleanPath,
            newTag;

            tag = this;
            path = data.path.cropedPath;
            mouseX = data.mouse.mouseX;
            mouseY = data.mouse.mouseY;
            ext = data.file.extension.toLowerCase();

            switch (ext) {
                /*
                 * Case of image
                 */
                case 'png':
                case 'jpg':
                case 'jpeg':
                case 'gif':
                case 'ico':
                    tmp = document.createElement('img');

                    tmp.setAttribute('src', data.path.fullPath);

                    document.body.appendChild(tmp);

                    tmp.onload = function() {
                        var
                        posX,
                        posY,
                        image;

                        posX = mouseX - (this.width / 2);
                        posY = mouseY - (this.width / 2);

                        /*
                         * Create image widget
                         */
                        image = D.createTag({
                            type: 'image',
                            left: posX,
                            top: posY,
                            parent: tag,
                            silentMode: true,
                            width: this.width,
                            height: this.height
                        });

                        image.getAttribute('data-src').setValue(path);

                        image.setCurrent();
                        image.onDesign(true);
                        image.domUpdate();

                        D.tag.refreshPanels();

                        /*
                         * Remove temporary image
                         */
                        $(this).remove();
                    };
                    break;

                default:
                    /*
                     * Case of component
                     */
                    if (path.indexOf('.' + Designer.constants.extension.webcomponent) > -1) {
                        cleanPath = path.split('WebFolder')[path.split('WebFolder').length - 1];
                        reg = new RegExp('\\\\', 'g');
                        cleanPath = cleanPath.replace(reg, '/');
                        
                        var p = Designer.dependency.manager._getComponentPath(cleanPath);
                        
                        if (Designer.dependency.manager.checkCyclingDependencies(p)) {
                            Designer.util.notify("Wrong action", "Unable to drop " + cleanPath + " due to cycling references.");
                            return false;
                        }
                        
                        
                        newTag = Designer.createTag({
                            type: 'component',
                            left: mouseX,
                            top: mouseY,
                            width: 200,
                            height: 200,
                            parent: tag,
                            silentMode: true
                        });

                        /*cleanPath = path.split('WebFolder')[path.split('WebFolder').length - 1];
                        reg = new RegExp('\\\\', 'g');
                        cleanPath = cleanPath.replace(reg, '/');*/

                        if (cleanPath.substring(cleanPath.length - 1, cleanPath.length) == '/') {
                            cleanPath = cleanPath.substring(0, cleanPath.length - 1);
                        }

                        if (cleanPath.substring(0, 1) == '/') {
                            cleanPath = cleanPath.replace('/', '');
                        }

                        newTag.getAttribute('data-path').setValue('/' + cleanPath);
                        // update the package manager
                        Designer.getPackageManager().addComponentPackage('/' + cleanPath);

                    }

                    /*
                     * Case of link
                     */
                    else {
                        newTag = D.createTag({
                            type: 'richText',
                            left: mouseX,
                            top: mouseY,
                            parent: tag,
                            silentMode: true
                        });

                        newTag.getAttribute('data-link').setValue(path);
                        newTag.getAttribute('data-text').setValue(path);
                    }

                    newTag.setCurrent();
                    newTag.onDesign(true);
                    newTag.domUpdate();

                    D.tag.refreshPanels();
                    break;
            }
        });
    }
});


// HTML TAG
WAF.addWidget({
    type: 'htmlTag',
    lib: 'html',
    description: 'tag html',
    category: 'Hidden',
    img: '../icons/htmlTag.png',
    tag: '',
    attributes: [],
    style: [
        {
            name: 'z-index',
            defaultValue: '0'
        },
        {
            name: 'width',
            defaultValue: '0px'
        },
        {
            name: 'height',
            defaultValue: '0px'
        }],
    events : [
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
        }],
    properties: {
        style: {
            theme: false,
            fClass: true,
            text: true,
            background: true,
            border: true,
            sizePosition: false,
            label: false
        }
    },
    onInit: function(config) {
    },
    onCreate: function(tag, param) {
        var atts = tag.getAttributes(),
        att = null,
        length = atts.count(),
        i = 0,
        id = tag.getAttribute('id').getValue(),
        elt = $('#' + id),
        domElt = document.getElementById(id),
        elts = [],
        text = '',
        textNode = null;

        if (domElt) {
            // add missing attributes
            for (i = 0; i < length; i++) {
                att = atts.get(i);
                //elt.attr(att.getName(), att.getValue());
                domElt.setAttribute(att.getName(), att.getValue());
            }
        }

        // add text if any inside the tag
        elts = Designer.getDocument().getElementsByAttribute(tag.getTag(), 'id', id);
        if (elts.length > 0) {
            text = elts[0].textContent();
        }

        if (text) {
            textNode = document.createElement('div');
            textNode.innerHTML = text;
            elt.append(textNode);
        }

    },
    onDesign: function(config, designer, tag, catalog, isResize) {
    }
});

/**
 * manage the viewport tag content for mobile pages
 * @method manageViewportMetaTag
 * @param {object} valueName
 * @param {object} newValue
 */
function manageViewportMetaTag(valueName, newValue) {

    var tabMeta = Designer.env.document.getElementsByAttribute('meta', 'name', 'viewport'),
    meta = {},
    tabLine = null,
    retLine = null,
    element = {},
    doc = D.getCurrent(),
    contentValue = "";

    //get current values
    element["width"] = doc.getAttribute("data-viewport-width").getValue(),
    element["height"] = doc.getAttribute("data-viewport-height").getValue();
    element["initial-scale"] = doc.getAttribute("data-viewport-initial-scale").getValue();
    element["minimum-scale"] = doc.getAttribute("data-viewport-minimum-scale").getValue();
    element["maximum-scale"] = doc.getAttribute("data-viewport-maximum-scale").getValue();
    element["user-scalable"] = doc.getAttribute("data-viewport-user-scalable").getValue();


    if (valueName === "user-scalable") {
        if (newValue) {
            newValue = "yes";
        } else {
            newValue = "no";
        }
    }

    //set new value for the given element
    element[valueName] = newValue;

    //rebuild the content string from stored values & new value
    $.each(element, function(index, value) {

        if (value != null && value + 0 != "0") {

            if (contentValue != "" && value != "yes") {
                contentValue = contentValue + ",";
            }

            if (value != "yes") {
                contentValue = contentValue + " " + index + " = " + value;
            }

        }

    });

    //manage the tag
    if (tabMeta.length === 0) {

        tabLine = Designer.env.document.createTextNode('\t\t');
        Designer.env.document.head.appendChild(tabLine);

        meta = Designer.env.document.createElement('meta');
        meta.setAttribute('name', 'viewport');
        meta.setAttribute('content', contentValue);

        Designer.env.document.head.appendChild(meta);

        retLine = Designer.env.document.createTextNode('\n');
        Designer.env.document.head.appendChild(retLine);

    } else {

        meta = tabMeta[0];
        meta.setAttribute('content', contentValue);

    }
    Designer.studio.setDirty();
}