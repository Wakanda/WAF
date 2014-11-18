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
    'AutoForm',    
    {
    },
    function WAFWidget(config, data, shared) {
        var
        i,
        that,
        source,
        nameList,
        attrList,
        errorDiv,
        mustDisplayError,
        divID,
        options,
        htmlObject,
        oldAF,
        oldAFLength;
        
        that                = this;
        htmlObject          = $(this.containerNode);
        source              = this.source;
        nameList            = [];
        attrList            = [];
        errorDiv            = config['data-errorDiv'];
        mustDisplayError    = config['data-display-error'];
        divID               = config['id'];
        options             = config.options ? config.options : {};

        if (mustDisplayError == null) {
            mustDisplayError = true;
        } else {
            mustDisplayError = (mustDisplayError == '1' || mustDisplayError == 'true');
        }
        
        options.mustDisplayError = mustDisplayError;
        options.errorDiv = errorDiv;
        
        /*
         * Display autormform with widgets
         */ 
        if (data['withoutTable'] === "true"){
            options.withoutTable = true;
        }

        if (data['resize-each-widget'] === "true"){
            options.allowResizeInput = true;
        }
        
        if (source != null || typeof Designer !== 'undefined') {
            
            /*
             * Getting the names list
             */
            if(data['column-name']) {
                nameList = data['column-name'].split(',')
            }

            /*
             * Getting the attributes list
             */
            if(data['column-attribute']) {
                attrList = data['column-attribute'].split(',')
            }

            if (data['columns'] != null && data['columns'] != '' && !data['column-name'] ) {
                attrList = data['columns'].split(',');
                nameList = data['columns'].split(',');
            }            
            
            /*
             * Call autoform build method
             */
            oldAF = WAF.AF.buildForm(divID, source, attrList, nameList, options );            
            
            /*
             * Append old AF attributes and functions
             */
            for (i = 0; i <= oldAFLength; i += 1) {            
                if (!that[i]) {
                     that[i] = oldAF[i];
                }
            }            
            
            /*
             * Allow to resize subelements
             */
            if (this.addResizeOnSubWidgets != null) {
                this.addResizeOnSubWidgets();
            }            
            
            /*
             * Collapse to display sub Autoforms
             */
            htmlObject.find('.waf-form-att-label-rel.waf-expandable,.attribute-rel').bind('click', {widget : that}, function(e) {
                var
                attNo,
                formID,
                widget,
                htmlObject;
                
                widget      = e.data.widget;        
                htmlObject  = $(this);
                
                /*
                 * Collapse for autoform with table
                 */
                if (widget.config['data-withoutTable'] == 'false') {
                    htmlObject.toggleClass('expanded waf-state-active');

                    attNo = parseInt(htmlObject.data("att-id"));
                    that.toggleAttribute2(widget.id, attNo, e.shiftKey);
                    
                /*
                 * Collapse for autoform without table
                 */
                } else {
                    attNo   = htmlObject.data('att-id');
                    formID  = widget.id;

                    if (attNo != null && formID != null) {
                        attNo = parseInt(attNo);
                    }

                    if (widget != null) {
                        that.toggleAttribute(formID, attNo);
                    }
                }
            });     
			htmlObject.find('.waf-form-att-label-rel.waf-expandable,.attribute-rel').each(function(index) {
				$(this).prev().bind("click", function(event) {
					//Simulate click on expandable icon
					$(this).next().click();
					event.stopPropagation();
					event.preventDefault();
				});
			});
            
                        
        /*
         * Display a message to indicate that the widget is not binded
         */
        } else {
            $('<div class="waf-autoForm-missingBinding">Datasource is either missing <br>or <br>invalid</div>').appendTo(htmlObject);
        }
        
        if (data.draggable == 'true') {
            htmlObject.children('.waf-widget-header,.waf-widget-footer').css('cursor', 'pointer');
        }
        
    }, {   
        /*
         * List of the subForms
         */
        _subWidgets : {},
        
        /*
         * Resize method called during resize
         * @method onResize
         */
        onResize : function autoform_resize() {  
            var
            width,
            height,
            newHeight,
            htmlObject;
            
            /*
             * Resize autoform body
             */
            htmlObject  = $(this.containerNode);
            width       = htmlObject.width();
            height      = htmlObject.height();
            newHeight   = height - parseInt(htmlObject.find('.waf-widget-footer').css('height'));
            newHeight  -= parseInt(htmlObject.find('.waf-widget-header:first').css('height'));
            
            htmlObject.find('.waf-widget-body:first').css('width', width);
            htmlObject.find('.waf-widget-body:not(:first)').css('width', '100%');
            htmlObject.find('.waf-widget-body:first').css('height',  newHeight + 'px');
            
            this.afterResize();
        },
        
        /*
         * After resize method
         * @method afterResize
         * @param {string} formdiv
         * @param {boolean} withToolBar
         */
        afterResize : function autoform_after_resize(formdiv, withToolBar) {
            var 
            headerDom, 
            bodyDom, 
            footerDom,
            formHeight,
            headerHeight,
            footerHeight;

            if (formdiv == null) {
                if (this.withoutTable) {
                    formdiv         = this.$domNode;
                    withToolBar     = this.withToolBar;
                    headerDom       = this.headerDom;
                    bodyDom         = this.bodyDom;
                    footerDom       = this.footerDom;
                }
            } else {
                headerDom   = $('.waf-widget-header', formdiv);
                bodyDom     = $('.waf-form-body', formdiv);
                footerDom   = $('.waf-widget-footer', formdiv);
            }	

            if (formdiv != null) {
                formHeight      = formdiv.height();				
                headerHeight    = headerDom.outerHeight();
                footerHeight    = 0;

                if (withToolBar) {
                    footerHeight = footerDom.outerHeight();
                }

                bodyDom.height(formHeight-footerHeight-headerHeight);
            }
        },
        
        
        /*
         * Stop Resize method called on stop resize
         * @method stopResize
         */
        stopResize : function autoform_stop_resize() {   
        },
        
        /*
         * Start Resize method called on stop resize
         * @method startResize
         */
        startResize : function autoform_stop_resize() {   
        },       
        
        /*
         * Remove an entity from the dataSource
         * @method dropEntity
         */
        dropEntity  : function autoform_drop_entity() {
            var
            source;

            source = this.source;

            if (source) {
                if (source.getCurrentElement() != null) {
                    source.removeCurrent();
                } else {
                    this.clear();
                }
            }
        },
        
        /*
         * Clear the autoform content
         * @method clear
         */
        clear   : function autoform_clear() {
            var 
            i,
            attList,
            att,
            xLength,
            pos,
            element;            
    
            attList = this.attList;

            this.purgeErrorMessagesOnForm();    

            for (i = 0; i < attList.length; i++) {
                att = this.atts[i];

                if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias"){
                    element = document.getElementById(this.id + "_" + idName(attList[i]));
                    if (element) {
                        element.value = "";
                    }
                }
            }

            if (this.withToolBar) {
                xLength = this.source.length;
                    pos = 0;
                    if (this.source.getCurrentElement() != null) {
                        pos = (this.source.getPosition() + 1);
                    }

                    $('#' + this.id + ' .waf-status-right').html(pos + " / " + xLength);
            }
            
        },
        
        /*
         * Fill the autoform content
         * @method fill
         */
        fill : function autoform_fill() {
            var
            i,
            attList,
            xLength,
            sourceAtt,
            htmlobj;

            attList = this.attList;
            
            this.purgeErrorMessagesOnForm();
            
            for (i = 0; i < attList.length; i++)  {
                sourceAtt   = this.sourceAtts[i];

                if (sourceAtt != null) {
                    if (sourceAtt.simple)  {
                        htmlobj = document.getElementById(this.id + "_" + idName(attList[i]));

                        if (htmlobj.isInFocus) {
                            htmlobj.value = sourceAtt.getValueForInput(); //form.source[att.name];
                        } else  {
                            htmlobj.value = htmlobj.getFormattedValue();
                        }
                    }
                }
            }

            if (this.withToolBar)   {
                xLength = this.source.length;

                $('#' + this.id + ' .waf-status-right').html((this.source.getPosition() + 1) + " / " + xLength);
            }
        },
        
        /*
         * Open the form in a panel
         * @method openAsPanel
         */
        openAsPanel:  function autoform_open_as_panel() {
            var
            htmlObject,
            already,
            off,
            h,
            w,
            title;

            htmlObject = this.$domNode;
            already = htmlObject.data("inPanel");

            if (already == "1") {
                htmlObject.dialog("open");
            } else {	
                htmlObject.data("inPanel", "1");

                off = htmlObject.offset();
                h   = htmlObject.height();
                w   = htmlObject.width();

                htmlObject.css('position', 'relative');
                htmlObject.css('top','0px');
                htmlObject.css('left','0px');

                title = htmlObject.find(".autoForm-title").html();

                htmlObject.dialog({ 
                    dialogClass : 'waf-widget-panel autoForm-panel ' + htmlObject.prop('class'),
                    title       : title,
                    position    : [off.left, off.top],
                    width       : w,
                    resize      : function(event, ui) {
                        var
                        h,                
                        offsettop,
                        filler;

                        offsettop   = $(this).position().top;
                        filler      = $(this).find('.autoForm-filler').not('.included tr');

                        filler.hide();

                        h           = $(this).find('table').height() + offsettop;

                        if (h < ui.size.height) {
                            filler.height(ui.size.height - h);
                            filler.show();
                        }
                    }
                });

                htmlObject.css('width','auto');
                htmlObject.css('height','auto');
            }
        },
        
        
        /*
         * Display or hide autoform attribute widget (without table)
         * @method toggleAttribute
         * @param {string} divID : id of the sub element
         * @param {string} attID : attribute of the sub element into the autoform
         */
        toggleAttribute : function autoform_toggle_attribute(divID, attID) {
            var
            i,
            h,
            w,
            nb,
            form,
            dataTheme,
            inAPanel,
            tmpForm,
            attribute,
            subID,
            subsource,
            parentDivID,
            maxw,
            objdiv,
            needrecalc,
            sourceID,            
            subattlist,
            subcolumns,
            att,    
            expandDiv,
            widget,
            subWidget,
            rowDiv,
            imgDiv,
            parentWidth;

            widget      = form = this;
            dataTheme   = form.dataTheme;
            inAPanel    = false;

            if (form == null) {
                return null;
            }

            attribute   = form.atts[attID];	
            subID       = widget.id + '-subWidget' + attID;
            subWidget   = widget._subWidgets[subID];
            parentDivID = divID + '_' + attribute.name;
            rowDiv      = $("#" + divID + "_att_" + attID);
            expandDiv   = $('.waf-expandable', rowDiv);
            
            if (!subWidget) {         
                
                expandDiv.removeClass('waf-collapsed');
                expandDiv.addClass('waf-expanded');

                if(attribute.kind == 'relatedEntity') {
                    
                    sourceID = subID + "_source";
                    subsource = WAF.dataSource.create({
                        id      : sourceID, 
                        binding : form.source.getID() + "." + attribute.name
                    });

                    // Get the id of the first form
                    if (form.parent) {
                        tmpForm = form;

                        while(tmpForm.parent) {
                            tmpForm = tmpForm.parent.form;
                        }
                    }
                    
                    objdiv = $('<div />');

                    objdiv.prop({
                        id              : subID,
                        'class'         : dataTheme+" waf-autoForm"
                    })
                    .data('theme', dataTheme)
                    .css({
                        'background-color'  : $('#' + divID).css('background-color'),
                        'border'            : $('#' + divID).css('border')
                    });

                    objdiv.appendTo('#' + parentDivID);
                    
                    if(this.config['data-resize-optimal-each-widget'] === 'true') {
						objdiv.width($('#' + divID).width() - objdiv.position().left - 5);
					}

                    form.relForms[attribute.name]   = subWidget;
                    form.relSources[sourceID]       = subsource;

                    /*
                     * Initialize autoform widget
                     */
                    subWidget     = new WAF.widget.AutoForm({
                        'id'            : subID,
                        'class'         : widget.config['class'],
                        'data-binding'  : subsource._private.id,
						'data-resize-optimal-each-widget' : this.config['data-resize-optimal-each-widget'],
                        'options'       : {
                            toolBarForRelatedEntity : form.level == 1,
                            noToolBar               : form.level > 1,
                            formTitle               : attribute.name,
                            checkIdentifying        : form.level == 1,
                            level                   : form.level+1,
                            allReadOnly             : form.level > 1,
                            included                : !inAPanel,
                            inAPanel                : inAPanel,
                            withoutTable            :form.withoutTable,
                            allowResizeInput        : form.allowResizeInput,
                            parent                  : {
                                form        : form, 
                                att         : attribute, 
                                sourceAtt   : form.sourceAtts[attID]
                            }
                        }
                    });

                    if (inAPanel){
                        this.openAsPanel()
                    } else {

                        if (subWidget.withoutTable) {
                            needrecalc  = false;
                            h           = objdiv.outerHeight();

                            if (h > 400) {
                                objdiv.height(400);
                                needrecalc = true;		
                            }

                            w       = objdiv.outerWidth() + 30;
                            maxw    = form.bodyDom.innerWidth() - objdiv.position().left - 5;

                            if (maxw > 150 && maxw < w){
                                objdiv.width(maxw);
                            } else {
                                objdiv.width(w);
                            }

                            objdiv.resizable({
                                //minHeight: parseInt($('#' + config.id).css('height')),
                                //minWidth: parseInt($('#' + config.id).css('width')),
                                resize : function(event, ui) {
                                    var
                                    newHeight;

                                    $('.waf-widget-body:first', objdiv).css('width', parseInt(objdiv.css('width')));
                                    $('.waf-widget-body:not(:first)', objdiv).css('width', '100%');

                                    newHeight   = parseInt(objdiv.css('height')) - parseInt($('.waf-widget-footer', objdiv).css('height'));
                                    newHeight  -= parseInt($('.waf-widget-header:first', objdiv).css('height'));

                                    $('.waf-widget-body:first', objdiv).css('height',  newHeight+ 'px');

                                    subWidget.onResize();
                                }
                            });

                            if (subWidget.addResizeOnSubWidgets != null) {
                                subWidget.addResizeOnSubWidgets();
                            }

                            if (needrecalc) {
                                subWidget.onResize();
                            }
                            
							if (this.config['data-resize-optimal-each-widget'] === 'true') {
								this.resizeParentWidget(objdiv);
							}
                        }
                    }
                    
                    subsource.resolveSource();
                        
                } else if (attribute.kind == 'relatedEntities') {
                   
                    sourceID    = subID + "_source";
                    subsource   = WAF.dataSource.create({
                        id      : sourceID, 
                        binding : form.source.getID() + "." + attribute.name
                    });

                    objdiv = $('<div />');

                    objdiv.prop({
                        id              : subID,
                        'class'         : 'waf-widget waf-dataGrid AF_autoGridGen ' + dataTheme
                    })
                    .data({
                        'type'     : 'dataGrid',
                        'theme'    : dataTheme
                        
                    })
                    .css({
                        'background-color'  : $('#' + divID).css('background-color'),
                        'border'            : $('#' + divID).css('border')
                    })
                    .appendTo('#' + parentDivID);

                    if (form.withoutTable) {
                        needrecalc  = false;
                        h           = objdiv.outerHeight();

                        if (h > 400) {
                            objdiv.height(400);
                            needrecalc = true;		
                        }

                        w       = objdiv.outerWidth()+30;
                        maxw    = form.bodyDom.innerWidth() - objdiv.position().left - 5;

                        if (maxw > 200) {
                            objdiv.width(maxw);
                        } else {
                            objdiv.width(200);
                        }

                    }

                    subattlist = subsource._private.dataClass.getAttributes();
                    subcolumns = [];

                    for (i = 0, nb = subattlist.length; i < nb; i++) {
                        att = subattlist[i];

                        if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias") {

                            if (att.type != "image") {
                                w = 150;

                                switch (att.type) {
                                    case 'number':
                                        w = 90;
                                        break;

                                    case 'long':
                                        w = 70;
                                        break;

                                    case 'byte':
                                    case 'word':
                                        w = 50;
                                        break;

                                    case 'date':
                                    case 'duration':
                                        w = 100;
                                        break;

                                    default:
                                        w = 150;
                                        break;
                                }

                                subcolumns.push({
                                    colID       : att.name, 
                                    sourceAttID : att.name, 
                                    title       :att.name, 
                                    width       : w
                                });
                            }
                        }
                    }

                    subWidget = new WAF.widget.Grid({
                        id              : subID,
                        'data-binding'  : sourceID,
                        'data-column'   : JSON.stringify(subcolumns),
                        cls             : subID
                    });

                    if (inAPanel){
                        $("#"+subID).dialog();
                    } else {
                        objdiv.resizable({	               
                            resize  : function(event, ui) {
                                var 
                                newHeight;

                                $('.waf-widget-body', objdiv).css('width', parseInt(objdiv.css('width')));

                                newHeight   = parseInt(objdiv.css('height')) - parseInt($('.waf-widget-footer', objdiv).css('height'));
                                newHeight  -= parseInt($('.waf-widget-header', objdiv).css('height'));

                                $('.waf-widget-body', objdiv).css('height', newHeight + 'px');      
                            },

                            stop    : function(event, ui) {
                                subWidget.gridController.gridView.refresh();
                            }

                        });
                    }

                    form.relSources[sourceID]       = subsource;
                    form.relGrids[attribute.name]   = {
                        gridID  : subID, 
                        visible : true, 
                        grid    : subWidget
                    };

					if (this.config['data-resize-optimal-each-widget'] === 'true') {
						this.resizeParentWidget(objdiv);
					}
					
                    subsource.resolveSource();
                } else if (attribute.type == 'image') { 
                    parentWidth = $('#' + parentDivID).width();

                    if (parentWidth < 300) {
                        parentWidth = 300;
                    }

                    imgDiv = $('<div />');
                    
                    imgDiv.prop({
                        id              : subID,
                        'class'         : 'AF_autoImage waf-widget waf-image ' + dataTheme
                    })
                    .data({
                    	'type'     : 'image',
                        'theme'    : dataTheme
                    })
                    .css({
                        'background-color'  : $('#' + divID).css('background-color'),
                        'border'            : $('#' + divID).css('border'),
                        'width'         : parentWidth + 'px',
                        'height'            : '100px'
                    })
                    .appendTo('#' + parentDivID);

                    subWidget     = new WAF.widget.Image({
                        'id'            : subID,
                        'class'         : widget.config['class'],
                        'data-binding'  : form.source.getID()+'.' + attribute.name,
                        'data-fit'      : '4'
                    });                    
                    
                    if (this.allowResizeInput) {
                        imgDiv.resizable({
                            resize: function() {
                                subWidget.refresh();
                            }
                        });
                    }
                    
					if (this.config['data-resize-optimal-each-widget'] === 'true') {
						this.resizeParentWidget(imgDiv);
					}
                }
                
                widget._subWidgets[subID] = subWidget;                
            } else {
                /*
                 * Hide/Show if already displayed
                 */
                subWidget.toggle();    
                
                if (subWidget.$domNode.is(':hidden')) {                    
                    expandDiv.removeClass('waf-expanded');
                    expandDiv.addClass('waf-collapsed');
                } else {                                  
                    expandDiv.removeClass('waf-collapsed');
                    expandDiv.addClass('waf-expanded');
                }
            }
        },
        
        
        /*
         * Display or hide autoform attribute widget (with table)
         * @method toggleAttribute2
         * @param {string} divID : id of the sub element
         * @param {string} attID : attribute of the sub element into the autoform
         * @param {boolean} inAPanel
         */
        toggleAttribute2 : function autoform_toggle_attribute_2(divID, attID, inAPanel) {
            var    
            i,
            w,
            nb,
            form,
            dataTheme,
            attribute,
            subWidget,
            subID,
            sourceID,
            subsource,
            parentDivID,   
            subattlist,
            subcolumns,
            att,
            imgArea,
            parentWidth,
            sourceAtt,
            widget,
            subSource;

            form        = this;
            dataTheme   = form.dataTheme;
            widget      = $$(divID);

            if (inAPanel == null) {
                inAPanel = false;
            }

            if(form == null){ 
                return;
            }

            attribute = form.atts[attID];

            $('#' + divID +'_rel' + attID).toggleClass("expanded");	


            subID       = widget.id + '-subWidget' + attID;
            subWidget   = widget._subWidgets[subID];  
            sourceID    = subID + "-source";
            parentDivID = divID + '_' + attribute.name;   

            /*
             * Create sub dataGrid if doesn't exists
             */
            if(!subWidget) {
                if (attribute.kind == 'relatedEntity') {    
                    /*
                     * Create sub datasource  
                     */    
                    subSource   = WAF.dataSource.create({
                        id      : sourceID, 
                        binding : form.source.getID() + "." + attribute.name
                    });

                    /*
                     * Create html object
                     */
                    $('<div>')
                    .prop({
                        id              : subID,
                        'class'         : dataTheme + " waf-autoForm waf-widget"
                    })
                    .data('data-theme', dataTheme)
                    .css({
                        'background-color'  : $('#' + divID).css('background-color'),
                        'border'            : $('#' + divID).css('border')
                    })
                    .appendTo('#' + parentDivID);

                    /*
                     * Initialize autoform widget
                     */
                    subWidget     = new WAF.widget.AutoForm({
                        'id'            : subID,
                        'class'         : widget.config['class'],
                        'data-binding'  : subSource._private.id,
                        'options'       : {
                            toolBarForRelatedEntity : form.level == 1,
                            noToolBar               : form.level > 1,
                            formTitle               : attribute.name,
                            checkIdentifying        : form.level == 1,
                            level                   : form.level+1,
                            allReadOnly             : form.level > 1,
                            included                : !inAPanel,
                            inAPanel                : inAPanel,
                            withoutTable            : form.withoutTable,
                            allowResizeInput        : form.allowResizeInput,
                            parent                  : {
                                form        : form, 
                                att         : attribute, 
                                sourceAtt   : form.sourceAtts[attID]
                            }
                        }
                    });

                    /*
                     * Resolve source to fill the subForm with atrtibutes values
                     */
                    subSource.resolveSource();

                    /*
                     * Open as panel if defined
                     */
                    if (inAPanel) {
                        subWidget.openAsPanel();
                    }
                } else if(attribute.kind == 'relatedEntities') {     
                    /*
                     * Create sub datasource  
                     */    
                    subsource   = WAF.dataSource.create({
                        id      : sourceID, 
                        binding : form.source.getID() + "." + attribute.name
                    });

                    parentDivID = divID + '_' + attribute.name;

                    $('<div />')
                    .prop({
                        id              : subID,
                        'class'         : 'waf-widget waf-dataGrid AF_autoGridGen ' + dataTheme
                    })
                    .data({
                    	'type'     : 'dataGrid',
                        'theme'    : dataTheme
                    })
                    .css({
                        'background-color'  : $('#' + divID).css('background-color'),
                        'border'            : $('#' + divID).css('border')
                    })
                    .appendTo('#' + parentDivID);

                    subattlist = subsource._private.dataClass.getAttributes();
                    subcolumns = [];

                    for (i = 0, nb = subattlist.length; i < nb; i++) {
                        att = subattlist[i];

                        if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias") {

                            if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias") {

                                if (att.type != "image") {
                                    w = 150;
                                    switch (att.type) {
                                        case 'number':
                                            w = 90;
                                            break;

                                        case 'long':
                                            w = 70;
                                            break;

                                        case 'byte':
                                        case 'word':
                                            w = 50;
                                            break;

                                        case 'date':
                                        case 'duration':
                                            w = 100;
                                            break;

                                        default:
                                            w = 150;
                                            break;
                                    }

                                    subcolumns.push({
                                        colID       : att.name, 
                                        sourceAttID : att.name, 
                                        title       :att.name, 
                                        width       : w
                                    });
                                }
                            }
                        }
                    }

                    subWidget = new WAF.widget.Grid({                
                        id              : subID,
                        'data-binding'  : sourceID,
                        'data-column'   : JSON.stringify(subcolumns),
                        cls             : subID,
                        included        :true
                    });

                    if (inAPanel) {
                        $("#"+subID).dialog();
                    }

                    form.relSources[sourceID]       = subsource;

                    form.relGrids[attribute.name]   = {
                        gridID  : subID, 
                        visible : true, 
                        grid    : subWidget
                    };

                    subsource.resolveSource();
                } else if (attribute.type == 'image') {
                    parentWidth = $('#' + parentDivID).width();

                    if (parentWidth < 300) {
                        parentWidth = 300;
                    }

                    $('<div />')
                    .prop({
                        id              : subID,
                        'class'         : 'AF_autoImage waf-widget waf-image ' + dataTheme
                    })
                    .data({
                    	'type'     : 'image',
                        'theme'    : dataTheme
                    })
                    .css({
                        'background-color'  : $('#' + divID).css('background-color'),
                        'border'            : $('#' + divID).css('border'),
                        'max-width'         : parentWidth + 'px',
                        'height'            : '100px'
                    })
                    .appendTo('#' + parentDivID);

                    subWidget     = new WAF.widget.Image({
                        'id'            : subID,
                        'class'         : widget.config['class'],
                        'data-binding'  : form.source.getID()+'.' + attribute.name,
                        'data-fit'      : '4'
                    });
                }

                widget._subWidgets[subID] = subWidget;
            } else {
                /*
                 * Hide/Show if already displayed
                 */
                subWidget.toggle();
            }
        },
        
        /*
         * Draw the status(pager) of the autoform in the footer
         * @method drawStatud
         */
        drawStatus : function autoform_draw_status() {
            var
            pos,
            xLength;

            pos     = 0;

            if (this.withToolBar) {
                xLength = this.source.length;
                if (this.source.getCurrentElement() != null ){
                    pos = (this.source.getPosition() + 1);
                }

                $('#' + this.id + ' .waf-status-right').html(pos + " / " + xLength);
            }
        },
                
        /*
         * Add a new datasource entity
         * @method addEntity
         */
        addEntity : function autoform_add_entity() {            
            this.source.addNewElement();
        },
                
        /*
         * Go to next datasource entity
         * @method nextEntity
         */
        nextEntity : function autoform_next_entity() {            
            this.source.selectNext();
        },
                
        /*
         * Go to previous datasource entity
         * @method prevEntity
         */
        prevEntity : function autoform_prev_entity() {            
            this.source.selectPrevious();
        },
        
                
        /*
         * Find an entity
         * @method findEntity
         */
        findEntity : function autoform_find_entity() {
            var 
            i,
            form,
            queryString,
            attList,
            val;


            if (this.source) {
                queryString = "";
                attList     = this.attList;

				var params = [];
				var curparam = 1;
                for (i = 0; i < attList.length; i++) {
                    val = document.getElementById(this.id + "_" + idName(attList[i])).value;

                    if (val != null && val != "") {
                        if (queryString != "") {
                            queryString += " and ";
                        }

                        queryString += attList[i] + ' = :' + curparam;
						params.push(val);
						curparam++;
						
                    }
                }

                this.dataClass.query(queryString, {
                    onSuccess: this.gotEntityCollection,
					params: params
                }, {
                    idval: this.id
                });
            }
        },
        
        /*
         * Get an entity collection
         * @method gotEntityCollection
         * @param {object} e
         */
        gotEntityCollection : function autoform_got_entity_collection(e) {
            var
            sel,
            widget;

            sel     = e.entityCollection;
            widget  = $$(e.userData.idval);

            if (widget != null) {
                widget.source.setEntityCollection(sel);
            }
        },
                
        /*
         * Save an entity
         * @method saveEntity
         */
        saveEntity : function autoform_save_entity() {
            var
            source,
            wasNew,
            widget;

            widget  = this;
            source  = this.source;

            if (source) {
                if (source.getCurrentElement() != null) {
                    wasNew = source.isNewElement();
                    source.save({
                        onSuccess   : function(event) {
                            if (wasNew) {
                                source.addNewElement();
                            }
                        },
                        onError     : widget.errorHandler 
                    }, { // user Data
                        autoForm    : widget,
                        errorMessage: "The form could not save the entity"
                    }
                    );
                } else {
                    source.addNewElement();
                }
            }
        },
        
        /*
         * Display the error handler
         * @method errorHandler
         * @param {object} e
         */
        errorHandler : function autoform_error_handler(e){
            var 
            b,
            widget,
            handler,
            cont,
            errorDiv;

            widget  = e.userData.autoForm;
            handler = widget.onError;
            cont    = true;

            if (handler != null) {
                b = handler(e);

                if (b != null && b === false) {
                    cont = false;
                }
            } 

            if (cont) {
                errorDiv        = widget.getErrorDiv();
                e.message   = e.userData.errorMessage || null;

                WAF.ErrorManager.displayError(e, errorDiv);
            }
        },        
    
        /*
         * Find related
         * @method findRel
         */
        findRel : function autoform_find_rel() {
            var 
            i,
            widget,
            queryString,
            attList,
            att,
            val,
            attName,
            entityCollection;

            widget = this;

            queryString = "";
            attList     = widget.attList;
			var params = [];
			var curparam = 1;

            for (i = 0; i < attList.length; i++) {
                attName = attList[i];
                val     = document.getElementById(widget.id + "_" + idName(attName)).value;
                att     = widget.atts[i];

                if (att.identifying && val != null && val != "") {

                    if (queryString != "") {
                        queryString += " and ";
                    }

                    queryString += attName + ' = :' + curparam;
					params.push(val);
					curparam++;
                }
            }

            widget.dataClass.query(queryString, {
				params: params,
                onSuccess: function(event) {
                    entityCollection = event.entityCollection;

                    if (entityCollection != null && entityCollection.length != 0) {
                        entityCollection.getEntity(0, {
                            onSuccess:function(event) {
                                var 
                                entity;
                                
                                entity = event.entity;

                                widget.source.setCurrentEntity(entity);

                                if (widget.parent != null) {
                                    widget.parent.form.source[widget.parent.att.name].set(widget.source);
                                }
                            }
                        });
                    } else {
                        widget.source.setCurrentEntity(null);

                        if (widget.parent != null) {
                            widget.parent.form.source[widget.parent.att.name].set(null);
                        }
                    }
                }
            }, {
                idval: widget.id
            });
        },
    
        /*
         * Is executed on change event on a attribute
         * @method changeEntityAtt
         */
        changeEntityAtt : function autoform_change_entity_att(attName, i) {
            var 
            widget,
            value,
            sourceAtt,
            validation,
            messDivName,
            messDiv,
            htmlObject,
            htmlObjectParent;

            htmlObject          = $('#' + this.id + "_" + attName);
            htmlObjectParent    = htmlObject.parent();
            
            value               = htmlObject.val();
            sourceAtt           = this.sourceAtts[i];
            value               = sourceAtt.normalize(value);
            validation          = sourceAtt.validate(value);
            messDivName         = this.id + "_" + attName + "__mess";
            messDiv             = document.getElementById(messDivName);

            if (messDiv == null) {
                htmlObject.after('<span id="' + messDivName + '" class="AF_mess"></span>');
                messDiv = document.getElementById(messDivName);
            }

            if (validation.valid) {
                htmlObjectParent.removeClass('AF_ValueWrong');
                htmlObjectParent.addClass('AF_ValueOK');
                $('#' + messDivName).parent().removeClass('AF_messWrong');
                $('#' + messDivName).removeClass('AF_markedWrong');

                sourceAtt.setValue(value, {
                    dispatcherID : this.id
                });

                if (messDiv != null) {
                    messDiv.innerHTML = "";
                }
            } else {
                htmlObjectParent.addClass('AF_ValueWrong');
                htmlObjectParent.removeClass('AF_ValueOK');
                $('#' + messDivName).parent().addClass('AF_messWrong');
                $('#' + messDivName).addClass('AF_markedWrong');

                sourceAtt.setValue(value, {
                    dispatcherID : this.id
                });

                if (messDiv == null) {
                    alert(validation.messages.join(" , "));
                } else {
                    messDiv.innerHTML = validation.messages.join(" , ");
                }
            }
        },
               
       /*
        * Set subwidget as resizable
        * @method addResizeOnSubWidgets
        */
        addResizeOnSubWidgets : function autoform_add_resize_on_subwidgets() {
            var
            htmlObject;

            function ResizeHandler(event, ui) {
                ui.originalElement.css({
                    'width'     : '100%',
                    'height'    : '100%'
                });
            }

            htmlObject = $("#" + this.id);

            if (this.allowResizeInput) {
                $(".waf-form-resize-multiline", htmlObject).resizable({
                    resize: ResizeHandler
                });

                $(".waf-form-resize", htmlObject).resizable({
                    handles :"e", 
                    resize  : ResizeHandler
                });

                $(".waf-form-resize-pict", htmlObject).resizable({
                    resize: function(event, ui) {
                    }
                });



                $(".waf-form-resize", htmlObject).parent().css("padding", "0px");

                $(".waf-form-resize-multiline", htmlObject).parent().css("padding", "0px");

                $(".waf-form-resize,.waf-form-resize-pict,.waf-form-resize-multiline", htmlObject).each(function(index) {
                    var
                    parent;

                    parent = $(this).parent();

                    $(this).height(parent.height());
                    $(this).width(parent.width());
                });
            }
			
			/*
			$(".waf-form-att-value-input", htmlObject).each(function(index) {
	            var parent = $(this).parent();
				if (parent.hasClass("ui-wrapper")) {
					parent.css("display", "table-cell");
				}
				else {
					$(this).css("display", "table-cell");
				}
        	});
        	*/
			
        },
        
        /*
         * Purge error message
         * @method purgeErrorMessagesOnForm
         */
        purgeErrorMessagesOnForm : function autoform_purge_error_messages_on_form() {
            var
            i,
            divID,
            attList,
            att,
            sourceAtt,
            objDiv,
            messDivName,
            attName;

            divID   = this.id;
            attList = this.attList;

            for (i = 0; i < attList.length; i++) {
                att         = this.atts[i];
                sourceAtt   = this.sourceAtts[i];
                objDiv      = document.getElementById(divID + "_" + idName(attList[i]));

                if (objDiv != null) {
                    if (sourceAtt.readOnly || att.readOnly || (this.checkIdentifying && !att.identifying) || this.allReadOnly){
                        objDiv.disabled = true;
                    } else {
                        objDiv.disabled = false;
                    }
                }

                if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias") {
                    attName     = idName(sourceAtt.name);
                    messDivName = divID + "_" + attName + "__mess";

                    $('#' + divID + "_" + attName).parent().removeClass('AF_ValueWrong');
                    $('#' + divID + "_" + attName).parent().addClass('AF_ValueOK');
                    $('#' + messDivName).parent().removeClass('AF_messWrong');
                    $('#' + messDivName).removeClass('AF_markedWrong');
                    $('#' + messDivName).html("");
                }
            }
        },
        
		/*
		 * Resize parent widget to have only one scrollbar
		 * @method resizeParentWidget
		 */
		resizeParentWidget : function resize_parent_auto_form_widget(currentWidget) {
			
			var i,
				widget,
				parentsLength,
				widgetsParent,
				$parentWidget,
				currentHeight,
				$parentWidgetBody,
				needToResizeParent;
			
			widget = this;
			widgetsParent = $(currentWidget).parents(".waf-autoForm");
			parentsLength = widgetsParent.length;
			needToResizeParent = true;
			i = 0;
			
			while (needToResizeParent && i < parentsLength) {
				$parentWidget = $(widgetsParent[i]);
				$parentWidgetBody = $parentWidget.children(".waf-autoForm-body")
				
				//resize only sub-widget
				if (widget._subWidgets.hasOwnProperty($parentWidget[0].id)) {
					
					currentHeight = $parentWidgetBody.height();
					
					if (currentHeight < $parentWidgetBody[0].scrollHeight) {
						
						$parentWidgetBody.height($parentWidgetBody.outerHeight() + ($parentWidgetBody[0].scrollHeight - currentHeight));
						
						if ($parentWidgetBody.width() < $parentWidgetBody[0].scrollWidth) {
							//add scroll bar height
							$parentWidgetBody.height($parentWidgetBody.outerHeight() + 16);
						}
						
					} else {
						needToResizeParent = false;
					}
				}
				i++;
			}
		}
    }
);    

