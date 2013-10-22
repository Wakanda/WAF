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
 * The DataSource API provides an easy way to link data together.
 *
 * The DataSource API relies on EntityCollections. An EntityCollection is not the datastore class,
 * but a representation of the current selection, as created by the latest query on the EM.
 * Working with a datasource means in effect working with the current element of said selection.
 *
 * Each DataSource has its own EntityCollection.
 *
 * @module DataSource
 *
 **/
// ----------------------------------------------------------------------------------------------


// model for javascript variable datasource

/*
 templateModel =
 {
 property1 :
 {
 name : "property1",
 type : "number  or  string  or  boolean  or  date  or  long",
 // optionnaly
 maxValue : number,
 minValue : number,
 pattern  : someString,
 minLength: number,
 maxLength: number,
 fixedLength : number,
 }
 
 property2 : ......
 }
 data-source-type = "scalar"  or   "object"  or  "array"
 if "scalar"
 data-dataType : "string or number or ..."
 else
 data-attributes = "att1Name:att1Type, att2Name:att2Type, ...";
 
 */
/*
 // Call of the API functions
 func(necessaryParam1, necessaryParam2, ..., parameterBlock, userData)
 userData will be passed within event.data
 // Parameters block (parameterBlock) for the differents methods:
 
 parameterBlock
 {
 onSuccess	: function(event)
 onError	: function(event)
 sync		: boolean
 dispatcherID	: string
 dispatcherType	: string
 }
 Used Events:
 event
 {
 eventKind : string (par exemple "currentElement", "fullSet", "cancelElement", "onAttributeChange")
 dataSource : DataSource
 
 dispatcherID: string
 dispatcherType: string
 listenerID: string
 listenerType: string
 userData: any kind of object
 // pour un attributeChange
 attribute: DataSourceAttribute
 attributeName: string
 
 }
 */
// ----------------------------------------------------------------------------------------------






WAF.DataSourceEmSimpleAttribute = function(emAtt, source){


	this.name = emAtt.name;
	
	
	this.kind = (typeof emAtt.kind == "string") ? emAtt.kind : "storage";
	
	
	
	this.owner = source;
	
	
	
	this.simple = emAtt.type != 'image';
	
	
	
	this.dataClassAtt = emAtt;
	
	
	
	this.type = emAtt.type;
	
	
	
	this.isVarAtt = false;
	
	this.isFirstLevel = true;
	
	
	// methods: see code after the constructor definition
	
	this.getValue = WAF.DataSourceEmSimpleAttribute.getValue;
	this.setValue = WAF.DataSourceEmSimpleAttribute.setValue;
	this.validate = WAF.DataSourceEmSimpleAttribute.validate;
	this.getOldValue = WAF.DataSourceEmSimpleAttribute.getOldValue;
	this.getValueForInput = WAF.DataSourceEmSimpleAttribute.getValueForInput;
	this.normalize = WAF.DataSourceEmSimpleAttribute.normalize;
	this.dispatch = WAF.DataSourceEmSimpleAttribute.dispatch;
	this.addListener = WAF.DataSourceEmSimpleAttribute.addListener;
};



WAF.DataSourceEmSimpleAttribute.getValue = function(){
	var entity = this.owner.getCurrentElement();
	if (entity == null) {
		return null;
	}
	else {
		return entity[this.name].value;
	}
};



WAF.DataSourceEmSimpleAttribute.setValue = function(value, options){
	options = options;
	
	var entity = this.owner.getCurrentElement();
	if (entity == null) {
		// nothing to do
	
		// MAY EXPECT AN EXCEPTION
	
	}
	else {
		if (this.owner[this.name] !== value) {
			this.owner[this.name] = value;
			entity[this.name].setValue(value);
			this.dispatch(options);
		}
	}
};



WAF.DataSourceEmSimpleAttribute.validate = function(value){
	var entity = this.owner.getCurrentElement();
	if (entity == null) {
		return {
			valid: true,
			messages: []
		};
	}
	else {
		return this.owner._private._validateAttribute(this.name, value);
	}
};



WAF.DataSourceEmSimpleAttribute.getOldValue = function(){
	var entity = this.owner.getCurrentElement();
	if (entity == null) {
		return null;
	}
	else {
		return entity[this.name].getOldValue();
	}
};



WAF.DataSourceEmSimpleAttribute.getValueForInput = function(){
	var value = this.getValue();
	if (value == null) {
		value = "";
	}
	else {
		if (this.type == "date") {
			value = WAF.utils.formatDate(value);
		}
		else {
			value = "" + value;
		}
	}
	return value;
};



WAF.DataSourceEmSimpleAttribute.normalize = function(value){
	var result = value;
	switch (this.type) {
		case "string":
			if (typeof value != "string") {
				result = "" + value;
			}
			break;
			
		case "number":
		case "float":
			if (typeof value == "string") {
				if (value == "") 
					result = null;
				else {
					result = parseFloat(value);
					if (isNaN(result)) 
						result = null;
				}
			}
			break;
			
		case "boolean":
			if (typeof value != "boolean") {
				result = Boolean(value);
			}
			break;
			
		case "date":
			if (typeof value == "string") {
				if (value == "") 
					result = null;
				else {
					///result = new Date(value); // Warning! Doesn't work on all engines with ISO String.
					result = $.fn.DatePickerParse(value, WAF.utils.dateInputFormat);
				}
			}
			break;
			
		case "long":
		case "byte":
		case "word":
		case "long64":
			if (typeof(value) == "string") {
				if (value == "") 
					result = null;
				else {
					result = parseInt(value, 10);
					if (isNaN(result)) 
						result = null;
				}
			}
			break;
	}
	return result;
};



WAF.DataSourceEmSimpleAttribute.addListener = function(eventHandler, options, userData){
	options = options || {};
	options.attributeName = this.name;
	options.attribute = this;
	userData = userData;
	return this.owner.addListener("onAttributeChange", eventHandler, options, userData);
};



WAF.DataSourceEmSimpleAttribute.dispatch = function(options){
	if (options == null) {
		options = {};
	}
	options.attribute = this;
	options.attributeName = this.name;
	this.owner.dispatch("onAttributeChange", options);
};



// ----------------------------------------------------------------------------------------------



WAF.DataSourceEmRelatedAttribute = function(emAtt, source){
	WAF.DataSourceEmSimpleAttribute.call(this, emAtt, source);
	
	
	
	this.simple = false;
	
	
	/* 
	 this.getValue = WAF.DataSourceEmSimpleAttribute.getValue;
	 this.setValue = WAF.DataSourceEmSimpleAttribute.setValue;
	 this.validate = WAF.DataSourceEmSimpleAttribute.validate;
	 this.getOldValue = WAF.DataSourceEmSimpleAttribute.getOldValue;
	 this.getValueForInput = WAF.DataSourceEmSimpleAttribute.getValueForInput;
	 this.normalize = WAF.DataSourceEmSimpleAttribute.normalize;
	 */
};




// ----------------------------------------------------------------------------------------------

WAF.DataSourceEmDeepSimpleAttribute = function(emAtt, source, fullPath){
	WAF.DataSourceEmSimpleAttribute.call(this, emAtt, source);
	
	this.isFirstLevel = false;
	this.name = fullPath;
	this.readOnly = true;
	
	this.getValue = WAF.DataSourceEmDeepSimpleAttribute.getValue;
	this.getOldValue = WAF.DataSourceEmDeepSimpleAttribute.getOldValue;
	/*
	 this.setValue = WAF.DataSourceEmSimpleAttribute.setValue;
	 this.validate = WAF.DataSourceEmSimpleAttribute.validate;
	 this.getOldValue = WAF.DataSourceEmSimpleAttribute.getOldValue;
	 this.getValueForInput = WAF.DataSourceEmSimpleAttribute.getValueForInput;
	 this.normalize = WAF.DataSourceEmSimpleAttribute.normalize;
	 */
};


WAF.DataSourceEmDeepSimpleAttribute.getValue = function(){
	return this.owner.getAttributeValue(this.name)
};


WAF.DataSourceEmDeepSimpleAttribute.getOldValue = function(){
	return this.owner.getOldAttributeValue(this.name)
};


// ----------------------------------------------------------------------------------------------



WAF.DataSourceEmDeepRelatedAttribute = function(emAtt, source, fullPath){
	WAF.DataSourceEmRelatedAttribute.call(this, emAtt, source);
	
	this.isFirstLevel = false;
	this.name = fullPath;
	this.readOnly = true;
	
	this.getValue = WAF.DataSourceEmDeepRelatedAttribute.getValue;
	/*
	 this.setValue = WAF.DataSourceEmSimpleAttribute.setValue;
	 this.validate = WAF.DataSourceEmSimpleAttribute.validate;
	 this.getOldValue = WAF.DataSourceEmSimpleAttribute.getOldValue;
	 this.getValueForInput = WAF.DataSourceEmSimpleAttribute.getValueForInput;
	 this.normalize = WAF.DataSourceEmSimpleAttribute.normalize;
	 */
};


WAF.DataSourceEmDeepRelatedAttribute.getValue = function(){
	return this.owner.getAttributeValue(this.name)
};



// ----------------------------------------------------------------------------------------------



WAF.DataSourceVarAttribute = function(varAtt, source){

	WAF.DataSourceEmSimpleAttribute.call(this, varAtt, source);
	
	
	
	this.isVarAtt = true;
	
	
	
	this.savedValue = null;
	
	
	// methods: see code after the constructor definition
	
	this.getValue = WAF.DataSourceVarAttribute.getValue;
	this.setValue = WAF.DataSourceVarAttribute.setValue;
	this.getOldValue = WAF.DataSourceVarAttribute.getOldValue;
};



WAF.DataSourceVarAttribute.getValue = function(){
	var jsobj = this.owner.getCurrentElement();
	if (jsobj == null) {
		return null;
	}
	else {
		return jsobj[this.name];
	}
};



WAF.DataSourceVarAttribute.setValue = function(value, options){
	options = options;
	
	var jsobj = this.owner.getCurrentElement();
	if (jsobj == null) {
		// nothing to do
	}
	else {
		if (this.owner[this.name] !== value) {
			this.savedValue = value;
			this.owner[this.name] = value;
			jsobj[this.name] = value;
			this.dispatch(options);
		}
	}
};



WAF.DataSourceVarAttribute.getOldValue = function(){
	var jsobj = this.owner.getCurrentElement();
	if (jsobj == null) {
		return null;
	}
	else {
		return this.savedValue;
	}
};




// ------------------------------------------------------------------------------------------------------------


WAF.DataSourceEmRelatedAttributeValue = function(emAtt, source){


	this.owner = source;
	
	
	
	this.emAtt = emAtt;
	
	
	
	this.name = emAtt.name;
	
	
	
	// methods: see code after the constructor definition
	
	this.set = WAF.DataSourceEmRelatedAttributeValue.set;
	this.load = WAF.DataSourceEmRelatedAttributeValue.load;
};



WAF.DataSourceEmRelatedAttributeValue.set = function(subsource, options){
	var currentEntity = this.owner._private.currentEntity;
	if (currentEntity != null) {
		var subentity = null;
		if (subsource != null) {
			if (subsource instanceof WAF.Entity) 
				subentity = subsource;
			else 
				subentity = subsource.getCurrentElement();
		}
		currentEntity[this.name].setValue(subentity);
		var sourceAtt = this.owner.getAttribute(this.name);
		if (sourceAtt != null) {
			sourceAtt.dispatch(options);
		}
	}
};



WAF.DataSourceEmRelatedAttributeValue.load = function(options, userData){
	var currentEntity = this.owner._private.currentEntity;
	if (currentEntity != null) {
		currentEntity[this.name].getValue(options, userData);
	}
};



// ------------------------------------------------------------------------------------------------------------




