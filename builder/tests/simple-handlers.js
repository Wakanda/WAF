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
//function simpleHandlers_wafBuild(request, response){
//    
//    var cleanUrlPath = function(url){
//        var defaultStrips = ['waf-build.js','waf-build.css','waf-debug.js','waf-debug.css'],i,urlPath = url;
//        for(i = 0; i< defaultStrips.length; i++){
//            urlPath = urlPath.replace(defaultStrips[i],'');
//        }        
//        return urlPath;
//    };
//    
//    var urlPathToPackage = function (url){
//        var urlPath = cleanUrlPath(url)+'index.waPage/index.package.json';
//        return urlPath;
//    };
//    
//    var filePathToPackage = function (url){
//        var urlPath = urlPathToPackage(url);
//        var webFolderPath = application.getItemsWithRole( 'webFolder').path;
//        var filePath = webFolderPath.substring(0,webFolderPath.length-1)+urlPath;
//        return filePath;
//    };
//    
//    var getPackageJson = function(url){
//        var text;
//        text = loadText(filePathToPackage(url), 1018);
//        return text;
//    };
//    
//    var processPackage = function(url){
//        var result;
//        result = WPM.getPackage(JSON.parse(getPackageJson(url)));
//        return result;
//    };
//    
//    var openfilesFromPackage = function(fileList,type){
//        
//    };    
//
//    //load WPM
//    var wafFilePath = getWalibFolder().path+"WAF/";
//    var WPMmodulePath = getWalibFolder().path+"WAF/builder/WPM/WPM";
//    var WPM = require(WPMmodulePath);
//    var urlHelper = require(wafFilePath+'builder/builder-urlHelper/urlHelper');
//
////    return wpmHandler_diagnosis(request, response);
//    
//    var toLine = "\n";
//    var urlPath = request.urlPath;
//    var urlQuery = request.urlQuery;
//    var webFolderPath = application.getItemsWithRole( 'webFolder').path;
//    var cleanUrl = cleanUrlPath(urlPath);
//    
//    try{
//        var entry = resolveLocalFileSystemSyncURL('/');
//        console.log(entry.fullPath,entry.filesystem);
//        response.body += toLine+entry.fullPath;
//        response.body += toLine+entry.filesystem.name;
//        response.body += toLine+entry.filesystem.root.fullPath;
//        response.body += toLine+'----------------------';
//    }
//    catch(e){
//        console.log(e);
//    }
//    
//    response.contentType = 'text/plain';
//    response.statusCode = 200;
//    response.body += toLine+"urlPath : "+urlPath;
//    response.body += toLine+"urlQuery : "+urlQuery;
//    response.body += toLine+"cleanUrlPath : "+cleanUrlPath(urlPath);
////    response.body += toLine+"packagePath (from urlPathToPackage() ) : "+urlPathToPackage(urlPath);
//    response.body += toLine+"webFolderPath : "+webFolderPath;
////    response.body += toLine+"package filePath : "+filePathToPackage(urlPath);
////    response.body += toLine+"getPackageJson : "+getPackageJson(urlPath);
////    response.body += toLine+"processPackage : "+processPackage(urlPath);
//    response.body += toLine+"cleanUrl : "+cleanUrl;
//    response.body += toLine+"resolveLocalFileSystemSyncURL : "+resolveLocalFileSystemSyncURL('/');
//    
//    response.body += toLine+'=== urlHelper.getInfos(request) ===';
//    response.body += toLine+JSON.stringify(urlHelper.getInfos(request), null, "\t");
//    
//}

