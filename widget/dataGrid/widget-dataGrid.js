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
/**
 * ----------------------------------------------------------------------------
 * content of widget-dataGrid-data.js
 * ----------------------------------------------------------------------------
 */
/**
 * @brief			DataGrid, part of WAF/Widgets
 * @details			Displays data from an entity, uses Model-View-Controller architecture (MVC). DataProvider is
 * a model, GridView is a view, and GridController functions as controller.
 *
 *
 *
 * @author			rudolfpsenicnik
 * @date			February 2009
 * @version			1.0
 *
 * @include			copyright.txt
 */
WAF.classes.DataGrid = function(config){

	var rowHeight;
	(WAF.PLATFORM.modulesString === "mobile" || WAF.PLATFORM.modulesString === "touch") ? rowHeight = 40 : rowHeight = 27;

	config.dataSource = config.dataSource || null;
	if (typeof config.inDesign === 'undefined') {
		config.inDesign = false;
	}

	//load img resource
	var img = new Image();
	img.src = "/waLib/WAF/widget/png/date-picker-trigger.png";


	config.colNames = config.colNames ? config.colNames.split(",") : null;
	config.colAttributes = config.colAttributes ? config.colAttributes.split(",") : null;

	options = {
		columns: config.columns || null,
		colNames: config.colNames,
		colAttributes: config.colAttributes,
		colWidth: config.colWidth,
		parentNode: config.id,
		cacheSize: 0,
		rowHeight: rowHeight,
		dataSource: WAF.source[config.dataSource],
		subscriberID: config.id,
		inDesign: config.inDesign,
		cls: config.cls,
		included: config.included,
		selMode: config.selMode,
		mustDisplayError: config.mustDisplayError,
		errorDiv: config.errorDiv,
		hideFooter: config.hideFooter,
		hideHeader: config.hideHeader,
		textFooter: config.textFooter
	}
	//this.widget = $$(config.id);
	this.widget = WAF.widgets[config.id];

	// Private
	this._private = {
		globals: {
			processingRequests: 0,
			itemCount: 0,
			//dataStore: null,
			columnsDefinition: null,
			sortColumn: null,
			sortOrder: null,
			errorDiv: null,
			mustDisplayError: true
		},
		functions: {
			parent: this,

			checkColumnsDefinition: function(colNames, colAttributes) // old code, should not be used anymore
			{

				if (typeof colNames == "undefined" || typeof colAttributes == "undefined") {
					return null;
				}

				var colNames = colNames.slice();
				var colAttributes = colAttributes.slice();
				var width = 130;
				for (var i = 0; i < colNames.length; i++) {

					// fix a bug
					if (typeof options !== 'undefined') {
						if (typeof options.colWidth !== 'undefined') {
							width = options.colWidth[i] ? parseInt(options.colWidth[i]) : 130;
						}
					}

					if (typeof colNames[i] === 'string') {
						colNames[i] = {
							sourceAttID: colAttributes[i],
							colID: colAttributes[i].split(".").join("_"),
							title: colNames[i],
							width: width,
							sortable: true,
							readOnly: false,
							specialEdit: false
						}
					}
					else {
						if (colAttributes[i].colID === undefined) {
							colAttributes[i].colID = colAttributes[i].sourceAttID;
						}
						if (colAttributes[i].title === undefined) {
							colAttributes[i].title = colAttributes[i].sourceAttID;
						}
						if (colAttributes[i].width === undefined) {
							colAttributes[i].width = 130;
						}
						if (colAttributes[i].sortable === undefined) {
							colAttributes[i].sortable = true;
						}
						if (colAttributes[i].readOnly === undefined || colAttributes[i].readOnly == 'false') {
							colAttributes[i].readOnly = false;
						}

					}
				}

				return colNames;
			},

			// initializes the grid with passed options
			initWithOptions: function(options){

				var dataGrid = options.dataGrid;
				dataGrid.dataSource = options.dataSource;
				dataGrid.subscriberID = options.subscriberID;
				dataGrid.isIncluded = options.included || false;

				if (options.errorDiv != null)
					dataGrid.widget.setErrorDiv(options.errorDiv);

				if (options.mustDisplayError != null)
					dataGrid.allowErrorDisplay(options.mustDisplayError);

				if (options.inDesign)
					dataGrid.isInDesign = true;
				else
					dataGrid.isInDesign = false;

				if (options.columns == null) {
					// then we need to call the old code
					options.columns = this.checkColumnsDefinition(options.colNames ? options.colNames : options.columns, options.colAttributes ? options.colAttributes : options.columns);

					if (options.columns == null && !dataGrid.isInDesign) {
						options.columns = this.checkColumnsDefinition(dataSource.getAttributeNames())
					}
				}
				else {
					// now the 'data-column' generated by the studio contains a JSON represenation of the columns, so it is already almost fully good

					var cols = options.columns;
					var nbcol = cols.length;
					for (var i = 0; i < nbcol; i++) {
						var col = cols[i];
						if (col.format != null && typeof(col.format) == 'string') {
							col.format = {
								format: col.format
							};
						}
						if (col.colID == null && col.sourceAttID != null) {
							col.colID = col.sourceAttID.split(".").join("_");
						}
						if (col.sortable == null && col.type !== 'image')
							col.sortable = true;
					}
				}

				/*
				 if (options.columns == null || options.columns.length == 0)
				 {
				 options.columns = [{ coldID:"col1" }];
				 }
				 */
				//WAF.utils.debug.console.log('[DataGrid] WAF.classes.DataGrid._private.functions.initWithOptions called');

				//dataGrid._private.globals.dataStore = options.dataStore;

				var gridViewOptions = {
					cacheSize: options.cacheSize,
					columns: options.columns,
					rowHeight: options.rowHeight,
					cls: options.cls,
					selMode: options.selMode,
					hideFooter: options.hideFooter,
					hideHeader: options.hideHeader,
					textFooter: options.textFooter
				};

				dataGrid._private.globals.columnsDefinition = options.columns;

				// create grid at specified node
				if (!!options.parentNodeId) {
					gridViewOptions.createInNode = $('#' + options.parentNodeId);

				}
				else
					if (!!options.parentNode) {
						gridViewOptions.createInNode = $('#' + options.parentNode);

					}
					else {
						return false;
					}

				// init the grid
				dataGrid.gridController.gridView.initWithOptions(gridViewOptions);

				dataGrid.sortColumn = null;

				if (dataGrid.isInDesign)
					dataGrid.sortOrder = null;
				else {
					dataGrid.sortOrder = null;

					// get data
					// dataGrid._private.functions.queryEntityCollection({ dataGrid : dataGrid, query : options.query,customUrl : options.cutomUrl });

					if (dataGrid.sortColumn != null) {
						dataGrid.gridController.gridView.setSortIndicator(dataGrid.sortColumn, dataGrid.sortOrder);
					}
				}
				// try to display data if already available
				dataGrid.gridController.gridView.computeRowWidth();
				dataGrid.redraw();
			}

		},
		handlers: {}
	};

	/**
	 * DataGrid.initWithOptions(options)
	 * \~english
	 * @brief             Initializes the grid
	 * @details           Grid is initialized with options, of which most are optional.
	 *
	 * @param options : object
	 *
	 * @return this : DataGrid
	 *
	 * @code
	 *
	 * // set options for the grid
	 * // create with Contacts datastore class, use default attributes
	 *
	 * var options = {
	 * 	createInNode	: $('#myGrid'),
	 * 	dataClass		: 'Contacts'
	 * }
	 *
	 * // create a data grid
	 * var myGrid = new WAF.classes.DataGrid().initWithOptions(options);
	 *
	 * @endcode
	 */
	this.initWithOptions = function(options){

		//WAF.utils.debug.console.log('[DataGrid] WAF.classes.DataGrid._private.functions.initWithOptions called');

		// set reference to the object
		options.dataGrid = this;

		this._private.functions.initWithOptions(options);

		return this;

	}

	this.allowErrorDisplay = function(display){
		if (typeof display === 'boolean')
			this._private.globals.mustDisplayError = display;
		return this._private.globals.mustDisplayError;
	}

	this.redraw = function(){

		if (!this.isInDesign /*&& this._private.globals.dataStore*/) {
			var itemCount = 0;
			if (this.dataSource) {
				itemCount = this.dataSource.length;
			}

			for (var rowCount = 0; rowCount < this.gridController.gridView._private.globals.rows.length; rowCount++) {
				var row = this.gridController.gridView._private.globals.rows[rowCount];
				row.needsDataUpdate = true;
			}

			// check if entity count matches row count for the grid
			// if not, update grid row numbers
			//if (itemCount != this.gridController.gridView.getRowCount())
			//{
			this._private.globals.itemCount = itemCount;
			this.gridController.gridView.setRowCount(itemCount);
			//}

			// this._private.globals.entityCollectionResultEvent = event;

			// update rows
			// replace with public API
			this.gridController.gridView._private.functions.updateRowPositions({
				gridView: this.gridController.gridView,
				forceUpdate: true
			});
			this.gridController.gridView._private.functions.updateVisibleRowData({
				gridView: this.gridController.gridView
			});

			/*
			 if ($("#containerLoading"))
			 {
			 $("#containerLoading").fadeOut('fast');
			 }
			 */
		}
	}


	/*
	 // Set grid controller functions
	 */
	this.kill = function(){
		this.gridController.gridView.kill();
	}


	this.gridController = new WAF.classes.GridController();
	this.gridController.dataGrid = this;

	this.gridController.errorHandler = function(event){
		var gridView = event.userData.gridView;
		var gridController = gridView.gridController;

		var handler = gridController.onError;
		var cont = true;
		if (handler != null) {
			var b = handler(event);
			if (b != null && b === false)
				cont = false;
		}
		if (cont && gridController.dataGrid.widget._private.globals.mustDisplayError) {
			var errordiv = gridController.dataGrid.widget.getErrorDiv();
			event.message = event.userData.errorMessage || null;
			WAF.ErrorManager.displayError(event, errordiv);
		}
	}

	this.gridController.getColumnCount = function(grid){
		var result, columnDef;

		columnDef = this.dataGrid._private.globals.columnsDefinition;

		if (typeof(columnDef) == 'object') {
			result = columnDef.length;
		}
		else {
			result = 0;
		}

		return result;
	}

	this.gridController.getRowCount = function(grid){

		//WAF.utils.debug.console.log('[DataGrid] WAF.classes.GridController.getRowCount called');

		return this.dataGrid._private.globals.itemCount;
	}

	this.gridController.setContentForRow = function(rowNumber){

		if (!this.dataGrid.isInDesign)
			//this.dataGrid._private.globals.dataStore.getEntityByPosition(rowNumber, this.parseEntity, this.dataGrid, false);
			if (this.dataGrid.dataSource) {
				this.dataGrid.dataSource.getElement(rowNumber, {
					onSuccess: this.parseElement,
					onFailure: this.parseElement,
					delay: 10,
					delayID: this.dataGrid.subscriberID
				}, this.dataGrid)
			}
		// return blank array since we'll call handler that will populate this
		return [];

	}

	this.gridController.setStyleForRow = function(rowNumber){
		return {
			rowStyle: ((rowNumber % 2) ? 'waf-widget-odd' : 'waf-widget-even')
		};
	}


	this.gridController.isContentAvailableForRow = function(rowNumber){

		//return this.dataGrid._private.globals.dataStore.isEntityInCache(rowNumber);
		return true;
	}

	this.gridController.onHeaderClick = function(cell, columnNumber){
		if (!this.dataGrid.isInDesign) {
			//console.log(this.dataGrid._private.globals.columnsDefinition[columnNumber])
			if (!this.dataGrid._private.globals.columnsDefinition[columnNumber].sortable) {
				return;
			}

			/*
			 if ($("#containerLoading"))
			 {
			 $("#containerLoading").show();
			 }
			 */
			// Set the sortOrder
			if (this.dataGrid.sortColumn != null) {
				// Clear sortIndicator
				this.dataGrid.gridController.gridView.resetSortIndicator(this.dataGrid.sortColumn);

				if (columnNumber === this.dataGrid.sortColumn) {
					if ((!this.dataGrid.sortOrder) | (this.dataGrid.sortOrder === 'desc')) {
						this.dataGrid.sortOrder = 'asc';
					}
					else {
						this.dataGrid.sortOrder = 'desc';
					}
				}
				else {
					this.dataGrid.sortOrder = 'asc';
				}
			}
			else {
				this.dataGrid.sortOrder = 'asc';
			}

			this.dataGrid.sortColumn = columnNumber;
			this.dataGrid.gridController.gridView.setSortIndicator(this.dataGrid.sortColumn, this.dataGrid.sortOrder);
			this.dataGrid.dataSource.orderBy(this.dataGrid._private.globals.columnsDefinition[columnNumber].sourceAttID + " " + this.dataGrid.sortOrder /*, { keepSelection: this.dataGrid.getSelection().prepareToSend()} */);
		}
	}

	/*
	 // Custom grid controller functions
	 */
	this.gridController.parseElement = function(event){
		var dataGrid = event.data;
		var rowNumber = event.position;
		var elem = event.element;

		var gridView = dataGrid.gridController.gridView;

		if (event.error != null && event.error.length > 0) {
			gridView.drawRow(rowNumber, null);
		}
		else {
			gridView.drawRow(rowNumber, elem);
		}
	}


	this.column = function(colRef, colSettings){
		return this.gridController.gridView.column(colRef, colSettings);
	}

	this.columns = function(colSettings){
		return this.gridController.gridView.columns(colSettings);
	}

	this.centerRow = function(rowNumber, options){
		options = options;
		var gridView = this.gridController.gridView;
		gridView.centerRow(rowNumber, options);
	}

	this.setOptions = function(options){
		var gridView = this.gridController.gridView;
		gridView.setOptions(options);
	}

	this.setReadOnly = function(inReadOnly){
		var doLock = true;
		if (arguments.length > 0 && typeof inReadOnly === 'boolean') {
			doLock = inReadOnly;
		}

		this.readOnly = doLock;
		// Toolbar
		if (doLock) {
			$("#" + this.subscriberID + " .waf-dataGrid-footer .waf-toolbar").hide();
		}
		else {
			$("#" + this.subscriberID + " .waf-dataGrid-footer .waf-toolbar").show();
		}

		// Columns
		var cols = this.columns();
		if (cols != null) {
			cols.forEach(function(theCol, idx, arr){
				theCol.readOnly = doLock;
			});
		}
	}

	this.getSortIndicator = function(){
		// One or all elements may be null. order is a string, 'asc', 'desc'
		return {
			colNb: this.sortColumn,
			order: this.sortOrder
		};
	}

	this.setSortIndicator = function(colNum, order){
		this.sortColumn = colNum;
		this.sortOrder = order;
		this.gridController.gridView.setSortIndicator(colNum, order);
	}

	this.resetSortIndicator = function(columnNb){
		this.sortColumn = null;
		this.sortOrder = null;
		this.gridController.gridView.resetSortIndicator(columnNb);
	}

	this.hideSortIndicators = function(){
		this.$domNode.find('.waf-sort').hide();
	}

	this.showSortIndicators = function(){
		this.$domNode.find('.waf-sort').show();
	}

	// Sort only the first columns found with a sort indicator
	this.sortAgain = function(options, userData) // options is optionnal. Contains the usual onSuccess/onError callbacks
	{
		var col = this.sortColumn !== null ? this.sortColumn : -1, order = this.sortOrder ? this.sortOrder : '';
		options = options || {};
		userData = userData || null;

		//options.keepSelection = this.getSelection().prepareToSend();

		if (col >= 0 && (order === 'asc' || order === 'desc')) {
			this.dataSource.orderBy(this._private.globals.columnsDefinition[col].sourceAttID + " " + order, options, userData);
		}
	}

	this.getSelectionMode = function(){
		return this.gridController.gridView.getSelectionMode();
	}

	this.setSelectionMode = function(inMode){
		this.gridController.gridView.setSelectionMode((inMode));
	}

	this.countSelected = function(){
		return this.gridController.gridView.countSelected();
	}

	this.getSelectedRows = function(){
		return this.gridController.gridView.getSelectedRows();
	}

	this.setSelectedRows = function(rowNumbers){
		this.gridController.gridView.setSelectedRows(rowNumbers);
	}

	this.getSelection = function(){
		return this.gridController.gridView.getSelection();
	}

	this.reduceToSelected = function(options, userData){
		var rows;
		// Handle special case (all selected)
		if (this.gridController.gridView.countSelected() === this.dataSource.length) {
			this.gridController.gridView.resetSelection();
		}
		else {
			this.dataSource.buildFromSelection(this.getSelection(), options, userData);
		}
	}

	this.setRowHeight = function(rowHeight){
		this.gridController.gridView.setRowHeight(rowHeight);
		this.redraw();
	}

	this.getRowHeight = function(){
		return this.gridController.gridView._private.globals.rowHeight;
	}

	this.goToCell = function(rowPos, colID, handler){
		this.gridController.gridView.goToCell(rowPos, colID);
	}

	this.stopEditing = function(handler){
		this.gridController.gridView.goToCell(rowPos, colID);
	}


	/*
	 // Constructor
	 */
	if (!!options) {
		this.initWithOptions(options);
	}

	// subscribe to the dataSource if any
	var gridThis = this;

	if (!this.isInDesign && this.dataSource != null && this.widget && typeof Designer === 'undefined') {
		this.dataSource.removeListener({widgetId: this.widget.id});

		this.dataSource.addListener("all", WAF.classes.DataGrid.gridSourceEventHandler, {
			id: this.widget.id,
			listenerID: options.subscriberID,
			listenerType: 'grid'
		}, {
			dataGrid: this
		});
	}

	// default behaviour
	if (!this.isInDesign && this.dataSource != null) {
		this.gridController.onRowClick = function(event){
			//if (this.dataSource._private.subscribers.length > 0)

			//gridThis.dataSource.select(position);

		};
	}


	return this;
}



