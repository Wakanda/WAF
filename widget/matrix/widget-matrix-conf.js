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
    packageName: 'Widget/matrix',
    type: 'matrix',
    lib: 'WAF',
    description: 'Matrix',
    category: 'Containers/Placeholders',
    img: '/walib/WAF/widget/matrix/icons/widget-matrix.png',
    tag: 'div',
    attributes: [
        {
            name: 'class',
            description: 'Css class'
        },
        {
            name: 'data-margin',
            description: 'Margin',
            defaultValue: 10,
            typeValue: 'integer',
            slider: {
                min: 0,
                max: 50
            },
            onchange: function() {
                setTimeout(this.data.tag.rebuild.bind(this.data.tag),0);
            }
        },
        {
            name: 'is-container',
            type: 'boolean',
            defaultValue: true,
            visibility: 'hidden',
        },        
        {
            name: 'data-fit',
            description: 'Auto fit',
            type: 'checkbox',
            defaultValue: 'false',
            onclick: function(argument) {
                if (this.getValue() === true) {
                    this.data.tag.getAttribute('data-fit').setValue('true');
                } else {
                    this.data.tag.getAttribute('data-fit').setValue('false');
                }

                this.data.tag.rebuild();
            }
        },
        {
            name: 'data-scrolling',
            description: 'Scrolling',
            type: 'dropdown',
            options: [{
                    key: 'vertical',
                    value: 'Vertical'
                }, {
                    key: 'horizontal',
                    value: 'Horizontal'
                }],
            defaultValue: 'vertical'
        },
        {
            name: 'data-autosave',
            description: 'Auto save',
            type: 'checkbox',
            defaultValue: 'true'
        },
        {
            name: 'data-scrollbar',
            description: 'Scrollbar',
            type: 'checkbox',
            defaultValue: 'true'
        },
        {
            name: 'data-draggable',
            description: 'Draggable',
            type: 'checkbox',
            platform: 'desktop'
        },
        {
            name: 'data-resizable',
            description: 'Resizable',
            type: 'checkbox',
            platform: 'desktop'
        }],
    style: [
        {
            name: 'width',
            defaultValue: '500px'
        },
        {
            name: 'height',
            defaultValue: '500px'
        }],
    events: [
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
            name: 'onChildrenDraw',
            description: 'On Draw',
            category: 'Matrix Children Events'
        },
        {
            name: 'startResize',
            description: 'On Start Resize',
            category: 'Resize'

        },
        {
            name: 'onResize',
            description: 'On Resize',
            category: 'Resize'

        },
        {
            name: 'stopResize',
            description: 'On Stop Resize',
            category: 'Resize'

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
            border: true,
            sizePosition: true,
            label: false,
            dropShadow: true,
            innerShadow: true,
            disabled: []
        }
    },
    structure: [],
    onInit: function(config) {
        return new WAF.widget.Matrix(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
    },
    onCreate: function(tag, param) {
        /**
         * Clean the matrix content
         * @function clean
         */
        tag.clean = function() {
            var
            child,
            except;

            child = this._childTag;

            if (child) {
                except = '[id!="' + child.getOverlayId() + '"]';

                if (child.getLinkedTag()) {
                    except += '[id!="' + child.getLinkedTag().getOverlayId() + '"]';
                }

                this.getHtmlObject().children(except).remove();

                if (this._childTag) {
                    this._childTag._matrix = null;
                    this._childTag = null;
                }
            }
        };

        /**
         * Rebuild the matrix and create clones
         * @function rebuild
         */
        tag.rebuild = function() {
            if (this._childTag && !this._childTag.isLabel()) {
                var
                i,
                j,
                top,
                left,
                rows,
                child,
                width,
                label,
                height,
                except,
                margin,
                calcul,
                columns,
                autoFit,
                cloneId,
                topLabel,
                matrixId,
                initWidth,
                marginTop,
                leftLabel,
                idToClone,
                marginLeft,
                initHeight,
                overlayHtml,
                matrixWidth,
                resizeWidth,
                matrixHeight,
                initTopLabel,
                resizeHeight,
                initMarginTop,
                initLeftLabel,
                initMarginLeft;

                this.isRebuild = true;

                autoFit = this.getAttribute('data-fit').getValue() === true || this.getAttribute('data-fit').getValue() === 'true' ? true : false;

                child = this._childTag;
                except = '[id!="' + child.getOverlayId() + '"]';
                if (child.getLinkedTag()) {
                    except += '[id!="' + child.getLinkedTag().getOverlayId() + '"]';
                }

                // clean the matrix
                $('#' + this.getId()).children(except).remove();

                // set the element position
                margin = tag.getAttribute('data-margin') ? parseInt(this.getAttribute('data-margin').getValue()) : 0;
                initMarginLeft = margin;
                initMarginTop = margin;
                marginLeft = 0;
                marginTop = 0;
                width = child.getWidth();
                height = child.getHeight();
                left = 0;
                top = 0;
                matrixHeight = tag.getHeight();
                matrixWidth = tag.getWidth();
                rows = 0;
                columns = 0;
                initHeight = 0;
                initWidth = 0;
                cloneId = '';
                topLabel = 0;
                leftLabel = 0;
                initTopLabel = 0;
                initLeftLabel = 0;
                matrixId = tag.getId();
                idToClone = child.getOverlayId();
                resizeWidth = 0;
                resizeHeight = 0;
                marginLeft = initMarginLeft;
                marginTop = initMarginTop;
                label = child.getLabel();


                // Link the tag to the current matrix
                child._matrix = this;

                if (label) {
                    label._matrix = this;

                    switch (child.getAttribute('data-label-position').getValue()) {
                        case 'top':
                            marginTop += label.getHeight();
                            height += label.getHeight();

                            break;

                        case 'right':
                            width += label.getWidth();
                            break;

                        case 'bottom':
                            height += label.getHeight();
                            break;

                        case 'left':
                            marginLeft += label.getWidth();
                            width += label.getWidth();

                            break;
                    }
                }

                child.setXY(marginLeft, marginTop, true);

                initHeight = (parseInt(initMarginTop) + height);
                initWidth = (parseInt(initMarginLeft) + width);

                /*
                 * Calcul number of elements for the height
                 */
                calcul = matrixHeight / initHeight;
                rows = Math.ceil(calcul) - 1;

                if (calcul % 1 === 0) {
                    rows += 1;
                }

                /*
                 * Calcul number of elements for the width
                 */
                calcul = matrixWidth / initWidth;

                if (initWidth !== 0) { // "To infinity and beyond" (but not here)
                    columns = Math.ceil(matrixWidth / initWidth) - 1;
                }

                if (calcul % 1 === 0) {
                    columns += 1;
                }

                /*
                 * Resize the matrix to appropriate size
                 */
                if (autoFit) {
                    if (columns === 0) {
                        columns = 1;
                    }
                    if (rows === 0) {
                        rows = 1;
                    }

                    resizeWidth = (initWidth * columns) + parseInt(initMarginLeft);
                    resizeHeight = (initHeight * rows) + parseInt(initMarginTop);

                    if (this.getAttribute('data-scrollbar').getValue() !== 'false') {
                        if (this.getAttribute('data-scrolling').getValue() === 'vertical') {
                            resizeWidth += 15;
                        } else {
                            resizeHeight += 15;
                        }
                    }

                    resizeWidth += 'px';
                    resizeHeight += 'px';

                    overlayHtml = $('#' + this.getOverlayId());

                    overlayHtml.css('width', resizeWidth);
                    overlayHtml.css('height', resizeHeight);

                    this.setStyle('width', resizeWidth);
                    this.setStyle('height', resizeHeight);

                    this.domUpdate();
                }

                // Add clone class for WYSIWYG
                $('#' + idToClone + ' .waf-widget').each(function(e) {
                    var
                    thisHtml;

                    thisHtml = $(this);

                    thisHtml.addClass('waf-matrix-element waf-clone-' + thisHtml.prop('id'));

                });
                var that = this;

                (function(itm) {
                    var childTmp = itm.getChildren();

                    for (var c = 0; c < childTmp.length; c++) {

                        var prop = {};
                        var currentChild = childTmp[c];
                        var id = currentChild.getId();

                        if (!currentChild.isContainer()) {

                            var reg = new RegExp('#' + id);
                            var rule = Designer.tag.style.getRule(reg);

                            if (rule) {
                                var match = rule.cssText.match(/(([^\s{;]{1}[^{]*?)(?=;(?:\s|})))/g);

                                if (match) {

                                    for (var i = 0; i < match.length; i++) {
                                        var keyValue = match[i].split(':');
                                        var key = keyValue[0];
                                        var val = keyValue[1];
                                        prop[key] = val;
                                    }

                                    var matrixSelector = '#' + that.getId() + ' .waf-widget.waf-clone-' + id;
                                    Designer.tag.style.setProperties(matrixSelector, prop);
                                }
                            }
    
                        }
                        if (currentChild.getChildren()) {
                            arguments.callee(currentChild);
                        }
                    }

                })(this);

                var createClone = function(matrixId, idToClone, cloneId, newTop, newLeft) {

                    var
                    elt,
                    clone;

                    elt = $('#' + idToClone);
                    elt.clone(false, true).prop('id', cloneId).appendTo('#' + matrixId);
                    clone = $('#' + cloneId);

                    clone.unbind('click');
                    clone.unbind('dblclick');
                    clone.unbind('mousedown');
                    clone.unbind('mouseup');

                    clone.ready(function() {
                        var
                        $that,
                        ctx,
                        canvas,
                        width,
                        height,
                        $all;

                        $that = clone;
                        $all = $('#' + cloneId + ' *');

                        // remove useless elements
                        $that.find('.yui-resize-handle').remove();
                        $that.removeClass('waf-focus');

                        $all.addClass('waf-matrix-clone');
                        // for some odd reason, removeProp('id') sets the id to 'undefined'
                        // this causes some errors later so we use removeAttr instead
                        $all.removeAttr('id');
                        $that.css({
                            'top': newTop + 'px',
                            'left': newLeft + 'px',
                            'opacity': '0.5',
                            'outline': 'none'
                        });

                        canvas = clone.find('canvas');

                        if (canvas.length > 0) {
                            width = canvas.width();
                            height = canvas.height();
                            canvas = canvas[0];
                            ctx = canvas.getContext("2d");
                            ctx.fillStyle = "rgb(200,0,0)";
                            ctx.fillRect(0, 0, width / 2, height / 2);
                            ctx.fillStyle = "rgba(0, 50, 200, 0.5)";
                            ctx.fillRect(width / 2 - width / 6, height / 2 - height / 6, width / 2 + width / 6, height / 2 + height / 6);
                        }

                        $all.removeClass("waf-state-selected");

                    });
                };

                if (child.getLabel()) {
                    initTopLabel = child.getLabel().getY();
                    initLeftLabel = child.getLabel().getX();
                }

                for (i = 0; i < rows; i += 1) {
                    cloneId = 'waf_ghost_' + child.getOverlayId() + '_' + i,
                    newTop = (initHeight * i) + marginTop,
                    newLeft = parseInt(left) + marginLeft;

                    topLabel = initTopLabel + (initHeight * i);

                    if (i !== 0) {
                        createClone(matrixId, idToClone, cloneId, newTop, newLeft);

                        if (child.getLabel()) {
                            createClone(matrixId, child.getLabel().getOverlayId(), cloneId + '_' + child.getLabel().getId(), topLabel, initLeftLabel);
                        }
                    }

                    for (j = 1; j < columns; j += 1) {
                        cloneId = 'waf_ghost_' + child.getOverlayId() + '_' + i + '_' + j,
                        newLeft = (initWidth * j) + marginLeft;

                        createClone(matrixId, idToClone, cloneId, newTop, newLeft);

                        if (child.getLabel()) {
                            leftLabel = initLeftLabel + (initWidth * j);
                            createClone(matrixId, child.getLabel().getOverlayId(), cloneId + '_' + child.getLabel().getId(), topLabel, leftLabel);
                        }
                    }
                }
                this.launchOnDesignWhenVisible = true;
                this.isRebuild = false;
            }
        };

        /*
         * Custom on resize event
         */

        $(tag).bind('onResize', function() {
            if (!D.getHistory().isUndoing()) {
                this.rebuild();
            }
        });

    }
});
