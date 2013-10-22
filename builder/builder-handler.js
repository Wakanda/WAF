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
function builder_handler_waf_build(request,response){
    
    var type, urlPath, i,
        wafFilePath = getWalibFolder().path+"WAF/",
        urlInfos,
        buildList,
        build,
        needSend = true,
        output, error = "",
        lastModifiedDate,
        urlHelper, modulePackage, moduleBuild;
    
    try{
    
        //load urlHelper
        urlHelper   = require(wafFilePath+'builder/builder-urlHelper/urlHelper');
        urlInfos    = urlHelper.getInfos(request);
        
        //quirks mode (profiling test needs for ricardo
        if(urlInfos.hardCache === true){
            response.headers["Pragma"] = "";
            response.allowCompression(1024, 50000000); // 50 mega max for compression
            var __storage = storage.getItem('buildsStorage');
            if(__storage[urlInfos.urlPath+'.'+urlInfos.type]){
            response.headers["Content-Type"] = urlInfos.contentType;
                response.statusCode = 200;
                response.body = "/** From hard cache */\n\n"+__storage[urlInfos.urlPath+'.'+urlInfos.type].output;
            }
            else{
                throw new Error("Resource \""+urlInfos.urlPath+'.'+urlInfos.type+"\" not in cache yet, please try withiut the ?hardCache=1 to create the cache in the first place");
            }
        }
        //end quirks mode

        else{

            //load package and get the build list
            modulePackage = require(wafFilePath+'builder/builder-package/package');
            //lock the storage before the first access until the very last one
            storage.lock();//@todo check
            buildList     = modulePackage.buildList(urlInfos.packageJsonUrlPath);

            //process the buildList (in debug or in release mode)
            if(!urlInfos.debug){
                //load build module and get the build from the build list
                moduleBuild     = require(wafFilePath+'builder/builder-build/build');

                //make the builds and cache them
                moduleBuild.makeBuilds(buildList, urlInfos.urlPath);

                //retrieve the builds from cache
                build               = moduleBuild.getBuildFromCache(buildList, urlInfos.urlPath, urlInfos.type);
                //from now we don't access storage anymore
                storage.unlock();//@todo check
                lastModifiedDate    = new Date(build.lastModifiedDate);
                //if the browser has already a version more recent (or exactly the same date) of the one on the server, the server tells him to use its cache by returning a http 304
                if(!build.forceDisableBrowserCache && request.headers["If-Modified-Since"] && (new Date(request.headers["If-Modified-Since"])).getTime() >= lastModifiedDate.getTime()){
                    needSend = false;
                }
                else{
                    needSend        = true;
                    output          = build.output;
                }
            }
            else{
                //from now we don't access storage anymore
                storage.unlock();//@todo check
                //in debug, always return a 200 with a lastModifiedDate date at now to force cache
                needSend                 = true;
                //output                   = JSON.stringify(modulePackage.buildListToDebugList(buildList));//uncomment this line (to get correct, non beautified JSON)
                output                   = JSON.stringify(modulePackage.buildListToDebugList(buildList), null, "\t");//comment this line
                urlInfos.contentType     = "application/javascript"; //force contentType
                urlInfos.type            = "js"; //force type
//                lastModifiedDate         = new Date();
            }

            //specify response body
            response.body = "/** Response generated at "+((new Date()).toUTCString())+"*/\n\n"+output;

            //specify response headers
            response.headers["Content-Type"] = urlInfos.contentType;
            response.headers["Pragma"] = "";

            if(needSend){
                response.statusCode = 200;
                response.allowCompression(1024, 50000000); // 50 mega max for compression
                if(lastModifiedDate){
                    response.headers["Last-Modified"] = lastModifiedDate.toUTCString();
                }
                var expireDate = new Date();
            }
            else{
                //@todo make a correct http 304 routine
                response.statusCode = 304;
            }

        }
    
    }
    //an error occured
    catch(e){
        //unock the storage if there was any exception
        storage.unlock();
        response.statusCode = 500;
        response.headers["Content-Type"] = "text/plain";
        response.body       = e.message;//@todo don't leak in production
    }
    
}

function builder_handler_waf_reset_build_cache(request,response){
    
    storage.lock();
    storage.setItem('buildsStorage', {});
    storage.setItem('packageList', {});
    storage.unlock();
    
    return "Cache reseted";
    
}