WAF.DataSourceListener = function(eventKind, eventHandler, config, userData){

	if (WAF.DataSourceListener.prototype.currentID == null) 
		WAF.DataSourceListener.prototype.currentID = 1;
	else 
		++WAF.DataSourceListener.prototype.currentID;
	
	this.ID = WAF.DataSourceListener.prototype.currentID;
	
	this.eventKind = eventKind;
	
	this.eventHandler = eventHandler;
	
	
	if (config == null) {
		config = {};
	}
	
	
	
	this.id = config.listenerID;
	
	
	
	this.listenerType = config.listenerType;
	
	
	
	this.userData = userData;
	
	
	if (config.attributeName != null) {
	
	
		this.attributeName = config.attributeName;
		
		
		
		this.attribute = config.attribute;
	}
	
	if (config.subID != null) {
		this.subID = config.subID;
	}
};



// ------------------------------------------------------------------------------------------------------------




WAF.DataSource = function(config){


	this._private = {
		// private members
		id: config.id,
		atts: {},
		currentElemPos: 0,
		isNewElem: false,
		listeners: [],
		sourceType: "",
		owner: this,
		selCanBeModified: true,
		oneElementOnly: false,
		selIsRelatedonFirstLevel: false,
		sel: new WAF.Selection('single'),
		
		// private functions
		_validateAttribute: WAF.DataSource._validateAttribute
	
	};
	
	
	
	this.length = 0;
	
	
	
	// --------------------------------------------------------------------------
	// API functions of a DataSource
	
	this.getCurrentElement = WAF.DataSource.getCurrentElement;
	
	this.getElement = WAF.DataSource.getElement;
	
	this.getPosition = WAF.DataSource.getPosition;
	
	this.isNewElement = WAF.DataSource.isNewElement;
	
	this.getAttribute = WAF.DataSource.getAttribute;
	
	//this.changedCurrentEntityAttribute = WAF.DataSource.changedCurrentEntityAttribute;
	
	this.select = WAF.DataSource.select;
	
	this.selectPrevious = WAF.DataSource.selectPrevious;
	
	this.selectNext = WAF.DataSource.selectNext;
	
	this.serverRefresh = WAF.DataSource.serverRefresh;
	
	this.collectionRefresh = WAF.DataSource.collectionRefresh;
	
	this.addListener = WAF.DataSource.addListener;
	
	this.removeListener = WAF.DataSource.removeListener;
	
	this.removeAllListeners = WAF.DataSource.removeAllListeners;
	
	this.dispatch = WAF.DataSource.dispatch;
	
	this.autoDispatch = WAF.DataSource.autoDispatch;
	
	this.getID = WAF.DataSource.getID;
	
	this.declareDependencies = WAF.DataSource.declareDependencies;
	
	this.setDisplayLimits = WAF.DataSource.setDisplayLimits;
	
	this.getSelection = WAF.DataSource.getSelection;
	
	this.getScope = WAF.DataSource.getScope;
	
	this.getWebComponentID = WAF.DataSource.getWebComponentID;
	
	// API functions overridden in DataSource subclasses 

	/*
	 this.getCurrentElement;
	 this.getDataClass;
	 this.getClassAttributeByName;
	 this.autoDispatch;
	 this.addNewElement;
	 this.save;
	 this.removeCurrent;
	 this.resolveSource;
	 this.mustResolveOnFirstLevel;
	 this.getClassTitle;
	 this.getAttributeNames;
	 
	 this.getElement(pos, options);
	 
	 this.sync(options);
	 */
};

WAF.DataSource.GLOBAL = 'global';

WAF.DataSource.LOCAL = 'local';

// private functions used for an instance of a DataSource



WAF.DataSource.makeFuncCaller = function(methodRef, source){
	var methodref = methodRef;
	var xsource = source;
	
	var func = function()
	{
		var options;
		var alreadyParsedOptions = false;
		var myargs = [];
        for (var i = 0 ,nb = arguments.length; i < nb; i++)
        {
			var p = arguments[i];
			if (!alreadyParsedOptions && WAF.tools.isOptionParam(p)) {
				options = p;
				alreadyParsedOptions = true;
			}
			else 
				myargs.push(p);
        }
		var xoptions = options || {};
		if (xoptions.onSuccess === undefined && xoptions.onError === undefined && xoptions.generateRESTRequestOnly === undefined)
		{
			xoptions.sync = true;
		}
		if (xoptions.arguments == null)
			xoptions.arguments = myargs;
		if (xoptions.autoExpand == null)
			xoptions.autoExpand = xsource._private._getAutoExpand();
		xoptions.method = methodref.name;
		return xsource.callMethod(xoptions);
	}
	
	/*
	var func = function(options){
		var start = 1;
		var xoptions = options || {};
		if (xoptions.onSuccess === undefined && xoptions.onError === undefined && xoptions.generateRESTRequestOnly === undefined) {
			xoptions = {
				sync: true
			};
			start = 0;
		}
		if (xoptions.arguments == null) {
			var myargs = [];
			for (var i = start, nb = arguments.length; i < nb; i++) // The first one is skipped when async
			{
				myargs.push(arguments[i]);
			}
			xoptions.arguments = myargs;
		}
		xoptions.method = methodref.name;
		
		return xsource.callMethod(xoptions);
	}
	*/
	
	return func;
}



WAF.DataSource.addFuncHandler = function(methodref, source){
	methodref.funcCaller = function funcCaller(){
		var oktogo = true;
		var request = new WAF.core.restConnect.restRequest(false);
		//request.app = "";
		request.httpMethod = WAF.core.restConnect.httpMethods._post;
		
		var myargs = [];
		for (var i = 0, nb = arguments.length; i < nb; i++) {
			myargs.push(arguments[i]);
		}
		
		var jsonargs = JSON.stringify(myargs);
		request.postdata = jsonargs;
		
		if (methodref.applyTo == "dataClass") {
			request.attributesRequested = [];
			request.attributesRequested.push(methodref.name);
			request.resource = source._private.dataClassName;
		}
		else if (methodref.applyTo == "entityCollection") {
			oktogo = false;
			var sel = source._private.entityCollection;
			if (sel != null) {
				if (sel._private.dataURI != null) {
					oktogo = true;
					request.dataURI = sel._private.dataURI + "/" + methodref.name;
				}
				else {
					request.attributesRequested = [];
					request.attributesRequested.push(methodref.name);
					request.resource = source._private.dataClassName;
					request.filter = sel.queryString;
					oktogo = true;
				}
			}
		}
		else if (methodref.applyTo == "entity") {
			oktogo = false;
			var entity = source._private.currentEntity;
			if (entity != null) {
				request.attributesRequested = [];
				request.attributesRequested.push(methodref.name);
				oktogo = true;
				request.resource = source._private.dataClassName + '(';
				var key = entity.getKey();
				if (key != null) 
					request.resource += key;
				request.resource += ')';
			}
		}
		
		var result = null;
		if (oktogo) {
			request.go();
			
			if (request.http_request.readyState == 4) {
				var fullresult = JSON.parse(request.http_request.responseText);
				if (fullresult != null) {
					if (fullresult.__ERROR != null) {
						throw (fullresult.__ERROR);
					}
					else {
						result = fullresult.result;
					}
				}
				else {
					throw {
						error: 400
					};
				}
			}
			else {
				// throw an exception when readyState not yet 4 ??
				throw {
					error: 401
				};
			}
		}
		else {
			throw {
				error: 402
			};
		}
		return result;
	};
};



WAF.DataSource._validateAttribute = function(attName, curValue){
	var result = {
		valid: true,
		messages: []
	};
	
	var message = "";
	// var em = this.dataClass;
	//var att = em.getAttributeByName(attName);
	var sourceAtt = this.owner.getAttribute(attName);
	var att = null;
	if (sourceAtt != null) {
		att = sourceAtt.dataClassAtt;
	}
	if (att != null) {
		if (att.maxValue != null) {
			if (curValue > att.maxValue) {
				result.valid = false;
				message = attName + " must not exceed " + att.maxValue;
				result.messages.push(message);
			}
		}
		
		if (att.minValue != null) {
			if (curValue < att.minValue) {
				result.valid = false;
				message = attName + " must not be less than " + att.minValue;
				result.messages.push(message);
			}
		}
		
		if (att.pattern != null) {
			try {
				if (curValue.match(att.pattern) == null) {
					result.valid = false;
					message = attName + " is not well formed";
					result.messages.push(message);
				}
			} 
			catch (e) {
			}
		}
		
		if (att.minLength != null) {
			try {
				if (curValue.length < att.minLength) {
					result.valid = false;
					message = attName + " must be at least " + att.minLength + " characters long";
					result.messages.push(message);
				}
			} 
			catch (e) {
			}
		}
		
		if (att.maxLength != null) {
			try {
				if (curValue.length > att.maxLength) {
					result.valid = false;
					message = attName + " must be less than " + att.maxLength + " characters long";
					result.messages.push(message);
				}
			} 
			catch (e) {
			}
		}
		
	}
	
	return result;
};


WAF.DataSource.getScope = function(){
	return this._private.scope || WAF.DataSource.GLOBAL;
};


WAF.DataSource.getWebComponentID = function(){
	return this._private.componentID || '';
};


// ----------------------------------------------------------------------------------------------------------------------	

// API functions used for an instance of a DataSource




WAF.DataSource.getCurrentElement = function(){
	throw new Error('getCurrentElement not implemented');
};



WAF.DataSource.getElement = function(pos, options, userData){
	throw new Error('getElement not implemented');
};


WAF.DataSource.getPosition = function(){
	var result = -1;
	var curelem = this.getCurrentElement();
	if (curelem != null) {
		result = this._private.currentElemPos;
	}
	return result;
};



WAF.DataSource.isNewElement = function(){
	return this._private.isNewElem;
};



WAF.DataSource.getAttribute = function(attName){
	var result = this._private.atts[attName];
	return result;
};



WAF.DataSource.select = function(pos, options, userData){
	pos = Number(pos);
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	this._private._setCurrentElementByPos(pos, options, userData);
};



WAF.DataSource.selectPrevious = function(options, userData){
	if (this._private.currentElemPos > 0) {
		var resOp = WAF.tools.handleArgs(arguments, 0);
		userData = resOp.userData;
		options = resOp.options;
		this._private._setCurrentElementByPos(this._private.currentElemPos - 1, options, userData);
	}
};



WAF.DataSource.selectNext = function(options, userData){
	if (!this._private.oneElementOnly && (this._private.currentElemPos < (this.length - 1))) {
		var resOp = WAF.tools.handleArgs(arguments, 0);
		userData = resOp.userData;
		options = resOp.options;
		this._private._setCurrentElementByPos(this._private.currentElemPos + 1, options, userData);
	}
};


WAF.DataSource.collectionRefresh = function(options, userData)
{
	// does nothing on purpose;
}

WAF.DataSource.serverRefresh = function(options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 0);
	userData = resOp.userData;
	options = resOp.options;
	var dataSource = this;
	if (options.forceReload) {
		var dataClass = this.getDataClass();
		var curEntity = this.getCurrentElement();
		if (curEntity != null) {
			var key = curEntity.getKey();
			if (key == null) {
				dataSource.newEntity(options);
				var ev = {
					entity: dataSource.getCurrentElement()
				};
				WAF.callHandler(false, null, ev, options, userData);
			}
			else {
				dataClass.getEntity(key, {
					forceReload: true,
					autoExpand: dataSource._private._getAutoExpand(),
					onSuccess: function(event){
						options.doNotAlterElemPos = true;
						dataSource.setCurrentEntity(event.entity, options);
						WAF.callHandler(false, null, event, options, userData);
					}
					
				});
			}
		}
	}
	else {
		options.refreshOnly = true;
		this.save(options, userData);
	}
};



WAF.DataSource.addListener = function(eventKind, eventHandler, config, userData){
	config = config;
	userData = userData;
	var listener = new WAF.DataSourceListener(eventKind, eventHandler, config, userData);
	this._private.listeners.push(listener);
	return listener.ID;
};


/**
 * @class WAF.DataSource
 * @method removeListener
 * @param {Object} params
 */
