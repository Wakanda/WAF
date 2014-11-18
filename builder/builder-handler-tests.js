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

var ACTIVATE_TEST_HANDLER = false;//please don't commit with this var at true (this is temporary)

function dispatcher(request, response){
    
    if(ACTIVATE_TEST_HANDLER){
        var functionToCall = request.urlPath.replace('/waf-builder-tests/','');
        if(builderHandlerTests[functionToCall]){
            try{
                return builderHandlerTests[functionToCall](request,response);
            }
            catch(e){
                response.contentType = 'text/plain';
                response.statusCode = 501;
                response.body = e.message;
            }
        }
        else{
            response.contentType = 'text/plain';
            response.statusCode = 501;
            response.body = "HTTP ERROR 501 No method matching";
        }
    }
    else{
        response.contentType = 'text/plain';
        response.statusCode = 403;
        response.body = "HTTP ERROR 403 Forbidden - This handler is curently deprecated";
    }
    
}

var builderHandlerTests = {};

builderHandlerTests['min'] = function (request,response){
    
    var wafFilePath = getWalibFolder().path+"WAF/",
        ModuleBuildMin = require(wafFilePath+"builder/builder-build/build-min"),
        doNotMinify = false,
        output = "";
    
    output += "ModuleBuildMin.minFilesExist('minifyCores') = "+ModuleBuildMin.minFilesExist("minifyCores");
    output += "\n\nModuleBuildMin.makeMinFiles('minifyCores') = "+ModuleBuildMin.makeMinFiles("minifyCores", true, doNotMinify);
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
};

builderHandlerTests['mincores'] = function (request,response){
    
    var wafFilePath = getWalibFolder().path+"WAF/",
        ModuleBuildCores = require(wafFilePath+"builder/builder-build/build-cores"),
        doNotMinify = false,
        dev = false,
        output = "";
    
    output += "ModuleBuildCores.minCoresFilesExist() = "+ ModuleBuildCores.minCoresFilesExist();
    output += "\n\nModuleBuildCores.makeMinCoresFiles(doNotMinify,dev) = "+ModuleBuildCores.makeMinCoresFiles(doNotMinify,true,dev);
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
};

builderHandlerTests['simple'] = function (request,response){
//    debugger;
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
    
    output += "\n=========";
    output += "\nServices : application.settings.getItem('services')\n";
    output += JSON.stringify(application.settings.getItem('services'), null, "\t");
    
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
    
};

builderHandlerTests['wpm'] = function (request,response){
    
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
           +"\n======== fileHelper.getFileContent('/application.css') ========\n"+fileHelper.getFileContent('/application.css')
   ;
   
};

builderHandlerTests['buildList'] = function(request,response){
    
    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //infos on the package.json
    var packageJsonUrlPath = 'index.waPage/index.package.json';
//    var packageJsonUrlPath = 'myWebComponent.waComponent/myWebComponent.package.json';
//    var packageJsonUrlPath = 'myWebComponent2.waComponent/myWebComponent2.package.json';
    
    var initialStorage = storage.getItem('packageList');
//    debugger;
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
    
};

builderHandlerTests['build'] = function (request,response){
    
    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //infos on the package.json
    var packageJsonUrlPath = 'index.waPage/index.package.json';
    
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
    moduleBuild.makeBuilds(buildList, packageJsonUrlPath, undefined, false);
    var date2           = new Date();
    var  build = moduleBuild.getBuildFromCache(buildList, packageJsonUrlPath, undefined, "js");
    
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
    
};

