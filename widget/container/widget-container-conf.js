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
    packageName: 'Widget/container',
    type: 'container',
    lib: 'WAF',
    description: 'Container',
    category: 'Containers/Placeholders',
    img: '/walib/WAF/widget/container/icons/widget-container.png',
    tag: 'div',
    attributes: [
        {
            name: 'class',
            description: 'Css class'
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
        },
        {
            name: 'data-scrollable',
            description: 'Scrollable',
            type: 'checkbox',
            platform: 'mobile'
        },
        {
            name: 'data-hideSplitter',
            description: 'Hide splitters',
            type: 'checkbox',
            category: 'Splitter Options',
            ready: function() { // Check if widget is splitted to display this category
                var
                tag;

                tag = this.data.tag;

                if (!tag._containers) {
                    this.formPanel.getHtmlObject().hide();
                }
            }
        },
        {
            name: 'data-popup-display-button',
            description: 'Left splitter button',
            category: 'Splitter Options'
        },
        {
            name: 'data-label',
            description: 'Label',
            defaultValue: ''
        },
        {
            name: 'is-container',
            type: 'boolean',
            defaultValue: true,
            visibility: 'hidden',
        },        
        {
            name: 'data-label-position',
            description: 'Label position',
            defaultValue: 'top'
        },
        {
            name: 'data-label-valign',
            description: 'Label position',
            defaultValue: 'top',
            visibility: 'hidden'
        }],
    style: [
        {
            name: 'width',
            defaultValue: '294px'
        },
        {
            name: 'height',
            defaultValue: '211px'
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
         }*/],
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
            dropShadow: true,
            innerShadow: true,
            label: false,
            disabled: []
        }
    },
    onInit: function(config) {
        return new WAF.widget.Container(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        //console.log("design")
        var
        i,
        child,
        parent,
        children,
        childrenL,
        htmlObject,
        containerSplitClass;

        containerSplitClass = 'waf-split-container';

        htmlObject = tag.getHtmlObject();
        children = tag.getChildren();
        childrenL = children.length;

        /*
         * Also resize splitted containers
         */
        if (isResize && tag._containers) {
            tag.resizeSplitted();
        }

        if (isResize && children.length > 0) {
            for (i = 0; i < childrenL; i += 1) {
                child = children[i];

                if (child && !child.isDeleted()) {
                    if (child.getType() == 'matrix' && ((child._isFitToRight && child._isFitToLeft) || (child._isFitToTop && child._isFitToBottom))) {
                        child.rebuild();
                    }
                    
                    if (child.getType() == 'accordion' && ((child._isFitToRight && child._isFitToLeft) || (child._isFitToTop && child._isFitToBottom))) {
                        child.resize(true);
                    }
                    D.ui.focus.setPosition(child);
                    D.ui.focus.setSize(child);
                }
            }
        }

        parent = tag.getParent()

        /*
         * If container is inside a tabview
         */
        if (isResize) {
            if (parent && parent.getType() == 'tabView') {
            }
        }

        /*
         * adding states to containers inside a matrix
         */
        if (parent && parent.getType() === 'matrix') {
            tag._states = [{
                    label: 'selected',
                    cssClass: 'waf-state-selected'
                }]

        } else {
            tag._states = null;
        }
    },
    onCreate: function(tag, param) {
        var
        nb,
        containerSplitClass,
        htmlObject,
        parent;

        containerSplitClass = 'waf-split-container';

        htmlObject = tag.getHtmlObject();


        /*
         * Get the first parent container of the splitted container
         */
        tag.getFirstParent = function() {
            var
            parent;

            parent = this.getParent();

            if (parent && parent.isContainer()) {
                if (parent._isSplit) {
                    parent = parent.getFirstParent();
                }
            } else {
                parent = this;
            }

            return parent;
        }

        /*
         * Split the container into many other containers
         */
        tag.split = function container_split(params) {
            var
            tagWidth,
            tagHeight,
            container,
            containers,
            nb,
            type,
            containerHtml,
            containerX,
            containerY,
            containersWidth,
            containersWidth2,
            containersHeight,
            containersHeight2,
            i,
            that,
            htmlObject,
            firstParent,
            children,
            childrenLength,
            existingClasses;

            params = params || {};
            nb = params.nb || 2;
            type = params.type || 'vertically';
            htmlObject = this.getHtmlObject();
            that = this;
            tagWidth = htmlObject.innerWidth();
            tagHeight = htmlObject.innerHeight();
            containers = [];

            switch (type) {
                case 'horizontally':
                    containersWidth = tagWidth;
                    containersWidth2 = tagWidth;
                    containersHeight = params.position || Math.round(tagHeight / nb);
                    containersHeight2 = tagHeight - containersHeight;
                    break;

                case 'vertically':
                    containersWidth = params.position || Math.round(tagWidth / nb);
                    containersWidth2 = tagWidth - containersWidth;
                    containersHeight = tagHeight;
                    containersHeight2 = tagHeight;
                    break;
            }

            containerX = 0;
            containerY = 0;

            children = that.getChildren();
            childrenLength = children.length;

            /*
             * Create many containers as indicated by nb
             */
            for (i = 0; i < nb; i += 1) {

                container = new Designer.tag.Tag(Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('container')));
                container._isSplit = true;
                container.create();

                container.addClass(containerSplitClass);

                container.setXY(containerX, containerY, true);

                container.setWidth(containersWidth);
                container.setHeight(containersHeight);

                if (i == 0) {
                    container.setWidth(containersWidth);
                    container.setHeight(containersHeight);
                } else {
                    container.setWidth(containersWidth2);
                    container.setHeight(containersHeight2);
                }


                container.setParent(that);

                containerHtml = container.getHtmlObject();

                containerHtml.addClass(containerSplitClass);

                switch (type) {
                    case 'horizontally':
                        containerY += containersHeight;
                        break;

                    case 'vertically':
                        containerX += containersWidth;
                        break;
                }

                containers.push(container);

                /*
                 * Lock d&d on splitted containers
                 */
                container.fix();
            }

            firstParent = that.getFirstParent();

            that._containers = containers;

            that.addSplitter(type);


            /*
             * Append children into first splitted container
             */
            if (children && childrenLength > 0) {
                /*
                 * Constraint for right/bottom position
                 */
                Designer.tag.createPositionConstraintList(children);
                Designer.tag.cleanPositionConstraints();
                for (i = 0; i < childrenLength; i += 1) {
                    if (children[i].status != 'destroy') {
                        children[i].setParent(containers[0]);
                    }
                }
                /*
                 * restore constaints
                 */
                Designer.tag.restorePositionConstraints();

            }

            firstParent.setCurrent();
            D.tag.refreshPanels();
        }

        tag.addSplitter = function container_add_splitter(type) {
            var
            that,
            htmlObject,
            tagHtmlObject,
            splitterLeft,
            splitterHeight,
            splitterWidth,
            splitterTop,
            config,
            splitterCss,
            children,
            childrenLength,
            refreshFocus,
            matrix,
            matrixHtml,
            inMatrix;

            that = this;
            tagHtmlObject = that.getHtmlObject();
            children = that._containers;
            htmlObject = $("<div>");
            childrenLength = children ? children.length : 0;
            config = {
                containment: 'parent'
            };

            splitterCss = {};

            matrixHtml = tagHtmlObject.parents('.waf-matrix');
            inMatrix = false;
            /*
             * Check if the tag is in a matrix
             */
            if (matrixHtml.length > 0) {
                inMatrix = true;
                matrix = D.tag.getTagById(matrixHtml.prop('id'));
            }


            refreshFocus = function() {
                var
                j,
                currentTag,
                selection,
                selectionCount;

                selection = Designer.getSelection();
                selectionCount = selection.count();
                currentTag = D.getCurrent();

                if (selectionCount > 0) {
                    for (j = 0; j < selection.count(); j += 1) {
                        currentTag = selection.get(j);
                        Designer.ui.focus.setPosition(currentTag);
                        Designer.ui.focus.setSize(currentTag);
                    }
                } else if (currentTag) {
                    Designer.ui.focus.setPosition(currentTag);
                    Designer.ui.focus.setSize(currentTag);
                }

            }


            switch (type) {
                case 'horizontally':
                    splitterLeft = 0;
                    splitterHeight = 5;
                    splitterWidth = tagHtmlObject.width();
                    splitterTop = children[0].getHeight() - (splitterHeight / 2);//(containersHeight - (splitterHeight/2));

                    $.extend(config, {
                        axis: 'y',
                        /*
                         * Resize containers on dragging
                         */
                        drag: function(e, ui) {
                            var
                            i,
                            child,
                            containersLength;

                            containersLength = childrenLength;

                            for (i = 0; i < containersLength; i += 1) {
                                child = children[i];

                                if (i === 0) {
                                    child.setHeight(ui.position.top + (splitterHeight / 2));
                                } else {
                                    child.setY(ui.position.top + (splitterHeight / 2), true);
                                    child.setHeight(((parseInt(that.getHtmlObject().css('height')) + 1) - ui.position.top) - (splitterHeight / 2));
                                }

                                child.domUpdate();

                                refreshFocus();
                            }
                        }
                    });

                    splitterCss['border-top'] = splitterCss['border-bottom'] = '1px solid #AEAEAE';

                    break;

                case 'vertically':
                    splitterTop = 0;
                    splitterWidth = 5;
                    splitterHeight = tagHtmlObject.height();
                    splitterLeft = children[0].getWidth() - (splitterWidth / 2);//(containersWidth - (splitterWidth/2));

                    $.extend(config, {
                        axis: 'x',
                        stop: function() {
                            D.env.resizeSplit = false;
                        },
                        /*
                         * Resize containers on dragging
                         */
                        drag: function(e, ui) {
                            var
                            i,
                            child,
                            containersLength;

                            containersLength = childrenLength;

                            for (i = 0; i < containersLength; i += 1) {
                                child = children[i];
                                if (i === 0) {
                                    child.setWidth(ui.position.left + (splitterWidth / 2));
                                } else {
                                    child.setX(ui.position.left + (splitterWidth / 2), true);
                                    child.setWidth(((parseInt(that.getHtmlObject().css('width')) + 1) - ui.position.left) - (splitterWidth / 2));
                                }

                                child.domUpdate();

                                refreshFocus();
                            }
                        }
                    });

                    splitterCss['border-left'] = splitterCss['border-right'] = '1px solid #AEAEAE';

                    break;
            }

            config.start = function(e, ui) {
                var
                i,
                size,
                containersLength;

                containersLength = childrenLength;
                size = [];

                for (i = 0; i < containersLength; i += 1) {
                    if (type == 'vertically') {
                        size.push(children[i].getWidth());
                    } else {
                        size.push(children[i].getHeight());
                    }
                }
                this.oldValue = size;
            }

            config.stop = function(e, ui) {
                var
                i,
                size,
                containersLength;

                Designer.beginUserAction('061');

                containersLength = childrenLength;
                size = [];

                for (i = 0; i < containersLength; i += 1) {
                    children[i].domUpdate();

                    if (type == 'vertically') {
                        size.push(children[i].getWidth());
                    } else {
                        size.push(children[i].getHeight());
                    }
                }

                if (inMatrix) {
                    matrix.rebuild();
                }

                // history
                var action = new Designer.action.SplitContainer({
                    val: '0',
                    oldVal: '1',
                    tagId: that.id,
                    tagHtmlId: that.getId,
                    prop: 'resizeSplit',
                    data: {
                        splitType: type,
                        currentTag: D.getCurrent(),
                        newValue: size,
                        oldValue: this.oldValue
                    }
                });

                Designer.getHistory().add(action);
            }

            $.extend(splitterCss, {
                'width': splitterWidth + 'px',
                'height': splitterHeight + 'px',
                'left': splitterLeft + 'px',
                'top': splitterTop + 'px',
                'cursor': type == 'horizontally' ? 'row-resize' : 'col-resize',
                'z-index': 100
            });

            /*
             * Add splitter
             */
            htmlObject
            .addClass('waf-splitter')
            .bind('mousedown', {}, function(e) {

                /*
                 * Lock tag when splitter is dragging
                 */
                that.lock();
            })
            .bind('mouseup', {}, function(e) {
                /*
                 * Unlock tag when splitter is dragging
                 */
                that.unlock();
            })
            .css(splitterCss)
            .draggable(config)
            .appendTo(that.getHtmlObject());

            if (inMatrix) {
                matrix.rebuild();
            }

            return tagHtmlObject;
        }

        tag.getSplitter = function container_get_splitter() {
            var
            that,
            htmlObject,
            splitter,
            result;

            that = this;
            htmlObject = that.getHtmlObject();
            splitter = htmlObject.children('.waf-splitter');

            if (splitter.length === 0) {
                result = null;
            } else {
                result = splitter;
            }

            return result;
        }

        tag.getSplitOrientation = function container_get_split_orientation() {
            var
            i,
            that,
            containersLength,
            container,
            containers,
            splitType;

            that = this;
            containers = that._containers;

            if (containers) {
                containersLength = containers.length;


                if (containers && containersLength > 0) {
                    for (i = 0; i < containersLength; i += 1) {
                        container = containers[i];
                        if (container.getX() === 0) {
                            splitType = "horizontally";
                        } else {
                            splitType = "vertically";
                        }
                    }
                }
            }

            return splitType;
        }

        tag.resizeSplitted = function container_resize_splitted() {
            var
            i,
            that,
            htmlObject,
            thatWidth,
            thatHeight,
            containers,
            containersLength,
            container,
            containerX,
            containerY,
            splitType,
            splitter;

            that = this;
            htmlObject = that.getHtmlObject();
            thatWidth = parseInt(htmlObject.css('width'));//that.getWidth();
            thatHeight = parseInt(htmlObject.css('height'));//that.getHeight();
            containers = that.getChildren();

            containersLength = containers.length;

            splitType = that.getSplitOrientation();
            splitter = that.getSplitter();

            /*
             * Resize splitter
             */
            if (splitter) {
                switch (splitType) {
                    case 'horizontally':
                        splitter.css('width', thatWidth + 'px');
                        break;

                    case 'vertically':
                        splitter.css('height', thatHeight + 'px');
                        break;
                }
            }

            /*
             * Resize containers
             */
            if (containers && containersLength > 0) {
                for (i = 0; i < containersLength; i += 1) {
                    container = containers[i];

                    if (container._isSplit) {
                        containerX = container.getX();
                        containerY = container.getY();


                        switch (splitType) {
                            case 'horizontally':
                                if (containerY != 0) {
                                    container.setHeight(thatHeight - containerY);
                                }

                                container.setWidth(thatWidth);

                                break;

                            case 'vertically':
                                if (containerX != 0) {
                                    container.setWidth((thatWidth - containerX));
                                }
                                container.setHeight(thatHeight);
                                break;
                        }
                    }
                }
            }

            that._containers = containers;
        }

        /*
         * if tag is a splitted container, append splitter to is parent
         */
        if (tag.getAttribute('class').getValue().match(containerSplitClass)) {
            htmlObject.addClass(containerSplitClass);

            parent = tag.getParent();
            tag._isSplit = true;

            if (parent._containers) {
                parent._containers.push(tag);
            } else {
                parent._containers = [tag];
            }

            /*
             * Lock d&d on splitted containers
             */
            tag.fix();

            /*
             * Count the number of child nodes except the undefined nodes
             */
            nb = 0;
            $.each(parent._elementNode.getChildNodes(), function() {
                if (this.tagName) {
                    nb += 1;
                }
            })

            if (!parent.getSplitter() && nb == parent._containers.length) {
                parent.addSplitter(parent.getSplitOrientation());
            }
        }

        /*
         * Widget custom on file drop event
         * Same as body
         */
        $(tag).bind('onFileDrop', $._data(D.doc.tag, 'events').onFileDrop[0].handler);

        /*
         * Widget custom on copy event
         */
        $(tag).bind('onWidgetCopy', function(e, original) {
            var
            i,
            child,
            children,
            containerHtml,
            childrenLength;

            /*
             * Check if original widget is splitted
             */
            if (original._containers) {
                this._containers = [];
                children = this.getChildren();
                childrenLength = children.length;

                for (i = 0; i < childrenLength; i += 1) {
                    child = children[i];
                    child._isSplit = true;
                    containerHtml = child.getHtmlObject();

                    this._containers.push(child);

                    child.fix();
                }

                /*
                 * Display splitter
                 */
                this.addSplitter(original.getSplitOrientation());
            }
        });
    }
});

