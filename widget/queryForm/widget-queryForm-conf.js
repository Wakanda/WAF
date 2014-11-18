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
    packageName: 'Widget/queryForm',
    type: 'queryForm',
    lib: 'WAF',
    description: 'Query Form',
    category: 'Utilities',
    img: '/walib/WAF/widget/queryForm/icons/widget-queryForm.png',
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
            name: 'data-withoper',
            description: 'Show operators',
            type: 'checkbox'
        },
        {
            name: 'class',
            description: 'Css class'
        }, {
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
            newRowEmpty: false,
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
        }],
    style: [
        {
            name: 'width',
            defaultValue: '250px'
        },
        {
            name: 'height',
            defaultValue: '150px'
        }],
    events: [
        /*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/
    ],
    properties: {
        style: {
            theme: true,
            fClass: true,
            text: true,
            background: true,
            border: true,
            sizePosition: true,
            shadow: true,
            label: false,
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
        config.queryData = this.queryData;
        new WAF.widget.QueryForm(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var
        attrList,
        nameList,
        elt,
        options;

        attrList = [],
        nameList = [],
        elt = document.getElementById(tag.getAttribute('id').getValue());
        options = {
            isQueryForm: true,
            queryData: tag._config.queryData
        }

        // elt.setAttribute('class', '');
        elt.setAttribute('class', 'waf-widget waf-autoForm ');

        // Setting the theme
        if (tag.getTheme()) {
            $('#' + tag.getAttribute('id').getValue()).addClass(tag.getTheme());
        }

        if (tag.getAttribute('class')) {
            $('#' + tag.getAttribute('id').getValue()).addClass(tag.getAttribute('class').getValue().replace(',', ' '));
        }

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
            if (tag.resize.on) {
                tag.resize.on('endResize', function(evt) {
                    setTimeout('Designer.env.tag.current.onDesign(true)', 100);
                });
            }
            WAF.AF.buildForm(tag.getAttribute('id').getValue(), null, attrList, nameList, options, catalog, tag);

            // message if not binding
            if (nameList.length === 0 && !config['data-binding']) {
                if ($('#' + tag.overlay.id + ' .message-binding-queryform').length == 0) {
                    $('<div class="message-binding-queryform">Drop a datasource<br> here</div>').appendTo($('#' + tag.overlay.id));
                }
            } else {
                $(tag.overlay.element).find('.message-binding-queryform').each(function(i) {
                    $(this).remove();
                });
            }
        } else {
            $(elt).find('tbody').css({
                width: $(elt).width() + 'px',
                height: $(elt).height() - $(elt).find('thead').height() - $(elt).find('tfoot').height() + 'px'
            });
        }
    },
    queryData: {
        wildchar: WAF.wildchar,
        stringOpers: [
            "begins with",
            "=",
            "!=",
            ">",
            ">=",
            "<",
            "<=",
            "contains", // 7
            "contains keyword" // 8
        ],
        stringOper_begin_with: 0,
        stringOper_contains: 7,
        stringOper_contains_keyword: 8,
        numberOpers: [
            "=",
            "!=",
            ">",
            ">=",
            "<",
            "<=",
            "between" // 6
        ],
        numberOper_between: 6,
        dateOpers: [
            "=",
            "!=",
            ">",
            ">=",
            "<",
            "<=",
            "between"	// 6	
        ],
        dateOper_between: 6,
        appropriateOper: function(type) {
            var
            result;

            result = {};
            switch (type) {
                case "number":
                case "long":
                case "byte":
                case "word":
                case "long64":
                    result.operList = this.numberOpers;
                    result.defaultOper = 0;
                    break;

                case "date":
                    result.operList = this.dateOpers;
                    result.defaultOper = 0;
                    break;

                default:
                    result.operList = this.stringOpers;
                    result.defaultOper = 0;
                    break;
            }

            return result;
        },
        buildQueryNode: function(attName, attType, oper, paramnum) {
            var
            a,
            result,
            opertext,
            value = ':' + paramnum;

            result = "";

            switch (attType) {
                case "number":
                case "long":
                case "byte":
                case "word":
                case "long64":
                    if (oper == this.numberOper_between) {
                        a = value.split(',');
                        if (a.length > 1) {
                            result += '( ' + attName + ' >= ' + a[0] + ' and ' + attName + ' <= ' + a[1] + ' )';
                        } else {
                            result += attName + ' ' + this.numberOpers[oper] + ' ' + value;
                        }
                    } else {
                        result += attName + ' ' + this.numberOpers[oper] + ' ' + value;
                    }
                    break;

                case "date":
                    if (oper == this.dateOper_between) {
                        a = value.split(',');
                        if (a.length > 1) {
                            result += '( ' + attName + ' >= "' + a[0] + '" and ' + attName + ' <= "' + a[1] + '" )';
                        } else {
                            result += attName + ' ' + this.dateOpers[oper] + ' ' + '"' + value + '"';
                        }

                    } else {
                        result += attName + ' ' + this.dateOpers[oper] + ' ' + '"' + value + '"';
                    }
                    break;


                default:
                    opertext = this.stringOpers[oper];
                    switch (oper) {
                        case this.stringOper_begin_with:
                            opertext = '=';
                            value = '"' + value + '"';
                            break;

                        case this.stringOper_contains:
                            opertext = '=';
                            value = '"' + this.wildchar + value + this.wildchar + '"';
                            break;

                        case this.stringOper_contains_keyword:
                            opertext = '%';
                            break;

                        default:
                            value = '"' + value + '"';
                            break;

                    }
                    result += attName + ' ' + opertext + ' ' + value;
                    break;
            }

            return result;
        }

    }
});