builderHandlerTests['getPackageList'] = function (request, response){

    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //load modules
    var fileHelper  = require(wafFilePath+'builder/builder-fileHelper/fileHelper');
    var WPM         = require(wafFilePath+'builder/WPM/WPM');
    var packageListHelper = require(wafFilePath+'builder/builder-packageListHelper/packageListHelper');
    var tmpPackageList;
    
    //infos on the package.json
    var packageJsonUrlPath = 'index.waPage/index.package.json';
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
    
    output += "\n=== fileHelper.getFileContent('"+packageJsonUrlPath+"')  ("+(new Date()).toUTCString()+")===\n";
    output += fileHelper.getFileContent(packageJsonUrlPath);
    
    output += "\n=== tmp WPM.getPackageList('"+packageJsonUrlPath+"',"+mode+","+defaultCorePackage+"')  ("+(new Date()).toUTCString()+")===\n";
    output += JSON.stringify(tmpPackageList, null, "\t")+"\n";
    
//    output += "\n=== WPM.getPackageList('"+packageJsonUrlPath+"',"+mode+","+defaultCorePackage+"')  ("+(new Date()).toUTCString()+")===\n";
//    output += JSON.stringify(WPM.getPackageList(packageJsonUrlPath,mode, defaultCorePackage), null, "\t")+"\n";
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
};

builderHandlerTests['getPackage'] = function (request, response){

    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //load modules
    var fileHelper  = require(wafFilePath+'builder/builder-fileHelper/fileHelper');
    var WPM         = require(wafFilePath+'builder/WPM/WPM');
    
    //infos on the package.json
    var packageJsonUrlPath = 'index.waPage/index.package.json';
    var path = 'WEBFOLDER';
    var mode = undefined;
    var defaultCorePackage = undefined;
    
    var output = "";
    
    output += "=== fileHelper.getFileContent('"+packageJsonUrlPath+",'"+path+"') ("+(new Date()).toUTCString()+")===\n";
    output += fileHelper.getFileContent(packageJsonUrlPath,path);
    
    output += "\n\n=== WPM.getPackage('"+packageJsonUrlPath+") ("+(new Date()).toUTCString()+")===\n";
    output += JSON.stringify(WPM.getPackage(packageJsonUrlPath, path, 'desktop', false,'force'), null, "\t")+"\n";
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
};

builderHandlerTests['ricardo'] = function (request,response){    
    
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
    
    
};

builderHandlerTests['ricardoMock'] = function (request,response){    
    
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
    
    
};

builderHandlerTests['ricardoReal'] = function (request,response){    

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
    
    
};

builderHandlerTests['fileSystems'] = function (request,response){
    
//    var FOLDER_TYPE_WAF = "WAF",
//        FOLDER_TYPE_WEBFOLDER = "PROJECT";
    var FOLDER_TYPE_WALIB = "WALIB",
        FOLDER_TYPE_WAF = "WAF",
        FOLDER_TYPE_WEBFOLDER = "WEBFOLDER",
        FOLDER_TYPE_WIDGETS = "WIDGETS_CUSTOM",
        FOLDER_TYPE_THEMES = "THEMES_CUSTOM";

    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //load modules
    var fileHelper  = require(wafFilePath+'builder/builder-fileHelper/fileHelper');
    
    var output = "";
    
    try{
    
//    output += fileHelper._resolveFile('fileSystems.json',FOLDER_TYPE_WEBFOLDER).lastModifiedDate+"\n";
//    output += fileHelper._resolveFile('fileSystems.json',FOLDER_TYPE_WEBFOLDER).path+"\n";
    output += fileHelper._resolveFile('application.css',FOLDER_TYPE_WEBFOLDER).lastModifiedDate+"\n";
//    output += fileHelper._resolveFile('/application.css',FOLDER_TYPE_WEBFOLDER).path+"\n";
//    output += fileHelper._resolveFile('',FOLDER_TYPE_WEBFOLDER).path+"\n";
//    output += fileHelper._resolveFile('/',FOLDER_TYPE_WAF).path+"\n";
//    output += fileHelper._resolveFile('/index.waPage/index.package.json',FOLDER_TYPE_WEBFOLDER).lastModifiedDate+"\n";
//    output += fileHelper._resolveFile('/index.waPage/index.package.json',FOLDER_TYPE_WEBFOLDER).path+"\n";
//    output += "\n\n---";
//    output += "\ngetWalibFolder().path : "+getWalibFolder().path;
//    output += "\napplication.getItemsWithRole( 'webFolder').path : "+application.getItemsWithRole( 'webFolder').path;
    
    output += fileHelper._resolveFile('monwidget/package.json',FOLDER_TYPE_WIDGETS).path+"\n";
    output += fileHelper._resolveFile('WAF/builder/package.js',FOLDER_TYPE_WALIB).path+"\n";
    output += fileHelper._resolveFile('builder/package.js',FOLDER_TYPE_WAF).path+"\n";
    
    }
    catch(e){
        output = "error\n"+e.message+"\n"+JSON.stringify(e,null,"\t");
    }
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;

//    try{
//    var fs = FileSystemSync("toto");
////    return fs.root;
//    var rootFolder = fs.root;//.toString();
//    var theFile = File( rootFolder, "test.txt");
////    var theFile = File( "/WAKANDA/application.css");
//    var theFileContents = theFile.toString();
//    }
//    catch(e){
//        return "error";
//    }
//    
//    return theFileContents;
    
};

