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
        wafFilePath = getWalibFolder().path+"WAF/",
        _webFolderRootFilePath = application.getItemsWithRole( 'webFolder').path,
        PackageListHelper,
        fileHelper = require(wafFilePath+'builder/builder-fileHelper/fileHelper');
        
    /**
     * called by PackageListHelper.createBuildList()
     * 
     * @param {String} packageJsonFilePath
     * @param {Object} packageListFromStorage
     * @param {Object} buildList
     * @param {Object} packageListToSaveToStorage (clone of packageListFromStorage) @todo check if we really need a clone (maybe we could directly use packageListFromStorage)
     * @returns {undefined}
     */    
    var _reccursive_createBuildList = function(packageJsonFilePath, packageListFromStorage, buildList, packageListToSaveToStorage){
        var i,j, changed, fileInfos;
        
        //the package exists in the storage
        if(packageListFromStorage[packageJsonFilePath]){
            //the package has files inside, let's dive in
            if(packageListFromStorage[packageJsonFilePath].files.length > 0){
                for(i = 0; i<packageListFromStorage[packageJsonFilePath].files.length; i++){
                    //if it's a jss or css file
                    if(packageListFromStorage[packageJsonFilePath].files[i].type === 'js' || packageListFromStorage[packageJsonFilePath].files[i].type === 'css'){
                        //retrieve fileInfos from the hardDrive
                        fileInfos = fileHelper.getInfos(packageListFromStorage[packageJsonFilePath].files[i].file);
                        //check if the file has changed, between the timestamp from storage and the timestamp from the harddrive
                        if( (new Date(fileInfos.lastModifiedDate)).getTime() > (new Date(packageListFromStorage[packageJsonFilePath].files[i].TS)).getTime() ){
                            //tag the file as changed
                            changed = true;
                            //tag the whole buildList as changed
                            buildList.changed = true;
                            //update the timestamp of this file on the packageList to save to storage
                            //@todo SURE to have to use a clone like packageListToSaveToStorage ?
                            packageListToSaveToStorage[packageJsonFilePath].files[i].TS = fileInfos.lastModifiedDate;
                        }
                        else{
                            changed = false;
                        }
                        //if the file isn't in the buildList yet, add it (tagged) - _checkForFileInBuildList is needed to insure not to add twice the same file
                        if(_checkForFileInBuildList(packageListFromStorage[packageJsonFilePath].files[i].file, packageListFromStorage[packageJsonFilePath].files[i].type, buildList) === false){
                            buildList[packageListFromStorage[packageJsonFilePath].files[i].type].push({
                                "file"      : packageListFromStorage[packageJsonFilePath].files[i].file,
                                "changed"   : changed
                            });
                        }
                    }
                    //if it's a package, dive into (no matter the time stamp)
                    else if(packageListFromStorage[packageJsonFilePath].files[i].type === 'package'){
                        _reccursive_createBuildList(packageListFromStorage[packageJsonFilePath].files[i].file, packageListFromStorage, buildList, packageListToSaveToStorage);
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
        createBuildList: function(packageJsonUrlPath, packageListFromStorage){
            
            fileHelper = fileHelper || require(wafFilePath+'builder/builder-fileHelper/fileHelper');
            
            //init buildList
            var buildList = {
                "changed"   : false,
                "css"       : [],
                "js"        : []
            };
            try{
                fileHelper.getInfos(packageJsonUrlPath);
            }
            catch(e){
                throw new Error("No package.json file at this location : "+packageJsonUrlPath+"\n"+e.message);
            }
            
            //clone packageListFromStorage to remove the reverence
            var packageListToSaveToStorage = JSON.parse(JSON.stringify(packageListFromStorage));
            
            _reccursive_createBuildList(packageJsonUrlPath, packageListFromStorage, buildList, packageListToSaveToStorage);
            
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
        hasPackageChanged: function(packageListFromStorage, packageJsonUrlPath){
            var lastModifiedDate;
            if(this.packageExists(packageListFromStorage, packageJsonUrlPath)){
                //check if the last modified date of the file on the disk is greater than the one on the storage (i.e. if the package has changed)
                lastModifiedDate = fileHelper.getInfos(packageJsonUrlPath).lastModifiedDate;
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
        hasTopPackageChanged: function(packageListFromStorage, packageJsonUrlPath){
    
            var i;
            
            //the package has changed ? if yes, return true, we don't bother to find out if the other packages nested have changed
            if(this.hasPackageChanged(packageListFromStorage, packageJsonUrlPath)){
                return true;
            }
            //top package hasn't changed, we loop through the files of this 
            else{
                if(packageListFromStorage[packageJsonUrlPath] && packageListFromStorage[packageJsonUrlPath].files && packageListFromStorage[packageJsonUrlPath].files.length > 0){
                    //looping through the files of the package
                    for(i = 0; i<packageListFromStorage[packageJsonUrlPath].files.length; i++){
                        if(packageListFromStorage[packageJsonUrlPath].files[i].type === "package"){
                            //if this package we're looping on has changed, we return true (it stops reccursion and bubbles up)
                            if(this.hasPackageChanged(packageListFromStorage, packageListFromStorage[packageJsonUrlPath].files[i].file)){
                                return true;
                            }
                            //if this package we're looping on hasn't changed, we dive in by launching again the reccursion
                            else{
                                if(this.hasTopPackageChanged(packageListFromStorage, packageListFromStorage[packageJsonUrlPath].files[i].file)){
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            
            //be looped through all the nested packages, tested the time stamp, no package has been modified, so we return false (it stops reccursion and bubbles up)
            return false;
            
        }
        
    };
    
    return PackageListHelper;
    
})();