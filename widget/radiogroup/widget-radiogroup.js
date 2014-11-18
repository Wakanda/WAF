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

WAF.Widget.provide(
/**
 *      
 * @class RadioGroup
 * @extends WAF.Widget
 */
'RadioGroup',
{
},
/**
 * The constructor of the widget
 *
 * @shared
 * @property constructor
 * @type Function
 **/
function WAFWidget(config, data, shared) {
    var
    that,
    listenerConfig,
    htmlObject,
    key,
    sourceOut,
    autoDispatch,
    options,
    primary,
    themes,
    classes,
    theme,
    icon,
    icons,
    i,
    definedTheme,
    radioLabel;

    that = this;
    config = config || {};
    htmlObject = this.$domNode;

    key = data['binding-key'];
    sourceOut = data['binding-out'];
    autoDispatch = data['autoDispatch'];
    options = data['binding-options'];
    primary = "ID";
    classes = htmlObject.prop('class');
    themes = [];

    definedTheme = WAF.pageTheme;

    this._primary = key;
    this.binding = data['binding'];
    this.bindingOut = data['binding-out'];

    if (!definedTheme) {
        definedTheme = $("body").attr("data-theme");
    }

    if (WAF.PLATFORM.modulesString === "mobile") {
        that.loadURL = '/walib/WAF/widget/radiogroup/skin/cupertino/svg/widget-radiogroup-skin-cupertino.svg';
    } else {
        that.loadURL = '/walib/WAF/widget/radiogroup/skin/default/svg/widget-radiogroup-skin-default.svg';
    }
    /*for (i in WAF.widget.themes) {
        theme = WAF.widget.themes[i].key;
        if (classes.match(theme)) {
            themes.push(theme);

            if (theme !== 'inherited') {
                definedTheme = theme;
            }
        }
    }*/

    /*
     * Add display class
     */
    htmlObject.removeClass('waf-direction-horizontal waf-direction-vertical');
    htmlObject.addClass('waf-direction-' + data.display);

    this.tmpIcon = null;

    this.dimension = config['data-display'] === 'horizontal' ? 'width' : 'height';
    this.value = 100 / htmlObject.children().length + '%';

    /*
     * Create a radio input
     * @method _createRadio
     */
    this._createRadio = function radiogroup_createradio(li, svg, icons, appendElement) {
        var
        i,
        radioLi,
        radioDiv,
        radioIcon,
        radioInput,
        imgHtml,
        cssClass,
        obj,
        that = this,
        radioElem,
        halfRadioHeight,
        tmpOverflowProperty;

        radioLi = li;
        radioInput = radioLi.children('input');
        radioLabel = radioLi.children('label');

        radioLi.children('.waf-widget.waf-radio').remove();

        radioDiv = $('<div class="waf-widget waf-radio">');

        radioDiv.addClass(themes.join(' '));

        var radioBox = $('<div class="waf-radio-box">').appendTo(radioDiv);

        cssClass = 'waf-icon waf-radio-icon';

        if (svg) {
            cssClass += ' waf-icon-svg';
        } else {
            cssClass += ' waf-icon-image';
        }

        /*
         * To prevent many svg load requests
         */
        radioIcon = $('<div class="' + cssClass + '">');

        /*
         * Img icon
         */
        if (icons) {
            for (i = 0; i < icons.length; i += 1) {
                imgHtml = $('<img>');

                imgHtml.addClass(icons[i].cssClass);

                imgHtml.prop({
                    src: icons[i].value
                });

                imgHtml.appendTo(radioIcon);
            }
            /*
             * Svg icon
             */
        } else {
            radioIcon.html($(svg).html());
        }

        radioIcon.appendTo(radioBox);

        radioInput.appendTo(radioDiv);

        radioDiv.appendTo(radioLi);

        radioDiv.find('input').before(radioLabel);

        if (appendElement) {
            radioLi.appendTo(this.domNode);
        }
        /* set elements sizes  */

        var elemHeight,
        label;

        /* temporary Overflow hidden to let firefox get the correct height */
        tmpOverflowProperty = htmlObject.css('overflow');
        htmlObject.css('overflow', 'hidden');

        if (this.binding === null) {
            radioLi.css(this.dimension, this.value);
            radioLi.css("line-height", radioDiv.get()[0].offsetHeight + "px");
            radioElem = radioLi.find(".waf-radio-box");
            halfRadioHeight = radioElem.get()[0].offsetHeight / 2;
            radioElem.css("margin-top", "-" + halfRadioHeight + "px");
        } else {
            label = radioLi.find("label");
            label.css("height", "auto");
            elemHeight = parseInt(label.get()[0].offsetHeight);
            radioLi.css("height", elemHeight + 20 + "px");
            radioLi.css("line-height", elemHeight + 20 + "px");
            radioElem = radioLi.find(".waf-radio-box");
            halfRadioHeight = radioElem.get()[0].offsetHeight / 2;
            radioElem.css("margin-top", "-" + halfRadioHeight + "px");
        }

        /* we set back htmlObject to its previous overflow property */
        htmlObject.css('overflow', tmpOverflowProperty);
        
        if (!WAF.PLATFORM.isTouch) {

            /*
             * Hover States events for radios & label
             */
            radioInput.hover(
            function(e) {
                radioDiv.addClass("waf-state-hover");
            },
            function(e) {
                radioDiv.removeClass("waf-state-hover waf-state-active");
            }
            );

            /*
             * Mouse down States events for radios & label
             */
            radioInput.bind('mousedown', {widget: this}, function(e) {
                if (!e.data.widget.$domNode.hasClass('waf-state-disabled')) {
                    radioDiv.addClass("waf-state-active");
                }
            });

            /*
             * Mouse up States events for radios
             */
            radioInput.bind('mouseup', {widget: this}, function(e) {
                if (!e.data.widget.$domNode.hasClass('waf-state-disabled')) {
                    window.setTimeout(function() {
                        radioDiv.removeClass("waf-state-active");
                    }, 0);
                }
            });

            radioInput.focusin(function() {
                radioDiv.addClass("waf-state-focus");
            });

            radioInput.focusout(function() {
                radioDiv.removeClass("waf-state-focus");
            });
        } else {
            radioInput.bind({
                touchstart: function() {
                    radioDiv.addClass("waf-state-active");
                },
                touchend: function() {
                    window.setTimeout(function() {
                        radioDiv.removeClass("waf-state-active");
                    }, 0);
                }
            });
        }

        /*
         * To force radio state change even if click on label
         */
        radioInput.bind('change', {}, function(e) {
            that._checkRadio($(this));
        });

        if (this._value && this._value === radioInput.val()) {
            radioInput[0].setAttribute('checked', 'checked');
        }

        if (radioInput && radioInput[0] && radioInput[0].getAttribute('checked')) {
            radioDiv.addClass('waf-state-selected');
        }

        if (appendElement) {
            return radioLi;
        }


    };

    this.addRadioButton = function(label, value, checked, radioId) {
        var that = this,
        dataSourceType,
        newObj,
        radioLi,
        radioElem,
        halfRadioHeight,
        htmlStr,
        radioDiv,
        bindingAttName,
        bindingOutAttName,
        DSTYPE = {
            SERVER: 1,
            LOCAL: 2
        };


        if (this.sourceAtt) {

            dataSourceType = (this.source instanceof WAF.DataSourceEm) ? DSTYPE.SERVER : DSTYPE.LOCAL;
            bindingAttName = (this.binding) ? WAF.dataSource.solveBinding(this.binding).attName : null;
            bindingOutAttName = (this.bindingOut) ? WAF.dataSource.solveBinding(this.bindingOut).attName : null;

            this.source.addNewElement();

            newObj = this.source.getCurrentElement();

            this.source.save(function() {

                if (dataSourceType === DSTYPE.SERVER) {
                    if (newObj[bindingAttName] && newObj[bindingAttName].setValue) {
                        newObj[bindingAttName].setValue(label);
                    }

                    if (newObj[bindingOutAttName] && newObj[bindingOutAttName].setValue) {
                        newObj[bindingOutAttName].setValue(value);
                    }

                } else {

                    if (bindingAttName) {
                        newObj[bindingAttName] = label;
                    }

                    if (bindingOutAttName) {
                        newObj[bindingOutAttName] = value;
                    }
                    that.source.sync();
                }
            });

        } else {
            radioId = radioId || this.config.id + '-' + ($('input[type=radio][name=' + this.config.id + ']').length);
            var htmlStr = '<li><input type="radio" value="' + value + '" name="' + this.config.id + '" id="' + radioId + '"/><label for="' + radioId + '">' + label + '</label></li>';
            this._value = (checked) ? value : this._value;

            this.value = 100 / (htmlObject.children().length + 1) + '%';

            $.each(htmlObject.children(), function() {
                radioLi = $(this);
                radioDiv = radioLi.first();

                radioLi.css(that.dimension, that.value);
                radioLi.css("line-height", radioDiv.get()[0].offsetHeight + "px");
                radioElem = radioLi.find(".waf-radio-box");
                halfRadioHeight = radioElem.get()[0].offsetHeight / 2;
                radioElem.css("margin-top", "-" + halfRadioHeight + "px");
            });

            if (icons.length > 0) {
                that._createRadio($(this), null, icons);
                this._setPosition();

            } else {
                $('<div>').svg({
                    loadURL: that.loadURL,
                    onLoad: function(svg) {
                        var
                        thisSvg,
                        radioTmp;

                        thisSvg = this;
                        svg.configure({
                            width: '100%',
                            height: '100%',
                            preserveAspectRatio: 'none'
                        });
                        var li = $('<li>');
                        var radioId = radioId || that.renderId + '-' + ($('input[type=radio][name=' + that.renderId + ']').length + 1);
                        li.append($('<input/>').attr({
                            'type': 'radio',
                            'name': that.config.id,
                            'data-num': radioId,
                            'id': that.config.id + '-' + radioId,
                            'value': value
                        }));
                        li.append($('<label/>').prop('for', that.config.id + '-' + radioId).html(label));

                        that._createRadio($(htmlStr), thisSvg, null, 1);

                        that._setPosition();
                    }
                });
            }
        }
    };

    icons = [];

    if (data['icon-default'])
        icons.push({cssClass: 'waf-radio-icon-default', value: data['icon-default']});
    if (data['icon-hover'])
        icons.push({cssClass: 'waf-radio-icon-hover', value: data['icon-hover']});
    if (data['icon-active'])
        icons.push({cssClass: 'waf-radio-icon-active', value: data['icon-active']});
    if (data['icon-selected'])
        icons.push({cssClass: 'waf-radio-icon-selected', value: data['icon-selected']});

    if (icons.length > 0) {
        $.each(htmlObject.children(), function() {
            that._createRadio($(this), null, icons);
        });
        this._setPosition();
    } else {

        $('<div>').svg({
            loadURL: that.loadURL,
            onLoad: function(svg) {
                var
                thisSvg;

                thisSvg = this;
                svg.configure({
                    width: '100%',
                    height: '100%',
                    preserveAspectRatio: 'none'
                });

                $.each(htmlObject.children(), function() {
                    that._createRadio($(this), thisSvg);
                });

                that._setPosition();
            }
        });
    }
    
    listenerConfig = {
        id: this.id,
        listenerID: this.id,
        listenerType: 'radioGroup',
        subID: config.subID ? config.subID : null
    };

    /*
     * Check a radio and add appropriated classes
     */
    this._checkRadio = function radiogroup__checkRadio(radio) {
        if (!this.$domNode.hasClass('waf-state-disabled')) {
            htmlObject.find('input[checked]').removeAttr('checked');
            radio.attr("checked", "checked");

            htmlObject.find('.waf-radio').removeClass("waf-state-selected");
            radio.parent().addClass("waf-state-selected");
            this._value = radio.val();
        }

    };

    if (this.sourceAtt) {
        /*
         * Save value if binding "in" is defined
         */

        this.sourceAtt.addListener(function(e) {
            var
            dsID,
            thatDs,
            widget;

            dsID = e.dataSource.getID();
            thatDs = {};
            widget = e.data.widget;

            switch (e.eventKind) {
                case  'onCurrentElementChange' :
                    /*
                     * Save value if binding "in" is defined
                     */

                    if ((autoDispatch && autoDispatch !== 'false') || autoDispatch === 'true') {
                        if (sourceOut) {
                            var bindingInfo = WAF.dataSource.solveBinding(sourceOut);
                            if (dsID === key) {
                                bindingInfo.dataSource[dsID].set(e.dataSource);

                                that._checkRadio($('#' + htmlObject.prop('id') + ' input[value="' + e.dataSource.getAttribute(primary).getValue() + '"]'));
                            } else {
                                value = e.dataSource.getAttribute(key).getValue();
                                bindingInfo.dataSource.getAttribute(bindingInfo.attName).setValue(value);

                                that._checkRadio($('#' + htmlObject.prop('id') + ' input[value="' + value + '"]'));
                            }
                        } else {
                            if (dsID !== key) {
                                value = e.dataSource.getAttribute(key).getValue();

                                that._checkRadio($('#' + htmlObject.prop('id') + ' input[value="' + value + '"]'));
                            }
                        }
                    }
                    break;

                case  'onCollectionChange' :
                case  'onAttributeChange' :
                    /*
                     * Add a radio for each data
                     */
                    thatDs.addRadio = function(thisSvg, icons) {
                        that._build(e.dataSource, thisSvg, icons);
                    };

                    if (icons.length > 0) {
                        thatDs.addRadio(null, icons);
                    } else {

                        $('<div>').svg({
                            loadURL: that.loadURL,
                            onLoad: function(svg) {
                                var
                                thisSvg;

                                thisSvg = this;
                                svg.configure({
                                    width: '100%',
                                    height: '100%',
                                    preserveAspectRatio: 'none'
                                });

                                thatDs.addRadio(thisSvg);
                            }
                        });

                    }

                    break;
            }
        }, listenerConfig, {widget: this});

        /*
         * Change current entity on change event
         */
        htmlObject.bind('change', {source: this.source, search: key}, function(e) {
            var
            value,
            bindingInfo,
            htmlObj;

            value = e.data.source[e.data.search];
            htmlObj = $(e.target);

            if ((autoDispatch && autoDispatch !== 'false') || autoDispatch === 'true') {
                e.data.source.select(parseInt(htmlObj.data('num')));
            }

            /*
             * Save value if binding "out" is defined
             */
            if (sourceOut) {
                bindingInfo = WAF.dataSource.solveBinding(sourceOut);

                if (typeof(value) === 'undefined' && e.data.source.getID() === e.data.search) {
                    e.data.source.select(htmlObj.data('num'));
                    bindingInfo.dataSource[e.data.source.getID()].set(e.data.source);
                } else {
                    bindingInfo.dataSource.getAttribute(bindingInfo.attName).setValue(e.target.value);
                }
            }
        });

        /*
         * Change value of defined source out
         */
        if (sourceOut) {
            var
            bindingInfo,
            thisDS;

            bindingInfo = WAF.dataSource.solveBinding(sourceOut);
            thisDS = bindingInfo.dataSource;

            thisDS.addListener('onCurrentElementChange', function(e) {

                var value;

                value = e.dataSource.getAttribute(bindingInfo.attName).getValue();

                if (e.data.source.getID() === e.data.search) {
                    e.dataSource[e.data.source.getID()].load({
                        onSuccess: function(e) {
                            if (e.entity) {
                                that._checkRadio($('#' + htmlObject.prop('id') + ' [data-num=' + (e.entity[primary].getValue() - 1) + ']'));
                            }
                        }
                    });
                } else {
                    that._checkRadio($('#' + htmlObject.prop('id') + ' input[value="' + value + '"]'));
                }

            }, {
                id: this.id
            }, {
                search: key,
                source: this.source
            });
        }

        /*
         * Unbinded radio
         */
    } else {
        /*
         * Change current entity on change event
         */
        htmlObject.bind('change', {widget: this}, function(e) {
            var bindingInfo;

            /*
             * Save value if binding "out" is defined
             */
            if (sourceOut && !e.data.widget._preventChange) {
                bindingInfo = WAF.dataSource.solveBinding(sourceOut);
                bindingInfo.dataSource.getAttribute(bindingInfo.attName).setValue(e.target.value);
            }
        });
    }

}, {
    ready: function radio_ready() {
        var
        that;

        that = this;
        if (this.config['data-binding-out']) {

            this._sourceOutInfo = WAF.dataSource.solveBinding(this.config['data-binding-out']);
            if (this._sourceOutInfo) {
                this.sourceOut = this._sourceOutInfo.dataSource;
            }
        }

        if (this.sourceOut) {
            this.sourceOut.addListener('all', function(e) {
                var
                kind,
                value,
                widget;

                widget = e.data.widget;
                kind = e.eventKind;

                switch (kind) {
                    case 'onAttributeChange' :
                    case 'onCurrentElementChange' :
                        value = e.dataSource.getAttribute(widget._sourceOutInfo.attName).getValue();

                        if (value && typeof(value) === 'object' && value[widget._primary]) {
                            value = value[widget._primary];
                        }

                        /*
                         * Prevent on change event script execution
                         */
                        that._preventChange = true;
                        widget.setValue(value);
                        that._preventChange = false;

                        widget._tmpValue = value;

                        break;
                }
            }, {
                id: this.id,
                listenerID: this.id
            }, {
                widget: that
            });
        }
    },
    setValue: function(val) {
        var radio;

        radio = this.$domNode.find('[value="' + val + '"]');

        if (radio.length > 0) {
            if (this.source) {
                var index = radio.attr('data-num');
                this.source.select(index);
            } else {
                this._value = val;
                this._checkRadio(radio);
            }
        }
    },
    /**
     * Select a radio of the radiogroup depending on a value
     * @method select
     * @param {String} value
     */
    select: function radio_select(value) {
        var
        radio,
        htmlObject;

        htmlObject = $(this.containerNode);

        radio = htmlObject.find('[value="' + value + '"]');

        if (radio.length > 0) {
            this._value = value;
            this._checkRadio(radio);
        }
    },
    _setPosition: function() {
        var
        radios = this.$domNode.find('.waf-radio'),
        radiosLength = radios.length,
        $radio;


        // Setting position
        radios && radios.map(function(i, radio) {
            if (!radio) {
                return;
            }

            $radio = $(radio);

            if (i === 0) {
                $radio.addClass('waf-position-first');
            } else {
                $radio.removeClass('waf-position-first');
            }

            if (i === radiosLength - 1) {
                $radio.addClass('waf-position-last');
            } else {
                $radio.removeClass('waf-position-last');
            }
        });
    },
    /**
     * Build the widget
     * @method _build
     * @param {object} ds
     * @param {object} thisSvg
     * @param {object} icons
     */
    _build: function(ds, thisSvg, icons) {
        var
        i,
        key,
        liCss,
        options,
        primary,
        widget,
        config,
        htmlObject;

        widget = this;
        config = this.config;
        htmlObject = this.$domNode;
        key = this.config['data-binding-key'];
        options = this.config['data-binding-options'];
        primary = "ID";

        htmlObject.children().remove();

        for (i = 0; i <= ds.length; i += 1) {
            if (i <= 100) {
                ds.getElement(i, {
                    onSuccess: function(e) {
                        var
                        i,
                        li,
                        nb,
                        val,
                        split,
                        label,
                        value,
                        display,
                        dimension;

                        display = false;

                        if (e.element) {
                            split = options.split(' ');
                            label = '';
                            value = e.element.getAttributeValue(key);
                            li = $('<li>');

                            if (typeof(value) === 'undefined') {
                                value = e.element.getAttributeValue(primary);
                            }

                            nb = 0;
                            for (i = 0; i < split.length; i += 1) {
                                if (split[i] !== '') {
                                    nb += 1;

                                    val = e.element.getAttributeValue(split[i].replace('[', '').replace(']', ''));

                                    label += val + ' ';

                                    if (val !== null) {
                                        display = true;
                                    }
                                }
                            }

                            /*
                             *  Format if label is a number
                             */
                            if (nb === 1 && label.replace(/ /g, '').match('^\\d+$') && !label.replace(/ /g, '').match('-')) {
                                label = e.data.widget.getFormattedValue(parseInt(label));
                            }


                            if (display) {
                                li.append($('<input/>').attr({
                                    'type': 'radio',
                                    'name': config.id,
                                    'data-num': e.position,
                                    'id': config.id + '-' + e.position,
                                    'value': value
                                }));
                                li.append($('<label/>').prop('for', config.id + '-' + e.position).html(label));

                                htmlObject.append(li);

                                widget._createRadio(li, thisSvg, icons);
                            }
                        }
                    }
                }, {
                    widget: this
                });
            }
        }

        var childrenLi;

        childrenLi = this.$domNode.children('li');

        if (this.dimension === 'width') {
            liCss = {
                'width': 100 / ds.length + '%',
                'height': this.$domNode.css('height'),
                'line-height': this.$domNode.css('height')
            };
        } else {
            liCss = {
                'height': 100 / ds.length + '%',
                'width': this.$domNode.css('width')
            };
        }

        childrenLi.css(liCss);

        if (!WAF.PLATFORM.isTouch && this.dimension !== 'width') {
            var childHeight;

            childHeight = childrenLi.outerHeight();

            this.$domNode.find('label').css({
                'height': childHeight + 'px',
                'line-height': childHeight + 'px'
            });
        }

        this._setPosition();
    },
    /**
     * Custom clear function
     * @method clear
     */
    clear: function() {
        this.$domNode.empty();
    }
}
);