WAF.DataSource.removeListener = function(params) {
    var id = -1,
    widgetId = -1,
    listeners = this._private.listeners,
    found =-1,
    i = 0,
    length = listeners.length;

    params = params || {};

    if (typeof params.id !== 'undefined') {
        id = params.id;
    }

    if (typeof params.widgetId !== 'undefined') {
        widgetId = params.widgetId;
    }

    // search for ID
    if (id != -1) {
        for (i = 0; i < length; i++) {
            if (listeners[i].ID == id) {
                found = i;
                break;
            }
        }
    }

    // search for id
    if (widgetId != -1 && found == -1) {
        for (i = 0; i < length; i++) {
            if (listeners[i].id == widgetId || 
            (listeners[i].userData && listeners[i].userData.widget && listeners[i].userData.widget.id == widgetId) ||
            (listeners[i].userData && listeners[i].userData.datagrid && listeners[i].userData.datagrid.id == widgetId)) {
                found = i;
                break;
            }
        }
    }

    if (found !== -1) {
        listeners.splice(found, 1);
    }
};


WAF.DataSource.removeAllListeners = function(params){
	this._private.listeners = [];
};



WAF.DataSource.autoDispatch = function(options){
	throw new Error('autoDispatch not implemented');
}


WAF.DataSource.dispatch = function(eventKind, options){
	options = options || {};
	var dispatchSubID = options.subID;
	var dispatcherInitiator = options.dispatcherID;
                var dispatcherTarget = options.dispatcherTargetID || null;
	var attName = options.attributeName;
	var checkAttName = false;
	var match;
	
	if (eventKind == "onAttributeChange") {
		checkAttName = true;
	}
	if (!options.stopDispatch) {
		for (var i = 0; i < this._private.listeners.length; i++) {
			var listener = this._private.listeners[i];
			//if (dispatcherInitiator == null || dispatcherInitiator != listener.id) {
                                                if (((dispatcherInitiator == null || dispatcherInitiator != listener.id) && !dispatcherTarget) || (dispatcherTarget == listener.id)) {
				var okDispatch = false;
				switch (listener.eventKind) {
					case 'all':
						okDispatch = true;
						break;
						
					case 'onBeforeCurrentElementChange':
						if (eventKind == 'onBeforeCurrentElementChange') {
							okDispatch = true;
						}
						break;
						
					case 'onElementSaved':
						if (eventKind == 'onElementSaved') {
							okDispatch = true;
						}
						break;
						
					case 'onCollectionChange':
						if (eventKind == 'onCollectionChange') {
							okDispatch = true;
						}
						break;
						
					case 'onCurrentElementChange':
						if (eventKind == 'onCollectionChange' || eventKind == 'onCurrentElementChange') {
							okDispatch = true;
						}
						break;
						
					case 'onAttributeChange':
						if (eventKind == 'onCollectionChange' || eventKind == 'onCurrentElementChange') {
							okDispatch = true;
						}
						else {
							if (eventKind == "onAttributeChange" && attName == listener.attributeName) {
								okDispatch = true;
							}
						}
						break;
				}
				
				
				if (okDispatch) {
					if (dispatchSubID != null || listener.subID != null) {
						// enable dispatch to many widgets
						if (dispatchSubID) {
							match = dispatchSubID.match(listener.subID);
							
							if (match && match.length >= 1 && match[0]) {
								okDispatch = true;
							}
							else {
								okDispatch = false;
							}
						}
						else {
							okDispatch = (listener.subID === dispatchSubID);
						}
					}
				}
				if (okDispatch) {
					var dispatchEvent = {
						dataSource: this,
						eventKind: eventKind,
						listenerID: listener.id,
						listenerType: listener.listenerType,
						dispatcherID: dispatcherInitiator,
						dispatcherType: options.dispatcherType,
						data: listener.userData,
						userData: listener.userData,
						eventData: options.userData || null,
						dispatcherOptions: options,
						subID: listener.subID || null
					};
					if (options.transformedSelection != null) 
						dispatchEvent.transformedSelection = options.transformedSelection;
					if (checkAttName) {
						dispatchEvent.attributeName = attName;
						dispatchEvent.attribute = this.getAttribute(attName);
					}
					if (eventKind == 'onElementSaved') {
						dispatchEvent.entity = options.entity;
						dispatchEvent.position = options.position;
						dispatchEvent.element = options.element;
					}
					listener.eventHandler(dispatchEvent);
				}
			}
		}
	}
};




WAF.DataSource.getID = function(){
	return this._private.id;
};


WAF.DataSource.declareDependencies = function(dependencies, options){
	// nothing to do in base class
}


WAF.DataSource.setDisplayLimits = function(ID, top, bottom){
	// nothing to do in base class
}


WAF.DataSource.getSelection = function(){
	return this._private.sel;
}

// end of API functions used for an instance of a DataSource




// ----------------------------------------------------------------------------------------------------------------------	

WAF.delayRequest = function(requestID, top, bottom){
	this.requestID = requestID;
	this.top = top;
	this.bottom = bottom;
	this.pendingFetch = [];
	return this;
}


WAF.delayRequest.prototype.matchRange = function(top, bottom){
	return ((top >= this.top && top <= this.bottom) || (bottom >= this.top && bottom <= this.bottom));
}

WAF.delayRequest.prototype.match = function(pos){
	return (pos >= this.top && pos <= this.bottom);
}

WAF.delayRequest.prototype.addFetchRequest = function(pos, options, userData){
	this.pendingFetch.push({
		pos: pos,
		options: options,
		userData: userData
	});
}

WAF.delayRequest.prototype.setRequestID = function(requestID){
	this.requestID = requestID;
}



// -------------------------------------------------------------

WAF.DelayInfoForDataSource = function(ID, top, bottom, config){
	this.ID = ID;
	this.top = top;
	this.bottom = bottom;
	this.pendingRequests = [];
	return this;
}

WAF.DelayInfoForDataSource.prototype.setLimits = function(top, bottom){
	this.top = top;
	this.bottom = bottom;
}


WAF.DelayInfoForDataSource.prototype.addPendingRequest = function(requestID, top, bottom){
	var req = new WAF.delayRequest(requestID, top, bottom);
	this.pendingRequests.push(req);
	return req;
}


WAF.DelayInfoForDataSource.prototype.removePendingRequest = function(delayReq){
	var requestID = delayReq.requestID;
	var reqs = this.pendingRequests;
	var found = -1;
	for (var i = 0, nb = reqs.length; i < nb; i++) {
		if (reqs[i].requestID == requestID) {
			found = i;
			break;
		}
	}
	if (found != -1) 
		reqs.splice(found, 1);
}


WAF.DelayInfoForDataSource.prototype.findMatchingPendingRequest = function(pos){
	var result = null;
	this.pendingRequests.forEach(function(req){
		if (req.match(pos)) {
			result = req;
		}
	});
	return result;
}


// -------------------------------------------------------------


WAF.DataSourceEm = function(config){
	WAF.DataSource.call(this, config);
	var priv = this._private;
	
	priv.dataClass = null;
	priv.otherSource = null;
	priv.otherAttribute = null;
	priv.dataClassName = "";
	priv.currentEntity = null;
	priv.entityCollection = null;
	priv.autoExpand = {};
	priv.methods = {};
	priv.delayInfos = {};
	
	// private functions
	
	priv._updateValues = WAF.DataSourceEm._updateValues;
	priv._gotEntity = WAF.DataSourceEm._gotEntity;
	priv._gotEntityCollection = WAF.DataSourceEm._gotEntityCollection;
	priv._setCurrentElementByPos = WAF.DataSourceEm._setCurrentElementByPos;
	priv._Init = WAF.DataSourceEm._Init;
	
	priv._addAttributeDependency = WAF.DataSourceEm._addAttributeDependency;
	priv._getAutoExpand = WAF.DataSourceEm._getAutoExpand;
	priv._mixOptions = WAF.DataSourceEm._mixOptions;
	
	
	
	
	// --------------------------------------------------------------------------
	// API functions of a DataSource
	
	this.getCurrentElement = WAF.DataSourceEm.getCurrentElement;
	
	this.getDataClass = WAF.DataSourceEm.getDataClass;
	
	this.getClassAttributeByName = WAF.DataSourceEm.getClassAttributeByName;
	
	this.getAttribute = WAF.DataSourceEm.getAttribute; // overwritten
	this.autoDispatch = WAF.DataSourceEm.autoDispatch;
	
	this.setEntityCollection = WAF.DataSourceEm.setEntityCollection;
	
	this.collectionRefresh = WAF.DataSourceEm.collectionRefresh;
	
	this.addNewElement = WAF.DataSourceEm.addNewElement;
	
	this.addEntity = WAF.DataSourceEm.addEntity;
	
	this.save = WAF.DataSourceEm.save;
	
	this.removeCurrent = WAF.DataSourceEm.removeCurrent;
	this.removeCurrentReference = WAF.DataSourceEm.removeCurrentReference;
	
	this.distinctValues = WAF.DataSourceEm.distinctValues;
	
	this.selectByKey = WAF.DataSourceEm.selectByKey;
	
	this.toArray = WAF.DataSourceEm.toArray;
	
	this.getEntityCollection = WAF.DataSourceEm.getEntityCollection;
	
	this.setCurrentEntity = WAF.DataSourceEm.setCurrentEntity;
	
	this.newEntity = WAF.DataSourceEm.newEntity;
	
	this.all = WAF.DataSourceEm.allEntities;
	this.allEntities = WAF.DataSourceEm.allEntities;
	
	this.noEntities = WAF.DataSourceEm.noEntities;
	
	this.query = WAF.DataSourceEm.query;
	this.filterQuery = WAF.DataSourceEm.filterQuery;
	
	this.orderBy = WAF.DataSourceEm.orderBy;
	
	this.resolveSource = WAF.DataSourceEm.resolveSource;
	
	this.mustResolveOnFirstLevel = WAF.DataSourceEm.mustResolveOnFirstLevel;
	this.getClassTitle = WAF.DataSourceEm.getClassTitle;
	this.getAttributeNames = WAF.DataSourceEm.getAttributeNames;
	
	this.getElement = WAF.DataSourceEm.getElement;
	
	this.sync = WAF.DataSourceEm.sync;
	
	this.getAttributeValue = WAF.DataSourceEm.getAttributeValue;
	
	this.getOldAttributeValue = WAF.DataSourceEm.getOldAttributeValue;
	
	this.declareDependencies = WAF.DataSourceEm.declareDependencies;
	
	this.callMethod = WAF.DataSourceEm.callMethod;
	
	this.buildFromSelection = WAF.DataSourceEm.buildFromSelection;
	
	this.setDisplayLimits = WAF.DataSourceEm.setDisplayLimits;
	
	this._private._Init(config);
	
};



/* ************************ */
// private functions