// -----------------------------------------------------

WAF.classes.DataGrid.widgetBoolHandler = function(domObj, event, val){
	var parent = $(domObj).parent();
	var row = parent[0].gridRow;
	var cell = parent[0].gridCell;
	var dataSource = row.gridView.gridController.dataGrid.dataSource;
	var sourceAtt = dataSource.getAttribute(cell.col.sourceAttID);
	if (sourceAtt != null) {
		row.gridView._private.globals.needAutoSave = true;
		sourceAtt.setValue(val);
		dataSource.save();
	}
}


WAF.classes.DataGrid.checkBoxBlurHandler = function(event){
    var parent = $(this).parent();
	var row = parent[0].gridRow;
	var cell = parent[0].gridCell;


        var textInput = this;
        var gridView = row.gridView;
        if (gridView._private.globals.editInfo != null) {
            /*gridView._private.globals.editInfo.blurTimout = window.setTimeout(function(){
                //if (!textInput.dontKillOnBlur) {
                    if (gridView._private.globals.editInfo != null)
                        gridView._private.functions.endEditCell({
                            gridView: gridView
                        });
                //}
            }, 200);*/
        }
}

WAF.classes.DataGrid.checkBoxHandler = function(event){
	var parent = $(this).parent();
	var that = this;
	var row = parent[0].gridRow;
	var gridview = row.gridView;
	var maj = gridview._private.globals.currentRow === row.rowNumber;


	var val = this.checked;
	if (maj) {
		WAF.classes.DataGrid.widgetBoolHandler(this, event, val);
	} /*else {
		console.log('there');
		debugger;
		var rowNum = row.rowNumber;
		gridview.setCurrentRow(rowNum);
//		setTimeout(function() {
		WAF.classes.DataGrid.widgetBoolHandler(that, event, val);
//		},0);
	}*/
};

WAF.classes.DataGrid.radioTrueHandler = function(event){
	WAF.classes.DataGrid.widgetBoolHandler(this, event, true);
}


WAF.classes.DataGrid.radioFalseHandler = function(event){
	WAF.classes.DataGrid.widgetBoolHandler(this, event, false);
}


WAF.classes.DataGrid.gridSourceEventHandler = function(event) {
	var grid = event.data.dataGrid;
	var gridView = grid.gridController.gridView;
	var gvFunctions = gridView._private.functions;
	var gvars = gridView._private.globals;

	if (event.eventKind == 'onCollectionChange') {
		var posInSource = event.dataSource.getPosition();
		//gridView.setCurrentRow(posInSource, false);
		gvars.currentRow = posInSource;
		gvFunctions.hideCurrentRows({
			gridView : gridView
		});
		if (event.transformedSelection == null)
			gridView.resetSelection();
		grid.redraw();
		gvFunctions.showCurrentRows({
			gridView : gridView
		});
	}
	if (event.eventKind == "onSelectionChange") {
		gvFunctions.hideCurrentRows({
			gridView : gridView
		});
		gvFunctions.showCurrentRows({
			gridView : gridView
		});
	} else if (event.eventKind == "onAttributeChange") {

		var posInSource = event.dataSource.getPosition();

        if(grid.dataSource.getAttribute(event.attributeName).kind == 'relatedEntity') {
            // update grid attributes relatedEntity cell
            var regexp = new RegExp('^' + event.attributeName + '(\\.\\w+|)$');
            grid._private.globals.columnsDefinition.forEach(function(e) {
                if(regexp.test(e.sourceAttID)) {
		            gridView.updateCell(posInSource, e.colID, event.dataSource.getAttributeValue(e.sourceAttID));
                }
            });
        } else {
            var col = grid.column(event.attributeName);
            var updateval = event.dataSource[event.attributeName];

		    gridView.updateCell(posInSource, event.attributeName/* faire une indirection ici pour retrouver le colID a partir de l'attribute name */, updateval);
        }

	} else if (event.eventKind == 'onBeforeCurrentElementChange') {
		var posInSource = event.dataSource.getPosition();
		gridView.drawRow(posInSource, event.dataSource, true);
		if (gvars.needAutoSave) {
			gvars.needAutoSave = false;
			event.dataSource.save({
				onError : gridView.gridController.errorHandler || null
			});
		}
	} else if (event.eventKind == 'onCurrentElementChange' || event.eventKind == 'onCollectionChange') {
		var mustSelectRows = null;
		if (event.eventData != null)
			mustSelectRows = event.eventData.mustSelectRows || null;
		if (mustSelectRows != null) {
			gvFunctions.hideCurrentRows({
				gridView : gridView
			});
		}
		var posInSource = event.dataSource.getPosition();
		gridView.setCurrentRow(posInSource, event.transformedSelection != null);

		gridView.drawRow(posInSource, event.dataSource);

		if (mustSelectRows != null) {
			var sel = gridView.getSelection();
			sel.setSelectedRows(mustSelectRows);
			gvFunctions.showCurrentRows({
				gridView : gridView
			});
		}

		var dispatcherOptions = event.dispatcherOptions;

		var that = this;

		if (WAF.PLATFORM.modulesString === "mobile") {
			var triggerEnd = new jQuery.Event("touchend");

			triggerEnd.touches = [];

			$("#" + grid.subscriberID + "-viewportNode").trigger(triggerEnd);

		}

		if (dispatcherOptions != null) {
			if (dispatcherOptions.gridView != null && dispatcherOptions.execOnEventDispatch != null) {
				dispatcherOptions.execOnEventDispatch(dispatcherOptions.gridView);
			}
		}
	} else if (event.eventKind == 'onElementSaved') {
		var posInSource = event.position;
		var elem = event.element;
		gridView.drawRow(posInSource, elem);
	}
}

/**
 * ----------------------------------------------------------------------------
 * content of widget-dataGrid-view.js
 * ----------------------------------------------------------------------------
 */
/**
 * @brief			GridView, part of WAF/UI/Grid
 * @details			Infinite scrolling grid object
 *
 *
 *
 * @author			rudolfpsenicnik
 * @date			February 2009
 * @version			1.0
 *
 * @include			copyright.txt
 */
if (WAF.gridUtil == null) {
	WAF.gridUtil = {};
}

