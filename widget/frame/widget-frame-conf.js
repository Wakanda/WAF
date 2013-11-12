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
    packageName: 'Widget/frame',
    type: 'frame',
    lib: 'WAF',
    description: 'Frame',
    category: 'Containers/Placeholders',
    css: [],
    include: [],
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
            defaultValue: 'top'
        },
        {
            name: 'data-src',
            description: 'Source page'
        }
    ],
    style: [
        {
            name: 'width',
            defaultValue: '200px'
        },
        {
            name: 'height',
            defaultValue: '200px'
        }],
    events: [
        {
            name: 'onLoad',
            description: 'On Load',
            category: 'UI Events'
        }
    ],
    properties: {
        style: {
            theme: false,
            fClass: true,
            text: false,
            background: true,
            dropShadow: true,
            border: true,
            sizePosition: true,
            label: true,
            disabled: []
        }
    },
    structure: [],
    onInit: function(config) {
        var widget = new WAF.widget.Frame(config);
        return widget;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var
        div,
        link,
        frame,
        htmlObj;

        htmlObj = tag.getHtmlObject();
        div = $('#' + tag.getId() + '-div');
        frame = $('#' + tag.getId() + '-frame');

        if (frame.length < 1) {
            frame = $('<iframe>');

            frame.attr({
                id: tag.getId() + '-frame',
                src: tag.getAttribute('data-src').getValue(),
                width: '100%',
                height: '100%'
            });

            frame.css({
                top: 0,
                left: 0
            });

            htmlObj.append(frame);
        }

        if (div.length < 1) {
            div = $('<div>');

            div.attr({
                id: tag.getId() + '-div'
            });

            div.css({
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            });

            htmlObj.append(div);
        }

        if (tag.getAttribute('data-src').getValue() != '') {
            htmlObj.attr({
                src: tag.getAttribute('data-src').getValue()
            })
        }
    },
    onCreate: function(tag, param) {
        /*
         * Widget custom on file drop event
         * Set path
         */
        $(tag).bind('onFileDrop', function(e, data) {
            var
            tag;

            tag = this;

            tag.getAttribute('data-src').setValue(data.path.cropedPath);

            /*
             * Set focus
             */
            tag.setCurrent();
            tag.onDesign(true);
            tag.domUpdate();

            D.tag.refreshPanels();
        });
    }

});                                                                                                      