builderHandlerTests['folder'] = function (request,response){
    
    var output = "";
    
    var wafFilePath = getWalibFolder().path+"WAF/";
    
    var wafThemesPath = wafFilePath+"themes/";
    
    var wafThemesFolder = Folder (wafThemesPath);
    
//    output += wafThemesPath + '\n';
//    output += JSON.stringify(wafThemesFolder,null,"\t")+"\n";
//
//    wafThemesFolder.forEachFolder(function(a,b,c){
//        console.log(a,b,c);
//        if(a.files && a.files.length > 0){
//            for(var i=0; i<a.files.length;i++){
//                if(a.files[i].name === "package.json"){
//                    output += a.files[i].path+"\n";
//                    output += (a.files[i].path.replace(/(.*)walib\/WAF\//,""))+'\n';
//                }
//            }
//        }
//    });
//    
    
    output += JSON.stringify(storage.getItem("wafPackagesDefinitionStorage"),null,"\t")+"\n";
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
};

builderHandlerTests['timestamp'] = function (request,response){
    
    //sorry for dirty code
    
    var output = "";
    
    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //load modules
    var fileHelper  = require(wafFilePath+'builder/builder-fileHelper/fileHelper');
    
    var filePath = {
        "html"      : "index.waPage/index.html",
        "package"   : "index.waPage/index.package.json",
        "css"       : "index.waPage/styles/index.css"
    };
    
    var files = {
        "html"      : fileHelper.getFile(filePath.html,"WEBFOLDER"),
        "package"   : fileHelper.getFile(filePath.package,"WEBFOLDER"),
        "css"       : fileHelper.getFile(filePath.css,"WEBFOLDER")
    };
    
    var name;
    
    for(name in filePath){
        output += filePath[name] + "\n\n" + JSON.stringify(files[name],null,"\t") + "\n" + (new Date(files[name].lastModifiedDate)).toUTCString() + "\n" + (new Date(files[name].lastModifiedDate)).getTime() + "\n"+"======================\n";
    }
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
};

builderHandlerTests['storage'] = function (request,response){
    
    //sorry for dirty code
    
    var output = JSON.stringify(storage.getItem('packageList'),null,"\t");
    
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
};

builderHandlerTests['fileInfos'] = function (request,response){
    
    //sorry for dirty code
    
    var output = "";
    
    var wafFilePath = getWalibFolder().path+"WAF/";
    
    //load modules
    var fileHelper  = require(wafFilePath+'builder/builder-fileHelper/fileHelper');
    
    var files = [
        "index.waPage/index.html",
        "index.waPage/index.package.json",
        "index.waPage/styles/index.css",
        "myWc.waComponent/myWc.html",
        "myWc.waComponent/myWc.css",
        "myWc.waComponent/myWc.js",
        "myWc.waComponent/myWc.package.json",
        "myWc.waComponent/manifest.json"
    ];
    var path = 'WEBFOLDER';
    
    for(var i=0; i<files.length; i++){
        output += files[i] + '\t\t'+ fileHelper.getInfos(files[i], path).lastModifiedDate.toISOString()+"\n";
    }
    
    response.contentType = 'text/plain';
    response.statusCode = 200;
    response.body = output;
    
};