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

WAF.Widget.provide(
    'FileUpload',       
    {
        
    },
    function(config, data, shared) {
        
        this._private = {
            classes : {
                btnBrowse   : 'waf-fileUpload-btnBrowse',
                btnUpload   : 'waf-fileUpload-btnUpload',
                btnDelete   : 'waf-fileUpload-btnDelete',
                btnCardinal : 'waf-fileUpload-btnCardinal',
                filesList   : {
                    classname   : 'waf-fileUpload-fileList',
                    children    : {
                        table   : 'waf-fileUpload-fileList-table',
                        tr      : 'waf-fileUpload-fileItem',
                        tdname  : 'waf-fileUpload-fileItem-name',
                        tdbutton: 'waf-fileUpload-fileItem-button'
                    },
                    states      : {
                        popup   : 'waf-fileUpload-fileList-popup',
                        menu    : 'waf-fileUpload-fileList-menu'
                    }
                },
                tag         : {
                    classname   : 'waf-fileUpload',
                    children    : {
                        paragraph   : 'waf-fileUpload-paragraph'
                    }
                }
            },
            Files : function(files , theList){
                this.setFiles(files);
                this.setList(theList);
            }
        };
    },
    {
        disable: function(disable){
            var lw = this._getFULinkedWidgets(true),
            enable = disable === false,
            label = this.getLabel();
            
            for(var i in lw){
                lw[i][enable ? 'enable' : 'disable']();
            }
            
            if (label) {
                label[enable ? 'enable' : 'disable']();
            }
            
            this.$domNode.find('input[type=file]').prop('disabled',!enable);
            
            this[!enable ? 'addClass' : 'removeClass']('waf-state-disabled');
            this._disabled = !enable;
        },
        enable: function(){
            this.disable(false);
        },
        ready : function(){
            /**
             * Init runtime variables
             */
            var 
            that            = this,
            config          = that.config,
            htmlObj         = that.$domNode,
            _linkedWidgets  = that._getFULinkedWidgets(),
            classes         = that._private.classes,
            paragraph       = $('<p>' + (config['data-text']||'') + '</p>').addClass(classes.tag.children.paragraph),
            btnBrowse       = _linkedWidgets.btnBrowse ? _linkedWidgets.btnBrowse.css('z-index',1) : false,
            btnUpload       = _linkedWidgets.btnUpload ? _linkedWidgets.btnUpload.css('z-index',1) : false,
            btnDelete       = _linkedWidgets.btnDelete ? _linkedWidgets.btnDelete.css('z-index',1) : false,
            btnCardinal     = _linkedWidgets.btnCardinal ? _linkedWidgets.btnCardinal.css('z-index',1) : false,
            tabContainer    = _linkedWidgets.filesList ? _linkedWidgets.filesList.css('z-index',1).css('height','auto').css('overflow','visible') : false,
            upload          = $('<input id="' + that.id + '-upload" type="file" name="' + that.id + '-upload" multiple="true" style="opacity:0;position:absolute;z-index:0"></input>').appendTo(htmlObj),
            extraConfig     = {
                folder      : that.getFolderName(),
                replace     : false
            };
            
     
    
            if (that.source && that.source.getDataClass() && that.source.getDataClass().getName) {
                extraConfig.datasource  = {
                    dsname  : that.source.getDataClass().getName(),
                    id      : that.source.getCurrentElement()?that.source.getCurrentElement().getKey():null,
                    field   : that.sourceAtt.name,
                    saveOnDS: config['data-action'] === 'true'
                };
            }
            
            switch(config['data-listStyle']){
                case 'menu' :
                    break;
                case 'popup' :
                    if(!btnCardinal && tabContainer){
                        tabContainer.remove();
                        break;
                    }
                    if(!tabContainer){
                        break;
                    }
                    var position =  btnCardinal.position();
                    tabContainer.appendTo(btnCardinal.parent());
                    tabContainer.css('left',position.left + btnCardinal.width()/2 - tabContainer.width()/2);
                    tabContainer.css('top',position.top + btnCardinal.height() + 15);
                    btnCardinal.parent().css('overflow','visible');
                    break;
            }
            /**
             * init the shared.files class :
             */
            this._private.Files.prototype = {
                getFiles : function(){
                    return this._files;
                },
                setFiles : function(files){
                    var
                    maxSize,
                    maxFiles,
                    fileUnity,
                    tempFiles;
                    
                    maxFiles    = parseInt(config['data-maxfiles']);
                    maxSize     = parseFloat(config['data-maxfilesize']);
                    fileUnity   = config['data-maxfilesize-unity'].toLowerCase();
                    
                    switch(fileUnity){
                        case 'mb' :
                            maxSize *= 1024;
                        case 'kb' :
                            maxSize *= 1024;
                            break;
                    }
                    
                    if(maxFiles > -1 || maxSize > -1){
                        tempFiles = [];
                        
                        if(maxFiles > -1){
                            for (var i = 0,f; (f = files[i]) && (i < maxFiles); i++) {
                                if(maxSize > -1){
                                    if(f.fileSize && f.fileSize <= maxSize) {
                                        tempFiles.push(f);
                                    } else if(f.size && f.size < maxSize) {
                                        tempFiles.push(f);
                                    }
                                }
                                else{
                                    tempFiles.push(f); 
                                }
                            }
                        }
                        else{
                            for (i = 0,f; f = files[i]; i++) {
                                if(maxSize > -1){
                                    if(f.fileSize && f.fileSize <= maxSize) {
                                        tempFiles.push(f);
                                    } else if(f.size && f.size < maxSize) {
                                        tempFiles.push(f);
                                    }
                                }
                                else{
                                    tempFiles.push(f); 
                                }
                            }
                        }
                        
                        files = tempFiles;
                        
                    }
                    
                    if(that.source && files.length > 0){
                        files = [files[0]];
                    }

                    this._files     = this.toArray(files);
                    this._length    = this._files.length;
            
                    btnCardinal && btnCardinal.data('text','' + this._length) && btnCardinal.find('span').html(this._length);

                    if(this._length > 0 ){
                        btnDelete && btnDelete.show();
                        btnCardinal && btnCardinal.show();
                        btnUpload && btnUpload.show();
                        
                        if(tabContainer){
                            tabContainer.show();
                            tabContainer.css('opacity',1);
                            if(tabContainer.hasClass(classes.filesList.states.popup)){
                                tabContainer.stop();
                                tabContainer.animate({
                                    opacity : 0
                                },2000,function(){
                                    tabContainer.hide();
                                });
                            }
                        }
                        
                        htmlObj.removeClass('waf-state-dragover');
                        htmlObj.addClass('waf-state-notempty');
                    }
                    else if( this._length === 0){
                        btnDelete && btnDelete.hide();
                        btnCardinal && btnCardinal.hide();
                        tabContainer && tabContainer.hide();
                        btnUpload && btnUpload.hide();
                        htmlObj.removeClass('waf-state-dragover waf-state-notempty');
                    }
                    this.refreshList();
                },
                getList : function(){
                    return this._list;
                },
                setList : function(theList){
                    this._list = theList;
                    this._list.addClass(classes.filesList.classname);
                },
                removeIndex : function(index){
                    var files   = this.getFiles(),
                    temp    = [];
            
                    for (var i = 0, f; f = files[i]; i++) {
                        if(i!=index){
                            temp.push(f);
                        }
                    }
            
                    this.setFiles(                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              temp);
                },
                appendFiles : function(files){
                    if(!that.isDisabled()){
                        files = this.toArray(files).concat(this.getFiles());
                        this.setFiles(files);
                    }
                },
                refreshList : function(){
                    var theList = this.getList(),
                    files   = this.getFiles();
                
                    if(!theList){
                        return;
                    }
                    theList.empty();
            
                    for (var i = 0, f; f = files[i]; i++) {
                        var 
                        tr,
                        btn;
                            
                        tr  = $('<tr>').addClass(classes.filesList.children.tr);
                        btn = $('<button>').hide();
                        
                        tr.append($('<td>' + f.name + '</td>').addClass(classes.filesList.children.tdname));
                        tr.append($('<td>').addClass(classes.filesList.children.tdbutton).append(btn));
                        
                        btn.click(function(e){
                            var trClosest   = $(this).closest('tr'),
                            fileInfo        = trClosest.data('fileInfo');
                            that.fileSet.removeIndex(trClosest.index());
                        });
                        
                        tr.data('fileInfo' , {
                            file : f
                        });
                        
                        btn.data('trClosest' , tr);
                        
                        theList.append(tr);
                    }
            
                },
                removeAll : function(){
                    var 
                    uploadTmp,
                    tmp;
                    
                    this.setFiles([]);
                    
                    tmp         = document.getElementsByName(that.id + "-upload")[0];
                    tmp.value   = "";
                    uploadTmp   = tmp.cloneNode(false);
                    
                    uploadTmp.onchange= tmp.onchange;
                    tmp.parentNode.replaceChild(uploadTmp,tmp);
                    
                    upload = uploadTmp;
                },
                toArray : function(files){
                    if(!files){
                        return this._files;
                    }
                    var res = [];
                    for (var i = 0, f; f = files[i]; i++) {
                        res.push(f);
                    }
                    return res;
                },
                getFilesInfo : function(){
                    var res     = {
                        folder  : that.getFolderName(),
                        files   : []
                    },
                    files   = this.getFiles();
                    for (var i = 0, f; f = files[i]; i++) {
                        var item = {
                            name    : f.name,
                            size    : f.size,
                            type    : f.type
                        };
                        res.files.push(item);
                    }
                    return res;
                },
                uploadFiles : function() {
                    that._sendFiles(that.fileSet.getFilesInfo() , that.fileSet.getFiles() , extraConfig);
                }
            };
            
            that.filesTab       = $('<table></table>').addClass(classes.filesList.children.table);
            that.fileSet        = new that._private.Files([] , that.filesTab);
            
            /**
             * Init the design :
             */
            paragraph.css({
                'padding-top'   : that.getHeight()/2 - 7
            });
            
            that._private.paragraph = paragraph;
            
            paragraph.appendTo(htmlObj);
            that.filesTab.appendTo(tabContainer);

            /*
             * Init events :
             */
            $(document).on('mouseenter', '.' + classes.filesList.children.tr, function(e){
                if(!that.isDisabled()){
                    $(this).children('.' + classes.filesList.children.tdbutton).children().show();
                    $(this).addClass('waf-state-hover');
                }
            });
              
            $(document).on('mouseleave', '.' + classes.filesList.children.tr, function(e){
                if(!that.isDisabled()){
                    $(this).children('.' + classes.filesList.children.tdbutton).children().hide();
                    $(this).removeClass('waf-state-hover');
                }
            });
            

            btnUpload && btnUpload.click(function(){
                extraConfig.folder = that.getFolderName();
                that._sendFiles(that.fileSet.getFilesInfo() , that.fileSet.getFiles() , extraConfig);
            });
    
            btnDelete && btnDelete.click(function(){
                that.fileSet.removeAll();
            });

            btnBrowse && btnBrowse.click(function(){
                upload.click();
            });  
        
            $(document).on('change', '#' + that.id + '-upload', function(e){
                that.fileSet.appendFiles(this.files);
                if(config['data-autoUpload'] === 'true'){
                    extraConfig.folder = that.getFolderName();
                    that._sendFiles(that.fileSet.getFilesInfo() , that.fileSet.getFiles() , extraConfig);
                }
            }); 
        
            btnCardinal && btnCardinal.hover(function(e){
                if(tabContainer && tabContainer.hasClass(classes.filesList.states.popup)){
                    tabContainer.stop();
                    tabContainer.show();
                    tabContainer.css('opacity',1);
                }
            },function(){
                if(tabContainer && tabContainer.hasClass(classes.filesList.states.popup)){
                    tabContainer.stop();
                    tabContainer.animate({
                        opacity : 0
                    },1000,function(){
                        tabContainer.hide();
                    });
                }
            });
        
            $('.' + classes.filesList.states.popup).hover(function(e){
                $(this).stop();
                $(this).show();
                $(this).css('opacity',1);
            },function(){
                $(this).stop();
                $(this).animate({
                    opacity : 0
                },1000,function(){
                    $(this).hide();
                });
            });

            function handleFileSelect(evt) {
                evt.stopPropagation();
                evt.preventDefault();

                var files = evt.dataTransfer.files; // FileList object.
                that.fileSet.appendFiles(files);
                if(config['data-autoUpload'] === 'true'){
                    extraConfig.folder = that.getFolderName();
                    that._sendFiles(that.fileSet.getFilesInfo() , that.fileSet.getFiles() , extraConfig);
                }
            }
            function handleDragOver(evt) {
                htmlObj.addClass('waf-state-dragover');
                evt.stopPropagation();
                evt.preventDefault();
            }
            var dropZone = document.getElementById(this.id);
            if(dropZone){
                dropZone.addEventListener('dragover', handleDragOver, false);
                dropZone.addEventListener('drop', handleFileSelect, false);
            }
        },
        _notify: function ( title, text ) {
            if ($('#waf-notify-container').length === 0) {
                $('<div>').prop('id', 'waf-notify-container').appendTo('body');
            }

            if ($('#waf-notify').length === 0) {
                $('<div>').prop('id', 'waf-notify').appendTo('#waf-notify-container');
                $('#waf-notify').html('<a class="ui-notify-close ui-notify-cross" href="#">x</a><h1>#{title}</h1><p>#{text}</p>');
            }

            var $container = $("#waf-notify-container").notify();
            $container.notify("create", 'waf-notify', {
                title: title, 
                text: text
            });


        },
        _sendFiles : function(filesInfo, files, config){
            var that = this;
            if(that.source && config.datasource){
                config.datasource.id = that.source.getCurrentElement().getKey();
            }
            
            if(files.length < 1) {
                alert("Select a file to upload.");
            } else {
                var theForm     = new FormData(),
                xhr             = that._getXMLHttpRequest();
                            
                for(var i = 0, max = files.length; i < max; ++i) {
                    theForm.append("filesToUpload", files[i]);
                }

                xhr.addEventListener("load", function (evt) {
                    var
                    responseObj = {
                        response : JSON.parse(evt.target.responseText)
                    };
                    
                    if(responseObj.response.error && responseObj.response.error.length > 0){
                        try{
                            var
                            serverResponse = JSON.parse(xhr.responseText);

                            WAF.ErrorManager.displayError(serverResponse, null, {
                                modal: true, 
                                title: 'File Upload Error'
                            });
                        }
                        catch(e){
                            WAF.ErrorManager.displayError({
                                error : [],
                                message : 'Error : Files not uploaded'
                            });
                        }
                        
                        return;
                    }
                    
                    if(that.config['data-notification'] === 'true'){
                        that._notify('File(s) uploaded','File(s) uploaded successfully');
                    }
                    that.events && that.events.filesUploaded && that.events.filesUploaded(responseObj);
                    that.source && that.source.serverRefresh();
                    that.fileSet.removeAll([]);
                }, false);

                xhr.addEventListener("error", function(evt) {
                    alert("An error occurred while trying to upload the file.");
                }, false);

                xhr.addEventListener("abort", function(evt) {
                    alert("The upload was cancelled by the user or the connection was interrupted by the browser.");
                }, false);

                // Open xhr
                xhr.open('post', '/waUpload/upload', true);
                
                if(that.config['data-userAction'] === 'Ask the user'){
                    
                    $.ajax({
                        type: 'POST',
                        url: '/waUpload/verify',
                        data: { 
                            filesInfo : JSON.stringify(filesInfo)
                        }
                    })
                    .done(function(data, textStatus, jqXHR){
                        var
                        serverResponse  = JSON.parse(jqXHR.responseText),
                        opts = {
                            yesOption : function(){
                                config.replace = true;
                                theForm.append('config',JSON.stringify(config));
                                xhr.send(theForm);
                            },
                            noOption : function(){
                                config.replace = false;
                                theForm.append('config',JSON.stringify(config));
                                xhr.send(theForm);
                            }
                        };
                        if(serverResponse && serverResponse.conflicts && serverResponse.conflicts.length && serverResponse.conflicts.length > 0 ){
                            that.events && that.events.filesExists && that.events.filesExists(serverResponse);
                            that._confirm('Server Message',serverResponse.conflictMessage,opts);
                        }
                        else{
                            theForm.append('config',JSON.stringify(config));
                            xhr.send(theForm);
                        }
                    })
                    .error(function(xhr, textStatus, jqXHR){
                        try{
                            var
                            serverResponse = JSON.parse(xhr.responseText);

                            WAF.ErrorManager.displayError(serverResponse, null, {
                                modal: true, 
                                title: 'File Upload Error'
                            });
                        }
                        catch(e){
                            WAF.ErrorManager.displayError({
                                error : [],
                                message : 'Error : Files not uploaded'
                            });
                        }
                    });
                }
                
                else{
                    config.replace = that.config['data-userAction'] === 'Replace';
                    theForm.append('config',JSON.stringify(config));
                    xhr.send(theForm);
                }
                
            }
        },
        _getXMLHttpRequest : function() {
            var xhr = null;

            if (window.XMLHttpRequest || window.ActiveXObject) {
                if (window.ActiveXObject) {
                    try {
                        xhr = new ActiveXObject("Msxml2.XMLHTTP");
                    } catch(e) {
                        xhr = new ActiveXObject("Microsoft.XMLHTTP");
                    }
                } else {
                    xhr = new XMLHttpRequest(); 
                }
            } else {
                alert("Your browser does not support the XMLHTTPRequest object...");
                return null;
            }

            return xhr;
        },
        _confirm : function(title , message , opts){
            var that = this,
            dialog = $('#waf-confirm-container');
            if ($('#waf-confirm-container').length === 0) {
                dialog = $('<div>');
                dialog.prop('id', 'waf-confirm-container');
                dialog.prop('title', title);
                dialog.appendTo($('#'+that.id));
            }
        
            dialog.empty();
            $('<p>' + message + '</p>').appendTo(dialog);
        
            $('#waf-confirm-container').dialog({
                width   : 400,
                close     : function(event, ui) {
                    $(this).dialog('destroy');
                },
                buttons: [
                {
                    text: "Replace",
                    click: function(){
                        opts.yesOption.call();
                        $(this).dialog('close');
                    }
                },
                {
                    text: "Rename",
                    click: function(){
                        opts.noOption.call();
                        $(this).dialog('close');
                    }
                },
                {
                    text: "Cancel",
                    click : function(){
                        $(this).dialog('close');
                    }
                }
                ]
            });
        },
        _getFULinkedWidgets : function(isWakWidget){
            var
            widgets,
            linkedTags,
            tag = this,
            classes = tag._private.classes;
            
            if(tag._private.FULinkedWidgets){
                return tag._private.FULinkedWidgets;
            }
            
            linkedTags  = tag.getLinks();
            widgets     = {};
            
            for (var i = 0, widget; linkedTags && linkedTags.length && i<linkedTags.length ; i++) {
                widget = linkedTags[i];
                
                if(!widget){
                    continue;
                }
                
                var htmlObj = widget.$domNode;
                
                switch(true){
                    case htmlObj.hasClass(classes.filesList.classname):
                        widgets.filesList = isWakWidget ? widget : widget.$domNode;
                        break;
                    case htmlObj.hasClass(classes.btnBrowse):
                        widgets.btnBrowse = isWakWidget ? widget : widget.$domNode;
                        break;
                    case htmlObj.hasClass(classes.btnUpload):
                        widgets.btnUpload = isWakWidget ? widget : widget.$domNode;
                        break;
                    case htmlObj.hasClass(classes.btnDelete):
                        widgets.btnDelete = isWakWidget ? widget : widget.$domNode;
                        break;
                    case htmlObj.hasClass(classes.btnCardinal):
                        widgets.btnCardinal = isWakWidget ? widget : widget.$domNode;
                        break;
                }
            }
            
            return widgets;
        },
        
        uploadFiles : function() {
            return this.fileSet.uploadFiles();
        },
        
        getFiles : function(){
            return this.fileSet.getFiles();
        },
        setFiles : function(files){
            return this.fileSet.setFiles(files);
        },
        getList : function(){
            return this.fileSet.getList();
        },
        setList : function(list){
            this.fileSet.setList(list);
        },
        removeFile : function(index){
            return this.fileSet.removeIndex(index - 1);
        },
        appendFiles : function(files){
            return this.fileSet.appendFiles(files);
        },
        refreshList : function(){
            return this.fileSet.refreshList();
        },
        removeAll : function(){
            return this.fileSet.removeAll();
        },
        toArray : function(files){
            return this.fileSet.toArray(files);
        },
        getFileUploadText: function(){
            return this.config['data-text'];
        },
        setFileUploadText: function(desc){
            this.config['data-text'] = desc;
            this._private && this._private.paragraph && this._private.paragraph.html(this.config['data-text']);
        },
        setNotificationStatus : function(status){
            if(status){
                this.config['data-notification'] = 'true';
            }
            else{
                this.config['data-notification'] = 'false';
            }
        },
        setFolderName : function(folder){
            this.config['data-folder'] = folder;
        },
        getFolderName : function(){
            return this.config['data-folder'];
        },
        getMaximumFiles : function(){
            if(this.config['data-maxfiles'] == '-1'){
                return 'unlimited';
            }
            
            return this.config['data-maxfiles'];
        },
        setMaximumFiles : function(max){
            var
            files   = this.getFiles();
            
            if(isNaN(max)){
                throw 'Error: the maximum must be a valid number';
            }
            
            this.config['data-maxfiles'] = max;
            this.setFiles(files);
        },
        getMaximumFileSize : function(){
            if(this.config['data-maxfilesize'] == '-1'){
                return 'unlimited';
            }
            
            return this.config['data-maxfilesize'] + ' ' + this.config['data-maxfilesize-unity'];
        },
        setMaximumFileSize : function(max, unity){
            var
            files   = this.getFiles();
            
            // if unity is not passed or '' => no change
            // Example:	setMaximumFileSize(300, 'kb'); => max 300 kb
            // then 	setMaximumFileSize(200) => max 200 Kb
            unity = unity ? unity : this.config['data-maxfilesize-unity'];
            
            this.config['data-maxfilesize'] = max;
            this.config['data-maxfilesize-unity'] = unity;
            
            this.setFiles(files);
        },
        getServerMaximumFiles : function (callback) {
            $.post('/waUpload/getServerMaximumFileSize', function(data) {
                callback(data);
            });
        },
        getServerMaximumFileSize : function (callback) {
            $.post('/waUpload/getServerMaximumFileSize', function(data) {
                callback(data);
            });
        }
    });