WAF.DataSourceEm._Init = function(config){
	var owner = this.owner;
	var okInited = false;
	// resolution de la source
	this.dataClassName = config.binding;
	this.initialQuery = true;
	this.initialQueryStr = '';
	this.initialOrderBy = '';
	if (config["data-autoLoad"] != null) {
		if (config["data-autoLoad"] === "false" || config["data-autoLoad"] === "0" || config["data-autoLoad"] === false) {
			this.initialQuery = false;
		}
	}
	
	if (config['data-scope']) {
		this.scope = config['data-scope'];
	}
	
	if (config["data-initialQueryString"] != null) {
		this.initialQueryStr = config["data-initialQueryString"]; // Should check config["data-initial-queryString"] is valid
	}
	
	if (config["data-initialOrderBy"] != null) {
		this.initialOrderBy = config["data-initialOrderBy"]; // Should check config["data-initial-queryString"] is valid
	}
	
	var decompName = this.dataClassName.split('.');
	if (decompName.length == 1) {
		this.sourceType = "dataClass";
		this.dataClass = WAF.ds.getDataClass(this.dataClassName);
	}
	else {
		var sourceName = decompName[0];
		var attName = decompName[1];
		var otherSource = WAF.source[sourceName];
		if (otherSource == null) {
			this.sourceType = "invalid";
		}
		else {
			var em = otherSource._private.dataClass;
			if (em != null) {
				var att = em.getAttributeByName(attName);
				if (att != null) {
				
					this.dataClass = WAF.ds.getDataClass(att.type);
					
					this.dataClassName = att.type;
					
					this.otherSource = otherSource;
					
					this.otherAttribute = att;
					
					if (att.kind == "relatedEntity") {
						this.sourceType = "relatedEntity";
					}
					else {
						if (att.kind == "relatedEntities") {
							this.sourceType = "relatedEntities";
							if (att.reversePath) {
								var foreignKey = att.path;
								if (foreignKey != null) 
									foreignKey = this.dataClass.getAttributeByName(foreignKey);
								if (foreignKey != null) {
									this.selIsRelatedonFirstLevel = true;
									this.foreignKeyAttribute = foreignKey;
								}
							}
						}
						else {
							this.sourceType = "invalid";
						}
					}
					if (this.sourceType != "invalid") {
						otherSource.getAttribute(att.name).addListener(WAF.DataSourceEm._resolveEventHandler, { // options
							listnerID: config.id,
							listnerType: 'datasource'
						}, { // userData
							source: owner
						});
						
					}
				}
				else {
					this.sourceType = "invalid";
				}
			}
			else {
				this.sourceType = "invalid";
			}
		}
	}
	
	okInited = this.sourceType != "invalid";
	if (!okInited) {
		this.needForInit = config;
	}
	
	var em = this.dataClass;
	if (em != null) {
		var methlist = em.getMethodList();
		if (methlist != null) {
			for (var i = 0, nb = methlist.length; i < nb; i++) {
				var methodRef = methlist[i];
				WAF.DataSource.addFuncHandler(methodRef, owner);
				
				owner[methodRef.name] = WAF.DataSource.makeFuncCaller(methodRef, owner);
				this.methods[methodRef.name] = methodRef;
			}
		}
		var attlist = em.getAttributes();
		if (attlist != null) {
			for (var i = 0, nb = attlist.length; i < nb; i++) {
				var att = attlist[i];
				if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias") {
					var curValue = null;
					if (this.currentEntity != null) {
						curValue = this.currentEntity[att.name].getValue();
					}
					var sourceAtt = new WAF.DataSourceEmSimpleAttribute(att, owner);
					owner[att.name] = curValue;
					
					this.atts[att.name] = sourceAtt;
					if (att.maxValue != null) {
						att.maxValue = sourceAtt.normalize(att.maxValue);
					}
					if (att.minValue != null) {
						att.minValue = sourceAtt.normalize(att.minValue);
					}
					if (att.minLength != null && typeof(att.minLength) == "string") {
						att.minLength = parseInt(att.minLength, 10);
					}
					if (att.maxLength != null && typeof(att.maxLength) == "string") {
						att.maxLength = parseInt(att.maxLength, 10);
					}
					if (att.fixedLength != null && typeof(att.fixedLength) == "string") {
						att.fixedLength = parseInt(att.fixedLength, 10);
					}
				}
				else {
					var sourceAtt = new WAF.DataSourceEmRelatedAttribute(att, owner);
					this.atts[att.name] = sourceAtt;
					if (att.kind == "relatedEntity") {
						owner[att.name] = new WAF.DataSourceEmRelatedAttributeValue(att, owner);
					}
				}
			}
		}
	}
	
	if (okInited) {
		delete this.needForInit;
		this.selCanBeModified = this.sourceType == "dataClass";
		this.oneElementOnly = this.sourceType == "relatedEntity";
		
		
		if (!this.selCanBeModified) {
			delete owner.setEntityCollection;
			delete owner.noEntities;
			delete owner.query;
		}
		
		if (this.oneElementOnly) {
			delete owner.setEntityCollection;
			delete owner.noEntities;
			delete owner.addNewElement;
			delete owner.addEntity;
			//delete owner.setCurrentEntity;
			delete owner.newEntity;
			delete owner.query;
			delete owner.removeCurrent;
			delete owner.distinctValues;
			delete owner.getEntityCollection;
			delete owner.selectNext;
			delete owner.select;
			delete owner.selectPrevious;
		}
	}
	
	return okInited;
};


WAF.DataSourceEm._resolveEventHandler = function(event){
	event.data.source.resolveSource({
		dispatcherID: event.dispatcherID
	});
};



WAF.DataSourceEm._updateValues = function(){
	for (var i in this.atts) {
		var sourceAtt = this.atts[i];
		if ((sourceAtt.simple || sourceAtt.type === "image") && sourceAtt.isFirstLevel) {
			if (this.currentEntity == null) {
				this.owner[sourceAtt.name] = null;
			}
			else {
				this.owner[sourceAtt.name] = this.currentEntity[sourceAtt.name].getValue();
			}
		}
	}
};



WAF.DataSourceEm._gotEntity = function(event){
	var datas = event.userData;
	var options = datas.options || {};
	var source = datas.dataSource;
	if (source._private.currentEntity != null) {
		source.dispatch('onBeforeCurrentElementChange', options);
	}
	source._private.currentElemPos = datas.entityPos;
	source._private.isNewElem = false;
	source._private.currentEntity = event.entity;
	source._private._updateValues();
	if (datas.mustPublish) {
		source.dispatch('onCurrentElementChange', options);
	}
	var onSuccess = options.onSuccess;
	var onError = options.onError;
	var dsEvent = {
		dataSource: source,
		data: datas.userData,
		userData: datas.userData,
		XHR: event.XHR || null
	};
	if (event.error != null && event.error.length > 0) {
		if (onError != null) {
			dsEvent.error = event.error;
			onError(dsEvent);
		}
	}
	else {
		if (onSuccess != null) {
			onSuccess(dsEvent);
		}
	}
};



WAF.DataSourceEm._gotEntityCollection = function(event){
	var datas = event.userData;
	var options = datas.options || {};
	
	var source = datas.dataSource;
	
	if (event.error != null && options.keepOldCollectionOnError) {
		var onError = options.onError;
		if (onError != null) {
			var dsEvent = {
				dataSource: source,
				data: datas.userData,
				userData: datas.userData,
				XHR: event.XHR || null,
				error: event.error
			};
			onError(dsEvent);
		}
	}
	else {
		if (source._private.currentEntity != null) 
			source.dispatch('onBeforeCurrentElementChange', options);
		source._private.currentEntity = null;
		source._private.entityCollection = event.entityCollection;
		
		var newcurpos = 0;
		var transsel = null;
		if (event.transformedSelection != null) {
			transsel = new WAF.Selection(event.transformedSelection);
			source._private.sel = transsel;
			newcurpos = transsel.getFirst();
			options.transformedSelection = transsel;
		}
		else {
			source._private.sel.reset();
		}
		source.length = source._private.entityCollection.length;
		if (datas.curPos != null && datas.curPos >= 0) {
			if (datas.curPos >= source.length) 
				source._private.currentElemPos = source.length - 1;
			else 
				source._private.currentElemPos = datas.curPos;
		}
		else 
			source._private.currentElemPos = newcurpos;
		source._private.isNewElem = false;
		if (options.progressBar != null) {
			options.progressBar.stopListening();
		}
		if (source._private.entityCollection.length == 0) {
			source._private.currentEntity = null;
			source._private._updateValues();
			if (datas.mustPublish) {
				source.dispatch('onCollectionChange', options);
			}
			
			var onSuccess = options.onSuccess;
			var onError = options.onError;
			var dsEvent = {
				dataSource: source,
				data: datas.userData,
				XHR: event.XHR || null,
				userData: datas.userData
			};
			if (event.error != null && event.error.length > 0) {
				dsEvent.error = event.error;
				if (onError != null) 
					onError(dsEvent);
			}
			else {
				if (onSuccess != null) 
					onSuccess(dsEvent);
			}
		}
		else {
			if (datas.mustPublish) {
				source.dispatch('onCollectionChange', options);
			}
			datas.entityPos = source._private.currentElemPos;
			source._private.entityCollection.getEntity(source._private.currentElemPos, {
				onSuccess: source._private._gotEntity,
				onError: source._private._gotEntity
			}, datas);
		}
	}
};



WAF.DataSourceEm.collectionRefresh = function(options, userData)
{
	var resOp = WAF.tools.handleArgs(arguments, 0);
	userData = resOp.userData;
	options = resOp.options;
	var dataSource = this;
	options = options || {};
	options.forceCollectionRefresh = true;
	var priv = this._private;
	if (priv.entityCollection!= null)
	{
		var onSuccess = options.onSuccess;
		var onError = options.onError;
		var pos = this.getPosition();
		
		function refreshSuccess(event)
		{
			options.onSuccess = onSuccess;
			options.onError = onError;
			event.dataSource = dataSource;
			if (pos >= 0)
			{
				priv.isNewElem = false;
				priv.currentEntity = event.entity;
				priv._updateValues();
			}
			dataSource.dispatch('onCollectionChange', options);
			WAF.callHandler(false, null, event, options, userData);
		}

		function refreshError(event)
		{
			options.onSuccess = onSuccess;
			options.onError = onError;
			WAF.callHandler(true, event.error, event, options, userData);
		}
		
		options.onSuccess = refreshSuccess;
		options.onError = refreshError;
		
		priv.entityCollection.getEntity(pos < 0 ? 0 : pos, options, userData);
	}
}


WAF.DataSourceEm._setCurrentElementByPos = function(pos, options, userData){
	options = options || {};
	userData = userData;
	var onSuccess = options.onSuccess;
	var onError = options.onError;
	var dsEvent = {
		dataSource: this.owner,
		data: userData,
		userData: userData
	};
	
	if ((this.owner.getPosition() == pos) || (this.oneElementOnly)) {
		if (onSuccess != null) {
			onSuccess(dsEvent);
		}
	}
	else {
		var ok = false;
		if (this.entityCollection != null) {
			if (pos >= 0 && pos < this.entityCollection.length) {
				ok = true;
				//this.currentElemPos = pos;
				var delayinfo = null;
				if (options.delayID != null) 
					delayinfo = this.delayInfos[options.delayID];
				this.entityCollection.getEntity(pos, {
					onSuccess: this._gotEntity,
					onError: this._gotEntity,
					delay: options.delay || null,
					delayInfo: delayinfo
				}, {
					dataSource: this.owner,
					mustPublish: true,
					options: options,
					userData: userData,
					entityPos: pos
				});
			}
		}
		if (!ok) {
			if (this.currentEntity != null) 
				this.owner.dispatch('onBeforeCurrentElementChange', options);
			this.currentEntity = null;
			this.currentElemPos = 0;
			this._updateValues();
			this.owner.dispatch('onCurrentElementChange', options);
		}
	}
};



WAF.DataSourceEm._addAttributeDependency = function(attributePath, options){
	var root = this.autoExpand;
	var em = this.dataClass;
	options = options || {};
	var path = attributePath.split(".");
	var nb = path.length;
	for (var i = 0; i < nb; i++) {
		var attName = path[i];
		var att = em.getAttributeByName(attName);
		if (att != null) {
			if (att.kind == 'relatedEntity' || ((att.kind == 'relatedEntities' || att.kind == 'composition') && options.allow1ToN)) {
				if (root[attName] == null) {
					root[attName] = {};
				}
				root = root[attName];
				var subEm = WAF.ds.getDataClass(att.type);
				if (subEm == null) {
					break;
				}
				else {
					em = subEm;
				}
			}
			else {
				break;
			}
		}
	}
}


WAF.DataSourceEm._getAutoExpand = function(){
	function getOneLevel(root, rootpath, deja){
		var res = deja
		for (e in root) {
			if (res != "") 
				res += ",";
			
			res += (rootpath + e);
			res = getOneLevel(root[e], rootpath + e + ".", res);
		}
		return res;
	}
	
	var s = getOneLevel(this.autoExpand, "", "");
	return s;
}


