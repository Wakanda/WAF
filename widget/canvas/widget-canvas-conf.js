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
    packageName: 'Widget/canvas',
    type: 'canvas',
    lib: 'WAF',
    description: 'Canvas',
    category: 'Misc. Controls',
    css: [],
    include: [],
    tag: 'canvas',
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
            description: 'Background URL',
            type: 'file',
            accept: 'image/*'
        }
    ],
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
            name: 'mousemove',
            description: 'On Mouse Move',
            category: 'Mouse Events'
        },
        {
            name: 'mouseout',
            description: 'On Mouse Out',
            category: 'Mouse Events'
        },
        {
            name: 'touchmove',
            description: 'On Touch Move',
            category: 'Touch Events'
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
         }*/
    ],
    properties: {
        style: {
            theme: false,
            fClass: true,
            text: false,
            background: true,
            border: true,
            dropShadow: true,
            innerShadow: true,
            sizePosition: true,
            label: true,
            disabled: []
        }
    },
    structure: [],
    onInit: function(config) {
        var widget = new WAF.widget.Canvas(config);
        return widget;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var
        ctx,
        url,
        path,
        width,
        canvas,
        height,
        myFile,
        imgSource;

        imgSource = tag.getAttribute('data-src').getValue();
        myFile = {};
        canvas = tag.getHtmlObject()[0];

        if (!canvas) {
            return;
        }

        width = canvas.width;
        height = canvas.height;
        ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, width, height);

        if (imgSource) {
            path = Designer.util.cleanPath(imgSource.replace('/', ''));
            url = path.fullPath;
        }

        if (typeof(studio) != 'undefined' && url) {
            myFile = studio.File(url);
        }

        if (url && myFile.exists) {
            var img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, width, height);
            };
            img.src = url;
        }

        else {
            ctx.fillStyle = "rgb(200,0,0)";
            ctx.fillRect(0, 0, width / 2, height / 2);
            ctx.fillStyle = "rgba(0, 50, 200, 0.5)";
            ctx.fillRect(width / 2 - width / 6, height / 2 - height / 6, width / 2 + width / 6, height / 2 + height / 6);
        }
    },
    onCreate: function(tag, param) {
        /*
         * Widget custom on file drop event
         * Set path
         */
        $(tag).bind('onFileDrop', function(e, data) {
            var
            tag,
            ext;

            tag = this;
            ext = data.file.extension.toLowerCase();

            switch (ext) {
                case 'png'  :
                case 'jpg'  :
                case 'jpeg' :
                case 'gif'  :
                case 'ico'  :
                    tag.getAttribute('data-src').setValue(data.path.cropedPath);

                    /*
                     * Set focus
                     */
                    tag.setCurrent();
                    tag.onDesign(true);
                    tag.domUpdate();

                    D.tag.refreshPanels();

                    break;
            }
        });
    }
});