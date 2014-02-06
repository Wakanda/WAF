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
    /**
     *  Widget Descriptor
     *
     */

    /* PROPERTIES */

    packageName: 'Widget/chart',
    // {String} internal name of the widget
    type: 'chart',
    test: "this is a test",
    // {String} library used ('waf', 'jquery', 'extjs', 'yui') (optional)
    lib: 'WAF',
    // {String} display name of the widget in the GUI Designer 
    description: 'Chart',
    // {String} category in which the widget is displayed in the GUI Designer
    category: 'Misc. Controls', //'Reporting',

    // {Array} css file needed by widget (optional)
    css: [],
    // {Array} script files needed by widget (optional) 
    include: [],
    // {String} type of the html tag ('div' by default)
    tag: 'div',
    // {Array} attributes of the widget. By default, we have 3 attributes: 'data-type', 'data-lib', and 'id', so it is unnecessary to add them
    // 
    // @property {String} name, name of the attribute (mandatory)     
    // @property {String} description, description of the attribute (optional)
    // @property {String} defaultValue, default value of the attribute (optional)
    // @property {'string'|'radio'|'checkbox'|'textarea'|'dropdown'|'integer'} type, type of the field to show in the GUI Designer (optional)
    // @property {Array} options, list of values to choose for the field shown in the GUI Designer (optional)
    attributes: [
        {
            name: 'data-binding',
            description: 'Source',
            type: 'string'
        }, {
            name: 'data-axisLabel',
            visibility: 'hidden'
        }, {
            name: 'data-chartType',
            defaultValue: 'Pie Chart',
            visibility: 'hidden'
        }, {
            name: 'data-chartLineType',
            defaultValue: 'basic',
            visibility: 'hidden'
        }, {
            name: 'data-tooltipDisplay',
            visibility: 'hidden',
            defaultValue: 'true'
        }, {
            name: 'data-tooltipType',
            visibility: 'hidden',
            defaultValue: 'blob'
        }, {
            name: 'data-tooltipAngle',
            visibility: 'hidden',
            defaultValue: '90'
        }, {
            name: 'data-limitlength',
            description: 'Limit length',
            type: 'integer',
            defaultValue: '100'
        },
        {
            name: 'data-draggable',
            description: 'Draggable',
            type: 'checkbox',
            defaultValue: 'false'
        }, {
            name: 'data-linkedWidgets',
            visibility: 'hidden'
        }, {
            name: 'data-oldSource',
            visibility: 'hidden',
            type: 'string',
            defaultValue: ''
        }, {
            name: 'data-ymin',
            visibility: 'hidden'
        }, {
            name: 'data-ymax',
            visibility: 'hidden'
        }, {
            name: 'data-yinterval',
            visibility: 'hidden',
            defaultValue: 'Step Count'
        }, {
            name: 'data-xstepvalue',
            visibility: 'hidden',
            defaultValue: ''
        }, {
            name: 'data-ystepvalue',
            visibility: 'hidden',
            defaultValue: ''
        }, {
            name: 'data-labelAngle',
            visibility: 'hidden',
            defaultValue: '90'
        }, {
            name: 'data-labelAlign',
            visibility: 'hidden',
            defaultValue: 'middle'
        },
        {
            name: 'data-column',
            description: 'Data Series',
            type: 'grid',
            defaultValue: '[]',
            reloadOnChange: true,
            displayEmpty: false, // if false grid is hidden if empty
            newRowEmpty: false,
            editable: false,
            beforeReady: function() {
                var
                tag,
                chartType;
                tag = this.data.tag;
                tag.axisColumns = this;
                chartType = tag.getAttribute('data-chartType').getValue();
                switch (chartType) {
                    case 'Pie Chart':
                        this.editable = false;
                        this.sortable = false;
                        this.buttons.visible = false;
                        if (this._itemsMdl.length > 2) {
                            this._itemsMdl.pop();
                            this._header.pop();
                        }
                        //                    this._itemsMdl[0].disabled  = true;
                        //                    this._itemsMdl[1].disabled  = true;
                        break;

                    default:
                        this.editable = true;
                        this.sortable = true;
                        this.buttons.visible = true;
                        break;
                }
            },
            sortable: false,
            columns: [{
                    title: 'label',
                    name: 'title',
                    type: 'textfield'
                }, {
                    title: 'attribute',
                    name: 'sourceAttID',
                    type: 'textfield',
                    typeValue: 'dataSource',
                    onchange: function() {
                        var
                        htmlObj = this.htmlObject,
                        parent = htmlObj.parent(),
                        prevNode = parent.prev(),
                        title = prevNode.find('input');

                        title.val(this.getValue());

                    }
                }, {
                    title: 'color',
                    name: 'color',
                    type: 'color',
                    defaultValue: 'rgba(255,0,0,1)'
                }],
            toolbox: [{
                    name: 'format',
                    type: 'textfield'
                }],
            beforeRowAdd: function() {
                var
                tag = this.data.tag,
                count = this.getRows().length;

                this._itemsMdl[2].value = tag._colors[count % tag._colors.length];
            },
            onsave: function(data) {
                var
                tag,
                attrib,
                columns,
                value;

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
                        var
                        row,
                        name,
                        value,
                        check,
                        column;

                        row = this;
                        check = true;
                        column = new WAF.tags.descriptor.Column();

                        $.each(this, function(i) {
                            name = this.component.name;
                            value = this.value;

                            if (name == 'sourceAttID') {
                                column.getAttribute('colID').setValue(value.replace(/\./g, '_'));

                                /*
                                 * Check if the new attribute is valid
                                 */
                                attrib = Designer.env.ds.catalog.getByName(tag.getSource()).getAttributeByName(value);
                                if (attrib && attrib.type && attrib.type.match(new RegExp('(^number$)|(^long$)|(^long64$)|(^float$)|(^duration$)'))) {
                                    // DO NOTHING
                                } else {
                                    check = false;
                                    row[1].component.getHtmlObject().addClass('studio-form-invalid');
                                }
                            }
                            else if (name == "color" && !column.getAttribute(name)) {
                                column._attributes.add(new WAF.tags.descriptor.AttributeColumn({
                                    name: "color"
                                }));
                            }

                            column.getAttribute(name).setValue(value);
                        });

                        //                    if (check) {
                        columns.add(column);
                        //                    }
                    });

                } catch (e) {
                    console.log(e);
                }
            }
        }
    ],
    columns: {
        attributes: [
            {
                name: 'format'
            }
        ],
        events: []
    },
    // {Array} default height and width of the container for the widget in the GUI Designer
    // 
    // @property {String} name, name of the attribute 
    // @property {String} defaultValue, default value of the attribute  
    style: [
        {
            name: 'width',
            defaultValue: '480px'
        },
        {
            name: 'height',
            defaultValue: '300px'
        }],
    // {Array} events ot the widget
    // 
    // @property {String} name, internal name of the event (mandatory)     
    // @property {String} description, display name of the event in the GUI Designer
    // @property {String} category, category in which the event is displayed in the GUI Designer (optional)
    events: [
        {
            name: 'click',
            description: 'On Click',
            category: 'Data Point Events'
        }, {
            name: 'dblclick',
            description: 'On Double Click',
            category: 'Data Point Events'
        }, {
            name: 'mousedown',
            description: 'On Mouse Down',
            category: 'Data Point Events'
        }, {
            name: 'mousemove',
            description: 'On Mouse Move',
            category: 'Data Point Events'
        }, {
            name: 'mouseout',
            description: 'On Mouse Out',
            category: 'Data Point Events'
        }, {
            name: 'mouseover',
            description: 'On Mouse Over',
            category: 'Data Point Events'
        }, {
            name: 'mouseup',
            description: 'On Mouse Up',
            category: 'Data Point Events'
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
            name: 'touchmove',
            description: 'On Touch Move',
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
         }*/
    ],
    // {JSON} panel properties widget
    //
    // @property {Object} enable style settings in the Styles panel in the Properties area in the GUI Designer
    properties: {
        style: {
            theme: {
                'roundy': false
            },
            fClass: true,
            text: false,
            background: true,
            border: true,
            sizePosition: true,
            shadow: true,
            label: false,
            disabled: []
        }
    },
    // (optional area)
    // 
    // {Array} list of sub elements for the widget
    // 
    // @property {String} label of the sub element
    // @property {String} css selector of the sub element
    structure: [],
    /* METHODS */

    /*
     * function to call when the widget is loaded by WAF during runtime
     * 
     * @param {Object} config contains all the attributes of the widget  
     * @result {WAF.widget.Rifox} the widget
     */
    onInit: function(config) {
        var widget = new WAF.widget.Chart(config);
        if (config['data-draggable'] === "true") {
            $('#' + config.id).draggable({});
            $('#' + config.id).css('cursor', 'pointer');
        }
        return widget;
    },
    /**
     * function to call when the widget is displayed in the GUI Designer
     * 
     * @param {Object} config contains all the attributes for the widget
     * @param {Designer.api} set of functions used to be managed by the GUI Designer
     * @param {Designer.tag.Tag} container of the widget in the GUI Designer
     * @param {Object} catalog of dataClasses defined for the widget
     * @param {Boolean} isResize is a resize call for the widget (not currently available for custom widgets)
     */
    onDesign: function(config, designer, tag, catalog, isResize) {
        var columns = tag.getColumns().toArray();
        var r;

        var values = function() {
            var res = [];
            for (var i = 1; i <= columns.length; i++) {
                res.push([10 * i, 30 * i, 100 * i, 20 * i]);
            }
            return res;
        }.call(),
        labels = function() {
            var result = [];
            for (var item in values[0]) {
                result.push((tag.getSource() ? tag.getSource() + ' Entity ' : 'Fake Data ') + item)
            }
            return result;
        }.call(),
        colors = [];

        if (!tag._subWidgets) {
            return;
        }

        /*
         * Initialization of the graph
         */
        r = tag._graph;

        r.setSize(tag.getWidth(), tag.getHeight());
        r.clear();

        var subWidgets = tag._subWidgets();

        /*
         * Designing the legendary
         */
        if (subWidgets.title && tag.getAttribute('data-oldSource').getValue() !== tag.getSource()) {
            if (tag.getSource() != '') {
                subWidgets.title.getAttribute('data-text').setValue(tag.getSource() + " Chart");
                subWidgets.title.refresh();
            }
            else {
                subWidgets.title.getAttribute('data-text').setValue("Wakanda Chart");
                subWidgets.title.refresh();
            }

            tag.getAttribute('data-oldSource').setValue(tag.getSource());
        }

        if (subWidgets.legendary) {
            var legendary = subWidgets.legendary;
            if (legendary) {
                $('#' + legendary.getId()).empty();
            }
        }

        if (labels.length == 0 || values.length == 0) {
            r.text(r.width / 2, r.height / 2, 'Drop a datasource here').attr({
                'font-size': 20
            });
            return;
        }

        /*
         * Drawing The legendary for Bar and Line Chart
         */
        tag.createLengendary = function() {
            if (legendary) {
                var legendaryC = $('#' + legendary.getId());
                legendaryC.empty();
                var legTable = $('<table></table>').appendTo('#' + legendaryC.prop('id'));

                for (var i = 0; i < values.length; i++) {
                    var htmlObj = $('<TR>' +
                    '<TD style="padding:1px">' +
                    '<DIV id = "' + legendaryC.prop('id') + '-legendary-item-' + i + '"></DIV></TD></TR>');
                    htmlObj.appendTo(legTable);
                    $('<TD style="padding-left:3px">' + tag.getColumns().toArray()[i].title + '</TD>').appendTo(htmlObj);
                    Raphael(legendaryC.prop('id') + '-legendary-item-' + i, 20, 20).rect(0, 0, 20, 20).attr({
                        fill: colors[i]
                    });
                }
            }
        }

        switch (tag.getAttribute('data-chartType').getValue()) {
            case 'Line Chart':
            case 'Bar Chart' :
                for (i = 0; column = columns[i]; i++) {
                    colors.push(column.color);
                }
                break;
            case 'Pie Chart':
                colors = ["hsb(0.34,0.69,0.65)", "hsb(0.19,0.82,0.81)", "hsb(0.15,1,1)", "hsb(0.10,0.91,0.97)", "hsb(0.06,0.85,0.92)", "hsb(0.02,0.83,0.90)", "hsb(0.98,0.85,0.79)", "hsb(0.82,0.71,0.51)", "hsb(0.76,0.68,0.51)", "hsb(0.69,0.65,0.52)", "hsb(0.57,1,0.65)", "hsb(0.46,1,0.61)"];
                break;
        }
        tag.chart = null;

        /*
         * Drawing the graph
         */

        switch (tag.getAttribute('data-chartType').getValue()) {
            /*
             * Drawing the pie chart
             */
            case 'Pie Chart' :
                var radius = Math.min(tag.getWidth(), tag.getHeight()) / 2 - 50,
                opts = {
                    colors: colors,
                    stroke: null,
                    strokewidth: null,
                    init: null,
                    href: null,
                    legend: null,
                    legendmark: null,
                    legendothers: null,
                    legendpos: null
                };

                tag.chart = r.g.piechart(r.width / 2, r.height / 2, radius, values[0], opts);

                if (tag.getAttribute('data-tooltipDisplay').getValue() == 'true') {
                    tag.chart.hover(function() {
                        this.tag = r.g[tag.getAttribute('data-tooltipType').getValue()](this.cx + (radius + 2) * Math.cos(this.mangle * Math.PI / 180), this.cy - (radius + 2) * Math.sin(this.mangle * Math.PI / 180), labels[this.sector.value.order] + "\n" + this.sector.value.value, this.mangle).insertBefore(this.cover);
                        this.tag[0].attr({
                            fill: colors[this.sector.index],
                            stroke: "#000"
                        });
                    }, function() {
                        this.tag.animate({
                            opacity: 0
                        }, 300, function() {
                            this.remove();
                        });
                    });
                }

                var i = 0;
                tag.chart.each(function() {
                    this.sector.index = i++;
                });
                delete i;

                if (subWidgets.legendary) {
                    legendary = subWidgets.legendary;

                    var legTable = $('<table></table>').appendTo('#' + legendary.getId());
                    for (i = 0; i < labels.length; i++) {
                        var htmlObj = $('<TR>' +
                        '<TD style="padding:1px">' +
                        '<DIV id = "' + tag.getId() + '-legendary-item-' + i + '"></DIV></TD></TR>');
                        htmlObj.appendTo(legTable);
                        $('<TD style="padding-left:3px">' + labels[tag.chart.series[i].value.order] + '</TD>').appendTo(htmlObj);
                        var legItem = Raphael(tag.getId() + '-legendary-item-' + i, 20, 20).rect(0, 0, 20, 20);
                        legItem.attr({
                            fill: colors[tag.chart.series[i].index]
                        });
                        delete legItem;
                    }
                }

                break;
            case 'Line Chart':
                if (columns.length == 0) {
                    return;
                }
                labels = [0, 1, 2, 3];
                var
                offset = 20,
                opts = {
                    vgutter: null,
                    shade: null,
                    nostroke: false,
                    axis: "0 0 1 1",
                    axisstep: null,
                    width: null,
                    dash: null,
                    smooth: false,
                    symbol: "o",
                    colors: colors,
                    gutter: 5
                };

                // Sorting the data :

                for (i = 0; i < labels.length; i++) {
                    labels[i] = {
                        value: labels[i],
                        order: i,
                        valueOf: function() {
                            return this.value;
                        }
                    };
                    for (var j = 0; j < values.length; j++) {
                        if (max < values[j][i]) {
                            max = values[j][i];
                        }
                        values[j][i] = {
                            value: values[j][i],
                            order: i,
                            valueOf: function() {
                                return this.value;
                            },
                            label: labels[i]
                        };
                    }
                }


                for (i = 0; i < values.length; i++) {
                    values[i].sort(function(a, b) {
                        return labels[a.order].value - labels[b.order].value;
                    });
                }

                labels.sort(function(a, b) {
                    return a.value - b.value;
                });


                tag.chart = r.g.linechart(offset, offset, r.width - offset - 30, r.height - offset - 20, labels, values, opts);
                tag.createLengendary();
                break;
            case 'Bar Chart' :
                r.rect(0, 0, r.width, r.height).attr({
                    'stroke-width': 2
                })
                if (columns.length == 0) {
                    return;
                }

                opts = {
                    type: tag.getAttribute('data-chartLineType').getValue() == 'basic' ? 'soft' : 'square',
                    colors: colors,
                    gutter: 0,
                    vgutter: 0,
                    to: null,
                    stacked: tag.getAttribute('data-chartLineType').getValue() != 'basic'
                };

                var
                max = values[0][0],
                textMax = 0,
                textSet = r.set(),
                y = 25,
                barvgutter = opts.vgutter,
                textTemp = r.text(0, 0, max).hide(),
                x = textTemp.getBBox().width + 15,
                gutter = opts.gutter || 10,
                barhgutter = (r.width - x) * gutter / (labels.length * (100 + gutter) + gutter),
                barwidth = barhgutter * 100 / gutter,
                posTemp = x + barhgutter,
                labelAngle = parseInt(tag.getAttribute('data-labelAngle').getValue()),
                valuesPer = [],
                arraySum = new Array(values[0].length);

                textTemp.remove();

                if (tag.getAttribute('data-chartLineType').getValue() == 'percentage') {
                    for (i = 0; i < values.length; i++) {
                        for (j = 0; j < values[i].length; j++) {
                            if (arraySum[j] === undefined) {
                                arraySum[j] = values[i][j];
                            }
                            else {
                                arraySum[j] += values[i][j];
                            }
                            if (max < values[i][j]) {
                                max = values[i][j];
                            }
                        }
                    }

                    for (i = 0; i < values.length; i++) {
                        valuesPer.push([]);
                        for (j = 0; j < values[i].length; j++) {
                            if (i == 0) {
                                valuesPer[i].push(100 * values[i][j] / arraySum[j]);
                            }
                            else {
                                valuesPer[i].push(100 * values[i][j] / arraySum[j] + valuesPer[i - 1][j]);
                            }
                        }
                    }
                }
                else {
                    for (i = 0; i < values.length; i++) {
                        for (j = 0; j < values[i].length; j++) {
                            if (max < values[i][j]) {
                                max = values[i][j];
                            }
                        }
                    }
                }

                for (i = 0; i < labels.length; i++) {
                    textTemp = r.text(0, 0, labels[i]).hide();
                    if (textMax < textTemp.getBBox().width) {
                        textMax = parseInt(textTemp.getBBox().width * Math.sin(Raphael.rad(labelAngle))) + textTemp.getBBox().height + 4;
                    }
                }
                for (i = 0; i < labels.length; i++) {
                    switch (tag.getAttribute('data-labelAlign').getValue()) {
                        case 'start' :
                            point = {
                                x: posTemp,
                                y: r.height - textMax + textTemp.getBBox().height / 2 + 2,
                                textAnchor: tag.getAttribute('data-labelAlign').getValue(),
                                angle: labelAngle
                            }
                            break;
                        case 'middle' :
                            point = {
                                x: posTemp + barwidth / 2,
                                y: r.height - textMax / 2,
                                textAnchor: tag.getAttribute('data-labelAlign').getValue(),
                                angle: -labelAngle
                            };
                            break;
                        case 'end' :
                            point = {
                                x: posTemp,
                                y: r.height - textTemp.getBBox().height / 2 - 2,
                                textAnchor: 'start',
                                angle: -labelAngle
                            }
                            break;
                        default:
                            point = {
                                x: posTemp + barwidth / 2,
                                y: r.height - textMax / 2,
                                textAnchor: tag.getAttribute('data-labelAlign').getValue(),
                                angle: -labelAngle
                            };
                            break;
                    }
                    textTemp = r.text(point.x, point.y, labels[i]).attr({
                        'text-anchor': point.textAnchor
                    }).rotate(point.angle, point.x, point.y);

                    textSet.push(textTemp);
                    posTemp += barwidth + barhgutter;
                }

                if (tag.getAttribute('data-chartLineType').getValue() == 'percentage') {
                    tag.chart = r.g.barchart(x, y, r.width - x, r.height - textMax - y, valuesPer, opts);
                    r.g.axis(x + barhgutter / 2, r.height - textMax - barvgutter, r.height - textMax - y - 2 * barvgutter, 0, 100, 10, 1);
                }
                else {
                    tag.chart = r.g.barchart(x, y, r.width - x, r.height - textMax - y, values, opts);
                    r.g.axis(x + barhgutter / 2, r.height - textMax - barvgutter, r.height - textMax - y - 2 * barvgutter, 0, max, 10, 1);
                }

                r.g.axis(x + barhgutter / 2, r.height - textMax - barvgutter, r.width - x - barhgutter, 0, 1, labels.length, 2).text.remove();
                tag.createLengendary();
                break;
        }
        if (tag.getAttribute('data-chartType').getValue() === 'Bar Chart' || tag.getAttribute('data-chartType').getValue() === 'Line Chart') {
            try {
                var pos = {
                    x: tag.getWidth() / 2,
                    y: tag.getHeight() / 2
                }
                switch (tag.getAttribute('data-chartType').getValue()) {
                    case 'Line Chart':
                        pos = {
                            x: parseInt(tag.chart.symbols[0][2].attr('cx')),
                            y: parseInt(tag.chart.symbols[0][2].attr('cy'))
                        };
                        break;
                    case 'Bar Chart':
                        pos = {
                            x: parseInt(tag.chart.bars[0][2].x),
                            y: parseInt(tag.chart.bars[0][2].y)
                        };
                        break;
                }
                var dirs = ['South', 'West', 'North', 'East'];
                tag.tooltip = r.g[tag.getAttribute('data-tooltipType').getValue()](pos.x, tag.getAttribute('data-tooltipType').getValue() === 'label' ? pos.y - 15 : pos.y, tag.getAttribute('data-tooltipType').getValue() === "popup" ? dirs[parseInt(tag.getAttribute('data-tooltipAngle').getValue()) % 360] : parseInt(tag.getAttribute('data-tooltipAngle').getValue() % 360 + "°"), parseInt(tag.getAttribute('data-tooltipAngle').getValue()) - 360).attr([{
                        fill: colors[0],
                        stroke: '#000'
                    }, {
                        fill: '#000'
                    }]);
            }
            catch (e) {

            }
        }
    },
    onCreate: function(tag, param) {
        var
        title,
        group,
        action,
        classes,
        container,
        legendary;

        tag._classes = {
            container: 'waf-chart-container',
            legendary: 'waf-chart-legendary',
            title: 'waf-chart-title'
        }

        tag._colors = ["#198c1e", "#a4bb12", "#ffe500", "#ec920b", "#d95911", "#d12a13", "#ba0f23", "#67126f", "#46146d", "#23176d", "#0060a5", "#009b76"];

        /**
         * add widget
         * @method _addWidget
         */
        tag._addWidget = function add_widget(config) {
            var
            group,
            widget,
            groupId,
            allFits,
            reloadTag,
            defaultConfig,
            camelCaseFits;

            allFits = ['top', 'left', 'right', 'bottom'];
            camelCaseFits = ['Top', 'Left', 'Right', 'Bottom']
            groupId = tag.getGroupId();
            group = Designer.getGroup(groupId);
            reloadTag = false;
            defaultConfig = {
                fit: ['top', 'left'],
                height: null,
                width: null,
                left: null,
                top: null,
                type: 'button',
                parent: this,
                'class': null,
                attribs: null,
                'z-index': null,
                subElem: true
            };

            config = $.extend(true, defaultConfig, config);

            widget = Designer.createTag({
                type: config.type,
                width: config.width,
                height: config.height,
                fit: config.fit,
                silentMode: true,
                parent: config.parent
            });

            if (config['class']) {
                widget.addClass(config['class']);
            }

            for (var i = allFits.length - 1, fit; fit = allFits[i]; i--) {
                if ($.inArray(fit, config.fit) >= 0 && i > 1) {
                    action = new Designer.action['Add' + camelCaseFits[i] + 'Constraint']({
                        tagId: widget.id,
                        tagHtmlId: widget.getId(),
                        oldVal: 1
                    });

                    Designer.getHistory().add(action);
                }

                else if ($.inArray(fit, config.fit) < 0 && i <= 1) {
                    action = new Designer.action['Remove' + camelCaseFits[i] + 'Constraint']({
                        tagId: widget.id,
                        tagHtmlId: widget.getId(),
                        oldVal: 1
                    });

                    Designer.getHistory().add(action);
                }
            }

            for (i = 0, fit; fit = allFits[i]; i++) {
                if ($.inArray(fit, config.fit) >= 0) {
                    widget.savePosition(fit, config[fit], false, false);

                    action = new Designer.action.ModifyStyleInline({
                        val: config[fit],
                        oldVal: 0.001,
                        tagId: widget.id,
                        tagHtmlId: widget.getId(),
                        prop: fit
                    });

                    Designer.getHistory().add(action);
                }

                else {
                    widget['setFitTo' + camelCaseFits[i]](false);
                    widget.savePosition(fit, null);
                }
            }

            if (config.attribs) {
                for (var attr in config.attribs) {
                    widget.getAttribute(attr).setValue(config.attribs[attr]);
                }

                reloadTag = true;
            }

            if (config['z-index']) {
                widget.updateZindex(-1);
                reloadTag = true;
            }

            if (reloadTag) {
                widget.refresh();
            }

            if (config.subElem) {
                widget.setAsSubElement(true);
            }

            this.link(widget);
            group.add(widget);

            return widget;
        }

        /**
         * Get linked Widgets
         * @method _subWidgets
         */
        tag._subWidgets = function() {
            var
            res,
            classes,
            linkedTags;

            classes = tag._classes;

            if (this._private && this._private.subWidgets) {
                return this._private.subWidgets;
            }

            res = {
                container: null,
                legendary: null,
                title: null
            };

            linkedTags = tag.getLinks();

            for (var i = 0, widget; widget = linkedTags[i]; i++) {
                var
                htmlObj;

                htmlObj = widget.getHtmlObject();

                if (htmlObj.hasClass(classes.container)) {
                    res.container = widget;
                    continue;
                }

                else if (htmlObj.hasClass(classes.legendary)) {
                    res.legendary = widget;
                    continue;
                }

                else if (htmlObj.hasClass(classes.title)) {
                    res.title = widget;
                    continue;
                }
            }

            this._private = this._private || {};
            this._private.subWidgets = res;

            return res;
        }

        tag.removeLinkedTags = function() {
            var linkedTags = this.getLinks();

            for (var i = linkedTags.length - 1; i >= 0; i--) {
                linkedTags[i].remove();
            }
            ;
        }

        tag._graph = Raphael(tag.getId(), tag.getWidth(), tag.getHeight());

        /*
         *Initialization of the structure of the widget
         */
        if (!param._isLoaded) {

            classes = tag._classes;

            /**
             * Create the group
             */
            group = new Designer.ui.group.Group();

            group.add(tag);

            container = tag._addWidget({
                height: tag.getHeight() + 90,
                width: tag.getWidth() + 190,
                left: param.x || param.pos.x,
                top: param.y || param.pos.y,
                'class': classes.container,
                parent: tag.getParent(),
                type: 'container',
                subElem: false
            });

            action = new Designer.action.ModifyStyleInline({
                val: parseInt(param.y || param.pos.y),
                oldVal: 0,
                tagId: container.id,
                tagHtmlId: container.getId(),
                prop: "top"
            });

            Designer.getHistory().add(action);

            action = new Designer.action.ModifyStyleInline({
                val: parseInt(param.x || param.pos.x),
                oldVal: 0,
                tagId: container.id,
                tagHtmlId: container.getId(),
                prop: "left"
            });

            Designer.getHistory().add(action);

            title = tag._addWidget({
                fit: ['top', 'left', 'right'],
                height: 40,
                top: 10,
                left: 0,
                right: 0,
                'class': classes.title,
                parent: container,
                type: 'richText',
                attribs: {
                    'data-text': 'Wakanda Chart',
                    'data-autoWidth': 'false'
                }
            });

            action = new Designer.action.ModifyStyleInline({
                val: container.getWidth(),
                oldVal: container.getWidth() - 1,
                tagId: title.id,
                tagHtmlId: title.getId(),
                prop: "width"
            });

            Designer.getHistory().add(action);

            tag._addWidget({
                height: 155,
                width: 160,
                left: 470,
                top: 80,
                right: 15,
                'class': classes.legendary,
                type: 'container',
                fit: ['right', 'top'],
                parent: container
            });

            tag.setParent(container);

            tag.forceBottomConstraint();
            tag.forceRightConstraint();

            tag.savePosition('bottom', 0, false, false);
            tag.savePosition('right', 180, false, false);
            tag.savePosition('top', 85, false, false);
            tag.savePosition('left', 15, false, false);

            $(container).bind('onFocusSizeChange', function() {
                tag.onDesign(true);
                if (Designer.env.createMode) {
                    tag.onDesign(true);
                    if (container.getHeight() > 90) {
                        tag.setHeight(container.getHeight() - 90, true);
                    }

                    if (container.getWidth() > 190) {
                        tag.setWidth(container.getWidth() - 190, true);
                    }
                }
                else if (!tag._private.constraintFixed) {
                    if (tag.isFitToBottom()) {
                        tag.removeBottomConstraint();
                        tag.forceBottomConstraint();
                    }
                    if (tag.isFitToRight()) {
                        tag.removeRightConstraint();
                        tag.forceRightConstraint();
                    }

                    tag._private.constraintFixed = true;
                }
            });

            $(tag).bind('onFocusSizeChange', function() {
                if (Designer.env.createMode) {
                    container.setCurrent();
                    tag.setXY(15, 85, true);
                }
            });

            tag.refresh();
        }
        else {
            /*
             * Execute script when widget is entirely loaded (with linked tags) 
             */
            $(tag).bind('onReady', function() {
                tag.onDesign(true);

                if (tag.getAttribute('data-chartType').getValue() == 'Line Chart' && tag.getEvents().count() < 8) {
                    var evts = [];
                    evts.push({
                        name: 'clickColumn',
                        description: 'On Click',
                        category: 'Data Column Events'
                    }, {
                        name: 'dblclickColumn',
                        description: 'On Double Click',
                        category: 'Data Column Events'
                    }, {
                        name: 'mousedownColumn',
                        description: 'On Mouse Down',
                        category: 'Data Column Events'
                    }, {
                        name: 'mousemoveColumn',
                        description: 'On Mouse Move',
                        category: 'Data Column Events'
                    }, {
                        name: 'mouseoutColumn',
                        description: 'On Mouse Out',
                        category: 'Data Column Events'
                    }, {
                        name: 'mouseoverColumn',
                        description: 'On Mouse Over',
                        category: 'Data Column Events'
                    }, {
                        name: 'mouseupColumn',
                        description: 'On Mouse Up',
                        category: 'Data Column Events'
                    });
                    for (var item in evts) {
                        tag.getEvents().add(new WAF.tags.descriptor.Event(evts[item]));
                    }
                    Designer.tag.refreshPanels();
                }
            });
        }

        $(tag).on({
            'onWidgetDestroy': function() {
                this.removeLinkedTags();
            }
        })
    }
});
// Replaced by the finger gRaphael API
//
//(function () {
//    Raphael.fn.g.legendaryItem = function(opts){
//        var 
//        res         = this.set(),
//        defaultOpts = {
//            x       : 0,
//            y       : 0,
//            width   : 100,
//            height  : 100,
//            arrowH  : 20
//        };
//        
//        opts    = $.extend(true, defaultOpts , opts);
//        res.push(this.path("M" + opts.x + " " + (opts.y + opts.arrowH) +
//                 "L" + (opts.x + opts.width/2) + " " + opts.y + 
//                 "L" + (opts.x + opts.width) + " " + (opts.y + opts.arrowH) +
//                 "L" + (opts.x + opts.width) + " " + (opts.y + opts.height) +
//                 "L" + opts.x + " " + (opts.y + opts.height) +
//                 "Z"));
//        return res;
//    }
//}());
//