function simpleHandlers_simple(request,response){
    
    var urls = [
        '/',
        '/index/',
        '/index.waPage/',
        '/index.waPage/index.html'
    ];
    var output = '';
    var br = "\n";
    for(var i=0; i<urls.length; i++){
        output += urls[i]+ "   =>   "+request.resolveURL (urls[i], 'relativePath', 'posix')+br;
    }
    return output;

//    var message = '';
//    var url = '/index/';
//
//    message += request.resolveURL (url, 'path', 'system') + '\r\n';
//    message += request.resolveURL (url, 'path', 'posix') + '\r\n';
//    message += request.resolveURL (url, 'url', 'encoded') + '\r\n';
//    message += request.resolveURL (url, 'url', 'notEncoded') + '\r\n';
//    message += request.resolveURL (url, 'relativePath', 'system') + '\r\n';
//    message += request.resolveURL (url, 'relativePath', 'posix') + '\r\n';
//    
//    return message;
    
}

function simpleHandlers_wpm(request,response){
    
    //infos on the package.json
    var directoryPath = application.getItemsWithRole( 'webFolder').path;
    var packageFilePath = directoryPath+'index.waPage/index.package.json';
    console.info('directoryPath',directoryPath);

    //load WPM
    var WPMmodulePath = getWalibFolder().path+"WAF/builder/WPM/WPM";
    var WPM = require(WPMmodulePath);
    
    //load fileHelper
    var fileHelperModulePath = getWalibFolder().path+"WAF/builder/builder-fileHelper/fileHelper";
    var fileHelper = require(fileHelperModulePath);
    
    //init timer
    var dateStart = new Date();
    
    //test 3 : get package
    var tmpPack = WPM.getPackage(packageFilePath);
    var dateStop = new Date();
    return "======== List of files returned by WPM.getPackage() in "+(dateStop - dateStart)+"ms ========\n"+JSON.stringify(tmpPack, null, "\t")+
           "\n======== WPM.getPackageNames() ========\n"+JSON.stringify(WPM.getPackageNames(), null, "\t")+
           "\n======== WPM.getRawData() ========\n"+JSON.stringify(WPM.getRawData(), null, "\t")
           +"\n======== fileHelper.getInfos('+/widget/palette/css/widget-palette-default.css') ========\n"+JSON.stringify(fileHelper.getInfos('+/widget/palette/css/widget-palette-default.css'), null, "\t")
           +"\n======== fileHelper.getInfos('/index.waPage/styles/index.css') ========\n"+JSON.stringify(fileHelper.getInfos('/index.waPage/styles/index.css'), null, "\t")
           +"\n======== fileHelper.getFile('/application.css') ========\n"+fileHelper.getFile('/application.css')
   ;
   
}

function simpleHandlers_buildList(request,response){
    
    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //infos on the package.json
    var packageJsonUrlPath = '/index.waPage/index.package.json';
    
    var initialStorage = storage.getItem('packageList');
    
    //load package and get the build list
    var modulePackage = require(wafFilePath+'builder/builder-package/package');
    var buildList     = modulePackage.buildList(packageJsonUrlPath);
    
    var lastStorage = storage.getItem('packageList');
    
    var output = "=== Test Package Module ===\n"
        +"\n=== buildList ===\n"+JSON.stringify(buildList, null, "\t")
        +"\n=== initialStorage ===\n"+JSON.stringify(initialStorage, null, "\t")
        +"\n=== lastStorage ===\n"+JSON.stringify(lastStorage, null, "\t");
    
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
}

function simpleHandlers_build(request,response){
    
    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //infos on the package.json
    var packageJsonUrlPath = '/index.waPage/index.package.json';
    var urlPath             = '/index.waPage/index.html';
    var type                = 'js';
    
    //reset cache
    storage.lock();
    storage.setItem('buildsStorage', {});
    storage.setItem('packageList', {});
    storage.unlock();
    
    //load package and get the build list
    var modulePackage = require(wafFilePath+'builder/builder-package/package');
    var buildList     = modulePackage.buildList(packageJsonUrlPath);
    
    //load build module and get the build from the build list
    var moduleBuild     = require(wafFilePath+'builder/builder-build/build');
    var date1           = new Date();
    moduleBuild.makeBuilds(buildList, "test", "js");
    var date2           = new Date();
    var  build = moduleBuild.getBuildFromCache(buildList, "test", "js");
    
    //what is in the build storage ?
    var buildStorage    = storage.getItem('buildsStorage');
    var buildStorageOutPut = '';
    for(var i in buildStorage){
        buildStorageOutPut += "\n"+i;
    }
    
    var output = "=== Test build in : "+(date2.getTime()-date1.getTime())+"ms ===\n"
        +"\n=== buildStorage (what's in cache ?) ===\n"+buildStorageOutPut+"\n"
        +"\n=== buildList ===\n"+JSON.stringify(buildList, null, "\t")
        +"\n=== build ===\n"+JSON.stringify({
            "changed" : build.changed,
            "lastModifiedDate" : build.lastModifiedDate
        }, null, "\t")
        +"\n=== build output ===\n"+build.output;
    
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
}

