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
  panelInfo : {
  	id : number;
  	emName: string // nom de la datastore class
  	source: dataSource // data source du panel
  	sourceID: number
  }
 */

info = 
{
	panelsByID : {},
	listViewsByEm : {},
	formViewsBySource : {},
	curID: 0,
	
	
	getNewID: function()
	{
		this.curID++;
		return this.curID;
	},
	
	
	getPanel: function(id)
	{
		return this.panelsByID[id];
	},
	
	findFirstListView: function(emName)
	{
		var result = 0;
		
		var panels = this.listViewsByEm[emName];
		if (panels != null)
		{
			var panel = firstAttribute(panels);
			if (panel != null)
				result = panel.id;
		}
		
		return result;
	},
	
	findFormView: function(sourceID)
	{
		var result = 0;
		
		var panel = this.formViewsBySource[sourceID];
		if (panel != null)
			result = panel.id;
		return result;
	},
	
	addListViewPanel: function(panelInfo)
	{
		var id = panelInfo.id;
		var emName = panelInfo.emName;
		this.panelsByID[id] = panelInfo;
		this.listViewsByEm[emName] = this.listViewsByEm[emName] || {};
		this.listViewsByEm[emName][id] = panelInfo;
	},
	
	addFormViewPanel: function(panelInfo)
	{
		var id = panelInfo.id;
		var sourceID = panelInfo.sourceID;
		this.panelsByID[id] = panelInfo;
		this.formViewsBySource[sourceID] = panelInfo;
	}
	
	
};



function firstAttribute(obj)
{
	for (e in obj)
	{
		return obj[e];
	}
	
	return null;
}


function defaultColumWidthForType(type)
{
	var result = 70;
	if (type != null)
	{
		switch (type)
		{
			case 'string':
				result = 120;
				break;
				
			case 'number':
			case 'long64':
				result = 70;
				break;
				
			case 'long':
			case 'word':
				result = 50;
				break;
				
			case 'byte':
				result = 30;
				break;
				
			case 'date':
				result = 90;
				break;
		}
	}
	return result;
}

function computePosition(panelInfo, panelH, panelW)
{
	var panel = panelInfo.panel;
	var queryDiv = $('.query-container', panel);
	var inputDiv = $('input', queryDiv);
	var textSpan = $('.qtext', queryDiv);
	var queryButton = $('.query-button', queryDiv);
	var importButton = $('.import-button', queryDiv);
	var exportButton = $('.export-button', queryDiv);

	var queryMarginLeft = parseInt(queryDiv.css("margin-left"));
	var queryMarginRight = parseInt(queryDiv.css("margin-right"));
	var queryPaddingLeft = parseInt(queryDiv.css("padding-left"));
	var queryPaddingRight = parseInt(queryDiv.css("padding-right"));
	var queryWidth = panelW-queryMarginLeft-queryMarginRight;
	queryDiv.width(queryWidth-queryPaddingLeft-queryPaddingRight);
	
	var textSpanWidth = textSpan.width();
	var queryButtonWidth = queryButton.width();
	var inputWidth = queryWidth - queryPaddingLeft - queryPaddingRight - textSpanWidth - ((queryButtonWidth + 10)*3);
	inputDiv.width(inputWidth);
		
	var queryMarginTop = parseInt(queryDiv.css("margin-top"));
	var queryHeight = queryDiv.outerHeight(true);
	
	var gridDiv = $("#"+panelInfo.datagridID);

	var gridMarginTop = parseInt(gridDiv.css("margin-top"));
	var gridMarginLeft = parseInt(gridDiv.css("margin-left"));
	var gridMarginRight = parseInt(gridDiv.css("margin-right"));
	var gridMarginBottom = parseInt(gridDiv.css("margin-bottom"));
	
	var gridTop = gridMarginTop+queryMarginTop+queryHeight;
	var gridHeight = panelH - gridTop - gridMarginBottom;
	var gridWidth = panelW - gridMarginRight - gridMarginLeft;
	
	gridDiv.css({
			width:''+gridWidth+'px',
			height:''+gridHeight+'px',
			top:''+gridTop+'px'
		});

}


function queryClickHandler(event)
{
	var sourceID = $(this).data('source');
	var queryInputID = $(this).data('query-id');
	var input = $("#"+queryInputID)[0];
	var mysource = source[sourceID];
	var queryText = input.value;
	mysource.query(queryText);
	
}

