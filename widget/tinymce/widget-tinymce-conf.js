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
    packageName: 'Widget/wysiwyg',
    type: 'wysiwyg',
    lib: 'WAF',
    description: 'WYSIWYG Editor',
    category: 'Form Controls',
    img: '/walib/WAF/widget/tinymce/icons/widget-tinymce.png',
    tag: 'div',
    attributes: [
        {
            name: 'data-binding',
            description: 'Source'
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
            name: 'data-toolbar-location',
            description: 'Toolbar location',
            type: 'comboBox',
            options: [
                {
                    key: 'top',
                    value: 'Top'
                },
                {
                    key: 'bottom',
                    value: 'Bottom'
                }
            ],
            defaultValue: 'top'
        },
        {
            name: 'data-toolbar-align',
            description: 'Align toolbar',
            type: 'comboBox',
            options: [
                {
                    key: 'left',
                    value: 'Left'
                },
                {
                    key: 'right',
                    value: 'Right'
                }
            ],
            defaultValue: 'left'
        },
        {
            name: 'data-save',
            description: 'Save automatically',
            type: 'checkbox',
            defaultValue: 'true'
        },
        {
            name: 'data-draggable',
            description: 'Draggable',
            type: 'checkbox'
        },
        {
            name: 'data-resizable',
            description: 'Resizable',
            type: 'checkbox'
        },
        {
            name: 'data-elements',
            description: 'Elements',
            type: 'grid',
            defaultValue: "[{'key':'newdocument','value':'New Document'},{'key':'save','value':'Save'},{'key':'|','value':'Separator'},{'key':'bold','value':'Bold'},{'key':'italic','value':'Italic'},{'key':'underline','value':'Underline'},{'key':'|','value':'Separator'},{'key':'justifyleft','value':'Justify To Left'},{'key':'justifycenter','value':'Justify To Center'},{'key':'justifyright','value':'Justify To Right'},{'key':'justifyfull','value':'Full Justify'},{'key':'|','value':'Separator'},{'key':'cut','value':'Cut'},{'key':'copy','value':'Copy'},{'key':'|','value':'Separator'},{'key':'undo','value':'Undo'},{'key':'redo','value':'Redo'},{'key':'|','value':'Separator'},{'key':'forecolor','value':'Text Color'}]",
            domAttribute: true,
            header: [],
            newRowEmpty: false,
            onRowClick: function(item) {

            },
            afterRowAdd: function(data) {

            },
            afterRowDelete: function(data) {
                var
                tag;

                tag = this.data.tag;

                this._executeSave();
                tag.onDesign(true);
            },
            afterRowSort: function(data) {
                var
                tag;

                tag = this.data.tag;

                this._executeSave();
                tag.onDesign(true);
            },
            beforeReady: function() {
                var
                rows;

                this.buttons.visible = false;
                rows = this.getRows();

                for (var i = 0; i < rows.length; i++) {
                    this.removeRow(i);
                }

            },
            ready: function() {
                var
                tag,
                that,
                parent,
                placeHolder,
                elements;

                placeHolder = this.buttons.placeHolder;
                parent = $(placeHolder);
                that = this;
                tag = that.getData().tag;

                // C'est un contournement, à voir avec Maxime
                this.json = null;

                new waForm.Button({
                    parent: parent,
                    buttonType: 'image',
                    icon: 'add',
                    onclick: function() {
                        tag.addElements && tag.addElements();
                    },
                    css: {
                        'float': that.buttons.align || 'right'
                    }
                });


                elements = JSON.parse(tag.getAttribute('data-elements').getValue().replace(/'/g, '"'));
                this._htmlObject.children('thead').remove();

                Designer.disableTransaction();

                for (var i = 0, elm; elm = elements[i]; i++) {

                    var
                    row,
                    htmlBtnObj,
                    htmlLabelObj;

                    this.addRow([{
                            'type': 'button',
                            'buttonType': 'image',
                            status: elm.key
                        }, {
                            type: 'label',
                            html: elm.value,
                            value: elm.value
                        }], false, false);

                    row = this.getRows()[i];

                    row._htmlObject.children('td').css({
                        padding: 0
                    });

                    row._element = elm;

                    htmlBtnObj = row.getItems()[0].htmlObject;

                    if (elm.key == '|') {
                        htmlBtnObj.addClass('mce_separator');
                        htmlBtnObj.css('background-image', 'url(/walib/WAF/widget/tinymce/icons/separator.png) !important');
                    }

                    else if (elm.key == '_') {
                        htmlBtnObj.addClass('mce_line');
                        htmlBtnObj.css('background-image', 'url(/walib/WAF/widget/tinymce/icons/line.png) !important');
                    }

                    else if (elm.key in {
                        'forecolor': '',
                        'backcolor': '',
                        'fontselect': '',
                        'fontsizeselect': '',
                        'formatselect': '',
                        'styleselect': '',
                        'tablecontrols': ''
                    }) {
                        htmlBtnObj.addClass('mce_' + elm.key);
                        htmlBtnObj.css('background-image', 'url(/walib/WAF/widget/tinymce/icons/' + elm.key + '.png) !important');
                        if (elm.key in {
                            'fontselect': '',
                            'fontsizeselect': '',
                            'formatselect': '',
                            'styleselect': ''
                        }) {
                            htmlBtnObj.width(60);
                        }
                    }

                    else {
                        htmlBtnObj.addClass('mce_' + elm.key);
                        htmlBtnObj.css('background-image', 'url(/walib/WAF/widget/tinymce/icons/icons.gif) !important');
                    }

                    htmlLabelObj = row.getItems()[1].htmlObject;
                    htmlLabelObj.parent().css({
                        'text-align': 'left'
                    });
                }
                Designer.enableTransaction();
            },
            columns: [{
                    title: 'icon',
                    name: 'key',
                    type: 'button'
                }, {
                    title: 'description',
                    name: 'value',
                    type: 'label'
                }],
            onsave: function(data) {

            },
            onchange: function() {

            }
        }
    ],
    style: [
        {
            name: 'width',
            defaultValue: '660px'
        },
        {
            name: 'height',
            defaultValue: '280px'
        }],
    events: [
        {
            name: 'onClick',
            description: 'On Click',
            category: 'Mouse Events'
        },
        {
            name: 'onDblClick',
            description: 'On Double Click',
            category: 'Mouse Events'
        },
        {
            name: 'onMouseDown',
            description: 'On Mouse Down',
            category: 'Mouse Events'
        },
        {
            name: 'onMouseUp',
            description: 'On Mouse Up',
            category: 'Mouse Events'
        },
        {
            name: 'onKeyDown',
            description: 'On Key Down',
            category: 'Key Events'
        },
        {
            name: 'onKeyPress',
            description: 'On Key Press',
            category: 'Key Events'
        },
        {
            name: 'onKeyUp',
            description: 'On Key Up',
            category: 'Key Events'
        },
        {
            name: 'onInit',
            description: 'On Init',
            category: 'Editor Events'
        },
        {
            name: 'onActivate',
            description: 'On Activate',
            category: 'Editor Events'
        },
        {
            name: 'onContextMenu',
            description: 'On Contextual Menu',
            category: 'Editor Events'
        },
        {
            name: 'onSubmit',
            description: 'On Submit',
            category: 'Editor Events'
        },
        {
            name: 'onPaste',
            description: 'On Paste',
            category: 'Editor Events'
        },
        {
            name: 'onBeforeGetContent',
            description: 'On Before Get Content',
            category: 'Editor Events'
        },
        {
            name: 'onSetContent',
            description: 'On Set Content',
            category: 'Editor Events'
        }/*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/
    ],
    properties: {
        style: {
            theme: false, // false to not display the "Theme" option in the "Theme & Class" section
            fClass: true, // true to display the "Class" option in the "Theme & Class" section
            text: false, // true to display the "Text" section
            background: false, // true to display widget "Background" section
            border: true, // true to display widget "Border" section
            sizePosition: true, // true to display widget "Size and Position" section
            label: true, // true to display widget "Label Text" and "Label Size and Position" sections
            disabled: ['border-radius']     // list of styles settings to disable for this widget
        }
    },
    structure: [],
    onInit: function(config) {
        var widget = new WAF.widget.TinyMCE(config);
        return widget;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var
        wysiwygConf,
        elements,
        textArea,
        htmlObj;

        textArea = $('<textarea>');
        htmlObj = tag.getHtmlObject();
        htmlObj.empty();

        textArea.prop('id', htmlObj.prop('id') + '-textarea');
        textArea.appendTo(htmlObj);

        elements = JSON.parse(config['data-elements'].replace(/'/g, '"'));

        // Init the tinyMCE
        wysiwygConf = {
            mode: "exact",
            elements: textArea.prop('id'),
            resizable: "no",
            plugins: "autolink,lists,spellchecker,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,autosave",
            theme: "advanced",
            theme_advanced_toolbar_location: config['data-toolbar-location'],
            theme_advanced_toolbar_align: config['data-toolbar-align'],
            theme_advanced_resizing: false,
            width: '100%',
            height: '100%',
            constrain_menus: true,
            skin: "o2k7",
            skin_variant: "silver",
            oninit: function() {
                var
                cm,
                inst;

                $('#' + config['id'] + '-textarea_ifr').remove();

                $('.mceIcon').click(function() {
                    return false;
                });

                inst = tinyMCE.getInstanceById(htmlObj.prop('id') + '-textarea');
                cm = inst.controlManager;

                cm.setDisabled('forecolor', true);
                cm.setDisabled('styleselect', true);
                cm.setDisabled('formatselect', true);
                cm.setDisabled('fontselect', true);
                cm.setDisabled('fontsizeselect', true);
                cm.setDisabled('backcolor', true);
            }

        };

        for (var i = 0, element, j = 1, k = 0; element = elements[i]; i++, k++) {
            wysiwygConf['theme_advanced_buttons' + j] = wysiwygConf['theme_advanced_buttons' + j] || "";

            if (element.key === '_') {
                j++;
                k = -1;
                continue;
            }
            if (k > 0) {
                wysiwygConf['theme_advanced_buttons' + j] += ',';
            }

            wysiwygConf['theme_advanced_buttons' + j] += element.key;
        }

        wysiwygConf['theme_advanced_buttons' + (j + 1)] = "";

        tinyMCE.init(wysiwygConf);

    },
    onCreate: function(tag, param) {
        var
        label = tag.getLabel();

        if (!param._isLoaded && label && label.getAttribute) {
            label.getAttribute('data-valign') && label.getAttribute('data-valign').setValue('top');
            label.onDesign(true);
            label.domUpdate();
        }

        tag.allElements = [
            {
                'key': 'save',
                'value': 'Save'
            }, {
                'key': 'newdocument',
                'value': 'New Document'
            }, {
                'key': 'bold',
                'value': 'Bold'
            }, {
                'key': 'italic',
                'value': 'Italic'
            }, {
                'key': 'underline',
                'value': 'Underline'
            }, {
                'key': 'strikethrough',
                'value': 'Strike Through'
            }, {
                'key': 'justifyleft',
                'value': 'Justify To Left'
            }, {
                'key': 'justifycenter',
                'value': 'Justify To Center'
            }, {
                'key': 'justifyright',
                'value': 'Justify To Right'
            }, {
                'key': 'justifyfull',
                'value': 'Full Justify'
            }, {
                'key': 'styleselect',
                'value': 'Style Selector'
            }, {
                'key': 'formatselect',
                'value': 'Format Selector'
            }, {
                'key': 'fontselect',
                'value': 'Font Selector'
            }, {
                'key': 'fontsizeselect',
                'value': 'Font Size Selector'
            }, {
                'key': 'cut',
                'value': 'Cut'
            }, {
                'key': 'copy',
                'value': 'Copy'
            }, {
                'key': 'paste',
                'value': 'Paste'
            }, {
                'key': 'pastetext',
                'value': 'Paste as Plain Text'
            }, {
                'key': 'pasteword',
                'value': 'Paste from Word'
            }, {
                'key': 'search',
                'value': 'Find'
            }, {
                'key': 'replace',
                'value': 'Find/Replace'
            }, {
                'key': 'bullist',
                'value': 'Bulleted List'
            }, {
                'key': 'numlist',
                'value': 'Numbred List'
            }, {
                'key': 'outdent',
                'value': 'Decrease Indent'
            }, {
                'key': 'indent',
                'value': 'Increase Indent'
            }, {
                'key': 'blockquote',
                'value': 'Block Quote'
            }, {
                'key': 'undo',
                'value': 'Undo'
            }, {
                'key': 'redo',
                'value': 'Redo'
            }, {
                'key': 'link',
                'value': 'Links'
            }, {
                'key': 'unlink',
                'value': 'Unlink'
            }, {
                'key': 'anchor',
                'value': 'Anchors'
            }, {
                'key': 'image',
                'value': 'Images'
            }, {
                'key': 'cleanup',
                'value': 'Cleanup Messy Code'
            }, {
                'key': 'help',
                'value': 'Help'
            }, {
                'key': 'code',
                'value': 'HTML Source'
            }, {
                'key': 'insertdate',
                'value': 'Insert Date'
            }, {
                'key': 'inserttime',
                'value': 'Insert Time'
            }, {
                'key': 'preview',
                'value': 'Preview'
            }, {
                'key': 'forecolor',
                'value': 'Text Color'
            }, {
                'key': 'backcolor',
                'value': 'Background Color'
            }, {
                'key': 'tablecontrols',
                'value': 'Table Controls'
            }, {
                'key': 'hr',
                'value': 'Horizontal Line'
            }, {
                'key': 'removeformat',
                'value': 'Remove Formatting'
            }, {
                'key': 'visualaid',
                'value': 'show/Hide Elements'
            }, {
                'key': 'sub',
                'value': 'Subscript'
            }, {
                'key': 'sup',
                'value': 'Superscript'
            }, {
                'key': 'charmap',
                'value': 'Special Character'
            }, {
                'key': 'emotions',
                'value': 'Emotions'
            }, {
                'key': 'iespell',
                'value': 'iespell'
            }, {
                'key': 'media',
                'value': 'Embedded Media'
            }, {
                'key': 'advhr',
                'value': 'Horizontal Line'
            }, {
                'key': 'print',
                'value': 'Print'
            }, {
                'key': 'ltr',
                'value': 'Left To Right'
            }, {
                'key': 'rtl',
                'value': 'Right To Left'
            }, {
                'key': 'fullscreen',
                'value': 'Full Screen'
            }, {
                'key': 'insertlayer',
                'value': 'Layers'
            }, {
                'key': 'moveforward',
                'value': 'Move Forward'
            }, {
                'key': 'movebackward',
                'value': 'Move Backward'
            }, {
                'key': 'absolute',
                'value': 'Absolute'
            }, {
                'key': 'styleprops',
                'value': 'Style Properties'
            }, {
                'key': 'spellchecker',
                'value': 'Spell Checker'
            }, {
                'key': 'cite',
                'value': 'Citation'
            }, {
                'key': 'abbr',
                'value': 'Abbreviation'
            }, {
                'key': 'acronym',
                'value': 'Acronym'
            }, {
                'key': 'del',
                'value': 'Deletion'
            }, {
                'key': 'ins',
                'value': 'Insertion'
            }, {
                'key': 'attribs',
                'value': 'Attributes'
            }, {
                'key': 'visualchars',
                'value': 'Visual Control Characters'
            }, {
                'key': 'nonbreaking',
                'value': 'Non-Breaking Space Character'
            }, {
                'key': 'template',
                'value': 'Template'
            }, {
                'key': 'blockquote',
                'value': 'Block Quotes'
            }, {
                'key': 'pagebreak',
                'value': 'Page Break'
            }, {
                'key': '_',
                'value': 'New Line'
            }, {
                'key': '|',
                'value': 'Separator'
            }];

        /**
         *
         */
        tag.getElementByKey = function get_element_by_key(key) {
            for (var i = 0, item; item = tag.allElements[i]; i++) {
                if (item.key === key) {
                    return item;
                }
            }
            return null;
        }

        /**
         *
         */
        tag.afterDestroy = function after_destroy(key) {
            var tinyMCEScripts = Designer.env.document.getElementsByAttribute('script', 'src', '/waLib/WAF/lib/tiny_mce/tiny_mce.js');
            if (Designer.env.tag.list.countByType(this.getType()) === 0) {
                $.each(tinyMCEScripts, function() {
                    this.remove();
                })
            }
        }

        /**
         *
         */
        tag.getDisplayedElements = function get_displayed_elements() {
            var
            elements;

            elements = JSON.parse(tag.getAttribute('data-elements').getValue().replace(/'/g, '"'));

            return elements;
        }

        /**
         *
         */
        tag.getDisplayedByKey = function get_displayed_by_key(key) {
            var
            displayedElements;

            displayedElements = tag.getDisplayedElements();

            for (var i = 0, item; item = displayedElements[i]; i++) {
                if (item.key === key) {
                    return item;
                }
            }
            return null;
        }

        /**
         *
         */
        tag.getAllElements = function get_all_elements() {
            var
            i,
            res,
            element,
            elements,
            displayedElements;

            res = [];
            elements = tag.allElements;
            displayedElements = tag.getDisplayedElements();

            for (i = 0; element = displayedElements[i]; i++) {
                element.display = true;
                res.push(element);
            }

            for (i = 0; element = elements[i]; i++) {
                if (tag.getDisplayedByKey(element.key)) {
                    continue;
                }
                else {
                    element.display = false;
                    res.push(element);
                }
            }

            return res;
        }


        /**
         * 
         */
        tag.addElements = function add_elemets() {
            var
            id,
            body,
            dialog,
            elements,
            divElements;

            dialog = null;
            body = $('<div>');
            divElements = $('<div>').prop({
                'class': "divElements"
            }).appendTo(body);
            elements = $('<ul>').prop({
                'class': "defaultSkin"
            }).appendTo(divElements);
            elements.sortable();
            id = 'waf-dialog-tinymce-modify-elements';

            if (document.getElementById(id)) {
                dialog = $("#" + id);
            } else {
                dialog = $('<div>');
            }

            dialog.prop({
                "id": id,
                "class": 'waf-form waf-tinymce-dialog',
                "title": 'Select the elements to include and click OK'
            });

            dialog.appendTo($('body'));

            //Construct the elements
            $.each(tag.getAllElements(), function(key, item) {
                var
                li,
                span;

                li = $('<li>').appendTo(elements);
                span = $('<span>').appendTo(li);
                span.prop('title', item.value)

                if (item.key != '|' && item.key != '_') {
                    span.addClass('mce_' + item.key);
                }

                else if (item.key == '|') {
                    span.addClass('mce_separator');
                }

                else if (item.key == '_') {
                    span.addClass('mce_line');
                }

                else if (item.key == 'forecolor') {
                    span.addClass('mce_forecolor');
                }

                span.click(function() {
                    $(this).toggleClass('selected');
                })
                .data({
                    key: item.key,
                    value: item.value
                });

                if (item.display) {
                    span.addClass('selected');
                }
            });

            dialog.
            html(body).
            dialog({
                resizable: false,
                modal: true,
                width: 500,
                minHeight: 0,
                close: function(event, ui) {
                    $(this).dialog('destroy');
                },
                buttons: {
                    'Select All': function() {
                        var
                        nbNewLines;

                        nbNewLines = elements.find('li span.mce_line').length;

                        if (nbNewLines <= 1) {
                            var
                            nbElements;

                            nbElements = elements.find('span').length;

                            for (var i = 1; i * 20 < nbElements; i++) {
                                var
                                li,
                                span;

                                li = $('<li>');
                                span = $('<span>').appendTo(li);

                                span
                                .addClass('mce_line selected')
                                .click(function() {
                                    $(this).toggleClass('selected');
                                })
                                .data({
                                    key: '_',
                                    value: 'New Line'
                                });

                                li.insertAfter(elements.find('li').eq(i * 20));
                            }
                        }

                        elements.find('span').addClass('selected');
                    },
                    'Deselect All': function() {
                        elements.find('span').removeClass('selected');
                    },
                    'Insert Line': function() {
                        var
                        li,
                        span;

                        li = $('<li>').appendTo(elements);
                        span = $('<span>').appendTo(li);

                        span
                        .addClass('mce_line selected')
                        .click(function() {
                            $(this).toggleClass('selected');
                        })
                        .data({
                            key: '_',
                            value: 'New Line'
                        });
                    },
                    'Insert Separator': function() {
                        var
                        li,
                        span;

                        li = $('<li>').appendTo(elements);
                        span = $('<span>').appendTo(li);

                        span
                        .addClass('mce_separator selected')
                        .click(function() {
                            $(this).toggleClass('selected');
                        })
                        .data({
                            key: '|',
                            value: 'Separator'
                        });
                    },
                    'Cancel': function() {
                        $(this).dialog('destroy');
                    },
                    'OK': function() {
                        var
                        selected,
                        newElems;

                        selected = elements.find('.selected');
                        newElems = [];

                        $.each(selected, function() {
                            var
                            data;

                            data = $(this).data();
                            newElems.push({
                                key: data.key,
                                value: data.value
                            })
                        });

                        tag.getAttribute('data-elements').setValue(JSON.stringify(newElems));
                        D.tag.refreshPanels();
                        tag.onDesign(true);
                        $(this).dialog('destroy');
                    }
                }
            });

            return dialog;
        }
    }

});
