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
// TODO: do not reload flash file on widget Move/resize
//
WAF.addWidget({
    packageName:'Widget/video',
    type: 'video',
    lib: 'WAF',
    description: 'Video',
    category: 'Misc. Controls',
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
            defaultValue: 'Label',
            onchange: function(e) {
            }
        },
        {
            name: 'data-label-position',
            description: 'Label position',
            defaultValue: 'top'
        },
        {
            name: 'data-video-start',
            description: 'Start at',
            typeValue: 'integer',
            type: 'textfield',
            slider: {
                min: 0,
                max: 3600
            }
        },
        {
            name: 'data-video-autoplay',
            type: 'checkbox',
            description: 'Autoplay'
        },
        {
            name: 'data-video-loop',
            type: 'checkbox',
            description: 'Loop video'
        },
        {
            name: 'data-video-controls',
            type: 'checkbox',
            description: 'Display controls'
        },
        {
            name: 'data-video-autohide',
            type: 'checkbox',
            description: 'Autohide controls'
        },
        {
            name: 'data-video-urls',
            description: 'Video sources',
            type: 'grid',
            domAttribute: true,
            displayEmpty: true, // if false grid is hidden if empty        
            columns: [
                {
                    name: 'video-url',
                    type: 'textField',
                    constraint: 'custom',
                    required: true,
                    onchange: function(e) {
                        var index = this.htmlObject.parent().parent().data('position'),
                            tag = this.data.tag,                            
                            currentTagValue = JSON.parse(tag.getAttribute('data-video-urls').getValue().replace(/'/g, '"')),
                            doNotAdd = false,
                            newValue = this.getValue(),
                            videoInfo = WAF.widget.Video.prototype._detectSig(this.getValue()),
                            sourceType = '';
                        
                        // get format/sig
                        if (videoInfo === null) {
                            Designer.util.notify("Format Unknown", "Could not detect the format of the video: " + this.getValue() + "<br /><br />List of supported video Types: " + WAF.widget.Video.prototype.getSupportedVideoTypes());
                            return;
                        } else
                            switch (videoInfo.playerType) {
                                case 'html5':
                                    sourceType = videoInfo.sig[0].sourceType;
                                    break;

                                default:
                                    // only html5 format allows multiple files, but only html5 files, user cannot mix html5 + flash videos
                                    // so we prevent add
                                    if (currentTagValue.length > 1) {
                                        doNotAdd = true;
                                    } else {
                                        sourceType = videoInfo.playerType;
                                    }
                                    break;
                            }

                        if (doNotAdd === true) {
                            this.setValue();
                            Designer.util.notify("Format Error", "You cannot mix videoTypes: first video added was of type HTML5, you can only add several HTML5 sources");
                            return;
                        }
                        
                        (function(value, idx, tag, playerType) {
                            setTimeout(function() {
                                var json = tag.getAttribute('data-video-urls').getValue();

                                json = JSON.parse(json.replace(/'/g, '"'));
                                json[index]['video-type'] = sourceType;

                                tag.setAttribute('data-video-urls', JSON.stringify(json).replace(/\"/g, "'"));
                                tag.domUpdate();

                                Designer.tag.refreshPanels();

                                if (playerType !== 'html5') {
                                    $('#waform-form-gridmanager-video-sources .actions button').hide();
                                } else {
                                    $('#waform-form-gridmanager-video-sources .actions button').show();
                                }
                            }, 0);
                        })(sourceType, index, tag, videoInfo.playerType);
                    }
                },
                {
                    name: 'video-type',
                    type: 'textField',
                    disabled: true
                }],
            afterRowAdd: function(data) {
                var idx = data.index;

                $(data.items[idx].getHtmlObject()).attr('data-idx', idx);

                // TODO: remove that once html5 will have been added
                $('#waform-form-gridmanager-video-sources .actions button').hide();
            },
            afterRowDelete: function(data, rows) {
                if (!rows.length) {
                    setTimeout(function() {
                        $('#waform-form-gridmanager-video-sources .actions button').show();
                    }, 0);
                    // update the tag
                    this.data.tag.onDesign();
                }
            },
            afterReady: function(items) {
                if (items && items.length) {
                    // html5
                    if (!items[0]['video-type'].match(/(mp4|m4v|ogv|webm)$/i)) {
                        $('#waform-form-gridmanager-video-sources .actions button').hide();
                    } else {
                        $('#waform-form-gridmanager-video-sources .actions button').show();
                    }
                } else {
                    $('#waform-form-gridmanager-video-sources .actions button').show();
                }

                this.data.tag.onDesign();
            }
        }
    ],
    style: [
        {
            name: 'width',
            defaultValue: '500px'
        },
        {
            name: 'height',
            defaultValue: '280px'
        }],
    events: [
        {
            name: 'playerReady',
            description: 'On Player Ready',
            category: 'Media Events'
        },
        {
            name: 'progress',
            description: 'On Load Progress',
            category: 'Media Events'
        },
        {
            name: 'playing',
            description: 'On Start Playing',
            category: 'Media Events'
        },
        {
            name: 'ended',
            description: 'On End Playing',
            category: 'Media Events'
        },
        {
            name: 'paused',
            description: 'On Pause',
            category: 'Media Events'
        },        
        {
            name: 'durationChange',
            description: 'On Duration Change',
            category: 'Media Events'
        },
        {
            name: 'timeUpdate',
            description: 'On Time Update',
            category: 'Media Events'
        },
        {
            name: 'videoError',
            description: 'On Error',
            category: 'Media Events'
        }        
    ],
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
            disabled: []
        }
    },
    structure: [],
    onInit: function(config) {
        var widget = new WAF.widget.Video(config);

        return widget;
    },
    onVideoUrlChange: function(tag, url) {
        var htmlObj = tag.getHtmlObject(),
        img;

        if (url && url.length && url[0]['video-url'].length) {
            tag.videoUrl = [];

            $.each(url, function(i, obj) {
                tag.videoUrl.push(obj['video-url']);
            });
            tag._config.createVideoTag(tag);
        } else {
            if (tag.video) {
                tag.video.remove();
            }

            if ($(htmlObj).find('> img').length === 0) {

                img = $('<img>');

                img.attr({
                    'src': '/walib/WAF/widget/video/icons/video-icon.jpg'
                }).css({
                    margin: 'auto',
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '100%'
                });

                img.appendTo(htmlObj);
            }
        }
    },
    createVideoTag: function(tag) {
        var htmlObj = tag.getHtmlObject(),
        videoInfo = null,
        sourceType = null;

        videoInfo = WAF.widget.Video.prototype._detectSig(tag.videoUrl);

        // remove previous video tag/iframe, if any
        if (tag.video) {
            tag.video.remove();
        }

        if (videoInfo !== null) {
            switch (videoInfo.playerType) {
                case 'html5':
                    tag.videoType = 'html5';

                    tag.video = $('<video/>').attr({
                        width: '100%',
                        height: '100%',
                        controls: 'controls'
                    }).append($('<source/>').attr({
                        src: videoInfo.url,
                        type: 'video/' + videoInfo.sourceType
                    })).prependTo(htmlObj);
                    break;

                default:
                    // we keep designer options to the minimal: taking care of 
                    tag.video = $('<iframe/>').attr({
                        src: videoInfo.url,
                        width: '100%',
                        height: '100%',
                        frameborder: '0'
                    }).prependTo(htmlObj);

                    tag.videoType = videoInfo.playerType;
                    break;
            }
        } else {    // no video could be detected
            Designer.util.notify("Format Unknown", "Could not detect the format of the video: " + tag.videoUrl + "<br /><br />List of supported video types: " + WAF.widget.Video.prototype.getSupportedVideoTypes());
        }
    },
    onBeforeCreate: function(tag) {
        var htmlObj = tag.getHtmlObject();

        htmlObj.empty();

        $('<div/>').css({
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 10
        }).appendTo(htmlObj);

        tag.video = null;
        tag.videoUrl = '';
        tag.videoType = '';
        this.created = true;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        var link,
        video,
        htmlObj,
        urls = null;

        htmlObj = tag.getHtmlObject();

        // this should be called on the first onDesign only, or if the videoUrl has been updated
        if (!this.created) {
            tag._config.onBeforeCreate.apply(this, [tag]);
        }

        if (config['data-video-urls'] && config['data-video-urls'].length) {
            urls = JSON.parse(config['data-video-urls'].replace(/'/g, '"'));
        }

        if (config['data-video-urls'].replace(/'/g, '"') !== this.urls || typeof this.urls === 'undefined') {
            this.urls = config['data-video-urls'].replace(/'/g, '"');
            tag._config.onVideoUrlChange(tag, urls);
        }
    },
    onCreate: function(tag, param) {

    }
});