function simpleHandler_getPackageList(request, response){

    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //load modules
    var fileHelper  = require(wafFilePath+'builder/builder-fileHelper/fileHelper');
    var WPM         = require(wafFilePath+'builder/WPM/WPM');
    var packageListHelper = require(wafFilePath+'builder/builder-packageListHelper/packageListHelper');
    var tmpPackageList;
    
    //infos on the package.json
    var packageJsonUrlPath = '/index.waPage/index.package.json';
    var mode = undefined;
    var defaultCorePackage = undefined;
    
    var output = "";
    
    tmpPackageList = WPM.getPackageList(packageJsonUrlPath,mode, defaultCorePackage);
    //original time
//    tmpPackageList["/index.waPage/index.package.json"].TS = "2013-04-25T09:00:12.000Z";
//    tmpPackageList["/myWebComponent.waComponent/myWebComponent.package.json"].TS = "2013-04-19T12:38:31.000Z";
//    tmpPackageList["/myWebComponent2.waComponent/myWebComponent2.package.json"].TS = "2013-04-19T12:38:15.000Z";

    //change time
//    tmpPackageList["/index.waPage/index.package.json"].TS = "2013-04-29T13:50:43.000Z";
//    tmpPackageList["/myWebComponent.waComponent/myWebComponent.package.json"].TS = "2013-04-19T12:38:31.000Z";
//    tmpPackageList["/myWebComponent2.waComponent/myWebComponent2.package.json"].TS = "2013-04-19T12:38:14.000Z";
    
    
    output += "=== packageListHelper.hasTopPackageChanged('"+packageJsonUrlPath+"')  ("+(new Date()).toUTCString()+")===\n";
    output += "changed : " + packageListHelper.hasTopPackageChanged(tmpPackageList,packageJsonUrlPath);    
    
    output += "\n=== fileHelper.getFile('"+packageJsonUrlPath+"')  ("+(new Date()).toUTCString()+")===\n";
    output += fileHelper.getFile(packageJsonUrlPath);
    
    output += "\n=== tmp WPM.getPackageList('"+packageJsonUrlPath+"',"+mode+","+defaultCorePackage+"')  ("+(new Date()).toUTCString()+")===\n";
    output += JSON.stringify(tmpPackageList, null, "\t")+"\n";
    
//    output += "\n=== WPM.getPackageList('"+packageJsonUrlPath+"',"+mode+","+defaultCorePackage+"')  ("+(new Date()).toUTCString()+")===\n";
//    output += JSON.stringify(WPM.getPackageList(packageJsonUrlPath,mode, defaultCorePackage), null, "\t")+"\n";
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
}

function simpleHandler_getPackage(request, response){

    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //load modules
    var fileHelper  = require(wafFilePath+'builder/builder-fileHelper/fileHelper');
    var WPM         = require(wafFilePath+'builder/WPM/WPM');
    
    //infos on the package.json
    var packageJsonUrlPath = '/index.waPage/index.package.json';
    var mode = undefined;
    var defaultCorePackage = undefined;
    
    var output = "";
    
    output += "=== fileHelper.getFile('"+packageJsonUrlPath+"') ("+(new Date()).toUTCString()+")===\n";
    output += fileHelper.getFile(packageJsonUrlPath);
    
    output += "=== WPM.getPackage('"+packageJsonUrlPath+"',"+mode+","+defaultCorePackage+") ("+(new Date()).toUTCString()+")===\n";
    output += JSON.stringify(WPM.getPackage(packageJsonUrlPath, mode, defaultCorePackage), null, "\t")+"\n";
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
}

