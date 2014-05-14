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
 * @module Rpc
 */

//// "use strict";

if (typeof WAF === 'undefined') {
    var WAF = {};
}
if (typeof WAF.classes === 'undefined') {
    WAF.classes = {};
}
if (typeof WAF.config === 'undefined') {
    WAF.config = {};
}
WAF._private = WAF._private || {};
WAF._private.globals = WAF._private.globals || {};
WAF._private.globals.root = this;


/**
 * The Rpc class
 *
 * @class WAF.classes.Rpc
 *
 * @constructor
 * @param {Object} config parameters
 */
WAF.classes.Rpc = function (config) {

    config = config || {};
    if (typeof config !== 'object') {
        config = {};
    }

    // {String} url url to call the services
    config.urlservice = config.urlservice || '/rpc/';

    // {String} messagetype type of the message (json, xml, ...)
    // ! only json for now
    config.messagetype = config.messagetype || 'json';

    // {Object} catalog service description
    config.catalog = config.catalog || null;

    // {Boolean} iscrossdomains enable cross domains calls
    // ! not yet implemented
    if (config.iscrossdomains === undefined) {
        config.iscrossdomains = true;
    }
    
    // {Array} list of all methods to add
    config.methods   = config.methods   || [];
    
    // {String} namespace to create 
    config.namespace = config.namespace || '';
    
    // {Booean} messageValidation is the parameters type/number checked
    if (typeof config.messageValidation === 'undefined') {
        config.messageValidation = false;
    }
    
    /**
     * Add client check on message on the service
     * (use of service description)
     *
     * @property messageValidation
     * @type Boolean
     * @default true
     */
    this.messageValidation = config.messageValidation;

    /**
     * List of the RPC methods
     *
     * @property serviceName
     * @type Array
     * @default ['getCatalog']
     */
    this.serviceName = ['getCatalog'];

    /**
     * RPC service description of the methods
     *
     * @property serviceDescription
     * @type Object
     */
    this.serviceDescription = {
        'getCatalog': {
            'description' : 'Get the list of the methods',
            'type'        : 'method',
            'returns'     : 'string',
            'params'      : [{
                'type'        : 'object',
                'name'        : '*',
                'description' : 'Parameter'
            }]
        }
    };

    /**
     * Get the catalog of the function
     *
     * @method getCatalog
     * @param {Object} params parameters
     * @return {Object}
     */
    this.getCatalog = function (params) {
        var
        serviceDescription = {},
        parameters = [],
        functionName = '',
        i = 0,
        isInList = false,
        serviceLength = 0;

        params = params || {};

        if (typeof params === 'string') {
            parameters.push(params);
            params = parameters;
        }

        serviceDescription = this.call({
            'name'     : 'getCatalog',
            'arguments': [params]
        });

        try {
            serviceDescription = JSON.parse(serviceDescription);
        } catch (e) {
            throw WAF.rpc.ErrorFactory.createError({
                code    : '-32603',
                message : e.description || e.message
            });
        }

        if (typeof serviceDescription === 'object') {
            // add the methods in the list
            for (functionName in serviceDescription)  {
                if (typeof(serviceDescription[functionName]) !== 'string') {
                    isInList = false;
                    serviceLength = this.serviceName.length;
                    for (i = 0; i < serviceLength; i += 1) {
                        if (this.serviceName[i] === functionName) {
                            isInList = true;
                            break;
                        }
                    }
                    if (!isInList) {
                        this.serviceName.push(functionName);
                        this.serviceDescription[functionName] = serviceDescription[functionName];
                    }
                }
            }
        }
        else {
            serviceDescription = {};
        }

        return serviceDescription;
    };

    /**
     * Set the catalog of the function
     *
     * @method setCatalog
     * @param {Object} serviceDescription description of the service
     */
    this.setCatalog = function (serviceDescription) {
        var
        functionName = '',
        i = 0,
        isInList = false,
        serviceLength = 0;

        if (typeof serviceDescription === 'object') {
            // add the methods in the list
            for (functionName in serviceDescription)  {
                if (typeof(serviceDescription[functionName]) !== 'string') {
                    isInList = false;
                    serviceLength = this.serviceName.length;
                    for (i = 0; i < serviceLength; i += 1) {
                        if (this.serviceName[i] === functionName) {
                            isInList = true;
                            break;
                        }
                    }
                    if (!isInList) {
                        this.serviceName.push(functionName);
                        this.serviceDescription[functionName] = serviceDescription[functionName];
                    }
                }
            }
        } else {
            serviceDescription = {};
        }
    };

    /**
     * Create the interface
     *
     *
     * @method getInterfaces
     * @param {proxyConfig} params parameters
     * @return {WAF.classes.Proxy}
     */
    this.getInterfaces = function (params) {
        var
        proxy = {},
        proxyConfig = {},
        methods = [],
        i = 0,
        namespace = '';
        
        // params
        params = params || {};        
        
        params.conf      = params.conf      || null;
        params.methods   = params.methods   || config.methods;
        params.namespace = params.namespace || config.namespace;
        
        // clean parameter
        for (i = 0; i < methods.length; i++) {
            methods[i] = methods[i].replace(/^\s+|\s+$/g, '');
        }
        
        // set the config for the proxy       
        proxyConfig.urlservice        = config.urlservice;
        proxyConfig.messagetype       = config.messagetype;
        proxyConfig.messagevalidation = this.messageValidation;
        
        
        if (params.conf) {
            for (namespace in params.conf)  {
                if (params.conf.hasOwnProperty(namespace)) {
                    proxyConfig.namespace   = namespace; 
                    proxyConfig.methods     = params.conf[namespace];
                    proxyConfig.description = this.getCatalog(params.conf[namespace]);
                
                    proxy = WAF.rpc.ProxyFactory.createProxy(proxyConfig);                
                }    
            }
        } else {
            proxyConfig.namespace   = params.namespace;
            proxyConfig.methods     = params.methods;
            proxyConfig.description = this.getCatalog(proxyConfig.methods);
            
            proxy = WAF.rpc.ProxyFactory.createProxy(proxyConfig);
        }
        
        return proxy;
    };

    /**
     * Call to a rpc function
     *
     *
     * @method call
     * @throws {RpcError}
     * @param {Object} params parameters
     * @return {Object} result
     */
    this.call = function (params) {
        var
        request = {},
        message = {},
        i = 0,
        result = null,
        serviceDescription = {},
        argumentsLength = arguments.length,
        wrpc = WAF.rpc;

        params = params || {};

        if (typeof params === 'string') {
            if (argumentsLength > 0) {
                params.name = arguments[0];
                params.arguments = [];
                for (i = 1; i < argumentsLength; i += 1) {
                    params.arguments.push(arguments[i]);
                }
            }
        }

        // {String} name name of the function
        params.name  = params.name || '';

        // {Array} parameters parameters of the function
        params.parameters  = params.parameters || [];

        // {Array} arguments arguments of the function
        params.arguments  = params.arguments || [];


        if (this.messageValidation) {

            // check method name
            if ((!this.serviceDescription[params.name]) && (params.name !== 'getCatalog')) {
                this.getCatalog(params.name);
                if (!this.serviceDescription[params.name]) {
                    throw wrpc.ErrorFactory.createError({
                        code    : '-32601',
                        message : 'method ' + params.name + ' not found'
                    });

                }
            }

            serviceDescription = this.serviceDescription[params.name];

            // check parameters
            if (params.arguments.length !== serviceDescription.params.length) {
                throw wrpc.ErrorFactory.createError({
                    code    : '-32603',
                    message : 'wrong number of parameters (' + params.arguments.length + ' instead of ' + serviceDescription.params.length + ')'
                });
            }


            for (i = 0; i < argumentsLength; i += 1) {
                if (serviceDescription.params[i].type !== undefined && (typeof params.arguments[i]) !== serviceDescription.params[i].type) {
                    throw wrpc.ErrorFactory.createError({
                        code    : '-32603',
                        message : 'wrong type for parameter ' + params.arguments[i] + ' (' + (typeof params.arguments[i]) + ' instead of ' + serviceDescription.params[i].type + ')'
                    });
                }
            }
        }
        request = wrpc.RequestFactory.createRequest({
            url         : config.urlservice,
            isasync     : false,
            messagetype : config.messagetype
        });
        request.init();

        message = wrpc.MessageFactory.createMessage({
            name        : params.name,
            arguments   : params.arguments,
            messagetype : config.messagetype
        });
        message = JSON.stringify(message);

        result =  request.send({
            message : message
        });

        if (result !== undefined) {
            if (result !== null && result.error !== undefined) {
                if (result.error.data) {
                    throw wrpc.ErrorFactory.createError({
                        code    : result.error.code,
                        message : result.error.message,
                        data    : result.error.data
                    });
                } else {
                    throw wrpc.ErrorFactory.createError({
                        code    : result.error.code,
                        message : result.error.message
                    });
                }
            } else {
                if (this.messageValidation) {
                    if ((typeof result !== serviceDescription.returns) && (typeof serviceDescription.returns !== 'undefined') && (serviceDescription.length !== 0)) {
                        throw wrpc.ErrorFactory.createError({
                            code    : '-32602',
                            message : 'invalid return type (' + typeof result + ' instead of ' + serviceDescription.returns + ')'
                        });
                    } else {
                        return result;
                    }
                }
                else {
                    return result;
                }
            }
        } else {
            return true;
        }

    };

    /**
     * Asynchronous Call to a rpc function
     *
     *
     * @method callAsync
     * @param {Object} params Required. parameters
     * @return {WAF.classes.Rpc.request|WAF.classes.Rpc} handler to the request
     */
    this.callAsync = function (params) {
        var request = {},
        message = "",
        serviceDescription = {},
        i = 0,
        handler = null,
        argumentsLength = arguments.length,
        wrpc = WAF.rpc;

        params  = params || {};

        if (typeof params === 'function') {
            if (argumentsLength > 1) {
                params.onsuccess = arguments[0];
                params.name = '';
                if (typeof arguments[1] === 'string') {
                    params.name = arguments[1];
                }
                params.arguments = [];
                for (i = 2; i < argumentsLength; i += 1) {
                    params.arguments.push(arguments[i]);
                }
            }
        }

        // {String} name name of the function
        params.name  = params.name || '';

        // {Array} arguments arguments of the function
        params.arguments  = params.arguments || [];

        // {Function} onsuccess function to call when a result come (optional, only for async mode)
        params.onsuccess  = params.onsuccess || null;

        // {Function} onerror function to call when a result come (optional, only for async mode)
        params.onerror  = params.onerror || null;
        
                                    
        // allow onError/onerror & onSuccess/onsuccess
        if (typeof params.onSuccess !== 'undefined') {
            params.onsuccess = params.onSuccess;
        }
        if (typeof params.onError !== 'undefined') {
            params.onerror = params.onError;
        }  
        

        if (this.messageValidation) {

            // check method name
            if ((!this.serviceDescription[params.name]) && (params.name !== 'getCatalog')) {
                this.getCatalog(params.name);
                if (!this.serviceDescription[params.name]) {
                    throw wrpc.ErrorFactory.createError({
                        code    : '-32601',
                        message : 'method ' + params.name + ' not found'
                    });

                }
            }

            serviceDescription = this.serviceDescription[params.name];

            // check parameters
            if (params.arguments.length !== serviceDescription.params.length) {
                throw wrpc.ErrorFactory.createError({
                    code    : '-32603',
                    message : 'wrong number of parameters (' + params.arguments.length + ' instead of ' + serviceDescription.params.length + ')'
                });
            }

            argumentsLength = params.arguments.length;
            for (i = 0; i < argumentsLength; i += 1) {
                if (serviceDescription.params[i].type !== undefined && typeof(params.arguments[i]) !== serviceDescription.params[i].type) {
                    throw wrpc.ErrorFactory.createError({
                        code    : '-32603',
                        message : 'wrong type for parameter ' + params.arguments[i] + ' (' + typeof(params.arguments[i]) + ' instead of ' + serviceDescription.params[i].type + ')'
                    });
                }
            }
        }

        request = wrpc.RequestFactory.createRequest({
            url         : config.urlservice,
            messagetype : config.messagetype
        });
        request.init();

        message = wrpc.MessageFactory.createMessage({
            name        : params.name,
            arguments   : params.arguments,
            messagetype : config.messagetype
        });
        message = JSON.stringify(message);

        if (this.messageValidation) {
            handler = request.send({
                message    : message,
                onsuccess  : params.onsuccess,
                onerror    : params.onerror,
                returntype : serviceDescription.returns
            });
        } else {
            handler = request.send({
                message    : message,
                onsuccess  : params.onsuccess,
                onerror    : params.onerror
            });
        }

        return handler;
    };

    if (config.catalog) {
        this.setCatalog(config.catalog);
        this.messageValidation = false;
    }
    
    if (config.namespace || config.methods.length > 0) {
        this.getInterfaces();    
    }
    
    return this;
};


