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
    
    var wafFilePath = getWalibFolder().path+"WAF/",
        WAF_PACKAGES_DEFINITION_STORAGE_KEY  = 'wafPackagesDefinitionStorage',
        builderLogger    = require(wafFilePath+"builder/builder-logger")(),
        fileHelper;
    
    ModulePackage = {
        
        /**
         * Returns THE build list to be processed by the builder-build module
         * - finds the package.json corresponding to the request
         * - checks for it in the ModulePackageStorage
         *  -> updates it if necessary (resolving dependencies with WPM)
         * - returns the build list (with the WPM)
         * @param {String} packageJsonUrlPath issued from urlHelper.getInfos(request)
         * @returns {Object} buildList
         * @throws error if fails
         */
        buildList: function(packageJsonUrlPath, path, debugMode){

            var i,
                packageListHelper, WPM, fileHelper,
                packageListFromStorage,
                packageListFromWpm,
                packageHasChanged = false,
                buildListResult,
                debugMode = (typeof debugMode === "undefined" || debugMode === false) ? false : true;
        
            //default value for path
            path = path || "WEBFOLDER";
            
            //load packageListHelper
            packageListHelper = require(wafFilePath+'builder/builder-packageListHelper/packageListHelper');
            
            //retrieve the package list from storage
            packageListFromStorage = packageListHelper.getPackageListFromStorage() || {};
            //check if any package has changed on the hardrive (by checking timestamps between storage and hardrive)
            packageHasChanged = packageListHelper.hasTopPackageChanged(packageListFromStorage, packageJsonUrlPath, path);
            builderLogger('DEBUG : packageHasChanged ',packageJsonUrlPath, ' ',packageHasChanged);
            if(packageHasChanged || debugMode === true){
                //load WPM - ONLY if the package packageJsonUrlPath or any package inside this one has changed
                WPM = require(wafFilePath+'builder/WPM/WPM');
                //the package has changed so we reload the packageList from the WPM, unfortunatly, with the latest timestamps.
                //we need the timestamps from the storage to keep track of the file changes (when the package has also changed)
                //so we merge the timestamps from the storage to the new packageList issued by the WPM
                packageListFromWpm = WPM.getPackageList(packageJsonUrlPath, path, undefined, undefined, "force", storage.getItem(WAF_PACKAGES_DEFINITION_STORAGE_KEY) );
            }

            //create de buildList
            try{
                buildListResult = packageListHelper.createBuildList(packageJsonUrlPath, path, packageListFromStorage, packageListFromWpm);
            }
            catch(e){
                throw new Error("createBuildList failed"+"\n"+e.message);
            }
            
            //once the build list has been created, if there was any changes to the package :
            // - a package change spoted from packageHasChanged
            // - or a file change spoted while creating the buildList
            //then we save the new packageList to storage
            if(packageHasChanged || buildListResult.buildList.changed === true){
            
                //tag the buildList as changed to force the Build.makeBuilds method to loop through the files
                buildListResult.buildList.changed = true;
                //update the package list in storage
                packageListHelper.savePackageListToStorage(buildListResult.packageListToSaveToStorage);
                
            }
            //if no changes in the packages nor in the files, we don't have to update the storage
            
            //return the buildList
            return buildListResult.buildList;
        },
                
        /**
         * Transforms a buildList to a debugList (list of css and js urls to be injected in head via js)
         * @param {Object} buildList
         * @returns {Object} debugList
         */
        buildListToDebugList: function(buildList){
            fileHelper = fileHelper || require(wafFilePath+'builder/builder-fileHelper/fileHelper');
            var type,i,debugList = {};
            for(type in buildList){
                if(type !== "changed"){
                    debugList[type] = [];
                    for(i = 0; i < buildList[type].length; i++){
                        debugList[type].push(fileHelper.getHttpPath(buildList[type][i].file,buildList[type][i].path));
                    }
                }
            }
            return debugList;
        }
        
    };
    
    
    return ModulePackage;
    
})();