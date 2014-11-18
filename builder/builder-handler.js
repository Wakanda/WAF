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
    
    var wafFilePath = getWalibFolder().path+"WAF/",
        urlInfos,
        buildList,
        build,
        needSend = true,
        output,
        builderServiceName = "Builder handler",
        BUILDS_STORAGE_KEY  = 'buildsStorage',  //used only in hardCache mode
        buildFromStorage,                       //used only in hardCache mode
        hardCacheMode = false,
        builderServiceSettings,
        doNotMinify = false,
        cppTeamDebugMode = (process.productType === "debug" ? true : false),
        urlHelper, modulePackage, moduleBuild,
        moduleBuildCores = require(wafFilePath+'builder/builder-build/build-cores'),
        builderLogger    = require(wafFilePath+"builder/builder-logger")(),
        tmpFilePath,
        processCacheHeaders,
        customMode = false,
        WPMForCustomMode;//WPM only required in customMode

    processCacheHeaders = function(build){
        //if the browser has already the same version of build on the server, the server tells him to use its cache by returning an http 304
        if(request.headers["If-None-Match"] === build.hashCode){
            needSend        = false;
        }
        else{
            needSend        = true;
            output          = build.output;
        }
        //add the max-age to Cache-control (only if exists)
        if(builderServiceSettings && builderServiceSettings['max-age'] > 0){
            response.headers["Cache-Control"] = "max-age="+builderServiceSettings['max-age'];
            //allways return 200
            needSend        = true;
            output          = build.output;
        }
    };

    try{
        //retrieve builder settings
        builderServiceSettings = application.settings.getItem('services')[builderServiceName];
        
        //init doNotMinify
        if(cppTeamDebugMode){
            doNotMinify = true;
        }
        else if(builderServiceSettings && builderServiceSettings["doNotMinify"]){
            doNotMinify = builderServiceSettings["doNotMinify"] === "true" || builderServiceSettings["doNotMinify"] === true ? true : false;
        }
        
        //if no core.min files, create them, add there definition to the package definition storage (used in the first call after server start or core.min flush)
        //maybe use mutex over storage.tryLock()
        if(cppTeamDebugMode === false && storage.tryLock()){
            if(moduleBuildCores.minCoresFilesExist() === false){
                builderLogger('==== CORE.MIN > no core.min files > creating them ====');
                moduleBuildCores.makeMinCoresFiles(doNotMinify);
            }
            else{
                builderLogger('==== CORE.MIN > core.min files already here ====');
            }
            storage.unlock();
        }
    
        //load urlHelper
        urlHelper   = require(wafFilePath+'builder/builder-urlHelper/urlHelper');
        urlInfos    = urlHelper.getInfos(request);
        customMode  = urlInfos.type === "custom" ? true : false;
        
        //if a serverside debugger is attached, force to ?debug=1 beaviour
        if(!urlInfos.debug && internal.getDebuggerServer() !== 1024 && customMode === false){
            urlInfos.debug = true;
        }

        //try the hardCache way
        if(!urlInfos.debug && builderServiceSettings && builderServiceSettings["hardCache"] === "true" && customMode === false){
            //no storage lock !
            buildFromStorage = storage.getItem(BUILDS_STORAGE_KEY);
            tmpFilePath = "/"+urlInfos.path+"/"+urlInfos.packageJsonUrlPath+"."+urlInfos.type;
            if(buildFromStorage && buildFromStorage[tmpFilePath]){
                build = buildFromStorage[tmpFilePath];
                hardCacheMode = true;
                response.headers["Wakanda-hardCache-response"] = "On";
                processCacheHeaders(build);
                builderLogger('hardcache - found : '+ tmpFilePath);
            }
            else{
                hardCacheMode = false;
            }
        }

        if(hardCacheMode === false){

            //load package and get the build list
            modulePackage = require(wafFilePath+'builder/builder-package/package');
            //load build module and get the build from the build list
            moduleBuild     = require(wafFilePath+'builder/builder-build/build');
            //lock the storage before the first access until the very last one
            storage.lock();
            buildList     = modulePackage.buildList(urlInfos.packageJsonUrlPath, urlInfos.path, urlInfos.debug);

            if(customMode){
                WPMForCustomMode = require(wafFilePath+'builder/WPM/WPM');
                //@todo ricardo specify here which method you want to call
                output = JSON.stringify(WPMForCustomMode.getPackageList(urlInfos.packageJsonUrlPath, urlInfos.path, undefined, undefined, "force", storage.getItem('wafPackagesDefinitionStorage') ) , null, "\t");
                needSend = true;
                //provide a build object with a random hashcode inside to keep up with the ETag and cache routine
                build = {
                    hashCode : (new Date()).getTime()+Math.random()
                };
                storage.unlock();
            }
            //process the buildList (in debug or in release mode)
            else if(!urlInfos.debug){

                //make the builds and cache them
                moduleBuild.makeBuilds(buildList, urlInfos.packageJsonUrlPath, urlInfos.path, undefined, doNotMinify);

                //retrieve the builds from cache
                build               = moduleBuild.getBuildFromCache(buildList, urlInfos.packageJsonUrlPath, urlInfos.path, urlInfos.type);
                //from now we don't access storage anymore
                storage.unlock();
                processCacheHeaders(build);
            }
            else{
                //from now we don't access storage anymore
                storage.unlock();
                //in debug, always return a 200 with a lastModifiedDate date at now to force cache
                needSend = true;
                if(urlInfos.type === "css"){
                    //don't return any css in debug (evrything is in js)
                    output = "";
                }
                else{
                    output = moduleBuild.makeBuilds(buildList, urlInfos.packageJsonUrlPath, urlInfos.path, true, doNotMinify);
                }
            }
        
        }

        //specify response body
        response.body = (customMode === false ? "/** Response generated at "+((new Date()).toUTCString())+(hardCacheMode ? " (response directly from hardCache) " : "")+"*/\n\n" : "") +output;

        //specify response headers
        response.headers["Content-Type"]    = urlInfos.contentType;
        response.headers["Pragma"]          = "";

        if(needSend){
            response.statusCode = 200;
            response.allowCompression(1024, 50000000); // 50 mega max for compression
            if(urlInfos.debug === false){
                response.headers["ETag"] = build.hashCode; // send hashCode of the build as an ETag to manage browser cache http 304
            }
        }
        else{
            response.statusCode = 304;
            response.body       = "";
        }
    
    }
    //an error occured
    catch(e){
        //unock the storage if there was any exception
        storage.unlock();
        response.statusCode                 = 500;
        response.headers["Content-Type"]    = "text/plain";
        var errorMessage = e.message+" in "+e.sourceURL+" on line "+e.line;
        console.error(errorMessage);
        response.body                       = errorMessage;//@todo don't leak in production
    }
    
}