WAF.AF = {};
    
/*
 * Build a form (used on design and on runtime)
 * @method buildForm
 * @param {string} divID
 * @param {object} dataSource
 * @param {object} attrList
 * @param {object} nameList
 * @param {object} options
 * @param {object} options
 * @param {object} catalog
 * @param {object} tag
 */
WAF.AF.buildForm = function(divID, dataSource, attrList, nameList, options, catalog, tag) {
    var
    i,
    j,
    w,
    lib,
    nbatt,
    isQueryForm,
    autonomous,
    withoutTable,
    allowResizeInput,
    subWidgets,
    mustDisplayError,
    errorDiv,
    dataTheme,
    existingClasses,
    htmlObject,
    mustResizeInputs,
    dataClass,
    formTitle,
    otherAttInfo,
    checkIdentifying,
    level,
    toolBarForRelatedEntity,
    allReadOnly,
    atts,
    newlist,
    sourceAtts,
    attlist,
    attlistLength,
    attrListLength,
    attname,
    att,
    sourceAtt,
    isRel,
    withTitle,
    html,
    headerDom,
    bodyDom,
    footerDom,
    moreclass,            
    largeObject,
    classMore,
    htmlIDName,
    binding,
    maxinputsize,            
    multiline,
    resizeClass,
    withToolBar,
    toolbarConfig,
    toolbar,   
    tabDom,
    maxwidth,
    domobj,
    nbComponent,
    xcol,
    operinfo,
    nbx,
    opertext,
    attibuteRelatedIcon,            
    objID,
    htmlobj,            
    enumValueList,
    items,
    result,
    widget,
    nb,
    inDesign;

    divID                   = divID;
    htmlObject              = $('#' + divID);           
    lib                     = '';
    isQueryForm             = false;
    autonomous              = true;
    withoutTable            = false;
    allowResizeInput        = false;
    subWidgets              = [];
    mustDisplayError        = options.mustDisplayError;
    errorDiv                = options.errorDiv;
    dataTheme               = "";
    existingClasses         = htmlObject.prop('class').split(" ");
    mustResizeInputs        = htmlObject.hasClass("roundy");
    checkIdentifying        = false;
    level                   = 1;
    toolBarForRelatedEntity = false;
    allReadOnly             = false;     
    inDesign                = false;
    atts                    = [];
    newlist                 = [];
    sourceAtts              = [];

    existingClasses.forEach(function(className) {
        if (className != "inherit" && className.substr(0,4) != "waf-") {
                dataTheme += className+" ";
        }
    });

    if (options != null && options.isQueryForm){
        isQueryForm = true;
    }

    if (options != null && options.included){
        autonomous = false;
    }

    if (options != null && options.withoutTable){
        withoutTable = true;
    }

    if (options != null && options.allowResizeInput){
        allowResizeInput = true;
    }

    dataClass = null;

    /*
     * If in design mode
     */
    if (dataSource == null) {
        if (tag && tag.getAttribute('data-binding'))  {
            dataClass = catalog.getByName(tag.getAttribute('data-binding').getValue());
            formTitle = dataClass ? dataClass.getName() : '';
        } else {
            dataClass                       = {};
            dataClass.getAttributes         = function(){return [];};
            dataClass.getAttributeByName    = function(){return [];};

            formTitle   = '';
        }
        
        inDesign = true;
    } else {
        /*
         * Only for sources on datastore classes
         */
        dataClass   = dataSource.getDataClass();

        formTitle   = dataSource.getClassTitle();
        
        widget      = $$(divID);
    }

    if (options == null){
        options = {};            
    }

    if (options.formTitle != null){
        formTitle = options.formTitle;
    }

    if (isQueryForm) {
        formTitle = "Query on " + formTitle;
        otherAttInfo = [];
    }

    if (options.checkIdentifying)
            checkIdentifying = true;

    if (options.level) {
        level = options.level;
    }

    if (options.toolBarForRelatedEntity){
        toolBarForRelatedEntity = options.toolBarForRelatedEntity;
    }

    if (options.allReadOnly){
        allReadOnly = options.allReadOnly;
    }

    if (attrList == null || attrList.length == 0) {
        if (dataSource == null && dataClass) {
            attlist         = dataClass.getAttributes();
            attrList        = [];
            attlistLength   = attlist.length

            for (i = 0, nb = attlistLength; i < nb; i++) {
                    attrList.push(attlist[i].name);
            }
        } else if (dataSource) {
            attrList = dataSource.getAttributeNames();
        }
    }

    attrListLength = attrList.length;

    for (i = 0, nb = attrListLength; i < nb; i++) {
        attname = attrList[i];

        if (dataSource == null) {
            if (dataClass) {
                att = dataClass.getAttributeByName(attname);
            }
        } else {
            att = dataSource.getClassAttributeByName(attname);
            sourceAtt = dataSource.getAttribute(attname);
            sourceAtts.push(sourceAtt);
        }

        if (att != null) {
            if (isQueryForm) {
                if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias") {
                    isRel = false;
                    if (att.type == 'image') {
                            isRel = true;
                    }
                } else {
                    isRel = true;
                }

                if (!isRel) {
                    atts.push(att);
                    newlist.push(attname);
                }
            } else {
                atts.push(att);
                newlist.push(attname);
            }
        }
    }

    attrList    = newlist;
    withTitle   = !options.noTitle;
    html        = '';
    headerDom   = null;
    bodyDom     = null;
    footerDom   = null;

    /*
     * <With included widgets>
     */
    if (withoutTable) {
        /*
         * Form header
         */
        if (withTitle) {                
            html += '<div class="waf-form-header waf-widget-header waf-autoForm-header">';
            html += 	'<div class="waf-form-header-left">';
            html +=         '<div class="waf-form-header-left-inside">';
            html +=         '</div>';
            html +=     '</div>';
            html += 	'<div class="waf-form-header-text autoForm-title-col">';
            html +=         formTitle;
            html +=	'</div>';
            html += 	'<div class="waf-form-header-right">';
            html +=     '</div>';
            html += '</div>';
            //html += this.config.tpl.header;
        }

        moreclass = "";

        if (autonomous){
            moreclass += ' autonomous';
        } else {
            moreclass += ' included';
        }

        html += '<div class="waf-user-select-none waf-widget-body waf-form-body waf-autoForm-body' + moreclass + '" style="overflow:auto">';

        html += '<div class="waf-form-body-inside">';

        for (i = 0, nb = attrList.length; i < nb; i++) {
            largeObject = false;
            att         = atts[i];

            if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias")  {
                if (att.type == 'string' && att.multiLine){
                    largeObject = true;
                }

                isRel = false;

                if (att.type == 'image') {
                    isRel = true;
                }                        
            } else {
                isRel = true;
            }

            if (isRel){
                largeObject = true;
            }

            classMore = "";

            if (largeObject) {
                classMore = " waf-form-large-object";
            }

            htmlIDName  = idName(attrList[i]);
            lib         = (nameList && nameList[i]) ? nameList[i] : attrList[i];

            html        += '<div class="waf-form-row" id="' + divID +'_att_' + i + '">';

            html        +=      '<div class="waf-form-att-label' + classMore + '">';
            html        +=          '<div class="waf-form-att-label-text attribute-col">';
            html        +=              lib;
            html        +=          '</div>';

            if (isRel) {
                html    += 	'<div class="waf-form-att-label-rel waf-expandable waf-collapsed" data-form-id="' + divID + '" data-att-id="' + i + '">';
                html    +=          '</div>';
            }

            html        += 	'</div>'; // fin d'un form-att-label            
            
            if (dataSource == null) {
                binding = '';
            } else {
                binding = dataSource.getID() + '.' + attrList[i];
            }

            html        += 	'<div class="waf-form-att-value' + classMore + '">';

            if (!isRel) {
                maxinputsize = 0;

                switch(att.type) {
                    case "bool":
                    case "byte":
                            maxinputsize = 3;
                            break;

                    case "word":
                            maxinputsize = 4;
                            break;

                    case "long":
                            maxinputsize = 7;
                            break;

                    case "long64":
                    case "number":
                            maxinputsize = 14;
                            break;

                    case "date":
                    case "duration":
                            maxinputsize = 12;
                            break;

                    case "string":
                            maxinputsize = 30;
                            break;
                }


                if (att.type != "bool") {
                    multiline = false;

                    if (att.multiLine) {
                        multiline = true;
                    }

                    if (multiline) {
                        resizeClass  = "waf-form-resize-multiline";
                        html        += '<textarea data-multiline="true" ';
                    } else {
                        resizeClass  = "waf-form-resize";
                        html        += '<input type="text" ';
                    }

                    html += 'class="' + dataTheme+resizeClass + ' waf-form-att-value-input waf-widget waf-textField" id="' + divID + "_" + htmlIDName + '" ';

                    if (maxinputsize != 0) {
                        html += ' style="width:' + maxinputsize + 'em;';

                        if (multiline) {
                            html += 'height:40px;';
                        }

                        html += '"';
                    }

                    html += ' data-binding="'+binding+'" data-type="textField">';
                    html += '</textarea>';

                } else {
					html += '<div data-lib="WAF" type="checkbox" class="'+dataTheme+'waf-form-att-value-checkbox waf-widget waf-checkbox" data-type="checkbox" style="width:16px;height:16px;position:relative;top:3px;" ';
                    html += 'data-binding="'+binding+'" id="' + divID + "_" + htmlIDName + '"></div>';
					/*
					  "waf-checkbox-level-0 waf-level-0"
					 
                    html += '<input type="checkbox" class="'+dataTheme+'waf-form-att-value-checkbox waf-widget waf-checkbox" datatype="checkbox" ';
                    html += 'data-binding="'+binding+'" id="' + divID + "_" + htmlIDName + '"/>';
                    */
                }

                html += '<div class="errormess-div" id="' + divID + '_' + htmlIDName + '__mess"></div>';

            } else {
                html += '<div class="waf-form-att-value-rel" id="' + divID + "_" + htmlIDName + '" >';
                html += '</div>';
            }

            html += 	'</div>'; // fin d'un form-att-value
            html += '</div>'; // fin d'un form row

        }

        html += '</div>'; // fin du form body inside

        html += '</div>'; // fin du form body

        withToolBar = !options.noToolBar;

        if (withToolBar) {
            html += '<div class="waf-widget-footer waf-autoForm-footer">';
            html += 	'<div class="waf-status">';
            html += 		'<div class="waf-status-element waf-status-left"></div>';
            html += 		'<div class="waf-status-element waf-status-center"></div>';
            html += 		'<div class="waf-status-element waf-status-right"></div>';
            html += 	'</div>';
            html += '</div>';
        }

        htmlObject.data({
            'type'     : isQueryForm ? 'queryForm' : 'autoForm',
            'level'    : level
        })
        .addClass('waf-widget')
        .html(html);

        tabDom      = $('[data-type]', htmlObject);
        maxwidth    = 70;

        for (i = 0, nbComponent = tabDom.length; i < nbComponent; i++)  {
            domobj          = tabDom[i];
            
            if ($(domobj).data('type') != 'image') {
                subWidgets[i]   = WAF.tags.createComponent(domobj, false);
            }
        }
        var labelHtmlObj = $(".waf-form-att-label", htmlObject);

        labelHtmlObj.each(function(index) {
            w = $(this).outerWidth();

            if (maxwidth < w) {
                maxwidth = w;
            }
        });
        
        /*
         * Set label with to allow to set the text-align property
         */
        var sizeReduce = 35;

        if (labelHtmlObj.children('.waf-expandable').length == 0) {
            sizeReduce = 21;
        }

        labelHtmlObj.children('.waf-form-att-label-text').width(maxwidth - sizeReduce);

        labelHtmlObj.width(maxwidth);

        toolBarForRelatedEntity = false;

        if (options.toolBarForRelatedEntity) {
                toolBarForRelatedEntity = options.toolBarForRelatedEntity;
        }

        if (withToolBar) {

            if (isQueryForm) {
                toolbarConfig = [
                    {icon: {size: 16, type: 'radioactive'},     title: 'Clear', click: function() { if (widget) widget.clear();}},
                    {icon: {size: 16, type: 'magnifyingGlass'}, title: 'Find',  click: function() { if (widget) widget.findEntity();}}
                ];
            } else {
                if (toolBarForRelatedEntity) {
                    toolbarConfig = [
                        {icon: {size: 16, type: 'radioactive'},     title: 'Clear', click: function() { if (widget) widget.clear();}},
                        {icon: {size: 16, type: 'magnifyingGlass'}, title: 'Find',  click: function() { if (widget) widget.findRel();}}
                    ];
                } else {                    
                    toolbarConfig = [
                        {icon: {size: 16, type: 'arrowFullLeft'},   title: 'Previous',  click: function() { if (widget) widget.prevEntity();}},
                        {icon: {size: 16, type: 'arrowFullRight'},  title: 'Next',      click: function() { if (widget) widget.nextEntity();}},
                        {icon: {size: 16, type: 'plus'}, text: '',  title: 'Add',       click: function() { if (widget) widget.addEntity();}},
                        {icon: {size: 16, type: 'magnifyingGlass'}, title: 'Find',      click: function() { if (widget) widget.findEntity();}},
                        {icon: {size: 16, type: 'floppyDisk'},      title: 'Save',      click: function() { if (widget) widget.saveEntity();}},
                        {icon: {size: 16, type: 'trash'},           title: 'Delete',    click: function() { if (widget) widget.dropEntity();}}
                    ];
                }
            }

            toolbar = new WAF.widget.Toolbar(toolbarConfig);

            htmlObject.find('.waf-autoForm-footer .waf-status-left').append(toolbar);
        }

        headerDom   = $('.waf-widget-header', htmlObject);
        bodyDom     = $('.waf-form-body', htmlObject);

        if (withToolBar) {
            footerDom = $('.waf-widget-footer', htmlObject);
        }

        
        if (inDesign) {
            var 
            formHeight,
            headerHeight,
            footerHeight;

            formHeight      = htmlObject.height();				
            headerHeight    = headerDom.outerHeight();
            footerHeight    = 0;

            if (withToolBar) {
                footerHeight = footerDom.outerHeight();
            }

            bodyDom.height(formHeight-footerHeight-headerHeight);
        } else {
  			if (widget != null)
				widget.afterResize(htmlObject, withToolBar);
        }
        

    /*
     * <Autoform displayed as table>
     */
    } else {
        html += '<table border="0" cellpadding="0" cellspacing="0" class="autoForm-data';

            if (isQueryForm) {
                html += ' query-form';
            }

            if (autonomous){
                html += ' autonomous';
            } else{
                html += ' included';
            }

        html += '">';

        /* It seems the following make the tbody have a wrong width Width is now fixed on cells. */
        /* if (!isQueryForm)
                html += '<col /><col width="100%" />'; */

        xcol = 2;

        if (isQueryForm) {
            xcol = 3;
        }

        /*
         * Form header
         */
        if (withTitle) {
            html += '<thead class="waf-widget-header waf-autoForm-header">';
            html += '   <tr class="autoForm-title-row">';
            html += '       <th class="autoForm-title-col" colspan="' + xcol + '"><div class="autoForm-title">' + formTitle + '</div></th>';
            html += '   </tr>';
            html += '</thead>';	
        }


        html += '<tbody class="waf-widget-body waf-autoForm-body">';		

        for (i = 0, nb = attrList.length; i < nb; i++) {
            att = atts[i];

            if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias") {
                isRel = false;

                if (att.type == 'image')  {
                    isRel = true;
                }
            } else {
                isRel = true;
            }

            html += '<tr class="waf-autoForm-row ';

                if (i == 0) { 
                    html += 'first-child ';
                }

                if (i == nb - 1) { 
                    html += 'last-child ';
                }

                html += (i%2) ? 'waf-widget-even' : 'waf-widget-odd';

            html += '">';

            lib   = (nameList && nameList[i]) ? nameList[i] : attrList[i];

            html += '<td '

                if (isRel) {
                    html += 'id="'+divID+'_rel'+i+'" ';
                }

                html += 'class="attribute-col'+ (isRel ? ' related' : '')+'"><div class="attribute-div">' + lib;

                if (isRel) {
                        html += '<span class="attribute-rel waf-state" data-att-id="'+i+'"></span>';
                }

                html += '</div>';

            html += '</td>';

            if (isQueryForm) {
                html += '<td class="oper-col"><div class="oper-div">';

                if (!isRel) {
                    operinfo = options.queryData.appropriateOper(att.type);

                    html += '<select id="'+ divID+ '_oper'+ i+ '" data-row-ref="' + i + '" class="oper-select" tabindex="'+ (operinfo.defaultOper+1) + '">';

                        for (j = 0, nbx = operinfo.operList.length; j < nbx; j++) {
                            opertext = operinfo.operList[j];
                            html    += '<option value="' + (j+1) + '"';

                                if (j == operinfo.defaultOper){
                                    html += ' selected="selected"';
                                }

                            html += '>';
                                html += htmlEncode(opertext, false, 4);
                            html += '</option>';
                        }

                    html += '</select>';

                    otherAttInfo[i] = {curOper : operinfo.defaultOper};
                }

                html += '</div></td>';
            }

            htmlIDName = idName(attrList[i]);

            if (!isRel) {
                html += '<td width="100%" class="value-col"><div class="value-div">';
                html += 	'<input class="waf-inputdiv" id="' + divID + "_" + htmlIDName + '" type="text" value=""';

                if (!isQueryForm && widget){
                    html += ' onchange="WAF.widgets[\'' + widget.id + '\'].changeEntityAtt(\'' + htmlIDName + '\',\'' + i + '\')"';
                }

                if (mustResizeInputs) {
                    maxinputsize = 0;
                    switch(att.type) {
                        case "bool":
                        case "byte":
                            maxinputsize = 3;
                            break;

                        case "word":
                            maxinputsize = 4;
                            break;

                        case "long":
                            maxinputsize = 7;
                            break;

                        case "long64":
                        case "number":
                            maxinputsize = 14;
                            break;

                        case "date":
                        case "duration":
                            maxinputsize = 12;
                            break;

                        case "string":
                            maxinputsize = 30;
                            break;
                    }

                    if (maxinputsize != 0) {
                        html += ' style="width:'+maxinputsize+'em;"';
                    }
                }

                html += '/>';
                html += 	'<div class="errormess-div" id="' + divID + '_' + htmlIDName + '__mess"></div>';
                html += '</div></td>';

            } else {
                html += '<td width="100%" class="value-col value-rel">';
                html += 	'<div class="value-rel-div" id="' + divID + "_" + htmlIDName + '" ></div>';
                html += '</td>';
            }

            html += '</tr>';
        }

        // petite ligne cachee pour aggrandir la table si necessaire
        html += '<tr class="autoForm-filler" style="height:0px;">';
        html += '<td class="attribute-col" style="height:0px;"><div class="attribute-div">';
        html += '</div></td>';

        if (isQueryForm) {
            html += '<td class="oper-col" style="height:0px;"><div class="oper-div">';
            html += '</div></td>';
        }

        html += '<td class="value-col" style="height:0px;"><div class="value-div">';
        html += '</div></td>';
        html += '</tr>';
        // fin de la petite ligne cachee

        withToolBar             = !options.noToolBar;
        toolBarForRelatedEntity = false;

        if (options.toolBarForRelatedEntity) {
            toolBarForRelatedEntity = options.toolBarForRelatedEntity;
        }

        if(withToolBar) {
            html += '<tfoot class="waf-widget-footer waf-autoForm-footer">';
            html += 	'<tr>';
            html +=         '<td colspan="'+xcol+'">';
            html +=             '<div class="waf-status">';
            html +=                 '<div class="waf-status-element waf-status-left"></div>';
            html +=                 '<div class="waf-status-element waf-status-center"></div>';
            html +=                 '<div class="waf-status-element waf-status-right"></div>';
            html +=             '</div>';
            html +=         '</td>';
            html += 	'</tr>';
            html += '</tfoot>';

            if (isQueryForm) {
                toolbarConfig = [
                    {icon: {size: 16, type: 'radioactive'},     title: 'Clear', click: function() { if (widget) widget.clear();}},
                    {icon: {size: 16, type: 'magnifyingGlass'}, title: 'Find',  click: function() { if (widget) widget.findEntity();}}
                ];
            } else {
                if (toolBarForRelatedEntity) {
                    toolbarConfig = [
                        {icon: {size: 16, type: 'radioactive'},     title: 'Clear', click: function() { if (widget) widget.clear();}},
                        {icon: {size: 16, type: 'magnifyingGlass'}, title: 'Find',  click: function() { if (widget) widget.findRel();}}
                    ];
                } else {
                    toolbarConfig = [
                        {icon: {size: 16, type: 'arrowFullLeft'},   title: 'Previous',  click: function() { if (widget) widget.prevEntity();}},
                        {icon: {size: 16, type: 'arrowFullRight'},  title: 'Next',      click: function() { if (widget) widget.nextEntity();}},
                        {icon: {size: 16, type: 'plus'}, text: '',  title: 'Add',       click: function() { if (widget) widget.addEntity();}},
                        {icon: {size: 16, type: 'magnifyingGlass'}, title: 'Find',      click: function() { if (widget) widget.findEntity();}},
                        {icon: {size: 16, type: 'floppyDisk'},      title: 'Save',      click: function() { if (widget) widget.saveEntity();}},
                        {icon: {size: 16, type: 'trash'},           title: 'Delete',    click: function() { if (widget) widget.dropEntity();}}
                    ];
                }
            }

            toolbar = new WAF.widget.Toolbar(toolbarConfig);
        }

        html += '</table>';

        htmlObject.data({
            'type'     : isQueryForm ? 'queryForm' : 'autoForm',
            'level'    : level
        })
        .addClass('waf-widget waf-autoForm')
        .html(html);

        attibuteRelatedIcon = new WAF.widget.Icon({
            size    : 16,
            type    : 'arrowSansRight',
            state   : {
                active      : {
                    fill    : '#5e5e5e',
                    rotation: 90
                }
            }
        });

        htmlObject.find('.attribute-rel').append(attibuteRelatedIcon.containerNode);

        if (options.included !== false) {
            htmlObject.find('tbody').css({
                display         : 'block',
                'overflow-x'    : 'hidden',
                'overflow-y'    : (dataSource == null) ? 'hidden' : 'auto',
                width           : htmlObject.width() + 'px',
                height          : htmlObject.height() - htmlObject.find('thead').height() - htmlObject.find('tfoot').height() + 'px'
            });
        }

        if(withToolBar) {
            htmlObject.find('.waf-autoForm-footer .waf-status-left').append(toolbar);
        }
    }

    for (i = 0, nbatt = attrList.length; i < nbatt; i++) {
        att         = atts[i];
        sourceAtt   = sourceAtts[i];

        if((att.kind == "storage" || att.kind == "calculated" || att.kind == "alias") && att.type != 'image') {
            objID   = '';
            htmlobj = null;

            if (typeof sourceAtt !== 'undefined') {
                objID   = divID + "_" + idName(sourceAtt.name);
                htmlobj = $('#' + objID)[0];
            }	

            if (htmlobj) {
                htmlobj.isInFocus           = false;
                htmlobj.att                 = att;
                htmlobj.format              = att.defaultFormat;
                htmlobj.source              = dataSource;
                htmlobj.getFormattedValue   = widget.getFormattedValue;
                htmlobj.sourceAtt           = sourceAtts[i];
                htmlobj.isTextInput         = true;

                if (!isQueryForm) {
                    $(htmlobj).focus(function(event) {
                        this.isInFocus   = true;

                        if (this.format != null && this.format.format != null) {
                            this.value = this.sourceAtt.getValueForInput();
                        }
                    });

                    $(htmlobj).blur(function(event) {
                        this.isInFocus = false;

                        if (this.format != null && this.format.format != null) {
                            this.value = this.getFormattedValue();
                        }
                    });
                }

                enumValueList   = [];
                items           = null;

                if (att.enumeration != null && !att.readOnly && !sourceAtt.readOnly) {
                    items = att.enumeration.item;

                    for (j = 0, nb = items.length; j < nb; j++) {
                        enumValueList.push(items[j].name);
                    }
                }

                if (enumValueList.length > 0) {                    
                    $(htmlobj)
                    .data('enumValueList', enumValueList)
                    .autocomplete({
                        source: function(request, response) {
                            response($.grep($(this.element.context).data('enumValueList'), function(item, index) {
                                return item.toLowerCase().indexOf(request.term.toLowerCase()) === 0;
                            }));
                        }
                    })
                    .autocomplete('widget')
                    .addClass(dataTheme);

                    if (!isQueryForm) {
                        $(htmlobj).blur(function(event) {
                            var 
                            sourceAtt;

                            sourceAtt = this.sourceAtt;
                            if (this.value !== sourceAtt.getValue()) {
                                sourceAtt.setValue(this.value, {dispatcherID:divID});
                            }
                        });
                    }
                } else if (att.autoComplete) {                    
                    $(htmlobj)
                    .autocomplete({
                        source: function(request, response) {
                            $.ajax({
                                url: 'rest/' + dataClass.getName() + '/' + this.element.context.att.name + '?$distinct=true&$top=20',
                                data: {
                                    '$filter': '"' + this.element.context.att.name + '=\'' + request.term + '@\'"'
                                },
                                success: function(data) {
                                    response($.map(data, function(item) {
                                        return {
                                            value: item
                                        }
                                    }));
                                }
                            });
                        }
                    })
                    .autocomplete('widget')
                    .addClass(dataTheme);

                    if (!isQueryForm) {
                        $(htmlobj).blur(function(event) {
                            var 
                            sourceAtt;

                            sourceAtt = this.sourceAtt;

                            if (this.value !== sourceAtt.getValue()) {
                                sourceAtt.setValue(this.value, {dispatcherID:divID});
                            }
                        });
                    }
                } else {
                    if (att.type == 'date') {
                        $(htmlobj)
                        .datepicker({
							buttonImageOnly: false,
							showOn: "focus"
						})
                        .datepicker('widget')
                        .addClass(dataTheme);
                    }

                }
            }
        }
    }

    if (typeof (otherAttInfo) === "undefined"){
        otherAttInfo = null;
    }    
    
    if (widget) {
        widget.withToolBar                  = withToolBar;
        widget.attList                      = attrList;
        widget.atts                         = atts;
        widget.sourceAtts                   = sourceAtts;
        widget.otherAttInfo                 = otherAttInfo;
        widget.checkIdentifying             = checkIdentifying;
        widget.allReadOnly                  = allReadOnly;
        widget.dataClass                    = dataClass;
        widget.source                       = dataSource;
        widget.divID                        = divID;
        widget.kind                         = 'autoForm';
        widget.attList                      = attrList;
        widget.atts                         = atts;
        widget.sourceAtts                   = sourceAtts;
        widget.relForms                     = {};
        widget.relGrids                     = {};
        widget.relSources                   = {};
        widget.imgAreas                     = {};
        widget.subWidgets                   = subWidgets;
        widget.withTitle                    = withTitle;
        widget.withToolBar                  = withToolBar;
        widget.withoutTable                 = withoutTable;
        widget.headerDom                    = headerDom;
        widget.bodyDom                      = bodyDom;
        widget.footerDom                    = footerDom;
        widget.allowResizeInput             = allowResizeInput;
        widget.toolBarForRelatedEntity      = toolBarForRelatedEntity;
        widget.level                        = level;
        widget.parent                       = options.parent;
        widget.isQueryForm                  = isQueryForm;
        widget.otherAttInfo                 = otherAttInfo;
        widget.dataTheme                    = dataTheme;
        widget.mustDisplayError             = mustDisplayError;
        widget.onError                      = null;
        widget.kill                         = function() {            
            var 
            fName;

            for (fName in this.relForms) {
                this.relForms[fName].kill();
            }

            for (fName in this.relGrids) {
                this.relGrids[fName].grid.kill();
            }

            $('#' + this.divID).html("");
        }
    }
    
    result = widget;
    
    if (widget) {
        widget.setErrorDiv(errorDiv);
    }

    if (dataSource != null)  {
        if (isQueryForm){
            dataSource.addListener("onCollectionChange", function(e) {
                widget.drawStatus();	
            }, {
                listenerID: divID, 
                id: divID, 
                listenerType:'form'
            });
        } else {
            dataSource.addListener("all", function(e){                
                var 
                form,
                domobj,
                sourceAtt;

                form = e.data.form;
                
                if (e.eventKind == 'onCurrentElementChange' || e.eventKind == 'onCollectionChange')  {
					if (!widget.withoutTable)
					{
	                    if (form.source.getCurrentElement() == null) {
	                        form.clear();
	                    } else {
	                        form.fill();
	                    }
					}
                } else  if (e.eventKind == "onAttributeChange")  {
                    domobj = document.getElementById(form.id + "_" + idName(e.attributeName));

                    if (domobj != null) {
                        sourceAtt = e.attribute;
                        if (sourceAtt.simple) {
                            if (domobj.isInFocus) {
                                domobj.value = sourceAtt.getValueForInput(); //form.source[notifyEvent.attName];
                            } else {
                                domobj.value = domobj.getFormattedValue();
                            }
                        }
                    }
                }
            }, {id: divID, listenerID: divID, listenerType:'form'}, {form:result});
        }
    }

    if (!isQueryForm && dataSource) {
        dataSource.dispatch('onCurrentElementChange');
    }

    return result;
}


/**
 * Format a name
 * @method idName
 * @param {string} text : text to format
 * @return  {string} formatted text
 */
function idName(text) {
    return text.split(".").join("_");
}