;(function() {
    // most video APIs that need an external API will call a global function once they are ready
    // our dummy video player will call window.myPlayer() method once ready
    // when it's the case we simply resolve the player.apiReady deferred
    window.myPlayerInit = function() {
        player.apiReady.resolve();
    };
    
    var player = {
        // this is the name of your player
        name: 'dailymotion',

        // for GUI Designer
        urlBase: 'http://www.dailymotion.com/embed/video/',
        
        // Here are the url types that are recognized by our player
        // In this example, our extension will detect urls like this one:
        // //myplayer.com/video/<videoId>
        urlTypes: [
	       {
				reg: /myplayer\.com\/video\/([A-Za-z0-9-]+)\.*/
			},
        ],

        videos: [],
        
        // Load myPlayer's API: if your player need some external API you may load it here
        loadAPI: function() {
            var prefix = '//';
            
            if (document.location.href.match('^file')) {
                prefix = 'http://';
            }            
            
            var e = document.createElement('script'); e.async = true;
            e.src = prefix + '//myPlayer.com/player.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(e, s);
        },
        
        apiReady: new $.Deferred(),
        
        onReady: function(func) {
            this.apiReady.done(func);
        },

        // this is the method that gets called with the URL
        // this method should return null if the url is not valid for our player
        // otherwise it must return:
        // - the video SIG (id) if running in runtime
        // - an url for the video player if running inside the designer
        detectSig: function(videoUrl) {
            var sig = null,
                url = null,
                obj = null,
                res = null;
            
            for (url in this.urlRegs) {
                obj = this.urlRegs[url];
                res = videoUrl.match(obj.reg);
                if (res) {
                    if (typeof studio !== 'undefined') {
                        return this.urlBase + res[1];
                    } else {
                        return res[1];                    
                    }
                }
            }
            
            return null;
        },
            
        // this is the entry point of our extension: this registers our new extension to the Video widget
        // then loads the external API
        init: function() {
            WAF.widget.Video.prototype.extendVideo(this.name, jQuery.proxy(this.detectSig, this), videoPlayer);
            this.loadAPI();
        },
        
        // this constructor is called each time a new player of type <myPlayer> needs to be instanciated
        createPlayer: function(config, htmlObj, widget, sourceAtt) {
            var def = new $.Deferred(),
                iframe = null;
            
            player.apiReady.done(function() {
                console.log('myPlayer api Loaded!', config);
    
                iframe = MY_PLAYER.player(htmlObj.get(0), {
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
                    console.log('iframe ready to communicate: fire resolve!');
                    def.resolve(iframe);
                });
            });
            
            return def.promise();
        }
    };

    function videoPlayer(config, target, widget, sourceAtt) {
        var that = this,
            currentTimeInt = null;
        
        this.htmlObj = target || $('body');
        this.widget = widget;
        this.sourceAtt = sourceAtt;
        
        this.iframe = null;    
        this.config = $.extend({}, config);
    
        this.config['data-video-url']    = config['data-video-url']     || '';
        this.config['data-video-start'] = config['data-video-start']      || '0';
        this.config['data-video-autoplay']          = config['data-video-autoplay']           == 'true' ? 1 : 0;
        this.config['data-video-loop']              = config['data-video-loop']               == 'true' ? 1 : 0;
        this.config['data-video-controls']          = config['data-video-controls']           == 'true' ? 0 : 1;
                
        console.log('loading player with video ', config['data-video-sig'], 'to dom element ', this.htmlObj.attr('id'));

        window.daily = this;
    
        this.id = this.htmlObj.attr('id');    
    }
    
    videoPlayer.prototype = {
        _bindEvents: function() {
            var that = this;
            
            this.iframe.addEventListener('durationchange', function(e) {
                console.log('durationChange', e.target.duration);
                $(that.widget.containerNode).trigger('durationChange', {duration: e.target.duration});
            });
            
            this.iframe.addEventListener('progress', function(e) {
                $(that.widget.containerNode).trigger('progress', {time: e.target.bufferedTime});
            });
            
            this.iframe.addEventListener('timeupdate', function(e) {
                $(that.widget.containerNode).trigger('timeUpdate', {time: e.target.currentTime});
            });
            
            this.iframe.addEventListener('playing', function(e) {
                $(that.widget.containerNode).trigger('playing');
            });
            
            this.iframe.addEventListener('ended', function(e) {
                $(that.widget.containerNode).trigger('ended');
                        
                // set Loop parameter again since the one passed when creating the player seems to be ignored at this point        
                if (that.config['data-video-loop'] === 1) {
                    console.log('reached end of video, need to loop');
                    that._loop();
                }                                
            });
            
            this.iframe.addEventListener('error', function(e) {
                $(that.widget.containerNode).trigger('videoError', {error: e});
            });            
        },

        _loadOrCueVideoById: function(sig) {
            this.iframe.load(sig);
            
            if (this.config['data-video-autoplay']) {            
                this.iframe.play();
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
        
        pause: function() {
            this.paused = true;                    
            this.iframe.pause();
        },
        
        play: function() {
            this.paused = false;
            this.iframe.play();
        },        

        stop: function() {
            // seems like dailymotion doesn't provide a stop call so we use pause instead
            if (!this.iframe.paused) {
                this.pause();
            }
        },
        
        seekTo: function(secs) {
            this.iframe.seek(secs);
        },
        
        togglePlay: function() {
            console.log('DailyMotionPlayer::togglePlay()');
            if (this.paused) {
                this.play();
            } else {
                this.pause();
            }            
        },
        
        loadVideoById: function(sig, start) {
            var that = this;

            this.config['data-video-start'] = start || this.config['data-video-start'];
            
            console.log('loadVideoById', start, this.config['data-video-start']);
            
            if (!this.iframe) {
                console.log('DailyMotion::loadVideoById -> need to create Player first')
                this.config['data-video-sig'] = sig;
                
                player.createPlayer(this.config, this.htmlObj, this.widget, this.sourceAtt).done(function(iframe) {
                    console.log('oh oh... seems like the iframe is ready to communicate with us! let\'s call load with', sig);
                    that.htmlObj = $('#' + that.id);
                    that.iframe = iframe;
                    that._bindEvents();
                    
                    that.gotDuration = false;
                })
            } else {
                this.gotDuration = false;
                // if the video is playing, calling load() will automatically play the video with dailymotion,
                // even if autoplay has been set to 0 when loading the player
                this.stop();
                this._loadOrCueVideoById(sig);
            }
        },
        
        toggleMute: function() {
            this.iframe.toggleMute();
        },
        
        mute: function() {
            this.iframe.muted(1);        
        },
        
        hide: function() {
            $(this.htmlObj).hide();
        },
        
        show: function() {
            $(this.htmlObj).show();        
        },
        
        setVolume: function(vol) {
            this.iframe.setVolume(vol/100);
        },
        
        getVolume: function() {
            return this.iframe.volume * 100;
        }
    };

    // add ouverselves to the Video tag, and initialize Youtube API
    player.init();
})();