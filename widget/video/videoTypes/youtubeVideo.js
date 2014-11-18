;(function() {
    // player is a static instance and contains static stuff such as player API initializiation and detection methods
    // this is defined once here and should remain private
    window.onYouTubeIframeAPIReady = function() {
        player.apiLoaded = true;
        player.apiReady.resolve();
    };
    
    var player = {
        name: 'youtube',

        videos: [],

        // for GUI Designer
        urlBase: 'http://www.youtube.com/embed/',
        
        urlTypes: [
			// http://www.youtube.com/watch?v=QxHkiaU3H9I
			{
				reg: /watch\?v\=([\w-]+)\&*/
			}
        ],
        
        // Load Youtube API
        loadAPI: function() {
            this.apiLoading = true;
            
            var prefix = '//';
            
            if (document.location.href.match('^file')) {
                prefix = 'http://';
            }            
            
            var tag = document.createElement('script');
            tag.src = prefix + "www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        },
        
        apiReady: new $.Deferred(),
        
        apiLoaded: false,
        
        apiLoading: false,
        
        onReady: function(func) {
            this.apiReady.done(func);
        },

        detectSig: function(videoUrl) {
            var sig = null,
                url = null,
                obj = null,
                res = null;
            
            videoUrl = $.isArray(videoUrl) ? videoUrl[0] : videoUrl;
            
            if (typeof videoUrl !== 'string') {
                return null;
            }
            
            for (url in this.urlTypes) {
                obj = this.urlTypes[url];
                res = videoUrl.match(obj.reg);
                
                if (res) {
                    if (typeof studio !== 'undefined') {
                        return {
                            sig: res[1],
                            url: this.urlBase + res[1]
                        };
                    } else {
                        return {
                            sig: res[1]
                        }
                    }
                }
            }
            
            return null;
        },
            
        init: function() {
            WAF.widget.Video.prototype.extendVideo(this.name, jQuery.proxy(this.detectSig, this), videoPlayer);
        },
        
        createPlayer: function(config, htmlObj, widget, sourceAtt) {
            var def = new $.Deferred(),
                iframe = null,
                currentTimeInt = null;
            
            player.apiReady.done(function() {
                if (config['data-video-sig'].length) {
                    iframe = new YT.Player(htmlObj.get(0), {
                        videoId: config['data-video-sig'],
                        width: '100%',
                        height: '100%',
                        events: {
                            'onReady': function() {
                                def.resolve(iframe);                            
                            }
                        },
                        playerVars: {
                            loop: config['data-video-loop'],
                            autoplay: config['data-video-autoplay'],
                            controls: config['data-video-controls'],
                            autohide: config['data-video-autohide'],
                            start: config['data-video-start']
                        }
                    });
                } else {
                    iframe = new YT.Player(htmlObj.attr('id'), {
                        width: '100%',
                        height: '100%',
                        events: {
                            'onReady': function() {
                                def.resolve(iframe);                            
                            }
                        },                        
                        playerVars: {
                            loop: config['data-video-loop'],
                            autoplay: config['data-video-autoplay'],
                            controls: config['data-video-controls'],
                            autohide: config['data-video-autohide'],
                            start: config['data-video-start']                            
                        }
                    });
                }
            });
            
            return def.promise();            
        }
    };

    // this is the videoPlayer that can be instanciated many times
    function videoPlayer(config, target, widget, sourceAtt) {
        var that = this;
        
        this.htmlObj = target || $('<div/>').appendTo('body');
        this.widget = widget;
        this.sourceAtt = sourceAtt;
        
        this.iframe = null;
        this.config = $.extend({}, config);
        
        this.config['data-video-url']           = config['data-video-url']         || '';
        this.config['data-video-start']         = config['data-video-start']      || '0';
        this.config['data-video-autohide']      = config['data-video-autohide']   == 'true' ? 1 : 0;
        this.config['data-video-autoplay']      = config['data-video-autoplay']           == 'true' ? 1 : 0;
        this.config['data-video-loop']          = config['data-video-loop']               == 'true' ? 1 : 0;
        this.config['data-video-controls']      = config['data-video-controls']           == 'true' ? 1 : 0;
        
        this.id = this.htmlObj.attr('id');
    }
    
    videoPlayer.prototype = {
        _bindEvents: function() {
            var that = this,
                ev = jQuery.Event('videoError');
            
            this.gotDuration = false;
            this.videoProgress = -1;
            this.currentTimeInt = null;
            this.videoProgressTimeInt = null;
            
            this.iframe.addEventListener('onError', function(e) {
                var error = {};
                
                switch(e.data) {
                    case 2:
                        error.error = 1;
                        error.description = 'Bad video ID: check that it\'s a valid one and that it exists.';
                    break;
                        
                    case 5:
                        error.error = 2;
                        error.description = 'Error with the HTML 5 player: content cannot be played.';
                    break;
                        
                    case 100:
                        error.error = 3;
                        error.description = 'Video not found: it may have been marked as private or removed for copyright reasons.';
                    break;
                        
                    case 105:
                    case 150:
                        error.error = 4;
                        error.description = 'This video cannot be played in embeded players.';
                    break;
                        
                    default:
                        error.error = 0;
                        error.description = 'Unknown error.'
                    break;
                }
                ev.error = error;
                $(that.widget.containerNode).trigger(ev);
            });
            
            this.iframe.addEventListener('onStateChange', function(e) {
                var ev = null;
                
                switch(e.data) {
                    case YT.PlayerState.UNSTARTED:
                    break;
                    
                    case YT.PlayerState.PLAYING:
                        $(that.widget.containerNode).trigger(jQuery.Event('playing'));
                        
                        if (!that.gotDuration) {
                            ev = jQuery.Event('durationChange');
                            ev.duration = that.iframe.getDuration();                            
                            $(that.widget.containerNode).trigger(ev);
                            that.gotDuration = true;
                        }

                        if (that.videoProgress < 0) {
                            that._clearVideoProgressInt();                            
                            that.videoProgressTimeInt = setInterval(function() {
                                var progress = that.iframe.getVideoLoadedFraction();
                                if (progress > that.videoProgress) {
                                    that.videoProgress = progress;
                                    ev = jQuery.Event('progress');
                                    ev.progress = progress;
                                    $(that.widget.containerNode).trigger(ev);
                                } else {
                                    if (progress >= 0.998) {
                                        that._clearVideoProgressInt();
                                    }
                                }
                            }, 500);
                        }

                        that._clearCurrentTimeInt();
                        
                        that.currentTimeInt = setInterval(function() {
                            var event = jQuery.Event('timeUpdate');
                            event.time = that.iframe.getCurrentTime();
                            $(that.widget.containerNode).trigger(event);
                        }, 100);
                    break;

                    case YT.PlayerState.BUFFERING:
                    break;
                        
                    case YT.PlayerState.ENDED:
                        $(that.widget.containerNode).trigger('ended');
                        
                        // set Loop parameter again since the one passed when creating the player seems to be ignored at this point        
                        if (that.config['data-video-loop'] === 1) {
//                            console.log('[YT] reached end of video, need to loop');
                            that._loop();
                        }
                    case YT.PlayerState.PAUSED:
                        that._clearCurrentTimeInt();
                        $(that.widget.containerNode).trigger('paused');                        
                        // paused = true;
                    break;
                    
                    case YT.PlayerState.CUED:
                        that.gotDuration = true;
                        // $(widget.containerNode).trigger('durationChange', {duration: iframe.getDuration()});
                    break;
                        
                    default:
//                        console.log('[YT] nothing to do for state', e.data);
                    break;
                }
            });
            
            // send playerReady event now that we are ready to receive api calls
            var ev = jQuery.Event('playerReady');
            $(that.widget.containerNode).trigger(ev);
        },

        _clearCurrentTimeInt: function() {
            if (this.currentTimeInt) {
                clearInterval(this.currentTimeInt);
                this.currentTimeInt = null;
            }            
        },
        
        _clearVideoProgressInt: function() {
            if (this.videoProgressTimeInt) {
                clearInterval(this.videoProgressTimeInt);
                this.videoProgressTimeInt = null;
            }            
        },        
        
        _loadOrCueVideoById: function(sig) {
            if (this.config['data-video-autoplay']) {
                this.iframe.loadVideoById({
                    videoId: sig,
                    startSeconds: this.config['data-video-start']
                });
            } else {
                this.iframe.cueVideoById({
                    videoId: sig,
                    startSeconds: this.config['data-video-start']
                });                
            }
        },

        _loop: function() {
            this.seekTo(this.config['data-video-start']);
            this.play();
        },
        
        _api: function(call, params) {
            var that = this;
            
            // forget about any api call other than loadVideoById that's been called too early
            if (call !== 'loadVideoById' && (!player.apiLoaded || !this.iframe)) {
                console.warn(player.name, 'api not ready yet, method', call, 'called too early');
                return;
            }
            
            switch (call) {
                case 'pause':
                    this.iframe.pauseVideo();                    
                break;
                
                case 'play':
                    this.iframe.playVideo();                    
                break;
                
                case 'stop':
                    // we need to stop duration timer as well
                    this._clearCurrentTimeInt();
                    this.iframe.stopVideo();
                break;
                
                case 'seekTo':
                    this.iframe.seekTo(params['secs']);
                break;
                
                case 'togglePlay':
                    if (this.iframe.getPlayerState() === YT.PlayerState.PLAYING) {
                        this.pause();
                    } else {
                        this.play();
                    }
                break;
                
                case 'loadVideoById':
                    this.config['data-video-start'] = params['start'] || this.config['data-video-start'];
                    
                    // if Youtube api hasn't been loaded, we load it and postpone the load event
                    if (!player.apiLoaded && !player.apiLoading) {
                        player.loadAPI();
                        player.onReady(function() {
                            that._api('loadVideoById', params);
                        });
                    } else if (!this.iframe) {
                        this.config['data-video-sig'] = params['sig'];
                        
                        player.createPlayer(this.config, this.htmlObj, this.widget, this.sourceAtt).done(function(iframe) {
                            that.htmlObj = $('#' + that.id);
                            
                            that.iframe = iframe;
                            that._bindEvents();
                            
                            that.gotDuration = false;
                            that.videoProgress = -1;
                        });
                    } else {
                        this.gotDuration = false;
                        this.videoProgress = -1;
                        this._loadOrCueVideoById(params['sig']);
                    }
                break;
                
                case 'toggleMute':
                    if (this.iframe.isMuted()) {
                        this.iframe.unMute();                    
                    } else {
                        this.iframe.mute();
                    }
                break;
            
                case 'mute':
                    this.iframe.mute();
                break;

                case 'setVolume':
                    this.iframe.setVolume(params['vol']);
                break;
            
                case 'getVolume':
                    return this.iframe.getVolume();
                break;

                case 'getVideoUrl':
                    return this.iframe.getVideoUrl();
                break;

                case 'isPlaying':
                    return this.iframe.getPlayerState() === YT.PlayerState.PLAYING;
                break;
                    
                default:
                    console.warn('unknown api call:', call);
                break;
            }
        },
        
        pause: function() {
            this._api('pause');
        },
        
        play: function() {
            this._api('play');
        },        

        stop: function(clearEvents) {
            if (clearEvents === true) {
                this._clearCurrentTimeInt();
                this._clearVideoProgressInt();
            }            
            this._api('stop');
        },
        
        seekTo: function(secs) {
            this._api('seekTo', {
                secs: secs
            });
        },
        
        togglePlay: function() {
            this._api('togglePlay');
        },
        
        loadVideoById: function(sig, start) {
            this._api('loadVideoById', {
                sig: sig,
                start: start
            });
        },
        
        toggleMute: function() {
            this._api('toggleMute');
        },
        
        mute: function() {
            this._api('mute');
        },

        setVolume: function(vol) {
            this._api('setVolume', {
                vol: vol
            });
        },
        
        getVolume: function() {
            return this._api('getVolume');
        },            
            
        hide: function() {
            $(this.htmlObj).hide();
        },
        
        show: function() {
            $(this.htmlObj).show();        
        },
        
        getVideoUrl: function() {
            return this._api('getVideoUrl');
        },
        
        isPlaying: function() {
            if (!player.apiLoaded || !this.iframe) {
                return false;                
            } else {
                return this._api('isPlaying');
            }
        }
    };

    // add ouverselves to the Video tag, and initialize Youtube API
    player.init();
})();