WAF.classes.GridView = function(){

	var theGridView = this;
	var visibleHeaderHeight = (WAF.PLATFORM.modulesString === "mobile" || WAF.PLATFORM.modulesString === "touch") ? 25 : 32,
		visibleFooterHeight = (WAF.PLATFORM.modulesString === "mobile" || WAF.PLATFORM.modulesString === "touch") ? 25 : 30;

	var rowHeight;
	(WAF.PLATFORM.modulesString === "mobile") ? rowHeight = 50 : rowHeight = 27;

	// Private
	this._private = {
		globals: {

			options: {
				autoScrollOnSelected: true
			},

			// DOM nodes
			headerNode: null, // headerNode - viewport for the column titles
			headerContainerNode: null, // headerContainerNode - container for header row bound horizontally to viewportContainerNode
			targetNode: null, // DOM node where grid is inserted
			viewportNode: null, // viewport node that holds scrollable content (rows)
			viewportContainerNode: null, // container for viewports, provides system scrollbars
			statusNode: null, // statusNode - viewport for status bar
			// rows
			rows: [], // array of row objects
			pageSize: 0, // how many rows per page.
			visibleRowCount: 0, // how many rows are visible on screen at one time?
			visibleAndCacheRowCount: 0, // visible and cached row count
			totalRowCount: 0, // how many rows should there be in total?
			rowHeight: rowHeight, // used to calculate viewport height
			enableAlternateRowStyling: true, //
			rowContentUpdateDelayInMs: 0,
			/*	miliseconds that need to pass before requesting data for row
			 set to 0 to disable
			 this is to prevent too many row content update requests
			 while rapidly scrolling
			 */
			rowContentUpdateDelayEvent: null, // row content update delay window.setTimeout event
			useHoverEffectForRows: true, // applies .hover class name to row when hovered over
			// columns
			columns: [], // array of column objects
			// cells
			cellNeedsUpdateHTMLContent: '&nbsp', // displayed in cell that is still waiting for data
			// cache
			cacheSizeInPages: 0, // how many pages of rows will be rendered off-screen
			cacheSizeInRows: 0, // calculated based on number of cache pages
			// flags
			currentlyUpdatingRowPositions: false, // rows are being repositioned
			vScrollBarWidth: 15,

			resizeHasBeenStarted: false,
			editHasBeenStarted: false,
			currentRow: -1,
			lastActiveCell: null

		},
		selection: {
			//sel			: new WAF.Selection('single'),
			cssClass: 'waf-state-active', // Centralize the name of the class
			curEvt: null
		},
		functions: {

			// initializes the grid with passed options
			initWithOptions: function(options){
				//WAF.utils.debug.console.log('[GridView] WAF.classes.GridView._private.functions.initWithOptions called');

				var gridView = options.gridView;

				if ((options.cacheSize != undefined) && (options.cacheSize != null)) {
					gridView._private.globals.cacheSizeInPages = options.cacheSize;
				}

				if (!!options.rowHeight) {
					gridView._private.globals.rowHeight = options.rowHeight;
				}

				if (options.selMode && options.selMode === 'multiple' || options.selMode === 'none') {
					var sel = gridView.getSelection();
					if (sel != null) {
						sel.reset(options.selMode);
					}
				}

				if (options.hideFooter) {
					gridView._private.globals.footerHeight = 0;
				}
				else {
					gridView._private.globals.footerHeight = visibleFooterHeight;
				}

				if (options.hideHeader) {
					gridView._private.globals.headerHeight = 0;
				}
				else {
					gridView._private.globals.headerHeight = visibleHeaderHeight;
				}

				gridView._private.globals.footerText = options.textFooter;

				// create DOM node and insert basic DOM elements
				gridView._private.functions.initGridDOMatNode({
					node: options.createInNode,
					gridView: gridView,
					columns: options.columns,
					cls: options.cls
				});
			},

			// sets up grid at specified node, creates basic DOM elements
			initGridDOMatNode: function(options){

				//WAF.utils.debug.console.log('[GridView] WAF.classes.GridView._private.functions.initGridDOMatNode called');

				var gridView = options.gridView,
					that = this;

				// set grid node as private variable
				var targetNode = options.node;
				gridView._private.globals.targetNode = options.node;

				targetNode.data('type', 'dataGrid').addClass('waf-widget waf-dataGrid ' + options.cls || '').empty();

				// create header node
				var headerNode = $('<div></div>').addClass('waf-widget-header waf-dataGrid-header waf-user-select-none');
				gridView._private.globals.headerNode = headerNode;

				// add header node to DOM
				headerNode.appendTo(targetNode);

				// add header container to DOM
				var headerContainerNode = $('<div></div>').addClass('container');
				gridView._private.globals.headerContainerNode = headerContainerNode;
				headerContainerNode.appendTo(headerNode);

				// create viewport node
				var viewportNode = $('<div></div>').addClass('waf-widget-body waf-dataGrid-body');
				if (WAF.PLATFORM.modulesString === "mobile") {
					viewportNode.prop('id', options.node[0].id + "-viewportNode");
				}
				gridView._private.globals.viewportNode = viewportNode;

				// add viewport node to DOM
				viewportNode.appendTo(targetNode);

				// bind events
				viewportNode.bind('scroll', {
					gridView: gridView
				}, gridView._private.functions.onViewportScroll);

				// add viewport container to DOM
				var viewportContainerNode = $('<div></div>').addClass('container');
				gridView._private.globals.viewportContainerNode = viewportContainerNode;
				viewportContainerNode.appendTo(viewportNode);

				//manage touch device
				if (WAF.PLATFORM.modulesString === "mobile") {

					$(window).bind( 'orientationchange', function(e){
						window.setTimeout(function(){
							$$(options.node[0].id).redraw();
						}, 0);
					});

					viewportContainerNode[0].id = options.node[0].id + "-viewportContainerNode";
					// bind touch events
					viewportContainerNode.bind('touchmove', {
						gridView: gridView
					}, function(){
						gridView._private.globals.headerContainerNode.css("margin-left", gridView._private.globals.viewportContainerNode.position().left + "px")
						gridView._private.globals.containerMoved = true;
						gridView._private.globals.istouch = false;
					});
					viewportNode.bind('touchend', {
						gridView: gridView
					}, gridView._private.functions.onViewportScroll);
				}

				// create status node
				var statusNode = $('<div></div>').addClass('waf-widget-footer waf-dataGrid-footer waf-status waf-user-select-none');
				gridView._private.globals.statusNode = statusNode;

				// add status node to DOM
				statusNode.appendTo(targetNode);

				// create statusLeftContainer node
				var statusLeftContainer = $('<div></div>').addClass('waf-status-element waf-status-left');
				gridView._private.globals.statusLeftContainer = statusLeftContainer;

				statusLeftContainer.appendTo(statusNode);

				function hitPlus(event){
					gridView._private.functions.endEditCell({
						gridView: gridView,
						saveAnyway: true,
						saveHandler: function hitPlusSave(event){
							WAF.gridUtil.addRow(gridView);
						}
					});

				}

				function hitMinus(event){
					gridView._private.functions.endEditCell({
						gridView: gridView,
						saveAnyway: true,
						saveHandler: function hitMinusSave(event){
							WAF.gridUtil.delRow(gridView);
						}
					});

				}
				/*
				 if (gridView.gridController.dataGrid.isIncluded)
				 {
				 // in the futur we may generate a special toolbar
				 }
				 else
				 */
				if (true) {
					var toolbar = new WAF.widget.Toolbar([{
						icon: {
							size: 16,
							type: 'plus'
						},
						text: '',
						title: 'Add',
						click: !gridView.gridController.dataGrid.isInDesign && hitPlus
					}, {
						icon: {
							size: 16,
							type: 'minus'
						},
						text: '',
						title: 'Delete',
						click: !gridView.gridController.dataGrid.isInDesign && hitMinus
					}]);

					toolbar.appendTo(statusLeftContainer);
				}

				/* if (!gridView.gridController.dataGrid.isInDesign)
				 {
				 toolbar.find('.waf-button').bind('click', {gridView: gridView}, function(event)
				 {
				 var gridView = event.data.gridView;
				 WAF.gridUtil[$(this).prop('data-action')](gridView);
				 });
				 } */
				// create statusCenterContainer node
				var statusCenterContainer = $('<div></div>').addClass('waf-status-element waf-status-center');
				gridView._private.globals.statusCenterContainer = statusCenterContainer;

				// add statusCenterContainer node to DOM
				statusCenterContainer.appendTo(statusNode);

				// create statusRightContainer node
				var statusRightContainer = $('<div></div>').addClass('waf-status-element waf-status-right');
				gridView._private.globals.statusRightContainer = statusRightContainer;

				// add statusRightContainer node to DOM
				statusRightContainer.appendTo(statusNode);

				// need to know column count at this point
				// check with controller for column number
				if (!!gridView.gridController) {
					if (!!gridView.gridController.getColumnCount) {
						var columnCount = gridView.gridController.getColumnCount(gridView);
						if (!!columnCount) {
							gridView._private.functions.setColumnCount({
								gridView: gridView,
								columnCount: columnCount,
								columns: options.columns
							});
						}
					}
				}

				// resize viewport and container
				gridView._private.functions.updateHeaderSize({
					gridView: gridView
				});
				gridView._private.functions.updateViewportSize({
					gridView: gridView
				});
				gridView._private.functions.updateStatusSize({
					gridView: gridView
				});
				gridView._private.functions.updateViewportContainerSize({
					gridView: gridView
				});

				// add rows and cells
				gridView._private.functions.updateDOMToMatchRowAndColumnCounts({
					gridView: gridView,
					columns: options.columns,
					init: true
				});
				if (!gridView.gridController.dataGrid.isInDesign) {
					if (gridView.gridController.dataGrid.dataSource == null) {
						$('<div class="waf-datagrid-missingBinding">Datasource is either missing <br>or <br>invalid</div>').appendTo(viewportContainerNode);
					}
				}

			},

			refresh: function(options){

				var gridView = options.gridView;

				// resize viewport and container
				gridView._private.functions.updateViewportContainerSize({
					gridView: gridView
				});

				// add rows and cells
				gridView._private.functions.updateDOMToMatchRowAndColumnCounts({
					gridView: gridView
				});

				// mark all rows as needing data
				for (var rowCount = 0; rowCount < gridView._private.globals.rows.length; rowCount++) {
					gridView._private.globals.rows[rowCount].needsDataUpdate = true;
				}

				// repopulate with data
				gridView.computeRowWidth();
				gridView._private.functions.updateRowPositions({
					gridView: gridView,
					forceUpdate: true
				});
				gridView._private.functions.updateVisibleRowData({
					gridView: gridView
				});

			},

			setTotalRowCount: function(options){
				var gridView = options.gridView;
				var rowCount = options.rowCount;
				var gvGlobals = gridView._private.globals;
				var gvFunctions = gridView._private.functions;

				gvGlobals.totalRowCount = rowCount;

				// resize viewport and container
				gvFunctions.updateViewportSize({
					gridView: gridView
				});
				gvFunctions.updateViewportContainerSize({
					gridView: gridView
				});

				// update status bar
				gvGlobals.statusCenterContainer.html(rowCount + ' ' + gvGlobals.footerText);

				// add rows and cells
				gvFunctions.updateDOMToMatchRowAndColumnCounts({
					gridView: gridView
				});

				//add specific scroll behavior for mobile to the viewport container
				if (WAF.PLATFORM.modulesString === "mobile") {

					if (gridView._private.scrollObject) {
						gridView._private.scrollObject.destroy();
					}

					//if (!gridView._private.scrollObject && rowCount != 1) {
					gridView._private.scrollObject = new iScroll(gridView._private.globals.targetNode[0].id + "-viewportNode", {
						"desktopCompatibility": false
					});
					//}

				}
			},

			// sets number of columns and creates column objects
			setColumnCount: function(options){

				var gridView = options.gridView;
				var setColumnCount = options.columnCount;
				gridView._private.globals.colsByID = {};

				// loop with column count and create column objects
				for (var columnCount = 0; columnCount < setColumnCount; columnCount++) {

					// create column object
					var optcol = options.columns[columnCount];
					var xatt = null;
					var sourceAtt = null;
					var xsource = gridView.gridController.dataGrid.dataSource;
					if (xsource != null) {
						if (xsource.getClassAttributeByName != null) {
							xatt = xsource.getClassAttributeByName(optcol.sourceAttID);
							if (xatt != null)
								xsource.declareDependencies(optcol.sourceAttID);
						}
						if (xsource.getAttribute != null) {
							sourceAtt = xsource.getAttribute(optcol.sourceAttID);
						}
					}
					var format = {};
					if (xatt != null && xatt.defaultFormat != null)
						format = xatt.defaultFormat;
					if (optcol.format != null)
						format = optcol.format;
					var readOnly = false;

					if (optcol.readOnly == 'false') {
						optcol.readOnly = false;
					}

					if (optcol.readOnly || xatt == null || xatt.readOnly)
						readOnly = true;
					if (sourceAtt == null || !sourceAtt.isFirstLevel || !sourceAtt.simple)
						readOnly = true;

					var specialEdit = false;
					if (xatt != null && (xatt.type === 'image' || xatt.type === 'bool'))
						specialEdit = true;

					var widget = options.gridView.gridController.dataGrid.widget;
					var column = {
						columnNumber: columnCount,
						title: optcol.title,
						style: optcol.style,
						width: optcol.width,
						type: optcol.type,
						format: format,
						readOnly: readOnly,
						specialEdit: specialEdit,
						originalWidth: optcol.width,
						sourceAttID: optcol.sourceAttID,
						colID: optcol.colID,
						gridview: gridView,
						setTextSize: WAF.classes.GridColumn.setTextSize,
						setFontSize: WAF.classes.GridColumn.setTextSize,
						setWidth: WAF.classes.GridColumn.setWidth,
						setTextColor: WAF.classes.GridColumn.setTextColor,
						setColor: WAF.classes.GridColumn.setColor, // DEPRECATED
						setBackgroundColor: WAF.classes.GridColumn.setBackgroundColor,
						setRenderer: WAF.classes.GridColumn.setRenderer,
						setFormat: WAF.classes.GridColumn.setFormat,
						setAlignment: WAF.classes.GridColumn.setAlignment,
						hideSortIndicators: WAF.classes.GridColumn.hideSortIndicators,
						showSortIndicators: WAF.classes.GridColumn.showSortIndicators,

						source: xsource,
						att: xatt,
						getFormattedValue: widget ? widget.getFormattedValue : null,
						getValueForInput: widget ? widget.getValueForInput : null
					};

					// check for column properties
					if (!!gridView.gridController.setPropertiesForColumn) {
						var columnPropertiesFromController = gridView.gridController.setPropertiesForColumn(column);

						if (!!columnPropertiesFromController.width) {
							column.width = columnPropertiesFromController.width;
						}
					}

					// add column object to array
					gridView._private.globals.columns.push(column);
					gridView._private.globals.colsByID[optcol.colID] = column;
				}
			},

			// updates width and height for viewport container based targetNode size
			updateViewportSize: function(options){

				var gridView = options.gridView,
					viewportTop,
					viewportBottom;

				viewportTop = gridView._private.globals.headerHeight;
				viewportBottom = gridView._private.globals.footerHeight;

				// set position of targetNode, which is DOM element where grid was created in
				gridView._private.globals.viewportNode.css({
					left: 0,
					right: 0,
					top: viewportTop + 'px',
					bottom: viewportBottom + 'px'
				});

				// gridView._private.globals.viewportNode.height(gridView._private.globals.targetNode.height() - 25 - 20); // J.F. header code
			},

			// updates width and height for header container based targetNode size
			updateHeaderSize: function(options){

				var gridView = options.gridView;

				// set position of headerNode and height to 25, which is DOM element where grid was created in
				gridView._private.globals.headerNode.css({
					left: 0,
					right: 0
				});

				//gridView._private.globals.headerNode.height(32); // J.F. If customize modify updateViewportSize too "- 25"
				gridView._private.globals.headerNode.height(gridView._private.globals.headerHeight);

                                if (gridView._private.globals.headerHeight === 0) {
                                    gridView._private.globals.headerNode.css('border-width', '0px 0px 0px 0px');
                                }
			},

			// updates width and height for status container based targetNode size
			updateStatusSize: function(options){

				var gridView = options.gridView, statusNodeHeight;

				// set position ofstatusNode and height to 15, which is DOM element where grid was created in
				gridView._private.globals.statusNode.css({
					left: 0,
					right: 0,
					bottom: 0
				});

				//(WAF.PLATFORM.modulesString === "mobile") ? statusNodeHeight = 25 : statusNodeHeight = 25;
				statusNodeHeight = gridView._private.globals.footerHeight;

				gridView._private.globals.statusNode.height(statusNodeHeight); // J.F. If customize modify updateViewportSize too "- 20"
			},

			// updates width and height for viewport container based on row & column properties
			updateViewportContainerSize: function(options){

				var gridView = options.gridView;

				// width of container is width of all columns combined, calculate it
				var width = 0;
				for (var columnCount = 0; columnCount < gridView._private.globals.columns.length; columnCount++) {
					//width += parseInt(gridView._private.globals.columns[columnCount].originalWidth);
					width += parseInt(gridView._private.globals.columns[columnCount].width);
				}

				if (width < gridView._private.globals.viewportNode.width()) {
					if (WAF.PLATFORM.modulesString === "mobile") {
						// no sticky scrollbar in mobile version
						width = parseInt(gridView._private.globals.viewportNode.width());
					}
					else {
						width = parseInt(gridView._private.globals.viewportNode.width() - gridView._private.globals.vScrollBarWidth - 1);
					}

				}

				// set container width
				gridView._private.globals.viewportContainerNode.width(width);

				// set header width
				//gridView._private.globals.headerContainerNode.width(width + gridView._private.globals.vScrollBarWidth); // Add 50 in case vertical scrolbar is displayed
				gridView._private.globals.headerContainerNode.width(width);
				gridView._private.globals.headerContainerNode.height(32);
				// container height is (number of rows * row height);
				var numberOfRows = 0;
				if (!!gridView.gridController) {
					if (gridView.gridController.dataGrid.isInDesign) {
						numberOfRows = 200;
						gridView._private.globals.totalRowCount = numberOfRows;
					}
					else
						if (!!gridView.gridController.getRowCount) {
							var numberOfRows = gridView.gridController.getRowCount(gridView);
							gridView._private.globals.totalRowCount = numberOfRows;
						}
				}

				var height = gridView._private.globals.rowHeight * numberOfRows;
				if ((height > 17895697) & (WAF.utils.environment.browser.firefox3)) {
					gridView._private.globals.viewportContainerNode.height(17895697);
				}
				else {
					gridView._private.globals.viewportContainerNode.height(height);
				}
			},

			// updates number of row and cell DOM objects based on internal counts
			updateDOMToMatchRowAndColumnCounts: function(options){
				var gridView = options.gridView,
					init = options.init || false;

				// calculate number of visible rows
				var visibleRowCount = Math.ceil(gridView._private.globals.viewportNode.height() / gridView._private.globals.rowHeight) + 1;

				gridView._private.globals.pageSize = visibleRowCount;

				// increase number of rows by cache page size
				var rowCacheCount = Math.ceil(visibleRowCount * gridView._private.globals.cacheSizeInPages);

				var visibleAndCacheRowCount = visibleRowCount + (rowCacheCount * 2);

				// in case visible rows + cache page rows > total Row count
				/*
				 if (visibleAndCacheRowCount > gridView._private.globals.totalRowCount)
				 {
				 visibleAndCacheRowCount = gridView._private.globals.totalRowCount;
				 }
				 */
				// set global variables
				gridView._private.globals.visibleRowCount = visibleRowCount;
				gridView._private.globals.visibleAndCacheRowCount = visibleAndCacheRowCount;
				gridView._private.globals.cacheSizeInRows = rowCacheCount;

				// column count for later
				var numberOfColumns = gridView.gridController.getColumnCount();

				// Update Header
				// Check Headers
				if (gridView._private.globals.headerContainerNode.cells == undefined) {
					gridView._private.globals.headerContainerNode.cells = [];
				}

				// do we need to remove header cells?
				while (gridView._private.globals.headerContainerNode.cells.length > numberOfColumns) {
					var cell = gridView._private.globals.headerContainerNode.cells.pop();
					cell.dom.remove();
					//WAF.utils.debug.console.log('removing header cell');
				}

				var totalWidth = 0;
				// add Header Cells
				while (gridView._private.globals.headerContainerNode.cells.length < numberOfColumns) {

					// Setting cell dom
					var attributeCount = gridView._private.globals.headerContainerNode.cells.length;

					var col = gridView._private.globals.columns[attributeCount];
					var id = col.colID;
					var cellWidth = col.width;

					// Set last column width
					if (attributeCount === numberOfColumns - 1) {
						cellWidth = gridView._private.globals.viewportContainerNode.width() - totalWidth;
					}

					totalWidth += cellWidth;

					var cell = {
						dom: $('<div class="waf-dataGrid-cell waf-dataGrid-col-' + id + ' waf-dataGrid-col-' + attributeCount + '"></div>').appendTo(gridView._private.globals.headerContainerNode)
					}

					if (options.columns[attributeCount].sortable) {
						cell.dom.addClass('clickable');
					}

					try {
						cell.dom.width(cellWidth - parseInt(cell.dom.css('border-left-width')) - parseInt(cell.dom.css('border-right-width')) - parseInt(cell.dom.css('padding-left')) - parseInt(cell.dom.css('padding-right')) - parseInt(cell.dom.css('margin-left')) - parseInt(cell.dom.css('margin-right')));
					}
					catch (e) {
						cell.dom.width(cellWidth);
					}


					// Setting sortIndicator
					var sortUpIcon = new WAF.widget.Icon({
						size: 16,
						type: 'arrowUp',
						className: 'waf-icon-sortAsc'
						/*,
						 state: {
						 normal: {
						 fill: '#fff'
						 },
						 hover: {
						 fill: '#d00'
						 },
						 active: {
						 fill: '#0f0'
						 }
						 }*/
					});

					var sortDescIcon = new WAF.widget.Icon({
						size: 16,
						type: 'arrowDown',
						className: 'waf-icon-sortDesc'
						/*,
						 state: {
						 normal: {
						 fill: '#fff'
						 },
						 hover: {
						 fill: '#d00'
						 },
						 active: {
						 fill: '#0f0'
						 }
						 }*/
					});

					cell.sortIndicator = $('<div class="waf-sort"></div>').append(sortUpIcon.containerNode).append(sortDescIcon.containerNode);

					// Setting cell title
					cell.title = $('<div class="content"></div>');

					// Setting cell resizeIndicator
					cell.resizeIndicator = $('<div class="resize"></div>');

					// Appending cell content
					cell.dom.append(cell.title, cell.sortIndicator, cell.resizeIndicator);

					cell.dom.width(cellWidth);
					var outW = cell.dom.outerWidth();
					var w = cell.dom.width();
					if (outW > w)
						cell.dom.width(outW + (outW - w));


					cell.dom.bind('click', {
						gridView: gridView,
						cell: cell,
						columnNumber: attributeCount
					}, gridView._private.functions.onHeaderClick);
					gridView._private.globals.headerContainerNode.cells.push(cell);
					cell.resizeIndicator.gridView = gridView;
					cell.resizeIndicator.bind('mousedown', {
						gridView: gridView,
						columnNumber: attributeCount
					}, gridView._private.functions.startColResize);
					cell.resizeIndicator.bind('click', {
						gridView: gridView,
						columnNumber: attributeCount
					}, gridView._private.functions.onResizeClick);
				}


				// set Header titles
				for (var columnCount = 0; columnCount < numberOfColumns; columnCount++) {
					if (options.columns) {
						gridView._private.globals.headerContainerNode.cells[columnCount].title.html(options.columns[columnCount].title);
					}
				}

				// calculate width
				var width = 0;

				for (var columnCount = 0; columnCount < gridView._private.globals.columns.length; columnCount++) {
					// Set last column width
					if (columnCount === gridView._private.globals.columns.length - 1) {
						var lastWidth = gridView._private.globals.viewportContainerNode.width() - width;
						width += lastWidth - 1;
					}
					else {
						width += parseInt(gridView._private.globals.columns[columnCount].originalWidth, 10);
					}

				}

				// taking borders' width into account
				width += gridView._private.globals.columns.length - 1;

				if (gridView._private.globals.totalRowCount < visibleRowCount) {
					// do we need to remove rows?
					while (gridView._private.globals.rows.length > visibleRowCount) {
						var row = gridView._private.globals.rows.pop();
						row.insideDom.remove();
						row.dom.remove();
						//WAF.utils.debug.console.log('removing row');
					}

					//if (width < gridView._private.globals.viewportNode.width()) {
					//	width = gridView._private.globals.viewportNode.width();
					//}

				}
				else {
					//if (width < gridView._private.globals.viewportNode.width() - gridView._private.globals.vScrollBarWidth) {
					//	width = gridView._private.globals.viewportNode.width() - gridView._private.globals.vScrollBarWidth;
					//}
					gridView._private.globals.viewportContainerNode.width(width);
				}

				if (gridView.gridController.dataGrid.isInDesign) {
					// Inserting 3 rows to show even & odd alternation
					for (var i = 0; i < 3; i++) {
						var row = {
							dom: $('<div></div>').addClass('waf-widget-content waf-dataGrid-row').appendTo(gridView._private.globals.viewportContainerNode),
							offsetTop: rowNumber * gridView._private.globals.rowHeight, // viewport offset used to position row
							rowNumber: 0,
							needsDataUpdate: false,
							cells: [],
							style: '',
							oldStyle: ''
						}
						row.dom.width(width);
						row.insideDom = $('<div></div>').addClass('waf-datagrid-row-inside').appendTo(row.dom);
						row.insideDom.width(width);
						/*
						 try {
						 row.dom.height(gridView._private.globals.rowHeight - parseInt(row.dom.css('border-bottom-width')) - parseInt(row.dom.css('border-top-width')) - parseInt(row.dom.css('padding-bottom')) - parseInt(row.dom.css('padding-top')) - parseInt(row.dom.css('margin-bottom')) - parseInt(row.dom.css('margin-top')));
						 } catch (e) {
						 row.dom.height(gridView._private.globals.rowHeight);
						 }
						 */
						row.dom.height(gridView._private.globals.rowHeight);

						for (var attributeCount = 0; attributeCount < numberOfColumns; attributeCount++) {
							var col = gridView._private.globals.columns[attributeCount];
							var cellWidth = col.width;
							var cellStyle = col.style;
							var id = col.colID;
							var fakeData = 'Text';

							var cell = {
								dom: $('<div class="waf-dataGrid-cell waf-dataGrid-col-' + id + ' waf-dataGrid-col-' + attributeCount + '"></div>').addClass(cellStyle).appendTo(row.insideDom)
							};
							if (col.type && col.type === 'image') {
								fakeData = 'Image';
							}

							cell.insideCell = $('<div class="content">' + fakeData + '</div>').appendTo(cell.dom);

							try {
								cell.dom.width(cellWidth - parseInt(cell.dom.css('border-left-width')) - parseInt(cell.dom.css('border-right-width')) - parseInt(cell.dom.css('padding-left')) - parseInt(cell.dom.css('padding-right')) - parseInt(cell.dom.css('margin-left')) - parseInt(cell.dom.css('margin-right')))
							}
							catch (e) {
								cell.dom.width(cellWidth);
							}

							cell.insideCell.width(cellWidth);

							/* changed by L.R newHeight
							 try {
							 cell.dom.height(gridView._private.globals.rowHeight - parseInt(row.dom.css('border-bottom-width')) - parseInt(row.dom.css('border-top-width')) - parseInt(row.dom.css('padding-bottom')) - parseInt(row.dom.css('padding-top')) - parseInt(row.dom.css('margin-bottom')) - parseInt(row.dom.css('margin-top')) - parseInt(cell.dom.css('border-bottom-width')) - parseInt(cell.dom.css('border-top-width')) - parseInt(cell.dom.css('padding-bottom')) - parseInt(cell.dom.css('padding-top')) - parseInt(cell.dom.css('margin-bottom')) - parseInt(cell.dom.css('margin-top')));
							 } catch(e) {
							 cell.dom.height(gridView._private.globals.rowHeight);
							 }
							 */
							row.cells.push(cell);
						}

						gridView._private.globals.rows.push(row);
					}
				}
				else {
					// do we need to add rows?
					var rowNumber = gridView._private.globals.rows.length;

					while (gridView._private.globals.rows.length < visibleAndCacheRowCount) {

						var row = {
							dom: $('<div></div>').addClass('waf-widget-content waf-dataGrid-row').appendTo(gridView._private.globals.viewportContainerNode),
							offsetTop: init ? 0 : rowNumber * gridView._private.globals.rowHeight, // viewport offset used to position row
							rowNumber: rowNumber,
							needsDataUpdate: true,
							cells: [],
							style: '',
							oldStyle: ''
						}

						row.insideDom = $('<div></div>').addClass('waf-datagrid-row-inside').appendTo(row.dom);
						row.dom[0].gridRow = row;

						//WAF.utils.debug.console.log('adding row ' + rowNumber);

						// update row width
						row.dom.width(width);
						row.insideDom.width(width);
						row.insideDom[0].gridRow = row;

						// update row height
						/*
						 try {
						 row.dom.height(gridView._private.globals.rowHeight - parseInt(row.dom.css('border-bottom-width')) - parseInt(row.dom.css('border-top-width')) - parseInt(row.dom.css('padding-bottom')) - parseInt(row.dom.css('padding-top')) - parseInt(row.dom.css('margin-bottom')) - parseInt(row.dom.css('margin-top')));
						 } catch (e) {
						 row.dom.height(gridView._private.globals.rowHeight);
						 }
						 */
						row.dom.height(gridView._private.globals.rowHeight);
						row.insideDom.height(gridView._private.globals.rowHeight);

						// apply events
						if (!gridView.gridController.dataGrid.isInDesign) {

							if (WAF.PLATFORM.modulesString === "mobile") {

								row.dom.bind('touchend', {
									gridView: gridView,
									row: row
								}, gridView._private.functions.onRowClick);

								row.dom.bind('touchend', function(event){
							       	var now 		= new Date().getTime(),
							        	lastTouch 	= $(this).data('lastTouch') || now + 1,
							       		delta 		= now - lastTouch;

							        if ( delta < 300 && delta > 0){
							        	if (gridView.gridController.onRowDblClick) {
							            	gridView.gridController.onRowDblClick(event);
							          	}
							        }
							       	$(this).data('lastTouch', now);
								});
							}
							else {
								// apply hover styles to rows if turned on

								row.dom.mouseover(function(){
									var thisRow = this.gridRow;
									if (thisRow == null || thisRow.rowNumber < gridView._private.globals.totalRowCount) {
										// WAF.utils.debug.console.log('waf-state-hover');
										//if (!gridView._private.globals.editHasBeenStarted)
										$(this).addClass('waf-state-hover');
									}
								}).mouseout(function(){
									$(this).removeClass('waf-state-hover');
								} // onRowClick event
								).bind('click', {
									gridView: gridView,
									row: row
								}, gridView._private.functions.onRowClick).bind('contextmenu', {
									gridView: gridView,
									row: row
								}, gridView._private.functions.onRowRightClick).bind('dblclick', {
									gridView: gridView,
									row: row
								},gridView.gridController.baseDblClick );


							}


							// increment row number
							rowNumber++;

							// add cells
							for (var attributeCount = 0; attributeCount < numberOfColumns; attributeCount++) {
								var col = gridView._private.globals.columns[attributeCount];
								var cellWidth = col.width;
								var cellStyle = col.style;
								var id = col.colID;

								var cell = {
									//dom: $('<div></div>').addClass('cellCol' + attributeCount).addClass('cell').addClass('noUserSelect').addClass(cellStyle).appendTo(row.dom)
									dom: $('<div class="waf-dataGrid-cell waf-dataGrid-col-' + id + ' waf-dataGrid-col-' + attributeCount + '"></div>').addClass(cellStyle).appendTo(row.insideDom)
								}
								//cell.insideCell = $('<div></div>').addClass('insideCell').appendTo(cell.dom);
								cell.insideCell = $('<div class="content"></div>').appendTo(cell.dom);
								if (col.att != null && col.att.type === 'image')
									cell.insideCell.addClass("content-img");

								try {
									cell.dom.width(cellWidth - parseInt(cell.dom.css('border-left-width')) - parseInt(cell.dom.css('border-right-width')) - parseInt(cell.dom.css('padding-left')) - parseInt(cell.dom.css('padding-right')) - parseInt(cell.dom.css('margin-left')) - parseInt(cell.dom.css('margin-right')))
								}
								catch (e) {
									cell.dom.width(cellWidth);
								}

								cell.insideCell.width(cellWidth);

								/* changed by L.R newHeight
								 try {
								 cell.dom.height(gridView._private.globals.rowHeight - parseInt(row.dom.css('border-bottom-width')) - parseInt(row.dom.css('border-top-width')) - parseInt(row.dom.css('padding-bottom')) - parseInt(row.dom.css('padding-top')) - parseInt(row.dom.css('margin-bottom')) - parseInt(row.dom.css('margin-top')) - parseInt(cell.dom.css('border-bottom-width')) - parseInt(cell.dom.css('border-top-width')) - parseInt(cell.dom.css('padding-bottom')) - parseInt(cell.dom.css('padding-top')) - parseInt(cell.dom.css('margin-bottom')) - parseInt(cell.dom.css('margin-top')));
								 } catch(e) {
								 cell.dom.height(gridView._private.globals.rowHeight);
								 }
								 */
								row.cells.push(cell);

								if (WAF.PLATFORM.modulesString === "mobile") {

									/*touch start*/
									cell.dom.bind('touchstart', {
										gridView: gridView,
										columnNumber: attributeCount,
										row: row,
										cell: cell
									}, function(event){
										gridView._private.globals.istouch = true;
										gridView._private.functions.onCellClick(event);
									});

									/*touch end*/
									cell.dom.bind('touchend', {
										gridView: gridView,
										columnNumber: attributeCount,
										row: row,
										cell: cell
									}, function(event){

										var gridView 	= event.data.gridView,
										 	now 		= new Date().getTime(),
								        	lastTouch 	= $(this).data('lastTouch') || now + 1,
								       		delta 		= now - lastTouch;

										gridView._private.globals.istouch = false;

								        if ( delta < 300 && delta > 0){
								        	if (gridView.gridController.onRowDblClick) {
								        		gridView.gridController.onRowDblClick(event);
								        	}
								            gridView._private.functions.onCellDblClick(event);
								        }
								       	$(this).data('lastTouch', now);

									});

								}
								else {
									cell.dom.bind('dblclick', {
										gridView: gridView,
										columnNumber: attributeCount,
										row: row,
										cell: cell
									}, gridView._private.functions.onCellDblClick);
									cell.dom.bind('click', {
										gridView: gridView,
										columnNumber: attributeCount,
										row: row,
										cell: cell
									}, gridView._private.functions.onCellClick);
									cell.dom.bind('mouseover', function(){
										$(this).addClass('waf-state-hover')
									});
									cell.dom.bind('mouseout', function(){
										$(this).removeClass('waf-state-hover')
									});

                                                                /*cell.dom.on('input[type="checkbox"]', 'blur',{
                                                                    gridView: gridView,
                                                                    row: row
                                                                }, gridView._private.functions.endEditCell);*/

								}

							}

						}

						if (init) {
							init = false;
							var rowHeight = row.dom.outerHeight();
							var insideHeight = row.insideDom.height();
							if (rowHeight < insideHeight)
								rowHeight = insideHeight;
							gridView._private.globals.rowHeight = rowHeight;
							row.dom.height(rowHeight);
							row.insideDom.height(rowHeight);
						}

						gridView._private.globals.rows.push(row);
					}
				}

				// Automatically hide/show scrollbar on need
				if (gridView._private.globals.viewportContainerNode.height() <= (gridView._private.globals.viewportNode.height())) {
					// if we just removed the scrollbar we need to scroll to the top in case the first line is hidden
					// otherwise the user won't be able to see it since the scrollbar will be removed.
					if (gridView._private.globals.viewportNode.css('overflow-y') === 'auto') {
						gridView._private.globals.viewportNode.scrollTop(0);
					}
					gridView._private.globals.viewportNode.css('overflow-y', 'hidden');
					gridView.computeRowWidth(true);

				} else {
					gridView._private.globals.viewportNode.css('overflow-y', 'auto');
				}
			},

			// fires when viewport scrollbar sends onscroll event
			onViewportScroll: function(event){
				var gridView = event.data.gridView, gvFunctions = gridView._private.functions, gvGlobals = gridView._private.globals;

				if (WAF.PLATFORM.modulesString === "mobile") {

					if (!gvGlobals.rowClicked) {

						var topStart 	= gvGlobals.viewportContainerNode.position().top,
							leftStart 	= gvGlobals.viewportContainerNode.position().left,
							count 		= 0,
							topVal,
							leftVal,
							timer;

						timer = setInterval(function(){

							topVal = gvGlobals.viewportContainerNode.position().top;
							leftVal = gvGlobals.viewportContainerNode.position().left;

							if (topVal != topStart || leftVal != leftStart || count === 0) {

								count++;

								if (leftVal != leftStart) {
									gvGlobals.headerContainerNode.css("margin-left", leftVal + "px");
								}
								gvFunctions.hideCurrentRows({
									gridView: gridView
								});
								gvFunctions.updateRowPositions({
									gridView: gridView
								});
								gvFunctions.updateVisibleRowData({
									gridView: gridView
								});
								gvFunctions.showCurrentRows({
									gridView: gridView
								});
								topStart = topVal;

							} else {

								clearInterval(timer);
								var ev = event;
								if (gvGlobals.containerMoved) {
									window.setTimeout(function(){
										gridView._private.functions.onViewportScroll(ev);
									}, 50);
									gvGlobals.containerMoved = false;
								}

							}

							leftStart = gvGlobals.viewportContainerNode.position().left;

						}, 50);

					} else {
						gvGlobals.rowClicked = false;
					}

				}
				else {
					gvGlobals.headerNode.scrollLeft(event.target.scrollLeft);
					var gh = gvGlobals.headerNode[0];
					var actualHeaderScroll = gh.scrollLeft;
					if (actualHeaderScroll < event.target.scrollLeft) {
						gvGlobals.headerContainerNode.width(gvGlobals.headerContainerNode.width() + event.target.scrollLeft - actualHeaderScroll);
						gvGlobals.headerNode.scrollLeft(event.target.scrollLeft);
					}

					$('.waf-state-hover', gridView._private.globals.targetNode).removeClass('waf-state-hover');

					// Remove current selection
					gvFunctions.hideCurrentRows({
						gridView: gridView
					});

					gvFunctions.updateRowPositions({
						gridView: gridView
					});

					gvFunctions.updateVisibleRowData({
						gridView: gridView
					});

					gvFunctions.showCurrentRows({
						gridView: gridView
					});

				}

			},

			showCurrentRows: function(options){
				var gridView = options.gridView, gvGlobals = gridView._private.globals, gvSel = gridView._private.selection, sel = gridView.getSelection(), gvFunctions = gridView._private.functions, classActive = gvSel.cssClass, rowNumber, row, theRows;

				if (sel != null) {
					if (sel.isModeSingle()) {
						rowNumber = gvGlobals.currentRow;
						if (rowNumber != null && rowNumber != -1) {
							row = gvFunctions.getRowByRowNumber({
								gridView: gridView,
								rowNumber: rowNumber
							});

							if (row != null) {
								row.dom.addClass(classActive);
							}
						}
					}
					else
						if (sel.isModeMultiple()) {
							theRows = gvGlobals.rows;
							for (var i = 0, max = theRows.length; i <= max; ++i) {
								row = theRows[i];
								if (row != null && sel.isSelected(row.rowNumber)) {
									row.dom.addClass(classActive);
								}
							}
						}
				}
			},

			hideCurrentRows: function(options){
				var gridView = options.gridView, gvSel = gridView._private.selection, sel = gridView.getSelection();
				classActive = gvSel.cssClass;

				if (sel != null) {
					if (sel.isModeSingle()) {
						$('.waf-dataGrid-row.' + classActive, gridView._private.globals.targetNode).removeClass(classActive);
					}
					else
						if (sel.isModeMultiple()) {
							$('#' + gridView.gridController.dataGrid.subscriberID + ' .waf-widget-body .container').children().removeClass(classActive);
						}
				}
			},

			// redraws rows so that they will be placed inside visible area of the viewport
			updateRowPositions: function(options){
				var gridView = options.gridView;
				var forceUpdate = options.forceUpdate || false;
				var gvar = gridView._private.globals;
				var rows = gvar.rows;
				var grid = gridView.gridController.dataGrid;

				if (grid.dataSource == null)
					return;

				gridView.fixWebKitBug();

				// if grid is already being populated, call this function again later
				if (gvar.currentlyUpdatingRowPositions) {
					window.setTimeout(function(){
						gridView._private.functions.updateRowPositions(options)
					}, 100);
					return false;
				}
				else {
					gvar.currentlyUpdatingRowPositions = true;
				}

				// get viewport top scroll position
				var viewportTop;
				if (WAF.PLATFORM.modulesString === "mobile") {
					viewportTop = -(gridView._private.globals.viewportContainerNode.position().top);
				}
				else {
					viewportTop = gvar.viewportNode.scrollTop();
				}

				// calculate what's the first row position, as well as internal position inside .rows array
				// include cache size offset
				// since when we're here scrolling has already been done by the browser we need to see which
				// row(s) are hidden and the first visible one
				var firstVisibleRowPosition = Math.floor(viewportTop / gvar.rowHeight) - gvar.cacheSizeInRows;

				// make sure cache offset doesn't go behind existing row numbers
				firstVisibleRowPosition = (firstVisibleRowPosition >= 0) ? firstVisibleRowPosition : 0;

				// calculate internal position inside .rows array
				var firstVisibleRowInternalId = firstVisibleRowPosition % rows.length;


				// calculate what's the last row position, as well as internal position inside .rows array
				var lastVisibleRowPosition = firstVisibleRowPosition + rows.length - 1;

				// make sure cache offset doesn't go behind above row numbers
				lastVisibleRowPosition = (lastVisibleRowPosition <= gvar.totalRowCount) ? lastVisibleRowPosition : gvar.totalRowCount;

				// calculate internal position inside .rows array
				var lastVisibleRowInternalId = lastVisibleRowPosition % rows.length;

				grid.dataSource.setDisplayLimits(grid.subscriberID, firstVisibleRowPosition, lastVisibleRowPosition);

				// check if first and last visible rows should currently be visible
				if ((rows[firstVisibleRowInternalId].rowNumber !== firstVisibleRowPosition) ||
				(rows[lastVisibleRowInternalId].rowNumber !== lastVisibleRowPosition) ||
				forceUpdate) {

					// it's not, reposition rows
					for (var rowCount = 0; rowCount < rows.length; rowCount++) {

						// what's the row position inside .rows array?
						var internalRowId = ((firstVisibleRowInternalId + rowCount) < rows.length) ? (firstVisibleRowInternalId + rowCount) : (rowCount - (rows.length - firstVisibleRowInternalId));

						// calculate row positions
						var currentRow = rows[internalRowId];
						var currentRowPosition = firstVisibleRowPosition + rowCount;
						var currentRowNumber = currentRow.rowNumber;

						// check if current row position matches what position should be
						if (currentRowNumber !== currentRowPosition || forceUpdate) {

							// row position didn't match, move it to right location
							//var rowCSSTop = ((currentRowPosition * gvar.rowHeight) - (internalRowId * gvar.rowHeight));
							var rowCSSTop = currentRowPosition * gvar.rowHeight;

							// set row contents to blank
							for (var cellCount = 0; cellCount < currentRow.cells.length; cellCount++) {
								currentRow.cells[cellCount].insideCell.html(gvar.cellNeedsUpdateHTMLContent);
								currentRow.cells[cellCount].dom.height(gvar.rowHeight);
								currentRow.cells[cellCount].insideCell.height(gvar.rowHeight);
							}

							currentRow.rowNumber = currentRowPosition;
							currentRow.needsDataUpdate = true;
							currentRow.dom.css('top', rowCSSTop + 'px');

						}
					}
				}

				gvar.currentlyUpdatingRowPositions = false;
			},

			// go through the visible rows and request data from controller
			updateVisibleRowData: function(options){
				var gridView = options.gridView;

				/*
				if (false) {
					// clear existing events
					window.clearTimeout(gridView._private.globals.rowContentUpdateDelayEvent);
					gridView._private.globals.rowContentUpdateDelayEvent = null;

					// if event wasn't delayed, delay it and call this function again
					if (!options.isDelayedForCache) {

						// call delay on update
						var delayOptions = options;
						delayOptions.isDelayedForCache = true;

						gridView._private.globals.rowContentUpdateDelayEvent = window.setTimeout(function(){
							gridView._private.functions.updateVisibleRowData(delayOptions);
						}, 20);

						return;

					}

					// calculate internal position inside .rows array
					var firstVisibleRowInternalId = firstVisibleRowPosition % gridView._private.globals.rows.length;

					for (var rowCount = firstVisibleRowInternalId; rowCount < gridView._private.globals.rows.length; rowCount++) {
						var row = gridView._private.globals.rows[rowCount];
						if (row.needsDataUpdate) {
							row.dom.removeClass('waf-state-hover');
							if (!!gridView.gridController) {
								if (!!gridView.gridController.setContentForRow) {
									if (gridView.gridController.isContentAvailableForRow(row.rowNumber)) {
										gridView._private.functions.setRowContents({
											contents: gridView.gridController.setContentForRow(row.rowNumber),
											rowNumber: row.rowNumber,
											gridView: gridView
										});

										row.style = gridView.gridController.setStyleForRow(row.rowNumber).rowStyle;

										if (row.style != row.oldStyle) {
											row.dom.addClass(row.style);

											row.dom.removeClass(row.oldStyle);
											row.oldStyle = row.style;
										}

										row.needsDataUpdate = false;
									}
								}
							}
						}
					}

					for (var rowCount = 0; rowCount < firstVisibleRowInternalId; rowCount++) {
						var row = gridView._private.globals.rows[rowCount];
						if (row.needsDataUpdate) {
							row.dom.removeClass('waf-state-hover');
							if (!!gridView.gridController) {
								if (!!gridView.gridController.setContentForRow) {
									if (gridView.gridController.isContentAvailableForRow(row.rowNumber)) {
										gridView.gridController.setContentForRow(row.rowNumber);
										row.needsDataUpdate = false;
									}
								}
							}
						}
					}
				}*/

				// check if delay is enabled
				if (gridView._private.globals.rowContentUpdateDelayInMs !== 0) {

					// clear existing events
					window.clearTimeout(gridView._private.globals.rowContentUpdateDelayEvent);
					gridView._private.globals.rowContentUpdateDelayEvent = null;

					// if event wasn't delayed, delay it and call this function again
					if (!options.isDelayed) {

						// call delay on update
						var delayOptions = options;
						delayOptions.isDelayed = true;

						gridView._private.globals.rowContentUpdateDelayEvent = window.setTimeout(function(){
							gridView._private.functions.updateVisibleRowData(delayOptions);
						}, gridView._private.globals.rowContentUpdateDelayInMs);

						return;
					}
				}

				// get viewport top scroll position
				var viewportTop;
				if (WAF.PLATFORM.modulesString === "mobile") {
					viewportTop = -(gridView._private.globals.viewportContainerNode.position().top);
				}
				else {
					viewportTop = gridView._private.globals.viewportNode.scrollTop();
				}

				// calculate what's the first row position, as well as internal position inside .rows array
				// include cache size offset
				var firstVisibleRowPosition = Math.floor(viewportTop / gridView._private.globals.rowHeight);

				// make sure cache offset doesn't go behind existing row numbers
				firstVisibleRowPosition = (firstVisibleRowPosition >= 0) ? firstVisibleRowPosition : 0;

				// calculate internal position inside .rows array
				var firstVisibleRowInternalId = firstVisibleRowPosition % gridView._private.globals.rows.length;

				for (var rowCount = firstVisibleRowInternalId; rowCount < gridView._private.globals.rows.length; rowCount++) {
					var row = gridView._private.globals.rows[rowCount];

					if (row.needsDataUpdate) {
						row.dom.removeClass('waf-state-hover');

						if (!!gridView.gridController) {
							if (!!gridView.gridController.setContentForRow) {
								gridView._private.functions.setRowContents({
									contents: gridView.gridController.setContentForRow(row.rowNumber),
									rowNumber: row.rowNumber,
									gridView: gridView
								});

								row.style = gridView.gridController.setStyleForRow(row.rowNumber).rowStyle;

								if (row.style != row.oldStyle) {
									row.dom.addClass(row.style);

									row.dom.removeClass(row.oldStyle);
									row.oldStyle = row.style;
								}

								row.needsDataUpdate = false;
							}
						}
					}
				}
				for (var rowCount = 0; rowCount < firstVisibleRowInternalId; rowCount++) {
					var row = gridView._private.globals.rows[rowCount];
					if (row.needsDataUpdate) {
						row.dom.removeClass('waf-state-hover');
						if (!!gridView.gridController) {
							if (!!gridView.gridController.setContentForRow) {
								gridView.gridController.setContentForRow(row.rowNumber);
								gridView._private.functions.setRowContents({
									contents: gridView.gridController.setContentForRow(row.rowNumber),
									rowNumber: row.rowNumber,
									gridView: gridView
								});

								row.style = gridView.gridController.setStyleForRow(row.rowNumber).rowStyle;

								if (row.style != row.oldStyle) {
									row.dom.addClass(row.style);

									row.dom.removeClass(row.oldStyle);
									row.oldStyle = row.style;
								}

								row.needsDataUpdate = false;
							}
						}
					}
				}

			},

			// sets row contents based on the array
			setRowContents: function(options){

				var gridView = options.gridView;

				var contents = options.contents;
				var rowNumber = options.rowNumber;

				// if no contents are passed, skip adding contents
				if (!contents)
					return;

				// get row by row number, to make sure that we're setting contents for visible rows
				var row = gridView._private.functions.getRowByRowNumber({
					gridView: gridView,
					rowNumber: rowNumber
				});

				if (!!row) {
					// cycle through cells and set contents
					for (var cellCount = 0; cellCount < row.cells.length; cellCount++) {
						var cell = row.cells[cellCount];
						cell.insideCell.html(contents[cellCount]);
						// }
					}
				}
				else {
					var gdebug = ""; // break here
				}

			},

			// gets row by row number
			getRowByRowNumber: function(options){

				var gridView = options.gridView;

				var rowNumber = options.rowNumber;

				// find row by row number
				for (var rowCount = 0; rowCount < gridView._private.globals.rows.length; rowCount++) {
					var row = gridView._private.globals.rows[rowCount];
					if (row.rowNumber === rowNumber) {
						return row;
					}
				}

				return null;

			},

			// row click event
			onRowClick: function(event){
				var gridView = event.data.gridView;
				var gvar = gridView._private.globals;
				var row = event.data.row;
				var okToEdit = true;

				if (WAF.PLATFORM.modulesString === "mobile") {

					/*if (!gridView._private.globals.containerMoved) {
					 if (row.rowNumber < gvar.totalRowCount)
					 gridView._private.globals.rowClicked = true;
					 } else {
					 okToEdit = false;
					 gvar.containerMoved = false;
					 gvar.rowClicked = false;
					 }*/
					if (gridView._private.globals.containerMoved) {
						return;
					}

				}
				if (row.rowNumber < gvar.totalRowCount) {
					if (okToEdit && gridView.currentEditingRow() != row.rowNumber) {
						gridView._private.functions.endEditCell({
							gridView: gridView
						});
						// select() will load the entity and trigger an event to gridSourceEventHandler(),
						// which hightlight the clicked row. At this point, the current jQuery event is lost,
						// we mmust keep it somewhere
						gridView._private.selection.curEvt = event;
						// Now, load the entiry
						var keptEvent = event;
						gridView.gridController.dataGrid.dataSource.select(row.rowNumber, {
							onSuccess: function(event){
								if (!!gridView.gridController.onRowClick) {
									gridView.gridController.onRowClick(keptEvent);
								}
							}
						});
					}
				}


				return true;
			},

			onRowRightClick: function(event){
				var row, gridView, righClickEvent, rightClickReturn;

				gridView = event.data.gridView;
				row = event.data.row;
				rightClickReturn = true;
				righClickEvent = event;

				gridView.gridController.dataGrid.dataSource.select(row.rowNumber, {
					onSuccess: function(event){
						if (!!gridView.gridController.onRowRightClick) {
							rightClickReturn = gridView.gridController.onRowRightClick(righClickEvent);
						}
					}
				});

				return rightClickReturn;
			},

			onMouseUp: function(event){
				var gridView = event.data.gridView;
				var row = event.data.row;
			},

			onCellDblClick: function(event){
				var gridView = event.data.gridView;
				if (WAF.PLATFORM.modulesString === "mobile") {
					gridView._private.globals.istouch = false;
				}
				var row = event.data.row;
				if (row.rowNumber < gridView._private.globals.totalRowCount)
					gridView._private.functions.startEditCell(event.data);
			},

			startEditCell: function(params){
				var okEdit = true;
				var gridView = params.gridView;
				var editInfo = gridView._private.globals.editInfo;
				var isCheckBox;

				if (editInfo != null) {
					if (params.row != null && params.row.rowNumber == editInfo.rowNumber) {
						if (params.columnNumber == editInfo.column.columnNumber) {
							okEdit = false; // on ne termine pas l'edition quand on se trouve sur la meme cellule
						}
					}
				}

				if (params.gridView) {
					col = params.gridView.column(params.columnNumber + 1);
					if (col) {
						isColReadOnly = col.readOnly;
					}
				}

				if (okEdit && !isColReadOnly) {
                                    isCheckBox = params.cell.insideCell.find("input[type=checkbox]");
					if (WAF.PLATFORM.isTouch) {
						if (isCheckBox.length != 0) {
                                                    isCheckBox.trigger("click");
						}
					} else {
						isCheckBox.focus();
                                    }

					gridView._private.functions.endEditCell(params);

					var source = gridView.gridController.dataGrid.dataSource;
					if (source != null) {
						source.select(params.row.rowNumber, {
							onSuccess: function(event){
								var token = event.data;
								var gridView = token.gridView;
								var row = token.row;
								var cell = token.cell;
								var col = gridView.column(token.columnNumber + 1);
								if (!col.readOnly && !col.specialEdit) {
									// setting row states
									row.dom
										.removeClass('waf-state-active')
										.addClass('waf-state-selected');

										var w = cell.insideCell.outerWidth();
										var minw = cell.dom.outerWidth();

										cell.insideCell.hide();
										//cell.dom.removeClass('noUserSelect');
										cell.dom.addClass('editing');
										//var editArea = $('<input value="" class="inputInCell"/>');

										var editArea = $('<input type="text" value="" class="content-edit"/>');

										var imgArea = null;
										var sourceAtt = source.getAttribute(col.sourceAttID);
										if (sourceAtt != null) {
											editArea[0].value = sourceAtt.getValueForInput();
										}
										/*
										 editArea.width(cell.dom.width()-2);
										 editArea.height(cell.dom.height()-2);
										 */
										editArea.appendTo(cell.dom);
										editArea.width(w);
										//editArea[0].select();
										//row.dom.addClass('editingRow');
										/*
										 editArea.bind('keypress',
										 {gridView: gridView,
										 row: row,
										 rowNumber: row.rowNumber,
										 column: col,
										 cell: params.cell,
										 editArea: editArea
										 }, gridView._private.functions.inputKeypressHandler);
										 */
										editArea.bind('keydown', {
											gridView: gridView,
											row: row,
											rowNumber: row.rowNumber,
											column: col,
											cell: params.cell,
											editArea: editArea
										}, gridView._private.functions.inputKeypressHandler);

										editArea.bind('blur', {
											gridView: gridView
										}, gridView._private.functions.editBlurHandler);

									var dataTheme = gridView._private.globals.targetNode.data('theme');
									if (col.att && col.att.type == "date") {
										cell.dom.css("min-width", minw + "px");
										if (false) {
											editArea.datepicker({
												/*
												 showOn: "button",
												 buttonImage: "/waLib/WAF/widget/png/date-picker-trigger.png",
												 buttonImageOnly: true,
												 */
												changeMonth: true,
												changeYear: true,
												onClose: function(dateText, inst){
													this.dontKillOnBlur = false;
												}

											}).datepicker("widget").addClass(dataTheme).css("z-index", "9999");;
											editArea[0].dontKillOnBlur = true;
											/*
											 editArea.datepicker({ onClose:function(dateText, inst)
											 {
											 this.dontKillOnBlur = false;
											 }});
											 editArea.datepicker({ onSelect:function(dateText, inst)
											 {
											 this.dontKillOnBlur = false;
											 }});
											 */
										}
										else {
											if (WAF.PLATFORM.isTouch) {

												if (WAF.PLATFORM.OS === "iOs" && WAF.PLATFORM.OSVersion >= 5) {

													editArea[0].type = "date";
												}
												else {
													editArea.scroller();
												}
											}
											else {
												var curwidth = editArea.outerWidth();
												editArea.css("margin-right", "3px");
												imgArea = $('<img src="/waLib/WAF/widget/png/date-picker-trigger.png" style="float:right;margin-right:5px;margin-top:4px;" />');
												imgArea.appendTo(cell.dom);
												editArea.width(curwidth - 7 - imgArea.outerWidth(true));
												imgArea._isDataPickerLoaded = false;
												imgArea.bind('click', {
													gridView: gridView
												}, function(event){
													if (!this._isDataPickerLoaded) {
														editArea[0].dontKillOnBlur = true;
														editArea[0].focus();
														var offset = editArea.offset();
														editArea.datepicker("dialog", sourceAtt.getValue(), function(dateText, inst){
															editArea[0].value = dateText;
															editArea[0].dontKillOnBlur = false;
															editArea[0].focus();
														}, {
															changeMonth: true,
															changeYear: true
														});
														var datepickerWidger = editArea.datepicker("widget");
														datepickerWidger.addClass(dataTheme);
														datepickerWidger.css("opacity", "100");
														datepickerWidger.css("z-index", "9999");
														offset.top += editArea.outerHeight() + 2;
														datepickerWidger.offset(offset);
														this._isDataPickerLoaded = true;

														// fix bug on invalid input

														var regexp = new RegExp("#dp[0-9]+");
														var tagId = regexp.exec(datepickerWidger.find('a')[0].onclick);
														if (tagId) {
															$(tagId[0]).css('display', 'none');
														}


													}
													else {
														this._isDataPickerLoaded = false;
													}
												});

											}

										}
									}

									editArea[0].focus();

									gridView._private.globals.editInfo = {
										row: row,
										rowNumber: row.rowNumber,
										column: col,
										cell: params.cell,
										editArea: editArea,
										imgArea: imgArea
									};
									gridView._private.globals.editHasBeenStarted = true;
								} else {
									isCheckBox.bind('keydown', {
										gridView: gridView,
										row: row,
										rowNumber: row.rowNumber,
										column: col,
										cell: params.cell,
										editArea: editArea
									}, gridView._private.functions.inputKeypressHandler);

									editArea = isCheckBox;

									gridView._private.globals.editInfo = {
										row: row,
										rowNumber: row.rowNumber,
										column: col,
										cell: params.cell,
										editArea: editArea,
										imgArea: imgArea
									};

									gridView._private.globals.editHasBeenStarted = true;
								}
							}
						}, params);
					}
				}

				/*if (gridView._private.globals.editInfo && waf.PLATFORM.isTouch && gridView._private.globals.editInfo.column.att.type != "date") {

					gridView._private.globals.promptedValue = prompt('Update ' + gridView._private.globals.editInfo.column.title, gridView._private.globals.editInfo.cell.value);
					gridView._private.functions.endEditCell(params);
				}*/
			},

			endEditCell: function(params){
				function handleErrorOnSave(event){
					gridView.gridController.dataGrid.redraw();
					if (errorHandler != null) {
						errorHandler(event);
					}
				}

				var specialEdit = 0;
				var gridView = params.gridView;
				var saveHandler = params.saveHandler || null;
				var errorHandler = params.errorHandler || gridView.gridController.errorHandler;
				var errorMessage = params.errorMessage || "The Grid was unable to save the entity";


				if (gridView._private.globals.editHasBeenStarted) {
					var editInfo = gridView._private.globals.editInfo;
					if (editInfo != null) {
						if (editInfo.blurTimout != null)
							window.clearTimeout(editInfo.blurTimout);
						var source = gridView.gridController.dataGrid.dataSource;
						if (source != null) {
							if (params.row != null && params.row.rowNumber == editInfo.rowNumber) {
								if (params.column != null && params.column.colID == editInfo.column.colID) {
									return null; // on ne termine pas l'edition quand on se trouve sur la meme cellule
								}
							}

							if (editInfo.editArea.attr('type') === 'checkbox') {
								specialEdit = 1;
							}

							if (source.getPosition() == editInfo.rowNumber) {
								var sourceAtt = source.getAttribute(editInfo.column.sourceAttID);
								var newvalue;
								if (sourceAtt != null) {
									if (WAF.PLATFORM.isTouch && WAF.PLATFORM.OS === "iOs" && WAF.PLATFORM.OSVersion >= 5 && sourceAtt.type === "date") {

										var text = editInfo.editArea[0].value.replace(/-/gi, "/"),
										    date = new Date(text);
											newvalue = sourceAtt.normalize(date);

									} else {
										if (specialEdit) {
											newvalue = sourceAtt.normalize(editInfo.editArea[0].checked);
										} else {
											if (editInfo && editInfo.editArea[0]) {
												newvalue = sourceAtt.normalize(editInfo.editArea[0].value);
											}
										}

									}

									sourceAtt.setValue(newvalue);
									if (!specialEdit) {
										editInfo.cell.insideCell.html(editInfo.column.getFormattedValue(sourceAtt.getValue()));
									}
								}

								if (params.row == null || params.row.rowNumber != source.getPosition() || params.saveAnyway) {

									if (gridView.gridController.dataGrid.readOnly) {
										if (saveHandler != null)
											saveHandler();
									}
									else {
										source.save({
											onSuccess: saveHandler,
											onError: handleErrorOnSave
										}, {
											gridView: gridView,
											errorMessage: errorMessage
										});
									}

								}
							}
						}

						// resetting row state
						//editInfo.row.dom.removeClass('editingRow');

						editInfo.row.dom
							.removeClass('waf-state-selected')
							.addClass('waf-state-active');

						editInfo.cell.dom.css("min-width", "");
						editInfo.cell.dom.removeClass('editing');
						if (!specialEdit) {
							editInfo.editArea.remove();
						}
						if (editInfo.imgArea != null)
							editInfo.imgArea.remove();
						//editInfo.cell.dom.addClass('noUserSelect');
						editInfo.cell.insideCell.show();
						gridView._private.globals.editInfo = null;

					}
					gridView._private.globals.editHasBeenStarted = false;
				}
				else {
					if (params.saveAnyway) {
						var source = gridView.gridController.dataGrid.dataSource;
						if (source != null && !gridView.gridController.dataGrid.readOnly) {
							source.save({
								onSuccess: saveHandler,
								onError: handleErrorOnSave
							}, {
								gridView: gridView,
								errorMessage: errorMessage
							});
						}
						else
							if (saveHandler) { // Execute saveHandler to append columns resize
								saveHandler();
							}
					}
				}
			},

			onHeaderClick: function(event){

				var gridView = event.data.gridView;
				var cell = event.data.cell;
				var columnNumber = event.data.columnNumber;

				gridView._private.functions.endEditCell({
					gridView: gridView,
					saveAnyway: true,
					saveHandler: function saveOnHeaderClick(subevent){
						if (!!gridView.gridController.onHeaderClick && !gridView._private.globals.resizeHasBeenStarted) {
							gridView.gridController.onHeaderClick(cell, columnNumber);
						}

					}
				});

			},

			onCellClick: function(event){
				// check if alreafy an active cell
				var oldcell = event.data.gridView._private.globals.lastActiveCell;
				var cell = $(event.currentTarget);
				if (cell && cell != oldcell) {
					if (oldcell) {
						oldcell.removeClass('waf-state-active');
					}
					cell.addClass('waf-state-active');
					event.data.gridView._private.globals.lastActiveCell = cell;
				}
				event.data.gridView.gridController.onCellClick(event);
			},

			startColResize: function(event){
				var gridView = event.data.gridView;
				gridView._private.functions.endEditCell({
					gridView: gridView,
					saveAnyway: true,
					saveHandler: function saveOnColResizeClick(subevent){
						$(document).bind('mouseup', event.data, gridView._private.functions.endColResize);
						$(document).bind('mousemove', event.data, gridView._private.functions.duringColResize);
						gridView._private.globals.startX = event.screenX;
						var col = gridView.column(event.data.columnNumber + 1);
						gridView._private.globals.startWidth = col.width;
						gridView._private.globals.resizeHasBeenStarted = true;
					}
				});
				event.stopPropagation();
			},

			endColResize: function(event){
				var gridView = event.data.gridView, tag = gridView.gridController.dataGrid.tag, colWidth, w, action, oldValue;

				var col = gridView.column(event.data.columnNumber + 1);
				var x = event.screenX;
				var newWidth = parseInt(gridView._private.globals.startWidth) + (parseInt(x) - parseInt(gridView._private.globals.startX));
				if (newWidth < 10) {
					newWidth = 10;
				}
				col.setWidth(newWidth);
				$(document).unbind('mouseup', gridView._private.functions.endColResize);
				$(document).unbind('mousemove', gridView._private.functions.duringColResize);
				gridView._private.globals.resizeHasBeenStarted = false;

				if (gridView.gridController.dataGrid.isInDesign) {
					// Saving the column width
					Designer.beginUserAction('052');
					oldValue = tag.getColumns().toString();
					if (typeof oldValue === 'undefined') {
						oldValue = '[]';
					}

					tag.getColumns().get(event.data.columnNumber).getAttribute('width').setValue(newWidth);

					tag.update();
					tag.domUpdate();

					action = new Designer.action.ModifyProperty({
						oldVal: oldValue,
						val: tag.getColumns().toString(),
						tagId: tag.id,
						prop: 'data-column'
					});

					// add to the history of the Designer
					Designer.getHistory().add(action);
				}
			},

			duringColResize: function(event){
				var gridView = event.data.gridView;
				var col = gridView.column(event.data.columnNumber + 1);
				var oldWidth = col.width;
				var x = event.screenX;
				var newWidth = parseInt(gridView._private.globals.startWidth) + (parseInt(x) - parseInt(gridView._private.globals.startX));
				if (newWidth < 10) {
					newWidth = 10;
				}

				col.setWidth(newWidth);

				/*
				 var dif = col.width - oldWidth;
				 var gridWidth = parseInt(gridView._private.globals.headerNode.parent().css('width'));
				 var header = gridView._private.globals.headerContainerNode;
				 var containt = gridView._private.globals.viewportContainerNode;

				 header.css('width', parseInt(header.css('width')) + dif + 'px');
				 containt.css('width', parseInt(containt.css('width')) + dif + 'px');
				 containt.children().css('width', parseInt(containt.css('width')) + 'px');
				 */
			},

			onResizeClick: function(event){
				var gridView = event.data.gridView;
				gridView._private.functions.endEditCell({
					gridView: gridView,
					saveAnyway: true
				});
				event.stopPropagation();
				//				gridView._private.globals.resizeHasBeenStarted = true;
			},

			editBlurHandler: function(event){
				if (!this.dontKillOnBlur) {
					var textInput = this;
					var gridView = event.data.gridView;
					if (gridView._private.globals.editInfo != null) {
						gridView._private.globals.editInfo.blurTimout = window.setTimeout(function(){
							if (!textInput.dontKillOnBlur) {
								if (gridView._private.globals.editInfo != null)
									gridView._private.functions.endEditCell({
										gridView: gridView/*, row: gridView._private.globals.editInfo.row*/
									});
							}
						}, 200);
					}
				}
			},

			inputKeypressHandler: function(event){
				var result = true;
				var gridView = event.data.gridView;
				var row = event.data.row;
				var rowNumber = event.data.rowNumber;
				var col = event.data.column;

				var keycode = event.keyCode;
				if (keycode != null) {
					if (keycode == 37 || keycode == 38)
						event.shiftKey = true;
					else
						if (keycode == 39 || keycode == 40)
							event.shiftKey = false;
					if (keycode >= 37 && keycode <= 40) {
						if (!event.ctrlKey)
							keycode = 0;
					}
					switch (keycode) {
						case 9:
						case 13:
						case 37:
						case 38:
						case 39:
						case 40:
							var colnum = col.columnNumber;
							var cols = gridView._private.globals.columns;
							var viewportNode = gridView._private.globals.viewportNode;
							var rowheight = gridView._private.globals.rowHeight;
							if (event.shiftKey) {
								var nextcolnum;
								var changerow = false;
								if (keycode == 38) {
									changerow = true;
									nextcolnum = colnum;
								}
								else {
									var oknext = false;
									nextcolnum = colnum - 1;
									while (!oknext && nextcolnum != colnum) {
										if (nextcolnum < 0) {
											changerow = true;
											nextcolnum = cols.length - 1;
										}
										if (!cols[nextcolnum].readOnly)
											oknext = true;
										else
											nextcolnum--;
									}
								}
								if (changerow) {
									rowNumber--;
									if (rowNumber < 0)
										row = null;
									else {
										gridView._private.functions.endEditCell({
											gridView: gridView
										});

										var rowtop = row.dom.position().top;
										if (rowtop < rowheight * 2) {
											var curtop;
											if (WAF.PLATFORM.modulesString === "mobile") {
												curtop = -(gridView._private.globals.viewportContainerNode.position().top);
											}
											else {
												curtop = viewportNode.scrollTop();
											}

											curtop = curtop - rowheight;
											if (curtop < 0)
												curtop = 0;
											viewportNode.scrollTop(curtop);
										}

										row = gridView._private.functions.getRowByRowNumber({
											gridView: gridView,
											rowNumber: rowNumber
										});
									}
								}
								else {
									gridView._private.functions.endEditCell({
										gridView: gridView,
										row: row
									});
								}
								if (row != null && !WAF.PLATFORM.isTouch)
									gridView._private.functions.startEditCell({
										gridView: gridView,
										row: row,
										cell: row.cells[nextcolnum],
										columnNumber: nextcolnum
									});
							}
							else {
								var nextcolnum;
								var changerow = false;
								if (keycode == 40) {
									changerow = true;
									nextcolnum = colnum;
								}
								else {
									var oknext = false;
									nextcolnum = colnum + 1;
									while (!oknext && nextcolnum != colnum) {
										if (nextcolnum >= cols.length) {
											changerow = true;
											nextcolnum = 0;
										}
										if (!cols[nextcolnum].readOnly)
											oknext = true;
										else
											nextcolnum++;
									}
								}
								if (changerow) {
									rowNumber++;

									if (rowNumber >= gridView._private.globals.totalRowCount) {
										//row = null;
										gridView._private.functions.endEditCell({
											gridView: gridView
										});

										WAF.gridUtil.addRow(gridView);

										row = gridView._private.functions.getRowByRowNumber({
											gridView: gridView,
											rowNumber: rowNumber
										});
									}
									else {
										gridView._private.functions.endEditCell({
											gridView: gridView
										});

										var rowtop = row.dom.position().top;
										var h = viewportNode.height();
										if (rowtop + rowheight > h) {
											var curtop;
											if (WAF.PLATFORM.modulesString === "mobile") {
												curtop = -(gridView._private.globals.viewportContainerNode.position().top);
											}
											else {
												curtop = viewportNode.scrollTop();
											}
											curtop = curtop + rowheight;
											viewportNode.scrollTop(curtop);
										}

										row = gridView._private.functions.getRowByRowNumber({
											gridView: gridView,
											rowNumber: rowNumber
										});
									}
								}
								else {
									gridView._private.functions.endEditCell({
										gridView: gridView,
										row: row
									});
								}

								if (row != null && !WAF.PLATFORM.isTouch)
									gridView._private.functions.startEditCell({
										gridView: gridView,
										row: row,
										cell: row.cells[nextcolnum],
										columnNumber: nextcolnum
									});
							}

							result = false;
							event.preventDefault();
							event.stopPropagation();
							break;
					}
				}
				return result;
			}


		},

		handlers: {}

	}

	/**
	 * GridView.initWithOptions(options)
	 * \~english
	 * @brief             Initializes the grid
	 * @details           Grid is initialized with options, of which most are optional.
	 *
	 * @param options : object
	 *
	 * @return this : GridView
	 *
	 * @code
	 *
	 *
	 * @endcode
	 */
	this.initWithOptions = function(options){

		//WAF.utils.debug.console.log('[GridView] WAF.classes.GridView.initWithOptions called');

		// set reference to the grid object
		options.gridView = this;

		// initialize the grid with passed options
		this._private.functions.initWithOptions(options);

		return this;

	}

	/**
	 * GridView.getPageSize()
	 * \~english
	 * @brief             Number of rows per page
	 * @details           Returns number of rows per page for this grid size.
	 *
	 * @param none
	 *
	 * @return pageSize : integer
	 *
	 * @code
	 *
	 *
	 * @endcode
	 */
	this.getPageSize = function(){
		return this._private.globals.pageSize;
	}

	/**
	 * GridView.getVisibleRowCount()
	 * \~english
	 * @brief             Number of visible rows
	 * @details           Returns number of visible rows on the screen.
	 *
	 * @param none
	 *
	 * @return visibleRowCount : integer
	 *
	 * @code
	 *
	 *
	 * @endcode
	 */
	this.getVisibleRowCount = function(){
		return this._private.globals.visibleRowCount;
	}

	/**
	 * GridView.getRowCount()
	 * \~english
	 * @brief             Number of total rows
	 * @details           Returns number of all rows
	 *
	 * @param none
	 *
	 * @return rowCount : integer
	 *
	 * @code
	 *
	 *
	 * @endcode
	 */
	this.getRowCount = function(){
		return this._private.globals.totalRowCount;
	}

	/**
	 * GridView.setRowCount()
	 * \~english
	 * @brief             Sets number of total rows
	 * @details           Sets number of all rows, which updates viewport height
	 *
	 * @param rowCount	: integer
	 *
	 * @return none
	 *
	 * @code
	 *
	 *
	 * @endcode
	 */
	this.setRowCount = function(rowCount){
		this._private.functions.setTotalRowCount({
			rowCount: rowCount,
			gridView: this
		});
	}

	/**
	 * GridView.setRowContents(rowNumber, contents)
	 * \~english
	 * @brief             Sets row contents
	 * @details           Sets row contents with the passed array of HTML/text objects
	 *
	 * @param rowNumber : integer
	 * @param contents : array
	 *
	 * @return none
	 *
	 * @code
	 *
	 *
	 * @endcode
	 */
	this.setRowContents = function(rowNumber, contents){

		this._private.functions.setRowContents({
			gridView: this,
			rowNumber: rowNumber,
			contents: contents
		});

	}

	/**
	 * GridView.setRowContentUpdateRequestDelayInMs(requestDelay)
	 * \~english
	 * @brief             Sets delay for row content requests in miliseconds
	 * @details           To optimize performance when user is scrolling rapidly, requestDelay will be
	 *						applied before row data is requested. Setting requestDelay to 0 will disable
	 *						delay and requests will be called immediately
	 *
	 * @param requestDelay : integer
	 *
	 * @return none
	 *
	 * @code
	 *
	 *
	 * @endcode
	 */
	this.setRowContentUpdateRequestDelayInMs = function(requestDelay){

	}

	/**
	 * GridView.refresh()
	 * \~english
	 * @brief             Refreshes grid data
	 * @details           Requests again data for the grid, updates row number
	 *
	 * @param none
	 *
	 * @return none
	 *
	 * @code
	 *
	 *
	 * @endcode
	 */
	this.refresh = function(){
		this._private.functions.refresh({
			gridView: this
		});
	}

	// ========================= <handling_selection>
	this.getSelectionMode = function(){
		return this.getSelection().getMode();
	}

	this.setSelectionMode = function(inSelMode){
		if (arguments.length > 0) {
			//var gvSel = this._private.selection;
			var dataSource = this.gridController.dataGrid.dataSource;
			var sel = dataSource.getSelection();
			if (sel.getMode() !== inSelMode)
			switch (inSelMode) {
				case 'none':
					sel.reset('none');
					break;

				case 'single':
					var gvFunctions = this._private.functions;
					var curpos = dataSource.getPosition();
					gvFunctions.hideCurrentRows({gridView:this});
					sel.reset('single');
					if (curpos != -1)
						dataSource.select(curpos);
					gvFunctions.showCurrentRows({gridView:this});
					break;

				case 'multiple':
					var curpos = dataSource.getPosition();
					sel.reset('multiple');
					if (curpos != -1)
						sel.select(curpos);
					break;
			}
		}
	}

	this.resetSelection = function(){
		var sel = this.getSelection();
		if (sel != null)
			sel.reset(sel.getMode());
	}

	this.countSelected = function(){
		var sel = this.getSelection();
		if (sel != null)
			return this.getSelection().countSelected();
		else
			return 0;
	}

	// Returns an array or rows numbers
	this.getSelectedRows = function(){
		var sel = this.getSelection();
		if (sel != null)
			return sel.getSelectedRows();
		else
			return null;
	}

	this.setSelectedRows = function(rowNumbers){
		var sel = this.getSelection();
		if (sel != null) {
			var gvFunctions = this._private.functions;
			var dataSource = this.gridController.dataGrid.dataSource;
			var currow = -1;
			if (rowNumbers != null && rowNumbers.length > 0)
				currow = rowNumbers[0];
			if (dataSource != null && currow != -1 && dataSource.getPosition() != currow) {
				var currow = rowNumbers[0];
				dataSource.select(currow, { userData: {
					mustSelectRows: rowNumbers
				}});
			}
			else {
				gvFunctions.hideCurrentRows({
					gridView: this
				});
				sel.setSelectedRows(rowNumbers);
				gvFunctions.showCurrentRows({
					gridView: this
				});
			}

		}
	}

	this.getSelection = function(){
		var result = null;
		/*
		 if (this.getSelectionMode() == 'none')
		 result = null;
		 else
		 */
		result = this.gridController.dataGrid.dataSource.getSelection();
		return result;
	}

	this.forgetSelection = function(){
		var sel = this.getSelection();
		if (sel != null) {
			sel.reset(gvSel.sel.getMode());
			if (sel.isModeMultiple()) {
				this._private.functions.hideCurrentRows({
					gridView: this
				});
			}
		}
	}
	// ========================= </handling_selection>

	/**
	 *
	 * @param {Object} html
	 */
	this.setStatusRight = function(html){
		this._private.globals.statusRightContainer.html(html);
	}

	this.resetSortIndicator = function(columnNb){
		var containerNode = this._private.globals.headerContainerNode;

		// removing focus
		containerNode.cells[columnNb].dom.removeClass('waf-state-focus');

		for (var i = 0, max = this._private.globals.columns.length; i < max; ++i) {
			containerNode.cells[i].sortIndicator.removeClass("waf-sort-asc waf-sort-desc");
		}
	}

	this.setSortIndicator = function(columnNb, sortOrder){
		//this._private.globals.headerContainerNode.cells[columnNb].sortIndicator.removeClass("waf-sort-asc waf-sort-desc").addClass('waf-sort-' + sortOrder);
		this.resetSortIndicator(columnNb);
		if (columnNb !== null && columnNb >= 0 && columnNb < this._private.globals.columns.length) {
			var theCol = this._private.globals.headerContainerNode.cells[columnNb].sortIndicator.removeClass("waf-sort-asc waf-sort-desc");
			this._private.globals.headerContainerNode.cells[columnNb].dom.addClass('waf-state-focus');
			sortOrder = sortOrder || 'asc';
			if (sortOrder !== 'asc' && sortOrder !== 'desc') {
				sortOrder = 'asc';
			}
			theCol.addClass('waf-sort-' + sortOrder);
		}
	}

	// constructor
	this.gridController = null;

	this.kill = function(){
		$(this._private.globals.targetNode).html("");
	}

	this.column = function(colRef, colSettings){
		var result = null;
		if (typeof colRef == "string") {
			result = this._private.globals.colsByID[colRef];
		}
		else {
			if (colRef > 0 && colRef <= this._private.globals.columns.length) {
				result = this._private.globals.columns[colRef - 1];
			}
		}
		if (result != null && colSettings != null && typeof colSettings == "object") {
			for (prop in colSettings) {
				switch (prop) {
					case "textSize":
						result.setTextSize(colSettings[prop]);
						break;
					case "color":
						result.setTextColor(colSettings[prop]);
						break;
					case "backgroundColor":
						result.setBackgroundColor(colSettings[prop]);
						break;
					case "width":
						result.setWidth(colSettings[prop]);
						break;
					case "format":
						result.setFormat(colSettings[prop]);
						break;
					case "renderer":
						result.setRenderer(colSettings[prop]);
						break;
					case "align":
						result.setAlignment(colSettings[prop]);
						break;
				}
			}
		}
		return result;
	}

	this.columns = function(colSettings){
		return this._private.globals.columns;
	}

	this.currentEditingRow = function(){
		var result = -1;
		if (this._private.globals.editHasBeenStarted) {
			var editInfo = this._private.globals.editInfo;
			if (editInfo != null) {
				result = editInfo.rowNumber;
			}
		}
		return result;
	}


	this.drawRow = function(rowNumber, elem, oldValues){
		var undefinedObject = true;
		var row = this._private.functions.getRowByRowNumber({
			gridView: this,
			rowNumber: rowNumber
		});
		var columns = this._private.globals.columns;
		if (row != null) {
			for (var i = 0; i < columns.length; ++i) {
				var cell = row.cells[i];
				var col = columns[i];
				var value = null;
				if (elem != null) {
					undefinedObject = false;
					if (oldValues)
						value = elem.getOldAttributeValue(col.sourceAttID);
					else
						value = elem.getAttributeValue(col.sourceAttID);
				}
				this.drawCell(row, cell, col, value, undefinedObject);
			}

			var drawhandler = this.gridController.onRowDraw;
			if (drawhandler != null) {
				var drawEvent = {
					row: row,
					dataSource: this.gridController.dataGrid.dataSource,
					element: elem
				}
				drawhandler(drawEvent);
			}
		}
	}

	this.drawCell = function(row, cell, col, value, undefinedObject){
		var needTip = false;
		var imgSrc;
		var content = null;
		cell.value = value;
		row.gridView = this;

		if (col.renderer != null) {
			content = col.renderer({
				value: value,
				rowNumber: row.rowNumber,
				dataSource: this.gridController.dataGrid.dataSource,
				cellDiv: cell.insideCell
			});
		}
		if (content == null) {
			if (col.att == null) {
                            if (typeof Designer === 'undefined') {
				content = '##wrong reference##';
                            } else {
                                content = '';
                            }
                        } else {
				if (col.att.type === "image") {
					if (value != null && value.__deferred != null && value.__deferred.uri != null) {
						content = " ";
						var h = cell.dom.height() - 5;
						var w = cell.dom.width();
						if (h > w)
							h = w;
						else
							w = h;

						imgSrc = value.__deferred.uri;
						content = '<img class="inside-img" src="' + imgSrc + '" style="max-height:' + h + 'px;max-width:' + w + 'px;" />';
						needTip = true;
					}
					else
						content = " ";
				}
				else
					if (col.att.type === "bool") {
						var parts = [""];
						var format = col.format;
						if (format != null)
							format = format.format;
						if (format != null) {
							parts = format.split(";");
						}
						if (parts.length > 1) {
							var rname = "r"+Math.random();
							var html = '<input type="radio" class="waf-dataGrid-radio-true" value="true" name="'+rname+'"';
							if (value)
								html += ' checked="checked"';
							if (col.readOnly)
								html += ' disabled="true"';
							html += '/>';
							html += '<span class="waf-dataGrid-radio-label">';
							html += parts[0];
							html += '</span>';

							html += '<input type="radio" class="waf-dataGrid-radio-false" value="false" name="'+rname+'"';
							if (value === false)
								html += ' checked="checked"';
							if (col.readOnly)
								html += ' disabled="true"';
							html += '/>';
							html += '<span class="waf-dataGrid-radio-label">';
							html += parts[1];
							html += '</span>';
							content = html;
						}
						else {
							var cssClass = 'waf-dataGrid-checkbox'
							var html = '<input type="checkbox" class="waf-dataGrid-checkbox"';
							if (value)
								html += ' checked="checked"';
							if (col.readOnly)
								html += ' readOnly="true"';

							/*if (undefinedObject === true) //fix WAK0077487
								html += ' disable="true"';

							if (undefinedObject === true)
								html += ' disabled="true" ';*/

							html += '/>';
							if (parts[0].length > 0){
								html += '<span class="waf-dataGrid-checkbox-label">';
								html += parts[0];
								html += '</span>';
							}
							content = html;
						}
					}
					else {
                                            if (typeof Designer === 'undefined') {
                                                content = col.getFormattedValue(value);
                                            } else {
                                                content = '';
                                            }
                                        }

			}
		}
		if (content === "")
			content = "&nbsp";

		cell.insideCell.html(content);
		if (undefinedObject === true) {
			cell.insideCell.find("input").hide(); //fix WAK0077487
		}
		cell.insideCell[0].gridCell = cell;
		cell.col = col;
		cell.insideCell[0].gridRow = row;
		//cell.dom.height(row.gridView._private.globals.rowHeight);
		//cell.insideCell.height(row.gridView._private.globals.rowHeight);

		if (needTip) {
			//$('img', cell.insideCell).bt('<img src="' + imgSrc + '/>', { trigger: ['mouseover', 'click']});
			cell.dom.bt('<img src="' + imgSrc + '" width="200" height="200" />', {
				width: 200,
                                fill: 'white',
                                strokeStyle: 'gray',
				height: 200,
				trigger: ['hover', 'click'],
				offsetParent: $('body')
			});
		}
	}


	this.updateCell = function(rowNumber, attName, value){
		var col = this.column(attName);
		if (col != null) {
			var colnum = col.columnNumber;
			var row = this._private.functions.getRowByRowNumber({
				gridView: this,
				rowNumber: rowNumber
			});
			if (row != null) {
				var cell = row.cells[colnum];
				if (cell != null) {
					this.drawCell(row, cell, col, value);
					/*
					 var content = "";

					 if (col.renderer != null) {

					 content = col.renderer({
					 value     : value,
					 rowNumber : rowNumber,
					 dataSource: this.gridController.dataGrid.dataSource,
					 cellDiv   : cell.insideCell
					 });
					 } else {
					 content = col.getFormattedValue(value);
					 }
					 cell.insideCell.html(content);
					 */
				}
			}
		}
	}

	this.setCurrentRow = function(inRowNumber, doNotAlterSelection){
		var gvSel = this._private.selection, sel = this.getSelection(), gvGlobals = this._private.globals, gvFunctions = this._private.functions;

		var prevRow, curRow, shiftKey, metaKey, max, oneRow, first, last, theEvt, temp, classActive = gvSel.cssClass;

		if (sel.isModeSingle()) {
			if (!doNotAlterSelection) {
				gvFunctions.hideCurrentRows({
					gridView: this
				});
				gvGlobals.currentRow = inRowNumber;
				sel.select(inRowNumber);
				gvFunctions.showCurrentRows({
					gridView: this
				});
			}
			/*
			 if (gvGlobals.options.autoScrollOnSelected)
			 {
			 this.centerRow(inRowNumber, { doNotScrollIfVisible : true});
			 }
			 */
		}
		else
			if (sel.isModeMultiple()) {
				if (!doNotAlterSelection) {
					theEvt = gvSel.curEvt;
					shiftKey = theEvt && 'shiftKey' in theEvt && theEvt.shiftKey;
					metaKey = theEvt && (('metaKey' in theEvt && theEvt.metaKey) || ('ctrlKey' in theEvt && theEvt.ctrlKey));

					if (shiftKey) {
						prevRow = gvFunctions.getRowByRowNumber({
							gridView: this,
							rowNumber: gvGlobals.currentRow
						});
						if (prevRow == null) {
							if (gvGlobals.currentRow < 0) {
								first = inRowNumber;
							}
							else {
								first = gvGlobals.currentRow;
							}
							last = inRowNumber;
							if (first > last) {
								temp = last;
								last = first;
								first = temp;
							}
						}
						else
							if (prevRow.rowNumber > inRowNumber) {
								first = inRowNumber;
								last = prevRow.rowNumber;
							}
							else {
								first = prevRow.rowNumber;
								last = inRowNumber;
							}

						for (var i = first; i <= last; ++i) {
							var curRow = gvFunctions.getRowByRowNumber({
								gridView: this,
								rowNumber: i
							});
							if (curRow != null) {
								curRow.dom.addClass(classActive);
							}
						}
						gvGlobals.currentRow = inRowNumber;

						sel.selectRange(first, last, true);
					}
					else
						if (metaKey) {
							gvGlobals.currentRow = inRowNumber;
							sel.toggle(inRowNumber);
							curRow = gvFunctions.getRowByRowNumber({
								gridView: this,
								rowNumber: inRowNumber
							});
							if (curRow != null) {
								curRow.dom.toggleClass(classActive);
							}
						}
						else {
							// Remove previous highlight effect
							$('#' + this.gridController.dataGrid.subscriberID + ' .waf-widget-body .container').children().removeClass(classActive);
							// Highlight the row
							curRow = gvFunctions.getRowByRowNumber({
								gridView: this,
								rowNumber: inRowNumber
							});
							if (curRow != null) {
								curRow.dom.addClass(classActive);
							}
							gvGlobals.currentRow = inRowNumber;

							sel.select(inRowNumber);
						}
				}
				gvSel.curEvt = null;
			}
			else {
				gvGlobals.currentRow = inRowNumber;
			}

		if (gvGlobals.options.autoScrollOnSelected) {
			this.centerRow(inRowNumber, {
				doNotScrollIfVisible: true
			});
		}
	}

	this.centerRow = function(rowNumber, options){
		options = options || {};
		if (typeof rowNumber != 'number')
			rowNumber = 0;
		var gridView = this;
		var gridvars = this._private.globals;
		var gridfuncs = this._private.functions;
		var actualTop;

		var totalRows = gridvars.totalRowCount;
		var nbRowsInPage = Math.round(gridvars.viewportNode.height() / gridvars.rowHeight);

		if (rowNumber < 0)
			rowNumber = 0;
		if (rowNumber >= totalRows)
			rowNumber = totalRows - 1;

		var mustScroll = true;
		if (options.doNotScrollIfVisible) {
			var nbFullRowsInPage = Math.floor(gridvars.viewportNode.height() / gridvars.rowHeight);

			if (WAF.PLATFORM.modulesString === "mobile") {
				var curtop = -(gridView._private.globals.viewportContainerNode.position().top);
				actualTop = curtop / gridvars.rowHeight;
			}
			else {
				actualTop = gridvars.viewportNode.scrollTop() / gridvars.rowHeight;
			}

			if (rowNumber >= actualTop && rowNumber < Math.floor(actualTop) + nbFullRowsInPage) {
				mustScroll = false;
			}

		}

		if (mustScroll) {
			var toprow = rowNumber - Math.floor(nbRowsInPage / 2);
			if (toprow < 0)
				toprow = 0;

			if (WAF.PLATFORM.modulesString === "mobile") {
				//use scrollTo, method of iScroll lib
				gridView._private.scrollObject.scrollTo(0, -(toprow * gridvars.rowHeight));
			}
			else {
				gridvars.viewportNode.scrollTop(toprow * gridvars.rowHeight);
			}

		}
	}

	this.setOptions = function(options){
		if (options != null) {
			if (options.autoScrollOnSelected != null) {
				var gridvars = this._private.globals;
				gridvars.options.autoScrollOnSelected = options.autoScrollOnSelected;
			}
		}
	}

	this.fixWebKitBug = function(){
		var gvar = this._private.globals;
		if (!gvar.alreadFlaggedTimoutRowHeight) {
			gvar.alreadFlaggedTimoutRowHeight = true;
			setTimeout(function(e){
				$(".waf-dataGrid-cell", gvar.viewportContainerNode).height(gvar.rowHeight - 1);
				setTimeout(function(e){
					gvar.alreadFlaggedTimoutRowHeight = false;
					$(".waf-dataGrid-cell", gvar.viewportContainerNode).height(gvar.rowHeight);
				}, 1);
			}, 1);
		}
	};

	this.setRowHeight = function(rowHeight){
		rowHeight = rowHeight || 0;
		if (rowHeight < 1)
			rowHeight = 1;
		var gridView = this;
		var gridvars = this._private.globals;
		var gridfuncs = this._private.functions;

		$(".inside-img", gridvars.viewportContainerNode).css({
			"max-height": "1px",
			"max-width": "1px"
		});

		var rows = gridvars.rows;
		/*
		if (rows.length > 0) {
			rows[0].dom.height(rowHeight);
			rows[0].insideDom.height(rowHeight);
			rowHeight = rows[0].dom.outerHeight();
			var insideHeight = rows[0].insideDom.height();
			if (rowHeight < insideHeight)
				rowHeight = insideHeight;
		}
		*/
		rows.forEach(function(row){
			row.dom.height(rowHeight);
			row.insideDom.height(rowHeight);
		});
		/*
		$(".inside-img", gridvars.viewportContainerNode).css({
			"max-height": "",
			"max-width": ""
		});
		*/

		gridvars.rowHeight = rowHeight;
		$(".waf-dataGrid-cell", gridvars.viewportContainerNode).height(rowHeight);
		var numberOfRows = gridView.gridController.getRowCount(gridView);
		var height = rowHeight * numberOfRows;
		if ((height > 17895697) & (WAF.utils.environment.browser.firefox3)) {
			gridView._private.globals.viewportContainerNode.height(17895697);
		}
		else {
			gridView._private.globals.viewportContainerNode.height(height);
		}
	}


	this.goToCell = function(rowPos, colID, handler){
		this.gridController.gridView.goToCell(rowPos, colID);
	}

	this.stopEditing = function(handler){
		this.gridController.gridView.goToCell(rowPos, colID);
	}

	/**
	 *
	 * Sets the width for each row, ignoring scrollbar width if noScrollBar is set to true
	 *
	 *
	 */
	this.computeRowWidth = function(noScrollBar){
		var gridView = this,
			gvar = this._private.globals,
			width = 0,
			maxw = 0,
			prevWidth = 0;

		for (var columnCount = 0, size = gvar.columns.length; columnCount < size; columnCount++) {
			width += parseInt(gvar.columns[columnCount].width);
		}

		if (width < gvar.viewportNode.width()) {
			if (noScrollBar) {
				width = gvar.viewportNode.width();
			} else {
				width = gvar.viewportNode.width() - gvar.vScrollBarWidth - 1;
			}
		}

		$(".waf-dataGrid-row", gvar.targetNode).width(width);
		$(".waf-dataGrid-header > .container", gvar.targetNode).width(width).height(32);

		var last = $(".waf-dataGrid-cell", gvar.headerContainerNode).filter(":last");
		var antelast = last.prev();
		var insideWidth = gvar.headerContainerNode.width();

		if (antelast.position()) {
			prevWidth = antelast.position().left + antelast.outerWidth();
        }
		var w = insideWidth - prevWidth;

		if (gvar.columns.length > 0) {
			maxw = gvar.columns[gvar.columns.length-1].width;
        }

		if (w > maxw)
			w = maxw;

		if (w > 1)
			last.width(w);
	}

	return this;
};



