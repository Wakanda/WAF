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
WAF.Widget.provide(

    /**
     *      
     * @class TODO: give a name to this class (ex: WAF.widget.DataGrid)
     * @extends WAF.Widget
     */
    'ProgressBar',   
    {        
    },
    /**
     * @constructor
     * @param {Object} inConfig configuration of the widget
     */

    /**
     * The constructor of the widget
     *
     * @shared
     * @property constructor
     * @type Function
     **/
    function WAFWidget(config, data, shared) {   
        var htmlObject,
        dontdisplayempty,
        ss,
        clone,
        cloneMsg;

        htmlObject  = $(this.containerNode); 
        
        dontdisplayempty        = false;
        ss                      = data['no-empty-display'];
        
        this.progressInfo     = data['progressinfo'];
        this.toph             = 25;
        this.barh             = 20;
        this.spaceh           = 5;
        this.nblevel          = 0;
        this.stillWaiting     = false;

        this.parent           = htmlObject.parent();
        this.top              = htmlObject.css('top');

        var inDesign = (typeof Designer !== 'undefined');
        if (!inDesign)
        {
            clone                   = htmlObject.clone();
            cloneMsg                = $('[for=' + this.id + ']').clone();
        
            /*
             * Remove original progressBar
             */
            htmlObject.hide();
            $('[for=' + this.id + ']').hide();
    
            this.clone = {
                progress : clone,
                msg : cloneMsg
            }
    
            if (ss != null) {
                if (typeof(ss) == 'string') {
                    dontdisplayempty = ss.toLowerCase() == 'true';
                } else {
                    dontdisplayempty = ss;
                }
            }
    
            this.atLeastOne = !dontdisplayempty;
    
            this.timerStarted = false;
    
            if (this.atLeastOne) {
                this.updateWithInfo({
                    SessionInfo: [{
                        fMessage    : "",
                        fValue      : 0,
                        fMax        : 100
                    }]
                })
            }
        }

    },{
        progress : function(value, max, message) {
            value = value || 0;
            if (max == null)
            {
                max = this.topMax || 100;
            }
            if (message == null)
            {
                if (this.topMessage == null)
                    this.topMessage = this.clone.msg.html();
                message = this.topMessage || "";            
            }
            this.topValue = value;
            this.topMax = max;
            this.topMessage = message;
            var config = { SessionInfo:[{fValue: value, fMax: max, fMessage: message}]};
            this.updateWithInfo(config);
        },
        stopProgress: function() {
            var config = { SessionInfo:[{fValue: 0, fMax: 100, fMessage: "", stop:true}]};
            this.updateWithInfo(config);
        },
        setValue : function(value, max, message) {
            this.progress(value, max, message)
        },
        getValue : function()
        {
            return this.topValue || 0;
        },
        updateWithInfo  : function (config) {
            var
            i,
            widget,
            range,
            sessions,
            nblevel,
            top,
            newProgress,
            newMsg,
            session,
            message,
            reg,
            percent;
            
            config          = config || {};
            widget          = this;
            range           = {};
            sessions        = config.SessionInfo;
            nblevel         = sessions == null ? 0 : sessions.length;
            top             = 0;
            newProgress     = {};
            newMsg          = {};

            widget.nbsessions   = 0;
            widget.nbsessions   = nblevel;   
            
            if (typeof Designer === 'undefined') {
                for (i = 0; i < nblevel; i++) {
                    session = sessions[i];
                    message = session.fMessage;
                    reg     = new RegExp("({curValue})", "g");
    
                    percent = Math.round((session.fValue/session.fMax)*100) + '%';
    
                    if ($('.' + widget.id + '-progress-' + i).length === 0) {
                        newProgress = widget.clone.progress.clone();
                        newMsg = widget.clone.msg.clone();
    
                        newProgress.addClass(widget.id + '-progress-' + i);
                        newMsg.addClass(widget.id + '-msg-' + i);
    
                        widget.parent.append(newProgress);
                        widget.parent.append(newMsg);
                    } else {
                        newProgress = $('.' + widget.id + '-progress-' + i);
                        newMsg = $('.' + widget.id + '-msg-' + i);
    
                        if (session.stop) {
                            if (widget.atLeastOne && i === 0) {
                            }
                            else {
                                newProgress.remove();
                                newMsg.remove();
                                return false;
                            }
                        }
                    }
            
                    newProgress.css('top', parseInt(widget.top) + top + 'px');
    
                    if (newMsg.offset()) {
                        newMsg.css('top', parseInt(widget.top) + top - 20 + 'px');
                    }
    
                    range = newProgress.children('.waf-progressBar-range');
    
                    widget.stillWaiting = false;
    
                    if (message == "" || message == null)
                        message = newMsg.html();
                        
                    message = message.replace(reg, '<b>'+WAF.utils.formatNumber(session.fValue, {
                        format:"###,###,###,###,###"
                    })+'</b>');
    
                    reg = new RegExp("({maxValue})", "g");
                    message = message.replace(reg, WAF.utils.formatNumber(session.fMax, {
                        format:"###,###,###,###,###"
                    }));
    
                    // get linked label and change the description
                    newMsg.html(message);
    
                    if (range.length === 0) {
                        // add range div
                        var height  = newProgress.height();
                        range = $('<div class="waf-progressBar-range" style="line-height: ' + height + 'px;-webkit-background-size: ' + height + 'px ' + height + 'px;-moz-background-size: ' + height + 'px ' + height + 'px; -webkit-animation: waf-progressBar-animation 10s linear infinite;"><span>' + percent + '</span></div>')
                        .appendTo(newProgress);
                    }
    
    
                    range.css({
                        'width' : percent
                    })
                    .children('span').html(percent);
    
    
                    top += widget.toph;
                    top += widget.barh+widget.spaceh;
                }
            }
        },
        startListening  : function (interval) {
            var 
            widget;

            widget = this;
            
            if (interval == null) {
                interval = 1000;
            }
            if (!widget.timerStarted) {
                widget.stillWaiting = true;
            }
            widget.timeOutId = setInterval(function() {
                var
                xhr;


                
                if (!widget.requestStarted) {
                    xhr = new XMLHttpRequest();

                    xhr.onreadystatechange = function() {
                        var
                        rep,
                        pinfo;
                        
                        if (xhr.readyState  == 4) {
                            widget.nbsessions = 0;
                            rep = xhr.responseText;

                            if (rep != null) {
                                pinfo = JSON.parse(rep);
                                
                                if (pinfo.ProgressInfo != null) {
                                    widget.updateWithInfo(pinfo.ProgressInfo[0]);
                                }
                                
                                widget.requestStarted = false;
                            }
                        }
                    };

                    widget.requestStarted = true;
                    if (window.location.origin != null)
                        xhr.open("GET", window.location.origin+"/rest/$info/progressinfo/" + widget.progressInfo, true);
                    else
                        xhr.open("GET", "/rest/$info/progressinfo/" + widget.progressInfo, true);
                    xhr.send();
                }

            }, interval);

            widget.timerStarted = true;
            
        },
        stopListening  : function () {
            var 
            widget;
            
            widget = this;

            if (widget.timerStarted && widget.timeOutId != null) {
                clearInterval(widget.timeOutId);
                widget.timeOutId    = null;
                widget.timerStarted = false;
                widget.stillWaiting = false;

                if (widget.atLeastOne) {
                    widget.updateWithInfo({
                        SessionInfo: [{
                            fMessage: "",
                            fValue: 0,
                            fMax: 100,
                            stop: true
                        }]
                    });
                } else {
                    widget.updateWithInfo({});
                }
            }
            
        },
        setProgressInfo  : function (config) {
            var 
            widget;
            
            widget = this;
            widget.stopListening();
            widget.progressInfo = config;            
        },
        userBreak  : function () {
            var 
            widget,
            xhr;
            
            widget  = this;
            xhr     = new XMLHttpRequest();
            xhr.open("GET", "/rest/$info/progressinfo/"+widget.progressInfo+'?$stop="true"', true);
            xhr.send();
        }
    }
    );