WAF.classes.Rpc.request = {

    /**
     * RPC Request Interface
     *
     *
     * @class WAF.classes.Rpc.request.Request
     *
     * @constructor
     */
    Request : function () {

        /**
         * Initialisation of the request
         * 
         * @method init
         */
        this.init = function () {};

        /**
         * Send the message
         *
         * @method send
         */
        this.send = function () {};

        /**
         * Abort the request
         *
         * @method abort
         */
        this.abort = function () {};
    },

    /**
     * HTTP Request
     *
     *
     * @class WAF.classes.Rpc.request.HttpRequest
     * @extends WAF.classes.Rpc.request.Request
     *
     * @constructor
     * @param {Object} [config] parameters
     */
    HttpRequest : function (config) {
        // Handler to the correct XmlHttpRequest object
        var
        xmlHttpRequest = {},
        acceptType = '',
        contentType = '';

        config = config || {};
        if (typeof config !== 'object') {
            config = {};
        }

        // {String} url url to call
        config.url = config.url || '';

        // {Boolean} isasync true if asynchronous mode
        if (config.isasync === undefined) {
            config.isasync = true;
        }

        // {Boolean} ispost true if POST mode
        if (config.ispost === undefined) {
            config.ispost = true;
        }

        // {Boolean} ispost true if POST mode
        config.messagetype = config.messagetype || 'text';

        /**
         * Initialisation of the request
         *
         * @method init
         */
        this.init = function () {
            var
            httpRequest = {};

            if (WAF._private.globals.root.XMLHttpRequest) {
                httpRequest = new XMLHttpRequest();
                if (httpRequest.overrideMimeType) {
                    httpRequest.overrideMimeType('text/javascript');
                }
            } else if (WAF._private.globals.root.ActiveXObject) {
                try {
                    httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
                } catch (e1) {
                    try {
                        httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
                    } catch (e2) {
                    }
                }
            }
            xmlHttpRequest = httpRequest;

            switch (config.messagetype) {
                case 'json':
                    contentType = 'application/json-rpc; charset=utf-8';
                    acceptType = 'application/json-rpc';
                    break;
                case 'xml':
                    contentType = 'application/xml; charset=utf-8';
                    acceptType = 'application/xml';
                    break;
                default:
                    contentType = 'text/plain; charset=utf-8';
                    acceptType = 'text/plain';
                    break;
            }
        };

        /**
         * Send the data
         *
         * @method send
         * @throws {WAF.Rpc.InvalidParamsError|WAF.Rpc.InternalError|WAF.Rpc.ServerError}
         * @param {Object} params parameters
         * @return {Object|Undefined} the result if in a synchonous mode
         */
        this.send = function (params) {
            var
            oResponse = {},
            method = 'POST',
            xhr = xmlHttpRequest;

            params = params || {};
            if (typeof params !== 'object') {
                params = {};
            }

            // {String} message message to send
            params.message = params.message || ' ';

            // {Function} onsuccess handler to call when get the result (optional)
            params.onsuccess = params.onsuccess || function () {};

            // {Function} onerror handler to call when get the result (optional)
            params.onerror = params.onerror || function () {};

            // {String} returntype type of the result, for type checking (optional)
            params.returntype = params.returntype || '';

            if (!config.ispost) {
                method = 'GET';
            }

            xhr.open(method, config.url, config.isasync);
            xhr.setRequestHeader('Content-Type', contentType);
            xhr.setRequestHeader('Accept', acceptType);
            try {
                xhr.send(params.message);
            } catch (e) {
                if (!config.isasync) {
                    throw WAF.rpc.ErrorFactory.createError({
                        code    : '-32100',
                        message : e.description || e.message
                    });
                } else{
                    params.onerror({
                        code    : '-32100',
                        message : 'Server not responding'
                    });
                }
            }

            if (!config.isasync) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 500) {
                        oResponse = xhr.responseText.replace(/^\s+|\s+$/g, '');
                        if (oResponse !== null) {
                            try {
                                oResponse = JSON.parse(oResponse);
                            } catch (e) {
                                throw WAF.rpc.ErrorFactory.createError({
                                    code    : '-32603',
                                    message : e.description || e.message
                                });
                            }
                            if (oResponse.result !== undefined) {
                                return oResponse.result;
                            } else if (oResponse.error !== undefined) {
                                // throw an error
                                if (oResponse.error) {
                                    if (oResponse.error.data) {
                                        throw WAF.rpc.ErrorFactory.createError({
                                            code    : oResponse.error.code,
                                            message : oResponse.error.message,
                                            data    : oResponse.error.data
                                        });
                                    } else {
                                        throw WAF.rpc.ErrorFactory.createError({
                                            code    : oResponse.error.code,
                                            message : oResponse.error.message
                                        });
                                    }
                                } else {
                                    throw WAF.rpc.ErrorFactory.createError({
                                        code    : '-32603',
                                        message : 'Message contains invalid response'
                                    });
                                }
                            } else {
                                return null;
                            }
                        } else {
                            return null;
                        }
                    }
                }
            } else {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200 || xhr.status === 500) {
                            oResponse = xhr.responseText.replace(/^\s+|\s+$/g, '');
                            if (oResponse !== null) {
                                try {
                                    oResponse = JSON.parse(oResponse);
                                } catch (e) {
                                    throw WAF.rpc.ErrorFactory.createError({
                                        code    : '-32603',
                                        message : e.description || e.message
                                    });
                                }
                                if (oResponse.result !== undefined) {
                                    oResponse = oResponse.result;
                                    if (params.returntype) {
                                        if ((typeof oResponse !== params.returntype) && (typeof params.returntype !== 'undefined') && (params.returntype.length !== 0)) {
                                            params.onerror({
                                                code    : '-32602',
                                                message : 'invalid return type (' + typeof oResponse + ' instead of ' + params.returntype + ')'
                                            });
                                        } else {
                                            params.onsuccess(oResponse);
                                        }
                                    } else {
                                        params.onsuccess(oResponse);
                                    }
                                } else {
                                    params.onerror(oResponse.error);
                                }
                            }
                        }
                    }
                };
            }
            return undefined;
        };

        /**
         * Abort the request
         *
         * @method abort
         */
        this.abort = function () {
            xhr.abort();
        };
    },

    /**
     * Script Tag Request (for JSON-P)
     *
     * @class WAF.classes.Rpc.request.ScriptTagRequest
     * @extends WAF.classes.Rpc.request.Request
     *
     * @constructor
     * @param {Object} config parameters
     */
    ScriptTagRequest : function (config) {
        config = config || {};

        /**
         * Initialisation of the request
         *
         * @method init
         */
        this.init = function () {
        // TO IMPLEMENTS
        };

        /**
         * Send the data
         *
         * @method send
         */
        this.send = function () {
        // TO IMPLEMENTS
        };

        /**
         * Abort the request
         *
         * @method abort
         */
        this.abort = function () {
        // TO IMPLEMENTS
        };
    }
};