function emClickHandler(event)
{
	var parent = $(this).parent();
	var emName = parent.data('emname');
	var newone = false;
	
	if (event.shiftKey)
		newone = true;
		
	var id;
	if (!newone)
	{
		id = info.findFirstListView(emName);
		if (id == 0)
			newone = true;
	}
	
	if (newone)
	{
		var id = info.getNewID();
		
		var dataClass = WAF.ds.getDataClass(emName);
		if (dataClass != null)
		{
			var panelColor = null;
			if (dataClass.extraProperties != null)
				panelColor = dataClass.extraProperties.panelColor;
				
			var sourceID = emName + "_source"+id;
			var source = WAF.dataSource.create({ id: sourceID, binding: emName });
			
			var panelH = 400;
			var panelW = 600;
			var html = '<div id="panel'+id+'"> </div>';
			$(html).appendTo('body');
			var panel = $('#panel'+id);
			panel.addClass("em-listview-panel-content");
			panel.css({
				top:'0px',
				height:''+panelH+'px',
				left:'0px',
				width:''+panelW+'px',
				position:'relative'
			});
			
			html = '<div class="query-container">';
			html+= '<span class="qtext">Query: </span><input class="query-input" type="text" id="queryInput'+id+'"/>'
			html+= '<div class="exportData-button" data-source="'+sourceID+'"> </div>';
			html+= '<div class="importData-button" data-source="'+sourceID+'"> </div>';
			html+= '<div class="query-button" data-source="'+sourceID+'" data-query-id="queryInput'+id+'"> </div>';
			html+= '</div>';
			
			var queryDiv = $(html).appendTo(panel);
			var hQuery = queryDiv.outerHeight(true);
			
			var datagridID = "datagrid"+id;
			
			html = '<div id="'+datagridID+'"> </div>';
			var xgridDiv = $(html).appendTo(panel);
			var gridDiv = $("#"+datagridID);
			gridDiv.addClass('em-listview-grid waf-widget waf-dataGrid metal');
			gridDiv.data({
				'type': 'dataGrid',
		        'theme': 'metal'
			});
			
	
			gridDiv.css({
				width:'100px',
				height:'100px',
				top:''+hQuery+'px',
				position:'absolute'
			});
			
			if (false && panelColor != null)
			{
				gridDiv.css("background-color", panelColor);
			}
			
			var subattlist = dataClass.getAttributes();
			var subcolumns = [];
			for (var i = 0, nb = subattlist.length; i < nb; i++) {
				var att = subattlist[i];
				if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias") {
					if (att.type != "image")
						subcolumns.push(att.name);
				}
			}

                        var length = subcolumns.length,
                        choixcolumns = [],
                        column = {};
                        
                        for (i = 0; i < length; i++) {
							var att = dataClass[subcolumns[i]];
                            column = {};                            
                            column.sourceAttID = subcolumns[i];
                            column.title = subcolumns[i];
							column.width = defaultColumWidthForType(att.type);
                            choixcolumns.push(column);
                        }
			
			var panelInfo = {
				id:id,
				emName:emName,
				dataClass:dataClass,
				source:source,
				sourceID:sourceID,
				panel:panel,
				isListView:true,
				datagridID:datagridID,
				panelColor:panelColor
				};
				
			info.addListViewPanel(panelInfo);
				
			panel.dialog({
				dialogClass: 'em-listview-panel',
				title:emName,
				width:600,
				height:400,
				resize: function(event, ui)
				{
					var diffH = ui.size.height - panel.parent().height();
					computePosition(panelInfo, panel.height() + diffH, ui.size.width);
				},
				resizeStop: function(event, ui)
				{
					/*var diffH = ui.size.height - - panel.parent().height(); */
					computePosition(panelInfo, panel.height(), ui.size.width);
					grid.gridController.gridView.refresh();
				}
	
			});
			
			computePosition(panelInfo, panel.height(), panel.width())
			
			var grid = new WAF.widget.Grid({
						render: datagridID,
						id: datagridID,
						dataSource: sourceID,
						'data-binding': sourceID,
						columns: choixcolumns,
						'data-column':JSON.stringify(choixcolumns),
						cls: datagridID
					});
			
			
			grid.gridController.onRowClick = function(position)
			{
				var p = panel.dialog("widget");
				var pos = p.position();
				var h = p.height();
				var w = p.width();
				
				pos.left += w + 20;
				
				openFormView(dataClass, source, { top : pos.top, left: pos.left, width: w, height: h});
			}
			
			
			source.resolveSource();
		}	
	}
	else // dans le cas ou on ne cree pas une nouvelle vue
	{
		var panelInfo = info.getPanel(id);
		panelInfo.panel.dialog("open");
		panelInfo.panel.dialog("moveToTop");
	}
}

