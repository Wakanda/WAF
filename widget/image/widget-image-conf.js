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
(function() {
    // some consts to make things readable
    // this describes how the image is resized compared to its container
    var FIT_OPTIONS = {
        'TO_CONTAINER': '0',        // fits image to its container
        'TO_CONTAINER_PROP': '4',
        'TO_WIDTH': '1',
        'TO_HEIGHT': '2',
        'TO_IMAGE': '3'
    };
    
    WAF.addWidget({
        packageName: 'Widget/image',
        type: 'image',
        lib: 'WAF',
        description: 'Image',
        category: 'Misc. Controls',
        img: '/walib/WAF/widget/image/icons/widget-image.png',
        attributes: [
            {
                name: 'data-binding',
                description: 'Source',
                context: ["protected"]
            },
            {
                name: 'class',
                description: 'Css class'
            },
            {
                name: 'data-src',
                description: 'Image URL',
                type: 'file',
                accept: 'image/*',
                context: ["protected"]
            },
            {
                name: 'data-link',
                description: 'URL',
                context: ["protected"]
            },
            {
                name: 'data-target',
                description: 'Target',
                type: 'dropdown',
                options: ['_blank', '_self'],
                defaultValue: '_blank'
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
            {
                name: 'data-fit',
                description: 'Fit',
                type: 'dropdown',
                context: ["protected"],
                options: [{
                        key: FIT_OPTIONS.TO_CONTAINER,
                        value: 'to container'
                    }, {
                        key: FIT_OPTIONS.TO_CONTAINER_PROP,
                        value: 'to container (proportionately)'
                    }, {
                        key: FIT_OPTIONS.TO_WIDTH,
                        value: 'to width'
                    }, {
                        key: FIT_OPTIONS.TO_HEIGHT,
                        value: 'to height'
                    }, {
                        key: FIT_OPTIONS.TO_IMAGE,
                        value: 'container to image'
                    }],
                defaultValue: FIT_OPTIONS.TO_CONTAINER
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
                name: 'touchmove',
                description: 'On Touch Move',
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
        style: [
            {
                name: 'width',
                defaultValue: '85px'
            },
            {
                name: 'height',
                defaultValue: '80px'
            }],
        properties: {
            style: {
                theme: false,
                fClass: true,
                text: false,
                background: true,
                border: true,
                sizePosition: true,
                label: true,
                shadow: true,
                disabled: ['border-radius']
            }
        },
        onInit: function(config) {
            var image = new WAF.widget.Image(config);
            return image;
        },
        onDesign: function(config, designer, tag, catalog, isResize) {

            var
            htmlObject,
            canvasId = "canvas" + tag.getId(),
            width = tag.getWidth(),
            height = tag.getHeight(),
            thisWidth = '',
            thisHeight = '',
            path = '',
            url = '',
            img = {},
            myFile = {},
            needToRefreshPanel = true;

            path = Designer.env.project.path;

            if (tag.getAttribute('data-src').getValue()) {
                path = Designer.util.cleanPath(tag.getAttribute('data-src').getValue().replace('/', ''));
                url = path.fullPath;
            }

            if (typeof(studio) != 'undefined' && url) {
                myFile = studio.File(url);
            }

            htmlObject = tag.getHtmlObject();

            // Display binding image
            if (!url || !myFile.exists) {
                $('#' + tag.getId()).html(' <canvas class="' + canvasId + '" width="' + width + 'px" height="' + height + 'px"></canvas>');
                var canvas = $('.' + canvasId)[0];

                var ctx = canvas.getContext("2d");
                ctx.fillStyle = "rgb(200,0,0)";
                ctx.fillRect(0, 0, width / 2, height / 2);
                ctx.fillStyle = "rgba(0, 50, 200, 0.5)";
                ctx.fillRect(width / 2 - width / 6, height / 2 - height / 6, width / 2 + width / 6, height / 2 + height / 6);
            } else {
                // TODO: do not create the image element on each onDesign
                htmlObject.empty();

                img = $('<img src="' + url + '" class="' + canvasId + '" />').appendTo(htmlObject).get(0);

                htmlObject.prop('align', 'left');
                htmlObject.css('padding-top', '0px');

                // Dynamic resizing of the image and his overlay
                switch (tag.getAttribute('data-fit').getValue()) {

                    case FIT_OPTIONS.TO_CONTAINER:
                        // since image should fit container we shouldn't touch the tag's size/position here, fixes #WAK0087195
                        needToRefreshPanel = false;

                        // and simply set image's width/height to 100%
                        $(img).width('100%').height('100%');

                        break;

                    case FIT_OPTIONS.TO_WIDTH:
                        thisWidth = tag.tmpWidth = tag.style.width;
                        $(img).width('100%');
                        tag.setWidth(thisWidth, false);
                        break;

                    case FIT_OPTIONS.TO_HEIGHT:
                        thisHeight = tag.tmpHeight = tag.style.height;
                        $(img).height('100%');
                        tag.setHeight(thisHeight, false);
                        break;

                    case FIT_OPTIONS.TO_IMAGE:
                        thisHeight = parseInt(tag.style.height);
                        thisWidth = parseInt(tag.style.width);

                        tag._tagImg = img;

                        img.onload = function() {
                            if (img.width !== 0) {
                                thisWidth = img.width;
                            }
                            if (img.height !== 0) {
                                thisHeight = img.height;
                            }

                            thisWidth += parseInt(tag.getComputedStyle('borderLeftWidth')) + parseInt(tag.getComputedStyle('borderRightWidth'));
                            thisHeight += parseInt(tag.getComputedStyle('borderTopWidth')) + parseInt(tag.getComputedStyle('borderBottomWidth'));

                            $('#' + tag.getId()).parent().css('height', thisHeight + 'px');

                            tag.setWidth(thisWidth, false);
                            tag.setHeight(thisHeight, false);
                        };

                        break;

                    case FIT_OPTIONS.TO_CONTAINER_PROP:
                        /*
                         * Get the hightest size
                         */
                        thisHeight = parseInt(tag.style.height);
                        thisWidth = parseInt(tag.style.width);

                        img.onload = function() {
                            var
                            imgWidth,
                            alignType,
                            padding,
                            imgHeight;

                            if (img.width !== 0) {
                                imgWidth = img.width;
                            }
                            if (img.height !== 0) {
                                imgHeight = img.height;
                            }

                            if (imgHeight < imgWidth) {
                                $(img).width('100%');
                                alignType = '1';
                                if (img.height > thisHeight) {
                                    alignType = '2';
                                    $(img).height('100%');
                                    $(img).width('auto');
                                }
                            } else {
                                $(img).height('100%');
                                alignType = '2';
                                if (img.width > thisWidth) {
                                    alignType = '1';
                                    $(img).width('100%');
                                    $(img).height('auto');
                                }
                            }

                            imgWidth = img.width;
                            imgHeight = img.height;

                            htmlObject.prop('align', 'center');

                            padding = (alignType === '1') ? (thisHeight - imgHeight) / 2 : 0;

                            htmlObject.css('padding-top', padding + 'px');
                        }

                        break;
                }

                // in case we had to modify the container's size/position,
                // we refresh the panel
                // *and* warn the user we had to do so because of the widget's fit option
                // since onload may be called after execution of this method it's possible
                // formStyle isn't correctly refreshed with the correct position
                if (needToRefreshPanel === true) {
                    Designer.ui.form.Style.refreshPosition();
                }
            }
            tag.tmpSrc = tag.getAttribute('data-src').getValue();
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
})();