/*
 * RPC Message
 */
WAF.classes.Rpc.message = {

    /**
     * XML message Object
     *
     * @class WAF.classes.Rpc.message.XmlMessage
     *
     * @constructor
     * @param {Object} config parameters
     */
    XmlMessage : function (config) {
    // TO IMPLEMENTS
    },

    /**
     * JSON message
     *
     * @class WAF.classes.Rpc.message.JsonMessage
     *
     * @constructor
     * @param {Object} config parameters
     */
    JsonMessage : function (config) {
        var tabArgs = [],
        i = 0,
        max = 0,
        arg = '',
        args = {},
        message = {},
        argumentsLength = 0;

        // config
        config = config || {};
        if (typeof config !== 'object') {
            config = {};
        }

        // {String} name name of the function to call
        config.name = config.name || '';

        // {Object} arguments arguments to send to the client
        config.arguments = config.arguments || {};

        // {Array} parameters parameters to send to the client
        config.parameters = config.parameters || [];

        // {String} body body of the method
        config.body = config.body || '';

        /**
         * Create a unique id for the transaction
         *
         * @private
         * @method generateId
         * @return {Number} a unique id
         */
        function generateId() {
            var
            id = new Date();
            id = parseInt(Math.random() * id.getTime(), 10);
            return id;
        }

        // force correct type
        if (config.arguments.length !== undefined) {
            argumentsLength = config.arguments.length;
            for (i = 0; i < argumentsLength; i += 1) {
                arg = config.arguments[i];
                tabArgs.push(arg);
            }
            args = tabArgs;
        } else {
            args = config.arguments;
        }
        if (config.body.length === 0) { // basic rpc call
            message =  {
                jsonrpc : '2.0',
                id      : generateId(),
                method  : config.name,
                params  : args
            };
        } else { // rpc call with code to execute
            message =  {
                jsonrpc : '2.0-wakanda',
                id      : generateId(),
                method  : {
                    keys   : config.parameters,
                    source : config.body
                },
                params  : args
            };
        }
        return message;
    }
};