function simpleHandlers_ricardo(request,response){    
    
    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //load modules
    var fileHelper  = require(wafFilePath+'builder/builder-fileHelper/fileHelper');
    var WPM         = require(wafFilePath+'builder/WPM/WPM');
    //infos on the package.json
    var packageJsonUrlPath = '/index.waPage/index.package.json';
    var packageJsonFilePath = fileHelper.getFilePath(packageJsonUrlPath);
    
    var output = "";
    
    output += "=== Infos ===\nHere's called WPM.getPackage, WPM.getPackageNames, WPM.getPackageList and WPM.getPackageListByRicardo go to those url to make your tests :\n\n";
    output += " - http://127.0.0.1:8081/ricardoMock : this is the structure you should stick to (called at WPM.getPackageList())\n";
    output += " - http://127.0.0.1:8081/ricardoReal : this is where you'll make your test (called at WPM.getPackageListByRicardo())\n\n";
    
    //test WPM.getPackage
    output += "=== WPM.getPackage('"+packageJsonUrlPath+"') ===\n";
    output += JSON.stringify(WPM.getPackage(packageJsonUrlPath), null, "\t")+"\n";
    
    //test WPM.getPackageNames
    output += "=== WPM.getPackageNames() ===\n";
    output += JSON.stringify(WPM.getPackageNames(), null, "\t")+"\n";

    //test WPM.getPackageList
    output += "=== WPM.getPackageList('"+packageJsonUrlPath+"') @ricardo : compare this mock object to your method WPM.getPackageListByRicardo() ===\n";
    output += JSON.stringify(WPM.getPackageList(packageJsonUrlPath), null, "\t")+"\n";
    
    //test WPM.getPackageListByRicardo
    output += "=== WPM.getPackageListByRicardo('"+packageJsonUrlPath+"') @ricardo : this is your method to deal with ===\n";
    output += JSON.stringify(WPM.getPackageListByRicardo(packageJsonUrlPath), null, "\t")+"\n";
    
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
    
}

function simpleHandlers_ricardoMock(request,response){    
    
    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //load modules
    var fileHelper  = require(wafFilePath+'builder/builder-fileHelper/fileHelper');
    var WPM         = require(wafFilePath+'builder/WPM/WPM');
    
    //infos on the package.json
    var packageJsonUrlPath = '/index.waPage/index.package.json';
    var packageJsonFilePath = fileHelper.getFilePath(packageJsonUrlPath);
    
    var output = "";
    
    //test WPM.getPackageList
    output += "=== WPM.getPackageList('"+packageJsonFilePath+"') @ricardo : compare this mock object to your method WPM.getPackageListByRicardo() ===\n";
    output += JSON.stringify(WPM.getPackageList(packageJsonFilePath), null, "\t")+"\n";
    
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
    
}

function simpleHandlers_ricardoReal(request,response){    

    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //load modules
    var fileHelper  = require(wafFilePath+'builder/builder-fileHelper/fileHelper');
    var WPM         = require(wafFilePath+'builder/WPM/WPM');
    
    //infos on the package.json
    var packageJsonUrlPath = '/index.waPage/index.package.json';
    var packageJsonFilePath = fileHelper.getFilePath(packageJsonUrlPath);
    
    var output = "";
    
    //test WPM.getPackageListByRicardo
    output += "=== WPM.getPackageListByRicardo('"+packageJsonUrlPath+"') @ricardo : this is your method to deal with ===\n";
    output += JSON.stringify(WPM.getPackageListByRicardo(packageJsonUrlPath), null, "\t")+"\n";
    
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
    
}