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
            'js' : {"name" : 'waf-build.js', "contentType" : "application/javascript"},
            'css': {"name" : 'waf-build.css', "contentType" : "text/css; charset=UTF-8"}
        },
        debugUrlQuery   = 'debug=1',
        hardCacheQuery  = 'hardCache=1';
    
    UrlHelper = {
        
        getInfos: function(request){
            
            var urlPath, referer, contentType, type, debug = false, packageJsonUrlPath, hardCache = false,
                i;

            urlPath = request.urlPath;
            referer = request.headers.REFERER;
            
            //cleanup url (remove the name of the handler) and set the type (js or css) and the contentType
            for(i in handlersName){
                if(urlPath.indexOf(handlersName[i].name) > -1){
                    urlPath     = urlPath.replace(handlersName[i].name,'');
                    type        = i;
                    contentType = handlersName[i].contentType;
                    break;
                }
            }
            //if called directly (such as toto.waPage/toto.html/waf-build.js ) for test purpose
            if(!referer){
                referer = urlPath.replace(/(\/)$/,function(match){return '';});
                if(request.urlQuery === debugUrlQuery){
                    debug = true;
                }
                else if(request.urlQuery === hardCacheQuery){
                    hardCache = true;
                }
            }

            //test if debug mode + remove ?debug=1 from the referer
            referer = referer.replace(/(\?debug=1)$/,function(match){
                if(match === '?'+debugUrlQuery){
                    debug = true;
                }
                return '';
            });

            //test if hardCache mode + remove ?hardCache=1 from the referer
            referer = referer.replace(/(\?hardCache=1)$/,function(match){
                if(match === '?'+hardCacheQuery){
                    hardCache = true;
                }
                return '';
            });
            
            //use the resolveURL api here with urlPath and referer (url, 'relativePath', 'posix')
            referer = referer.replace(/^(https:\/\/|http:\/\/)/,function(match){return '';});
            referer = referer.replace((new RegExp('^'+request.headers.HOST)),function(match){return '';});
            //@todo remove when all the builds will be up to date with the method request.resolveURL
            if(request.resolveURL){
                referer = '/'+request.resolveURL(referer, 'relativePath', 'posix');
            }
            
            //find the matching package.json
            packageJsonUrlPath = referer ? referer.replace(/(.htm|.html)$/,function(match){return '.package.json';}) : null;
            
            return {
                "urlPath"               : referer,
                "type"                  : type,
                "contentType"           : contentType,
                "debug"                 : debug,
                "hardCache"             : hardCache,
                "packageJsonUrlPath"    : packageJsonUrlPath
            };
            
        }
        
    };
    
    return UrlHelper;
    
})();