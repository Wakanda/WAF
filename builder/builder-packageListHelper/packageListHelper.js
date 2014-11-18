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
module.exports = (function(){
    
    var PACKAGELIST_STORAGE_KEY = 'packageList',
        PROJECT_PATHNAME = "WEBFOLDER",
        wafFilePath = getWalibFolder().path+"WAF/",
        _webFolderRootFilePath = application.getItemsWithRole( 'webFolder').path,
        builderLogger    = require(wafFilePath+"builder/builder-logger")(),
        PackageListHelper,
        fileHelper = require(wafFilePath+'builder/builder-fileHelper/fileHelper');
        
    /**
     * called by PackageListHelper.createBuildList()
     * 
     * @param {String} packageJsonFilePath
     * @param {Object} packageListFromStorage
     * @param {Object} buildList
     * @param {Object} packageListToSaveToStorage (clone of packageListFromStorage) @todo check if we really need a clone (maybe we could directly use packageListFromStorage)
     * @param {Object} buildListChanges overrides changed for any of the mentioned path/file
     * @returns {undefined}
     */    
    var _reccursive_createBuildList = function(packageJsonFilePath, packageListFromStorage, buildList, packageListToSaveToStorage, buildListChanges){
        var i,j, changed, fileInfos, currentWcMainJs = null, staticTypes = ['js','css','html'], tempEntry;
        
        //the package exists in the storage
        if(packageListFromStorage[packageJsonFilePath]){
            //if the package is a webcomponent, it has a wcMainJs attribute, we tag it, before diving into the files
            if(packageListFromStorage[packageJsonFilePath].wcMainJs){
                currentWcMainJs = packageListFromStorage[packageJsonFilePath].wcMainJs;
            }
            //the package has files inside, let's dive in
            if(packageListFromStorage[packageJsonFilePath].files.length > 0){
                for(i = 0; i<packageListFromStorage[packageJsonFilePath].files.length; i++){
                    //if it's a jss, css or html file
                    if(staticTypes.indexOf(packageListFromStorage[packageJsonFilePath].files[i].type) > -1){
                        //retrieve fileInfos from the hardDrive
                        fileInfos = fileHelper.getInfos(packageListFromStorage[packageJsonFilePath].files[i].file,packageListFromStorage[packageJsonFilePath].files[i].path);
                        //check if the file has changed, between the timestamp from storage and the timestamp from the harddrive (or if it is overloaded in buildListChanges)
                        if(buildListChanges[packageListFromStorage[packageJsonFilePath].files[i].path+"/"+packageListFromStorage[packageJsonFilePath].files[i].file] || (new Date(fileInfos.lastModifiedDate)).getTime() > (new Date(packageListFromStorage[packageJsonFilePath].files[i].TS)).getTime() ){
                            //tag the file as changed
                            changed = true;
                            //tag the whole buildList as changed
                            buildList.changed = true;
                            //update the timestamp of this file on the packageList to save to storage
                            packageListToSaveToStorage[packageJsonFilePath].files[i].TS = fileInfos.lastModifiedDate.toISOString();
                        }
                        else{
                            changed = false;
                        }
                        //if the file isn't in the buildList yet, add it (tagged) - _checkForFileInBuildList is needed to insure not to add twice the same file
                        if(_checkForFileInBuildList(packageListFromStorage[packageJsonFilePath].files[i].file, packageListFromStorage[packageJsonFilePath].files[i].type, buildList) === false){
                            tempEntry = {
                                "file"      : packageListFromStorage[packageJsonFilePath].files[i].file,
                                "changed"   : changed,
                                "path"      : packageListFromStorage[packageJsonFilePath].files[i].path
                            };
                            //if we're inside a webcomponent package, search for some specific infos
                            if(packageListFromStorage[packageJsonFilePath].wcMainJs){
                                //add the wcKey for the scripts attached to he webComponent
                                if(packageListFromStorage[packageJsonFilePath].files[i].wcKey){
                                    tempEntry.wcKey = packageListFromStorage[packageJsonFilePath].files[i].wcKey;
                                }
                                //if this file is the webcomponent's constructor, tag it
                                if(packageListFromStorage[packageJsonFilePath].files[i].file === packageListFromStorage[packageJsonFilePath].wcMainJs){
                                    tempEntry.wcMainJs = true;
                                }
                            }
                            buildList[packageListFromStorage[packageJsonFilePath].files[i].type].push(tempEntry);
                        }
                    }
                    //if it's a package, dive into (no matter the time stamp)
                    else if(packageListFromStorage[packageJsonFilePath].files[i].type === 'package'){
                        _reccursive_createBuildList(packageListFromStorage[packageJsonFilePath].files[i].file, packageListFromStorage, buildList, packageListToSaveToStorage, buildListChanges);
                    }
                }
            }            
        }
        //all the packages nested in should exist in the packageListFromStorage, so we throw an error (for the moment, for debugging)
        else{
            throw new Error("Package '"+packageJsonFilePath+"' was not fount in packageListFromStorage while creating buildList in _reccursive_createBuildList");
        }
    };
    
    /**
     * 
     * @param {String} filePath
     * @param {String} type
     * @param {Object} buildList
     * @returns {Boolean}
     */
    var _checkForFileInBuildList = function(filePath, type, buildList){
        var i;
        for(i = 0; i < buildList[type].length; i++){
            if(buildList[type][i].file === filePath){
                return true;
            }
        }
        return false;
    };
    
    /**
     * Acts like indexOf returns the index of a file in a package of a packageList. Returns -1 if not present
     * 
     * @param {Object} packageList
     * @param {String} packageName
     * @param {String} fileName The fileName to search for in the package
     * @returns {number}
     */
    var _getFileIndexFromPackage = function(packageList, packageName, fileName){
        //console.log('SEARCHFOR _getFileIndexFromPackage in packageName '+ packageName + ' - looking for file : ' + fileName + ' in ' + (packageList[packageName] && packageList[packageName].files && packageList[packageName].files.length ? packageList[packageName] && packageList[packageName].files && packageList[packageName].files.length : 0) + ' files');
        if(packageList[packageName] && packageList[packageName].files && packageList[packageName].files.length > 0){
            for(var index=0; index<packageList[packageName].files.length; index++){
                if(packageList[packageName].files[index] && packageList[packageName].files[index].file === fileName){
                    return index;
                }
            }
        }
        return -1;
    };
    
    PackageListHelper = {
        
        /**
         * Returns the list from the Module Package Storage
         * @returns {Object}
         */
        getPackageListFromStorage: function(){
            return storage.getItem(PACKAGELIST_STORAGE_KEY);
        },
                
        /**
         * Saves a packageList to the Module Package Storage
         * @param {type} packageList
         */
        savePackageListToStorage: function(packageList){
            storage.setItem(PACKAGELIST_STORAGE_KEY, packageList);
        },
        
        /**
         * Loops through the Package list from the storage,
         * compares the timestamps of the files referenced in the storage with the real timestamp of the files on the hardrive,
         * adds them and tags them as "changed" if the files where modified (to force a rebuild)
         * @param {String} packageJsonUrlPath (where to begin ?)
         * @param {Object} packageListFromStorage
         * @returns {Object} buildListResult
         * @throws error if no file exists at packageJsonFilePath
         */                
        createBuildList: function(packageJsonUrlPath, path, packageListFromStorage, packageListFromWpm){
            
            fileHelper = fileHelper || require(wafFilePath+'builder/builder-fileHelper/fileHelper');
            path = path || PROJECT_PATHNAME;
            
            //init buildList
            var buildList = {
                "changed"   : false,
                "css"       : [],
                "js"        : [],
                "html"      : []
            },
            diffPackageListStorageVsWpm = {
                packageList : null,
                buildListChanges : null
            },
            buildListChanges = {};
            
            try{
                fileHelper.getInfos(packageJsonUrlPath, path);
            }
            catch(e){
                throw new Error("No package.json file at this location : "+packageJsonUrlPath+"\n"+e.message);
            }
            
            //merge packageListFromWpm to packageListFromStorage while tagging the changed files in buildListChanges (to force changed in _reccursive_createBuildList)
            if(packageListFromWpm){
                diffPackageListStorageVsWpm = this.diffPackageListStorageVsWpm(packageListFromStorage, packageListFromWpm);
                packageListFromStorage = diffPackageListStorageVsWpm.packageList;
                buildListChanges = diffPackageListStorageVsWpm.buildListChanges;
            }
            
            //clone packageListFromStorage to remove the reverence
            var packageListToSaveToStorage = JSON.parse(JSON.stringify(packageListFromStorage));
            
            _reccursive_createBuildList(packageJsonUrlPath, packageListFromStorage, buildList, packageListToSaveToStorage, buildListChanges);
            
            return {
                "buildList" : buildList,
                "packageListToSaveToStorage" : packageListToSaveToStorage
            };
            
        },
                
        /**
         * Returns true if the package packageJsonUrlPath exists in packageListFromStorage
         * @param {Object} packageListFromStorage
         * @param {String} packageJsonUrlPath
         * @returns {Boolean}
         */
        packageExists: function(packageListFromStorage, packageJsonUrlPath){
            if(packageListFromStorage[packageJsonUrlPath]){
                return true;
            }
            else{
                return false;
            }
        },
                
        /**
         * Returns true if the package packageJsonUrlPath has changed between the one that was timestamped in packageListFromStorage and the one on the hardrive
         * Not a reccursive method, if you wan't deep nested checking of the package changes, use hasTopPackageChanged
         * @param {Object} packageListFromStorage
         * @param {String} packageJsonUrlPath
         * @returns {Boolean}
         */
        hasPackageChanged: function(packageListFromStorage, packageJsonUrlPath, path){
            
            var lastModifiedDate;
            if(this.packageExists(packageListFromStorage, packageJsonUrlPath)){
                //check if the last modified date of the file on the disk is greater than the one on the storage (i.e. if the package has changed)
                lastModifiedDate = fileHelper.getInfos(packageJsonUrlPath, path).lastModifiedDate;
                if(lastModifiedDate && (new Date(lastModifiedDate)).getTime() > (new Date(packageListFromStorage[packageJsonUrlPath].TS)).getTime() ){
                    return true;
                }
                else{
                    return false;
                }
            }
            //if no package any more, the package has changed (it should be removed from the packageListFromStorage)
            else{
                return true;
            }
        },
        
        /**
         * Returns true if the package packageJsonUrlPath (or one of its nested packages) have changed between the ones that were timestamped in packageListFromStorage and the ones on the hardrive
         * @todo doesn't prevent inifinite loops if there are reference redondance (there shouldn't be, packageListFromStorage is issued by WPM.getPackageList which prevents that)
         * @param {Object} packageListFromStorage
         * @param {String} packageJsonUrlPath
         * @returns {Boolean}
         */
        hasTopPackageChanged: function(packageListFromStorage, packageJsonUrlPath, path){
            
            var i;
            //the package has changed ? if yes, return true, we don't bother to find out if the other packages nested have changed
            if(this.hasPackageChanged(packageListFromStorage, packageJsonUrlPath, path)){
                return true;
            }
            //top package hasn't changed, we loop through the files of this 
            else{
                if(packageListFromStorage[packageJsonUrlPath] && packageListFromStorage[packageJsonUrlPath].files && packageListFromStorage[packageJsonUrlPath].files.length > 0){
                    //looping through the files of the package
                    for(i = 0; i<packageListFromStorage[packageJsonUrlPath].files.length; i++){
                        if(packageListFromStorage[packageJsonUrlPath].files[i].type === "package"){
                            //if this package we're looping on has changed, we return true (it stops reccursion and bubbles up)
                            if(this.hasPackageChanged(packageListFromStorage, packageListFromStorage[packageJsonUrlPath].files[i].file, packageListFromStorage[packageJsonUrlPath].files[i].path)){
                                return true;
                            }
                            //if this package we're looping on hasn't changed, we dive in by launching again the reccursion
                            else{
                                if(this.hasTopPackageChanged(packageListFromStorage, packageListFromStorage[packageJsonUrlPath].files[i].file, packageListFromStorage[packageJsonUrlPath].files[i].path)){
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            
            //be looped through all the nested packages, tested the time stamp, no package has been modified, so we return false (it stops reccursion and bubbles up)
            return false;
            
        },
                
        /**
         * Merges sourcePackageList to targetPackageList in result.packageList , while updating result.buildListChanges (telling which files have changed of timestamp)
         * @param {PackageList} targetPackageList
         * @param {PackageList} sourcePackageList
         * @returns {Object}
         */
        diffPackageListStorageVsWpm: function(targetPackageList, sourcePackageList){
    
            var targetPackageName,
                targetFileIndex,
                sourceFileIndex,
                resultFileIndex,
                result = {
                    packageList : {},
                    buildListChanges : {}
                };

            builderLogger('>packageListHelper.diffPackageListStorageVsWpm() - start');
        
            //if nothing to merge
            if(Object.keys(sourcePackageList).length === 0){
                builderLogger('>>packageListHelper.diffPackageListStorageVsWpm() - nothing to merge');
                result.packageList = targetPackageList;
                return result;
            }
            //otherwise make a copy of the source
            else{
                builderLogger('>>packageListHelper.diffPackageListStorageVsWpm() - creating result from WPM.getPackageList()');
                result.packageList = JSON.parse(JSON.stringify(sourcePackageList));
            }
            
            builderLogger('>> >packageListHelper.diffPackageListStorageVsWpm() - start adding packages from storage not found in WPM.getPackageList() to result');
            //merge from sourcePackageList to targetPackageList into result the non existent sourcePackageList entries in targetPackageList
            for(targetPackageName in targetPackageList){
                if(!result.packageList[targetPackageName]){
                    builderLogger('>> >packageListHelper.diffPackageListStorageVsWpm() - adding package : ',targetPackageName);
                    result.packageList[targetPackageName] = targetPackageList[targetPackageName];
                }
            }
            builderLogger('>> <packageListHelper.diffPackageListStorageVsWpm() - stop adding packages from storage not found in WPM.getPackageList() to result');
            
            //2nd copy files from target over result which have different TS
            if(Object.keys(targetPackageList).length > 0){
                //loop through target
                builderLogger('>> >packageListHelper.diffPackageListStorageVsWpm() - start updating timestamps of result with the ones from WPM.getPackageList() + updating buildListChanges');
                for(targetPackageName in targetPackageList){
                    if(!result.packageList[targetPackageName]){
                        result.packageList[targetPackageName] = {
                            TS : targetPackageList[targetPackageName].TS,
                            files : []
                        };
                    }
                    //check if the package exists in source + it has files in it + make sure the target has also files to compare to (to avoid non essantial looping)
                    if(sourcePackageList[targetPackageName] && sourcePackageList[targetPackageName].files && sourcePackageList[targetPackageName].files.length && targetPackageList[targetPackageName].files && targetPackageList[targetPackageName].files.length){
                        //loop through the files inside the package, retrieve the timestamps from the sourcePackageList files into the targetPackageList files
                        for(targetFileIndex = 0; targetFileIndex < targetPackageList[targetPackageName].files.length; targetFileIndex++){
                            for(sourceFileIndex = 0; sourceFileIndex < sourcePackageList[targetPackageName].files.length; sourceFileIndex++){
                                //match the files which have different TS
                                if(targetPackageList[targetPackageName].files[targetFileIndex].file === sourcePackageList[targetPackageName].files[sourceFileIndex].file){
                                    //first find the real resultFileIndex (file indexes can change)
                                    resultFileIndex = _getFileIndexFromPackage(result.packageList, targetPackageName, sourcePackageList[targetPackageName].files[sourceFileIndex].file);
                                    if(result.packageList[targetPackageName].files[resultFileIndex] && (new Date(result.packageList[targetPackageName].files[resultFileIndex].TS)).getTime() !== (new Date(targetPackageList[targetPackageName].files[targetFileIndex].TS)).getTime()){
                                        builderLogger('>>> >packageListHelper.diffPackageListStorageVsWpm() > file '+targetPackageList[targetPackageName].files[targetFileIndex].file+' has changed, updating TS in result + tagging as changed in buildListChanges');
                                        result.packageList[targetPackageName].files[resultFileIndex].TS = targetPackageList[targetPackageName].files[targetFileIndex].TS;
                                        result.buildListChanges[targetPackageList[targetPackageName].files[targetFileIndex].path+'/'+targetPackageList[targetPackageName].files[targetFileIndex].file] = targetPackageList[targetPackageName].files[targetFileIndex].TS;
                                    }
                                    //this is only for debug/log purposes
                                    else {
                                        resultFileIndex = _getFileIndexFromPackage(result.packageList, targetPackageName, sourcePackageList[targetPackageName].files[sourceFileIndex].file);
                                        console.log('>>> >packageListHelper.diffPackageListStorageVsWpm() > file ' + targetPackageList[targetPackageName].files[targetFileIndex].file + ' no change on TS : '+ result.packageList[targetPackageName].files[resultFileIndex].TS);
                                    }
                                }
                            }
                        }
                    }
                }
                builderLogger('>> <packageListHelper.diffPackageListStorageVsWpm() - stop updating timestamps of result with the ones from WPM.getPackageList() + updating buildListChanges');
            }
            builderLogger('<packageListHelper.diffPackageListStorageVsWpm() - stop');
            
            return result;
    
        },
                
        getStorageSnapShot : function(){
            
            var listFromStorage, output, packageName, i;
                    
            listFromStorage = this.getPackageListFromStorage();
            
            output = "";
            for(packageName in listFromStorage){
                output += "\n"+packageName + " ("+listFromStorage[packageName].path + ")" + "\t" +  + "\t" + listFromStorage[packageName].TS + "\n";
                if(listFromStorage[packageName].files.length > 0){
                    for(i=0; i<listFromStorage[packageName].files.length; i++){
                        output += "+ "+ listFromStorage[packageName].files[i].file + "\t (" + listFromStorage[packageName].files[i].path + ")\t" + listFromStorage[packageName].files[i].TS + "\n";
                    }
                }
            }
//            return output;
            return JSON.stringify(listFromStorage,null,"\t");
            
        }
        
    };
    
    return PackageListHelper;
    
})();