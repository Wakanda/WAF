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
    packageName: 'Widget/calendar',
    type: 'calendar',
    description: 'Calendar',
    category: 'Misc. Controls',
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
            name: 'data-calendars',
            description: 'Views',
            defaultValue: 1,
            typeValue: 'integer',
            slider: {
                min: 1,
                max: 12
            },
            reloadTag: true
        },
        {
            name: 'data-start',
            description: 'Start on',
            type: 'combobox',
            defaultValue: '1',
            options: [{
                    key: '1',
                    value: 'Monday'
                }, {
                    key: '2',
                    value: 'Tuesday'
                }, {
                    key: '3',
                    value: 'Wednesday'
                }, {
                    key: '4',
                    value: 'Thursday'
                }, {
                    key: '5',
                    value: 'Friday'
                }, {
                    key: '6',
                    value: 'Saturday'
                }, {
                    key: '7',
                    value: 'Sunday'
                }]
        },
        {
            name: 'data-mode',
            description: 'Selection mode',
            type: 'combobox',
            options: [{
                    key: 'single',
                    value: 'Single'
                }, {
                    key: 'multiple',
                    value: 'Multiple'
                }, {
                    key: 'range',
                    value: 'Range'
                }]
        },
        {
            name: 'data-format',
            description: 'Format',
            defaultValue: 'dd/mm/yy',
            autocomplete: {
                minLength: 0,
                source: [
                    {
                        value: "MM d, yy",
                        description: "March 1, 2011"
                    },
                    {
                        value: "d MM yy",
                        description: "1 March 2011"
                    },
                    {
                        value: "dd/mm/y",
                        description: "01/03/11"
                    },
                    {
                        value: "dd/mm/yy",
                        description: "01/03/2011"
                    },
                    {
                        value: "mm/dd/y",
                        description: "03/01/11"
                    },
                    {
                        value: "mm/dd/yy",
                        description: "03/01/2011"
                    },
                    {
                        value: "dd/mm",
                        description: "03/01"
                    },
                    {
                        value: "yy mm dd",
                        description: "2011 03 03"
                    },
                    {
                        value: "y mm dd",
                        description: "11 03 03"
                    }
                ],
                focus: function(event, ui) {
                    $(this).val(ui.item.value);
                    return false;
                },
                select: function(event, ui) {
                    $(this).val(ui.item.value);
                    return false;
                },
                custom: 'catcomplete'
            }
        },
        {
            name: 'data-save',
            description: 'Save automatically',
            type: 'checkbox',
            defaultValue: 'true'
        }
    ],
    style: [
        {
            name: 'width',
            defaultValue: '180px'
        },
        {
            name: 'height',
            defaultValue: '150px'
        }],
    events: [
        {
            name: 'onChange',
            description: 'On Change',
            category: 'Calendar Events'
        },
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
        }/*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/],
    structure:[
    {
    description: 'header',
    selector: '.datepickerHeader span',
    style: {
        text: true,
        textShadow: true,
        background: false,
        border: false,
        disabled: ['border-radius', 'line-height', 'letter-spacing']
    }
    }, 
	{
    description: 'day name header',
    selector: '.datepickerDoW span',
    style: {
        text: true,
        textShadow: true,
        background: false,
        border: false,
        disabled: ['border-radius', 'line-height', 'letter-spacing']
    }
   }, 
   {
    description: 'days in month',
    group: 'day view',
    selector: '.datepickerInMonth span',
    style: {
        text: true,
        textShadow: true,
        background: false,
        border: false,
        disabled: ['line-height', 'letter-spacing']
    }
    }, 
	{
    description: 'days not in month',
    group: 'day view',
    selector: '.datepickerNotInMonth span',
    style: {
        text: true,
        textShadow: true,
        background: false,
        border: false,
        disabled: ['line-height', 'letter-spacing']
    }
    }, 
	{
    description: 'week numbers',
    group: 'day view',
    selector: '.datepickerWeek span',
    style: {
        text: true,
        textShadow: true,
        background: false,
        border: false,
        disabled: ['line-height', 'letter-spacing']
    }
    }, 
	{
    description: 'selected day(s)',
    group: 'day view',
    selector: '.datepickerSelected',
    style: {
        text: true,
        textShadow: true,
        background: true,
        border: false,
        disabled: ['line-height', 'letter-spacing']
    }
    }, 
	{
    description: 'month',
    group: 'month view',
    selector: '.datepickerMonths tr td a span',
    style: {
        text: true,
        textShadow: true,
        background: true,
        border: false,
        disabled: ['line-height', 'letter-spacing']
    }
    }, 
	{
    description: 'year',
    group: 'year view',
    selector: '.datepickerYears tr td a span',
    style: {
        text: true,
        textShadow: true,
        background: true,
        border: false,
        disabled: ['line-height', 'letter-spacing']
    }
    }],
    properties: {
        style: {
            theme: false,
            fClass: true,
            text: false,
            background: true,
            border: true,
            sizePosition: true,
            dropShadow: true,
            innerShadow: true,
            label: false,
            disabled: []
        }
    },
    menu: [{
            icon: '/walib/WAF/widget/calendar/icons/round_select.png',
            title: 'Select View',
            callback: function() {
                var tag = this;

                var callback = function() {
                    var
                    data = $(this).data(),
                    menu = $('#selectcalendarview' + tag.getId()),
                    styleSelect = $("#studio-form-select-structure"),
                    oldVal = tag._getView();

                    tag._selectView(data.view);
                    D.env.form.tabview.selectTab(3);
                    tag._updateSize();

                    menu.hide();
                    D.tag.setCurrent(tag);

                    Designer.beginUserAction('084');

                    var action = new Designer.action.setCalendarView({
                        val: data.view,
                        oldVal: oldVal,
                        tagId: tag.id
                    });

                    Designer.getHistory().add(action);

                    return false;
                }

                tag._createMenu('selectcalendarview' + tag.getId(), {
                    'top': 0,
                    'left': 25,
                    items: [
                        {
                            text: '"Day" view',
                            onclick: callback,
                            data: {
                                view: 'datepickerViewDays',
                                tag: tag,
                                selector: '.datepickerSelected span',
                                value: 'day'
                            }
                        },
                        {
                            text: '"Month" view',
                            onclick: callback,
                            data: {
                                view: 'datepickerViewMonths',
                                tag: tag,
                                selector: '.datepickerMonths tr td a span',
                                value: 'month'
                            }
                        },
                        {
                            text: '"Year" view',
                            onclick: callback,
                            data: {
                                view: 'datepickerViewYears',
                                tag: tag,
                                selector: '.datepickerYears tr td a span',
                                value: 'year'
                            }
                        }
                    ]
                });
            }
        }],
    onInit: function(config) {
        var widget = new WAF.widget.Calendar(config);
        return widget;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var
        htmlObject;

        if (tag._styleChanged) {
            tag._updateSize && tag._updateSize();
            tag._styleChanged = false;
            return;
        }

        htmlObject = tag.getHtmlObject();

        htmlObject.empty();

        htmlObject.DatePicker({
            flat: true,
            calendars: config['data-calendars'],
            date: new Date(config['data-date']),
            starts: config['data-start'],
            view: 'days',
            format: config['data-format'],
            mode: config['data-mode']
        });

        htmlObject.DatePickerSetDate(new Date(), true);

        htmlObject.append($('<div>').css({
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%'
        }));

        if (isResize) {
            var
            width,
            height,
            datepicker,
            dpContainer;

            datepicker = htmlObject.find('.datepicker');
            dpContainer = datepicker.find('.datepickerContainer');

            height = $(dpContainer.find('tr').get(0)).height() + datepicker.find('.datepickerBorderT').height() + datepicker.find('.datepickerBorderB').height();
            width = $(dpContainer.find('tr').get(0)).width() + datepicker.find('.datepickerBorderL').width() + datepicker.find('.datepickerBorderR').width();

            if (tag.getWidth() != width) {
                tag._private.width = width;
                tag.setWidth(width);
            }

            if (tag.getHeight() != height) {
                tag._private.height = height;
                tag.setHeight(height);
            }
        }

        else if (tag._updateSize) {
            tag._updateSize();
        }
    },
    onCreate: function(tag, param) {
        tag._private = tag._private || {};
        tag._private.width = tag.getWidth();
        tag._private.height = tag.getHeight();

        tag._createMenu = function create_menu(id, config) {
            var
            div = $('<div>'),
            bdDiv = $('<div>').addClass('bd'),
            ul = $('<ul>').addClass('first-of-type');

            $('#' + id).remove();

            div.prop({
                'id': id
            });

            div.addClass('yui-module yui-overlay yuimenu visible');

            div.css({
                'top': config.top,
                'left': config.left,
                'position': 'absolute',
                'z-index': 1,
                'visibility': 'visible'
            });

            for (var i = 0, item; item = config.items[i]; i++) {
                var
                li = $('<li>'),
                a = $('<a>');

                li.addClass('yuimenuitem calendarview');
                a.addClass('yuimenuitemlabel');

                a.prop({
                    href: '#'
                });

                a.html(item.text);
                li.bind({
                    click: item.onclick,
                    mouseup: item.mouseup
                });

                li.data(item.data);

                a.appendTo(li);
                li.appendTo(ul);
            }

            $(document).on('mouseover', '.calendarview', function() {
                $(this).addClass('yuimenuitem-selected');
                $(this).children().addClass('yuimenuitemlabel-selected');
            });

            $(document).on('mouseout', '.calendarview', function() {
                $(this).removeClass('yuimenuitem-selected');
                $(this).children().removeClass('yuimenuitemlabel-selected');
            });

            ul.appendTo(bdDiv);
            bdDiv.appendTo(div);
            div.appendTo($('#waf-focus-menu-' + tag.getId()));
        }

        tag._selectView = function select_view(viewName) {
            var
            th = tag.getHtmlObject().find('.datepickerMonth'),
            el = th.children(),
            tblEl = th.parent().parent().parent(),
            view = tblEl.attr('class');

            if (viewName != view) {
                tblEl.attr('class', viewName);
            }
        };

        tag._getView = function get_view() {
            var
            th = tag.getHtmlObject().find('.datepickerMonth'),
            el = th.children(),
            tblEl = th.parent().parent().parent(),
            view = $(tblEl).prop('class');

            return view;
        }

        tag._updateSize = function update_the_size() {
            var
            overlay,
            htmlObj,
            datepicker,
            dpContainer;

            overlay = tag.getOverlayHtmlObject();
            htmlObj = tag.getHtmlObject();
            datepicker = htmlObj.find('.datepicker');
            dpContainer = datepicker.find('.datepickerContainer');

            overlay.height($(dpContainer.find('tr').get(0)).height() + datepicker.find('.datepickerBorderT').height() + datepicker.find('.datepickerBorderB').height());
            overlay.width($(dpContainer.find('tr').get(0)).width() + datepicker.find('.datepickerBorderL').width() + datepicker.find('.datepickerBorderR').width());

            tag.setFocus(false);
            tag.setFocus(true);
        }

        if (!$.fn.catcomplete) {
            $.widget("custom.catcomplete", $.ui.autocomplete, {
                _renderMenu: function(ul, items) {
                    $.each(items, function(index, item) {
                        $("<li></li>")
                        .data("item.autocomplete", item)
                        .append("<a>" + item.value + "<br><span class='waf-calendar-acDescription'>" + item.description + "</span></a>")
                        .appendTo(ul);
                    });
                }
            });
        }
    }
});