WAF.classes.GridColumn = {
	setTextSize: function(textSize){
		this.textSize = textSize;
		//$(".cellCol"+this.columnNumber, this.gridview._private.globals.targetNode).css("font-size", ""+textSize+"px");
		$(".waf-dataGrid-col-" + this.colID, this.gridview._private.globals.targetNode).css("font-size", "" + textSize + "px");
	},

	setTextColor: function(color){
		this.color = color;
		//$(".cellCol"+this.columnNumber, this.gridview._private.globals.targetNode).css("color", color);
		$(".waf-dataGrid-col-" + this.colID, this.gridview._private.globals.targetNode).css("color", color);
	},

	/*
	 * DEPRECATED
	 */
	setColor: function(color){
		this.setTextColor(color);
	},

	setBackgroundColor: function(backColor){
		this.backColor = backColor;
		$(".waf-dataGrid-col-" + this.colID, this.gridview._private.globals.targetNode).css("background-color", backColor);
	},

	setWidth: function(colWidth){
		this.width = colWidth;
		var gvar = this.gridview._private.globals;
		/*
		 var width = 0;
		 for (var columnCount = 0; columnCount < gvar.columns.length; columnCount++)
		 {
		 width += parseInt(gvar.columns[columnCount].width);
		 }

		 if (width < gvar.viewportNode.width())
		 {
		 width = gvar.viewportNode.width()-gvar.vScrollBarWidth-1;
		 }
		 $(".waf-dataGrid-row", gvar.targetNode).width(width);
		 */

		this.gridview.computeRowWidth();

		$(".waf-dataGrid-col-" + this.colID, gvar.targetNode).width(colWidth);
		$(".waf-dataGrid-col-" + this.colID + " > .content", gvar.targetNode).width(colWidth);
		var header = $(".waf-dataGrid-col-" + this.colID, gvar.targetNode).first();
		var outW = header.outerWidth();
		var w = header.width();
		if (outW > w)
			header.width(outW + (outW - w));

		if (this.columnNumber === (gvar.columns.length-1))
			this.gridview.computeRowWidth();

		this.gridview.gridController.dataGrid.redraw();
	},

	setFormat: function(format){
		if (typeof(format) == "string")
			format = {
				format: format
			};
		this.format = format;
		this.gridview.gridController.dataGrid.redraw();

	},

	setRenderer: function(renderer){
		this.renderer = renderer;
		this.gridview.gridController.dataGrid.redraw();
	},

	setAlignment: function(align){
		this.align = align;
		$(".waf-dataGrid-col-" + this.colID, this.gridview._private.globals.targetNode).css("text-align", align);
	},

	hideSortIndicators : function(){
		var gvar = this.gridview._private.globals;
		$(".waf-dataGrid-col-" + this.colID+" .waf-sort", gvar.targetNode).hide();
	},

	showSortIndicators : function(){
		var gvar = this.gridview._private.globals;
		$(".waf-dataGrid-col-" + this.colID+" .waf-sort", gvar.targetNode).show();
	}

};



