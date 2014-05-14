;(function() {
    var player = {
        name: 'vimeo',

        videos: [],

        // for GUI Designer
        urlBase: 'http://player.vimeo.com/video/',
        
        videoBase: 'http://www.vimeo.com/',
        
        urlTypes: [
	       {
				reg: /vimeo\.com\/([A-Za-z0-9-]+)\.*/
           }
        ],

        playerBase: 'http://player.vimeo.com/video/{videoId}?api=1&player_id={playerId}&autoplay={autoPlay}&loop={loop}',
        
        // Load Youtube API
        loadAPI: function() {
            var prefix = '//';
            
            if (document.location.href.match('^file')) {
                prefix = 'http://';
            }            
            
            var e = document.createElement('script'); e.async = true;
            
            e.onload = function() {
                player.apiLoaded = true;
                player.apiReady.resolve();
            }
            e.src = prefix + '//a.vimeocdn.com/js/froogaloop2.min.js?216a2-1366635144';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(e, s);
            
            player.apiLoading = true;
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
                iframe = null,
                that = this;
            
            player.apiReady.done(function() {
                var id = htmlObj.attr('id'),
                    vimeo = null;
                
//                console.log('[VM] API Loaded!', config);
                
                iframe = $('<iframe/>').attr({
                    'src': that.playerBase.replace('{videoId}', config['data-video-sig']).replace('{playerId}', htmlObj.attr('id')).replace('{autoPlay}', config['data-video-autoplay']).replace('{loop}', config['data-video-loop']),
                    width: '100%',
                    height: '100%',
                    id: htmlObj.attr('id')
                });
                
                htmlObj.replaceWith(iframe);
                
                $f($('#' + id).get(0)).addEvent('ready', function(id) {
                    def.resolve($f(id));
                });
//                $('#' + id).
//
//                setTimeout(function() {
//                    console.log(id)
//                    $f($('#' + id).get(0)).addEvent('ready', function() {
//                        console.log('[VM] iframe ready to communicate: fire resolve!');
//                        def.resolve($f(this));
//                    });
//                }, 400);
//                    params: {
//                        autoplay: config['data-video-autoplay'],
//                        repeat: config['data-video-loop'],
//                        chromeless: config['data-video-controls'],
//                        start: config['data-video-start']
//                    }
//                });
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

        this.currentVolumeInt = null;
        
        this.volume = 0;
        this.muted = false;
        
        this.config['data-video-url']    = config['data-video-url']     || '';
        this.config['data-video-start'] = config['data-video-start']      || '0';
        this.config['data-video-autoplay']          = config['data-video-autoplay']           == 'true' ? 1 : 0;
        this.config['data-video-loop']              = config['data-video-loop']               == 'true' ? 1 : 0;
        this.config['data-video-controls']          = config['data-video-controls']           == 'true' ? 0 : 1;
                
//        console.log('[VM] loading player with video ', config['data-video-sig'], 'to dom element ', this.htmlObj.attr('id'));

        window.daily = this;
    
        this.id = this.htmlObj.attr('id');    
    }
    
    videoPlayer.prototype = {
        _bindEvents: function() {
            var that = this;

            this.iframe.addEvent('loadProgress', function(data, playerId) {
                var event = null;
                if (that.duration !== data.duration) {
                    that.duration = data.duration;
                    that.gotDuration = true;
                    event = jQuery.Event('durationChange');
                    event.duration = data.duration;
                    $(that.widget.containerNode).trigger(event);
                }
                
                event = jQuery.Event('progress');
                event.progress = data.percent;
                $(that.widget.containerNode).trigger(event);
            });
            
            this.iframe.addEvent('playProgress', function(data, playerId) {
                var event = jQuery.Event('timeUpdate');
                event.time = data.seconds;
                $(that.widget.containerNode).trigger(event);
            });
            
            this.iframe.addEvent('play', function(e) {
                that.paused = false;
                $(that.widget.containerNode).trigger('playing');
            });
            
            this.iframe.addEvent('pause', function(e) {
                that.paused = true;                
                $(that.widget.containerNode).trigger('paused');
            });

            this.iframe.addEvent('finish', function(e, data) {
                that.paused = true;                
                $(that.widget.containerNode).trigger('ended');
                        
                // set Loop parameter again since the one passed when creating the player seems to be ignored at this point        
//                if (that.config['data-video-loop'] === 1) {
//                    console.log('[VM] reached end of video, need to loop');
//                    that._loop();
//                }
            });
            
            // send playerReady event now that we are ready to receive api calls
            var ev = jQuery.Event('playerReady');
            $(that.widget.containerNode).trigger(ev);
            
//            this.iframe.addEventListener('error', function(e) {
//                $(that.widget.containerNode).trigger('error', {error: e});
//            });
            
            this.currentVolumeInt = setInterval(function() {
                that._api('getVolume', {
                    callback: function(value) {
                        that.volume = value * 100;
                    }
                });
            }, 200);
            
            this._api('getVolume', {
                callback: function(value) {
                    that.volume = value * 100;
                }
            });
        },
        
        _clearVolumeInt: function() {
            if (this.currentVolumeInt) {
                clearInterval(this.currentVolumeInt);
                this.currentVolumeInt = null;
            }
        },
        
        _loop: function() {
            if (this.config['data-video-loop'] === 1) {
                this.seekTo(this.config['data-video-start']);
                this.play();
            }
        },

        _mute: function() {
            this.muted = true;
            this.originalVolume = this.volume;
            this.setVolume(0);
        },
        
        _api: function(call, params) {
            // forget about any api call other than loadVideoById that's been called too early
            if (call !== 'loadVideoById' && (!player.apiLoaded || !this.iframe)) {
                console.warn(player.name, 'api not ready yet, method', call, 'called too early');
                return;
            }
            
            switch(call) {
                case 'pause':
                    this.paused = true;                    
                    this.iframe.api('pause');                    
                break;
                    
                case 'play':
                    this.paused = false;
                    this.iframe.api('play');                    
                break;

                case 'stop':
                    if (!this.paused) {
                        this.pause();
                    }
                break;
                    
                case 'togglePlay':
                    if (this.paused) {
                        this.play();
                    } else {
                        this.pause();
                    }
                break;
                    
                case 'seekTo':
                    this.iframe.api('seekTo', params['secs']);
                break;

                case 'getVolume':
                    this.iframe.api('getVolume', params['callback']);
                break;
                    
                case 'setVolume':
                    this.iframe.api('setVolume', params['vol']/100);
                break;
                    
                case 'loadVideoById':
                    var that = this;
        
                    this.config['data-video-start'] = params['start'] || this.config['data-video-start'];
                    
//                    console.log('[VM] loadVideoById', params['start'], this.config['data-video-start']);
                    
                    this.config['data-video-sig'] = params['sig'];

                    this.paused = true;
                    
                    if (!player.apiLoaded && !player.apiLoading) {
                        player.loadAPI();
                        player.onReady(function() {
                            that._api('loadVideoById', params);
                        });
                    } else {
//                        console.log('[VM] loadVideoById -> need to create Player first')
                        this.config['data-video-sig'] = params['sig'];
                        
                        player.createPlayer(this.config, this.htmlObj, this.widget, this.sourceAtt).done(function(iframe) {
//                            console.log('[VM] oh oh... seems like the iframe is ready to communicate with us! let\'s call load with', params['sig']);
                            
                            that.htmlObj = $('#' + that.id);
                            
                            that.iframe = iframe;
                            that._bindEvents();
                            
                            that.gotDuration = false;
                            that.duration = -1;                            
                        });
                    }
                break;
                    
                case 'getVideoUrl':
                    return this.config && this.config['data-video-sig'] ? (player.videoBase + this.config['data-video-sig']) : '';
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
                this._clearVolumeInt();
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
            if (this.muted === true) {
                this.setVolume(this.originalVolume);
            } else {
                this._mute();
            }
            this.muted = !this.muted;
        },
        
        mute: function() {
            this._mute();
        },
        
        hide: function() {
            $(this.htmlObj).hide();
        },
        
        show: function() {
            $(this.htmlObj).show();        
        },
        
        setVolume: function(vol) {
            this._api('setVolume', {
                vol: vol
            });
        },
        
        getVolume: function() {
            return this.volume;
        },
        
        getVideoUrl: function() {
            return this._api('getVideoUrl');
        },
        
        isPlaying: function() {
            return !this.paused;
        }
    };

    // add ouverselves to the Video tag, and initialize Vimeo API
    player.init();
})();