WAF.DataSourceEm._mixOptions = function(inOptions, outOptions){
	outOptions = outOptions || {};
	if (inOptions) {
		if (inOptions.orderBy != null) 
			outOptions.orderBy = inOptions.orderBy;
		if (inOptions.removeReferenceOnly != null) 
			outOptions.removeReferenceOnly = inOptions.removeReferenceOnly;
		if (inOptions.queryPlan != null) 
			outOptions.queryPlan = inOptions.queryPlan;
		if (inOptions.queryPath != null) 
			outOptions.queryPath = inOptions.queryPath;
		if (inOptions.autoExpand != null) 
			outOptions.autoExpand = inOptions.autoExpand;
		if (inOptions.params != null) 
			outOptions.params = inOptions.params;
		if (inOptions.pageSize != null) 
			outOptions.pageSize = inOptions.pageSize;
		if (inOptions.timeout != null) 
			outOptions.timeout = inOptions.timeout;
		if (inOptions.keepSelection != null) 
			outOptions.keepSelection = inOptions.keepSelection;
		if (inOptions.keepOldCollectionOnError != null) 
			outOptions.keepOldCollectionOnError = inOptions.keepOldCollectionOnError;
		if (inOptions.fromSelection != null) 
			outOptions.fromSelection = inOptions.fromSelection;
		if (inOptions.progressInfo != null) 
			outOptions.progressInfo = inOptions.progressInfo;
		else {
			if (inOptions.progressBar != null) {
				if (typeof(inOptions.progressBar) == 'string') 
					outOptions.progressBar = WAF.widgets[inOptions.progressBar];
				else 
					outOptions.progressBar = inOptions.progressBar;
				inOptions.progressBar = outOptions.progressBar;
			}
			if (outOptions.progressBar != null) {
				var newprogress = outOptions.progressBar.id + "_" + Math.random() + "_" + new Date().toString();
				outOptions.progressBar.setProgressInfo(newprogress);
				outOptions.progressInfo = newprogress;
				outOptions.progressBar.startListening();
			}
		}
	}
	return outOptions;
}


/* ************************ */
// public API





/* DESCRIBED ON DATASOURCE CLASS */
WAF.DataSourceEm.getCurrentElement = function(){
	return this._private.currentEntity;
};



WAF.DataSourceEm.getDataClass = function(){
	return this._private.dataClass;
};



WAF.DataSourceEm.getClassAttributeByName = function(attName){
	var attpath = attName.split(".");
	var result;
	if (attpath.length == 1) 
		result = this._private.dataClass.getAttributeByName(attName);
	else {
		result = null;
		var root = this._private.dataClass;
		for (var i = 0; i < attpath.length; i++) {
			var s = attpath[i];
			result = root.getAttributeByName(s);
			if (result == null) 
				break;
			else if (result.kind != "composition" && result.kind != "relatedEntities" && result.kind != "relatedEntity") {
				break;
			}
			else {
				root = WAF.ds.getDataClass(result.type);
				if (root == null) {
					result = null;
					break;
				}
			}
		}
	}
	return result;
};


WAF.DataSourceEm.getAttribute = function(attName){
	var result;
	var path = attName.split(".");
	if (path.length == 1) 
		result = this._private.atts[attName];
	else {
		result = this._private.atts[attName];
		if (result == null) {
			var root = this._private.dataClass;
			for (var i = 0, nb = path.length - 1; i < nb; i++) {
				var s = path[i];
                                var att = null;
                                if (root) {				
                                    att = root.getAttributeByName(s); 
                                }
				if (att != null && att.kind == 'relatedEntity') {
					root = WAF.ds.getDataClass(att.type);
				}
				else 
					root = null;
				
				if (root == null) 
					break;
			}
			
			if (root != null) {
				var s = path[nb];
				var att = root.getAttributeByName(s);
				if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias") {
					var sourceAtt = new WAF.DataSourceEmDeepSimpleAttribute(att, this, attName);
					this._private.atts[attName] = sourceAtt;
					result = sourceAtt;
				}
				else {
					var sourceAtt = new WAF.DataSourceEmDeepRelatedAttribute(att, this, attName);
					this._private.atts[attName] = sourceAtt;
					/*
					 if (att.kind == "relatedEntity")
					 {
					 this[attName] = new WAF.DataSourceEmRelatedAttributeValue(att, owner);
					 }
					 */
					result = sourceAtt;
				}
				
			}
			if (result != null) 
				this.declareDependencies(attName);
		}
	}
	return result;
};



/* DESCRIBED ON DATASOURCE CLASS */
WAF.DataSourceEm.autoDispatch = function(options){
	var entity = this.getCurrentElement();
	if (entity != null) {
		for (var i in this._private.atts) {
			var sourceAtt = this._private.atts[i];
			if (sourceAtt.simple && sourceAtt.isFirstLevel) {
				var curValue = this[sourceAtt.name];
				var oldvalue = entity[sourceAtt.name].value;
				if (oldvalue !== curValue) {
					entity[sourceAtt.name].setValue(curValue);
					sourceAtt.dispatch(options);
				}
			}
		}
	}
};



WAF.DataSourceEm.addNewElement = function(options){
	options = options;
	var priv = this._private;
	var otherEntity = null;
	if (priv.selIsRelatedonFirstLevel) {
		otherEntity = priv.otherSource._private.currentEntity;
	}
	if (priv.selCanBeModified || (priv.selIsRelatedonFirstLevel && otherEntity != null)) {
		if (priv.currentEntity != null) {
			this.dispatch('onBeforeCurrentElementChange', options);
		}
		priv._updateValues();
		priv.currentEntity = new WAF.Entity(priv.dataClass);
		
		if (priv.selIsRelatedonFirstLevel) {
			var fkeyname = priv.foreignKeyAttribute.name;
			this[fkeyname].set(priv.otherSource);
		}
		
		priv.entityCollection.add(priv.currentEntity);
		priv.isNewElem = true;
		this.length = priv.entityCollection.length;
		priv.currentElemPos = priv.entityCollection.length - 1;
		priv._updateValues();
		this.dispatch('onCollectionChange', options);
		//this.dispatch('onCurrentElementChange', options);
	}
};



WAF.DataSourceEm.setEntityCollection = function(newEntityCollection, options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	if (this._private.selCanBeModified) {
		if (this._private.currentEntity != null) {
			this.dispatch('onBeforeCurrentElementChange', options);
		}
		this._private.entityCollection = newEntityCollection;
		if (this._private.entityCollection === undefined) {
			var tagadabreak = 1;
		}
		
		if (newEntityCollection != null) {
			this.length = newEntityCollection.length;
		}
		else {
			this.length = 0;
		}
		this._private.currentEntity = null;
		this._private._updateValues();
		this._private.currentElemPos = 0;
		this.dispatch('onCollectionChange', options);
		if (this._private.entityCollection != null && this._private.entityCollection.length > 0) {
			this._private.entityCollection.getEntity(this._private.currentElemPos, {
				onSuccess: this._private._gotEntity,
				onError: this._private._gotEntity
			}, {
				dataSource: this,
				mustPublish: true,
				options: options,
				userData: userData,
				entityPos: 0
			});
		}
		else {
			this.dispatch('onCurrentElementChange', options);
		}
	}
};



WAF.DataSourceEm.addEntity = function(entity, options){
	var priv = this._private;
	options = options
	var otherEntity = null;
	if (priv.selIsRelatedonFirstLevel) {
		otherEntity = priv.otherSource._private.currentEntity;
	}
	if (priv.selCanBeModified || (priv.selIsRelatedonFirstLevel && otherEntity != null)) {
		if (priv.currentEntity != null) {
			this.dispatch('onBeforeCurrentElementChange', options);
		}
		priv._updateValues();
		priv.currentEntity = entity;
		
		if (priv.selIsRelatedonFirstLevel) {
			var fkeyname = priv.foreignKeyAttribute.name;
			this[fkeyname].set(priv.otherSource);
		}
		
		priv.entityCollection.add(priv.currentEntity);
		priv.isNewElem = true;
		this.length = priv.entityCollection.length;
		priv.currentElemPos = priv.entityCollection.length - 1;
		this.dispatch('onCollectionChange', options);
		//this.dispatch('onCurrentElementChange', options);
		priv._updateValues();
	}
};



WAF.DataSourceEm.save = function(options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 0);
	userData = resOp.userData;
	options = resOp.options;
	var onSuccess = options.onSuccess;
	var refreshOnly = options.refreshOnly;
	if (refreshOnly == null) {
		refreshOnly = false;
	}
	var entity = this.getCurrentElement();
	var curElemPos = this.getPosition();
	this.autoDispatch({
		stopDispatch: true
	});
	if (entity != null) {
		var dsEvent = {
			dataSource: this,
			data: userData,
			userData: userData
		};
		var onError = options.onError;
		if (refreshOnly || entity.isTouched()) {
			var source = this;
			var onSave = function(event){
				dsEvent.XHR = event.XHR;
				if (!refreshOnly && (event.error == null || event.error.length == 0)) {
					source._private.isNewElem = false;
				}
				event.userData.options.entity = entity;
				event.userData.options.position = curElemPos;
				event.userData.options.element = WAF.DataSourceEm.makeElement(source, entity);
				event.userData.obj.dispatch('onElementSaved', event.userData.options);
				if (source._private.currentEntity != null && entity.getKey() == source._private.currentEntity.getKey()) {
					source._private._updateValues();
					event.userData.obj.dispatch('onCurrentElementChange', event.userData.options);
				}
				if (event.error != null && event.error.length > 0) {
					dsEvent.error = event.error;
					if (onError != null) 
						onError(dsEvent);
				}
				else {
					if (onSuccess != null) 
						onSuccess(dsEvent);
				}
			};
			
			entity.save({
				onSuccess: onSave,
				onError: onSave,
				refreshOnly: refreshOnly,
				overrideStamp: options.overrideStamp || false,
				autoExpand: this._private._getAutoExpand()
			}, {
				obj: this,
				options: options,
				userData: userData,
				refreshOnly: refreshOnly
			});
		}
		else {
			if (onSuccess != null) 
				onSuccess(dsEvent);
		}
	}
	else {
		if (onSuccess != null) 
			onSuccess(dsEvent);
	}
	
};



WAF.DataSourceEm.removeCurrent = function(options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 0);
	userData = resOp.userData;
	options = resOp.options;
	if (options.keepOldCollectionOnError == null) 
		options.keepOldCollectionOnError = true;
	var entityCollection = this.getEntityCollection();
	var curPos = this._private.currentElemPos;
	if (curPos >= 0 && entityCollection != null && curPos < entityCollection.length) {
		var xoptions = {
			onSuccess: this._private._gotEntityCollection,
			onError: this._private._gotEntityCollection,
			persistOnServer: true,
			pageSize: 40,
			autoExpand: this._private._getAutoExpand()
		};
		var datas = {
			type: 'getEntityCollection',
			dataSource: this,
			mustPublish: true,
			options: options,
			userData: userData,
			curPos: curPos
		};
		xoptions = this._private._mixOptions(options, xoptions);
		entityCollection.removeEntity(curPos, xoptions, datas);
	}
};


WAF.DataSourceEm.removeCurrentReference = function(options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 0);
	userData = resOp.userData;
	options = resOp.options;
	options.removeReferenceOnly = true;
	this.removeCurrent(options, userData);
};


WAF.DataSourceEm.distinctValues = function(attributeName, options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	
	this.getEntityCollection().distinctValues(attributeName, options, userData);
};


WAF.DataSourceEm.selectByKey = function(key, options, userData){
	var dataSource = this;
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	
	function selectByKeyHandler(event){
		event.dataSource = dataSource;
		if (event.error == null) {
			dataSource.select(event.result, options, userData);
		}
		else 
			WAF.callHandler(true, event.error, event, options, userData);
	}
	
	this.getEntityCollection().findKey(key, selectByKeyHandler);
}

WAF.DataSourceEm.toArray = function(attributeList, options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	
	var eSet = this.getEntityCollection();
	if (eSet != null) 
		eSet.toArray(attributeList, options, userData);
};


WAF.DataSourceEm.getEntityCollection = function(){
	var result = null;
	if (this._private.entityCollection != null) {
		result = this._private.entityCollection;
	}
	return result;
};