function openFormView(dataClass, source, pos){
	var sourceID = source.getID();
	var emName = dataClass.getName();
	var id = info.findFormView(sourceID);
	if (id == 0) {
		id = info.getNewID();
		var panelColor = null;
		if (dataClass.extraProperties != null) 
			panelColor = dataClass.extraProperties.panelColor;
		var panelH = 400;
		var panelW = 400;
		if (pos != null) {
			panelW = pos.width;
			panelH = pos.height;
		}
		var html = '<div id="panel' + id + '"> </div>';
		$(html).appendTo('body');
		var panel = $('#panel' + id);
		var formID = "panel" + id;
		panel.addClass("em-formview-panel-content metal waf-widget waf-autoForm metal");
		panel.css({
			top: '0px',
			height: '' + panelH + 'px',
			left: '0px',
			width: '' + panelW + 'px',
			position: 'relative'
		});
		panel.data({
			'type': 'autoForm',
			'theme': 'metal',
			'withoutTable': 'true',
			'resize-each-widget': 'true',
			'lib':'WAF',
			'display-error':'true',
			'binding':sourceID
			
		});
 
		if (false && panelColor != null) {
			panel.css("background-color", panelColor);
		}
		var attrList = [];
		var nameList = [];
		var panelInfo = {
			id: id,
			emName: emName,
			dataClass: dataClass,
			source: source,
			sourceID: sourceID,
			panel: panel,
			isListView: false,
			formID: formID,
			panelColor: panelColor
		};
		info.addFormViewPanel(panelInfo);
		var options = {
			dialogClass: 'em-formview-panel',
			title: emName,
			width: panelW,
			height: panelH,
			resize: function(event, ui){
				$('.waf-widget-body', panel).css('width', parseInt(panel.css('width')));
				var newHeight = parseInt(panel.css('height')) - parseInt($('.waf-widget-footer', panel).css('height'));
				newHeight -= parseInt($('.waf-widget-header', panel).css('height'));
				$('.waf-widget-body', panel).css('height', newHeight + 'px');
			},
			resizeStop: function(event, ui){
			}
			
		};
		if (pos != null) {
			options.position = [pos.left, pos.top];
		}
		panel.dialog(options);
		
		WAF.tags.generate(formID);
		/*
		var form = WAF.AF.buildForm(formID, source, attrList, nameList, {
			toolBarForRelatedEntity: false,
			noToolBar: false,
			allowResizeInput: true,
			withoutTable: true,
			formTitle: emName,
			checkIdentifying: false,
			level: 1,
			allReadOnly: false,
			parent: null,
			included: false,
			inAPanel: true
		});
		*/
		$$(formID).visible = true;
		panel.dialog("widget").draggable("destroy");
		panel.dialog("widget").draggable({
			handle: $("#"+formID+" .waf-form-header")
		});
		
		$("#"+formID+" .waf-form-header").addClass("em-draggable");
	}
	else {
		var panelInfo = info.getPanel(id);
		panelInfo.panel.dialog("open");
	}
}


function exportClickHandler(event)
{
	var sourceID = $(this).data('source');
	var mysource = source[sourceID];
	
	var dataClass = mysource.getDataClass();
	var dataClassName = dataClass.getName();
	
	var progressName = "export_"+dataClassName+"_"+(new Date()).toISOString()+"_"+Math.random();
	var requestURL = WAF.dsExport.exportData({ generateRESTRequestOnly:true, callWithGet:true}, {dataClassName: dataClassName, exportType:"csv", progressInfo: progressName});
	
	var iframe = document.getElementById("iframeexport");
	if (iframe == null)
	{
		$('body').append('<iframe id="iframeexport"></iframe>');
		iframe = document.getElementById("iframeexport");
	}
	iframe.style.display = "none";
	iframe.src = requestURL;
	
	var progressBar = $$("exportProgress");
	/*
	if (progressBar == null)
	{
		var html = '<div id="exportProgress" data-type="progressBar" data-lib="WAF" class="waf-widget waf-progressBar metal waf-widget" data-progressinfo="'+progressName+'"></div>';
	}
	*/
}


function importClickHandler(event)
{
	
}


WAF.onAfterInit = function() 
{	
	var emlist = $("#emlist");
	var emlistTitle = $("#emlistTitle");
	var ems = $("#emlistInside");
	
	var topoffset = ems.position().top;
	
	emlist.draggable({handle:emlistTitle});
	emlist.resizable({
                minHeight: 200,
                minWidth: 100,
				resize: function(event, ui) {
                    var newHeight = ui.size.height;
					newHeight = newHeight - topoffset;
					ems.height(newHeight-20);
                }
				});
				
	
	var html = '';
	var embyName = WAF.ds.getDataClasses();
	for (e in embyName)
	{
		var color = null;
		var dataClass = WAF.ds.getDataClass(e);
		if (dataClass != null && dataClass.extraProperties != null)
			color = dataClass.extraProperties.panelColor;
		html += '<div class="em-element" data-emname="'+e+'">';
		if (color != null)
			html += '<div style="background-color:'+color+'" class="em-elem-pastille"></div>';
		else
			html += '<div class="em-elem-pastille"></div>';
		html += '<span class="em-elem-text">'+e+'</span>';
		//html += '<div class="em-elem-button"> </div>';
		html += '<div class="em-import-button"> </div>';
		html += '<div class="em-export-button"> </div>';
		html += '</div>';
	}
	
	ems.height(emlist.height()-topoffset-20);
	ems.html(html);
	
	$('body').delegate('.em-elem-text', 'click', emClickHandler);
	$('body').delegate('.em-elem-button', 'click', emClickHandler);
	$('body').delegate('.query-button', 'click', queryClickHandler);
	$('body').delegate('.importData-button', 'click', importClickHandler);
	$('body').delegate('.exportData-button', 'click', exportClickHandler);
	
}