WAF.classes.Rpc.error = {

    /**
     * Error Mehod Not Found
     *
     * @class WAF.classes.Rpc.error.MethodNotFoundError
     *
     * @constructor
     * @param {Object} [config]
     */
    MethodNotFoundError : function (config) {
        var
        error = {};

        config = config || {};
        if (typeof config !== 'object') {
            config = {};
        }

        // {String} message message of the error
        config.message = config.message || '';

        // {String} info more informations about the error
        config.data = config.data || '';

        // {String} code code of the error
        config.code = config.code || '-1';

        /**
         * @property name
         * @type String
         * @default "MethodNotFoundError"
         */

        /**
         * @property message
         * @type String
         */

        /**
         * @property description
         * @type String
         */

        if (config.data) {
            error =  {
                name        : 'MethodNotFoundError',
                message     : config.message,
                description : config.data,
                code        : config.code
            };
        } else {
            error =  {
                name    : 'MethodNotFoundError',
                message : config.message,
                code    : config.code
            };
        }

        return error;
    },

    /**
     * Error Server
     *
     * @class WAF.classes.Rpc.error.ServerError
     *
     * @constructor
     * @param {Object} [config]
     */
    ServerError : function (config) {
        var error = {};

        config = config || {};
        if (typeof config !== 'object') {
            config = {};
        }

        // {String} message message of the error
        config.message = config.message || '';

        // {String} info more informations about the error
        config.data = config.data || '';

        // {String} code code of the error
        config.code = config.code || '-1';

        if (config.data) {
            error =  {
                name        : 'ServerError',
                message     : config.message,
                description : config.data,
                code        : config.code
            };
        } else {
            error =  {
                name    : 'ServerError',
                message : config.message,
                code    : config.code
            };
        }

        return error;
    },

    /**
     * Invalid Params Error
     * 
     * @class WAF.classes.Rpc.error.InvalidParamsError
     */
    InvalidParamsError : function (config) {
        var error = {};

        config = config || {};
        if (typeof config !== 'object') {
            config = {};
        }

        // {String} message message of the error
        config.message = config.message || '';

        // {String} info more informations about the error
        config.data = config.data || '';

        // {String} code code of the error
        config.code = config.code || '-1';

        /**
         * @property name
         * @type String
         * @default "InvalidParamsError"
         */

        /**
         * @property message
         * @type String
         */

        /**
         * @property description
         * @type String
         */

        if (config.data) {
            error =  {
                name        : 'InvalidParamsError',
                message     : config.message,
                description : config.data,
                code        : config.code
            };
        } else {
            error =  {
                name    : 'InvalidParamsError',
                message : config.message,
                code    : config.code
            };
        }

        return error;
    },

    /**
     * Internal Error
     *
     * @class WAF.classes.Rpc.error.InternalError
     */
    InternalError : function (config) {
        var error;

        config = config || {};
        if (typeof config !== 'object') {
            config = {};
        }

        // {String} message message of the error
        config.message = config.message || '';

        // {String} data more informations about the error
        config.data = config.data || '';

        // {String} code code of the error
        config.code = config.code || '-1';

        /**
         * @property name
         * @type String
         * @default "InternalError"
         */

        /**
         * @property message
         * @type String
         */

        /**
         * @property description
         * @type String
         */

        if (config.data) {
            error =  {
                name        : 'InternalError',
                message     : config.message,
                description : config.data,
                code        : config.code
            };
        } else {
            error =  {
                name    : 'InternalError',
                message : config.message,
                code    : config.code
            };
        }

        return error;
    }
};


