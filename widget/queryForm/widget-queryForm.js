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
/*
 * AUTOFORM USING WIDGET'S PROVIDE
 */
WAF.Widget.provide(
    'QueryForm',    
    {
    },
    function WAFWidget(config, data, shared) {
        var
        source,
        nameList,
        attrList,
        mustDisplayError,
        divID,
        options,
        htmlObject;
        
        htmlObject          = $(this.containerNode);
        source              = WAF.source[config['data-binding']];
        nameList            = [];
        attrList            = [];
        mustDisplayError    = config['data-display-error'];
        divID               = config['id'];
        options             = {};

        if (mustDisplayError == null) {
            mustDisplayError = true;
        } else {
            mustDisplayError = (mustDisplayError == '1' || mustDisplayError == 'true');
        }
        
        options.mustDisplayError    = mustDisplayError;
        options.isQueryForm         = true;        
        options.queryData           = this.queryData = config.queryData;

        if (source != null) {
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
             * Call queryform build method
             */            
            WAF.AF.buildForm(divID, source, attrList, nameList, options);                       
            
            /*
             * DEPRECATED AFTER REFACTORING
             */
            WAF.widgets[this.id] = this;
        /*
         * Display a message to indicate that the widget is not binded
         */
        } else {
            
            htmlObject.addClass('waf-autoForm')
            $('<div class="waf-autoForm-missingBinding" style="top:20px;">Datasource is either missing <br>or <br>invalid</div>').appendTo(htmlObject);
        }
        
        if (data.draggable == 'true') {
            htmlObject.find('.waf-widget-header,.waf-widget-footer').css('cursor', 'pointer');
        }
    }, {       
        /*
         * Resize method called during resize
         * @method onResize
         */
        onResize : function queryform_resize() {  
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
            newHeight  -= parseInt(htmlObject.find('.waf-widget-header').css('height'));
            
            htmlObject.find('.waf-widget-body').css('width', width);
            
            htmlObject.find('.waf-widget-body').css('height',  newHeight + 'px');        
        },
        
        /*
         * Resize method called on stop resize
         * @method onResize
         */
        stopResize : function queryform_stop_resize() {   
        },  
               
        /*
         * Clear the queryform content
         * @method clear
         */
        clear   : function queryform_clear() {
            var 
            i,
            attList,
            att,
            xLength;

            attList = this.attList;

            this.purgeErrorMessagesOnForm();    

            for (i = 0; i < attList.length; i++) {
                att = this.atts[i];

                if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias"){
                    document.getElementById(this.id + "_" + idName(attList[i])).value = "";
                }
            }

            if (this.withToolBar) {
                xLength = this.source.length;
                $('#' + this.id + ' .waf-status-right').html(xLength);
            }     
        },
        
        
        /*
         * Fill the queryform content
         * @method fill
         */
        fill : function queryform_fill() {
            var
            eset,
            xLength;

            this.purgeErrorMessagesOnForm();

            if (this.withToolBar)  {
                eset    = this.source.getEntityCollection();
                xLength = (eset != null) ? eset.length : 0;

                $('#' + this.id + ' .waf-status-right').html(xLength);
            }
        },
        
        /*
         * Draw the status(pager) of the queryform in the footer
         * @method drawStatud
         */
        drawStatus : function queryform_draw_status() {
            var
            xLength;
            
            xLength = this.source.length;
            
            $('#' + this.id + ' .waf-status-right').html(xLength);
        },
        
        /*
         * Find an entity
         * @method findEntity
         */
        findEntity : function queryform_find_entity() {
            var 
            i,
            queryString,
            attList,
            val,
            oper,
            objoper;
            if (this.source) {
                queryString = "";
                attList     = this.attList;
				params = [];
				curparam = 1;

                for (i = 0; i < attList.length; i++) {
                    val = document.getElementById(this.id + "_" + idName(attList[i])).value;

                    if (val != null && val != "") {
                        if (queryString != "") {
                            queryString += " and ";
                        }

                        oper    = 0;
                        objoper = document.getElementById(this.id + "_oper" + i);

                        if (objoper != null) {
                            oper = parseInt(objoper.value) - 1;
                        }

                        this.otherAttInfo[i].curOper = oper;
						
			var att = this.atts[i];
                        if (att.type === 'date') {
                            val = $.fn.DatePickerParse(val, WAF.utils.dateInputFormat);
                            val =  $.datepicker.formatDate('yy-mm-dd', val);
                        }

                        if(oper == this.queryData.stringOper_begin_with) {
                            val += this.queryData.wildchar;
                        }

                        queryString += this.queryData.buildQueryNode(att.name, att.type, oper, curparam);
						params.push(val);
						curparam++;
                    }
                }
                
                this.source.query(queryString, {
					params: params
				});

            }
        },
        
        /*
         * Purge error message
         * @method purgeErrorMessagesOnForm
         */
        purgeErrorMessagesOnForm : function queryform_purge_error_messages_on_form() {
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
        }
        
    }
);