WAF.DataSourceEm.setCurrentEntity = function(entity, options){
	options = options || {};
	if (this._private.currentEntity != null) {
		this.dispatch('onBeforeCurrentElementChange', options);
	}
	if (!options.doNotAlterElemPos) 
		this._private.currentElemPos = -1;
	
	this._private.currentEntity = entity;
	this._private.isNewElem = false;
	this._private._updateValues();
	this.dispatch('onCurrentElementChange', options);
};



WAF.DataSourceEm.newEntity = function(options){
	options = options;
	if (this._private.currentEntity != null) {
		this.dispatch('onBeforeCurrentElementChange', options);
	}
	this._private.currentElemPos = -1;
	this._private.currentEntity = new WAF.Entity(this._private.dataClass);
	
	this._private.isNewElem = true;
	this._private._updateValues();
	this.dispatch('onCurrentElementChange', options);
};



WAF.DataSourceEm.query = function(queryString, options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 1, {
		queryParams: true
	});
	userData = resOp.userData;
	options = resOp.options;
	var xoptions = {
		onSuccess: this._private._gotEntityCollection,
		onError: this._private._gotEntityCollection,
		persistOnServer: true,
		pageSize: 40,
		autoExpand: this._private._getAutoExpand()
	};
	var datas = {
		type: 'getEntityCollection',
		dataSource: this,
		mustPublish: true,
		options: options,
		userData: userData
	};
	xoptions = this._private._mixOptions(options, xoptions);
	this._private.dataClass.query(queryString, xoptions, datas);
};


WAF.DataSourceEm.filterQuery = function(queryString, options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 1, {
		queryParams: true
	});
	userData = resOp.userData;
	options = resOp.options;
	var xoptions = {
		onSuccess: this._private._gotEntityCollection,
		onError: this._private._gotEntityCollection,
		persistOnServer: true,
		pageSize: 40,
		autoExpand: this._private._getAutoExpand(),
		filterSet: this._private.entityCollection
	};
	var datas = {
		type: 'getEntityCollection',
		dataSource: this,
		mustPublish: true,
		options: options,
		userData: userData
	};
	xoptions = this._private._mixOptions(options, xoptions);
	this._private.dataClass.query(queryString, xoptions, datas);
};



WAF.DataSourceEm.allEntities = function(options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 0);
	userData = resOp.userData;
	options = resOp.options;
	this.query("", options, userData);
}

WAF.DataSourceEm.noEntities = function(){
	if (this._private.entityCollection.length > 0) {
		this.setEntityCollection(this._private.dataClass.newCollection());
	}
}


WAF.DataSourceEm.orderBy = function(orderByString, options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	var sel = this.getSelection();
	if (sel != null && options.keepSelection === undefined) 
		options.keepSelection = sel.prepareToSend();
	var entityCollection = this._private.entityCollection;
	if (entityCollection != null) {
		var xoptions = {
			onSuccess: this._private._gotEntityCollection,
			onError: this._private._gotEntityCollection,
			persistOnServer: true,
			pageSize: 40,
			//keepOldCollectionOnError: true,
			autoExpand: this._private._getAutoExpand()
		};
		xoptions = this._private._mixOptions(options, xoptions);
		var datas = {
			type: 'getEntityCollection',
			dataSource: this,
			mustPublish: true,
			options: options,
			userData: userData
		};
		entityCollection.orderBy(orderByString, xoptions, datas);
	}
};


WAF.DataSourceEm.buildFromSelection = function(selection, options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	var entityCollection = this._private.entityCollection;
	if (entityCollection != null) {
		var xoptions = {
			onSuccess: this._private._gotEntityCollection,
			onError: this._private._gotEntityCollection,
			persistOnServer: true,
			pageSize: 40,
			autoExpand: this._private._getAutoExpand()
		};
		xoptions = this._private._mixOptions(options, xoptions);
		var datas = {
			type: 'buildFromSelection',
			dataSource: this,
			mustPublish: true,
			options: options,
			userData: userData
		};
		return entityCollection.buildFromSelection(selection, xoptions, datas);
	}
}



WAF.DataSourceEm.resolveSource = function(options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 0);
	userData = resOp.userData;
	options = resOp.options;
	
	switch (this._private.sourceType) {
		case "dataClass":
			this._private.currentElemPos = 0;
			if (this._private.initialQuery) {
				var qStr = this._private.initialQueryStr ? this._private.initialQueryStr : '', orderByStr = '', mainOptions = {
					pageSize: this._private.dataClass.getDefaultTopSize() || 40,
					onSuccess: this._private._gotEntityCollection,
					onError: this._private._gotEntityCollection,
					persistOnServer: true,
					autoExpand: this._private._getAutoExpand()
				}, specialOptions, theUserData = {
					type: "getEntityCollection",
					mustPublish: true,
					dataSource: this,
					options: options,
					userData: userData
				};
				
				// We add the orderBy statement only if the query string is not ''
				if (this._private.initialOrderBy !== '') {
					orderByStr = this._private.initialOrderBy;
					if (qStr !== '') {
						qStr += ' order by ' + orderByStr;
					}
				}
				
				// Query string not empty, or empty query string with no order by
				if (qStr !== '' || orderByStr === '') {
					this._private.entityCollection = this._private.dataClass.query(qStr, mainOptions, theUserData);
				}
				else {
					// Empty query string with orderBy. We first query all entities, then orderBy
					// (but in the future, we should be able to send a special query. For example
					// ...query('* order by ...') or ...query('ALL order by ...')
					function _queryCallbackForOrderBy(e){
						e.entityCollection.orderBy(orderByStr, mainOptions, theUserData);
					}
					
					specialOptions = {
						pageSize: 40,
						onSuccess: _queryCallbackForOrderBy,
						onError: _queryCallbackForOrderBy,
						persistOnServer: true,
						autoExpand: this._private._getAutoExpand()
					};
					
					this._private.entityCollection = this._private.dataClass.query('', specialOptions, theUserData);
				}
				
			/*
			 this._private.entityCollection = this._private.dataClass.query(
			 '',
			 {
			 pageSize: 40,
			 onSuccess: this._private._gotEntityCollection,
			 onError: this._private._gotEntityCollection,
			 persistOnServer: true,
			 autoExpand: this._private._getAutoExpand()
			 },
			 {
			 type: "getEntityCollection",
			 mustPublish: true,
			 dataSource: this,
			 options: options,
			 userData: userData
			 }
			 );
			 */
			}
			else {
				this._private.entityCollection = this._private.dataClass.newCollection();
				this._private.currentEntity = null;
				this._private._updateValues();
				this.dispatch('onCollectionChange', options);
				var onSuccess = options.onSuccess;
				var dsEvent = {
					dataSource: this,
					data: userData,
					userData: userData
				};
				if (onSuccess != null) 
					onSuccess(dsEvent);
			}
			
			break;
			
		case "relatedEntities":
			var otherEntity = this._private.otherSource._private.currentEntity;
			if (otherEntity == null) {
				if (this._private.currentEntity != null) {
					this.dispatch('onBeforeCurrentElementChange', options);
				}
				this._private.entityCollection = null;
				this._private.currentEntity = null;
				this._private._updateValues();
				this._private.currentElemPos = 0;
				this.length = 0;
				
				this.dispatch('onCollectionChange', options);
				
				var onSuccess = options.onSuccess;
				var dsEvent = {
					dataSource: this,
					data: userData,
					userData: userData
				};
				if (onSuccess != null) 
					onSuccess(dsEvent);
				
			}
			else {
				var otherAtt = otherEntity[this._private.otherAttribute.name];
				if (otherAtt == null) {
					if (this._private.currentEntity != null) {
						this.dispatch('onBeforeCurrentElementChange', options);
					}
					this._private.entityCollection = null;
					this._private.currentEntity = null;
					this._private._updateValues();
					this._private.currentElemPos = 0;
					this.length = 0;
				}
				else {
					this._private.entityCollection = otherAtt.getValue({
						onSuccess: this._private._gotEntityCollection,
						onError: this._private._gotEntityCollection,
						autoSubExpand: this._private._getAutoExpand()
					}, {
						type: 'getEntityCollection',
						dataSource: this,
						mustPublish: true,
						options: options,
						userData: userData
					});
					if (this._private.entityCollection === undefined) {
						var tagadabreak = 1;
					}
					
				}
			}
			break;
			
		case "relatedEntity":
			this._private.entityCollection = null;
			this._private.currentElemPos = 0;
			var otherEntity = this._private.otherSource._private.currentEntity;
			if (otherEntity == null) {
				if (this._private.currentEntity != null) {
					this.dispatch('onBeforeCurrentElementChange', options);
				}
				this._private.currentEntity = null;
				this._private._updateValues();
				this.dispatch('onCurrentElementChange', options);
			}
			else {
				var otherAtt = otherEntity[this._private.otherAttribute.name];
				if (otherAtt == null) {
					if (this._private.currentEntity != null) {
						this.dispatch('onBeforeCurrentElementChange', options);
					}
					this.length = 0;
					this._private.currentEntity = null;
					this._private._updateValues();
					this.dispatch('onCurrentElementChange', options);
				}
				else {
					this.length = 1;
					otherAtt.getValue({
						onSuccess: this._private._gotEntity,
						onError: this._private._gotEntity,
						autoSubExpand: this._private._getAutoExpand()
					}, {
						type: 'getEntity',
						dataSource: this,
						mustPublish: true,
						options: options,
						userData: userData,
						entityPos: 0
					});
				}
			}
			break;
	}
};



WAF.DataSourceEm.mustResolveOnFirstLevel = function(){
	return (this._private.sourceType == 'dataClass');
};



WAF.DataSourceEm.getClassTitle = function(){
	if (this._private.dataClass == null) {
		return "";
	}
	else {
		return this._private.dataClass.getName();
	}
};



WAF.DataSourceEm.getAttributeNames = function(){
	var attlist = [];
	var atts = this._private.dataClass.getAttributes();
	if (atts != null) {
		for (var i = 0, nb = atts.length; i < nb; i++) {
			attlist.push(atts[i].name);
		}
	}
	return attlist;
};


WAF.DataSourceEm.makeElement = function(source, entity){
	var elem = {
		_private: {}
	};
	var atts = source._private.atts;
	for (var e in atts) {
		var xatt = atts[e];
		var kind = xatt.kind;
		if (xatt.isFirstLevel && (kind == "storage" || kind == "calculated" || kind == "alias")) 
			elem[e] =  entity == null ? null : entity[e].getValue();
	}
	elem._private.dataClass = source._private.dataClass;
	elem._private.currentEntity = entity;
	elem.getAttributeValue = source.getAttributeValue;
	return elem;
}


WAF.DataSourceEm.getElement = function(pos, options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	var successHandler = options.onSuccess;
	
	var event = {
		element: null,
		position: pos,
		dataSource: this
	};
	if (userData != null) {
		event.data = userData;
		event.userData = userData;
	}
	if ((this.getPosition() == pos) || (this._private.oneElementOnly)) {
		if (successHandler != null) {
			var elem = WAF.DataSourceEm.makeElement(this, this._private.currentEntity);
			event.element = elem;
			successHandler(event);
		}
	}
	else {
		var ok = false;
		var entityCollection = this._private.entityCollection
		if (entityCollection != null) {
			if (pos >= 0 && pos < entityCollection.length) {
				ok = true;
				
				var gotEntityCollection = function(dataProviderEvent){
					var source = dataProviderEvent.userData.dataSource;
					var entity = dataProviderEvent.entity;
					if (dataProviderEvent.error != null && dataProviderEvent.error.length > 0) {
						event.error = dataProviderEvent.error;
						if (options.onError != null) {
							options.onError(event);
						}
					}
					else {
						var elem = WAF.DataSourceEm.makeElement(source, entity);
						event.element = elem;
						successHandler(event);
					}
				}
				
				var delayinfo = null;
				if (options.delayID != null) 
					delayinfo = this._private.delayInfos[options.delayID];
				entityCollection.getEntity(pos, {
					onSuccess: gotEntityCollection,
					onError: gotEntityCollection,
					delay: options.delay || null,
					delayInfo: delayinfo
				}, {
					dataSource: this
				});
			}
		}
		if (!ok) {
			if (successHandler != null) {
				successHandler(event);
			}
		}
	}
	
};


