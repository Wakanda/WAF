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
//// "use strict";

/*global WAF,window*/

/*jslint white: true, browser: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */

// Dailymotion player api: http://www.dailymotion.com/doc/api/player.html#player-api-compat-matrix
// Youtube player api: 

;(function() {
    // all players are stored here, since we only need one instance for each video API (youtube, dailymotion,...),
    // object references are stored as static in here.
    var playerDefinitions = {
        /*
        playerType: {
            'youtube': {
                detectionFunc: function(url) { return 'SFARA4'; },
                player: function() { }
            }
        }
        */
    };

    WAF.Widget.provide(
        'Video',
        {
            
        },
        function WAFWidget(config, data, shared) {
            // store id for later use: we cannot store a reference to the dom/jQuery instance since
            // the player usually creates a new one
            var videoWidgetId = $(this.$domNode).attr('id'),
                htmlObj,
                sourceAtt,
                json,
                urls = [],
                img;
            
            htmlObj     = this.$domNode;
            sourceAtt   = this.sourceAtt;
            
            htmlObj.html();
            
            this.playerType = null;
            this.currentPlayer = null;
            this.sig = null;
            this.config = config;
            
            this.players = {};
            
            if (this.config['data-video-urls'] !== null && this.config['data-video-urls'].length) {
                
                json = JSON.parse(this.config['data-video-urls'].replace(/'/g, '"'));
                
                $.each(json, function(i, obj) {
                    urls.push(obj['video-url']);
                });
                this.loadVideoByUrl(urls);
            } else {
                img = $('<img>');
                
                img.attr({
                    'src'       : '/walib/WAF/widget/video/icons/video-icon.jpg'
                }).css({
                    margin: 'auto',
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '100%'
                });
                
                img.appendTo(htmlObj);                
            }
            
            // data-binding
            if (sourceAtt) {
                sourceAtt.addListener(function(e) {
                    var widget = e.data.widget,
                        videoUrl = widget.getFormattedValue();

                    if (typeof videoUrl === 'string'){
                        widget.loadVideoByUrl(videoUrl);
                    }
                },{
                    id: config.id
                },{
                    widget: this
                });
            }            
        },
        {
            _detectSig: function(url) {
                var player = 'null',
                    detected = null;

                for (player in playerDefinitions) {
                    detected = playerDefinitions[player].detectionFunc(url);
                    
                    if (detected !== null) {
                        detected.playerType = player;
                        
                        return detected;
                    }
                }
                
                return detected;
            },
            _removeCurrentPlayer: function() {
                if (this.currentPlayer) {
                    this.currentPlayer.stop();                            
                    this.currentPlayer.hide();
                    this.currentPlayer = null;
                }                
            },
            getSupportedVideoTypes: function() {
                var videoTypes = [];
                
                $.each(playerDefinitions, function(i) {
                    videoTypes.push(i);
                });
                
                return videoTypes;
            },
            extendVideo: function(playerName, detectionFunc, videoPlayer) {
                if (typeof playerDefinitions[playerName] !== 'undefined') {
                    console.warn('WARN: trying to overwrite an existing video type:', playerName);
                } else {
                    // add the player
                    playerDefinitions[playerName] = {
                        videoPlayer: videoPlayer,
                        detectionFunc: detectionFunc
                    };
                }
            },
            pause: function() {
                if (this.currentPlayer) {
                    this.currentPlayer.pause();
                }                
            },
            play: function() {
                if (this.currentPlayer) {
                    this.currentPlayer.play();
                }                
            },
            stop: function(clearEvents) {
                if (this.currentPlayer) {
                    this.currentPlayer.stop(clearEvents);
                }
            },
            isPlaying: function() {
                if (this.currentPlayer) {                
                    return this.currentPlayer.isPlaying();
                } else {
                    return false;
                }
            },
            togglePlay: function() {
                if (this.currentPlayer) {
                    this.currentPlayer.togglePlay();
                }
            },
            seekTo: function(seconds) {
                if (this.currentPlayer) {
                    this.currentPlayer.seekTo(seconds);
                }
            },
            loadVideoById: function(sig, type, start) {
                var videoWidgetId = $(this.$domNode).attr('id');
                
                $(this.$domNode).find('> img').hide();
                
                if (this.playerType !== type && this.currentPlayer) {
                    this.stop(true);
                    this.hide();
                }
                
                try{
                    this.currentPlayer = this.players[type];
                    
                    // since we lazy load all players, the first time the player is called we have to create a new instance of the video player
                    // guess we can have something nicer
                    if (typeof this.currentPlayer === 'undefined') {
                        this.players[type] = new playerDefinitions[type].videoPlayer(this.config, $('<div/>').attr('id', videoWidgetId + '_' + type).appendTo(this.$domNode), this, this.sourceAtt);
                        this.currentPlayer = this.players[type];                            
                    }
                        
                    this.playerType = type;
                    this.show();
                    this.players[type].loadVideoById(sig, start);
                } catch(err) {
                    console.log('WARN: could not load video, sig=', sig, 'playerType=', type, err.message, err.stack, err);
                }
                
            },
            loadVideoByUrl: function(url, start) {
                var ev = null;

                if (typeof url !== 'string' && !$.isArray(url)) {
                    console.log('loadVideoByUrl expects a string or array parameter, got', typeof url);
                    return;
                }
                var res = this._detectSig(url);
                                
                try{
                    if (res && res.sig) {
                        this.loadVideoById(res.sig, res.playerType, start);
                    } else if (url && url.length) {
                        ev = jQuery.Event('videoError');
                        ev.error = {
                                error: 5,
                                description: 'Unable to determine videoType: cannot load the video ' + url + '. Supported videoTypes: ' + this.getSupportedVideoTypes().join(', ')
                            };
                        
                        
                        $(this.$domNode).trigger(ev);
                    } else {
                        // hide any previous video player
                        this._removeCurrentPlayer();
                    }
                } catch(err) {
                    // console.log('Error while trying to detect a video in the url "' + url + '", is it a valid URL ?' + '. Supported videoTypes: ' + this.getSupportedVideoTypes().join(', '));
                    // hide any previous video player
                    this._removeCurrentPlayer();
                }
            },
            toggleMute: function() {
                if (this.currentPlayer) {
                    this.currentPlayer.toggleMute();
                }
            },
            mute: function() {
                if (this.currentPlayer) {
                    this.currentPlayer.mute();
                }
            },
            setVolume: function(vol) {
                if (vol < 0 || vol > 100) {
                    console.warn('Volume range must be: 0 <= vol <= 100');
                    return;
                }
                
                if (this.currentPlayer) {
                    this.currentPlayer.setVolume(vol);
                }
            },
            
            getVolume: function() {
                if (this.currentPlayer) {
                    return this.currentPlayer.getVolume();
                } else {
                    return 0;
                }
            },
            hide: function() {
                if (this.currentPlayer) {
                    this.currentPlayer.hide();
                }
                
                if (this.getLabel() !== null) {
                    this.getLabel().hide();
                }

                WAF.Widget.prototype.hide.call(this);
            },
            show: function() {
                if (this.currentPlayer) {
                    this.currentPlayer.show();
                }            
            
                if (typeof this.getLabel() !== 'undefined' && this.getLabel() !== null) {
                    this.getLabel().show();
                }

                WAF.Widget.prototype.show.call(this);                
            },
            getVideoUrl: function() {
                if (this.currentPlayer) {
                    return this.currentPlayer.getVideoUrl();
                } else {
                    return '';
                }
            }
        }
    );
})();