WAF.gridUtil.addRow = function(gridView){
	var source = gridView.gridController.dataGrid.dataSource;
	if (source != null) {
		function readyToAddRow(gridView){
			if (gridView._private.globals.currentlyUpdatingRowPositions) {
				window.setTimeout(function(){
					readyToAddRow(gridView);
				}, 100);
			}
			else {
				window.setTimeout(function(){ // quick fix, needs to be redone
					var row = gridView._private.functions.getRowByRowNumber({
						gridView: gridView,
						rowNumber: gridView._private.globals.totalRowCount - 1
					});

					if (!WAF.PLATFORM.isTouch) {
						gridView._private.functions.startEditCell({
							gridView: gridView,
							columnNumber: 0,
							row: row,
							cell: row.cells[0]
						});
					}


				}, 200);
			}
		}

		source.addNewElement(null, {
			gridView: gridView,
			execOnEventDispatch: readyToAddRow
		});

	}
}


WAF.gridUtil.delRow = function(gridView){
	var source = gridView.gridController.dataGrid.dataSource;
	if (source != null) {
		var errorHandler = gridView.gridController.errorHandler;
		var errorMessage = "The data grid could not delete the entity";
		source.removeCurrent({
			onError: errorHandler
		}, {
			gridView: gridView,
			errorMessage: errorMessage
		});
	}
}






