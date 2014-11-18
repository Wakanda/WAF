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
     * @class TODO: give a name to this class (ex: WAF.widget.DataGrid)
     * @extends WAF.Widget
     */
    'Matrix',
    {
    },
    /**
     * @constructor
     * @param {Object} inConfig configuration of the widget
     */

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
        htmlObject,
        scrollSpeed,
        matrix,
        tmpBinding,
        split;

        that                = this;
        htmlObject          = $(this.containerNode);

        /*
         * To prevent bug on preview into webcomponent
         */
        if (this.$domNode.parents('#cms-body').length > 0) {
            return false;
        }

        matrix              = {};

        that.subIDPrefix    = config.id + '-clone-';

        that.containerId    = config.id + '-container';

        that.scrollSpeed    = 500;

        /*
         * {Object} this.params parameters of the matrix
         */
        that.params         = {};

        /*
         * {Array} this.clones array of cloned elements of the matrix
         */
        that.clones         = [];

        /*
         * {String} this.scrolling scroll direction
         */
        that.scrolling      = data.scrolling || '';

        if (that.scrolling === 'vertical') {
            htmlObject.css({
                'overflow-y' : 'auto',
                'overflow-x' : 'hidden'
            });
        } else {
            htmlObject.css({
                'overflow-y' : 'hidden',
                'overflow-x' : 'auto'
            });
        }

        if (data.scrollbar === 'false') {
            htmlObject.css({
                'overflow-y' : 'hidden',
                'overflow-x' : 'hidden'
            });
        }

        /*
         * Add the in_array function for arrays
         * @method in_array
         * @param {string} val value to find
         */
        /*Array.prototype.in_array = function(val) {
            var
            i,
            l;

            for( i = 0, l = this.length; i < l; i++) {
                if(this[i] == val) {
                    return true;
                }
            }
            return false;
        };*/

        /*
         * Get at least one source of the matrix children to associate it to matrix
         */
        tmpBinding = $($('#' + config.id + ' [data-binding]')[0]).attr('data-binding');
        if (tmpBinding && tmpBinding.length > 0) {
            split = tmpBinding.split('.');

            if (split.length > 1) {
                tmpBinding = split[0];
            }

            this.source = sources[tmpBinding];
        }

        that.tmpElt = 0;
        that.tmp = 0;
        that.scrollDirection = null;
    },{
        ready : function () {
            $(WAF).bind('onWAFReady', {
                widget: this
            }, function(e) {
                e.data.widget.create();
            });
        },
        onComponentLoad : function(){
            var that = this;
		
            //this.create();
            setTimeout(function(){
                that._rebuild();
            }, 0);
        },

        _rebuild : function () {
            /*
             * Force matrix rebuild => loadComponent
             */
            if (!this.isCreated) {
                this.create();
            } 
            if (this.source && this.source.ID) {
                this.source.dispatch('onCollectionChange');
            }
		
        },

        /*
         * Resize method called on stop resize
         * @method onResize
         */
        onResize : function matrix_on_resize() {
            if (this.eventData) {
                this.display(this.eventData);
            }
        },

        getPosByRow : function matrix_get_pos_by_row (row) {
            var
            that,
            result;

            that    = this;
            result  = (row * (that.elt[that.typeSize] + that.margin[that.typePos])) + that.margin[that.typePos];

            return result;
        },

        getRowByPos : function matrix_get_row_by_pos (pos) {
            var
            that,
            result,
            totalRow;

            that         = this;
            totalRow    = Math.ceil(that.sourceRef.length/that.limit2);
            result      = Math.floor((totalRow/that.sourceRef.length) * pos);

            if (result < 0 ) {
                result = 0;
            }

            return result;
        },

        getDisplayedRow : function matrix_get_displayed_row () {
            var
            that,
            result,
            scrollPosition;

            that            = this;

            if( WAF.PLATFORM.type !== "desktop" ) {
                scrollPosition  = that.scrolling === 'vertical' ? -($("#mainContainer-"+that.config.id).position().top) : -($("#mainContainer-"+that.config.id).position().left);
            } else {
                scrollPosition  = that.scrolling === 'vertical' ? $('#' + that.config.id).scrollTop() : $('#' + that.config.id).scrollLeft();
            }

            // determine what is the row displayed depending on the scroll bar
            result = Math.floor(scrollPosition / (that.elt[that.typeSize] + (that.margin[that.typePos])));

            return result;
        },

        ucfirst : function ucfirst (str) {
            var
            f;

            f = str.charAt(0).toUpperCase();
            return f + str.substr(1);
        },

        /*
         * Create the matrix
         * @namespace WAF.widget.Matrix
         * @method create
         */
        create  : function matrix_create() {
		
            var
            htmlObject,
            currentSource,
            nbSources,
            widget,
            thisSource,
            aSource,
            otherSources,
            result,
            elt,
            i,
            tmpID,
            child,
            that,
            config,
            params,
            matrixChildren,
            children,
            thisId,
            widgetContainer,
            widgetLabel,
            width,
            height,
            label,
            margin,
            otherSourcesLength,
            containerConfig;

            widget          = {};
            thisSource      = [];
            aSource         = [];
            otherSources    = [];
            result          = {};
            elt             = {};
            i               = 0;
            j               = 0;
            that            = this;
            config          = this.config;
            params          = config;
            htmlObject      = this.$domNode;
            matrixChildren  = htmlObject.children();

            that.tmpSubID   = 0;

            that.ChildrenEvent = function() {};

            that.realDrawEvent = that.realDrawEvent || function(event) {};

            /*
             * Get ondraw event
             */
            var evt;
            if (WAF.events[config.id] && WAF.events[config.id][0] && WAF.events[config.id][0].fn) {
                for (i in WAF.events) {
                    for (j = 0; j < WAF.events[i].length; j += 1) {
                        evt = WAF.events[i][j];
                        if (evt.name == 'ChildrenDraw' && i == that.id) {
                            that.ChildrenEvent =evt.fn;
                        }
                    }
                }
            }

            tmpID = 'waf-tmp-container-' + that.id;

            // Get the matrix children to find a datasource
            matrixChildren.each(function(e) {
                var
                subChild;

                child = $(this);

                if (child.attr('data-type') === 'container') {
                    elt = {
                        id      : child.attr('id'),
                        widget  : WAF.widgets[child.attr('id')],
                        width   : parseInt(child.css('width'), 10),
                        height  : parseInt(child.css('height'), 10),
                        left    : parseInt(child.css('left'), 10),
                        top     : parseInt(child.css('top'), 10),
                        htmlObj : $('#' + child.attr('id')),
                        children: []
                    };

                    //children = $('#' + child.attr('id') + ' [data-binding]');
                    children = $('#' + child.attr('id') + ' .waf-widget');

                    // Get the container children
                    children.each(function(e) {
                        subChild = $(this);

                        /*
                         * Remove draggable and resizable to prevent function duplication
                         */
                        subChild.resizable('destroy');
                        subChild.draggable('destroy');

                        widget = WAF.widgets[subChild.attr('id')];
                        if (subChild.attr('data-binding') && widget.source) {
                            // Get the source of widget
                            thisSource.push(widget.source);
                        }

                        elt.children.push(widget);
                    });

                } else {
                    if (child.attr('data-binding')) {
                        containerConfig = {
                            id          : tmpID,
                            'data-type' : 'container',
                            'data-lib'  : 'WAF'

                        };
                        thisId          = child.attr('id');
                        widgetContainer = new WAF.widget['Container'](containerConfig);
                        width           = child[0].offsetWidth;
                        height          = child[0].offsetHeight;
                        label           = $("[for='" + thisId+ "']");
                        margin          = params['data-margin'] ? parseInt(params['data-margin'], 10) : 10;

                        $('<div />').attr({
                            'id'        : tmpID,
                            'data-type' : 'container'
                        }).css('position', 'absolute').appendTo('#' + config.id).append(child);

                        widgetContainer.config = containerConfig;

                        // Get the source of widget
                        widget = WAF.widgets[child.attr('id')];
                        thisSource.push(widget.source);

                        elt = {
                            id      : containerConfig.id,
                            widget  : widgetContainer,
                            left    : margin,
                            top     : margin,
                            htmlObj : $('#' + containerConfig.id),
                            children: []
                        };

                        elt.children.push(widget);

                        if (label.length > 0) {
                            $('#' + tmpID).append(label);
                            widgetLabel = WAF.widgets[label.attr('id')];
                            elt.children.push(widgetLabel);

                            switch (child.attr('data-label-position')) {
                                case 'top':
                                case 'bottom':
                                    height += parseInt(document.getElementById(label.attr('id')).offsetHeight, 10);
                                    break;

                                case 'left':
                                case 'right':
                                    width += parseInt(document.getElementById(label.attr('id')).offsetWidth, 10);
                                    break;
                            }
                        }

                        $('#' + tmpID).children().each(function(e) {
                            subChild = $(this);
                            subChild.css('left', parseInt(subChild.css('left'), 10) + 'px');
                            subChild.css('top', parseInt(subChild.css('top'), 10) - margin + 'px');
                        });

                        $('#' + tmpID).addClass('waf-widget');

                        elt.width = width;
                        elt.height = height;

                    }
                }
            });

            nbSources = thisSource.length;

            // Get the data source name
            if (nbSources > 0) {
                aSource = thisSource[0];

                if (nbSources > 1) {
                    for (i = 0; i < nbSources; i += 1) {
                        currentSource = thisSource[i];
                        if (currentSource && currentSource._private.sourceType == 'dataClass' && currentSource._private.sourceType == 'relatedEntity') {
                            aSource = currentSource;
                        }

                        if (currentSource._private.sourceType === "scalar") {
                            otherSources.push(currentSource);
                        }
                    }
                }

                params.elt = elt;

                otherSourcesLength = otherSources.length;
                for (i = 0; i < otherSourcesLength; i += 1){
                    otherSources[i].addListener("onCurrentElementChange", function(e) {
                        e.dataSource.dispatch('onCurrentElementChange', {
                            subID : that.tmpSubID,
                            attributeName : e.attributeName
                        }, {});
                    }, {
                        id: config.id
                    });
                }

                if (!that._tmpListeners) {
                    that._tmpListeners = {};
                }

                if (aSource.ID) {
                    that._tmpListeners[aSource.ID] = true;
                }

                if (that._tmpListeners[aSource.ID] && !that.$domNode.parents('waf-component')) {
                    return;
                }

                aSource.addListener("all", function(e) {
                    /*
                     * Do not execute listener function if matrix is disabled
                     */
                    if (e.data.that.isDisabled()) {
                        return;
                    }

                    /*
                     * Do not interact with hidden matrix
                     */
                    if (true /*!e.dispatcherID*/ /* modif par L.R le 27 dec 2012 */) {
                        var
                        pos,
                        element,
                        displayedRow,
                        calcul,
                        row,
                        firstPos,
                        subIDValue,
                        userData,
                        autoSave,
                        goSave = false;

                        pos             = e.dataSource.getPosition();
                        element         = $('#' + config.id + ' [data-dspos="' + pos + '"]');
                        subIDValue      = that.subIDPrefix + $('#' + element.attr('id')).attr('data-area');

                        switch (e.eventKind) {
                            case 'onBeforeCurrentElementChange' :

                                autoSave = htmlObject.data('autosave');

                                if (autoSave === undefined) {
                                    goSave = true;
                                } else if (autoSave === true) {
                                    goSave = true;
                                }

                                // Do not automatically save if it's a slider or if autoSave property is false
                                if (goSave && $('#' + e.dispatcherID).attr('data-type') != 'slider' && e.data.that.clickOnElement) {
                                    e.dataSource.save({
                                        subID : subIDValue
                                    });
                                }

                                e.data.that.clickOnElement = false;
                                break;

                            case 'onAttributeChange' :
                                userData = e.userData || null;
                                e.dataSource.dispatch('onAttributeChange', {
                                    subID : subIDValue,
                                    attributeName : e.attributeName
                                }, userData);
                                break;

                            case 'onCurrentElementChange' :
                                if (!e.data.that.elt) {
                                } else {
                                    displayedRow            = e.data.that.getDisplayedRow();
                                    calcul                  = (displayedRow + e.data.that.limit1) - 1;
                                    row                     = e.data.that.getRowByPos(pos);

                                    e.data.that.selectedDS     = pos;
                                    e.data.that.currentPos     = pos;

                                    // add selected class
                                    $('#' + config.id +" .waf-state-selected").removeClass('waf-state-selected'); // replace div.waf-container by waf-state-selected to fix WAK0087830
                                    element.addClass('waf-matrix-element waf-state-selected');

                                    //that.posMap[pos].removeClass('waf-state-selected');

                                    // Scroll ony if the element is not already displayed
                                    if ( element.length > 0 && row >= displayedRow && row <= calcul) {
                                    // DO NOTHING
                                    } else if (e.data.that.isVisible()){
                                        e.data.that.goTo(pos);
                                    }

                                    userData = e.userData || null;
                                    e.dataSource.dispatch('onCurrentElementChange', {
                                        subID : subIDValue
                                    }, userData);
                                }
                                break;

                            case 'onCollectionChange' :
                                if (e.dataSource.length === 0) {
                                    /*
                                     * Clear the matrix
                                     */
                                    e.data.that.clear();

                                    /*
                                     * Prevent code execution
                                     */
                                    return;
                                }

                                firstPos = e.dataSource.getPosition();
                                e.data.that.selectedDS = firstPos;

                                e.changeDs = true;

                                e.data.that.display(e);

                                // force select on the first element
                                e.dataSource.select(firstPos, {
                                    dispatcherID : config.id
                                });

                                /*
                                 * Unbind scroll events
                                 */
                                htmlObject
                                .unbind('scroll')
                                .unbind('scrollstop');


                                that.refreshOnScroll = function refreshOnScroll (doNotSelectSource) {
                                    var
                                    displayedRow,
                                    i,
                                    j,
                                    orderLength,
                                    num,
                                    pos,
                                    thisRowLength,
                                    firstEltPos,
                                    firstEltIndex,
                                    currentRow,
                                    currentContainer,
                                    thisRow,
                                    order,
                                    firstEltDisplayed,
                                    totalRows,
                                    totalRealRow,
                                    eltPos,
                                    subIDValue,
                                    limit2,
                                    typePos,
                                    sourceRef,
                                    thatHtml,
                                    dataset,
                                    childs,
                                    containerToOrder,
                                    curTransform,
                                    newTop,
                                    newLeft,
                                    current,
                                    csspos,
                                    curElt,
                                    inertiaTimeOut;

                                    thatHtml            = $(this);
                                    displayedRow        = 0;
                                    i                   = 0;
                                    j                   = 0;
                                    orderLength         = 0;
                                    num                 = 0;
                                    pos                 = 0;
                                    thisRowLength       = 0;
                                    firstEltPos         = 0;
                                    firstEltIndex       = 0;
                                    currentRow          = {};
                                    currentContainer    = {};
                                    thisRow             = {};
                                    order               = [];
                                    firstEltDisplayed   = null;
                                    totalRows           = (that.limit1 + that.moreToShow);
                                    totalRealRow        = Math.ceil(that.sourceRef.length/that.limit2);
                                    eltPos              = 0;
                                    sourceRef           = that.sourceRef;
                                    limit2              = that.limit2;
                                    typePos             = that.typePos;

                                    /*
                                     * Fix resize handle moving on scroll
                                     */
                                    if (thatHtml.attr('data-resizable')) {
                                        if (that.scrolling == 'vertical') {
                                            thatHtml.find('.ui-resizable-s,.ui-resizable-se').css('bottom', - thatHtml.scrollTop() + 'px');
                                        } else {
                                            thatHtml.find('.ui-resizable-e,.ui-resizable-se').css('right', - thatHtml.scrollLeft() + 'px');
                                        }
                                    }

                                    /*
                                     * Do not move containers if they are all displayed
                                     */
                                    if (totalRealRow <= totalRows) {
                                        return false;
                                    }

                                    /*
                                     * determine what is the row displayed depending on the scroll bar
                                     */

                                    displayedRow = that.getDisplayedRow();

                                    if (displayedRow !== that.tmp) {

                                        that.nbTmp += 1;

                                        if (that.nbTmp === 1){
                                            that.nbTmp = 0;

                                            firstEltPos = that.getPosByRow(displayedRow);

                                            /*
                                             * To improve live scrolling
                                             */
                                            sourceRef.setDisplayLimits(that.divID, displayedRow*limit2, (displayedRow*limit2 + (totalRows*limit2)) );

                                            /*
                                             * Get the first element that must be displayed depending on the scroll
                                             */
                                            if (WAF.PLATFORM.webkit3dTransform) {
                                                for (i = 0; i < totalRows; i += 1,firstEltIndex +=1) {

                                                    currentRow = that.rowMap[i];

													if (currentRow != null)
													{
														current = new WebKitCSSMatrix(window.getComputedStyle(currentRow[0]).webkitTransform);

														if (typePos === "top") {
															if ( parseInt(current.f, 10) === firstEltPos) {
																firstEltDisplayed = currentRow;
																break;
															}
														} else {
															if ( parseInt(current.e, 10) === firstEltPos) {
																firstEltDisplayed = currentRow;
																break;
															}
														}
													}

                                                }
                                            } else {
                                                for (i = 0; i < totalRows; i += 1,firstEltIndex +=1) {
                                                    currentRow = $('#' + config.id + " [data-pos=" + i + "][data-type!=label]");

                                                    if ( parseInt(currentRow.css(typePos), 10) === firstEltPos) {
                                                        firstEltDisplayed = currentRow;
                                                        break;
                                                    }
                                                }
                                            }


                                            if (firstEltDisplayed === null) {
                                                firstEltIndex = -1;
                                            }

                                            order = [];
                                            /*
                                             * Get next element to order them
                                             */
                                            for (i = firstEltIndex + 1; i < totalRows; i += 1) {
                                                num += 1;
                                                order.push(that.rowMap[i]);
                                            }

                                            /*
                                             * Get previous element to order them
                                             */
                                            for (i = 0; i < firstEltIndex; i += 1) {
                                                order.push(that.rowMap[i]);
                                            }

                                            num = 0;

                                            orderLength = order.length;

                                            /*
                                             * change first element position attribute
                                             */
                                            if (firstEltDisplayed && !firstEltDisplayed.is(':hidden')) {
                                                firstEltDisplayed.attr('data-pos', num);
                                                that.rowMap[num] = firstEltDisplayed;
                                            } else {

                                                orderLength -= 1;

                                                if (order[orderLength] != undefined) {

                                                    order[orderLength].show();

                                                    if (WAF.PLATFORM.webkit3dTransform) {

                                                        var fcurTransform, fnewTop, fnewLeft;

                                                        $.each(order[orderLength], function(index, value) {

                                                            fcurTransform = new WebKitCSSMatrix(window.getComputedStyle(value).webkitTransform);
                                                            if (typePos === "top") {
                                                                fnewLeft = fcurTransform.e;
                                                                value.style.webkitTransform = "translate3d("+fnewLeft+"px,"+firstEltPos+"px,0)";
                                                            } else {
                                                                fnewTop = fcurTransform.f;
                                                                value.style.webkitTransform = "translate3d("+firstEltPos+"px,"+fnewTop+"px,0)";
                                                            }

                                                        });

                                                    } else {
                                                       order[orderLength].css(typePos, firstEltPos + 'px');
                                                    }

                                                    order[orderLength].attr('data-pos', num);
                                                    order[orderLength].attr("data-dspos", displayedRow);

                                                    that.rowMap[num] = order[orderLength];

                                                    thisRowLength = order[orderLength].length;

                                                    for (j = 0; j <= thisRowLength; j += 1){

                                                        currentContainer = $(order[orderLength][j]);

                                                        if (currentContainer.attr('data-type') === 'container') {

                                                            pos = ((displayedRow*limit2) + j);

                                                            currentContainer.show();

                                                            currentContainer.attr("data-dspos", pos);

                                                            that.posMap[i+"-"+j] = currentContainer;

                                                            currentContainer.onDraw = that.ChildrenEvent;
                                                            subIDValue = that.subIDPrefix + currentContainer.attr("data-area");

                                                            var
                                                            widget;

                                                            widget = WAF.widgets[currentContainer.attr('id')];
                                                            if (widget.setSplitPosition) {
                                                                widget.setSplitPosition(WAF.widgets[currentContainer.attr('data-ref')].getSplitPosition());
                                                            }

                                                            $.each(currentContainer.children(), function() {
                                                                var
                                                                thatHtml,
                                                                refHtml,
                                                                currentWidget;

                                                                currentWidget   = WAF.widgets[this.id];
                                                                thatHtml        = $(this);
                                                                refHtml         = $('#' + thatHtml.attr('data-ref'));

                                                                if (currentWidget && currentWidget.kind != 'container') {
                                                                    if (currentWidget.source) {
                                                                        currentWidget.clear(false);
                                                                    }
                                                                }

                                                                if (currentWidget && currentWidget.setSplitPosition) {
                                                                    currentWidget.setSplitPosition(WAF.widgets[thatHtml.attr('data-ref')].getSplitPosition());
                                                                }

                                                                if (thatHtml.attr('data-resizable') && thatHtml.attr('data-resizable') == 'true') {
                                                                    thatHtml.width(refHtml.width());
                                                                    thatHtml.height(refHtml.height());
                                                                }

                                                                if (thatHtml.attr('data-draggable') && thatHtml.attr('data-draggable') == 'true') {
                                                                    thatHtml.css('top', refHtml.css('top'));
                                                                    thatHtml.css('left', refHtml.css('left'));
                                                                }

                                                            });

                                                            if (!doNotSelectSource) {

                                                                if (sourceRef.getPosition() == pos &&  that.currentPos == pos) {
                                                                    sourceRef.dispatch('onCurrentElementChange', {
                                                                        subID : subIDValue
                                                                    });
                                                                }

                                                                that.sourceSelect(sourceRef, pos, subIDValue, currentContainer);

                                                            }

                                                        }
                                                    }
                                                }

                                            }

                                            /*
                                             * Order elements
                                             */

                                            for (i = 0; i < orderLength; i += 1) {
                                                num += 1;

                                                order[i].attr('data-pos', num );

                                                that.rowMap[num] = order[i];

                                                thisRow = (displayedRow+num);

                                                thisRowLength = order[i].length;

                                                eltPos  = that.getPosByRow(thisRow);

                                                if (WAF.PLATFORM.webkit3dTransform) {

                                                    curElt = new WebKitCSSMatrix(window.getComputedStyle(order[i][0]).webkitTransform);

                                                    if (typePos === "top") {
                                                        csspos = parseInt(curElt.f, 10);
                                                    } else {
                                                        csspos = parseInt(curElt.e, 10);
                                                    }
                                                } else {

                                                    csspos = parseInt(order[i].css(typePos), 10);

                                                }

                                                order[i].tabIndex = csspos;

                                                /*
                                                 * Move only those wrongly positioned
                                                 */
                                                if (csspos != eltPos){

                                                    for (j = 0; j <= thisRowLength; j += 1){

                                                        currentContainer = order[i][j];

                                                        if (currentContainer) {
                                                            dataset = currentContainer.dataset || $(currentContainer).data();
                                                        }

                                                        if (currentContainer && dataset.type === 'container') {

                                                            pos = ((thisRow*limit2) + j);

                                                            if (pos >= sourceRef.length) {
                                                                //currentContainer.hide();
                                                                currentContainer.style.display = "none";
                                                            } else {
                                                                //currentContainer.show();
                                                                currentContainer.style.display = "block";
                                                            }

                                                            if (dataset.dspos != pos) {

                                                                dataset.dspos = pos;

                                                                currentContainer.onDraw = that.ChildrenEvent;
                                                                subIDValue = that.subIDPrefix +  dataset.area;

                                                                var
                                                                widget;

                                                                widget = WAF.widgets[currentContainer.id];
                                                                if (widget.setSplitPosition) {
                                                                    widget.setSplitPosition(WAF.widgets[dataset.ref].getSplitPosition());
                                                                }

                                                                childs = currentContainer.children;

                                                                $.each(childs, function() {
                                                                    var
                                                                    thatHtml,
                                                                    refHtml,
                                                                    currentWidget;

                                                                    currentWidget   = WAF.widgets[this.id];
                                                                    thatHtml        = $(this);
                                                                    this.dataset = this.dataset || $(this).data();
                                                                    refHtml         = $('#' + this.dataset.ref)

                                                                    if (currentWidget && currentWidget.kind != 'container') {
                                                                        if (currentWidget.source) {
                                                                            currentWidget.clear(false);
                                                                        }
                                                                    }

                                                                    if (currentWidget && currentWidget.setSplitPosition) {
                                                                        currentWidget.setSplitPosition(WAF.widgets[this.dataset.ref].getSplitPosition());
                                                                    }

                                                                    if (this.dataset.resizable && this.dataset.resizable  == 'true') {
                                                                        thatHtml.width(refHtml.width());
                                                                        thatHtml.height(refHtml.height());
                                                                    }

                                                                    if (this.dataset.draggable && this.dataset.draggable == 'true') {
                                                                        thatHtml.css('top', refHtml.css('top'));
                                                                        thatHtml.css('left', refHtml.css('left'));
                                                                    }
                                                                });

                                                            if (!doNotSelectSource) {
                                                                if (sourceRef.getPosition() == pos &&  that.currentPos == pos) {
                                                                sourceRef.dispatch('onCurrentElementChange', {
                                                                    subID : subIDValue
                                                                });
                                                                } else {

                                                                    that.sourceSelect(sourceRef, pos, subIDValue, currentContainer);
                                                                }
                                                            }
                                                            }
                                                        }

                                                    }

                                                    /*
                                                     * Margin for the first element of the matrix
                                                     */
                                                    if (thisRow >= sourceRef.length || (thisRow*limit2) >= sourceRef.length) {
                                                    // DO NOTHING
                                                    } else {

                                                            containerToOrder = order[i];

                                                            if (WAF.PLATFORM.webkit3dTransform) {

                                                                $.each(containerToOrder, function(index, value) {

                                                                    //curTransform = new WebKitCSSMatrix(window.getComputedStyle(value).webkitTransform);

                                                                    if (typePos === "top") {
                                                                        //curTransform.e;
                                                                        newLeft =  elt.width * (index) +  (that.margin.left * (index+1));
                                                                        value.style.webkitTransform = "translate3d("+newLeft+"px,"+eltPos+"px,0)";
                                                                    } else {
                                                                        //newTop = curTransform.f;
                                                                        newTop = elt.height * (index) +  (that.margin.top * (index+1));
                                                                        value.style.webkitTransform = "translate3d("+eltPos+"px,"+newTop+"px,0)";
                                                                    }

                                                                });
                                                            } else {
                                                                containerToOrder.css(typePos, eltPos + 'px' );
                                                            }

                                                            //containerToOrder.children().blur();
                                                            containerToOrder.tabIndex = pos;
                                                            containerToOrder.find(":focus").blur();


                                                    }

                                                }
                                            }


                                            $('#' + that.matrix.id + ' [data-dspos="' + that.selectedDS + '"][data-type!="checkbox"]').addClass('waf-matrix-element waf-state-selected');
                                            $('#' + that.matrix.id + ' [data-dspos!="' + that.selectedDS + '"][data-type!="checkbox"]').removeClass('waf-state-selected');

                                        /*sourceRef.select(that.selectedDS, {
                                                dispatcherID : config.id
                                            });*/

                                        }

                                        that.tmp = displayedRow;
                                    }

                                    $("#"+that.config.id).removeClass("matrixLoaderMask");
                                }

                                /*
                                 * ADD SCROLL EVENTS
                                 */
                                htmlObject.bind('scroll', function matrix_scroll(e){
                                    that.refreshOnScroll();
                                });

                                /*
                                 * Scrollstop event
                                 */
                                htmlObject.bind('scrollstop', function matrix_scroll_stop(e){
                                    var
                                    sourceRef;

                                    sourceRef = that.sourceRef;

                                    $.each($(this).find('.waf-matrix-element'), function(i){
                                        var
                                        currentContainer,
                                        pos,
                                        subIDValue;

                                        currentContainer = $(this);

                                        subIDValue = that.subIDPrefix + currentContainer.attr("data-area");

                                        pos = currentContainer.attr('data-dspos');

                                        currentContainer.onDraw = that.ChildrenEvent;

                                        that.sourceSelect(sourceRef, pos, subIDValue, currentContainer);

                                        $('#' + that.config.id).removeClass("matrixLoaderMask");

                                    });

                                });

                                /*
                                 * TOUCH EVENTS
                                 */
                                if( WAF.PLATFORM.type !== "desktop" ) {

                                    function testInertia(topStart, cont, direction, $matrix, count) {

                                        var topVal;

                                        if (direction === "vertical") {
                                            topVal = cont.position().top;
                                        } else {
                                            topVal = cont.position().left;
                                        }

                                        if( topVal != topStart || count ) {

                                            $matrix.addClass("matrixLoaderMask");

                                            if( !count ) {
                                                that.refreshOnScroll();
                                            }
                                            count = false;
                                            topStart = topVal;

                                            inertiaTimeOut = window.setTimeout(function() {
                                               testInertia(topStart, cont, direction, $matrix, count);
                                            }, 900);

                                        } else {
                                            clearTimeout(inertiaTimeOut);
                                            //clearInterval(timer);
                                            that.doScroll = false;
                                            that.refreshOnScroll();
                                            $matrix.removeClass("matrixLoaderMask");
                                            $matrix.trigger('scrollstop');

                                        }
                                    }

                                    htmlObject
                                    .unbind('touchmove')
                                    .unbind('touchend')

                                    .bind('touchmove', function(){
                                        that.doScroll = true;
                                        that.refreshOnScroll();
                                    })

                                    .bind('touchend', function() {

                                        if (that.doScroll) {

                                            var
                                            cont        = $("#mainContainer-"+that.config.id),
                                            direction   = that.scrolling,
                                            topStart,
                                            count       = true,
                                            topVal,
                                            timer,
                                            $matrix     = $('#' + that.config.id);

                                            if (direction === "vertical") {
                                                topStart    = cont.position().top;
                                            } else {
                                                topStart    = cont.position().left;
                                            }

                                            inertiaTimeOut = window.setTimeout(function() {
                                               testInertia(topStart, cont, direction, $matrix, count);
                                            },200);

                                            timer = setInterval( function() { //add interval in order to handle inertial scrolling

                                                if (direction === "vertical") {
                                                    topVal = cont.position().top;
                                                } else {
                                                    topVal = cont.position().left;
                                                }

                                                if( topVal != topStart || count ) {

                                                    $matrix.addClass("matrixLoaderMask");

                                                    if( !count ) {
                                                        that.refreshOnScroll();
                                                    }
                                                    count = false;
                                                    topStart = topVal;

                                                } else {

                                                    clearInterval(timer);
                                                    that.doScroll = false;
                                                    that.refreshOnScroll();
                                                    $matrix.removeClass("matrixLoaderMask");
                                                    $matrix.trigger('scrollstop');

                                                }

                                            }, 200);

                                        }
                                    } );
                                }

                                break;
                        }
                    }

                    that.eventData = e;

                    if (that.config['data-draggable'] == 'true') {
                        that.$domNode.draggable('option', 'handle', '.matrix-container');
                    }
                }, {
                    id: config.id
                }, {
                    widget  : result,
                    params  : params,
                    source  : aSource,
                    that    : that
                });
                
                this.isCreated = 1;
            }
        },

        /**
         * Go to indicated position
         * @namespace WAF.widget.Matrix
         * @method goTo
         */
        goTo : function matrix_goto(pos) {
            var
            that,
            htmlObject,
            row,
            scrollPosition,
            scrollConfig;

            /*
             * To prevent scrolling on matrix init
             * + Do not move into the matrix if widget is disabled
             */
            if ((this._currentPos && this._currentPos == pos) || pos == -1 || this.isDisabled()) {
                return;
            }

            this._currentPos = pos;

            that            = this;
            htmlObject      = $(this.containerNode);
            row             = that.getRowByPos(pos-1);
            scrollPosition  = that.getPosByRow(row) - that.margin[that.typePos2];
            scrollConfig    = {};

            scrollConfig    = that.scrolling === 'vertical' ? {
                scrollTop : scrollPosition
            } : {
                scrollLeft : scrollPosition
            };

            //trigger touch end because no native scoll event is fired
            if( WAF.PLATFORM.type !== "desktop" ) {

                if (that.scrolling === 'vertical') {
                    $("#mainContainer-"+that.config.id).get()[0].style.webkitTransform = "translate3d(0px, -"+scrollPosition+"px, 0px)";
                } else {
                    $("#mainContainer-"+that.config.id).get()[0].style.webkitTransform = "translate3d(-"+scrollPosition+"px, 0px, 0px)";
                }

                window.setTimeout(function(){
                    $('#' + that.config.id).trigger('touchmove');
                },0);

            } else {
                htmlObject.animate(scrollConfig, that.scrollSpeed);
            }
        },

        /**
         * Go to first position
         * @namespace WAF.widget.Matrix
         * @method goToFirst
         */
        goToFirst : function matrix_goto_first() {
            var
            that;

            that = this;
            that.goTo(0);
        },

        /**
         * Go to last position
         * @namespace WAF.widget.Matrix
         * @method goToLast
         */
        goToLast : function matrix_goto_last() {
            var
            that;

            that = this;
            that.goTo(that.sourceRef.length);
        },

        /**
         * Go to next
         * @namespace WAF.widget.Matrix
         * @method goNext
         */
        goToNextPage : function matrix_goto_next_page() {
            var
            that,
            htmlObject,
            currentRow,
            currentPos,
            scrollConfig,
            scrollPosition;

            that            = this;
            htmlObject      = $(this.containerNode);
            currentRow      = that.getDisplayedRow();
            currentPos      = that.getPosByRow(currentRow + (that.limit1));
            scrollConfig    = {};
            scrollPosition  = currentPos - 10;

            scrollConfig    = that.scrolling === 'vertical' ? {
                scrollTop : scrollPosition
            } : {
                scrollLeft : scrollPosition
            };

            //trigger touch end because no native scoll event is fired
            if( WAF.PLATFORM.type !== "desktop" ) {
                if (that.scrolling === 'vertical') {
                    $("#mainContainer-"+that.config.id).get()[0].style.webkitTransform = "translate3d(0px, -"+scrollPosition+"px, 0px) scale(1)";
                } else {
                    $("#mainContainer-"+that.config.id).get()[0].style.webkitTransform = "translate3d(-"+scrollPosition+"px, 0px, 0px) scale(1)";
                }

                window.setTimeout(function(){
                    $('#' + that.config.id).trigger('touchmove');
                },0);
            } else {
                htmlObject.animate(scrollConfig, that.scrollSpeed);
            }
        },

        /**
         * Go to previous
         * @namespace WAF.widget.Matrix
         * @method goPrevious
         */
        goToPreviousPage : function matrix_goto_previous_page() {
            var
            that,
            htmlObject,
            currentRow,
            currentPos,
            scrollConfig,
            scrollPosition;

            that            = this;
            htmlObject      = $(this.containerNode);
            currentRow      = that.getDisplayedRow();
            currentPos      = that.getPosByRow(currentRow - that.limit1);
            scrollConfig    = {};
            scrollPosition  = currentPos - 10;

            scrollConfig    = that.scrolling === 'vertical' ? {
                scrollTop : scrollPosition
            } : {
                scrollLeft : scrollPosition
            };

            //trigger touch end because no native scoll event is fired
            if( WAF.PLATFORM.type !== "desktop" ) {
                if (that.scrolling === 'vertical') {
                    $("#mainContainer-"+that.config.id).get()[0].style.webkitTransform = "translate3d(0px, -"+scrollPosition+"px, 0px) scale(1)";
                } else {
                    $("#mainContainer-"+that.config.id).get()[0].style.webkitTransform = "translate3d(-"+scrollPosition+"px, 0px, 0px) scale(1)";
                }

                window.setTimeout(function(){
                    $('#' + that.config.id).trigger('touchmove');
                },0);
            } else {
                htmlObject.animate(scrollConfig, that.scrollSpeed);
            }
        },

        /**
         * Get the total number of pages
         * @namespace WAF.widget.Matrix
         * @method getTotalPages
         */
        getTotalPages : function matrix_get_total_pages() {
            var
            that,
            totalRows,
            result;

            that        = this;
            totalRows   = Math.ceil(that.sourceRef.length/that.limit2);
            result      = Math.ceil(totalRows/that.limit1);

            return result;
        },

        /**
         * Get the current page
         * @namespace WAF.widget.Matrix
         * @method getCurrentPage
         */
        getCurrentPage : function matrix_get_current_page() {
            var
            that,
            totalRows,
            totalPages,
            currentRow,
            result;

            that        = this;
            totalRows   = Math.ceil(that.sourceRef.length/that.limit2);
            totalPages  = that.getTotalPages();
            currentRow  = that.getDisplayedRow();
            result      = (currentRow*totalPages)/totalRows;

            return result;
        },

        /**
         * Clone widgets events
         * @namespace WAF.widget.Matrix
         * @method cloneEvents
         */
        cloneEvents : function matrix_clone_events(id, element) {
            var
            k,
            events;

            events  = WAF.events[id];

            if (events) {
                for (k = 0; k < events.length; k += 1) {

                    element.bind(events[k].name, {
                        k : k
                    }, function (e) {

                        var
                        widget;

                        widget              = $$(this.id);

                        if (widget) {
                            widget._tmpEventsFn = events[e.data.k].fn;

                            widget._tmpEventsFn(e);
                        }
                    });
                }
            }
        },


        /**
         * Display the  matrix
         * @namespace WAF.widget.Matrix
         * @method display
         */
        display : function matrix_display(e) {
            var
            thisConfig,
            cloneConfig,
            childConfig,
            children,
            container,
            childrenHtml,
            dsPos,
            limit1,
            limit2,
            pos1,
            pos2,
            columns,
            rows,
            i,
            j,
            c,
            n,
            tmpID,
            moreToShow,
            params,
            scrolling,
            sourceRef,
            typePos,
            typePos2,
            typeSize,
            typeSize2,
            elt,
            eltHtml,
            containerClone,
            margin,
            matrix,
            oldID,
            childrenConfig,
            allChildren,
            focusOnElement,
            subIDValue,
            oldChild,
            inputElements,
            that,
            htmlObject,
            config,
            idList,
            valHeight,
            totalRow,
            currentRow,
            childrenLength,
            eltChildrenLength,
            numberOfRow;

            that            = this;
            htmlObject      = $('#' + this.id);
            config          = this.config;
            thisConfig      = {};
            cloneConfig     = {};
            childConfig     = {};
            children        = {};
            container       = {};
            childrenHtml    = {};
            dsPos           = 0;
            limit1          = 0;
            limit2          = 0;
            pos1            = 0;
            pos2            = 0;
            columns         = 0;
            rows            = 0;
            moreToShow      = 2;
            params          = e.data.params;
            scrolling       = params['data-scrolling'];
            sourceRef       = e.data.source;
            typePos         = scrolling === 'vertical' ? 'top' : 'left';
            typePos2        = scrolling === 'vertical' ? 'left' : 'top';
            typeSize        = scrolling === 'vertical' ? 'height' : 'width';
            typeSize2       = scrolling === 'vertical' ? 'width' : 'height';
            elt             = params.elt;
            eltHtml         = elt.htmlObj;
            containerClone  = null;
            margin          = {
                left : params['data-margin'] ? parseInt(params['data-margin']) : 10,
                top : params['data-margin'] ? parseInt(params['data-margin']) : 10
            }
            matrix          = {
                id      : params.id,
                margin  : margin,
                width   : parseInt($('#' + params.id).css('width')),
                height  : parseInt($('#' + params.id).css('height'))
            };

            // Calcul how many widgets can be had,
            columns = Math.floor(matrix.width / (elt.width + margin.left));
            rows    = Math.floor(matrix.height / (elt.height + margin.top));

            if (columns === 0) {
                columns = 1;
            }

            if (WAF.PLATFORM.type !== "desktop") {
                rows = rows * 3;
            }

            thisConfig = params.elt.widget.config;

            // Get the widget config
            for (n in thisConfig) {
                cloneConfig[n] = thisConfig[n];
            }

            pos2 = margin.top;
            pos1 = margin.left;

            // First : remove all created clones
            $('#' + thisConfig.id).show();

            that.original = $('#' + matrix.id + " #" + thisConfig.id).addClass('waf-widget-matrix-original');

            //$('#' + matrix.id + " #" + thisConfig.id).appendTo('body');

            if (scrolling === 'vertical') {
                limit1 = rows;
                limit2 = columns;
            } else {
                limit1 = columns;
                limit2 = rows;
            }

            /*
             * Set variables as attribute of the matrix widget
             */
            that.elt            = elt;
            that.typePos        = typePos;
            that.typePos2       = typePos2;
            that.typeSize       = typeSize;
            that.typeSize2      = typeSize2;
            that.margin         = margin;
            that.scrolling      = scrolling;
            that.limit2         = limit2;
            that.limit1         = limit1;
            that.moreToShow     = moreToShow;
            that.sourceRef      = sourceRef;
            that.posMap         = {};
            that.rowMap         = {};

            /*
             * FOR MATRIX RESIZE
             */
            if (that.tmpColumns != columns || that.tmpRows != rows) {
                // DO NOTHING
                if (typeof(that.tmpColumns) != 'undefined') {
                    currentRow  = that.getDisplayedRow();
                    totalRow    = Math.ceil(that.sourceRef.length/that.limit2);

                    /*
                     * To prevent resize bug when on last row
                     */
                    if (currentRow > totalRow) {
                        currentRow = totalRow
                    }

                    dsPos   = currentRow * that.limit2;
                    pos2    = that.getPosByRow(currentRow);

                    if (dsPos >= sourceRef.length) {
                        dsPos = (sourceRef.length-1) - (that.limit2*(that.limit1 + moreToShow));
                    }

                    sourceRef.setDisplayLimits(that.divID, currentRow*that.limit2, (currentRow*that.limit2 + (currentRow*that.limit2)) );
                }

                /*
                 * Remove existing listeners
                 */
                idList = []
                $.each(htmlObject.find('.waf-widget'), function() {
                    idList.push($(this).attr('id'))
                })

                $.each(sourceRef._private.listeners, function() {

                    if (this.id && new RegExp(this.id).test(idList.join(','))) {
                    //sourceRef.removeListener(this)
                    }
                });
            } else if (!e.changeDs){
                eltHtml.hide();
                numberOfRow = that.limit1 + that.moreToShow;
                for (var i = 0; i < numberOfRow; i++) {
                    that.rowMap[i] = $('#' + config.id + " [data-pos=" + i + "][data-type!=label]");
                };
                return;
            }

            that.tmpRows = rows;
            that.tmpColumns = columns;

            htmlObject.children(':not(.waf-widget-matrix-original,.ui-resizable-handle)').remove();

            tmpID = 'waf-temp-container-' + that.id;

            var tmpContainer = $('<div/>').prop('id', tmpID).css({
                'height' : '100%',
                'width' : '100%'
            }).appendTo(htmlObject);

            // Container is used to define the scroll size
            container = $('<div/>').addClass('matrix-container').appendTo(tmpContainer);

            if( WAF.PLATFORM.type !== "desktop" ) {

                var timerON = false,
                    timer,
                    $matrix = $('#' + that.config.id);

                that.doScroll = false;

                container.get()[0].id = "mainContainer-"+matrix.id;
                that.tempContainerId = "waf-temp-container-"+matrix.id;

                setTimeout(function () {

                    scrollObj = new iScroll(tmpID, {
                      onScrollMove: function() {

                        that.doScroll = true;
                        $matrix.addClass("matrixLoaderMask");

                        if (!timerON) {
                            timerON = true;
                            /*timer = window.setInterval(function(){
                                if (that.doScroll) {
                                    that.refreshOnScroll();
                                }
                            },1000);*/
                        }

                      },
                      onScrollEnd: function() {

                        window.setTimeout(function(){
                            that.doScroll = false;
                            timerON = false;
                            //clearInterval(timer);
                        },0);
                        that.refreshOnScroll();
                        $matrix.removeClass("matrixLoaderMask");

                      },
                      onTouchEnd: function() {

                        var elem = $(this.elemToFocus),
                            pos,
                            dspos,
                            matrix,
                            container,
                            edit = null;

                        matrix = that;

                        if (!matrix.doScroll && this.elemToFocus) {
                            if (this.elemToFocus.nodeName === "INPUT" || this.elemToFocus.nodeName === "BUTTON") {
                                edit = this.elemToFocus;
                            }
                        }

                        if (matrix && !matrix.doScroll) {

                            if (elem.hasClass("waf-container")) {
                                container = elem;
                            } else {
                                container = elem.closest(".waf-container");
                            }

                            pos = parseInt(container.attr("data-pos"));
                            dspos = parseInt(container.attr("data-dspos"));
                            matrix.sourceRef.select(dspos);
                        }

                        if (edit != null) {
                            edit.focus();
                        }

                      }
                    });
                }, 100);
            }

            that.totalSize = ((elt[typeSize] + margin[typePos]) * Math.ceil(sourceRef.length/limit2));


            // Fix BUG #WAK0079175
            // Firefox can not display more than a certain number of pixel of height

            valHeight = that.totalSize + margin[typePos2];
            if (valHeight > 17000000 && navigator.userAgent.indexOf('Firefox') !== -1) {
                valHeight = 17000000;
            }

            container.css(typeSize, valHeight + 'px');
            container.css(typeSize2, matrix[typeSize2] - 30 + 'px');

            for (i = 0; i < limit1 + moreToShow; i += 1) { //ligne
                pos1 = margin[typePos2];

                for (j = 0; j < limit2; j += 1) {
                    cloneConfig.id = 'clone-' + thisConfig.id + '-' + i + '-' + j;

                    subIDValue = that.subIDPrefix + i + '-' + j;

                    // if container, also clone children
                    if (elt.widget.kind === 'container' && elt.children && elt.children.length > 0 ) {
                        if (dsPos < sourceRef.length) {
                            /// Clone html element
                            eltHtml.clone().attr('id', cloneConfig.id).appendTo(container);

                            containerClone = $('#' + cloneConfig.id);
                            containerClone.children('.waf-splitter').remove();

                            // Add on draw function on the matrix
                            containerClone.onDraw = that.ChildrenEvent;

                            if (WAF.PLATFORM.webkit3dTransform) {

                                if (scrolling === 'vertical') {
                                    containerClone.css("-webkit-transform", "translate3d("+pos1+"px,"+pos2+"px,0)");
                                } else {
                                    containerClone.css("-webkit-transform", "translate3d("+pos2+"px,"+pos1+"px,0)");
                                }

                            } else {
                                containerClone.css(typePos, pos2 + 'px');
                                containerClone.css(typePos2, pos1 + 'px');
                            }

                            // Add events
                            that.cloneEvents(thisConfig.id, containerClone);

                            containerClone.css({
                                'width'     : elt.width + 'px',
                                'height'    : elt.height + 'px',
                                'position'  : 'absolute'
                            })
                            // Set cloneConfig row/column position
                            .attr({
                                'data-area' : i + '-' + j,
                                'data-pos'  : i,
                                'data-dspos': dsPos,
                                'data-ref'  : thisConfig.id
                            })
                            // Add class
                            .addClass('waf-matrix-element waf-matrix-clone waf-clone-' + elt.id);

                            $.each(containerClone.children(), function(index, value) {

                                if (value.nodeName === "INPUT") {
                                    value.tabIndex = dsPos + 1;
                                }
                                /*if (value.tabIndex != -1) {
                                    if (dsPos > 0) {
                                        value.tabIndex = that.lastTabIndex + dsPos;
                                    } else {
                                        that.lastTabIndex = value.tabIndex;
                                    }
                                }*/
                                //value.tabIndex = dsPos;

                            });

                            that.posMap[i + '-' + j] = containerClone;

                            // Clone widget
                            new WAF.widget[that.ucfirst(elt.widget.kind)](cloneConfig);

                            children = $('#' +  cloneConfig.id + ' [id]');

                            childrenLength = children.length;

                            var
                            width,
                            height;

                            for (c = 0; c < childrenLength; c += 1) {
                                childrenHtml    = $(children[c]);

                                oldID           = childrenHtml.attr('id');
                                oldChild        = $('#' + oldID);

                                width           = oldChild.outerWidth() + 'px';
                                height          = oldChild.outerHeight() + 'px';

                                if (oldChild.attr('data-constraint-right') == 'true' && oldChild.attr('data-constraint-left') == 'true') {
                                    width = 'auto';
                                }

                                if (oldChild.attr('data-constraint-top') == 'true' && oldChild.attr('data-constraint-bottom') == 'true') {
                                    height = 'auto';
                                }
                                // fix clones position
                                var old_css_position = oldChild.css('position');
                                if($.browser.mozilla) // firefox need static positionning to properly return auto
                                    oldChild.css('position', 'static');
                                childrenHtml.css({
                                    'top'       : oldChild.css('top'),
                                    'left'      : oldChild.css('left'),
                                    'right'     : oldChild.css('right'),
                                    'bottom'    : oldChild.css('bottom'),
                                    'position'  : old_css_position,
                                    'width'     : width,
                                    'height'    : height
                                });
                                if($.browser.mozilla) // firefox need static positionning to properly return auto
                                    oldChild.css('position', old_css_position);

                                // add class
                                childrenHtml.addClass('waf-clone-' + oldID);

                                // change id
                                childrenHtml.attr({
                                    'id'        : 'clone-' + oldID + '-' + i + '-' + j,
                                    'data-ref'  : oldID
                                });
                                childrenHtml.addClass('waf-matrix-clone');

                                // Add events
                                that.cloneEvents(oldID, childrenHtml);
                            }

                            eltChildrenLength = elt.children.length;

                            for (c = 0; c < eltChildrenLength; c += 1) {
                                // Get the widget config
                                childConfig = {};
                                childrenConfig = elt.children[c];

                                for (n in elt.children[c].config) {
                                    childConfig[n] = childrenConfig.config[n];
                                }

                                // Clone children element only if there is a DS
                                if (childrenConfig.config && childrenConfig.source && (dsPos <  childrenConfig.source.length)) {
                                    childConfig.subID = subIDValue;
                                }

                                childConfig.id = 'clone-' + childrenConfig.config.id + '-' + i + '-' + j;
                                new WAF.widget[that.ucfirst(childrenConfig.kind)](childConfig);

                                // CASE OF SOURCE IS RELATED
                                if (childrenConfig.source && childrenConfig.source._private.sourceType != 'dataClass' && childrenConfig.source._private.sourceType != 'relatedEntity') {

                                    // Clone children element only if there is a DS
                                    childConfig.id = 'clone-' + childrenConfig.config.id + '-' + i + '-' + j;

                                    childConfig.subID = subIDValue;

                                    new WAF.widget[that.ucfirst(childrenConfig.kind)](childConfig);
                                }

                                /* Add a test if children is a richText AND if it is specified with an autosize property */
                                /* For firefox, force the reflow */
                                if(childrenConfig.kind === 'richText' && WAF.utils.getBoolValue(childrenConfig.config['data-autoWidth'])) {
                                    var oRichText = $('#'+childConfig.id);
                                    if(oRichText.attr('data-constraint-bottom') == "false" || oRichText.attr('data-constraint-top') == "false") {
                                        if(oRichText.attr('data-constraint-bottom') == "false") oRichText.css('bottom', 0).css('bottom', '');
                                        if(oRichText.attr('data-constraint-top') == "false") oRichText.css('top', 0).css('top', '');
                                    }
                                }
                            }

                            // dispatch value to widgets
                            if (sourceRef) {
                                that.sourceSelect(sourceRef, dsPos, subIDValue, containerClone);
                            }

                            //return;
                            inputElements = $('#' + containerClone.attr('id') + ' input[data-binding],#' + containerClone.attr('id') + ' textarea[data-binding]');
                            //inputElements.unbind('blur');
                            inputElements.bind('blur', {}, function(e) {
                                that.focused = null;
                            });

                            var focusFunction = function matrix_children_focus(e) {
                                this.textInputChanged = WAF.widgets[this.id].change;

                                $(this).bind('change', {}, function() {
                                    this.textInputChanged();
                                });

                                focusOnElement(e);

                                that.focused = this;
                            }

                            focusOnElement = function focusOnElement (e) {


                                if (WAF.PLATFORM.type !== "desktop" && that.doScroll) {
                                    return;
                                }

                                var
                                thatElt,
                                source;

                                if (that.focused && $(that.focused).parent().attr('data-dsPos') != $(this).attr('data-dsPos') && that.focused != this ) {
                                    // remove change event for text input
                                    $(that.focused).unbind('change');
                                    that.focused.textInputChanged = WAF.widgets[that.focused.id].change;
                                    that.focused.textInputChanged();
                                    that.focused = null;
                                }

                                thatElt    = e.data.element;
                                source     = e.data.source;

                                that.clickOnElement = true;

                                source.select(parseInt(thatElt.attr('data-dsPos')));
                            }

                            inputElements.unbind('focusin', focusFunction);
                            inputElements.bind('focusin', {
                                source  : sourceRef,
                                element : containerClone
                            }, focusFunction);

                            var selectEvent = (WAF.PLATFORM.type !== "desktop") ? "touchend" : "mousedown";

                            // Add click event on container
                            containerClone.bind(selectEvent, {
                                source  : sourceRef,
                                element : containerClone
                            }, focusOnElement);

                            allChildren = $('#' + containerClone.attr('id') + ' *');

                            // Add click event on all children
                            allChildren.bind(selectEvent, {
                                source  : sourceRef,
                                element : containerClone
                            }, focusOnElement);

                        }
                    }
                    // Increment position
                    pos1 += (elt[typeSize2] + margin[typePos2]);
                    // Increment position of element in the DS
                    dsPos += 1;

                    if (containerClone) {
                        containerClone.addClass("waf-clone-" + elt.id);
                    }
                }

                // Increment position
                pos2 += (elt[typeSize] + margin[typePos]);

            }

            // Do not display the originale element
            $('#' + thisConfig.id).hide();
            //eltHtml.css('left', '-100000px')

            numberOfRow = that.limit1 + that.moreToShow;
            for (var i = 0; i < numberOfRow; i++) {
                that.rowMap[i] = $('#' + config.id + " [data-pos=" + i + "][data-type!=label]");
            };

            // Reset tmp variables
            that.tmp     = 0;
            that.nbTmp   = 0;

            that.matrix = matrix;
            that.matrix.limit1 = limit1;
            that.matrix.limit2 = limit2;
            that.matrix.elt = elt;
        },

        /**
         * select and display
         * @namespace WAF.widget.Matrix
         * @method sourceSelect
         */
        sourceSelect : function matrix_source_select(source, pos, subId, container){
            var
            that;

            that = this;
            pos = parseInt(pos);
            source.select(pos, {
                subID: subId,
                stop: true,
                onSuccess   : function(e) {
                    that.tmpSubID = e.data.subID;
                    /*
                    e.data.htmlObject.onDraw();
                    */
                   var ev = {
                   	source: source,
                   	matrix: that,
                   	pos: pos,
                   	htmlObject: e.data.htmlObject
                   };
                   // fix temporaire en attendant de revoir mieux les matrices
                   if (ev.htmlObject.css == null)
                   	ev.htmlObject = $(ev.htmlObject);

                   // fin du fix temporaire
                   that.realDrawEvent(ev);
                },
                delay   : 10,
                delayID : that.divID
            },{
                htmlObject : container,
                subID      : subId
            });
        },

        /**
         * DEPRECATED
         */
        goToNext : function(){
            return this.goToNextPage()
        },

        /**
         * DEPRECATED
         */
        goToPrevious : function(){
            return this.goToPreviousPage()
        },

        /**
         * Custom getChildren function
         * @method getChildren
         */
        getChildren : function matrix_getChildren() {

            var
            widget,
            children,
            htmlObject;

            htmlObject  = this.$domNode;
            children    = [];

            $.each(htmlObject.find('.matrix-container').children(), function(i) {
                widget = $$($(this).attr('id'));

                if (widget) {
                    children.push(widget);
                }
            });

            return children;
        },

        /**
         * Custom disable function (disable sub widgets)
         * @method disable
         */
        disable : function matrix_disable() {
            var
            i,
            children,
            childrenLength;

            children = this.getChildren();
            childrenLength = children.length;

            /*
             * Disable all sub widgets
             */
            for (i = 0; i < childrenLength; i += 1) {
                children[i].disable();
            }

            /*
             * Call super class enable function
             */
            WAF.Widget.prototype.disable.call(this);

            /*
             * Remove scrollbar
             */
            this.$domNode.css('overflow', 'hidden');

            /*
             * hide resize handle
             */
            this.$domNode.children('.ui-resizable-handle').hide();
        },

        /**
         * Custom enable function (enable sub widgets)
         * @method enable
         */
        enable : function matrix_enable() {
            var
            i,
            children,
            childrenLength;

            children = this.getChildren();
            childrenLength = children.length;

            /*
             * Enable all sub widgets
             */
            for (i = 0; i < childrenLength; i += 1) {
                children[i].enable();
            }

            /*
             * Call super class enable function
             */
            WAF.Widget.prototype.enable.call(this);

            /*
             * Display scrollbar
             */
            if (this.scrolling === 'vertical') {
                this.$domNode.css({
                    'overflow-y' : 'auto',
                    'overflow-x' : 'hidden'
                });
            } else {
                this.$domNode.css({
                    'overflow-y' : 'hidden',
                    'overflow-x' : 'auto'
                });
            }

            /*
             * Display resize handle
             */
            this.$domNode.children('.ui-resizable-handle').show();

        },

        clear : function matrix_clear() {
            this.$domNode.children().hide();
        }

    }
    );

/*
 * ScrollStart & ScrollStop special events
 */
$.event.special.scrollstart = {
    setup: function() {

        var timer,
        handler =  function(evt) {

            var _self = this,
            _args = arguments;

            if (timer) {
                clearTimeout(timer);
            } else {
                evt.type = 'scrollstart';
                $.event.handle.apply(_self, _args);
            }

            timer = setTimeout( function(){
                timer = null;
            }, $.event.special.scrollstop.latency);

        };

        jQuery(this).bind('scroll', handler).data('D' + (+new Date()), handler);

    },
    teardown: function(){
        jQuery(this).unbind( 'scroll', jQuery(this).data('D' + (+new Date())) );
    }
};

$.event.special.scrollstop = {
    latency: 300,
    setup: function() {

        var timer,
        handler = function(evt) {

            var _self = this,
            _args = arguments;

            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout( function(){

                timer = null;
                evt.type = 'scrollstop';
                $.event.handle.apply(_self, _args);

            }, $.event.special.scrollstop.latency);

        };
        jQuery(this).bind('scroll', handler).data('D' + (+new Date() + 1), handler);

    },
    teardown: function() {
        jQuery(this).unbind( 'scroll', jQuery(this).data('D' + (+new Date() + 1)) );
    }
};
