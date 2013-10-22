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
* add the request handler in order to handle all incoming request for builder
*   - in the near future : all the request finishing by waf-build.js or waf-build.css
*   - for the moment, only adds tests hanlders (see WAF/builder/builder-handler.js)
@ module builder-service
*
* Temporary to test : go to the Settings file of your project and add (with the correct absolute path) :
* <service name="Builder handler" modulePath="/Users/Rosset/workspace/perforce/depot/Wakanda/main/walib/WAF/builder/builder-service" enabled="true"/>
*/
exports.postMessage = function (message) {
    
        var wafFilePath = getWalibFolder().path+"WAF/";
        /**
         * wpm-build.js
         * wpm-build.css
         */
        
        if (message.name === 'applicationWillStart') {
            application.addHttpRequestHandler('/simple$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_simple');
        }
        else if (message.name === 'applicationWillStop') {
            application.removeHttpRequestHandler('/simple$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_simple');
        }
        
        if (message.name === 'applicationWillStart') {
            application.addHttpRequestHandler('(.*?(waf-build?(.js|.css))(/*))$',wafFilePath+'builder/builder-handler.js', 'builder_handler_waf_build');
        }
        else if (message.name === 'applicationWillStop') {
            application.removeHttpRequestHandler('(.*?(waf-build?(.js|.css))(/*))$',wafFilePath+'builder/builder-handler.js', 'builder_handler_waf_build');
        }
        
        if (message.name === 'applicationWillStart') {
            application.addHttpRequestHandler('/waf-reset-build-cache$',wafFilePath+'builder/builder-handler.js', 'builder_handler_waf_reset_build_cache');
        }
        else if (message.name === 'applicationWillStop') {
            application.removeHttpRequestHandler('/waf-reset-build-cache$',wafFilePath+'builder/builder-handler.js', 'builder_handler_waf_reset_build_cache');
        }
        
        /**
         * /wpm
         */
        
        if (message.name === 'applicationWillStart') {
            application.addHttpRequestHandler('^/wpm$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_wpm');
        }
        else if (message.name === 'applicationWillStop') {
            application.removeHttpRequestHandler('^/wpm$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_wpm');
        }
        
        /**
         * /buildList
         */
        
        if (message.name === 'applicationWillStart') {
            application.addHttpRequestHandler('^/buildList$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_buildList');
        }
        else if (message.name === 'applicationWillStop') {
            application.removeHttpRequestHandler('^/buildList$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_buildList');
        }
        
        /**
         * /build
         */
        
        if (message.name === 'applicationWillStart') {
            application.addHttpRequestHandler('^/build$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_build');
        }
        else if (message.name === 'applicationWillStop') {
            application.removeHttpRequestHandler('^/build$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_build');
        }
        
        /**
         * /getPackageList
         */
        
        if (message.name === 'applicationWillStart') {
            application.addHttpRequestHandler('^/getPackageList',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandler_getPackageList');
        }
        else if (message.name === 'applicationWillStop') {
            application.removeHttpRequestHandler('^/getPackageList',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandler_getPackageList');
        }
        
        /**
         * /getPackage
         */
        
        if (message.name === 'applicationWillStart') {
            application.addHttpRequestHandler('^/getPackage',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandler_getPackage');
        }
        else if (message.name === 'applicationWillStop') {
            application.removeHttpRequestHandler('^/getPackage',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandler_getPackage');
        }
        
        /**
         * /ricardo
         */
        
        if (message.name === 'applicationWillStart') {
            application.addHttpRequestHandler('^/ricardo$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_ricardo');
        }
        else if (message.name === 'applicationWillStop') {
            application.removeHttpRequestHandler('^/ricardo$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_ricardo');
        }
        
        /**
         * /ricardo
         */
        
        if (message.name === 'applicationWillStart') {
            application.addHttpRequestHandler('^/ricardoMock$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_ricardoMock');
        }
        else if (message.name === 'applicationWillStop') {
            application.removeHttpRequestHandler('^/ricardoMock$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_ricardoMock');
        }
        
        /**
         * /ricardo
         */
        
        if (message.name === 'applicationWillStart') {
            application.addHttpRequestHandler('^/ricardoReal$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_ricardoReal');
        }
        else if (message.name === 'applicationWillStop') {
            application.removeHttpRequestHandler('^/ricardoReal$',wafFilePath+'builder/tests/simple-handlers.js', 'simpleHandlers_ricardoReal');
        }

};