/**
 * ----------------------------------------------------------------------------
 * content of widget-dataGrid-controller.js
 * ----------------------------------------------------------------------------
 */
/**
 * @brief			GridController, part of WAF/UI/Grid
 * @details			Collection of functions that are called by GridView. Use this code to link
 a view (in this case GridView) to your data model in order to achieve Model-View-Controller (MVC))
 architecture.
 *
 *
 *
 * @author			rudolfpsenicnik
 * @date			February 2009
 * @version			1.0
 *
 * @include			copyright.txt
 */
WAF.classes.GridController = function(){

	// Private
	this._private = {
		globals: {},
		functions: {},
		handlers: {}
	};

	/**
	 * GridController.getColumnCount(grid)
	 * \~english
	 * @brief             Sets grid column count
	 * @details           Return column count for the grid, usually called when grid is initialized
	 *
	 * @param grid : GridView
	 *
	 * @return columnCount : integer
	 *
	 * @code
	 *
	 *
	 * @endcode
	 */
	this.getColumnCount = function(grid){

		var columnCount = 0;

		return columnCount;

	}

	/**
	 * GridController.getRowCount(grid)
	 * \~english
	 * @brief             Sets grid row count
	 * @details           Return number of rows, usually called when grid is initialized
	 This will update viewport height, and only rows that are visible will be rendered
	 *
	 * @param grid : GridView
	 *
	 * @return rowCount : integer
	 *
	 * @code
	 *
	 *
	 * @endcode
	 */
	this.getRowCount = function(grid){

		var rowCount = 0;

		return rowCount;

	}

	/**
	 * GridController.setContentForRow(grid)
	 * \~english
	 * @brief             Sets row contents
	 * @details           Row contents are set based on the passed array of HTML/text elements
	 Returning array with length 0 will NOT erase existing contents, to do that, pass empty array.
	 *
	 * @param rowNumber : integer
	 *
	 * @return contents : array
	 *
	 * @code
	 *
	 *
	 * @endcode
	 */
	this.setContentForRow = function(rowNumber){

		var contents = [];

		return contents;

	}

	this.isContentAvailableForRow = function(rowNumber){

		return true;

	}

	this.setStyleForRow = function(rowNumber){

		return {
			rowStyle: ''
		};

	}

	this.setPropertiesForColumn = function(columnProperties){

		return {};

	}

	this.onRowClick = function(event){
		//WAF.utils.debug.console.log("Clicked on row " + event.data.row.rowNumber);
	}

	this.onRowDblClick = null;

	this.baseDblClick = function(event) {
		var gridView = event.data.gridView;
		var dblclickHandler = gridView.gridController.onRowDblClick;
		if (dblclickHandler != null) {
			var row = event.data.row;
			if (row.rowNumber < gridView._private.globals.totalRowCount) {
				gridView.gridController.onRowDblClick(event);
			}
		}

	}


	this.onRowRightClick = function(event){

	}


	this.onCellClick = function(event){

	}

	this.onHeaderClick = function(cell, columnNumber){
	}

	this.onRowDraw = null; // onRowDraw(event)    event: { row: GridRow, dataSource: DataSource, rowValue: entireElement }
	this.onError = null; // onError(event)  usual DataProvider error event
	// constructor
	this.gridView = new WAF.classes.GridView();
	this.gridView.gridController = this;
};







