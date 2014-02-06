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
    packageName: 'Widget/button',
    type: 'button',
    lib: 'WAF',
    description: 'Button',
    category: 'Form Controls',
    img: '/walib/WAF/widget/button/icons/widget-button.png',
    tag: 'button',
    attributes: [
        {
            name: 'data-binding',
            description: 'Source',
            onchange: function() {
                if (!this.getValue()) {
                    $('#dropdown-data-action').parent().parent().hide();
                } else {
                    $('#dropdown-data-action').parent().parent().show();
                }
            }
        },
        {
            name: 'class',
            description: 'Css class'
        },
        {
            name: 'data-state-1',
            visibility: 'hidden'
        },
        {
            name: 'data-state-2',
            visibility: 'hidden'
        },
        {
            name: 'data-state-3',
            visibility: 'hidden'
        },
        {
            name: 'data-state-4',
            visibility: 'hidden'
        },
        {
            name: 'data-action',
            description: 'Action',
            defaultValue: 'simple',
            type: 'dropdown',
            options: [{
                    key: 'create',
                    value: 'Create'
                }, {
                    key: 'simple',
                    value: 'Simple'
                }, {
                    key: 'save',
                    value: 'Save'
                }, {
                    key: 'next',
                    value: 'Next'
                }, {
                    key: 'previous',
                    value: 'Previous'
                }, {
                    key: 'last',
                    value: 'Last'
                }, {
                    key: 'first',
                    value: 'First'
                }, {
                    key: 'remove',
                    value: 'Remove'
                }],
            ready: function() {
                var
                i,
                tag,
                selection,
                selectionL;


                selection = Designer.env.tag.selection;
                selectionL = selection.count();

                if (selectionL <= 0) {
                    if (!this.data.tag.getSource()) {
                        this.getHtmlObject().parent().parent().hide();
                    }
                } else {
                    if (!D.ui.selection.getAttribute('data-binding').getValue()) {
                        this.getHtmlObject().parent().parent().hide();
                    }
                }
            }
        },
        {
            name: 'data-text',
            description: 'Button title'
        },
        {
            name: 'data-link',
            description: 'URL',
            context: 'protected',
            onchange: function() {
                if (!this.getValue()) {
                    $('#dropdown-data-target').parent().parent().hide();
                } else {
                    $('#dropdown-data-target').parent().parent().show();
                }
            }
        },
        {
            name: 'data-target',
            description: 'Target',
            type: 'dropdown',
            options: ['_blank', '_self'],
            defaultValue: '_blank',
            ready: function() {
                var
                i,
                tag,
                selection,
                selectionL;


                selection = Designer.env.tag.selection;
                selectionL = selection.count();

                if (selectionL <= 0) {
                    if (!this.data.tag.getAttribute('data-link').getValue()) {
                        this.getHtmlObject().parent().parent().hide();
                    }
                } else {
                    if (!D.ui.selection.getAttribute('data-link').getValue()) {
                        this.getHtmlObject().parent().parent().hide();
                    }
                }
            }
        },
        {
            name: 'tabindex',
            description: 'Tabindex'
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
    style: [,
        {
            name: 'width',
            defaultValue: '92px'
        },
        {
            name: 'height',
            defaultValue: function() {
                var result;
                if (typeof Designer !== "undefined") {
                    if (Designer.isMobile) {
                        result = "29px";
                    } else {
                        result = "22px";
                    }
                }

                return result;
            }.call()
        }],
    properties: {
        style: {
            theme: {
                'roundy': false
            },
            fClass: true,
            text: true,
            background: true,
            border: true,
            sizePosition: true,
            shadow: true,
            textShadow: true,
            innerShadow: true,
            label: false
        },
        state: [{
                label: 'hover',
                cssClass: 'waf-state-hover',
                find: '',
                mobile: false
            }, {
                label: 'active',
                cssClass: 'waf-state-active',
                find: '',
                mobile: true
            }, {
                label: 'focus',
                cssClass: 'waf-state-focus',
                find: '',
                mobile: true
            }, {
                label: 'disabled',
                cssClass: 'waf-state-disabled',
                find: '',
                mobile: true
            }]
    },
    onInit: function(config) {
        var button = new WAF.widget.Button(config);
        return button;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var
        tagId,
        nb,
        thisI,
        toinnerHTML,
        textSize,
        url,
        path,
        htmlObject,
        dbClickFn,
        htmlObjectInput,
        imgHTML;

        tagId = tag.getId();
        htmlObject = $('#' + tagId);
        nb = 0;
        thisI = 0;
        textSize = 0;
        toinnerHTML = '';
        url = '';
        path = '';
        imgHTML = '';
        if (!isResize) {
            var text = tag.getAttribute('data-text').getValue();

            if (text.length == 0 && tag.getAttribute('data-action').getValue() == "simple") {
                text = '[' + tagId + ']';
            } else if (text.length == 0 && tag.getAttribute('data-action').getValue() != "simple") {
                text = WAF.utils.ucFirst(tag.getAttribute('data-action').getValue());
            }

            if (tag.getAttribute('data-state-1').getValue() && !tag.getAttribute('data-text').getValue()) {
                text = '';
            }
            toinnerHTML = '<span class="text"></span>';

            if (tag.getAttribute('data-src')) {
                path = Designer.util.formatPath(tag.getAttribute('data-state-' + thisI).getValue());
                url = path.fullPath;
            }

            // Append 4 states
            if (nb === 1) {
                url = Designer.util.formatPath(tag.getAttribute('data-state-' + thisI).getValue()).fullPath;
                imgHTML += '<img src="' + url + '" class="data-state-1 data-state-2 data-state-3 data-state-4" />';
            } else {
                for (var i = 1; i <= 4; i += 1) {
                    if (tag.getAttribute('data-state-' + i) && tag.getAttribute('data-state-' + i).getValue()) {
                        url = Designer.util.formatPath(tag.getAttribute('data-state-' + i).getValue()).fullPath;
                        imgHTML += '<img src="' + url + '" class="data-state-' + i + '" />';
                        nb += 1;
                        thisI = i;
                    }
                }
            }

            htmlObject.html(toinnerHTML + imgHTML);

            // escape text
            $('#' + tagId + ' span').text(text);

            if (tag.style['font-size']) {
                textSize = tag.style['font-size'];
            } else {
                textSize = $('#' + tagId + ' span.text').css('font-size');
            }

            $('#' + tagId + ' .text').css('margin-top', '-' + parseInt(textSize) / 2 + 'px');

            // Dblclick event
            htmlObject.bind('dblclick', {}, dbClickFn = function dbClickFn(e) {
                var
                text;

                Designer.env.editMode = tag;

                tag.setFocus(true);

                /* No text for image or none button theme */
                if ((tag.getTheme() === 'image' || tag.getTheme() === 'none') && !tag.getAttribute('data-text').getValue()) {
                    return;
                }

                text = tag.getAttribute('data-text').getValue();

                if (text.length == 0 && tag.getAttribute('data-action').getValue() == "simple") {
                    text = '[' + tagId + ']';
                } else if (text.length == 0 && tag.getAttribute('data-action').getValue() != "simple") {
                    text = WAF.utils.ucFirst(tag.getAttribute('data-action').getValue());
                }


                // Disable the events key
                Designer.ui.core.disableKeyEvent();
                Designer.event.setListenerMode(false);
                tag.resize.lock(true);
                YAHOO.util.Event.stopEvent(e);
                $(this).prop('disabled', 'disabled');
                // lock d&d
                tag.lock();

                htmlObject.html('<input />' + imgHTML);

                htmlObjectInput = htmlObject.children('input');
                htmlObjectInput.focus();
                htmlObjectInput.val(text);

                // Append inherit css
                htmlObjectInput.css({
                    'width': tag.getWidth() + 'px',
                    'height': tag.getHeight() + 'px',
                    'resize': 'none',
                    'overflow': 'hidden',
                    'background': 'none',
                    'border': 'none',
                    'font-size': 'inherit',
                    'font-style': 'inherit',
                    'font-family': 'inherit',
                    'font-weight': 'inherit',
                    'text-decoration': 'inherit',
                    'text-align': 'inherit',
                    'letter-spacing': 'inherit',
                    'color': tag.getComputedStyle('color'),
                    'margin-top': '-1px',
                    'margin-left': '-1px'
                });

                htmlObjectInput.select();

                htmlObjectInput.bind('keydown', {}, function(e) {
                    if (e.keyCode === 13) {
                        $(this).blur();
                    }
                })

                htmlObjectInput.bind('blur', {}, function(e) {
                    var
                    newValue;

                    newValue = $(this).val();

                    if (D.getCurrent() && D.getCurrent() === tag) {
                        tag.setResizable(true);
                    }

                    htmlObject.bind('dblclick', {}, dbClickFn);

                    // unlock d&d
                    tag.unlock();


                    tag.getAttribute('data-text').setValue(newValue);
                    tag.update();
                    tag.domUpdate();

                    tag.editBox = null;

                    Designer.ui.core.enableKeyEvent();

                    Designer.event.setListenerMode(true);
                    tag.resize.unlock(true);


                    htmlObject.html('<span class="text"></span>' + imgHTML);

                    // escape text
                    $('#' + tagId + ' span').text(newValue);

                    htmlObject.removeProp('disabled');

                    D.tag.refreshPanels();

                    Designer.env.editMode = false;
                });

            });
        }
    }
});