/**
 * rpc
 *
 * @class WAF.rpc
 */
WAF.rpc = {

    /**
     * transactions
     *
     * @static
     * @property transactions
     * @type Object
     * @default {}
     **/
    transactions: {},

    /**
     * Call to a rpc function
     *
     * @static
     * @method call
     * @param {Object} params parameters
     * @return {Object} result
     */
    call : function (params) {
        var rpc = null,
        wrpc = WAF.rpc,
        i = 0,
        argumentsLength = arguments.length,
        parameters = {};

        params.urlservice = params.urlservice || '/rpc/';

        if (typeof params === 'string') {

            if (argumentsLength > 0) {
                parameters.name = arguments[0];
                parameters.arguments = [];
                for (i = 1; i < argumentsLength; i += 1) {
                    parameters.arguments.push(arguments[i]);
                }
            }
            parameters.urlservice = parameters.urlservice || '/rpc/';
            params = parameters;
        }

        if (wrpc.transactions[params.urlservice]) {
            rpc = wrpc.transactions[params.urlservice];
        } else {
            rpc = new WAF.classes.Rpc(params);
            wrpc.transactions[params.urlservice] = rpc;
        }

        return rpc.call(params);
    },

    /**
     * Call to a rpc function
     *
     * @static
     * @method callAsync
     * @param {Object} params parameters
     * @return {WAF.classes.request} result
     */
    callAsync : function (params) {
        var
        rpc = null,
        wrpc = WAF.rpc,
        argumentsLength = arguments.length,
        parameters = {},
        i = 0;

        params.urlservice = params.urlservice || '/rpc/';

        if (typeof params === 'function') {
            if (argumentsLength > 1) {
                parameters.onsuccess = arguments[0];
                parameters.name = '';
                if (typeof arguments[1] === 'string') {
                    parameters.name = arguments[1];
                }
                parameters.arguments = [];
                for (i = 2; i < argumentsLength; i += 1) {
                    parameters.arguments.push(arguments[i]);
                }
            }
            parameters.urlservice = parameters.urlservice || '/rpc/';
            params = parameters;
        }

        if (wrpc.transactions[params.urlservice]) {
            rpc = wrpc.transactions[params.urlservice];
        } else {
            rpc = new WAF.classes.Rpc(params);
            wrpc.transactions[params.urlservice] = rpc;
        }

        return rpc.callAsync(params);
    },


    ProxyFactory : {
        
        /**
         * createProxy
         *
         * @class WAF.rpc.ProxyFactory.createProxy
         *
         * @constructor
         * @param {Object} params
         **/
        createProxy : function (params) {
            var method = '',
            i = 0,
            remoteproxy = {},
            functionName = '',
            argumentsParamsLength = 0,
            root = WAF._private.globals.root;

            params = params || {};
            if (typeof params !== 'object') {
                params = {};
            }

            // {Object} description description of the interface in JSON SCHEMA
            params.description = params.description || {};

            // {String} urlservice url of the RPC service
            params.urlservice = params.urlservice || {};

            // {String} requesttype type of the request
            params.requesttype = params.requesttype || 'ajax';

            // {String} messagetype type of the message
            params.messagetype = params.messagetype || 'json';

            // {String} namespace namespace of the methods
            params.namespace = params.namespace || '';

            // {Array} methods list of methods to implement
            params.methods = params.methods || [];

            // {Boolean} messagevalidation check message
            if (typeof params.messagevalidation === 'undefined') {
                params.messagevalidation = true;
            }

            /**
             * Create a interface with synchronous call to the rpc service
             *
             *
             * @private
             * @method implementsInterfaceSync
             * @param {String} name name of the function
             * @param {Object} parameters parameters
             */
            function implementsInterfaceSync(name, parameters) {
                parameters = parameters || {};
                if (typeof parameters !== 'object') {
                    parameters = {};
                }

                // {String} name name of the method to create
                name = name || '';

                // {String} description description of the service
                parameters.description = parameters.description || '';

                // {String} type type of the service
                parameters.type        = parameters.type || '';

                // {String} returns type of the result (if any)
                parameters.returns     = parameters.returns || [];

                // {String} params parameters of the method
                parameters.params      = parameters.params || [];

                return function () {
                    var
                    result = '',
                    message = {},
                    request = {},
                    i = 0,
                    argumentsLength = 0,
                    wrpc = WAF.rpc;
                                     
                    if (params.messagevalidation) {

                        // check parameters
                        if (arguments.length !== parameters.params.length) {
                            throw wrpc.ErrorFactory.createError({
                                code    : '-32603',
                                message : 'wrong number of parameters (' + arguments.length + ' instead of ' + parameters.params.length + ')'
                            });
                        }

                        argumentsLength = arguments.length;
                        for (i = 0; i < argumentsLength; i += 1) {
                            if (parameters.params[i].type !== undefined && typeof(arguments[i]) !== parameters.params[i].type) {
                                throw wrpc.ErrorFactory.createError({
                                    code    : '-32603',
                                    message : 'wrong type for parameter ' + arguments[i] + ' (' + typeof(arguments[i]) + ' instead of ' + parameters.params[i].type + ')'
                                });
                            }                            
                        }
                    }

                    request = wrpc.RequestFactory.createRequest({
                        url         : params.urlservice,
                        isasync     : false,
                        messagetype : params.messagetype
                    });
                    request.init();

                    message = wrpc.MessageFactory.createMessage({
                        name        : name,
                        arguments   : arguments,
                        messagetype : params.messagetype
                    });

                    message = JSON.stringify(message);

                    result = request.send({
                        'message' : message
                    });

                    if (result !== undefined) {
                        if ((result !== null) && (result.error !== undefined)) {
                            if (result.error.data) {
                                throw wrpc.ErrorFactory.createError({
                                    code    : result.error.code,
                                    message : result.error.message,
                                    data    : result.error.data
                                });
                            } else {
                                throw wrpc.ErrorFactory.createError({
                                    code    : result.error.code,
                                    message : result.error.message
                                });
                            }
                        } else {
                            if (params.messagevalidation) {
                                if ((typeof result !== parameters.returns) && (typeof parameters.returns !== 'undefined') && (parameters.returns.length !== 0)) {
                                    throw wrpc.ErrorFactory.createError({
                                        code    : '-32602',
                                        message : 'invalid return type (' + typeof result + ' instead of ' + parameters.returns + ')'
                                    });
                                } else {
                                    return result;
                                }
                            } else {
                                return result;
                            }
                        }
                    } else {
                        return true;
                    }
                };
            }

            /**
             * Create a interface with synchronous call to the rpc service
             *
             * @private
             * @method implementsInterfaceAsync
             * @param {String} name name of the function
             * @param {Object} parameters parameters
             */
            function implementsInterfaceAsync (name, parameters) {
                parameters = parameters || {};
                if (typeof parameters !== 'object') {
                    parameters = {};
                }

                // {String} name name of the method to create
                name = name || '';

                // {String} description description of the service
                parameters.description = parameters.description || '';

                // {String} type type of the service
                parameters.type        = parameters.type || '';

                // {String} returns type of the result (if any)
                parameters.returns     = parameters.returns || '';

                // {String} params parameters of the method
                parameters.params      = parameters.params || [];

                return function () {
                    var message = {},
                    request = {},
                    i = 0,
                    nbOptionalParams = 0,
                    tabArguments = [],
                    argumentsLength = 0,
                    wrpc = WAF.rpc,
                    tabArgs= [],
                    error = {},
                    isError = false;

                    // cast params in array
                    if (arguments[0].params) {                                            
                        if (arguments[0].params.constructor !== Array) {
                            tabArgs.push(arguments[0].params);
                            arguments[0].params = tabArgs;                            
                        }
                        argumentsLength = arguments[0].params.length;
                    }
                    
                    // allow onError/onerror & onSuccess/onsuccess
                    if (typeof arguments[0].onSuccess !== 'undefined') {
                        arguments[0].onsuccess = arguments[0].onSuccess;
                    }
                    if (typeof arguments[0].onError !== 'undefined') {
                        arguments[0].onerror = arguments[0].onError;
                    }                    

                    if (params.messagevalidation) {

                        // check parameters
                        if (arguments[0].onsuccess || arguments[0].onerror || (typeof arguments[0] === 'function')) {
                            nbOptionalParams += 1;
                        }

                        if (arguments[0].params) {
                            if (argumentsLength !== parameters.params.length) {
                                error = wrpc.ErrorFactory.createError({
                                    code    : '-32603',
                                    message : 'wrong number of parameters (' + argumentsLength + ' instead of ' + parameters.params.length + ')'
                                });
                                if (arguments[0].onerror) {
                                    arguments[0].onerror(error);
                                    isError = true;
                                } else {
                                    throw error;
                                }
                            }
                            if (!isError) {
                                for (i = 0; i < argumentsLength; i += 1) {
                                    if (parameters.params[i].type !== undefined && typeof(arguments[0].params[i]) !== parameters.params[i].type) {
                                        error = wrpc.ErrorFactory.createError({
                                            code    : '-32603',
                                            message : 'wrong type for parameter ' + arguments[0].params[i] + ' (' + typeof(arguments[0].params[i]) + ' instead of ' + parameters.params[i].type + ')'
                                        });
                                        if (arguments[0].onerror) {
                                            arguments[0].onerror(error);
                                            isError = true;
                                            break;
                                        } else {
                                            throw error;
                                        }
                                    }
                                }
                            }
                        } else {
                            if ((arguments.length - nbOptionalParams) !== parameters.params.length) {
                                error = wrpc.ErrorFactory.createError({
                                    code    : '-32603',
                                    message : 'wrong number of parameters (' + arguments.length + ' instead of ' + parameters.params.length + ')'
                                });
                                if (arguments[0].onerror) {
                                    arguments[0].onerror(error);
                                    isError = true;
                                } else {
                                    throw error;
                                }
                            }
                            if (!isError) {
                                argumentsLength = arguments.length - nbOptionalParams;
                                for (i = 0; i < argumentsLength; i += 1) {
                                    if (parameters.params[i].type !== undefined && typeof(arguments[i + nbOptionalParams]) !== parameters.params[i].type) {
                                        error = wrpc.ErrorFactory.createError({
                                            code    : '-32603',
                                            message : 'wrong type for parameter ' + arguments[i + nbOptionalParams] + ' (' + typeof(arguments[i + nbOptionalParams]) + ' instead of ' + parameters.params[i].type + ')'
                                        });
                                        if (arguments[0].onerror) {
                                            arguments[0].onerror(error);
                                            isError = true
                                        } else {
                                            throw error;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (!isError) {
                        request = wrpc.RequestFactory.createRequest({
                            url         : params.urlservice,
                            messagetype : params.messagetype
                        });
                        request.init();

                        if (typeof arguments[0] === 'function') {
                            arguments[0].onsuccess = arguments[0];
                        }

                        if (arguments[0].onsuccess || arguments[0].onerror || arguments[0].params) {

                            if (arguments[0].params && arguments.length === 1) {
                                message = wrpc.MessageFactory.createMessage({
                                    name        : name,
                                    arguments   : arguments[0].params,
                                    messagetype : params.messagetype
                                });
                            } else {
                                argumentsLength = arguments.length;
                                for (i = 0; i < argumentsLength; i += 1) {
                                    tabArguments[i - 1] = arguments[i];
                                }
                                message = wrpc.MessageFactory.createMessage({
                                    name        : name,
                                    arguments   : tabArguments,
                                    messagetype : params.messagetype
                                });
                            }

                            message = JSON.stringify(message);
                            if (params.messagevalidation) {
                                request.send({
                                    message    : message,
                                    onsuccess  : arguments[0].onsuccess,
                                    onerror    : arguments[0].onerror,
                                    returntype : parameters.returns
                                });
                            } else {
                                request.send({
                                    message   : message,
                                    onsuccess : arguments[0].onsuccess,
                                    onerror   : arguments[0].onerror
                                });
                            }
                        } else {
                            message = wrpc.MessageFactory.createMessage({
                                name        : name,
                                arguments   : arguments,
                                messagetype : params.messagetype
                            });
                            message = JSON.stringify(message);
                            if (params.messagevalidation) {
                                request.send({
                                    message    : message,
                                    returntype : parameters.returns
                                });
                            } else {
                                request.send({
                                    message    : message,
                                    returntype : parameters.returns
                                });
                            }
                        }
                        return request;
                    }
                };
            }

            if (params.namespace) {
                if (typeof root[params.namespace] === 'undefined') {
                    root[params.namespace] = {};
                }
                remoteproxy = root[params.namespace];
            } else {
                remoteproxy = root;
            }

            if (params.messagevalidation) {
                // implementation of the methods
                for (functionName in params.description )  {
                    if (typeof(params.description[functionName]) !== 'string') {
                        remoteproxy[functionName] = implementsInterfaceSync(functionName, params.description[functionName]);
                        remoteproxy[functionName + 'Async'] = implementsInterfaceAsync(functionName, params.description[functionName]);
                    }
                }
            } else {
                // case specified methods name (we create only proxies on demands)
                if (params.methods.length > 0) {
                    argumentsParamsLength = params.methods.length;
                    for (i = 0; i < argumentsParamsLength; i += 1) {
                        functionName = params.methods[i];
                        remoteproxy[functionName] = implementsInterfaceSync(functionName);
                        remoteproxy[functionName + 'Async'] = implementsInterfaceAsync(functionName);
                    }    
                } else {
                    for (functionName in params.description )  {
                        if (typeof(params.description[functionName]) !== 'string') {
                            remoteproxy[functionName] = implementsInterfaceSync(functionName, params.description[functionName]);
                            remoteproxy[functionName + 'Async'] = implementsInterfaceAsync(functionName, params.description[functionName]);
                        }    
                    }
		
                }
            }

            return remoteproxy;
        }
    },

    /**
     * Error Factory
     *
     * @class WAF.rpc.ErrorFactory
     */
    ErrorFactory : {

        /**
         * Create an error
         * 
         * @static
         * @method createError
         * @param {Object} params
         */
        createError : function (params) {
            var error = WAF.classes.Rpc.error;

            params = params || {};
            if (typeof params !== 'object') {
                params = {};
            }

            // {String} code code of the error
            params.code = params.code || '-1';

            switch (params.code) {
                case '-32601':
                    return new error.MethodNotFoundError(params);
                case '-32602':
                    return new error.InvalidParamsError(params);
                case '-32603':
                    return new error.InternalError(params);
                default:
                    return new error.ServerError(params);
            }
        }
    },

    /**
     * Message Factory
     *
     * @class WAF.rpc.MessageFactory
     */
    MessageFactory : {

        /**
         * Create a message
         * 
         * @static
         * @method createMessage
         * @param {Object} params parameters
         */
        createMessage : function (params) {
            var message = WAF.classes.Rpc.message;

            params = params || {};
            if (typeof params !== 'object') {
                params = {};
            }

            // {String} type type of the message
            params.messagetype = params.messagetype || 'json';

            switch (params.messateType) {
                case 'json':
                    return new message.JsonMessage(params);
                case 'xml':
                    return new message.XmlMessage(params);
                default:
                    return new message.JsonMessage(params);
            }
        }
    },

    /**
     * Request Factory
     *
     * @class WAF.rpc.RequestFactory
     */
    RequestFactory : {

        /**
         * Create a request
         *
         * @static
         * @method createRequest
         * @param {Object} params parameters
         */
        createRequest : function (params) {
            var request = WAF.classes.Rpc.request;

            params = params || {};
            if (typeof params !== 'object') {
                params = {};
            }

            // {String} type type of the request
            params.type = params.type || 'http';

            switch (params.type) {
                case 'http':
                    return new request.HttpRequest(params);
                case 'jsonp':
                    return new request.ScriptTagRequest(params);
                default:
                    return new request.HttpRequest(params);
            }
        }
    }
};

// load meta parameters
(function (WAF) {
    var rpc = null,
    methods = [],
    namespace  = '',
    messageValidation = false;
    
    if (WAF.config) {
        if (WAF.config.rpc) {
            
            messageValidation = WAF.config.rpc.validation;
            if (typeof messageValidation === 'undefined') {
                messageValidation = false;
            }
            rpc = new WAF.classes.Rpc({
                messageValidation: messageValidation
            });
            
            if (typeof WAF.config.rpc === 'string') {
                try {
                    rpc.getInterfaces({
                        conf: JSON.parse(WAF.config.rpc.replace(/'/g, '\"'))
                    });
                } catch (e) {}
            } else {
                methods = WAF.config.rpc.methods || WAF.config.rpc.module;
                namespace = WAF.config.rpc.namespace;
                
                if (methods && methods.length > 0) {
                    rpc.getInterfaces({
                        methods  : methods.split(','),
                        namespace: namespace
                    });
                } else {           
                    if (namespace && namespace.length > 0) {
                        rpc.getInterfaces({
                            namespace: namespace
                        });                    
                    }
                }
            }
            
        }
    }
}(WAF));
