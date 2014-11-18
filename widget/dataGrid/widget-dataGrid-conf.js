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
    packageName: 'Widget/dataGrid',
    type: 'dataGrid',
    lib: 'WAF',
    category: 'Automatic Controls',
    description: 'Grid',
    img: '/walib/WAF/widget/dataGrid/icons/widget-dataGrid.png',
    attributes: [{
            name: 'data-binding',
            description: 'Source'
        }, {
            name: 'data-columns',
            description: 'Columns',
            type: 'textarea'
        }, {
            name: 'class',
            description: 'Css class'
        }, {
            name: 'data-label',
            description: 'Label',
            defaultValue: ''
        }, {
            name: 'data-label-position',
            description: 'Label position',
            defaultValue: 'top'
        }, {
            name: 'data-draggable',
            description: 'Draggable',
            type: 'checkbox',
            platform: 'desktop'

        }, {
            name: 'data-resizable',
            description: 'Resizable',
            type: 'checkbox',
            platform: 'desktop'
        }, {
            name: 'data-readOnly',
            description: 'Read only',
            type: 'checkbox'
        }, {
            name: 'data-header-hide',
            description: 'Hide header',
            type: 'checkbox'
        }, {
            name: 'data-footer-hide',
            description: 'Hide footer',
            type: 'checkbox'
        }, {
            name: 'data-selection-mode',
            description: 'Selection mode',
            defaultValue: 'single',
            type: 'dropdown',
            options: [{
                    key: 'single',
                    value: 'Single'
                }, {
                    key: 'multiple',
                    value: 'Multiple'
                }]
        }, {
            name: 'data-display-error',
            description: 'Display errors',
            type: 'checkbox',
            category: 'Error Handling',
            defaultValue: 'true'
        }, {
            name: 'data-errorDiv',
            description: 'Error ID',
            category: 'Error Handling'
        }, {
            name: 'data-error-div',
            visibility: 'hidden'
        }, {
            name: 'data-footer-text',
            description: 'Footer count text',
            defaultValue: 'item(s)'
        }, {
            name: 'data-column',
            description: 'Columns',
            type: 'grid',
            defaultValue: '[]',
            reloadOnChange: true,
            newRowEmpty: false,
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
                        var tag, valid, htmlObject, attributeName;

                        tag = this.data.tag;
                        htmlObject = this.getHtmlObject();

                        /*
                         * Check if attribute is valid
                         */
                        attributeName = this.getValue();
                        valid = Designer.ds.isPathValid(tag.getSource() + '.' + attributeName);

                        if (!valid) {
                            htmlObject.addClass('studio-form-invalid');
                        }
                        else {
                            htmlObject.removeClass('studio-form-invalid');
                        }
                    },
                    onfocus: function() {
                        this.data.attID = this.getValue();
                    }

                }],
            toolbox: [{
                    name: 'format',
                    type: 'textField'
                }, {
                    name: 'width',
                    type: 'textField'
                }, {
                    title: 'read only',
                    name: 'readOnly',
                    type: 'checkbox'
                }],
            ready: function() {
                var tag;

                tag = this.data.tag;

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
                var tag, dsObject, attributes, firstAttribute;

                tag = this.data.tag;

                dsObject = Designer.env.ds.catalog.getByName(tag.getSource());
                if (dsObject && dsObject.getType().match(new RegExp('(array)|(object)'))) {
                    attributes = dsObject.getTag().getAttribute('data-attributes').getValue().split(',');
                    firstAttribute = attributes[0].split(':')[0];
                }
                else if (dsObject) {
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
            onsave: function(data) {
                var tag, columns, value, check;

                try {
                    tag = data.tag;
                    columns = tag.getColumns();

                    /*
                     * Clear columns
                     */
                    columns.clear();

                    /*
                     * Get new rows
                     */
                    $.each(data.value.rows, function() {
                        var colID, oldID, name, value, column, bodySelector, newBodySelector, headerSelector, newHeaderSelector;

                        column = new WAF.tags.descriptor.Column();

                        $.each(this, function(i) {
                            name = this.component.name;
                            value = this.value;

                            if (name == 'sourceAttID') {
                                colID = value;
                                oldID = this.component.data.attID;
                                column.getAttribute('colID').setValue(value.replace(/\./g, '_'));

                                /*
                                 * Keep column css style even if attribute is changed
                                 */
                                if (oldID && colID != oldID) {
                                    headerSelector = '#' + tag.getId() + ' .waf-widget-header .waf-dataGrid-col-' + oldID.replace(/\./g, '_');
                                    newHeaderSelector = '#' + tag.getId() + ' .waf-widget-header .waf-dataGrid-col-' + colID.replace(/\./g, '_');

                                    $(D.tag.style.getRules(new RegExp('^' + headerSelector + '\\b'))).each(function(i, rule) {
                                        D.tag.style.interfaceSheet.addRule(newHeaderSelector, rule.style.cssText);
                                    });

                                    /*
                                     * Delete old ones
                                     */
                                    D.tag.style.deleteRules(new RegExp('^' + headerSelector + '\\b'));

                                    bodySelector = '#' + tag.getId() + ' .waf-widget-body .waf-dataGrid-col-' + oldID.replace(/\./g, '_');
                                    newBodySelector = '#' + tag.getId() + ' .waf-widget-body .waf-dataGrid-col-' + colID.replace(/\./g, '_');

                                    $(D.tag.style.getRules(new RegExp('^' + bodySelector + '\\b'))).each(function(i, rule) {
                                        D.tag.style.interfaceSheet.addRule(newBodySelector, rule.style.cssText);
                                    });

                                    /*
                                     * Delete old ones
                                     */
                                    D.tag.style.deleteRules(new RegExp('^' + bodySelector + '\\b'));
                                }
                            }

                            column.getAttribute(name).setValue(value);
                        });



                        columns.add(column);
                    });

                    /*
                     * Refresh selector
                     */
                    tag.displayInfo();

                }
                catch (e) {
                    console.log(e);
                }
            }

        }],
    events: [{
            name: 'onCellClick',
            description: 'On Cell Click',
            category: 'Grid Events'

        }, {
            name: 'onRowClick',
            description: 'On Row Click',
            category: 'Grid Events'

        }, {
            name: 'onRowDblClick',
            description: 'On Row Double Click',
            category: 'Grid Events'

        }, {
            name: 'onRowRightClick',
            description: 'On Row Right Click',
            category: 'Grid Events'

        }, {
            name: 'onRowDraw',
            description: 'On Row Draw',
            category: 'Grid Events'

        }, {
            name: 'onError',
            description: 'On Error Handler',
            category: 'Grid Events'

        }, {
            name: 'onHeaderClick',
            description: 'On Header Click',
            category: 'Grid Events'
        }/*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/],
    columns: {
        attributes: [{
                name: 'sourceAttID'
            }, {
                name: 'colID'
            }, {
                name: 'format'
            }, {
                name: 'width'
            }, {
                name: 'title'
            }],
        events: []
    },
    properties: {
        style: {
            theme: {
                'roundy': false
            },
            fClass: true,
            text: true,
            background: true,
            border: true,
            sizePosition: true,
            label: true,
            shadow: true,
            disabled: ['border-radius']
        }
    },
    structure: [{
            description: 'cells',
            selector: '.waf-dataGrid-cell',
            style: {
                text: true,
                textShadow: true,
                background: true,
                border: true,
                disabled: ['border-radius']
            },
            state: [{
                    label: 'hover',
                    cssClass: 'waf-state-hover',
                    find: '.waf-dataGrid-cell'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-dataGrid-cell'
                }]
        }, {
            description: 'header / cells',
            group: 'header',
            selector: '.waf-dataGrid-header .waf-dataGrid-cell',
            style: {
                text: true,
                textShadow: true,
                background: true,
                border: true,
                disabled: ['border-radius']
            }
        }, {
            description: 'header',
            group: 'header',
            selector: '.waf-dataGrid-header',
            style: {
                text: true,
                textShadow: true,
                background: true,
                border: true,
                disabled: ['border-radius']
            }
        }, {
            description: 'rows / even',
            group: 'rows',
            selector: '.waf-dataGrid-row.waf-widget-even',
            style: {
                text: true,
                textShadow: true,
                background: true,
                border: true,
                disabled: ['border-radius']
            }
        }, {
            description: 'rows / odd',
            group: 'rows',
            selector: '.waf-dataGrid-row.waf-widget-odd',
            style: {
                text: true,
                textShadow: true,
                background: true,
                border: true,
                disabled: ['border-radius']
            }
        }, {
            description: 'rows',
            group: 'rows',
            selector: '.waf-dataGrid-row',
            style: {
                text: true,
                textShadow: true,
                background: true,
                border: true,
                disabled: ['border-radius']
            },
            state: [{
                    label: 'hover',
                    cssClass: 'waf-state-hover',
                    find: '.waf-dataGrid-row'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-dataGrid-row'
                }, {
                    label: 'selected',
                    cssClass: 'waf-state-selected',
                    find: '.waf-dataGrid-row'
                }]
        }, {
            description: 'body',
            selector: '.waf-dataGrid-body',
            style: {
                text: true,
                textShadow: true,
                background: true,
                border: true,
                disabled: ['border-radius']
            }
        }, {
            description: 'footer',
            selector: '.waf-dataGrid-footer',
            style: {
                text: true,
                textShadow: true,
                background: true,
                border: true,
                disabled: ['border-radius']
            }
        }],
    onInit: function(config) {
        var grid = new WAF.widget.Grid(config);
        return grid;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var j, columns, structure, columnsCount;
       
        var i = 0, colWidth = tag.getAttribute('data-column-width') ? tag.getAttribute('data-column-width').getValue().split(',') : [], colName = _getAttrValue('data-column-name', ''), colAttribute = _getAttrValue('data-column-attribute', ''), colBinding = _getAttrValue('data-column-binding', ''), colColumn = _getAttrValue('data-column', ''), tagClass = tag.getAttribute('class').getValue(), grid = {}, isReadOnly = _getAttrValue('data-readOnly', 'false') === 'true', hideFooter = _getAttrValue('data-footer-hide', 'false') === 'true', hideHeader = _getAttrValue('data-header-hide', 'false') === 'true', textFooter = _getAttrValue('data-footer-text', 'item(s)'), tagID = tag.getAttribute('id').getValue();

        function _getAttrValue(inName, inDefault) {
            inDefault = inDefault;
            var attr = tag.getAttribute(inName);
            return attr ? attr.getValue() : inDefault;
        }

        /*
         * Add datasources attributes to widget structure
         */
        structure = tag.getStructures()
        columns = tag.getColumns();
        columnsCount = columns.count();

        // Remove old structures
        // TODO : Add a remove method into the descriptor API
        for (i in structure._list) {
            if (structure._list[i] && structure._list[i]._selector.match(new RegExp('(.waf-widget-body .waf-dataGrid-col)|(.waf-widget-header .waf-dataGrid-col)'))) {
                structure._list = structure._list.slice(0, i).concat(structure._list.slice(i + 1));
            }
        }

        for (j = 0; j < columnsCount; j += 1) {
            tag.addStructure({
                description: columns.get(j).getAttribute('title').getValue(),
                group: 'header column',
                selector: '.waf-widget-header .waf-dataGrid-col-' + columns.get(j).getAttribute('colID').getValue(),
                style: {
                    text: true,
                    background: true
                }
            });
        }

        for (j = 0; j < columnsCount; j += 1) {
            tag.addStructure({
                description: columns.get(j).getAttribute('title').getValue(),
                group: 'body column',
                selector: '.waf-widget-body .waf-dataGrid-col-' + columns.get(j).getAttribute('colID').getValue(),
                style: {
                    text: true,
                    background: true
                }
            });
        }

        if (!isResize) {

            grid = new WAF.classes.DataGrid({
                inDesign: true,
                id: tagID,
                render: tagID,
                dataSource: colBinding,
                binding: colBinding,
                columns: tag.getColumns().toArray(Designer.config.dataGrid.maxColumnDisplay - 1),
                colWidth: colWidth,
                cls: tagClass,
                hideFooter: hideFooter,
                hideHeader: hideHeader,
                textFooter: textFooter
            });

            grid.tag = tag;

            tag.grid = grid;

            // message if not binding
            if (tag.getColumns().count() === 0 && !config['data-binding']) {
                if ($('#' + tag.overlay.id + ' .message-binding-grid ').length === 0) {
                    if ($('#' + tag.overlay.id + ' .waf-dataGrid-body').length) {
                        $('<div class="message-binding-grid ">Drop a datasource<br> here</div>').appendTo($('#' + tag.overlay.id + ' .waf-dataGrid-body'));
                    } else {
                        $('<div class="message-binding-grid ">Drop a datasource<br> here</div>').appendTo($('#' + tag.overlay.id));
                    }
                }
            }
            else {
                $(tag.overlay.element).find('.message-binding-grid ').each(function(i) {
                    $(this).remove();
                });
            }

            // Adding row even/odd classNames
            // Could be tag.grid.gridController.gridView.refresh();
            // if row.rowNumber was really updated on widget-grid-view.js L949
            // (use of rowCount works)
            $(tag.overlay.element).find('.waf-dataGrid-row').each(function(i) {
                $(this).addClass(i % 2 ? 'waf-widget-odd' : 'waf-widget-even');
            });

            // hide toolbar
            if (hideFooter) {
                $('#' + tagID + ' .waf-widget-footer').hide();
            }
            else {
                $('#' + tagID + ' .waf-widget-footer').show();
            }

            // hide header
            if (hideHeader) {
                $('#' + tagID + ' .waf-widget-header').hide();
            }
            else {
                $('#' + tagID + ' .waf-widget-header').show();
            }

            // readOnly: Show/hide buttons		
            if (isReadOnly) {
                $("#" + tagID + " .waf-dataGrid-footer .waf-toolbar").hide();
            }
            else {
                $("#" + tagID + " .waf-dataGrid-footer .waf-toolbar").show();
            }
        }
        else {
            tag.refresh();
        }
    }

});