WAF.DataSourceEm.getAttributeValue = function(attributePath, options){
	options = options || {};
	var result = null;
	var em = null;
	var entity = null;
	if (this._private != null) {
		var em = this._private.dataClass;
		var entity = this._private.currentEntity;
	}
	
	if (entity != null) {
		var path = attributePath.split(".");
		if (path.length == 1) {
			result = this[attributePath];
		}
		else {
			var nb = path.length;
			for (var i = 0; i < nb; i++) {
				var attName = path[i];
				var att = em.getAttributeByName(attName);
				if (att != null) {
					var attEnt = entity[attName];
					if (attEnt == null) {
						result = null;
						break;
					}
					else {
						if (att.kind == 'relatedEntity') {
							var subEm = WAF.ds.getDataClass(att.type);
							if (subEm == null) {
								result = null;
								break;
							}
							else {
								em = subEm;
								result = attEnt.getValue();
								if (result == null) 
									break;
								entity = result;
							}
						}
						else if (att.kind == 'relatedEntities' || att.kind == 'composition') {
							result = null;
							break;
						}
						else {
							result = attEnt.getValue();
						}
					}
				}
			}
		}
	}
	
	return result;
}



WAF.DataSourceEm.getOldAttributeValue = function(attributePath, options){
	options = options || {};
	var result = null;
	var em = null;
	var entity = null;
	if (this._private != null) {
		var em = this._private.dataClass;
		var entity = this._private.currentEntity;
	}
	
	if (entity != null) {
		var path = attributePath.split(".");
		if (false && path.length == 1) {
			result = this[attributePath];
		}
		else {
			var nb = path.length;
			for (var i = 0; i < nb; i++) {
				var attName = path[i];
				var att = em.getAttributeByName(attName);
				if (att != null) {
					var attEnt = entity[attName];
					if (attEnt == null) {
						result = null;
						break;
					}
					else {
						if (att.kind == 'relatedEntity') {
							var subEm = WAF.ds.getDataClass(att.type);
							if (subEm == null) {
								result = null;
								break;
							}
							else {
								em = subEm;
								result = attEnt.getOldValue();
								if (result == null) 
									break;
								entity = result;
							}
						}
						else if (att.kind == 'relatedEntities' || att.kind == 'composition') {
							result = null;
							break;
						}
						else {
							result = attEnt.getOldValue();
						}
					}
				}
			}
		}
	}
	
	return result;
}


WAF.DataSourceEm.declareDependencies = function(dependencies, options){
	options = options;
	if (typeof(dependencies) != "string") {
		for (var i = 0, nb = dependencies.length; i < nb; i++) {
			this._private._addAttributeDependency(dependencies[i], options)
		}
	}
	else {
		var xoptions = null;
		var dep = [];
		for (var i = 0; i < arguments.length; ++i) {
			var x = arguments[i];
			if (typeof x === "string")
				dep.push(x);
			else
				xoptions = x;
		}
		this.declareDependencies(dep, xoptions);
	}
}


WAF.DataSourceEm.callMethod = function(options){
	var source = this;
	var result = null;
	var sync = options.sync || false;
	var okToCall = false;
	var methodRef = null;
	if (options.method != null) 
		methodRef = this._private.methods[options.method];
	
	if (options.arguments == null) {
		var myargs = [];
		for (var i = 1, nb = arguments.length; i < nb; i++) // The first one is skipped.
		{
			myargs.push(arguments[i]);
		}
		options.arguments = myargs;
	}
	
	if (methodRef != null) {
		if (methodRef.applyTo == "dataClass") {
			var dataClass = source.getDataClass();
			if (dataClass != null) {
				okToCall = true;
				result = dataClass.callMethod(options);
			}
		}
		else if (methodRef.applyTo == "entityCollection") {
			var entityCollection = source.getEntityCollection();
			if (entityCollection != null) {
				okToCall = true;
				result = entityCollection.callMethod(options);
			}
		}
		else if (methodRef.applyTo == "entity") {
			var entity = source.getCurrentElement();
			if (entity != null) {
				okToCall = true;
				result = entity.callMethod(options);
			}
		}
	}
	return result;
	
}


WAF.DataSourceEm.setDisplayLimits = function(ID, top, bottom){
	//console.log("limit top = "+top+" , bottom = "+bottom);
	var priv = this._private;
	var delayinfo = priv.delayInfos[ID];
	if (delayinfo == null) {
		delayinfo = new WAF.DelayInfoForDataSource(ID, top, bottom);
		priv.delayInfos[ID] = delayinfo;
	}
	else {
		delayinfo.setLimits(top, bottom);
	}
}


// ----------------------------------------------------------------------------------------------------------------------	


WAF.DataSourceVar = function(config){
	WAF.DataSource.call(this, config);
	
	this._private.sourceType = "array";
	this._private.varName = "";
	this._private.dataClass = null;
	this._private.singleElem = false;
	this._private.currentElem = null;
	
	// private functions
	
	this._private._updateValues = WAF.DataSourceVar._updateValues;
	this._private._getFullSet = WAF.DataSourceVar._getFullSet;
	this._private._setCurrentElementByPos = WAF.DataSourceVar._setCurrentElementByPos;
	this._private._Init = WAF.DataSourceVar._Init;
	
	
	// API functions of a DataSource
	
	this.getCurrentElement = WAF.DataSourceVar.getCurrentElement;
	
	this.getDataClass = WAF.DataSourceVar.getDataClass;
	
	this.getClassAttributeByName = WAF.DataSourceVar.getClassAttributeByName;
	
	this.autoDispatch = WAF.DataSourceVar.autoDispatch;
	
	this.addNewElement = WAF.DataSourceVar.addNewElement;
	
	this.save = WAF.DataSourceVar.save;
	
	this.removeCurrent = WAF.DataSourceVar.removeCurrent;
	this.removeCurrentReference = WAF.DataSourceVar.removeCurrentReference;
	
	this.orderBy = WAF.DataSourceVar.orderBy;
	
	this.resolveSource = WAF.DataSourceVar.resolveSource;
	
	this.mustResolveOnFirstLevel = WAF.DataSourceVar.mustResolveOnFirstLevel;
	this.getClassTitle = WAF.DataSourceVar.getClassTitle;
	this.getAttributeNames = WAF.DataSourceVar.getAttributeNames;
	
	this.getElement = WAF.DataSourceVar.getElement;
	this.getAttributeValue = WAF.DataSourceVar.getAttributeValue;
	this.getOldAttributeValue = WAF.DataSourceVar.getOldAttributeValue;
	
	this.sync = WAF.DataSourceVar.sync;
	
	this._private._Init(config);
	
};


/* ************************ */
// private functions




WAF.DataSourceVar._Init = function(config){

	// specific code for DataSourceVar
	var owner = this.owner;
	
	this.varName = config.binding;
	if (config.id == null || config.id == "") {
		config.id = this.varName + "Source";
	}
	
	if (config['data-scope']) {
		this.scope = config['data-scope'];
	}
	
	var sourceType = config['data-source-type'];
	if (sourceType == null) {
		sourceType = "array";
	}
	this.sourceType = sourceType;
	var dataClass;
	var attNameList = null;
	
	if (sourceType == "scalar") {
		var dataType = config["data-dataType"];
		if (dataType == null) {
			dataType = "string";
		}
		dataClass = {};
		dataClass[this.varName] = {
			name: this.varName,
			type: dataType
		}
		this.dataClass = dataClass;
		this.varName = "window";
	}
	else {
		if (config.dataClass != null) {
			this.dataClass = config.dataClass;
		}
		else {
			var dataClassAtts = config['data-attributes'];
			if (dataClassAtts != null) {
				dataClass = {};
				attNameList = [];
				var attlist = dataClassAtts.split(",");
				for (var i = 0; i < attlist.length; i++) {
					var s = attlist[i];
					var decomp = s.split(":");
					if (decomp[0] != "") {
						var type = "string";
						if (decomp.length > 1) {
							type = decomp[1];
						}
						var att = {
							name: decomp[0],
							type: type,
							kind: "storage"
						};
						attNameList.push(decomp[0]);
						dataClass[att.name] = att;
					}
				}
				this.dataClass = dataClass;
			}
		}
	}
	
	var mustBuildList = attNameList == null;
	dataClass = this.dataClass;
	if (dataClass != null) {
		if (mustBuildList) {
			attNameList = [];
		}
		for (var i in dataClass) {
			var dataClassAtt = dataClass[i];
			if (dataClassAtt.kind == null) {
				dataClassAtt.kind = "storage";
			}
			this.atts[dataClassAtt.name] = new WAF.DataSourceVarAttribute(dataClassAtt, owner);
			if (mustBuildList) {
				attNameList.push(dataClassAtt.name);
			}
		}
	}
	this.attNameList = attNameList;
	this.selCanBeModified = this.sourceType == "array";
	this.oneElementOnly = this.sourceType != "array";
	
	
	if (!this.selCanBeModified) {
		delete owner.addNewElement;
	}
	
	if (this.oneElementOnly) {
		delete owner.addNewElement;
		delete owner.selectNext;
		delete owner.select;
		delete owner.selectPrevious;
		delete owner.removeCurrent;
		delete owner.removeCurrentReference;
		delete owner.orderBy;
	}
	
	return true;
}



WAF.DataSourceVar._getFullSet = function(){
	var res = null;
	if (!this.oneElementOnly) {
		res = window[this.varName];
		if (res == null) {
			res = [];
			window[this.varName] = res;
		}
	}
	return res;
};



WAF.DataSourceVar._updateValues = function(){
	var curelem = this.owner.getCurrentElement();
	for (var i in this.atts) {
		var sourceAtt = this.atts[i];
		if (sourceAtt.simple) {
			if (curelem == null) {
				this.owner[sourceAtt.name] = null;
				sourceAtt.savedValue = null;
			}
			else {
				this.owner[sourceAtt.name] = curelem[sourceAtt.name];
				sourceAtt.savedValue = curelem[sourceAtt.name];
			}
		}
	}
};



WAF.DataSourceVar._setCurrentElementByPos = function(pos, options, userData){
	options = options || {};
	userData = userData;
	var onSuccess = options.onSuccess;
	var onError = options.onError;
	var dsEvent = {
		dataSource: this.owner,
		data: userData,
		userData: userData
	};
	
	if ((this.owner.getPosition() == pos) || (this.oneElementOnly)) {
		if (onSuccess != null) {
			onSuccess(dsEvent);
		}
	}
	else {
		var ok = false;
		var arr = this._getFullSet();
		if (arr != null) {
			if (pos >= 0 && pos < arr.length) {
				ok = true;
				if (this.currentElem != null) 
					this.owner.dispatch('onBeforeCurrentElementChange', options);
				this.currentElemPos = pos;
				this.currentElem = arr[pos];
				if (this.currentElem == null) {
					this.currentElem = {};
					arr[pos] = this.currentElem;
				}
				this._updateValues();
				this.owner.dispatch('onCurrentElementChange', options);
				if (onSuccess != null) {
					onSuccess(dsEvent);
				}
			}
		}
		if (!ok) {
			if (this.currentElem != null) {
				this.owner.dispatch('onBeforeCurrentElementChange', options);
			}
			this.currentElem = null;
			this.currentElemPos = 0;
			this._updateValues();
			this.owner.dispatch('onCurrentElementChange', options);
		}
	}
};



/* ************************ */
// public API






/* DESCRIBED ON DATASOURCE CLASS */
WAF.DataSourceVar.getCurrentElement = function(){
	return this._private.currentElem;
};



WAF.DataSourceVar.getDataClass = function(){
	return this._private.dataClass;
};



WAF.DataSourceVar.getClassAttributeByName = function(attName){
	var result = this._private.dataClass[attName];
	return result;
};



