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







var Class = WAF.require('waf-core/class');

WAF.DataSourceEmSimpleAttribute = Class.create();
WAF.DataSourceEmSimpleAttribute.prototype.initialize = function(emAtt, source){
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
	var doNotDispatch = (options || {}).doNotDispatch || false;	
	var entity = this.owner.getCurrentElement();
	if (entity == null) {
		// nothing to do
	
		// MAY EXPECT AN EXCEPTION
	
	}
	else {
		if (this.owner[this.name] !== value) {
			this.owner[this.name] = value;
			entity[this.name].setValue(value);
			if (!doNotDispatch)
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
	return this.owner.addListener('onAttributeChange', eventHandler, options, userData);
};


WAF.DataSourceEmSimpleAttribute.subscribe = function(event, target, callback, observer, user_data){
	this.owner.subscribe(event, target, callback, observer, user_data);
};

WAF.DataSourceEmSimpleAttribute.unsubscribe = function(args){
	this.owner.unsubscribe(args);
};

WAF.DataSourceEmSimpleAttribute.fire = function(event, target, data, options){
	this.owner.fire(event, target, data, options);
};

WAF.DataSourceEmSimpleAttribute.dispatch = function(options){	
	if (options == null) {
		options = {};
	}
	options.attribute = this;
	options.attributeName = this.name;
	this.owner.dispatch('onAttributeChange', options);
};



// ----------------------------------------------------------------------------------------------



WAF.DataSourceEmRelatedAttribute = Class.create();
WAF.DataSourceEmRelatedAttribute.inherit(WAF.DataSourceEmSimpleAttribute);
WAF.DataSourceEmRelatedAttribute.prototype.initialize = function(emAtt, source){
	this.$super('initialize')(emAtt, source);
	
	
	
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

WAF.DataSourceEmDeepSimpleAttribute = Class.create();
WAF.DataSourceEmDeepSimpleAttribute.inherit(WAF.DataSourceEmSimpleAttribute);
WAF.DataSourceEmDeepSimpleAttribute.prototype.initialize = function(emAtt, source, fullPath){
	this.$super('initialize')(emAtt, source);
	
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



WAF.DataSourceVarAttribute = Class.create();
WAF.DataSourceVarAttribute.inherit(WAF.DataSourceEmSimpleAttribute);
WAF.DataSourceVarAttribute.prototype.initialize = function(varAtt, source){
	this.$super('initialize')(varAtt, source);
	
	
	
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
	var doNotDispatch = (options || {}).doNotDispatch || false;
	
	var jsobj = this.owner.getCurrentElement();
	if (jsobj == null) {
		// nothing to do
	}
	else {
		if (this.owner[this.name] !== value) {
			this.savedValue = value;
			this.owner[this.name] = value;
			jsobj[this.name] = value;
			if (!doNotDispatch)
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
	var doNotDispatch = (options || {}).doNotDispatch || false;
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
		if (sourceAtt != null && !doNotDispatch) {
			sourceAtt.dispatch(options);
		}

        this.owner.dispatch('currentElementChange', { attributeName: new RegExp('^' + this.name + '\\.') });
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



WAF.DataSource = Class.create();
WAF.DataSource.inherit(WAF.require('waf-behavior/observable'));


WAF.DataSource.prototype.initialize = function(config) {
	this._initProperties();

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
	
	this.getKey = WAF.DataSource.getKey;
	
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
	
	this.setSelection = WAF.DataSource.setSelection;
	
	this.getScope = WAF.DataSource.getScope;
	
	this.getWebComponentID = WAF.DataSource.getWebComponentID;
	
	this.atLeastPageSize = WAF.DataSource.atLeastPageSize;
	
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
		if (xoptions.filterAttributes == null)
			xoptions.filterAttributes = xsource._private._getFilterAttributes();
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
	throw new Error('getCurrentElement not implemented here');
};


WAF.DataSource.getKey = function(){
	throw new Error('getKey not implemented here');
};



WAF.DataSource.getElement = function(pos, options, userData){
	throw new Error('getElement not implemented here');
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
					filterAttributes: dataSource._private._getFilterAttributes(),

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



/*WAF.DataSource.addListener = function(eventKind, eventHandler, config, userData){
	config = config;
	userData = userData;
	var listener = new WAF.DataSourceListener(eventKind, eventHandler, config, userData);
	this._private.listeners.push(listener);
	return listener.ID;
};*/

WAF.DataSource.addListener = function(eventKind, eventHandler, config, userData) {
	var eventID, evHandler, c, uD, attributeName, regComp, subscriber;
	config = config || {};
	userData = userData || {};
	
	evHandler = eventHandler;
	c = config;
	uD = userData;
	uD.subID = c.subID;
	attributeName = c.attributeName;
	
	if (!this._private.listenerIndex) {
		this._private.listenerIndex = 0;
	}

	var callback = function(ev) {
		var dispEv, match, okDispatch = true;
		dispEv = {};

		if (ev && ev.data && ev.data.dispatchEvent) {
			 for (var p in ev.data.dispatchEvent) {
				 dispEv[p] = ev.data.dispatchEvent[p];
			 }
			
			dispEv.data = uD;
			dispEv.userData = uD;
			dispEv.listenerID = c.listenerID;
			dispEv.listenerType = c.listenerType;
			dispEv.subID = c.subID;
		}
		
		if (dispEv.dispatchSubID || c.subID) {
			if (dispEv.dispatchSubID) {
				match = dispEv.dispatchSubID.match(c.subID);
			}
			
			if (match && match.length >= 1 && match[0]) {
				okDispatch = true;
			} else {
				okDispatch = false;
			}
		}
		
		if (dispEv.dispatchCompID) {
			regComp = new RegExp("^" + dispEv.dispatchCompID + "_.*?");
			if (!regComp.test(c.listenerID)) {
				okDispatch = false;
			}
		}

		if (dispEv.dispatcherID != null && dispEv.dispatcherID == c.id) {
			okDispatch = false;
		}

		if (dispEv.dispatcherTarget && dispEv.dispatcherTarget != c.id) {
			okDispatch = false;
		}
		
		if (okDispatch) {
			evHandler(dispEv);
		}
		
	}
	
	eventID = ++this._private.listenerIndex;
	
	// remove "on" 
	if(/^on[A-Z]/.test(eventKind)) {
		eventKind = eventKind[2].toLowerCase() + eventKind.substr(3);
	}

	if (attributeName) {
		subscriber = this.subscribe(eventKind, attributeName, callback, null, uD);
	} else {
		subscriber = this.subscribe(eventKind, callback, null, uD);
	}

	subscriber.legacyData = {
		clientCalback : eventHandler,
		realCallback : callback,
		ID : eventID,
		id : config.id,
		userData : userData,
		realEvent : eventKind
	};
	
	
	return eventID;
};


/**
 * @class WAF.DataSource
 * @method removeListener
 * @param {Object} params
 */
WAF.DataSource.removeListener = function(params) {
	params = params || {};

	var id = params.id || params.ID,
	widgetId = params.widgetId;


	this.unsubscribe(function() {
		var data = this.legacyData;
		// search for ID
		if (id !== undefined && data.ID === id) {
			return true;
		}

		// search for id
		if (widgetId !== undefined && data &&
			(data.id === widgetId || 
				(data.userData && data.userData.widget   && data.userData.widget.id   === widgetId) ||
				(data.userData && data.userData.datagrid && data.userData.datagrid.id === widgetId))) {
					return true;
		}
		return false;
	});
};


WAF.DataSource.removeAllListeners = function(){
	this.unsbscribe({});
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
	var dispatchCompID = options.dispatchCompID || null;
	
	if (eventKind == "onAttributeChange") {
		checkAttName = true;
	}
	if (!options.stopDispatch) {
		/*for (var i = 0; i < this._private.listeners.length; i++) {
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
		}*/
		
		var event = {
			dataSource: this,
			eventKind: eventKind,
			dispatcherID: dispatcherInitiator,
			dispatcherTarget : dispatcherTarget,
			dispatcherType: options.dispatcherType,
			eventData: options.userData || null,
			dispatcherOptions: options,
			dispatchCompID: dispatchCompID,
			dispatchSubID : dispatchSubID
		};
		
		if (options.transformedSelection != null) 
			event.transformedSelection = options.transformedSelection;

		if (checkAttName && attName) {
			event.attributeName = attName;
			event.attribute = this.getAttribute(attName);
		}
		if (eventKind == 'onElementSaved') {
			event.entity = options.entity;
			event.position = options.position;
			event.element = options.element;
						
		}
				event.dispatchEvent = event;
				
		// remove on 
		if(/^on[A-Z]/.test(eventKind)) {
			eventKind = eventKind[2].toLowerCase() + eventKind.substr(3);
		}
		
		if (eventKind) {
			// Event inheritance
			switch(eventKind) {
				case 'collectionChange':
					eventKind = ['collectionChange', 'currentElementChange', 'attributeChange'];
					break;
				case 'currentElementChange':
					eventKind = ['currentElementChange', 'attributeChange'];
					break;
			}
			if (checkAttName) {
				this.fire(eventKind, attName, event);
			} else {
				this.fire(eventKind, event);
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


WAF.DataSource.setSelection = function(wafsel, options) {
	options = options;
	this._private.sel = wafsel;
	if (wafsel.getMode() == "single")
	{
		this.select(wafsel.getFirst(), options);
	}
	else
	{
		this.dispatch('onSelectionChange', options);
	}
}

WAF.DataSource.atLeastPageSize = function(pageSize, widgetRef) {
	// does not do anything here, will do something for server data sources
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

WAF.DataSourceEm = Class.create();
WAF.DataSourceEm.inherit(WAF.DataSource);
WAF.DataSourceEm.prototype.initialize = function(config) {
	this.$super('initialize')(config);
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
	priv.filterAttributes = null;
	priv.minPageSize = 40;
	priv.currentOrderBy = null;
	
	// private functions
	
	priv._updateValues = WAF.DataSourceEm._updateValues;
	priv._gotEntity = WAF.DataSourceEm._gotEntity;
	priv._gotEntityCollection = WAF.DataSourceEm._gotEntityCollection;
	priv._setCurrentElementByPos = WAF.DataSourceEm._setCurrentElementByPos;
	priv._Init = WAF.DataSourceEm._Init;
	
	priv._addAttributeDependency = WAF.DataSourceEm._addAttributeDependency;
	priv._getAutoExpand = WAF.DataSourceEm._getAutoExpand;
	priv._mixOptions = WAF.DataSourceEm._mixOptions;
	priv._getFilterAttributes = WAF.DataSourceEm._getFilterAttributes;
	
	
	
	
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
	this.getElementByKey = WAF.DataSourceEm.getElementByKey;
	
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

	this.getElements = WAF.DataSourceEm.getElements;
	
	this.getValues = WAF.DataSourceEm.getValues;
	
	this.getKey = WAF.DataSourceEm.getKey;
	
	this.sync = WAF.DataSourceEm.sync;
	
	this.getAttributeValue = WAF.DataSourceEm.getAttributeValue;
	
	this.get = WAF.DataSourceEm.getAttributeValue;
	
	this.setAttributeValue = WAF.DataSourceEm.setAttributeValue;
	
	this.set = WAF.DataSourceEm.setAttributeValue;
	
	this.getOldAttributeValue = WAF.DataSourceEm.getOldAttributeValue;
	
	this.declareDependencies = WAF.DataSourceEm.declareDependencies;
	
	this.callMethod = WAF.DataSourceEm.callMethod;
	
	this.buildFromSelection = WAF.DataSourceEm.buildFromSelection;
	
	this.setDisplayLimits = WAF.DataSourceEm.setDisplayLimits;
	
	this.atLeastPageSize = WAF.DataSourceEm.atLeastPageSize;
	
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

	if (config["data-filter-attributes"] != null) {
		this.filterAttributes = config["data-filter-attributes"];
	}
	
	if (config["data-initialOrderBy"] != null) {
		this.initialOrderBy = config["data-initialOrderBy"]; // Should check config["data-initial-queryString"] is valid
	}
	
	if (this.initialOrderBy != null && this.initialOrderBy != '')
		this.currentOrderBy = this.initialOrderBy;
	else
		this.currentOrderBy = null;
		
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
                        this.owner.subscribe('attributeChange', function(event) { 
                            if(event.target) {
                                otherSource.fire('attributeChange', attName + '.' + event.target, event.data);
                            }
                        });
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
		if (options.destinationDataSource != null) {
			var destSource = WAF.dataSource.findOrDuplicate(source, options.destinationDataSource, event.entityCollection);
			if (destSource != null)
			{
				destSource.setEntityCollection(event.entityCollection, options);
			}
		}
		else
		{
			if (source._private.currentEntity != null) 
				source.dispatch('onBeforeCurrentElementChange', options);
			source._private.currentEntity = null;
			source._private.entityCollection = event.entityCollection;
			if (event.userData != null && event.userData.askedOrderBy != null)
				source._private.currentOrderBy = event.userData.askedOrderBy;
			
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
	options.pageSize = priv.minPageSize;
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


WAF.DataSourceEm._getFilterAttributes = function(){
	return this.filterAttributes || null;
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
		if (inOptions.filterAttributes != null) 
			outOptions.filterAttributes = inOptions.filterAttributes;
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
		if (inOptions.retainPositions != null) 
			outOptions.retainPositions = inOptions.retainPositions;
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


WAF.DataSourceEm.getKey = function(){
	var key = null;
	var priv = this._private;
	var entity = priv.currentEntity;
	if (entity != null)
		key = entity.getKey();
		
	return key;
}


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



WAF.DataSourceEm.addNewElement = function(elem, options){
	options = options;
	var priv = this._private;
	var source = this;
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

		if (elem != null) {
			for (var e in elem) {
				var sourceatt = this.getAttribute(e);
				if (sourceatt != null && !sourceatt.readOnly) {
					if (sourceatt.simple || sourceatt.type == 'image') {
						sourceatt.setValue(elem[e], {
							doNotDispatch: true
						});
					}
					else {
						var valatt = source[e];
						if (valatt != null && vallatt.set != null) {
							valatt.set(elem[e], {
								doNotDispatch: true
							});
						}
					}
				}
			}
		}
		
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
		if (refreshOnly || entity.isTouched() || entity.isNew()) {
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
				autoExpand: this._private._getAutoExpand(),
				filterAttributes: this._private._getFilterAttributes()
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
			pageSize: this._private.minPageSize,
			filterAttributes: this._private._getFilterAttributes(),
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



WAF.DataSourceEm.getElementByKey = function(key, options, userData){
	var dataSource = this;
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	
	function getElementByKeyHandler(dataProviderEvent){
		var event = { dataSource: dataSource };
		var entity = dataProviderEvent.entity;
		if (dataProviderEvent.error != null && dataProviderEvent.error.length > 0) {
			event.error = dataProviderEvent.error;
		}
		else {
			var elem = WAF.DataSourceEm.makeElement(dataSource, entity);
			event.element = elem;
			event.result = elem;
		}
		
		WAF.callHandler(event.error != null, event.error, event, options, userData);
	}
	
	this.getDataClass().getEntity(key, getElementByKeyHandler);
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
		pageSize: this._private.minPageSize,
		filterAttributes: this._private._getFilterAttributes(),
		autoExpand: this._private._getAutoExpand()
	};
	var datas = {
		type: 'getEntityCollection',
		dataSource: this,
		mustPublish: true,
		options: options,
		userData: userData
	};
	if (options.orderBy != null && options.orderBy != '')
	{
		datas.askedOrderBy = options.orderBy;
	}
	xoptions = this._private._mixOptions(options, xoptions);
	if (options.keepOrderBy)
	{
		var currentOrderBy = this._private.currentOrderBy;
		if (currentOrderBy != null && currentOrderBy != '')
		{
			xoptions.orderby = currentOrderBy;
		}
	}
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
		pageSize: this._private.minPageSize,
		filterAttributes: this._private._getFilterAttributes(),
		autoExpand: this._private._getAutoExpand(),
	};
	
	if (options.fromInitialQuery)
	{
		if (this._private.initialQueryStr != null && this._private.initialQueryStr != '')
		{
			queryString = this._private.initialQueryStr + " and ("+queryString+")";
		}
	}
	else
	{
		xoptions.filterSet = this._private.entityCollection;
	}
			
	var datas = {
		type: 'getEntityCollection',
		dataSource: this,
		mustPublish: true,
		options: options,
		userData: userData
	};
	if (options.orderBy != null && options.orderBy != '')
	{
		datas.askedOrderBy = options.orderBy;
	}
	xoptions = this._private._mixOptions(options, xoptions);
	if (options.keepOrderBy)
	{
		var currentOrderBy = this._private.currentOrderBy;
		if (currentOrderBy != null && currentOrderBy != '')
		{
			xoptions.orderby = currentOrderBy;
		}
	}
	this._private.dataClass.query(queryString, xoptions, datas);
};



WAF.DataSourceEm.allEntities = function(options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 0);
	userData = resOp.userData;
	options = resOp.options;
	if (options.keepOrderBy)
	{
		var currentOrderBy = this._private.currentOrderBy;
		if (currentOrderBy != null && currentOrderBy != '')
		{
			options.orderby = currentOrderBy;
		}
	}
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
			pageSize: this._private.minPageSize,
			//keepOldCollectionOnError: true,
			filterAttributes: this._private._getFilterAttributes(),
			autoExpand: this._private._getAutoExpand()
		};
		xoptions = this._private._mixOptions(options, xoptions);
		var datas = {
			type: 'getEntityCollection',
			dataSource: this,
			askedOrderBy: orderByString,
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
			pageSize: this._private.minPageSize,
			filterAttributes: this._private._getFilterAttributes(),
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
	var priv = this._private;
	
	switch (priv.sourceType) {
		case "dataClass":
			priv.currentElemPos = 0;
			if (priv.initialQuery) {
				var qStr = priv.initialQueryStr ? priv.initialQueryStr : '', orderByStr = '', mainOptions = {
					pageSize: priv.dataClass.getDefaultTopSize() || priv.minPageSize,
					onSuccess: priv._gotEntityCollection,
					onError: priv._gotEntityCollection,
					persistOnServer: true,
					filterAttributes: priv._getFilterAttributes(),
					autoExpand: priv._getAutoExpand()
				}, specialOptions, theUserData = {
					type: "getEntityCollection",
					mustPublish: true,
					dataSource: this,
					options: options,
					userData: userData
				};
				
				// We add the orderBy statement only if the query string is not ''
				if (priv.initialOrderBy !== '') {
					orderByStr = priv.initialOrderBy;
					if (qStr !== '') {
						qStr += ' order by ' + orderByStr;
					}
				}
				
				// Query string not empty, or empty query string with no order by
				if (qStr !== '' || orderByStr === '') {
					priv.entityCollection = priv.dataClass.query(qStr, mainOptions, theUserData);
				}
				else {
					// Empty query string with orderBy. We first query all entities, then orderBy
					// (but in the future, we should be able to send a special query. For example
					// ...query('* order by ...') or ...query('ALL order by ...')
					function _queryCallbackForOrderBy(e){
						e.entityCollection.orderBy(orderByStr, mainOptions, theUserData);
					}
					
					specialOptions = {
						pageSize: priv.minPageSize,
						onSuccess: _queryCallbackForOrderBy,
						onError: _queryCallbackForOrderBy,
						persistOnServer: true,
						filterAttributes: priv._getFilterAttributes(),
						autoExpand: priv._getAutoExpand()
					};
					
					priv.entityCollection = priv.dataClass.query('', specialOptions, theUserData);
				}
				
			/*
			 priv.entityCollection = priv.dataClass.query(
			 '',
			 {
			 pageSize: 40,
			 onSuccess: priv._gotEntityCollection,
			 onError: priv._gotEntityCollection,
			 persistOnServer: true,
			 autoExpand: priv._getAutoExpand()
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
				priv.entityCollection = priv.dataClass.newCollection();
				priv.currentEntity = null;
				priv._updateValues();
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
			var otherEntity = priv.otherSource._private.currentEntity;
			if (otherEntity == null) {
				if (priv.currentEntity != null) {
					this.dispatch('onBeforeCurrentElementChange', options);
				}
				priv.entityCollection = null;
				priv.currentEntity = null;
				priv._updateValues();
				priv.currentElemPos = 0;
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
				var otherAtt = otherEntity[priv.otherAttribute.name];
				if (otherAtt == null) {
					if (priv.currentEntity != null) {
						this.dispatch('onBeforeCurrentElementChange', options);
					}
					priv.entityCollection = null;
					priv.currentEntity = null;
					priv._updateValues();
					priv.currentElemPos = 0;
					this.length = 0;
				}
				else {
					priv.entityCollection = otherAtt.getValue({
						onSuccess: priv._gotEntityCollection,
						onError: priv._gotEntityCollection,
						//filterAttributes: priv._getFilterAttributes(),
						autoSubExpand: priv._getAutoExpand(),
						subOrderby: priv.initialOrderBy != null && priv.initialOrderBy != '' ? priv.initialOrderBy : null
					}, {
						type: 'getEntityCollection',
						dataSource: this,
						mustPublish: true,
						options: options,
						userData: userData
					});
					if (priv.entityCollection === undefined) {
						var tagadabreak = 1;
					}
					
				}
			}
			break;
			
		case "relatedEntity":
			priv.entityCollection = null;
			priv.currentElemPos = 0;
			var otherEntity = priv.otherSource._private.currentEntity;
			if (otherEntity == null) {
				if (priv.currentEntity != null) {
					this.dispatch('onBeforeCurrentElementChange', options);
				}
				priv.currentEntity = null;
				priv._updateValues();
				this.dispatch('onCurrentElementChange', options);
			}
			else {
				var otherAtt = otherEntity[priv.otherAttribute.name];
				if (otherAtt == null) {
					if (priv.currentEntity != null) {
						this.dispatch('onBeforeCurrentElementChange', options);
					}
					this.length = 0;
					priv.currentEntity = null;
					priv._updateValues();
					this.dispatch('onCurrentElementChange', options);
				}
				else {
					this.length = 1;
					otherAtt.getValue({
						onSuccess: priv._gotEntity,
						onError: priv._gotEntity,
						autoSubExpand: priv._getAutoExpand()
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


WAF.DataSourceEm.getElements = function(pos, howMany, options, userData) {
	var resOp = WAF.tools.handleArgs(arguments, 2);
	userData = resOp.userData;
	options = resOp.options;
	var successHandler = options.onSuccess;
	var errorHandler = options.onError;
	var priv = this._private;
	var source = this;
	
	var newevent = {
		elements: [],
		position: pos,
		howMany: howMany,
		dataSource: this
	};
	newevent.result = newevent.elements;
	
	if (pos < 0)
		pos = 0;
	if (pos + howMany > source.length)
		howMany = source.length - pos;
		
	var entityCollection = priv.entityCollection
	if (entityCollection != null) {
		entityCollection.getEntities(pos, howMany, {
			onSuccess: function(event) {
				var entities = event.entities;
				entities.forEach(function(entity, itemindex){
					var elem;
					if (source.getPosition() === (pos+itemindex))
						elem = WAF.DataSourceEm.makeElement(source, priv.currentEntity);
					else
						elem = WAF.DataSourceEm.makeElement(source, entity);
					newevent.elements.push(elem);
				});
				if (successHandler != null)
					successHandler(newevent);
			},
			onError: function(event) {
				if (errorHandler != null)
				{
					newevent.error = event.error;
					errorHandler(newevent);
				}
			}
		})
	}
	else {
		newevent.error = { error: 602, errorMessage:"missing Collection"};
		if (errorHandler != null)
			errorHandler(newevent);
	}
  
}

WAF.DataSourceEm.getValues = function(attributes, query, options) {
	/*
	 attributes : attributes value to fetch, may be null
	 query : filtering the values, may contain place holders, may also contain an order by clause

	 options :
	 	top : max values
	 	skip : starting value to get (default is 0)
	 	withinCollection : the query is performed inside the current collection of the data source
	 	orderBy : sorting order
	 */
	
	// example : mySource.getValues("att1,att2,att3", "att1 == :1 or att2 == :2", { top : 20, onSuccess: function() { } }, param1, param2)
	var handleOptions = {};
	if (options != null && options.params == null)
		handleOptions.queryParams = true;
	var resOp = WAF.tools.handleArgs(arguments, 2, handleOptions);
	userData = resOp.userData;
	options = resOp.options;
	
	var objToQuery = null;
	if (options.withinCollection)
		objToQuery = this.getEntityCollection();
	if (objToQuery == null)
	{
		objToQuery = this.getDataClass();
		options.top = options.top || 40;
	}
		
	options.filterQuery = query;
	if (options.orderby == null && options.orderBy != null)
		options.orderby = options.orderBy;
	
	objToQuery.toArray(attributes || null, options, userData);

}

WAF.DataSourceEm.getElement = function(pos, options, userData) {
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
			event.result = elem;
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
						event.result = elem;
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


WAF.DataSourceEm.setAttributeValue = function(attributePath, value, options){
	options = options;
	var sourceAtt = this.getAttribute(attributePath);
	if (sourceAtt != null)
	{
		sourceAtt.setValue(value, options);
	}
}


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


WAF.DataSourceEm.atLeastPageSize = function(pageSize, widgetRef) {
	var priv = this._private;
	if (pageSize > priv.minPageSize)
		priv.minPageSize = pageSize;
}



// ----------------------------------------------------------------------------------------------------------------------	


WAF.DataSourceVar = Class.create();
WAF.DataSourceVar.inherit(WAF.DataSource);
WAF.DataSourceVar.prototype.initialize = function(config){
	this.$super('initialize')(config);

	if (config.id == null || config.id == "") {
		if('binding' in config) {
			config.id = config.binding + "Source";
		} else {
			config.id = 'PrivateDatasource' + (Math.random() * 0x100000000).toString(16);
		}
	}
	
	this._private.sourceType = "array";
	this._private.varName = "";
	this._private.dataClass = null;
	this._private.singleElem = false;
	this._private.currentElem = null;
	
	// private functions
	
	this._private._updateValues = WAF.DataSourceVar._updateValues;
	this._private._getFullSet = WAF.DataSourceVar._getFullSet;
	this._private._setFullSet = WAF.DataSourceVar._setFullSet;
	this._private._setCurrentElementByPos = WAF.DataSourceVar._setCurrentElementByPos;
	this._private._Init = WAF.DataSourceVar._Init;
	
	
	// API functions of a DataSource
	
	this.getCurrentElement = WAF.DataSourceVar.getCurrentElement;
	
	this.getKey = WAF.DataSourceVar.getKey;
	
	this.getDataClass = WAF.DataSourceVar.getDataClass;
	
	this.getClassAttributeByName = WAF.DataSourceVar.getClassAttributeByName;
	
	this.autoDispatch = WAF.DataSourceVar.autoDispatch;
	
	this.addNewElement = WAF.DataSourceVar.addNewElement;
	
	this.save = WAF.DataSourceVar.save;
	
	this.removeCurrent = WAF.DataSourceVar.removeCurrent;
	this.removeCurrentReference = WAF.DataSourceVar.removeCurrentReference;
	
	this.selectByKey = WAF.DataSourceVar.selectByKey;
	this.getElementByKey = WAF.DataSourceVar.getElementByKey;

	this.query = WAF.DataSourceVar.query;
	this.filterQuery = WAF.DataSourceVar.filterQuery;
	this.orderBy = WAF.DataSourceVar.orderBy;
	
	this.resolveSource = WAF.DataSourceVar.resolveSource;
	
	this.mustResolveOnFirstLevel = WAF.DataSourceVar.mustResolveOnFirstLevel;
	this.getClassTitle = WAF.DataSourceVar.getClassTitle;
	this.getAttributeNames = WAF.DataSourceVar.getAttributeNames;
	
	this.getElement = WAF.DataSourceVar.getElement;
	this.getElements = WAF.DataSourceVar.getElements;
	this.getValues = WAF.DataSourceVar.getValues;

	
	this.getAttributeValue = WAF.DataSourceVar.getAttributeValue;
	this.get = WAF.DataSourceVar.getAttributeValue;
	
	this.getOldAttributeValue = WAF.DataSourceVar.getOldAttributeValue;
	
	this.setAttributeValue = WAF.DataSourceVar.setAttributeValue;
	this.set = WAF.DataSourceVar.setAttributeValue;

	this.sync = WAF.DataSourceVar.sync;
	
	this._private._Init(config);
	
};


/* ************************ */
// private functions




WAF.DataSourceVar._Init = function(config){

	// specific code for DataSourceVar
	var owner = this.owner;
	
	if('variableReference' in config) {
		this.varRef = config.variableReference;
	}
	if('binding' in config) {
		this.varName = config.binding;
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
					var iskey = false;
					var decomp = s.split(":");
					if (decomp[0] != "") {
						var type = "string";
						if (decomp.length > 1) {
							type = decomp[1];
						}
						if (decomp.length > 2) {
							if (decomp[2].toLowerCase() == 'key')
								iskey = true;
						}
						var att = {
							name: decomp[0],
							type: type,
							kind: "storage",
							isKey: iskey
						};
						attNameList.push(decomp[0]);
						dataClass[att.name] = att;
						if (iskey)
							this.keyAtt = att;
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

	if('variableReference' in config) {
		owner.sync();
	}
	
	return true;
}



WAF.DataSourceVar._getFullSet = function(){
	var res = null;
	if('varRef' in this) {
		res = this.varRef;
	} else {
		res = window[this.varName];
	}
	if (!this.oneElementOnly && res == null) {
		this._setFullSet(res = []);
	}
	return res;
};


WAF.DataSourceVar._setFullSet = function(arr){
	if('varRef' in this) {
		this.varRef = arr;
	} else {
		window[this.varName] = arr;
	}
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


WAF.DataSourceVar.getKey = function(){
	var priv = this._private;
	var key = null;
	var keyAtt = priv.keyAtt;
	var curelem = priv.currentElem;
	if (keyAtt != null && curelem != null) {
		key = curelem[keyAtt.name];
	}
	return key;
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



WAF.DataSourceVar.addNewElement = function(elem, options){
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

		if (elem != null) {
			for (var e in elem) {
				var sourceatt = this.getAttribute(e);
				if (sourceatt != null && !sourceatt.readOnly) {
					if (sourceatt.simple || sourceatt.type == 'image') {
						sourceatt.setValue(elem[e], { doNotDispatch: true });
					}
				}
			}
		}
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




WAF.TextParser = function(text) {
	this.input = text;
	this.curpos = 0;
	this.wasInQuotes = false;
	return this;
}

WAF.TextParser.prototype.isterminator = function(c) {
	if (c == '<' || c == '>' || c == '=' || c == '(' || c == ')' || c == '#' || c == '&' || c == '^' || c == '|' || c == '%' || c == '!')
		return true;
	else
		return false;
}

WAF.TextParser.prototype.removeextraspace = function(s)
{
	var cont = true;

	var len = s.length;
	while (len>0 && cont)
	{
		if (s[len-1] == ' ')
			len--;
		else
			cont = false;
	}
	return s.substring(0,len);
}

WAF.TextParser.prototype.nextWord = function()
{
	var c;
	var result = "";
	var first = true;
	var isregularword;
	var insidequotes = false, insidedoublequotes = false,insidebrackets = false;
	var WasInQuotes = false;

	do {
		if (this.curpos<this.input.length)
		{
			c = this.input[this.curpos];
			if (insidebrackets && c == ']')
			{
				this.curpos++;
				result += c;
				c = '\x00';
			}
			else if (insidequotes && c == "'")
			{
				this.curpos++;
				c = '\x00';
			}
			else
			{
				if (insidedoublequotes && c == '"')
				{
					this.curpos++;
					c = '\x00';
				}
				else
				{
					if (first && (c == ' ' || c == '\t' || c == '\n'))
					{
						this.curpos++;
					}
					else
					{
						if (!insidebrackets && !insidequotes && !insidedoublequotes && this.isterminator(c))
						{
							if (first)
							{
								isregularword = false;
								result += c;
								this.curpos++;
								first = false;
								if (c=='(' || c==')')
									c = '\x00';
							}
							else
							{
								if (isregularword)
								{
									c = '\x00';
								}
								else
								{
									result += c;
									this.curpos++;
								}
							}
						}
						else
						{
							if (first)
							{
								if (c == '[')
								{
									insidebrackets = true;
									result += c;
								}
								else if (c == "'")
								{
									WasInQuotes = true;
									insidequotes = true;
								}
								else
								{
									if (c == '"')
									{
										WasInQuotes = true;
										insidedoublequotes = true;
									}
									else
										result += c;
								}
								isregularword = true;
								this.curpos++;
								first = false;
							}
							else
							{
								if (isregularword)
								{
									if ((c == ' ' || c == '\t' || c == '\n') && result.length != 0 && !insidequotes && !insidedoublequotes && !insidebrackets)
										c = '\x00';
									else
										result += c;
									this.curpos++;
								}
								else
								{
									c = '\x00';
								}
							}
						}
					}
				}
			}
		}
		else
			c = '\x00';
		
	} while(c !== '\x00');
	this.wasInQuotes = WasInQuotes;
	if (!WasInQuotes)
		result = this.removeextraspace(result);
	return result;
}


WAF.DataSourceQuery = function(source, queryString, params) {
	var parser = new WAF.TextParser(queryString);
	var query = this;
	
	query.criterias = [];
	var s;
	do {
		s = parser.nextWord();
		if (s.length > 0)
		{
			var att = source.getAttribute(s);
			if (att != null)
			{
				var oper = 0;
				s = parser.nextWord();
				if (s.length > 0)
				{
					switch(s.toLowerCase())
					{
						case '==':
						case '=':
						case '===':
						case 'like':
							oper = this.Operator.equal;
							break;
							
						case '!=':
						case '!==':
						case '#':
							oper = this.Operator.notequal;
							break;
	
						case '<':
							oper = this.Operator.less;
							break;
	
						case '<=':
							oper = this.Operator.lessorequal;
							break;
	
						case '>':
							oper = this.Operator.greater;
							break;
	
						case '>=':
							oper = this.Operator.greaterorequal;
							break;

						case 'begin':
							oper = this.Operator.begin;
							break;
					}
					
					s = parser.nextWord();
					if (s.length > 0 || parser.wasInQuotes)
					{
						/*
						if (s.length > 0 && s[s.length - 1] == '*' && oper == this.Operator.equal) {
							s = s.substring(0, s.length - 1);
							oper = this.Operator.begin;
						}
						*/
						query.criterias.push({att:att, oper:oper, value: s});
						s = parser.nextWord();
						var cunj = s.toLowerCase();
						if (cunj === 'or' || cunj === 'and' || cunj === '|' || cunj === '||' || cunj === '&' || cunj === '&&')
						{
							// traiter les cunjonctions
						}
						 
					}
				}
					
			}
			
		}
	} while (s.length > 0);
	
	query.criterias.forEach(function(criteria) {
		var val = criteria.value;
		if (val.length > 1 && val[0] == ':') {
			var v = null;
			var nparam = Number(val.substring(1));
			if (params != null && nparam > 0 && nparam <= params.length) {
				v = params[nparam - 1];
			}
			criteria.value = v;
		}
		else {
			criteria.value = criteria.att.normalize(val);
		}
		if (criteria.att.type === 'string') {
			var s = criteria.value;
			if (s.length > 0 && s[s.length - 1] == '*' && criteria.oper == query.Operator.equal) {
				criteria.value = s.substring(0, s.length - 1);
				criteria.oper = query.Operator.begin;
			}			
		}
	});
	
	return query;
}

WAF.DataSourceQuery.prototype.Operator = {  equal : 1,
											notequal : 2,
											less : 3,
											lessorequal : 4,
											greater : 5,
											greaterorequal : 6,
											begin : 7
									};
								
								
WAF.DataSourceQuery.prototype.performSingleLineOnOneElement = function(source, elem, criteria) {
	var att = criteria.att;
	var res = false;
	var elemVal = elem[att.name];
	var s2 = criteria.value;
	var s1 = elemVal;
	if (att.type === 'string') {
		if (typeof s1 === 'string')
			s1 = s1.toLowerCase();
		if (typeof s2 === 'string')
			s2 = s2.toLowerCase();
	}
	if (s1 != null) {
		switch (criteria.oper) {
			case this.Operator.equal:
				res = (s1 === s2);
				break;
			case this.Operator.notequal:
				res = (s1 !== s2);
				break;
			case this.Operator.less:
				res = (s1 < s2);
				break;
			case this.Operator.lessorequal:
				res = (s1 <= s2);
				break;
			case this.Operator.greater:
				res = (s1 > s2);
				break;
			case this.Operator.greaterorequal:
				res = (s1 >= s2);
				break;
			case this.Operator.begin:
				s1 = "" + s1;
				s2 = "" + s2;
				if (s1.length >= s2.length)
					res = (s1.substring(0, s2.length) == s2);
				break;
		}
	}
	else {
		if (s2 == null) {
			if (criteria.oper == this.Operator.equal)
				res = true;
		}
	}
	return res;
};	

									
WAF.DataSourceQuery.prototype.performOnOneElement = function(source, elem) {
	var res = true;
	var query = this;
	query.criterias.forEach(function(criteria) {
		var res2 = query.performSingleLineOnOneElement(source, elem, criteria);
		res = res && res2;
	});
	
	return res;
};



WAF.DataSourceVar.selectByKey = function(key, options, userData){
	var dataSource = this;
	var priv = this._private;
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	
	if (priv.keyAtt != null) {
		var attname = priv.keyAtt.name;
		var pos = -1;
		var arr = priv._getFullSet();
		if (arr != null && key != null) {
			var len = arr.length;
			for (var i = 0; (i < len) && (pos == -1); ++i) {
				var elem = arr[i];
				var elemKey = elem[attname];
				if (elemKey == key)
					pos = i;
			}
			
		}

		priv._setCurrentElementByPos(pos, options, userData)		
	}
}
 
 
 
WAF.DataSourceVar.getElementByKey = function(key, options, userData){
	var dataSource = this;
	var priv = this._private;
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	
	if (priv.keyAtt != null) {
		var attname = priv.keyAtt.name;
		var pos = -1;
		var arr = priv._getFullSet();
		if (arr != null && key != null) {
			var len = arr.length;
			for (var i = 0; (i < len) && (pos == -1); ++i) {
				var elem = arr[i];
				var elemKey = elem[attname];
				if (elemKey == key)
					pos = i;
			}
			
		}

		dataSource.getElement(pos, options, userData);
	}
}

WAF.DataSourceVar.getValues = function(attributes, queryString, options) {
	/*
	 attributes : attributes value to fetch, may be null
	 query : filtering the values, may contain place holders, may also contain an order by clause

	 options :
	 	top : max values
	 	skip : starting value to get (default is 0)
	 	withinCollection : the query is performed inside the current collection of the data source
	 	orderBy : sorting order
	 */
	
	// example : mySource.getValues("att1,att2,att3", "att1 == :1 or att2 == :2", { top : 20, onSuccess: function() { } }, param1, param2)
	var handleOptions = {};
	if (options != null && options.params == null)
		handleOptions.queryParams = true;
	var resOp = WAF.tools.handleArgs(arguments, 2, handleOptions);
	userData = resOp.userData;
	options = resOp.options;
		
	var successHandler = options.onSuccess;
	var errorHandler = options.onError;
	var dataSource = this;
	var priv = dataSource._private;

	var query = new WAF.DataSourceQuery(dataSource, queryString, options.params);
	
	var atts = [];
	var allAtts = false;
	if (attributes == null || attributes == "")
	{
		allAtts = true;
	}
	else
	{
		atts = attributes.split(",");
	}

	var result = [];
	var newEvent = { 
		dataSource: dataSource,
		result: result
	};
	
	var arr = priv._getFullSet();
	if (arr != null) {
		var top = options.top == null ? arr.length : options.top;
		var skip = options.skip || 0;
		
		var founds = 0;
		arr.forEach(function(elem, posInArr) {
			if (query.performOnOneElement(dataSource, elem))
			{
				++founds;
				if (founds > skip && result.length < top)
				{
					var res = {};
					if (allAtts)
					{
						for (e in elem)
						{
							res[e] = elem[e];
						}
					}
					else
					{
						atts.forEach(function(att) {
							res[att] = elem[att];
						});
					}
					result.push(res);
				}
			}
		});
		
		var orderByString = options.orderby;
		if (orderByString == null)
			orderByString = options.orderBy;
			
		if (orderByString != null && orderByString !== "")
		{
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
			
			result.sort(function(e1, e2){
				var res = 0;
				for (var i = 0; i < attributes.length && res == 0; ++i) {
					att = attributes[i];
					var v1 = e1[att.name];
					var v2 = e2[att.name];
					if (v1 != v2) {
						if (att.ascending) {
							if (v1 < v2) 
								res = -1;
							else 
								res = 1;
						}
						else {
							if (v1 < v2) 
								res = 1;
							else 
								res = -1;
							
						}
					}
				}
				return res;
			});
		}

		if (successHandler != null)
		{
			successHandler(newEvent);
		}
	}
	else
	{
		if (errorHandler != null)
		{
			newEvent.error = { error: 602, errorMessage:"missing Collection"};
			errorHandler(newEvent);
		}
	}
}


WAF.DataSourceVar.query = function(queryString, options, userData){	
	var resOp = WAF.tools.handleArgs(arguments, 1, {
		queryParams: true
	});
	userData = resOp.userData;
	options = resOp.options;
	var dataSource = this;
	var priv = this._private;

	var successHandler = options.onSuccess;
	
	var event = {
		dataSource: this
	};
	
	var query = new WAF.DataSourceQuery(this, queryString, options.params);
	
	var arr2 = [];
	var arr = priv._getFullSet();
	if (arr != null) {
		arr.forEach(function(elem) {
			if (query.performOnOneElement(dataSource, elem))
				arr2.push(elem);
		});
	}
	
	if (options.destinationDataSource != null) {
		var destSource = WAF.dataSource.findOrDuplicate(dataSource, options.destinationDataSource, arr2);
		event.dataSource = destSource;
		if (destSource != null) {
			destSource._private._setFullSet(arr2);
			destSource.sync();
		}
	}
	else {
		priv._setFullSet(arr2);
		dataSource.sync();
	}
	
	if (successHandler != null)
		successHandler(event);
};


WAF.DataSourceVar.filterQuery = WAF.DataSourceVar.query;


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
			filterAttributes: this._private._getFilterAttributes(),
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
			this._private.currentElem = this._private._getFullSet();
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



WAF.DataSourceVar.getElements = function(pos, howMany, options, userData) {
	var resOp = WAF.tools.handleArgs(arguments, 2);
	userData = resOp.userData;
	options = resOp.options;
	var successHandler = options.onSuccess;
	var errorHandler = options.onError;
	var priv = this._private;
	var source = this;
	
	var newevent = {
		elements: [],
		position: pos,
		howMany: howMany,
		dataSource: this
	};
	newevent.result = newevent.elements;
	
	var arr = this._private._getFullSet();
	if (arr != null) {
		if (pos < 0)
			pos = 0;
		if (pos + howMany > arr.length)
		{
			howMany = arr.length - pos;
			if (howMany < 0)
				howMany = 0;
		}
		if (howMany > 0)
		{
			var atts = source._private.atts;
			for (var i = pos; i < pos+howMany; ++i)
			{
				var posElem = arr[i];
				var elem = {};
				for (var e in atts) {
					elem[e] = posElem[e];
				}
				elem._private = {};
				elem._private.currentElem = elem;
				elem.getAttributeValue = source.getAttributeValue;
				newevent.elements.push(elem);
			}
		}
		
		if (successHandler != null)
			successHandler(newevent);	
	}
	else {
		newevent.error = { error: 602, errorMessage:"missing Collection"};
		if (errorHandler != null)
			errorHandler(newevent);
	}
  
}

WAF.DataSourceVar.getElement = function(pos, options, userData){
	var resOp = WAF.tools.handleArgs(arguments, 1);
	userData = resOp.userData;
	options = resOp.options;
	var successHandler = options.onSuccess;
	
	var event = {
		element: null,
		result: null,
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
			event.result = elem;
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
					event.result = elem;
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


WAF.DataSourceVar.setAttributeValue = function(attributePath, value, options){
	options = options;
	var sourceAtt = this.getAttribute(attributePath);
	if (sourceAtt != null)
	{
		sourceAtt.setValue(value, options);
	}
}



WAF.DataSourceVar.sync = function(options){
	options = options;
	
	if (this._private.oneElementOnly) {
		var curObj = this.getCurrentElement();
		if (curObj != null) {
			this.dispatch('onBeforeCurrentElementChange', options);
		}
		this.length = 1;
		this._private.currentElem = this._private._getFullSet();
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
	
	findOrDuplicate: function(from, dest, collection) {
		var frompriv = from._private;
		var destSource = null;
		if (typeof dest === 'string')
		{
			var destid = dest;
			destSource = WAF.source[destid];
			if (destSource == null)
			{
				var creationParams = {
					'id': destid,
					'data-source-type': frompriv.sourceType,
					'data-autoLoad':false,
				};
				if (collection instanceof WAF.EntityCollection)
				{
					creationParams.binding = collection.getDataClass().getName();
				}
				else
				{
					creationParams.binding = destid+'_dataArray';
					var pseudoDataClass = frompriv.dataClass;
					var atts = [];
					for (var e in pseudoDataClass)
					{
						var att = pseudoDataClass[e];
						atts.push(att.name+':'+att.type);
					}
					creationParams['data-attributes'] = atts.join(",");
				}
				destSource = WAF.dataSource.create(creationParams);
			}
		}
		else
		{
			destSource = dest;
		}
		return destSource;
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



WAF.DataSourceEm.prototype.remove = function() {
	this.removeCurrent();
}

WAF.DataSourceEm.prototype.next = function() {
	this.selectNext();
}

WAF.DataSourceEm.prototype.previous = function() {
	this.selectPrevious();
}

WAF.DataSourceEm.prototype.first = function() {
	this.select(0);
}

WAF.DataSourceEm.prototype.last = function() {
	var length = this._private.entityCollection.length;
	this.select(parseInt(length-1));
}

WAF.DataSourceEm.prototype.create = function(params) {
	this.addNewElement(params);
}