function builder_handler_waf_reset_build_cache(request,response){
    
    var wafFilePath = getWalibFolder().path+"WAF/",
        WAF_PACKAGES_DEFINITION_STORAGE_KEY  = 'wafPackagesDefinitionStorage',
        modulePackage,
        moduleBuild,
        moduleBuildInit,
        moduleBuildCores,
        builderServiceName = "Builder handler",
        builderServiceSettings,
        doNotMinify = false,
        output = "",
        statusCode = 200,
        specifyTimestamp = true;
    
    //retrieve builder settings
    builderServiceSettings = application.settings.getItem('services')[builderServiceName];

    //init doNotMinify
    if(builderServiceSettings && builderServiceSettings["doNotMinify"]){
        doNotMinify = builderServiceSettings["doNotMinify"] === "true" || builderServiceSettings["doNotMinify"] === true ? true : false;
    }
                
    storage.lock();
    storage.setItem('buildsStorage', {});
    storage.setItem('packageList', {});
    console.log('>RESET CACHE - cache reseted');
    output += "RESET CACHE - cache reseted";
    
    try{
        
        if(request.urlQuery.match(/(specifyTimestamp=0)/)){
            specifyTimestamp = false;
        }
        
        if(request.urlQuery.match(/(minifyCores=1)/)){
            moduleBuildCores = require(wafFilePath+'builder/builder-build/build-cores');
            moduleBuildCores.flushMinCoresFiles();
            output += "\n\nRESET CACHE - core.min files removed";
            console.log('>RESET CACHE - core.min files removed');
            moduleBuildCores.makeMinCoresFiles(doNotMinify,specifyTimestamp,false);
            output += "\n\nRESET CACHE - core.min files created + core.min packages definition reinitialized for WPM";
            console.log('>RESET CACHE - core.min files created + core.min packages definition reinitialized for WPM');            
        }
        else if(request.urlQuery.match(/(fullDebug=1)/)){
            moduleBuildCores = require(wafFilePath+'builder/builder-build/build-cores');
            if(moduleBuildCores.minCoresFilesExist() === false){
                moduleBuildCores.makeMinCoresFiles(doNotMinify,specifyTimestamp,true);
                output += "\n\nRESET CACHE - no core.min files found > core.min files created + core packages definition (dev version) reinitialized for WPM";
                console.log('>RESET CACHE - no core.min files found > core.min files created + core packages definition (dev version) reinitialized for WPM');
            }
            else{
                output += "\n\nRESET CACHE - core.min files already exist > core packages definition (dev version) reinitialized for WPM";
                console.log('>RESET CACHE - core.min files already exist > core packages definition (dev version) reinitialized for WPM');
                storage.setItem(WAF_PACKAGES_DEFINITION_STORAGE_KEY,moduleBuildCores.getPackagesDefinitionStorage(true));
            } 
        }
        else{
            moduleBuildInit = require(wafFilePath+'builder/builder-init');
            moduleBuildInit.init();
            output += "\n\nRESET CACHE - package definition reinitialized for WPM";
            console.log('>RESET CACHE - package definition reinitialized for WPM');
        }
    
    }
    catch(e){
        storage.unlock();
        console.error('>RESET CACHE - ERROR : ',e.message);
        output = "An error has occured : "+e.message+"\n\n"+output;
    }
    
    storage.unlock();
    
    response.statusCode                 = statusCode;
    response.headers["Content-Type"]    = "text/plain";
    response.body                       = output;
    
}

function builder_handler_waf_build_state(request,response){
    
    var wafFilePath = getWalibFolder().path+"WAF/",
        minifyCores = false,
        output = "",
        statusCode = 200,
        modulePackageListHelper,
        moduleBuild;

    //load modules
    modulePackageListHelper = require(wafFilePath+'builder/builder-packageListHelper/packageListHelper');
    moduleBuild     = require(wafFilePath+'builder/builder-build/build');
    storage.lock();
    output = "====================== Modules in storage =====================\n\n"+modulePackageListHelper.getStorageSnapShot() + 
           "\n\n=================== Files in cached storage ===================\n\n" + moduleBuild.getStorageSnapShot() +
           "\n\n=================== Package Definition in storage (for WPM) ===================\n\n" + JSON.stringify(storage.getItem('wafPackagesDefinitionStorage'),null,"\t");
    storage.unlock();
    
    response.statusCode                 = statusCode;
    response.headers["Content-Type"]    = "text/plain";
    response.body                       = output;
    
}