/* DESCRIBED ON DATASOURCE CLASS */
WAF.DataSourceVar.autoDispatch = function(options){
	options = options;
	var curElem = this.getCurrentElement();
	if (curElem != null) {
		for (varname in this._private.atts) {
			var sourceAtt = this._private.atts[varname];
			var curValue = curElem == null ? null : curElem[sourceAtt.name];
			if (sourceAtt.savedValue !== curValue) {
				sourceAtt.savedValue = curValue;
				sourceAtt.dispatch(options);
				//this.changedCurrentEntityAttribute(sourceAtt.name, subscriberID);
			}
		}
	}
	
};



WAF.DataSourceVar.addNewElement = function(options){
	options = options;
	if (this._private.selCanBeModified) {
		var curObj = this.getCurrentElement();
		if (curObj != null) {
			this.dispatch('onBeforeCurrentElementChange', options);
		}
		this._private._updateValues();
		this._private.currentElem = {};
		var arr = this._private._getFullSet();
		arr.push(this._private.currentElem);
		this.length = arr.length;
		this._private.isNewElem = true;
		this._private.currentElemPos = arr.length - 1;
		this._private._updateValues();
		this.dispatch('onCollectionChange', options);
		//this.dispatch('onCurrentElementChange', options);
	}
};



WAF.DataSourceVar.save = function(options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 0);
	userData = resOp.userData;
	options = resOp.options;
	this.autoDispatch({
		stopDispatch: true
	});
	var dsEvent = {
		dataSource: this,
		data: userData,
		userData: userData
	};
	var onSuccess = options.onSuccess;
	if (onSuccess != null) 
		onSuccess(dsEvent);
	
	/*
	 var entity = this.getCurrentElement();
	 if (entity != null)
	 {
	 if (onSuccess != null)
	 {
	 onSuccess(dsEvent);
	 }
	 }
	 else
	 {
	 if (onSuccess != null)
	 onSuccess(dsEvent);
	 }
	 */
};



WAF.DataSourceVar.removeCurrent = function(options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 0);
	userData = resOp.userData;
	options = resOp.options;
	var curObj = this.getCurrentElement();
	if ((curObj != null) && !this._private.oneElementOnly) {
		var pos = this.getPosition();
		var arr = this._private._getFullSet();
		if (arr != null) {
			if (pos >= 0 && pos < arr.length) {
				arr.splice(pos, 1);
				this._private.currentElem = null;
				this._private.currentElemPos = -1;
				var dsEvent = {
					dataSource: this,
					data: userData,
					userData: userData
				};
				
				var stop = false;
				if (!stop) {
					if (pos >= arr.length) 
						pos = arr.length - 1;
	                this.length = arr.length;
	                this.dispatch('onCollectionChange', options);
				    this.select(pos);
	               }
               if (options.onSuccess != null)
                   stop = options.onSuccess(dsEvent);

			}
		}
	}
};


WAF.DataSourceVar.removeCurrentReference = function(options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 0);
	userData = resOp.userData;
	options = resOp.options;
	options.removeReferenceOnly = true;
	this.removeCurrent(options, userData);
}


WAF.DataSourceVar.orderBy = function(orderByString, options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	var dataSource = this;
	var priv = this._private;
	var arr = priv._getFullSet();
	if (arr != null) {
		var atts = orderByString.split(",");
		var attributes = [];
		atts.forEach(function(item){
			var ascending = true;
			var subatts = item.split(" ");
			if (subatts.length > 1) {
				ascending = subatts[1].toLowerCase() != "desc";
			}
			attributes.push({
				name: subatts[0],
				ascending: ascending
			});
		});
		
		arr.sort(function(e1, e2){
			var result = 0;
			for (var i = 0; i < attributes.length && result == 0; ++i) {
				att = attributes[i];
				var v1 = e1[att.name];
				var v2 = e2[att.name];
				if (v1 != v2) {
					if (att.ascending) {
						if (v1 < v2) 
							result = -1;
						else 
							result = 1;
					}
					else {
						if (v1 < v2) 
							result = 1;
						else 
							result = -1;
						
					}
				}
			}
			return result;
		});
		
		priv.currentElem = null;
		priv.currentElemPos = -1;
		dataSource.length = arr.length;
		dataSource.dispatch('onCollectionChange', options);
		if (arr.length > 0) {
			dataSource.select(0);
		}
		
		var dsEvent = {
			dataSource: this,
			data: userData,
			userData: userData
		};
		if (options.onSuccess != null) 
			options.onSuccess(dsEvent);
		
	}
	
	
	
	
	var sel = this.getSelection();
	if (sel != null && options.keepSelection === undefined) 
		options.keepSelection = sel.prepareToSend();
	var entityCollection = this._private.entityCollection;
	if (entityCollection != null) {
		var xoptions = {
			onSuccess: this._private._gotEntityCollection,
			onError: this._private._gotEntityCollection,
			persistOnServer: true,
			pageSize: 40,
			//keepOldCollectionOnError: true,
			autoExpand: this._private._getAutoExpand()
		};
		xoptions = this._private._mixOptions(options, xoptions);
		var datas = {
			type: 'getEntityCollection',
			dataSource: this,
			mustPublish: true,
			options: options,
			userData: userData
		};
		entityCollection.orderBy(orderByString, xoptions, datas);
	}
};


WAF.DataSourceVar.resolveSource = function(options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 0);
	userData = resOp.userData;
	options = resOp.options;
	switch (this._private.sourceType) {
		case 'scalar':
		case 'object':
			this.length = 1;
			this._private.currentElem = window[this._private.varName];
			this._private.currentElemPos = 0;
			this.dispatch('onCurrentElementChange', options);
			this._private._updateValues();
			
			break;
			
		case 'array':
			var arr = this._private._getFullSet();
			this._private.currentElem = null;
			this._private.currentElemPos = -1;
			if (arr != null) {
				this.length = arr.length;
				this.dispatch('onCollectionChange', options);
				if (arr.length > 0) {
					this.select(0);
				}
			}
			break;
	}
};



WAF.DataSourceVar.mustResolveOnFirstLevel = function(){
	return true;
};



WAF.DataSourceVar.getClassTitle = function(){
	return this._private.varName;
};



WAF.DataSourceVar.getAttributeNames = function(){
	return this._private.attNameList;
};



WAF.DataSourceVar.getElement = function(pos, options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	var successHandler = options.onSuccess;
	
	var event = {
		element: null,
		position: pos,
		dataSource: this
	};
	if (userData != null) {
		event.data = userData;
		event.userData = userData;
	}
	if ((this.getPosition() == pos) || (this._private.oneElementOnly)) {
		if (successHandler != null) {
			var elem = {};
			var atts = this._private.atts;
			for (var e in atts) {
				elem[e] = this[e];
			}
			elem._private = {};
			elem._private.currentElem = elem;
			elem.getAttributeValue = this.getAttributeValue;
			event.element = elem;
			successHandler(event);
		}
	}
	else {
		var ok = false;
		var arr = this._private._getFullSet();
		if (arr != null) {
			if (pos >= 0 && pos < arr.length) {
				ok = true;
				var posElem = arr[pos];
				if (posElem != null) {
					var elem = {};
					var atts = this._private.atts;
					for (var e in atts) {
						elem[e] = posElem[e];
					}
					elem.getAttributeValue = this.getAttributeValue;
					elem._private = {};
					elem._private.currentElem = elem;
					event.element = elem;
				}
				successHandler(event);
			}
		}
		
		if (!ok) {
			if (successHandler != null) {
				successHandler(event);
			}
		}
	}
	
};


WAF.DataSourceVar.getOldAttributeValue = function(attributePath, options){
	return this.getAttributeValue(attributePath, options || null);
}


WAF.DataSourceVar.getAttributeValue = function(attributePath, options){
	options = options || {};
	var result = null;
	var elem = null;
	if (this._private != null) {
		var elem = this._private.currentElem;
	}
	if (elem != null) {
		var path = attributePath.split(".");
		var nb = path.length;
		for (var i = 0; i < nb; i++) {
			var attName = path[i];
			var subelem = elem[attName];
			if (subelem == null) 
				break;
			else {
				result = subelem;
				elem = subelem;
			}
		}
	}
	
	return result;
}


WAF.DataSourceVar.sync = function(options){
	options = options;
	
	if (this._private.oneElementOnly) {
		var curObj = this.getCurrentElement();
		if (curObj != null) {
			this.dispatch('onBeforeCurrentElementChange', options);
		}
		this.length = 1;
		this._private.currentElem = window[this._private.varName];
		this._private.currentElemPos = 0;
		this.dispatch('onCurrentElementChange', options);
		this._private._updateValues();
	}
	else {
		var curpos = this._private.currentElemPos;
		var arr = this._private._getFullSet();
		if (arr != null) {
			this.length = arr.length;
			if (curpos < 0) {
				curpos = 0;
			}
			if (curpos >= arr.length) {
				curpos = arr.length - 1;
			}
			this._private.currentElemPos = curpos;
			if (curpos >= 0)
			{
				this._private.currentElem = arr[curpos];
				if (this._private.currentElem == null) {
					this._private.currentElem = {};
					arr[curpos] = this._private.currentElem;
				}
			}
			else
				this._private.currentElem = null;
				
			this._private._updateValues();
			this.dispatch('onCollectionChange', options);
			//this.dispatch('onCurrentElementChange', options);
			
		}
	}
};




// ----------------------------------------------------------------------------------------------------------


WAF.dataSource = {



	list: {},
	
	
	
	create: function(params){
		var dataSourceType = params['data-source-type'];
		// old code to remove
		var binding = params.binding;
		if (binding != null && binding.indexOf('#') == 0) {
			dataSourceType = "scalar";
			params['data-source-type'] = dataSourceType;
			binding = binding.substring(1);
			params.binding = binding;
		}
		// end of old code
		if (dataSourceType == "scalar" || dataSourceType == "object" || dataSourceType == "array") {
			WAF.source[params.id] = new WAF.DataSourceVar(params);
		}
		else {
			WAF.source[params.id] = new WAF.DataSourceEm(params);
		}
		WAF.dataSource.list[params.id] = WAF.source[params.id];
		
		return WAF.source[params.id];
	},
	
	
	
	destroy: function(source){
		var id = source._private.id;
		
		// SHOULD WE DELETE EVENT HANDLERS ?
		
		delete WAF.source[id];
		delete WAF.dataSource.list[id];
	},
	
	
	
	solveBinding: function(binding){
		var sourceName;
		var attName = "";
		var dataSource = null;
		var sourceAtt = null;
		var dataClassAtt = null;
		var decomp = binding.split(".");
		if (decomp.length == 2) {
			sourceName = decomp[0];
			attName = decomp[1];
			dataSource = WAF.source[sourceName];
		}
		else if (decomp.length > 2) {
			sourceName = decomp[0];
			attName = decomp.slice(1).join(".");
			dataSource = WAF.source[sourceName];
		}
		else {
			sourceName = binding;
			dataSource = WAF.source[sourceName];
		}
		
		if (dataSource != null) {
			if (attName == "") {
				for (var e in dataSource._private.atts) {
					sourceAtt = dataSource._private.atts[e];
					attName = sourceAtt.name;
					break; // on prend le premier
				}
			}
			else {
				//sourceAtt = dataSource._private.atts[attName];
				sourceAtt = dataSource.getAttribute(attName);
			}
			
			if (sourceAtt != null) {
				dataClassAtt = dataSource.getClassAttributeByName(attName);
			}
		}
		
		return {
			dataSource: dataSource,
			sourceName: sourceName,
			sourceAtt: sourceAtt,
			attName: attName,
			dataClassAtt: dataClassAtt
		}
	},
	
	
	
	
	
	fullyInitAllSources: function(){
		var cont = true;
		while (cont) {
			cont = false;
			var list = this.list;
			for (var e in list) {
				var source = list[e];
				if (source._private.needForInit != null) {
					if (source._private._Init(source._private.needForInit)) {
						cont = true;
					}
				}
			}
		}
	}
	
	
}

/*

 (function() {

 var interfaceItem;

 for (interfaceItem in WAF.datasource) {

 WAF.DataSource[interfaceItem] = WAF.datasource[interfaceItem];

 }

 }());

 */

