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
// "use strict";

/*global WAF,window*/

/*jslint white: true, browser: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */

WAF.Widget.provide(
/**
 * WAF Google Chart widget
 *
 * @class WAF.widget.Chart
 * @extends WAF.Widget
 */
'Chart',
{
    classes: {
        container: 'waf-chart-container',
        legendary: 'waf-chart-legendary',
        title: 'waf-chart-title'
    }
},
/**
 * @constructor
 * @param {Object} inConfig configuration of the widget
 */

/**
 * The constructor of the widget
 *
 * @property constructor
 * @type Function
 * @default WAF.widget.Chart
 **/
function(inConfig, inData, shared) {

},
{
    _getLinkedWidgets: function(classes) {
        var
        res,
        linkedTags;

        if (this._private && this._private.subWidgets) {
            return this._private.subWidgets;
        }

        res = {
            container: null,
            legendary: null,
            title: null
        };

        linkedTags = this.getLinks();

        for (var i = 0, widget; widget = linkedTags[i]; i++) {
            var
            htmlObj;

            htmlObj = widget.$domNode;

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
    },
    getLabels: function() {
        return this._private.labels;
    },
    getValues: function() {
        var
        values,
        res;

        values = this._private.values;
        res = [];
        if (values) {
            $.each(values, function() {
                if (Raphael.is(this, 'array')) {
                    var
                    resTemp;

                    resTemp = [];

                    $.each(this, function() {
                        resTemp.push(this.value);
                    })
                    res.push(resTemp);
                }
                else {
                    res.push(this.value);
                }
            });
        }
        return res;
    },
    getChartType: function() {
        return this.config['data-chartType'];
    },
    setFormat: function(format) {
        if (!format) {
            format = "";
        }
        this.format = {
            format: unescape(format)
        }
    },
    recreateChart: function(labels, values) {
        var
        r,
        that,
        source,
        columns,
        inConfig,
        linkedWidgets;

        that = this;
        inConfig = that.config;
        columns = that.columns;
        source = that.source;
        r = that._private.r;
        linkedWidgets = that._private.linkedWidgets;

        if (!labels && !values && that._private && that._private.labels && that._private.values) {
            labels = that._private.labels;
            values = [];

            var valuesClone = that.$domNode.data('values');

            for (var _i = 0; _i < valuesClone.length; _i++) {
                if (valuesClone[_i].length) {
                    values[_i] = [];
                }

                for (var _j = 0; _j < valuesClone[_i].length; _j++) {
                    values[_i][_j] = valuesClone[_i][_j];
                }
            }
        }

        if (!labels || !values) {
            return false;
        }

        r.setSize($("#" + inConfig.id).width(), $("#" + inConfig.id).height());

        r.clear();

        switch (inConfig['data-chartType']) {
            case 'Pie Chart':
                var radius = Math.min($("#" + inConfig.id).width(), $("#" + inConfig.id).height()) / 2 - 60,
                opts = {
                    colors: that.colors,
                    stroke: null,
                    strokewidth: null,
                    init: null,
                    href: null,
                    legend: null,
                    legendmark: null,
                    legendothers: null,
                    legendpos: null
                };
                that.chart = r.g.piechart(r.width / 2, r.height / 2, radius, values[0], opts);
                that.chart.selected = -1;

                that.isEmpty = false;

                var i = 0;
                that.chart.each(function() {
                    var c = that.chart.series[i].clone().hide().translate(10 * Math.cos(that.chart.series[i].mangle * Math.PI / 180), -10 * Math.sin(that.chart.series[i++].mangle * Math.PI / 180));
                    this.cover.posSelect = c.attr('path');
                    this.cover.posOrigin = this.sector.attr('path');
                    this.sector.index = i - 1;
                    c.remove();
                });

                that.chart.select = function(i) {
                    if (i >= values[0].length || i < 0) {
                        return;
                    }

                    for (var j = 0; j < values[0].length; j++) {
                        if (values[0][j].order == i) {
                            i = j;
                            break;
                        }
                    }

                    if (this.selected == i) {
                        this.selected = -1;
                        this.series[i].animate({
                            path: this.covers[i].posOrigin
                        }, 1000, 'bounce');
                        return;
                    }
                    if (this.selected != -1) {
                        this.series[this.selected].animate({
                            path: this.covers[this.selected].posOrigin
                        }, 1000, 'bounce');
                    }



                    this.series[i].animate({
                        path: this.covers[i].posSelect
                    }, 1000, 'bounce');
                    this.selected = i;
                }

                that.chart.click(function() {
                    if (that.source) {
                        if (that.source.length > 1) {
                            that.source.select(this.sector.value.order);
                        }
                        else {
                            that.source.select(0);
                        }
                    }
                });

                // Set the format :
                source.getAttribute(columns[0].sourceAttID) && source.getAttribute(columns[0].sourceAttID).dataClassAtt && source.getAttribute(columns[0].sourceAttID).dataClassAtt.defaultFormat && that.setFormat(source.getAttribute(columns[0].sourceAttID).dataClassAtt.defaultFormat.format);
                if (columns[0] && columns[0].format) {
                    that.setFormat(columns[0].format);
                }

                if (inConfig['data-tooltipDisplay'] === 'true') {
                    that.chart.hover(function() {
                        if (values[0].length > 1) {
                            this.tag = r.g[inConfig['data-tooltipType']](this.cx + (radius + 2) * Math.cos(this.mangle * Math.PI / 180), this.cy - (radius + 2) * Math.sin(this.mangle * Math.PI / 180), labels[this.sector.value.order] + "\n" + that.getFormattedValue(this.sector.value.value), this.mangle).insertBefore(this.cover);

                            this.tag[0].attr({
                                fill: that.colors[this.sector.index % that.colors.length],
                                stroke: "#000"
                            });

                            this.tag[0].scale(1.25, 1.25);
                        }
                        else if (values[0].length > 0) {
                            this.tag = r.g[inConfig['data-tooltipType']](this.cx + (radius + 2) * Math.cos(this.mangle * Math.PI / 180), this.cy - (radius + 2) * Math.sin(this.mangle * Math.PI / 180), labels[0] + '\n' + that.getFormattedValue(values[0][0].value), this.mangle).insertBefore(this.cover);
                            this.tag[0].attr({
                                fill: this.sector.attr('fill'),
                                stroke: "#000"
                            });

                            this.tag[0].scale(1.25, 1.25);
                        }
                    }, function() {
                        this.tag.animate({
                            opacity: 0
                        }, 300, function() {
                            this.remove();
                        });
                    });
                }

                try {
                    var legendaryC = linkedWidgets.legendary.$domNode;
                    legendaryC.empty();
                    legendaryC.css('overflow', 'auto');
                    var legTable = $('<table class="waf-chart-legendary-table"></table>').appendTo('#' + legendaryC.prop('id'));
                    for (i = 0; i < values[0].length; i++) {
                        var htmlObj = $('<TR>' +
                        '<TD>' +
                        '<DIV id = "' + legendaryC.prop('id') + '-legendary-item-' + i + '"></DIV></TD></TR>');
                        htmlObj.appendTo(legTable);
                        $('<TD>' + labels[that.chart.series[i].value ? that.chart.series[i].value.order : 0] + '</TD>').appendTo(htmlObj);
                        var legItem = Raphael(legendaryC.prop('id') + '-legendary-item-' + i, 20, 20).rect(0, 0, 20, 20).attr({
                            fill: that.chart.series.length == 1 ? that.chart.series[0].attr('fill') : that.chart.series[i].attr('fill'),
                            cursor: 'pointer'
                        });
                        legItem.index = that.chart.series[i].value ? that.chart.series[i].value.order : 0;

                        legItem.click(function(e) {
                            that.source.select(this.index);
                            if (that.events && that.events.click) {
                                that.events.click.call(that, e);
                            }
                        });
                    }
                } catch (e) {
                    return;
                }
                break;
            case 'Line Chart' :
                var offset = 20,
                max = values[0][0];
                opts = {
                    vgutter: null,
                    shade: null,
                    nostroke: false,
                    axis: "0 0 1 1",
                    axisxstep: isNaN(parseInt(inConfig['data-xstepvalue'])) ? null : parseInt(inConfig['data-xstepvalue']),
                    axisystep: isNaN(parseInt(inConfig['data-ystepvalue'])) ? null : parseInt(inConfig['data-ystepvalue']),
                    width: null,
                    dash: null, // 
                    smooth: false,
                    symbol: "o",
                    colors: that.colors,
                    gutter: 5
                };
                that.isEmpty = false;
                // Sorting the data :
                for (i = 0; i < labels.length; i++) {
                    var lab = labels[i];
                    labels[i] = {
                        value: labels[i],
                        valueDes: lab,
                        order: i,
                        valueOf: function() {
                            return this.valueDes;
                        }
                    };
                    for (var j = 0; j < values.length; j++) {
                        var val = values[j][i];
                        if (max < values[j][i]) {
                            max = values[j][i];
                        }
                        values[j][i] = {
                            value: values[j][i],
                            valueDes: val,
                            order: i,
                            column: j,
                            valueOf: function() {
                                return this.valueDes;
                            },
                            label: labels[i]
                        };
                    }
                }

                offset = r.text(0, 0, max).hide().getBBox().width + 10;


                for (i = 0; i < values.length; i++) {
                    values[i].sort(function(a, b) {
                        return labels[a.order].value - labels[b.order].value;
                    });
                }

                labels.sort(function(a, b) {
                    return a.value - b.value;
                });

                // Drawing the chart
                that.chart = r.g.linechart(offset, 20, r.width - offset - 30, r.height - 40, labels, values, opts);

                that.chart.clickColumn(function(e) {
                    that.source.select(this.values[0].order);
                    if (that.events && that.events.clickColumn) {
                        that.events.clickColumn.call(that, e);
                    }
                });

                that.chart.click(function(e) {
                    if (this.value) {
                        that.source.select(this.value.order);
                    }
                });

                if (inConfig['data-tooltipDisplay'] == 'true') {
                    that.chart.hover(function() {
                        source.getAttribute(columns[this.value.column].sourceAttID) && source.getAttribute(columns[this.value.column].sourceAttID).dataClassAtt && source.getAttribute(columns[this.value.column].sourceAttID).dataClassAtt.defaultFormat && that.setFormat(source.getAttribute(columns[this.value.column].sourceAttID).dataClassAtt.defaultFormat.format);

                        if (columns[this.value.column].format) {
                            that.setFormat(columns[this.value.column].format);
                        }
                        else if (source.getAttribute(columns[this.value.column].sourceAttID) && source.getAttribute(columns[this.value.column].sourceAttID).dataClassAtt && source.getAttribute(columns[this.value.column].sourceAttID).dataClassAtt.defaultFormat) {
                            that.setFormat(source.getAttribute(columns[this.value.column].sourceAttID).dataClassAtt.defaultFormat.format);
                        }
                        else {
                            that.setFormat(columns[this.value.column].format);
                        }
                        this.line.attr({
                            'stroke-width': 3
                        });
                        this.tags = r.set();
                        this.tags.push(r.g[inConfig['data-tooltipType']](this.x, inConfig['data-tooltipType'] === "label" ? this.y - 15 : this.y, that.getFormattedValue(this.value.value) || "0", parseInt(inConfig['data-tooltipAngle']) - 360).insertBefore(this).attr([{
                                fill: this.symbol.attr("fill"),
                                stroke: '#000'
                            }, {
                                fill: '#000'
                            }]));
                    }, function() {
                        this.tags && this.tags.remove();
                        this.line.attr({
                            'stroke-width': 2
                        });
                    });
                }
                that.createLengendary();
                break;
            case 'Bar Chart'  :
                that.isEmpty = false;
                opts = {
                    type: that.config['data-chartLineType'] == 'basic' ? 'soft' : 'square',
                    colors: that.colors,
                    gutter: 10,
                    vgutter: 5,
                    to: isNaN(parseFloat(inConfig['data-ymax'])) ? null : parseFloat(inConfig['data-ymax']) - (isNaN(parseFloat(inConfig['data-ymin'])) ? 0 : parseFloat(inConfig['data-ymin'])),
                    stacked: that.config['data-chartLineType'] != 'basic'
                };
                max = values[0][0];
                var
                step,
                vstep = 10,
                arraySum = new Array(values[0].length),
                valuesPer = [],
                maxStacked = values[0][0];

                step = isNaN(parseInt(inConfig['data-ystepvalue'])) ? null : parseInt(inConfig['data-ystepvalue']);

                switch (that.config['data-chartLineType']) {
                    case 'percentage':
                        opts.to = null;
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
                                var per = 100 * values[i][j] / arraySum[j];
                                if (i == 0) {
                                    valuesPer[i].push(per);
                                }
                                else {
                                    valuesPer[i].push(per);
                                }

                                valuesPer[i][j] = {
                                    value: values[i][j],
                                    valueDes: valuesPer[i][j],
                                    order: j,
                                    column: i,
                                    valueOf: function() {
                                        return this.valueDes;
                                    },
                                    percentage: Math.round(per * 100) / 100,
                                    getLabel: function() {
                                        return this.value + '\n' + this.percentage + ' %';
                                    }
                                };
                            }
                        }
                        break;

                    case 'basic' :
                        var sum = [];
                        for (j = 0; j < values.length; j++) {
                            for (i = 0; i < values[j].length; i++) {
                                var
                                temp,
                                ymin,
                                ymax;

                                val = values[j][i];
                                ymin = isNaN(parseFloat(inConfig['data-ymin'])) ? 0 : parseFloat(inConfig['data-ymin']);
                                ymax = isNaN(parseFloat(inConfig['data-ymax'])) ? false : parseFloat(inConfig['data-ymax']);


                                if (max < val) {
                                    max = val;
                                }

                                switch (true) {
                                    case ymax && val > ymax:
                                        temp = ymax - ymin;
                                        break;
                                    case val <= ymin:
                                        temp = 0;
                                        break;
                                    default:
                                        temp = val - ymin;
                                        break;
                                }

                                values[j][i] = {
                                    value: val,
                                    valueDes: temp,
                                    order: i,
                                    column: j,
                                    valueOf: function() {
                                        return this.valueDes;
                                    },
                                    getLabel: function() {
                                        return this.value;
                                    }
                                };
                            }
                        }

                        break;
                    case 'stacked' :
                        sum = [];
                        opts.to = null;
                        for (j = 0; j < values.length; j++) {
                            for (i = 0; i < values[j].length; i++) {
                                val = values[j][i];

                                if (sum[i] == undefined) {
                                    sum.push(val);
                                }
                                else {
                                    sum[i] += val;
                                }

                                values[j][i] = {
                                    value: val,
                                    valueDes: val,
                                    order: i,
                                    column: j,
                                    valueOf: function() {
                                        return this.valueDes;
                                    },
                                    getLabel: function() {
                                        return this.value;
                                    }
                                };
                            }
                        }

                        maxStacked = Math.max.apply(Math, sum);
                        break;
                }

                if (inConfig['data-yinterval'] === 'Steps') {
                    vstep = isNaN(parseInt(inConfig['data-ystepvalue'])) ? vstep : parseInt(inConfig['data-ystepvalue']);
                }
                else if (inConfig['data-yinterval'] === 'Range') {
                    ymax = ymax ? ymax : max;

                    vstep = isNaN((ymax - ymin) / step) ? vstep : parseFloat((ymax - ymin) / step);
                }

                var
                barvgutter = opts.vgutter || 20,
                textSet = r.set(),
                y = 35,
                textMax = 0,
                textTemp = r.text(0, 0, max).hide(),
                x = textTemp.getBBox().width + 15,
                gutter = opts.gutter || 10,
                barhgutter = (r.width - x) * gutter / (labels.length * (100 + gutter) + gutter),
                barwidth = barhgutter * 100 / gutter,
                posTemp = x + barhgutter,
                labelAngle = parseInt(inConfig['data-labelAngle']);
                textTemp.remove();
                for (i = 0; i < that.source.length; i++) {
                    textTemp = r.text(0, 0, labels[i]).hide();
                    if (textMax < textTemp.getBBox().width) {
                        textMax = parseInt(textTemp.getBBox().width * Math.sin(Raphael.rad(labelAngle))) + textTemp.getBBox().height + 4;
                    }
                }

                if (that.config['data-chartLineType'] == 'percentage') {
                    that.chart = r.g.barchart(x, y, r.width - x, r.height - textMax - y, valuesPer, opts);

                    r.g.axis(x + barhgutter / 2, r.height - textMax - barvgutter, r.height - textMax - y - 2 * barvgutter, 0, 100, 10, 1);
                }

                else if (that.config['data-chartLineType'] == 'stacked') {
                    that.chart = r.g.barchart(x, y, r.width - x, r.height - textMax - y, values, opts);

                    r.g.axis(x + barhgutter / 2, r.height - textMax - barvgutter, r.height - textMax - y - 2 * barvgutter, 0, maxStacked, vstep, 1);
//                        r.g.axis(x + barhgutter/2 , r.height - textMax - barvgutter , r.height - textMax - y - 2*barvgutter , isNaN(parseFloat(inConfig['data-ymin']))?0:parseFloat(inConfig['data-ymin']) , isNaN(parseFloat(opts.to))?max:opts.to+(isNaN(parseFloat(inConfig['data-ymin']))?0:parseFloat(inConfig['data-ymin'])) , vstep , 1 );
                }

                else if (that.config['data-chartLineType'] == 'basic') {
                    that.chart = r.g.barchart(x, y, r.width - x, r.height - textMax - y, values, opts);

                    r.g.axis(x + barhgutter / 2, r.height - textMax - barvgutter, r.height - textMax - y - 2 * barvgutter, isNaN(parseFloat(inConfig['data-ymin'])) ? 0 : parseFloat(inConfig['data-ymin']), isNaN(parseFloat(opts.to)) ? max : opts.to + (isNaN(parseFloat(inConfig['data-ymin'])) ? 0 : parseFloat(inConfig['data-ymin'])), vstep, 1);
                }

                if (inConfig['data-tooltipDisplay'] == 'true') {
                    that.chart.hover(function() {
                        var
                        value = this.bar.value;

                        if (columns[this.value.column].format) {
                            that.setFormat(columns[this.value.column].format);
                        }
                        else if (source.getAttribute(columns[this.value.column].sourceAttID) && source.getAttribute(columns[this.value.column].sourceAttID).dataClassAtt && source.getAttribute(columns[this.value.column].sourceAttID).dataClassAtt.defaultFormat) {
                            that.setFormat(source.getAttribute(columns[this.value.column].sourceAttID).dataClassAtt.defaultFormat.format);
                        }
                        else {
                            that.setFormat(columns[this.value.column].format);
                        }
                        this.tag = r.g[inConfig['data-tooltipType']](this.bar.x, inConfig['data-tooltipType'] === "label" ? this.bar.y - 15 : this.bar.y, this.value.getLabel(), parseInt(inConfig['data-tooltipAngle']) - 360).insertBefore(this).attr([{
                                fill: this.bar.attr("fill"),
                                stroke: '#000'
                            }, {
                                fill: '#000'
                            }]);
                    }, function() {
                        this.tag.animate({
                            opacity: 0
                        }, 300, function() {
                            this.remove();
                        });
                    });
                }

                /**
                 * Add the labels and the axis labels
                 * 
                 **/

                var
                width = 0,
                oldX,
                point,
                options;

                i = labels.length;
                j = 0;

                that.chart.each(function() {
                    if (j == values.length - 1) {
                        if (i == labels.length) {
                            width *= 2;
                        }

                        options = {
                            m: {
                                x: this.bar.x - this.attr('width') / 2 - barhgutter / 2,
                                y: r.height - textMax - barvgutter + 1
                            },
                            width: width ? width : this.attr('width') + barhgutter / 2 + 4,
                            height: -3
                        };

                        r.g.axisItem(options);

                        switch (inConfig['data-labelAlign']) {
                            case 'start' :
                                point = {
                                    x: options.m.x,
                                    y: r.height - textMax + textTemp.getBBox().height / 2 + 2,
                                    textAnchor: inConfig['data-labelAlign'],
                                    angle: labelAngle
                                }
                                break;
                            case 'middle' :
                                point = {
                                    x: options.m.x + options.width / 2,
                                    y: r.height - textMax / 2,
                                    textAnchor: inConfig['data-labelAlign'],
                                    angle: -labelAngle
                                };
                                break;
                            case 'end' :
                                point = {
                                    x: options.m.x,
                                    y: r.height - textTemp.getBBox().height / 2 - 2,
                                    textAnchor: 'start',
                                    angle: -labelAngle
                                }
                                break;
                            default :
                                point = {
                                    x: options.m.x + options.width / 2,
                                    y: r.height - textMax / 2,
                                    textAnchor: inConfig['data-labelAlign'],
                                    angle: -labelAngle
                                };
                                break;
                        }
                        textTemp = r.text(point.x, point.y, labels[i - 1]).attr({
                            'text-anchor': point.textAnchor
                        }).rotate(point.angle, point.x, point.y);

                        textSet.push(textTemp);
                        posTemp += barwidth + barhgutter;

                        j = 0;
                        width = 0;
                        i--;

                        return;
                    }

                    j++;

                    if (!oldX) {
                        oldX = this.bar.x + this.attr('width') + barhgutter / 2;
                    }

                    width += oldX - this.bar.x;
                    oldX = this.bar.x;
                })

                that.createLengendary();

                break;

        }

        for (var evt in this.events) {
            switch (evt) {
                case 'dblclickColumn':
                    this.chart.dblclickColumn(function(e) {
                        that.events.dblclickColumn.call(that, e);
                    });
                    break;
                case 'mousedown':
                    this.chart.mousedown(function(e) {
                        that.events.mousedown.call(that, e);
                    });
                    break;
                case 'mousedownColumn':
                    this.chart.mousedownColumn(function(e) {
                        that.events.mousedownColumn.call(that, e);
                    });
                    break;
                case 'mousemove':
                    this.chart.mousemove(function(e) {
                        that.events.mousemove.call(that, e);
                    });
                    break;
                case 'mousemoveColumn':
                    this.chart.mousemoveColumn(function(e) {
                        that.events.mousemoveColumn.call(that, e);
                    });
                    break;
                case 'mouseout':
                    this.chart.mouseout(function(e) {
                        that.events.mouseout.call(that, e);
                    });
                    break;
                case 'mouseoutColumn':
                    this.chart.mouseoutColumn(function(e) {
                        that.events.mouseoutColumn.call(that, e);
                    });
                    break;
                case 'mouseover':
                    this.chart.mouseover(function(e) {
                        that.events.mouseover.call(that, e);
                    });
                    break;
                case 'mouseoverColumn':
                    this.chart.mouseoverColumn(function(e) {
                        that.events.mouseoverColumn.call(that, e);
                    });
                    break;
                case 'mouseup':
                    this.chart.mouseup(function(e) {
                        that.events.mouseup.call(that, e);
                    });
                    break;
                case 'mouseupColumn':
                    this.chart.mouseupColumn(function(e) {
                        that.events.mouseupColumn.call(that, e);
                    });
                    break;
            }
            this.chart[evt](function(e) {

            });
        }

    },
    ready: function() {
        this._private = this._private || {};

        var that = this;
        var
        labels = [],
        values = [],
        valuesClone = [],
        source = this.source,
        shared = {
            classes: {
                container: 'waf-chart-container',
                legendary: 'waf-chart-legendary',
                title: 'waf-chart-title'
            }
        },
        linkedWidgets = this._getLinkedWidgets(shared.classes),
        columns,
        minLength,
        inConfig;

        // keep a reference to the widget's dom element used for user interactions
        // this is used in WAF.widget.disable/enable in order to block user interations
        // in such a case (see bug #WAK0081875 & #WAK0081624)
        this.containerNode = linkedWidgets['container'].containerNode;

        inConfig = this.config;
        columns = JSON.parse(inConfig['data-column'].replace(/'/g, '"'));

        this.isEmpty = true;
        this.columns = columns;
        this._private.linkedWidgets = linkedWidgets;

        /*
         * Drawing The legendary for Bar and Line Chart
         */
        that.createLengendary = function() {
            try {
                var legendaryC = linkedWidgets.legendary.$domNode;
                legendaryC.empty();
                legendaryC.css('overflow', 'auto');
                var legTable = $('<table></table>')
                .appendTo('#' + legendaryC.prop('id'))
                .addClass('waf-chart-legendary-table');

                for (var i = 0; i < values.length; i++) {
                    var htmlObj = $('<TR>' +
                    '<TD style="padding:1px">' +
                    '<DIV id = "' + legendaryC.prop('id') + '-legendary-item-' + i + '"></DIV></TD></TR>');
                    htmlObj.appendTo(legTable);
                    $('<TD style="padding-left:3px">' + unescape(columns[i].title) + '</TD>').appendTo(htmlObj);

                    Raphael(legendaryC.prop('id') + '-legendary-item-' + i, 20, 20).rect(0, 0, 20, 20).attr({
                        fill: that.colors[i]
                    });
                }
            } catch (e) {
                return;
            }

        }

        var r = Raphael(inConfig.id, $("#" + inConfig.id).width(), $("#" + inConfig.id).height());
        this._private.r = r;

        switch (inConfig['data-chartType']) {
            case 'Line Chart':
            case 'Bar Chart' :
                that.colors = [];
                for (i = 0; column = columns[i]; i++) {
                    that.colors.push(unescape(column.color));
                }
                break;
            case 'Pie Chart':
                that.colors = ["hsb(0.34,0.69,0.65)", "hsb(0.19,0.82,0.81)", "hsb(0.15,1,1)", "hsb(0.10,0.91,0.97)", "hsb(0.06,0.85,0.92)", "hsb(0.02,0.83,0.90)", "hsb(0.98,0.85,0.79)", "hsb(0.82,0.71,0.51)", "hsb(0.76,0.68,0.51)", "hsb(0.69,0.65,0.52)", "hsb(0.57,1,0.65)", "hsb(0.46,1,0.61)"];
                break;
        }

        if (source && inConfig['data-axisLabel'] && columns.length > 0) {
            source.addListener("all", function(e) {
                switch (e.eventKind) {
                    case "onAttributeChange":
                        var refresh = false;
                        if (inConfig['data-axisLabel'] == e.attributeName) {
                            refresh = true;
                        }
                        else {
                            for (var i = 0, column; column = columns[i]; i++) {
                                if (e.attributeName == column.colID) {
                                    refresh = true;
                                }
                            }
                        }

                        if (!refresh) {
                            break;
                        }
                    case "onElementSaved" :
                    case "onCollectionChange" :
                        labels = [];
                        values = [];
                        valuesClone = [];



                        for (var j = 0; j < columns.length; j++) {
                            values[j] = [];
                            valuesClone[j] = [];
                        }

                        minLength = Math.min(parseInt(inConfig['data-limitlength']), source.length);

                        for (var i = 0; i < minLength; i++) {
                            source.getElement(i, {
                                onSuccess: function(event) {
                                    var item = event.element;

                                    labels.push(item[inConfig['data-axisLabel']]);

                                    for (j = 0; j < columns.length; j++) {
                                        values[j].push(isNaN(parseFloat(item[columns[j].sourceAttID])) ? 0 : parseInt(item[columns[j].sourceAttID]));
                                        valuesClone[j].push(isNaN(parseFloat(item[columns[j].sourceAttID])) ? 0 : parseInt(item[columns[j].sourceAttID]));
                                    }

                                    if (event.userData.onLastEntity) {

                                        that._private.labels = labels;
                                        that._private.values = values;

                                        that.$domNode.data({
                                            labels: labels,
                                            values: valuesClone
                                        });

                                        that.recreateChart(labels, values);
                                    }

                                }
                            }, {
                                onLastEntity: i == Math.min(parseInt(inConfig['data-limitlength']), source.length) - 1,
                                order: i
                            }
                            );
                        }

                        break;
                    case "onCurrentElementChange" :
                        switch (inConfig['data-chartType']) {
                            case 'Pie Chart' :
                                try {
                                    that.chart.select(that.source.getPosition());
                                } catch (e) {

                                }
                                break;
                        }
                        break;
                }
            },{
                id: this.id
            });
        }
    },
    stopResize: function() {
        var
        labels,
        values;

        labels = this.getLabels();
        values = this.getValues();

        this.recreateChart(labels, values);
    }
}

);


(function() {
    Raphael.fn.g.axisItem = function(opts) {
        var
        res = this.set(),
        defaultOpts = {
            m: {
                x: 0,
                y: 0
            },
            width: 100,
            height: -10,
            v: 0
        };

        opts = $.extend(true, defaultOpts, opts);
        res.push(this.path("M" + opts.m.x + " " + opts.m.y +
        "L" + (opts.m.x + opts.width) + " " + opts.m.y +
        "L" + (opts.m.x + opts.width) + " " + (opts.m.y + opts.height)
        ));
        return res;
    }
}());
