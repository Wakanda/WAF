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
 * @module urlHelper
 */
module.exports = (function(){
    
    var UrlHelper,
        handlersName = {
            'js' : {"name" : '~waf-build.js', "contentType" : "application/javascript"},
            'css': {"name" : '~waf-build.css', "contentType" : "text/css; charset=UTF-8"},
            'custom' : {"name" : '~waf-build.custom', "contentType" : "application/json"}
        };
        
    var getPathFromRequest = function(request){
                
        var path;
        //match the path parameter (by default to WEBFOLDER if not set)
        path = request.urlQuery.match(/path=([^&]*)/);
        if(path){
            path = path[1];
        }
        else{
            path = "WEBFOLDER";
        }
        return path;
        
    };
    
    UrlHelper = {
        
        getInfos: function(request){
            
            var urlPath, referer, contentType, type, debug = false, packageJsonUrlPath, pattern, i, useReferer, path, hostRegex;

            urlPath = request.urlPath;
            referer = request.headers.REFERER ? request.headers.REFERER.replace(/%20/g, ' ') : request.headers.REFERER;
            
            //cleanup url (remove the name of the handler) and set the type (js or css) and the contentType
            for(i in handlersName){
                if(urlPath.indexOf(handlersName[i].name) > -1){
                    urlPath     = urlPath.replace(handlersName[i].name,'');
                    type        = i;
                    contentType = handlersName[i].contentType;
                    break;
                }
            }

            if(referer){

                //test if debug mode
                pattern = /((|&)debug=1)/;
                if(referer.match(pattern)){
                    debug = true;
                }

                // if useReferer == 1 , find the package.json relative to the referer (don't take account the generated url before ~waf-build.*)
                if(request.urlQuery.match(/useReferer=1/)){
                    
                    //use the resolveURL api here with urlPath and referer (url, 'relativePath', 'posix')
                    referer = referer.split('?')[0];

                    // remove protocol/port and only get relative part from referer
                    // we cannot use hostRegex since host and referer can have different domain name (if a proxy is used for eg.)
                    // fixes #WAK0089221
                    referer = referer.replace(/^(https?:\/\/.+?)((?:\/[^?].*?)|(?:\/))?(\?.*)?$/g, '$2') || "/";

                    referer = request.resolveURL(referer, 'relativePath', 'posix');
                    
                    useReferer = true;
                    packageJsonUrlPath = referer.replace(/(.html)$/,"")+".package.json";
                }
                
            
            }
            //test for debug mode
            if(request.urlQuery.match(/((|&)debug=1)/)){
                debug = true;
            }
            //match the path parameter (by default to WEBFOLDER if not set)
            path = getPathFromRequest(request);
            
            if(!useReferer){
                //find the matching package.json according to the url before the token ~waf-build.*
                packageJsonUrlPath = urlPath.replace(/~waf-build?(.js|.css)$/,'').replace(/^\//,'');
            }
                
            //specific to webComponent testing in standalone
            if(path === "WALIB"){
                packageJsonUrlPath = packageJsonUrlPath.replace('walib/','')
                referer = urlPath.replace('walib/','');
            }
            else if(path === "WAF"){
                packageJsonUrlPath = packageJsonUrlPath.replace('walib/WAF/','')
                referer = urlPath.replace('walib/WAF/','');
            }

            return {
                "urlPath"               : referer,
                "type"                  : type,
                "contentType"           : contentType,
                "debug"                 : debug,
                "packageJsonUrlPath"    : packageJsonUrlPath,
                "path"                  : path
            };
            
        }
        
    };
    
    return UrlHelper;
    
})();
