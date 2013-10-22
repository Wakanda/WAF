;(function() {
    var player = {
        name: 'vimeo',

        videos: [],

        // for GUI Designer
        urlBase: 'http://player.vimeo.com/video/',
        
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
            e.id = "dtc";
            
            e.onload = function() {
                console.log('onload !')
                player.apiReady.resolve();
            }
            e.src = prefix + '//a.vimeocdn.com/js/froogaloop2.min.js?216a2-1366635144';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(e, s);
        },
        
        apiReady: new $.Deferred(),
        
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
            this.loadAPI();
        },
            
        createPlayer: function(config, htmlObj, widget, sourceAtt) {
            var def = new $.Deferred(),
                iframe = null,
                that = this;
            
            player.apiReady.done(function() {
                var id = htmlObj.attr('id'),
                    vimeo = null;
                
                console.log('[VM] API Loaded!', config);
                
                console.log('src', that.playerBase.replace('{videoId}', config['data-video-sig']).replace('{playerId}', htmlObj.attr('id')));
                
                iframe = $('<iframe/>').attr({
                    'src': that.playerBase.replace('{videoId}', config['data-video-sig']).replace('{playerId}', htmlObj.attr('id')).replace('{autoPlay}', config['data-video-autoplay']).replace('{loop}', config['data-video-loop']),
                    width: '100%',
                    height: '100%',
                    id: htmlObj.attr('id')
                });
                
                htmlObj.replaceWith(iframe);
                
                $f($('#' + id).get(0)).addEvent('ready', function(id) {
                    console.log('ready!!!', this, id);
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
                
                console.log($('#' + id).get(0));
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
        var that = this,
            currentTimeInt = null;
        
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
                
        console.log('[VM] loading player with video ', config['data-video-sig'], 'to dom element ', this.htmlObj.attr('id'));

        window.daily = this;
    
        this.id = this.htmlObj.attr('id');    
    }
    
    videoPlayer.prototype = {
        _bindEvents: function() {
            var that = this;

            this.iframe.addEvent('loadProgress', function(data, playerId) {
//                console.log('loadProgress', data.duration * data.percent);
                if (that.duration !== data.duration) {
                    that.duration = data.duration;
                    that.gotDuration = true;
                    $(that.widget.containerNode).trigger('durationChange', {duration: data.duration});
                }
                
                $(that.widget.containerNode).trigger('progress', {time: data.duration * data.percent});
            });
            
            this.iframe.addEvent('playProgress', function(data, playerId) {
                $(that.widget.containerNode).trigger('timeUpdate', {time: data.seconds});
            });
            
            this.iframe.addEvent('play', function(e) {
                $(that.widget.containerNode).trigger('playing');
            });
            
            this.iframe.addEvent('pause', function(e) {
                $(that.widget.containerNode).trigger('paused');
            });
            
            console.log('bindEvents', this.iframe);
            this.iframe.addEvent('finish', function(e, data) {
                $(that.widget.containerNode).trigger('ended');
                        
                // set Loop parameter again since the one passed when creating the player seems to be ignored at this point        
//                if (that.config['data-video-loop'] === 1) {
//                    console.log('[VM] reached end of video, need to loop');
//                    that._loop();
//                }
            });
            
//            this.iframe.addEventListener('error', function(e) {
//                $(that.widget.containerNode).trigger('error', {error: e});
//            });
        },

        _loadOrCueVideoById: function(sig) {
            console.warn('TODO: [Vimeo] loadOrCureVideoById');
            // TODO => create a new player ??
//            this.iframe.load(sig);
//            
//            if (this.config['data-video-autoplay']) {            
//                this.iframe.play();
//            }
//            
//            if (this.config['data-video-start']) {
//                this.seekTo(this.config['data-video-start']);
//            }
        },
        
        _loop: function() {
            if (this.config['data-video-loop'] === 1) {
                this.seekTo(this.config['data-video-start']);
                this.play();
            }
        },
        
        pause: function() {
            this.paused = true;                    
            this.iframe.api('pause');
        },
        
        play: function() {
            this.paused = false;
            this.iframe.api('play');
        },        

        stop: function() {
            if (!this.paused) {
                this.pause();
            }
        },
        
        seekTo: function(secs) {
            this.iframe.api('seekTo', secs);
        },
        
        togglePlay: function() {
            console.log('[VM] togglePlay()');
            if (this.paused) {
                this.play();
            } else {
                this.pause();
            }            
        },
        
        loadVideoById: function(sig, start) {
            var that = this;

            this.config['data-video-start'] = start || this.config['data-video-start'];
            
            console.log('[VM] loadVideoById', start, this.config['data-video-start']);
            
            console.log('[VM] loadVideoById -> need to create Player first')
            this.config['data-video-sig'] = sig;
                
            player.createPlayer(this.config, this.htmlObj, this.widget, this.sourceAtt).done(function(iframe) {
                console.log('[VM] oh oh... seems like the iframe is ready to communicate with us! let\'s call load with', sig);
                that.htmlObj = $('#' + that.id);
                that.iframe = iframe;
                that._bindEvents();
                
                // TODO: get duration since we won't get it automatically
                that.duration = -1;
                that.gotDuration = false;
            });
//            }
//else {
//                that.duration = -1;
//                this.gotDuration = false;
//                // if the video is playing, calling load() will automatically play the video with dailymotion,
//                // even if autoplay has been set to 0 when loading the player
//                this.stop();
//                this._loadOrCueVideoById(sig);
//            }
        },
        
        toggleMute: function() {
            console.warn('TODO: toggleMuted');
//            this.iframe.toggleMuted();
        },
        
        mute: function() {
            console.warn('TODO: mute()');
//            this.volume = this.iframe.getVolume();
//            this.iframe.api('setVolume', 0);
        },
        
        hide: function() {
            $(this.htmlObj).hide();
        },
        
        show: function() {
            $(this.htmlObj).show();        
        },
        
        setVolume: function(vol) {
            this.iframe.api('setVolume', vol/100);
        },
        
        getVolume: function() {
            console.warn('TODO: async');
//            return this.iframe.volume * 100;
        }
    };

    // add ouverselves to the Video tag, and initialize Vimeo API
    player.init();
})();
