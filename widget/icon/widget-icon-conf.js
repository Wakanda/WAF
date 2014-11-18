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
    packageName: 'Widget/icon',
    type: 'icon',
    lib: 'WAF',
    description: 'Icon',
    category: 'Misc. Controls',
    img: '/walib/WAF/widget/image/icons/widget-image.png',
    //resizable   : false,
    css: [],
    include: [],
    tag: 'span',
    attributes: [
        {
            name: 'data-draggable',
            description: 'Draggable',
            type: 'checkbox'
        },
        {
            name: 'data-label',
            description: 'Label',
            defaultValue: ''
        },
        {
            name: 'data-label-position',
            description: 'Label position',
            defaultValue: 'left'
        },
        /*
         * Sprite info attribute
         */
        {
            name: 'data-sprite-info',
            id: 'waf-form-spriteManager',
            description: 'Preview',
            tabCategory: 'Image',
            //category    : 'Image',
            tab: 'style',
            type: 'container',
            style: {
                'position': 'relative',
                'max-width': '260px',
                'overflow': 'hidden'
            },
            ready: function() {
                var
                tag,
                pos,
                data,
                state,
                tmpDiv,
                jsonObj,
                computed,
                maxWidth,
                maxHeight,
                spriteImg,
                container,
                attrValue,
                htmlObject,
                spritePath,
                idSelector,
                selectorCSS,
                imageContainer,
                spriteInfoAttr,
                spriteSelector;

                maxWidth = 260;
                maxHeight = 260;
                data = this.data;
                tag = data.tag;
                htmlObject = this.htmlObject;
                spriteInfoAttr = tag.getAttribute('data-sprite-info');
                attrValue = tag.getAttribute('data-image-state1').getValue();
                idSelector = 'sprite-selector';
                state = getTagStateLabel(tag);
                computed = tag.getComputedStyle('background-position');

                selectorCSS = {
                    'position': 'absolute',
                    'background': 'rgba(156,185,230,0.8)',
                    'cursor': 'pointer'
                }

                /*
                 * Set sprite selector properties if exist on widget load
                 */
                if (spriteInfoAttr.getValue() || computed != '0px 0px') {
                    if (!computed) {
                        jsonObj = JSON.parse(spriteInfoAttr.getValue().replace(/\'/g, '"'))[0];
                        jsonObj = jsonObj[state] ? jsonObj[state] : jsonObj['state1'];
                        pos = jsonObj.split(' ');
                    } else {
                        pos = computed.split(' ');
                    }

                    selectorCSS.left = parseInt(pos[0]) * -1 + "px";
                    selectorCSS.top = parseInt(pos[1]) * -1 + "px";
                    selectorCSS.width = tag.getStyle('width') + "px";
                    selectorCSS.height = tag.getStyle('height') + "px";
                    /*
                     * Default selector size and position
                     */
                } else {
                    selectorCSS.left = "0px";
                    selectorCSS.top = "0px";
                    selectorCSS.width = tag.getStyle('width') + "px";
                    selectorCSS.height = tag.getStyle('height') + "px";
                }

                /*
                 * Show attribute editor
                 * remove existings images
                 */
                this.htmlObject.parent().parent().show();
                this.htmlObject.children().remove();

                /*
                 * Create image container
                 */
                container = $('<div>')
                .css({
                    'margin-bottom': '10px',
                    //'width'         : maxWidth + 'px',
                    'max-height': maxHeight + 'px',
                    'overflow': 'hidden'
                })
                .appendTo(htmlObject);

                imageContainer = $('<div>')
                .css({
                    position: 'relative'
                })
                .appendTo(container);

                /*
                 * Create sprite selector            
                 */
                spriteSelector = $('<div id="' + idSelector + '">')
                .css(selectorCSS)
                .appendTo(imageContainer)
                /*
                 * Set Resizable
                 */
                .resizable({
                    containment: 'parent',
                    handles: 'n, e, s, w'
                })
                /*
                 * Set draggable
                 */
                .draggable({
                    containment: 'parent',
                    /*
                     * Stop draw sprite selector on start drag
                     */
                    start: function() {
                        D.ui._startSpriteSelector = false
                    },
                    /*
                     * Refresh tag background position on drag
                     */
                    drag: function(e, ui) {
                        var
                        i,
                        tagElt,
                        selectionCount;
                        /*
                         * Update sprite info attribute
                         */
                        selectionCount = Designer.env.tag.selection.count();

                        if (selectionCount > 1) {
                            for (i = 0; i < selectionCount; i += 1) {
                                tagElt = Designer.env.tag.selection.get(i);
                                tagElt._updateSpriteInfo(spriteSelector.css('left'), spriteSelector.css('top'));

                                tagElt.onDesign(true);
                            }
                        } else {
                            tag._updateSpriteInfo(spriteSelector.css('left'), spriteSelector.css('top'));

                            tag.onDesign(true);
                        }
                    }
                });

                /*
                 * Do not display if separated images
                 */
                if (tag.getAttribute('data-icon-type').getValue() != 'sprite') {
                    this.htmlObject.parent().parent().hide();
                    return;
                }

                if (attrValue) {
                    spritePath = Designer.util.formatPath(attrValue);

                    /*
                     * Display sprite image
                     */
                    spriteImg = $('<img src="' + spritePath.fullPath + '">')
                    .css({
                        'cursor': 'crosshair'
                    })
                    .appendTo(imageContainer)


                    /*
                     * Execute script after image sprite load      
                     */
                    spriteImg[0].onload = function() {
                        var
                        imgWidth,
                        imgHeight,
                        _tmpIndex,
                        _tmpParent,
                        _timeoutShow,
                        _timeoutHide;

                        imgWidth = spriteImg.width();
                        imgHeight = spriteImg.height();

                        container.css({
                            'width': imgWidth
                        });

                        if (imgHeight > maxHeight) {
                            container.css({
                                'height': imgHeight
                            });
                        }

                        if (imgWidth > maxWidth || imgHeight > maxHeight) {
                            /*
                             * Move on mouse over
                             */
                            _tmpParent = [];

                            imageContainer.hover(function() {
                                var pos,
                                    x = htmlObject.offset().left,
                                    y = htmlObject.offset().top;

                                pos = (x - (imgWidth - maxWidth) - 10);

                                $(this).stop(true, true);
                                /*
                                 * Clear animation timeout
                                 */
                                clearTimeout(_timeoutHide);

                                if (imgWidth <= maxWidth) {
                                    pos = imageContainer.offset().left - 1;
                                }

                                if (imageContainer.offset().left == pos) {
                                    return;
                                }

                                /*
                                 * Time out to do not instantly execute animation
                                 */
                                _timeoutShow = setTimeout(function() {
                                    imageContainer
                                    .appendTo('body')
                                    .css({
                                        'left': x,
                                        'top': y,
                                        'position': 'absolute',
                                        'background-color': 'white',
                                        '-webkit-box-shadow': '2px 2px 6px rgba(0, 0, 0, 0.2)'
                                    })
                                    .animate({
                                        'left': pos + 'px'
                                    }, 200);
                                }, 100);
                            }, function() {
                                /*
                                 * Clear animation timeout
                                 */
                                clearTimeout(_timeoutShow)

                                $(this).stop(true, true);

                                _timeoutHide = setTimeout(function() {
                                    var x = htmlObject.offset().left;

                                    /*
                                     * Move image
                                     */
                                    imageContainer.animate({
                                        'left': x + 'px'
                                    }, 150, function() {
                                        imageContainer
                                        .appendTo(container)
                                        .css({
                                            'left': 0,
                                            'top': 0,
                                            'position': 'relative',
                                            'background-color': 'transparent',
                                            '-webkit-box-shadow': 'none'
                                        });

                                    });
                                }, 500);
                            });
                        }
                    }


                    /*
                     * Begin draw sprite selector on mousedown                    
                     */
                    imageContainer.bind('mousedown', function(e) {
                        /*
                         * Do not draw sprite selector if click 
                         * on spriteSelector object
                         */
                        if (e.target.tagName != "IMG") {
                            D.ui._startSpriteSelector = false;
                        } else {
                            D.ui._startSpriteSelector = true;

                            selectorCSS.left = e.offsetX;
                            selectorCSS.top = e.offsetY;
                            selectorCSS.width = 0;
                            selectorCSS.height = 0;

                            spriteSelector
                            .css(selectorCSS)

                            D.ui._tmpSpriteSelector = {
                                x: e.offsetX,
                                y: e.offsetY
                            }
                        }
                    });

                    /*
                     * Draw sprite selector on mousemouse                    
                     */
                    imageContainer.bind('mousemove', function(e) {
                        var
                        calculX,
                        calculY;

                        if (!D.ui._startSpriteSelector) {
                            return;
                        }

                        calculX = e.offsetX - D.ui._tmpSpriteSelector.x;
                        calculY = e.offsetY - D.ui._tmpSpriteSelector.y;

                        selectorCSS.width = (spriteSelector.width() + calculX) + 'px';
                        selectorCSS.height = (spriteSelector.height() + calculY) + 'px';

                        selectorCSS['pointer-events'] = 'none';

                        spriteSelector
                        .css(selectorCSS)

                        D.ui._tmpSpriteSelector = {
                            x: e.offsetX,
                            y: e.offsetY
                        }
                    });

                    /*
                     * Stop draw sprite selector on mousedown     
                     */
                    imageContainer.bind('mouseup', function() {
                        var
                        i,
                        top,
                        left,
                        width,
                        height,
                        selectionCount;

                        width = spriteSelector.width();
                        height = spriteSelector.height();
                        left = spriteSelector.css('left');
                        top = spriteSelector.css('top');

                        /**
                         * update tag
                         * @updateTag 
                         * @param {object} tagElt
                         * @param {number} left
                         * @param {number} top
                         * @param {number} width
                         * @param {number} height
                         */
                        this.updateTag = function(tagElt, left, top, width, height) {
                            /*
                             * Update sprite info attribute
                             */
                            tagElt._updateSpriteInfo(left, top);

                            /*
                             * Update tag size depending on spriteSelector size              
                             * Disable domUpdate
                             */
                            D.tag.preventDomUpdate();

                            tagElt.setWidth(width, false)
                            tagElt.setHeight(height, false)

                            /*           
                             * Enable domUpdate
                             */
                            D.tag.preventDomUpdate(false);

                            tagElt.onDesign(true);
                            tagElt.domUpdate();
                        }


                        selectionCount = Designer.env.tag.selection.count();

                        if (selectionCount > 1) {
                            for (i = 0; i < selectionCount; i += 1) {
                                tagElt = Designer.env.tag.selection.get(i);

                                this.updateTag(tagElt, left, top, width, height);
                            }
                        } else {
                            this.updateTag(tag, left, top, width, height);
                        }



                        spriteSelector
                        .css('pointer-events', 'auto');

                        D.ui._startSpriteSelector = false;

                        $('#waf-sprite-input-width').val(width);
                        $('#waf-sprite-input-height').val(height);
                        $('#waf-sprite-input-left').val(parseInt(left));
                        $('#waf-sprite-input-top').val(parseInt(top));
                    });

                    tmpDiv = $('<div>').appendTo(htmlObject)

                    createSpriteManagerInput(tag, spriteSelector, 'Width', tmpDiv);
                    createSpriteManagerInput(tag, spriteSelector, 'Left', tmpDiv);
                    createSpriteManagerInput(tag, spriteSelector, 'Height', tmpDiv);
                    createSpriteManagerInput(tag, spriteSelector, 'Top', tmpDiv);
                }
            }
        },
        /*
         * Display states image path attribute
         */
        iconImageStateAttribute('state1'),
        iconImageStateAttribute('state2'),
        iconImageStateAttribute('state3'),
        iconImageStateAttribute('state4'),
        /*
         * Icon type selector
         */
        {
            name: 'data-icon-type',
            description: 'Type',
            type: 'combobox',
            onchange: function() {
                var
                tag,
                data;

                data = this.data;
                tag = data.tag;
                /*
                 * Reload sprite manager
                 */
                waForm.components.get('waf-form-spriteManager')._ready()

                switch (this.getValue()) {
                    case 'images' :
                        tag.getHtmlObject().css('background-image', 'none');
                        break;
                }
            },
            options: [{
                    value: 'Separate images',
                    key: 'images'
                }, {
                    value: 'Sprite',
                    key: 'sprite'
                }],
            defaultValue: 'images',
            tabCategory: 'Image',
            //category    : 'Image',
            tab: 'style',
            ready: function() {
                var
                tag,
                data,
                currentState;

                data = this.data;
                tag = data.tag;
                currentState = getTagStateLabel(tag);

                if (currentState != 'state1') {
                    this.htmlObject.parent().parent().hide();
                }
            }
        }],
    events: [{
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
        }/*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/],
    properties: {
        style: {
            theme: false,
            fClass: true,
            text: false,
            background: true,
            gradient: true,
            border: true,
            sizePosition: true,
            shadow: true,
            disabled: ['background-image']
        },
        state: [{
                label: 'hover',
                cssClass: 'waf-state-state2'
            }, {
                label: 'active',
                cssClass: 'waf-state-state3'
            }, {
                label: 'disabled',
                cssClass: 'waf-state-state4'
            }]
    },
    style: [
        {
            name: 'width',
            defaultValue: '24px'
        },
        {
            name: 'height',
            defaultValue: '24px'
        }],
    onInit: function(config) {
        return new WAF.widget.Icon(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var
        i,
        ctx,
        path,
        state,
        width,
        height,
        canvas,
        _state,
        aState,
        htmlCSS,
        iconType,
        iconHtml,
        iconClass,
        thisWidth,
        iconImage,
        thisHeight,
        htmlObject,
        spriteInfo,
        state1Value,
        attrSpriteInfo;

        htmlObject = tag.getHtmlObject();
        iconType = tag.getAttribute('data-icon-type').getValue();
        iconType = iconType || 'images';

        switch (iconType) {
            /*
             * Case of separated images
             */
            case 'images':

                /*
                 * Keep data images into _iconState object
                 */
                tag._iconState = {
                    'state1': tag.getAttribute('data-image-state1').getValue(),
                    'state2': tag.getAttribute('data-image-state2').getValue(),
                    'state3': tag.getAttribute('data-image-state3').getValue(),
                    'state4': tag.getAttribute('data-image-state4').getValue()
                }

                _state = getTagStateLabel(tag);

                /*
                 * Add images
                 */
                for (i in tag._iconState) {
                    aState = tag._iconState[i];
                    iconClass = 'waf-icon-' + i;
                    iconHtml = $('#' + tag.getId() + ' .' + iconClass);

                    if (aState) {
                        path = Designer.util.formatPath(aState);

                        /*
                         * If image already exists for this state
                         */
                        if (iconHtml.length > 0) {
                            iconHtml.prop('src', path.fullPath);
                        }
                        /*
                         * else create it
                         */
                        else {
                            iconHtml = $('<img class="' + iconClass + '" src="' + path.fullPath + '">')
                            .appendTo(htmlObject);
                        }

                        if (i != _state) {
                            iconHtml.hide();
                        }
                        /*
                         * Remove image if not defined
                         */
                    } else {
                        iconHtml.remove();
                    }
                }

                /*
                 * Resize icon depending on data-fit value
                 */
                htmlObject.find('img').width('100%').height('100%');


                break;

                /*
                 * Case of sprite :
                 * Set background image with background-position
                 */
            case 'sprite':
                /*
                 * Remove existing images
                 */
                htmlObject.find('img').remove();

                attrSpriteInfo = tag.getAttribute('data-sprite-info');
                state1Value = tag.getAttribute('data-image-state1').getValue();

                if (attrSpriteInfo && state1Value) {
                    spriteInfo = attrSpriteInfo.getValue();

                    htmlCSS = {
                        'background-image': 'url("' + Designer.util.formatPath(state1Value).fullPath + '")'
                    }

                    if (spriteInfo) {

                        state = getTagStateLabel(tag);

                        spriteInfo = JSON.parse(spriteInfo.replace(/\'/g, '"'))[0];
                        spriteInfo = spriteInfo[state] || spriteInfo['state1'];

                        //htmlCSS['background-position'] = spriteInfo;
                    }
                    htmlObject.css(htmlCSS);

                }

                _state = 'state1';

                break;
        }

        width = tag.getWidth();
        height = tag.getHeight();

        /*
         * Create canvas if no image
         */
        if (!tag.getAttribute('data-image-' + _state).getValue()) {

            htmlObject.find('canvas').remove();

            canvas = $('<canvas width="' + width + 'px" height="' + height + 'px">')
            .css({
                'position': 'absolute',
                'left': '0px',
                'top': '0px'
            });

            htmlObject.append(canvas);

            ctx = canvas[0].getContext("2d");
            ctx.fillStyle = "rgb(200,0,0)";
            ctx.fillRect(0, 0, width / 2, height / 2);
            ctx.fillStyle = "rgba(0, 50, 200, 0.5)";
            ctx.fillRect(width / 2 - width / 6, height / 2 - height / 6, width / 2 + width / 6, height / 2 + height / 6);

            canvas.css({
                'width': '100%',
                'height': '100%'
            });
        } else {
            htmlObject.find('canvas').remove();
        }

    },
    onCreate: function(tag, param) {
        /**
         * Change the icon depending on the state
         * @method _changeIcon
         * @param {string} state
         */
        tag._showIcon = function change_icon(state) {
            var
            i,
            iconHtml;

            for (i in this._iconState) {
                iconHtml = $('#' + this.getId() + ' .waf-icon-' + i);

                /*
                 * Show defined state icon
                 */
                if (i == state) {
                    iconHtml.show();
                } else {
                    iconHtml.hide();
                }
            }
        }

        /*
         * Widget custom on state change event
         */
        $(tag).bind('onStateChange', function(e, state) {
            state = state == -1 ? 'waf-state-state1' : state

            this._showIcon(state.replace('waf-state-', ''));
        });


        /*
         * Widget custom on file drop event
         * Set path for all states
         */
        $(tag).bind('onFileDrop', function(e, data) {
            var
            i,
            that,
            path,
            state,
            tmpImg;

            that = this;
            path = data.path.cropedPath;

            tmpImg = $('<img src="' + data.path.fullPath + '">').appendTo('body');

            tmpImg[0].onload = function() {
                var
                i,
                x,
                y,
                nb,
                json,
                isInt,
                width,
                state,
                states,
                height,
                imgObj,
                noState,
                infoAttr,
                iconType,
                newWidth,
                newHeight,
                thatState,
                listStates;

                imgObj = $(this);
                noState = true;
                iconType = that.getAttribute('data-icon-type').getValue();
                infoAttr = that.getAttribute('data-sprite-info');
                width = imgObj.width();
                height = imgObj.height();
                listStates = [];
                states = ['state1', 'state2', 'state3', 'state4']

                /*
                 * Auto detect proportion to set as sprite or not
                 */
                if (height > width) {
                    nb = (height / width);
                    newWidth = newHeight = width;

                    for (i = 0; i < nb; i += 1) {
                        x = 0;
                        y = i * newHeight;
                        listStates.push("'" + states[i] + "' : '-" + x + "px -" + y + "px'");
                    }

                } else {
                    nb = (width / height);
                    newWidth = newHeight = height;

                    for (i = 0; i < nb; i += 1) {
                        x = i * newHeight;
                        y = 0;
                        listStates.push("'" + states[i] + "' : '-" + x + "px -" + y + "px'");
                    }

                }

                isInt = D.util.isInt(nb);

                if (isInt && nb > 2) {
                    json = "{"
                    + listStates.join(',')
                    + "}";

                    iconType = 'sprite';

                    that.getAttribute('data-icon-type').setValue(iconType);
                    that.setWidth(newWidth, false);
                    that.setHeight(newHeight, false);

                    infoAttr.setValue("[" + json + "]");

                }

                switch (iconType) {
                    case 'images':
                        thatState = getTagStateLabel(that);

                        for (i in that._iconState) {
                            state = that._iconState[i];

                            if (!state) {
                                that.getAttribute('data-image-' + i).setValue(path);

                                that._iconState[i] = path;
                            } else {
                                noState = false;
                            }
                        }

                        that.getAttribute('data-image-' + thatState).setValue(path);

                        that._showIcon(thatState);

                        break;

                    case 'sprite':
                        if (!infoAttr.getValue()) {
                            infoAttr.setValue("[{'state1':'-0px -0px'}]");
                        }
                        that.getAttribute('data-image-state1').setValue(path);
                        break;
                }

                D.tag.preventDomUpdate();

                /*
                 * Change widget size
                 */
                if (noState && iconType == 'images' && !data.keepSize && !that._inButton) {
                    that.setWidth(imgObj.width());
                    that.setHeight(imgObj.height());
                }

                /*
                 * Set focus
                 */
                that.onDesign(true);

                D.tag.preventDomUpdate(false);

                that.domUpdate();

                if (!data.silentMode) {
                    that.setCurrent();
                    D.tag.refreshPanels();
                }
            }
        });


        /*
         * Widget custom dom update event
         * save images into widget dom
         */
        $(tag).bind('onDomUpdate', function(e, element) {
            var
            i,
            state,
            image,
            jsonObj,
            iconType,
            thisState,
            stateInfo,
            childNodes;

            childNodes = element.getChildNodes();

            /*
             * Remove existing images
             */
            for (i in childNodes) {
                childNodes[i].remove();
            }

            /*
             * Fix images duplicate
             */
            element._json.childNodes = [];

            iconType = tag.getAttribute('data-icon-type').getValue();
            iconType = iconType || 'images';

            switch (iconType) {
                case 'images':
                    /*
                     * Add states images
                     */
                    for (i in this._iconState) {
                        state = tag.getAttribute('data-image-' + i).getValue();

                        if (state) {
                            image = Designer.env.document.createElement('img');
                            image.setAttribute('src', state);
                            image.setAttribute('class', 'waf-icon-' + i);

                            element.appendChild(image);
                        }
                    }

                    break;

                case 'sprite':
                    /*
                     * Remove useless attributes
                     */
                    element.removeAttribute('data-image-state2');
                    element.removeAttribute('data-image-state3');
                    element.removeAttribute('data-image-state4');

                    if (this.getAttribute('data-sprite-info').getValue()) {

                        /*
                         * Save states into css file
                         */
                        jsonObj = JSON.parse(this.getAttribute('data-sprite-info').getValue().replace(/\'/g, '"'))[0];

                        for (i = 1; i <= 4; i += 1) {
                            thisState = jsonObj['state' + i];
                            if (thisState) {
                                stateInfo = {
                                    cssClass: 'waf-state-state' + i,
                                    find: '',
                                    label: 'state' + i,
                                    selector: '#' + this.getId() + '.waf-state-state' + i
                                };

                                if (i == 1) {
                                    stateInfo = null
                                }

                                this.setCss('background-position', thisState, undefined, undefined, stateInfo);
                            }
                        }
                    }

                    /*
                     * Remove sprite info attribute
                     */
                    element.removeAttribute('data-sprite-info');

                    break;
            }
        });

        $(tag).bind('onStateChange', function(e) {
            this.onDesign();
        });

        $(tag).bind('onStyleReset', function() {
            // don't forget to remove any previously configured state images
            // fixes #WAK0082745
            this.getAttribute('data-image-state1').setValue('');
            this.getAttribute('data-image-state2').setValue('');
            this.getAttribute('data-image-state3').setValue('');
            this.getAttribute('data-image-state4').setValue('');
            this.onDesign(true);
            this.domUpdate();
        });
        
        $(tag).bind('onWidgetCopy', function(e, originalElement, copyParams) {
            if (originalElement.getAttribute('data-label')) {
                this.setLabel(originalElement.getAttribute('data-label').getValue());
            }

            // center label + icon inside buttonImage if needed
            if (this.getParent().isButtonImage()) {
                this.getParent()._centerContent();
            }
        });

        /**
         * Update the sprite info attribute
         * @method _updateSpriteInfo
         * @param {string} state
         * @param {string} left
         * @param {string} top
         */
        tag._updateSpriteInfo = function(left, top) {
            var
            i,
            json,
            attr,
            state,
            jsonObj,
            attrValue,
            listStates;

            state = getTagStateLabel(this);
            attr = this.getAttribute('data-sprite-info');
            attrValue = attr.getValue();
            listStates = [];


            if (attrValue) {
                jsonObj = JSON.parse(attrValue.replace(/\'/g, '"'))[0];
            } else {
                jsonObj = {};
            }

            jsonObj[state] = "-" + left + " -" + top;

            for (i in jsonObj) {
                listStates.push("'" + i + "' : '" + jsonObj[i] + "'");
            }

            json = "{"
            + listStates.join(',')
            + "}";


            attr.setValue("[" + json + "]");
        }

        /**
         * Get the path of the icon
         * @function getPath
         * @return {string}
         */
        tag.getPath = function icon_get_path() {
            return this.getAttribute('data-image-state1').getValue();
        }

        /*
         * Show default icon on create
         */
        tag._showIcon('state1');

        /**
         * Destroy related data if parent is a menuItem
         */
        $(tag).bind('onWidgetDestroy', function() {
            var parent = this.getParent();
            if (parent.isMenuItem()) {
                parent.setAttribute('data-icon', '');
                parent.domUpdate();
            }
        });
    }
});

/**
 * Display icon image path attribute depending on widget state
 * @method iconImageStateAttribute
 * @param {string} state
 */
function iconImageStateAttribute(state) {
    return {
        tabCategory: 'Image',
        tab: 'style',
        //category    : 'Image',
        name: 'data-image-' + state,
        description: 'Src',
        type: 'file',
        accept: 'image/*',
        state: state,
        onchange: function() {
            /*
             * Refresh panels on path change
             */
            D.tag.refreshPanels();

            /*
             * Remove background image
             */
            this.data.tag.getHtmlObject().css('background-image', 'none');
        },
        ready: function() {
            var
            tag,
            data,
            currentState;

            data = this.data;
            tag = data.tag;
            currentState = getTagStateLabel(tag);

            if (currentState != state || (tag.getAttribute('data-icon-type').getValue() == 'sprite' && currentState != "state1")) {
                this.htmlObject.parent().parent().hide();
            }
        }
    }
}

function getTagStateLabel(tag) {
    var
    currentState;

    currentState = tag.getCurrentState() || {};
    currentState = currentState.cssClass || 'waf-state-state1';
    currentState = currentState.replace('waf-state-', '');

    return currentState;
}

/**
 * Create size and position inputs
 * @method createSpriteManagerInput
 * @param {object} tag
 * @param {object} spriteSelector
 * @param {string} prop
 * @param {object} render
 */
function createSpriteManagerInput(tag, spriteSelector, prop, render) {
    var
    propLabel = prop;

    prop = prop.toLowerCase();

    /*
     * Size inputs
     */
    new Designer.lib.form.TextField({
        id: 'waf-sprite-input-' + prop,
        label: propLabel + ':',
        value: parseInt(spriteSelector.css(prop)),
        style: {
            'width': '40px',
            'margin-right': '10px',
            'float': 'none'
        },
        ready: function() {
            this.htmlObject.parent().find('label').css({
                'display': 'inline-block',
                'width': '40px',
                'text-align': 'right',
                'margin-right': '10px'
            })
        },
        onchange: function() {
            var
            i,
            value,
            selectionCount;

            value = this.getValue();
            spriteSelector.css(prop, value + 'px');


            this.updateTag = function(tagElt, value, prop) {
                if (prop == 'width') {
                    tagElt.setWidth(value);
                }

                if (prop == 'height') {
                    tagElt.setHeight(value);
                }

                if (prop == 'left' || prop == 'top') {
                    tagElt._updateSpriteInfo(spriteSelector.css('left'), spriteSelector.css('top'));
                    tagElt.onDesign();
                }

                tagElt.domUpdate();
            }

            selectionCount = Designer.env.tag.selection.count();
            if (selectionCount > 1) {
                for (i = 0; i < selectionCount; i += 1) {
                    this.updateTag(Designer.env.tag.selection.get(i), value, prop);
                }
            } else {
                this.updateTag(tag, value, prop);
            }
        }
    }).render(render);
}
