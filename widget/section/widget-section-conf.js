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
    packageName: 'Widget/section',
    type: 'section',
    lib: 'WAF',
    description: 'Section',
    category: 'Containers/Placeholders',
    img: '/walib/WAF/widget/section/icons/widget-section.png',
    tag: 'div',
    attributes: [
        {
            name: 'class',
            description: 'Css class'
        },
        {
            name: 'data-label',
            description: 'Label',
            defaultValue: 'Label',
            context: ['allowResizeX']
        },
        {
            name: 'data-label-position',
            description: 'Label position',
            defaultValue: 'top'
        },
        {
            btnId: 'addSectionBtn',
            name: 'data-items',
            description: 'Sections',
            type: 'grid',
            reloadOnChange: true,
            displayEmpty: true, // if false grid is hidden if empty
            newRowEmpty: false,
            columns: [
                {
                    //id : 'testCombo',
                    name: 'type',
                    type: 'dropdown',
                    options: ['Label', 'Switch', 'Input', 'Navigation', 'Blank'/*, 'Select'*/],
                    onchange: function() {
                        var tag = this.data.tag,
                        widID = tag.getId(),
                        action;

                        var index = this.htmlObject.parent().parent().attr('data-position');
                        var newValue = this.htmlObject.val();


                        Designer.beginUserAction('092');

                        action = new Designer.action.sortSectionRow({
                            val: '0',
                            oldVal: '1',
                            tagId: widID,
                            data: {
                                widgetId: widID
                            }
                        });

                        Designer.getHistory().add(action);

                        tag.changeItem(index, newValue);
                    }
                }],
            beforeRowAdd: function() {

            },
            afterRowAdd: function(data) {

                var
                tag = this.getData().tag,
                widID = tag.getId();

                if (data.items && data.items[0] && data.items[0].htmlObject) {
                    data.items[0].htmlObject.val('Label');
                }

                var ind = data.index;
                Designer.beginUserAction('093');


                var action = new Designer.action.AddSectionRow({
                    val: '0',
                    oldVal: '1',
                    tagId: this.id,
                    data: {
                        widgetId: widID,
                        widgetData: data
                    }
                });

                Designer.getHistory().add(action);

                tag.addLabel(ind);

            },
            beforeRowDelete: function(data) {
                var
                tag = this.getData().tag,
                widID = tag.getId(),
                action;

                Designer.beginUserAction('094');

                action = new Designer.action.deleteSectionRow({
                    val: '0',
                    oldVal: '1',
                    tagId: this.id,
                    data: {
                        widgetId: widID
                    }
                });

                Designer.getHistory().add(action);
            },
            afterRowDelete: function(data) {
                var tag = this.getData().tag;
                tag.deleteRow(data.index);

            },
            afterRowSort: function(data) {
                var
                tag = this.getData().tag,
                widID = tag.getId(),
                action;



                Designer.beginUserAction('095');

                action = new Designer.action.sortSectionRow({
                    val: '0',
                    oldVal: '1',
                    tagId: this.id,
                    data: {
                        widgetId: widID,
                        widgetData: data
                    }
                });

                Designer.getHistory().add(action);
                tag = this.data.tag;
                tag.moveRow(data.movedIndex, data.index);

            },
            ready: function() {

                var
                tag = this.getData().tag;

                if (tag._selectedRow === null) {

                } else {
                    window.setTimeout(function() {
                        $('#waform-form-gridmanager-views-grid tr[data-position=' + tag._selectedRow + ']').addClass('waform-state-selected');
                    }, 0);
                }


            }
        }



    ],
    events: [
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
        }],
    style: [
        {
            name: 'width',
            defaultValue: '300px'
        },
        {
            name: 'height',
            defaultValue: '40px'
        }],
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
        return new WAF.widget.Section(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {

    },
    onCreate: function(tag, param) {

        var rowStorage = tag.rowStorage = [];
        var rowHeight = tag.config.rowHeigth || 40;
        var appendFn = tag.append;
        var grpTag = D.getGroup(tag.getGroupId());
        tag.rowHistory = [[]];
        tag.rowHistoryIndex = 0;
        tag.maxHeight = 40;

        tag.append = function(t, x, y) {
            appendFn.call(this, t, x, y);
            var attr = t.getAttribute('data-rowIndex');
            if (attr) {
                var ind = attr.getValue();
                rowStorage[ind] = {
                    rowIndex: ind,
                    item: t
                };

                var typeAttr = t.getAttribute('data-rowType');
                if (typeAttr) {
                    rowStorage[ind].type = typeAttr.getValue();

                    if (typeAttr.getValue() == 'Input') {

                        t.append = (function(fn) {
                            var that = this;

                            return function(tagTmp, xTmp, yTmp) {
                                fn.call(that, tagTmp, xTmp, yTmp);

                                if (tagTmp._type == 'textField') {
                                    that.sectionInput = tagTmp;
                                } else if (tagTmp._type == 'richText') {
                                    that.sectionLabel = tagTmp;
                                }

                                if (that.sectionInput && that.sectionLabel && !that.sectionBinded) {
                                    that.sectionBinded = true;
                                    bindLabelForInput(that.sectionLabel, that.sectionInput);
                                }
                            }

                        }).call(t, t.append);
                    } else if (typeAttr.getValue() != 'Blank') {
                        t.append = (function(fn) {
                            var that = this;

                            return function(tagTmp, xTmp, yTmp) {
                                fn.call(that, tagTmp, xTmp, yTmp);

                                if (tagTmp._type == 'richText') {
                                    that.sectionLabel = tagTmp;
                                }

                                if (that.sectionLabel && !that.sectionBinded) {
                                    var attrTxt = that.sectionLabel.getAttribute('data-text');
                                    attrTxt.onChange(function() {
                                        setLabelConstraint(that.sectionLabel);
                                    });
                                    that.sectionBinded = true;
                                }
                            }

                        }).call(t, t.append);
                    }
                }

                if (t.isAllowed('remove')) {
                    t.afterDestroy = (function(index) {
                        return function() {
                            if (t.avoidAfterDestroy) {
                                return false;
                            }

                            var items = tag.getAttribute('data-items');
                            if (items) {
                                items = items.getValue();
                                var values = items.match(/{.*?}/g);
                                values.splice(index, 1);
                                var str = '[' + values.join(',') + ']';
                                tag.setAttribute('data-items', str);
                                rowStorage[index] = null;
                                tag.sortRow.call(tag);
                                D.tag.refreshPanels();
                                resizeSection();
                            }
                        }
                    })(ind);
                }
            }

        }

        tag.onChangeTheme = function(theme) {
            /*var
             group;
             group = D.getGroup(this.getGroupId());
             
             if (group) {
             group.applyTheme(theme, this);
             }*/
        }

        tag.addHistory = function() {
            this.rowHistory[++this.rowHistoryIndex] = this.rowStorage.slice(0);
        }

        var getTagGroup = function() {
            if (!grpTag) {
                grpTag = tag.group = new Designer.ui.group.Group();
                tag.group.add(tag);
            }
            return grpTag;
        }

        var linkTag = function(wid, to, i) {
            var grp = getTagGroup();
            wid._linkedWidget = tag;

            wid.setParent(to);
            grp.add(wid);
            to.link(wid);
            to.append(wid, null, null, i);
            Designer.ui.group.save();
        }

        var deleteRowStorage = function(index) {
            var myItm = rowStorage[index];
            var tagRow = myItm.item;

            if (tagRow) {
                tagRow.avoidAfterDestroy = true;
                var children = tagRow.getChildren();
                for (var i = 0; i < children.length; i++) {
                    children[i].remove();
                }
                tagRow.remove();
                rowStorage[index] = null;
            }
        }


        var getNewContainer = function(index, context, attr) {
            context = context || 'protected';
            
            var containerDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('container'));
            var group = getTagGroup();

            var width = tag.getComputedStyle('width');
            var newNode = new Designer.tag.Tag(containerDef);

            if (index !== undefined) {
                newNode.addAttribute('data-rowIndex');
                newNode.setAttribute('data-rowIndex', index.toString());
            }

            if (context && context.length) {
                newNode.addContext(context);
            }

            if (attr) {
                for (var p in attr) {
                    newNode.addAttribute(p);
                    newNode.setAttribute(p, attr[p]);
                }
            }

            newNode.create({
                id: D.tag.getNewId("container"),
                width: width,
                height: (rowHeight + 'px'),
                silentMode: true
            });

            newNode.setY(((index * rowHeight) + 'px'), true);
            newNode.setX(0, true, false);

            newNode.onChangeTheme = function(theme) {
                /*var
                 group;
                 group = D.getGroup(tag.getGroupId());
                 
                 if (group) {
                 group.applyTheme(theme, this);
                 }*/
            }

            return newNode;
        }

        var getSectionContainer = function(index, isProtected, attr) {
            var containerDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('sectionNavigation'));
            var newNode = new Designer.tag.Tag(containerDef);

            if (index !== undefined) {
                newNode.addAttribute('data-rowIndex');
                newNode.setAttribute('data-rowIndex', index.toString());
            }

            if (isProtected === true) {
                newNode.addContext('protected');
            }

            if (attr) {
                for (var p in attr) {
                    newNode.addAttribute(p);
                    newNode.setAttribute(p, attr[p]);
                }
            }

            newNode.create({
                id: D.tag.getNewId("container"),
                height: (rowHeight + 'px'),
                silentMode: true
            });

            newNode.setY(((index * rowHeight) + 'px'), true);
            newNode.setX(0, true, false);


            return newNode;
        }

        var setLabelConstraint = function(label) {
            label.setY(0, true);
            label.forceBottomConstraint();
            label.setPositionBottom("0px", true, false);

            label.domUpdate();
        }

        var setRightConstraint = function(itm, pos) {
            itm.forceRightConstraint();
            itm.setPositionRight(pos, true, true);
            itm.domUpdate();
        }

        var resizeSection = function() {
            var borderTop = tag.getComputedStyle('border-top-width');
            var borderBot = tag.getComputedStyle('border-top-width');

            if (borderTop) {
                borderTop = parseInt(borderTop.replace('px', ''));
            } else {
                borderTop = 0;
            }

            if (borderBot) {
                borderBot = parseInt(borderBot.replace('px', ''));
            } else {
                borderBot = 0;
            }

            var borderTotal = borderTop + borderBot;
            
            var height = rowStorage.length * rowHeight + borderTotal;
            if (!tag.isFitToBottom()) {
                tag.setHeight(height);
            }
        }


        var getNewElement = function(type) {
            var def = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType(type));

            var newNode = new Designer.tag.Tag(def);
            newNode.setAttribute('data-label', '');
            newNode.addContext('protected');

            newNode.create({
                id: D.tag.getNewId(type),
                silentMode: true
            });
            return newNode;
        }

        var getNewLabel = function() {
            var newNode = getNewElement('richText');

            newNode.addAttribute('data-inline');
            newNode.setAttribute('data-inline', 'true');
            newNode.domUpdate();
            newNode.onChangeTheme = function() {
                var that = this
                setTimeout(function() {
                    that.onDesign.call(that, false);
                }, 0);
            }

            var attrTxt = newNode.getAttribute('data-text');
            attrTxt.setValue('Label');
            attrTxt.onChange(function() {
                setLabelConstraint(newNode);
            });

            newNode.setX(5, true);
            return newNode;
        }

        var getNewInput = function() {
            var elt = getNewElement('textField');
            elt.addContext('allowBind');
            return elt;
        }

        var getNewSwitch = function() {
            var elt = getNewElement('switchbox');
            elt.addContext('allowBind');
            return elt;
        }

        var getNewSelect = function() {
            return getNewElement('select');
        }

        var bindLabelForInput = function(label, input) {
            label.onChangeTheme = function() {
                var that = this
                setTimeout(function() {
                    that.onDesign.call(that, false);
                    var size = label.getComputedStyle('width').replace('px', '');
                    size = parseInt(size);
                    size += 15;
                    setRightConstraint(input, 6);
                    input.setX(size, true);
                }, 0);
            }

            var attrTxt = label.getAttribute('data-text');
            attrTxt.onChange(function() {
                setTimeout(function() {
                    var size = label.getComputedStyle('width').replace('px', '');
                    size = parseInt(size);
                    size += 15;
                    setRightConstraint(input, 6);
                    input.setX(size, true);
                }, 0);
            });

            var attrIdInput = input.getAttribute('id');
            attrIdInput.onChange(function() {
                if (label.getAttribute('data-labelFor')) {
                    label.setAttribute('data-labelFor', input.getId());
                    label.domUpdate();
                }
            });
        }


        var defaultFn = tag.addLabel = function(index) {
            var myContainer = getSectionContainer(index, true, {'data-rowType': 'Label'});

            var newNode = getNewLabel();

            linkTag(newNode, myContainer);
            linkTag(myContainer, this);

            myContainer.forceRightConstraint();
            myContainer.setPositionRight(0, true, false);

            setLabelConstraint(newNode);

            myContainer.addClass('waf-section-label');
            myContainer.domUpdate();

            this.sortRow();
            resizeSection();
            this.addHistory();
        }


        tag.addInput = function(index) {
            var myContainer = getNewContainer(index, 'protected', {'data-rowType': 'Input'});
            var label = getNewLabel();
            var txt = getNewInput();

            bindLabelForInput(label, txt);

            label.addAttribute('data-labelFor');
            label.setAttribute('data-labelFor', txt.getId());
            label.domUpdate();

            linkTag(myContainer, this, index);
            myContainer.forceRightConstraint();
            myContainer.setPositionRight(0, true, false);
            linkTag(txt, myContainer);
            linkTag(label, myContainer);

            var size = label.getComputedStyle('width').replace('px', '');
            size = parseInt(size);
            size += 15;

            setLabelConstraint(label);

            txt.setX(size, true);
            setRightConstraint(txt, 6);

            myContainer.addClass('waf-section-input');
            myContainer.domUpdate();

            this.sortRow();
            this.addHistory();
        }


        tag.addSwitch = function(index) {
            var myContainer = getSectionContainer(index, true, {'data-rowType': 'Switch'});
            var label = getNewLabel();
            var switchBox = getNewSwitch();

            linkTag(myContainer, this, index);
            myContainer.forceRightConstraint();
            myContainer.setPositionRight("0px", true, false);
            linkTag(switchBox, myContainer);
            linkTag(label, myContainer);


            var w = switchBox.getWidth();
            var h = switchBox.getHeight();

            setLabelConstraint(label);

            switchBox.forceRightConstraint();
            switchBox.setPositionRight(6, true, false);
            switchBox.setY(5, true);
            switchBox.setWidth(w, true);
            switchBox.setHeight(h, true);
            switchBox.domUpdate();
            switchBox.removeLeftConstraint();

            myContainer.addClass('waf-section-switch');
            myContainer.domUpdate();

            this.sortRow();
            this.addHistory();
        }


        tag.addSelect = function(index) {
            var myContainer = getNewContainer(index, 'protected', {'data-rowType': 'Select'});
            var label = getNewLabel();
            var selectBox = getNewSelect();

            linkTag(myContainer, this);
            myContainer.forceRightConstraint();
            myContainer.setPositionRight(0, true, false);
            linkTag(label, myContainer);
            linkTag(selectBox, myContainer);

            bindLabelForInput(label, selectBox);

            var size = label.getComputedStyle('width').replace('px', '');
            size = parseInt(size);
            size += 10;
            selectBox.setX(size, true);

            setLabelConstraint(label);
            setRightConstraint(selectBox, 6);
            //selectBox.setWidth(80, true);
            //selectBox.removeLeftConstraint();

            myContainer.addClass('waf-section-select');
            myContainer.domUpdate();

            this.sortRow();
            this.addHistory();
        }


        tag.addBlank = function(index) {
            var myContainer = getNewContainer(index, 'disableCopyCut', {'data-rowType': 'Blank'});
            linkTag(myContainer, this);

            myContainer.forceRightConstraint();
            myContainer.setPositionRight(0, true, false);
            myContainer.addContext('disallowResize');

            myContainer.addClass('waf-section-blank');
            myContainer.domUpdate();
            this.sortRow();
            this.addHistory();
        }

        tag.addNavigation = function(index) {
            var buttonNav;
            var buttonDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('button'));

            var myContainer = getSectionContainer(index, true, {'data-rowType': 'NavBar'});
            var label = getNewLabel();

            linkTag(myContainer, this);

            myContainer.forceRightConstraint();
            myContainer.setPositionRight(0, true, false);

            myContainer.addClass('waf-section-nav');
            myContainer.domUpdate();

            buttonNav = new Designer.tag.Tag(buttonDef);
            buttonNav.addContext('protected');
            buttonNav.getAttribute("data-text").setValue(" ");
            buttonNav.create({
                id: D.tag.getNewId("button"),
                silentMode: true
            });

            linkTag(buttonNav, myContainer);

            linkTag(label, myContainer);

            setLabelConstraint(label);

            buttonNav.addClass('waf-section-nav-buttonGoTo');

            buttonNav.setY(6, true, false);
            setRightConstraint(buttonNav, 10);
            buttonNav.setWidth(25, true);
            buttonNav.removeLeftConstraint();

            this.sortRow();
            this.addHistory();
        }

        tag.moveRow = function(oldIndex, newIndex) {
            rowStorage.splice(newIndex, 0, rowStorage.splice(oldIndex, 1)[0]);
            this.sortRow();
            this.addHistory();
        }


        tag.sortRow = function() {
            var i, length;
            rowStorage.map(function(itm, index) {
                if (itm === null) {
                    rowStorage.splice(index, 1);
                }
            });

            length = rowStorage.length - 1;
            for (i = 0; i <= length; i++) {
                var top = (i * rowHeight) + 'px';
                rowStorage[i].item.setY(top, true);
                rowStorage[i].item.setAttribute('data-rowIndex', i.toString());
                rowStorage[i].item.removeClass('waf-element-first waf-element-last');
                rowStorage[i].item.domUpdate();
            }

            if (rowStorage.length) {
                rowStorage[0].item.addClass('waf-element-first');
                rowStorage[0].item.domUpdate();

                rowStorage[length].item.addClass('waf-element-last');
                rowStorage[length].item.domUpdate();
            }
            resizeSection();
        }

        tag.deleteRow = function(index) {
            deleteRowStorage(index);
            this.sortRow();
            this.addHistory();
        }

        tag.changeItem = function(index, newType) {
            var myItm = rowStorage[index];
            var tagRow = myItm.item;
            var fnName = 'add' + newType;
            var fn = tag[fnName] ? tag[fnName] : defaultFn;

            if (tagRow) {
                deleteRowStorage(index);
                fn.call(this, index);
            }
        }

        tag.remap = function() {
            var i,
            length,
            strItem,
            listItem = [];
            this.rowStorage = this.rowHistory[this.rowHistoryIndex].slice(0);
            rowStorage = this.rowStorage;
            length = rowStorage.length;
            for (i = 0; i < length; i++) {
                if (!rowStorage[i] || !rowStorage[i].type) {
                    continue;
                }
                listItem.push("{'type':'" + rowStorage[i].type + "'}");
            }

            strItem = '[' + listItem.join(',') + ']';

            this.setAttribute('data-items', strItem);
            this.domUpdate();
            D.tag.refreshPanels();
            this.sortRow();

        }

        tag.build = (function() {
            if (!param._isLoaded) {
                tag.addContext('allowResizeX');
                this.addLabel(0);
                this.remap();
            }

            $(tag).bind('onBorderResize', function() {
                resizeSection();
            });
        }).call(tag);
    }
});

