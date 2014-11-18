;(function() {
    window.dmAsyncInit = function() {
        player.apiLoaded = true;
        player.apiReady.resolve();
    };
    
    var player = {
        name: 'dailymotion',

        videos: [],

        // for GUI Designer
        urlBase: 'http://www.dailymotion.com/embed/video/',
        
        videoBase: 'http://www.dailymotion.com/video/',
        
        urlTypes: [
	       {
				reg: /dailymotion\.com\/video\/([A-Za-z0-9-]+)\.*/
           }
        ],

        
        // Load Dailymotion API
        loadAPI: function() {
            this.apiLoading = true;
            
            var prefix = '//';
            
            if (document.location.href.match('^file')) {
                prefix = 'http://';
            }            
            
            var e = document.createElement('script'); e.async = true;
            e.src = prefix + '//api.dmcdn.net/all.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(e, s);
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
                        };
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
                iframe = null;
            
            player.apiReady.done(function() {
//                console.log('[DM] API Loaded!', config);
    
                iframe = DM.player(htmlObj.get(0), {
                    video: config['data-video-sig'],
                    width: '100%',
                    height: '100%',
                    params: {
                        autoplay: config['data-video-autoplay'],
                        repeat: config['data-video-loop'],
                        chromeless: config['data-video-controls'],
                        start: config['data-video-start']
                    }
                });
                
                iframe.addEventListener('apiready', function() {
//                    console.log('[DM] iframe ready to communicate: fire resolve!');
                    def.resolve(iframe);
                });
            });
            
            return def.promise();
        }
    };

    function videoPlayer(config, target, widget, sourceAtt) {
        var that = this;
        
        this.htmlObj = target || $('<div/>').appendTo('body');
        this.widget = widget;
        this.sourceAtt = sourceAtt;
        
        this.iframe = null;    
        this.config = $.extend({}, config);
    
        this.config['data-video-url']    = config['data-video-url']     || '';
        this.config['data-video-start'] = config['data-video-start']      || '0';
        this.config['data-video-autoplay']          = config['data-video-autoplay']           == 'true' ? 1 : 0;
        this.config['data-video-loop']              = config['data-video-loop']               == 'true' ? 1 : 0;
        this.config['data-video-controls']          = config['data-video-controls']           == 'true' ? 0 : 1;
                
//        console.log('[DM] loading player with video ', config['data-video-sig'], 'to dom element ', this.htmlObj.attr('id'));
    
        this.id = this.htmlObj.attr('id');    
    }
    
    videoPlayer.prototype = {
        _bindEvents: function() {
            var that = this;

            if (this.config['data-autoplay']) {
                this.paused = false;
            } else {
                this.paused = true;            
            }
            
            this.iframe.addEventListener('durationchange', function(e) {
//                console.log('[DM] durationChange', e.target.duration);
                var ev = jQuery.Event('durationChange');
                ev.duration = e.target.duration;
                $(that.widget.containerNode).trigger(ev);
            });

            this.iframe.addEventListener('progress', function(e) {
                e.stopPropagation();                
                var ev = jQuery.Event('progress');
                ev.progress = e.target.bufferedTime;
                $(that.widget.containerNode).trigger(ev);
            });
            
            this.iframe.addEventListener('timeupdate', function(e) {
                var ev = jQuery.Event('timeUpdate');
                ev.time = e.target.currentTime;
                $(that.widget.containerNode).trigger(ev);
            });
            
            // no need to listen and trigger playing again since the event sent by Dailymotion will bubble up to our video widget element
//            this.iframe.addEventListener('playing', function(e) {
//                console.log('DM playing');
//                e.stopPropagation();
//                $(that.widget.containerNode).trigger('playing');
//            });
            
            this.iframe.addEventListener('pause', function(e) {
                $(that.widget.containerNode).trigger('paused');
            });            
            
            this.iframe.addEventListener('ended', function(e) {
                // no need to trigger ended again since the event sent by Dailymotion will bubble up to our video widget element
                // $(that.widget.containerNode).trigger('ended');
                
                that.paused = true;
                
                // set Loop parameter again since the one passed when creating the player seems to be ignored at this point        
                if (that.config['data-video-loop'] === 1) {
//                    console.log('[DM] reached end of video, need to loop');
                    that._loop();
                }                                
            });
            
            this.iframe.addEventListener('error', function(e) {
                // TODO: fix me, and convert errors to wakanda video ones
                var ev = jQuery.Event('videoError');
                ev.error = {error: e};
                $(that.widget.containerNode).trigger(ev);
            });
            
            // send playerReady event now that we are ready to receive api calls
            var ev = jQuery.Event('playerReady');
            $(that.widget.containerNode).trigger(ev);
        },

        _loadOrCueVideoById: function(sig) {
            this.config['data-video-sig'] = sig;
            this.paused = true;
            
            this.iframe.load(sig);
            
            if (this.config['data-video-autoplay']) {            
                this.iframe.play();
                this.paused = false;
            }
            
            if (this.config['data-video-start']) {
                this.seekTo(this.config['data-video-start']);
            }            
        },
        
        _loop: function() {
            if (this.config['data-video-loop'] === 1) {
                this.seekTo(this.config['data-video-start']);
                this.play();
            }
        },

        _api: function(call, params) {
            var that = this;
            
            // forget about any api call other than loadVideoById that's been called too early
            if (call !== 'loadVideoById' && (!player.apiLoaded || !this.iframe)) {
                console.warn(player.name, 'api not ready yet, method', call, 'called too early');
                return;
            }

            switch(call) {
                case 'pause':
                    this.paused = true;                    
                    this.iframe.pause();
                break;

                case 'play':
                    this.paused = false;
                    this.iframe.play();                    
                break;
                
                case 'stop':
                    // seems like dailymotion doesn't provide a stop call so we use pause instead
                    if (!this.iframe.paused) {
                        this.pause();
                    }
                break;

                case 'seekTo':
                    this.iframe.seek(params.secs);
                break;
                    
                case 'togglePlay':
//                    console.log('[DM] togglePlay()');
                    if (this.paused) {
                        this.play();
                    } else {
                        this.pause();
                    }
                break;
                
                case 'loadVideoById':        
                    this.config['data-video-start'] = params['start'] || this.config['data-video-start'];
                    
//                    console.log('[DM] loadVideoById', params['start'], this.config['data-video-start']);
        
                    // if Dailymotion api hasn't been loaded, we load it and postpone the load event
                    if (!player.apiLoaded && !player.apiLoading) {
                        player.loadAPI();
                        player.onReady(function() {
                            that._api('loadVideoById', params);
                        });
                    } else if (!this.iframe) {
//                        console.log('[DM] loadVideoById -> need to create Player first')
                        this.config['data-video-sig'] = params['sig'];
                        
                        player.createPlayer(this.config, this.htmlObj, this.widget, this.sourceAtt).done(function(iframe) {
//                            console.log('[DM] oh oh... seems like the iframe is ready to communicate with us! let\'s call load with', params['sig']);
                            that.htmlObj = $('#' + that.id);
                            that.iframe = iframe;
                            that._bindEvents();
                            
                            that.gotDuration = false;
                        })
                    } else {
                        this.gotDuration = false;
                        // if the video is playing, calling load() will automatically play the video with Dailymotion,
                        // even if autoplay has been set to 0 when loading the player
                        this.stop();
                        this._loadOrCueVideoById(params['sig']);
                    }                    
                break;
                
                case 'toggleMute':
                    this.iframe.toggleMuted();
                break;
                
                case 'mute':
                    this.iframe.muted(1);
                break;

                case 'setVolume':
                    this.iframe.setVolume(params['vol']/100);
                break;
                
                case 'getVolume':
                    return this.iframe.volume * 100;
                break;

                case 'getVideoUrl':
                    return this.config && this.config['data-video-sig'] ? (player.videoBase + this.config['data-video-sig']) : '';
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
            this._api('stop');
            if (clearEvents === true) {
            }            
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
            this._api('setVolume', vol);
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
                return !this.paused;
            }
        }
    };

    // add ouverselves to the Video tag
    player.init();
})();