/**
 * ----------------------------------------------------------------------------
 * original content of widget-dataGrid.js
 * ----------------------------------------------------------------------------
 */
WAF.Widget.provide('Grid', {
	onResize: function(){

	}
}, function WAFWidget(config, data, shared){

	var colWidth = config['data-column-width'] ? config['data-column-width'].split(',') : [], colNames = config['data-column-name'] ? config['data-column-name'].split(',') : [],
	tagClass = config['class'],
	sum = 0, colName = '', tagWidth = 0, diffWidth = 0, displayScroll = true, grid = null, configColumn = {}, length = 0, i = 0,
	attributeName = '', column = [],
	selectionMode = config['data-selection-mode'] ? config['data-selection-mode'] : 'single',
	errorDiv = config['data-errorDiv'], hideFooter = false, hideHeader = false,
	textFooter = config['data-footer-text'] ? config['data-footer-text'] : 'item(s)',
	mustDisplayError = config['data-display-error'], theID = config['id'];

	if (mustDisplayError == null) {
		mustDisplayError = true;
	}
	else {
		mustDisplayError = (mustDisplayError == '1' || mustDisplayError == 'true');
	}
	tagWidth = parseInt(document.getElementById(theID).style.width) - 1;


	if (config['data-footer-hide'] === 'true') {
		hideFooter = true;
	}

	if (config['data-header-hide'] === 'true') {
		hideHeader = true;
	}

	// check for retro compatibility
	if (config['data-column'] && config['data-column'] != '[]') {

		configColumn = JSON.parse(config['data-column'].replace(/'/g, "\""));

		// unescape value
		length = configColumn.length;
		for (i = 0; i < length; i++) {
			column = configColumn[i];
			for (attributeName in column) {
				column[attributeName] = unescape(column[attributeName]);
			}
		}

		grid = new WAF.classes.DataGrid({
			inDesign: false,
			id: theID,
			render: theID,
			dataSource: config['data-binding'],
			binding: config['data-binding'],
			columns: configColumn,
			colWidth: colWidth,
			cls: tagClass,
			selMode: selectionMode,
			mustDisplayError: mustDisplayError,
			errorDiv: errorDiv,
			hideFooter: hideFooter,
			hideHeader: hideHeader,
			textFooter: textFooter
		});
	}
	else {
		// old code for compatibility with very early versions
		// if only one column the width is the same that the widget width
		if (colNames.length === 1) {
			colWidth = [tagWidth];
			displayScroll = false;
			// else auto resize the lastest column
		}
		else {
			sum = 0
			for (colName in colNames) {
				sum += parseInt(colWidth[colName]);
			}
			if (sum < tagWidth) {
				diffWidth = tagWidth - sum;
				colWidth[colNames.length - 1] = String((parseInt(colWidth[colNames.length - 1]) + diffWidth));
				displayScroll = false;
			}
		}

		// reformat config
		var tabName = [];
		var tabAttribute = [];
		var tabWidth = [];

		if (config['data-column-name']) {
			tabName = config['data-column-name'].split(',');
		}
		if (config['data-column-attribute']) {
			tabAttribute = config['data-column-attribute'].split(',');
		}
		if (config['data-column-width']) {
			tabWidth = config['data-column-width'].split(',');
		}

		length = tabAttribute.length;
		column = null;

		var att = '';
		var label = '';
		var width = '';

		configColumn = [];
		for (i = 0; i < length; i++) {
			column = {};

			att = tabAttribute[i];

			try {
				label = tabName[i];
			}
			catch (e) {
				label = att;
			}

			try {
				width = tabWidth[i];
			}
			catch (e) {
				width = '150';
			}

			column['sourceAttID'] = att;
			column['title'] = label;
			column['width'] = width;

			configColumn.push(column);
		}

		grid = new WAF.classes.DataGrid({
			inDesign: false,
			id: theID,
			render: theID,
			dataSource: config['data-binding'],
			binding: config['data-binding'],
			columns: configColumn,
			colWidth: colWidth,
			cls: tagClass,
			selMode: selectionMode,
			mustDisplayError: mustDisplayError,
			errorDiv: errorDiv,
			hideFooter: hideFooter,
			textFooter: textFooter
		});

	}

	// Hide vertical scrollbar if necessary
	if (!displayScroll) {
		$('#' + theID + ' .waf-dataGrid-body').css('overflow-x', 'hidden');
	}

	// Drag
	$.ui['draggable'].prototype.plugins.start[4][1] = function(event, ui){
		var ind = $(this).data("draggable");
		if (ind.scrollParent && ind.scrollParent[0] != document && ind.scrollParent[0].tagName != 'HTML') {
			ind.overflowOffset = ind.scrollParent.offset();
		}
	}


	if (config['data-draggable'] === "true") {
		$('#' + theID + ' .waf-widget-header').css('cursor', 'pointer');
		$('#' + theID + ' .waf-widget-footer').css('cursor', 'pointer');

		$('#' + theID).draggable("option", "cancel", '.waf-widget-body');
		$('#' + theID).draggable("option", "stack", '.waf-widget');
	}

	// hide toolber
	if (config['data-footer-hide'] === 'true') {
		$('#' + theID + ' .waf-widget-footer').hide();
	}

	// readOnly
	if (config['data-readOnly'] === "true") {
		// Hide toolbar
		$("#" + theID + " .waf-dataGrid-footer .waf-toolbar").hide();
		this.readOnly = true;
		// Lock columns
		grid.columns().forEach(function(theCol, idx, arr){
			theCol.readOnly = true;
		});
	}

	var propName = '';
	for (propName in grid) {
		this[propName] = grid[propName];
	}

}, {
	getValueForInput: function datagrid_get_value_for_input(){
		var value;

		if (this.sourceAtt == null) {
			value = this.source.getAttribute(this.att.name).getValueForInput();
		}
		else {
			value = this.sourceAtt.getValueForInput();
		}

		return value;
	},

	/**
	 * Resize method called during resize
	 * @method onResize
	 */
	onResize: function datagrid_resize(){

		$('#' + this.id + ' .waf-widget-body').css('width', parseInt($('#' + this.id).css('width')));

		var newHeight = parseInt($('#' + this.id).css('height')) - parseInt($('#' + this.id + ' .waf-widget-footer').css('height'));
		newHeight -= parseInt($('#' + this.id + ' .waf-widget-header').css('height'));
		$('#' + this.id + ' .waf-widget-body').css('height', newHeight + 'px');

		this.gridController.gridView.refresh();

	},

	/**
	 * Resize method called on stop resize
	 * @method onResize
	 */
	stopResize: function datagrid_stop_resize(){

		this.gridController.gridView.refresh();

	},

	/**
	 * Disable the dataGrid
	 * @method disable
	 */
	disable: function datagrid_disable(){
		this.setReadOnly(true);

		/*
		 * Call super class disable function
		 */
        WAF.Widget.prototype.disable.call(this);
	},

	isReadOnly: function() {
		return !!this.readOnly;
	},

	/**
	 * Enable the dataGrid
	 * @method enable
	 * @param {boolean} disable
	 */
	enable: function datagrid_enable(){
		this.setReadOnly(false);

		/*
		 * Call super class enable function
		 */
        WAF.Widget.prototype.enable.call(this);
	}
});

// initialize handlers once, when loading the framework

$('body').delegate('.waf-dataGrid-checkbox', 'change', WAF.classes.DataGrid.checkBoxHandler);
//$('body').delegate('.waf-dataGrid-checkbox', 'blur', WAF.classes.DataGrid.checkBoxBlurHandler);
$('body').delegate('.waf-dataGrid-radio-true', 'change', WAF.classes.DataGrid.radioTrueHandler);
$('body').delegate('.waf-dataGrid-radio-false', 'change', WAF.classes.DataGrid.radioFalseHandler);
