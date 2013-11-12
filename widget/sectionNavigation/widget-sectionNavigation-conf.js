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
    packageName: 'Widget/sectionNavigation',
    type: 'sectionNavigation',
    lib: 'WAF',
    description: 'Section Navigation',
    category: 'Hidden',
    img: '/walib/WAF/widget/container/icons/widget-container.png',
    tag: 'div',
    attributes: [
        {
            name: 'class',
            description: 'Css class'
        },
        {
            name: 'is-container',
            type: 'boolean',
            defaultValue: true,
            visibility: 'hidden',
        },        
        {
            name: 'data-showImage',
            description: 'Side image',
            defaultValue: 'false',
            type: "checkbox",
            ready: function() {

                var textField = $(this.htmlObject[0]),
                that = this;


                textField.change(function() {
                    var tag = that.data.tag;
                    tag.addImage(this.checked);
                });

            },
            context: ['protected']
        }],
    style: [
        {
            name: 'width',
            defaultValue: '294px'
        },
        {
            name: 'height',
            defaultValue: '40px'
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
        return new WAF.widget.SectionNavigation(config);
    },
    onDesign: function(config, designer, tag, catalog, isResize) {

    },
    onCreate: function(tag, param) {
        var htmlObject = tag.getHtmlObject();
        var imgNode;
        var titleNode;
        tag.addClass('waf-container');


        var getTagGroup = function() {
            if (!tag.groupCreated) {
                tag.groupCreated = 1;
                tag.group = new Designer.ui.group.Group();
                tag.group.add(tag);
            }
            return tag.group;
        }

        var linkTag = function(wid, to, i) {
            //var grp = getTagGroup();
            wid._linkedWidget = tag;

            wid.setParent(to);
            //grp.add(wid);
            to.link(wid);
            to.append(wid, null, null, i);
            //Designer.ui.group.save();
        }

        var appendFn = tag.append;
        tag.append = function(t, x, y) {
            appendFn.call(this, t, x, y);
            var type = t.getAttribute('data-type');
            if (type && type.getValue() == 'image') {
                tag.imgNode = imgNode = t;
            }

            if (type && type.getValue() == 'richText') {
                tag.titleNode = titleNode = t;
            }
        }


        tag.addImage = (function() {
            var imgDef, img;

            var attr = tag.getAttribute("data-image");
            function createImg() {
                Designer.beginUserAction('098');

                var action = new Designer.action.AddImage({
                    val: '0',
                    oldVal: '1',
                    tagId: this.id,
                    data: {
                        widgetId: tag.getId()
                    }
                });

                Designer.getHistory().add(action);


                tag.addAttribute("data-image");
                tag.getAttribute("data-image").setValue("true");


                imgDef = Designer.env.tag.catalog.get(Designer.env.tag.catalog.getDefinitionByType('image'));
                img = new Designer.tag.Tag(imgDef);
                img.addContext('protected');

                img.create({
                    id: D.tag.getNewId("image"),
                    width: 28,
                    height: 28,
                    silentMode: true
                });

                img.setXY(5, 5, true);
                linkTag(img, tag);
                img.addClass('waf-list-image');

                return img;
            }

            return function toggleImg(checked) {
                if (checked) {
                    imgNode = createImg();
                    titleNode.setX(40, true, false);
                    titleNode.domUpdate();
                } else {
                    setTimeout(function() {
                        if (imgNode) {
                            imgNode.remove();
                            titleNode.setX(5, true, false);
                            titleNode.domUpdate();
                        }
                    }, 0);
                }
            }
        })();
    }
});

