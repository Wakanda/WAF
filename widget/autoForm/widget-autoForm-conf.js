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
    packageName: 'Widget/autoForm',
    type: 'autoForm',
    lib: 'WAF',
    description: 'Auto Form',
    category: 'Utilities',
    img: '/walib/WAF/widget/autoForm/icons/widget-autoForm.png',
    tag: 'div',
    attributes: [
        {
            name: 'data-binding',
            description: 'Source'
        },
        {
            name: 'data-columns',
            description: 'Columns',
            type: 'textarea'
        },
        {
            name: 'class',
            description: 'Css class'
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
            name: 'data-display-error',
            description: 'Display errors',
            type: 'checkbox',
            category: 'Error Handling',
            defaultValue: 'true'
        },
        {
            name: 'data-errorDiv',
            description: 'Error ID',
            category: 'Error Handling'
        },
        {
            name: 'data-error-div',
            visibility: 'hidden'
        },
        {
            name: 'data-withoutTable',
            description: 'With included widgets',
            type: 'checkbox',
            defaultValue: 'true'
        },
        {
            name: 'data-resize-each-widget',
            description: 'Allow resizing of each widget',
            type: 'checkbox',
            defaultValue: 'true'
        },
        {
            name: 'data-resize-optimal-each-widget',
            description: 'Auto fit widgets',
            type: 'checkbox',
            defaultValue: 'true'
        },
        {
            name: 'data-column-attribute',
            description: 'Column attribute'
        },
        {
            name: 'data-column-name',
            description: 'Column name'
        },
        {
            name: 'data-column',
            description: 'Rows',
            type: 'grid',
            defaultValue: '[]',
            reloadOnChange: true,
            beforeReady: function() {
                var
                i,
                tag,
                json,
                colName,
                colAttribute;

                tag = this.data.tag;

                if (tag.getAttribute('data-column-name') && tag.getAttribute('data-column-attribute')) {
                    colName = tag.getAttribute('data-column-name').getValue().split(',');
                    colAttribute = tag.getAttribute('data-column-attribute').getValue().split(',');
                    json = [];

                    for (i in colName) {
                        if (colName[i] != '') {
                            json.push({
                                'title': colName[i],
                                'sourceAttID': colAttribute[i]
                            });
                        }
                    }
                }

                this.json = json;

                /*
                 * Hide form if no source binded
                 */
                if (!tag.getSource()) {
                    this.getForm().hide();
                }
            },
            afterRowAdd: function(data) {
                /*
                 * Add row with first datasource attribute
                 */
                var
                tag,
                dsObject,
                attributes,
                firstAttribute;

                tag = this.data.tag;

                dsObject = Designer.env.ds.catalog.getByName(tag.getSource());
                if (dsObject && dsObject.getType().match(new RegExp('(array)|(object)'))) {
                    attributes = dsObject.getTag().getAttribute('data-attributes').getValue().split(',');
                    firstAttribute = attributes[0].split(':')[0];
                } else if (dsObject) {
                    attributes = dsObject.getAttributes();
                    if (attributes[0]) {
                        firstAttribute = attributes[0].name;
                    }
                }

                if (data.items[0].getValue() == '' && data.items[1].getValue() == '') {
                    data.items[0].setValue(firstAttribute);
                    data.items[1].setValue(firstAttribute);
                }
            },
            columns: [{
                    title: 'label',
                    name: 'title',
                    type: 'textfield'
                }, {
                    title: 'attribute',
                    name: 'sourceAttID',
                    type: 'textfield',
                    typeValue: 'dataSource',
                    onblur: function() {
                        var
                        tag,
                        valid,
                        htmlObject,
                        attributeName;

                        tag = this.data.tag;
                        htmlObject = this.getHtmlObject();

                        /*
                         * Check if attribute is valid 
                         */
                        attributeName = this.getValue();
                        valid = Designer.ds.isPathValid(tag.getSource() + '.' + attributeName);

                        if (!valid) {
                            htmlObject.addClass('studio-form-invalid');
                        } else {
                            htmlObject.removeClass('studio-form-invalid');
                        }
                    },
                    onfocus: function() {
                        this.data.attID = this.getValue();
                    }
                }],
            onsave: function(data) {
                var
                tag,
                name,
                attribute,
                colNames,
                colAttributes;

                try {
                    tag = data.tag;
                    colNames = [];
                    colAttributes = [];

                    /*
                     * Get new rows
                     */
                    $.each(data.value.rows, function() {
                        name = this[0].value;
                        attribute = this[1].value;
                        if (name != '' && attribute != '') {
                            colNames.push(name);
                            colAttributes.push(attribute);
                        }
                    });

                    //tag.getAttribute
                    if (colNames.length > 0 && colAttributes.length > 0) {
                        tag.setAttribute('data-column-name', colNames.join(','));
                        tag.setAttribute('data-column-attribute', colAttributes.join(','));
                    }
                } catch (e) {
                    console.log(e);
                }

            }
        }
    ],
    events: [
        {
            name: 'onError',
            description: 'On Error Handler',
            category: 'Form Events'
        },
        {
            name: 'onReady',
            description: 'On Ready',
            category: 'UI Events'
        }],
    style: [
        {
            name: 'width',
            defaultValue: '250px'
        },
        {
            name: 'height',
            defaultValue: '250px'
        }],
    properties: {
        style: {
            theme: true,
            fClass: true,
            text: true,
            background: true,
            border: true,
            sizePosition: true,
            label: false,
            shadow: true,
            disabled: ['border-radius']
        }
    },
    structure: [{
            description: 'header',
            selector: '.waf-widget-header',
            style: {
                text: true,
                textShadow: true,
                background: true,
                border: true,
                disabled: ['border-radius']
            }
        }, {
            description: 'body',
            selector: '.waf-widget-body',
            style: {
                text: true,
                textShadow: true,
                background: true,
                disabled: ['border-radius']
            }
        }, {
            description: 'footer',
            selector: '.waf-widget-footer',
            style: {
                text: true,
                textShadow: true,
                background: true,
                disabled: ['border-radius']
            }
        }],
    onInit: function(config) {
        new WAF.widget.AutoForm(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var
        attrList,
        nameList,
        htmlObject,
        height,
        width,
        options,
        borderSize;

        attrList = [];
        nameList = [];
        htmlObject = tag.getHtmlObject();
        options = {};

        if (!isResize) {
            // Getting the names list
            if (tag.getAttribute('data-column-name') && tag.getAttribute('data-column-name').getValue() != '') {
                nameList = tag.getAttribute('data-column-name').getValue().split(',');
            }

            // Getting the attributes list
            if (tag.getAttribute('data-column-attribute') && tag.getAttribute('data-column-attribute').getValue() != '') {
                attrList = tag.getAttribute('data-column-attribute').getValue().split(',');
            }
          
            if (tag.getAttribute('data-columns') && tag.getAttribute('data-columns').getValue() != '' && !tag.getAttribute('data-column-name')) {
                attrList = tag.getAttribute('data-columns').getValue().split(',');
                nameList = tag.getAttribute('data-columns').getValue().split(',');                
            }
            
            // we limit the size of the column 
            if ((Designer.config.autoForm.maxAttributeDisplay - 1) < attrList.length) {
                var last = attrList[Designer.config.autoForm.maxAttributeDisplay - 1];
                attrList = attrList.slice(0, (Designer.config.autoForm.maxAttributeDisplay - 1));
                nameList = nameList.slice(0, Designer.config.autoForm.maxAttributeDisplay - 1);
                
                attrList.push(last);
                nameList.push('......');
            }
                        
            if (tag.resize && tag.resize.on) {
                tag.resize.on('endResize', function(evt) {
                    setTimeout('Designer.env.tag.current.onDesign(true)', 100);
                });
            }

            if (tag.getAttribute('data-withoutTable') && tag.getAttribute('data-withoutTable').getValue() === "true") {
                options.withoutTable = true;
            }

            if (tag.getAttribute('data-resize-each-widget') && tag.getAttribute('data-resize-each-widget').getValue() === "true") {
                options.allowResizeInput = true;
            }

            WAF.AF.buildForm(tag.getAttribute('id').getValue(), null, attrList, nameList, options, catalog, tag);
            // message if not binding
            if (nameList.length === 0) {
                if ($('#' + tag.overlay.id + ' .message-binding-autoform').length == 0 && !config['data-binding']) {
                    $('<div class="message-binding-autoform">Drop a datasource<br> here</div>').appendTo($('#' + tag.overlay.id));
                } else if (config['data-binding']) {
                    $(tag.overlay.element).find('.message-binding-autoform').each(function(i) {
                        $(this).remove();
                    });
                }
            } else {
                $(tag.overlay.element).find('.message-binding-autoform').each(function(i) {
                    $(this).remove();
                });
            }

        } else {
            /*
             * Resize body of the autoform
             */
            width = htmlObject.get();
            height = htmlObject.height();
            borderSize = parseInt(tag.getComputedStyle('border-width', '.waf-widget-header')) + parseInt(tag.getComputedStyle('border-width'))

            htmlObject.find('.waf-widget-body').css({
                width: width + 'px',
                height: height - htmlObject.find('.waf-widget-header').height() - htmlObject.find('.waf-widget-footer').height() - borderSize + 'px'
            });

        }

        /*
         * Remove scrollbar on design
         */
        htmlObject.find('.waf-widget-body').css('overflow', 'hidden !important');
    }
});
