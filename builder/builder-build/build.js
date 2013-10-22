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
        BUILDS_STORAGE_KEY  = 'buildsStorage',
        BUILD_TYPES         = ['js','css'],
        ModuleBuild, buildHelper, fileHelper;
    
    buildHelper = {
        
        /**
         * Returns the list from the Build Storage
         * @returns {Object}
         */
        getBuildsFromStorage: function(){
            return storage.getItem(BUILDS_STORAGE_KEY);
        },
                
        /**
         * Saves builds to the Build Storage
         * @param {Object} builds
         */
        saveBuildsToStorage: function(builds){
            storage.setItem(BUILDS_STORAGE_KEY, builds);
        },
                
        /**
         * Minifies each file which have changed in the buildList (or are not yet minified in the builds)
         * puts them in builds
         * returns all the files minified concatened
         * @param {Object} builds (extract from build storage)
         * @param {Object} buildList
         * @param {String} type
         * @param {String} urlPath @optional (added in the header of the concateneted build)
         * @returns {Object} build
         */
        updateBuildsWithBuildList: function(builds, buildList, type, urlPath){
            
            var i, output = '', tempFileInfos, lastModifiedDate = null, date1, date2, forceDisableBrowserCache = false;
            
            //load the minifier the correct minifier (according to type)
            var minifier = require(wafFilePath+'builder/builder-minifier/'+type+'-minifier');
            
            //load fileHelper module
            fileHelper = fileHelper || require(wafFilePath+'builder/builder-fileHelper/fileHelper');
            
            //loop through the buildList
            for(i=0; i<buildList[type].length; i++){
                //if the file changed (or no minified version in builds) -> minify it + inject into builds + concat it to output
                if(buildList[type][i].changed === true || !builds[buildList[type][i].file]){
                    //retrieve infos about the file
                    tempFileInfos = fileHelper.getInfos(buildList[type][i].file);
                    if(lastModifiedDate === null){
                        lastModifiedDate = tempFileInfos.lastModifiedDate;
                    }
                    else{
                        date1 = new Date(tempFileInfos.lastModifiedDate);
                        date2 = new Date(lastModifiedDate);
                        lastModifiedDate = date1.getTime() > date2.getTime() ? date1.toUTCString() : date2.toUTCString();
                    }
                    builds[buildList[type][i].file] = {
                        "lastModifiedDate"  : tempFileInfos.lastModifiedDate.toUTCString(),
                        "output"             : minifier(tempFileInfos.path,fileHelper.getRealUrlPath(buildList[type][i].file))
                    };
                    output += (output === '' ? '' : "\n") + "\n"+builds[buildList[type][i].file].output;
                }
                else{
                    output += (output === '' ? '' : "\n") + "\n"+builds[buildList[type][i].file].output;
                }
            }
            
            //if the build is not yet in the builds from storage, we tag them as "forceDisableBrowserCache", so that the handler will override the browser cache
            if(!builds[urlPath+'.'+type]){
                forceDisableBrowserCache = true;
            }
            
            return {
                "forceDisableBrowserCache" : forceDisableBrowserCache,
                "lastModifiedDate"  : lastModifiedDate,
                "output"            : "/** Complete build done "+(new Date()).toUTCString()+(urlPath ? " for "+urlPath : "")+" */\n"+ output
            };
            
        },
        
        /**
         * Returns true if the buildList has package changed or files changed
         * @todo Only check buildList.changed === true should be ok (no need to loop through all the files)
         * @param {Object} buildList
         * @param {String} type
         * @returns {Boolean}
         */
        hasBuildListChanged : function(buildList, type){
            var list = buildList[type], i;
            //if the whole buildList is tag as changed, return true
            if(buildList.changed === true){
                return true;
            }
            //if not, look for the files inside which can have change
            if(list.length > 0){
                for(i = 0;i<list.length;i++){
                    if(list[i].changed === true){
                        return true;
                    }
                }
                return false;//we looped all the files of this type, none have changed
            }
            else{
                return true;//in case there in no more files in the build list (to force rebuild)
            }
        }
        
    };
    
    ModuleBuild = {
        
        /**
         * Make the builds for each BUILD_TYPES and caches them in storage to be retrieved by getBuild
         * @param {Object} buildList
         * @param {String} urlPath
         */
        makeBuilds: function(buildList, urlPath){
            
            var startDate = new Date();
            
            var build = {},
                buildsFromStorage,
                buildChanged,
                i,j,
                types = BUILD_TYPES,
                typesToBuild = [];
            
            try{

                //retrieve builds from storage
                buildsFromStorage = buildHelper.getBuildsFromStorage() || {};

                //first pass : only identify if there is need for rebuild AND which rebuild (to unlock storage the faster way possible)
                for(i = 0; i<types.length; i++){
                    buildChanged = buildHelper.hasBuildListChanged(buildList, types[i]);
                    //if changes spoted on the buildList for this type or no changes but no builds in storage
                    if(buildChanged === true || (buildChanged === false && !buildsFromStorage[urlPath+'.'+types[i]]) ){
                        //add the type of output to build to typesToBuild
                        typesToBuild.push(types[i]);
                    }
                }

                //second pass - only make the builds for the files needed
                if(typesToBuild.length > 0){
                    for(i = 0; i<typesToBuild.length; i++){
                        //rebuild the files that are out of date and retrieve the files that are up to date from cache - then update buildsFromStorage to cache the concatened file
                        buildsFromStorage[urlPath+'.'+typesToBuild[i]] = buildHelper.updateBuildsWithBuildList(buildsFromStorage, buildList, typesToBuild[i], urlPath);
                    }
                    //save the updated buildsFromStorage to storage
                    buildHelper.saveBuildsToStorage(buildsFromStorage);
                }
            
            }
            catch(e){
                
                //rethrow the error
                throw e;
                
            }
            
            console.info('builds made in '+( (new Date()).getTime() - startDate.getTime() )+'ms' ); 
            
            
        },
        
        /**
         * Returns a string of minified / concatened js or css for this buildList
         * @param {Object} buildList
         * @param {String} urlPath
         * @param {String} type
         * @return {Object} {"lastModifiedDate" : "timestamp", "output" : "(function(){ ... ... }) .... ...."}
         */
        getBuildFromCache: function(buildList, urlPath, type){
            var buildsFromStorage, output, build;
            
            //retrieve builds from storage
            buildsFromStorage = buildHelper.getBuildsFromStorage() || {};
            
            //if no build in cache, rebuild
            if(!buildsFromStorage[urlPath+'.'+type]){
                this.makeBuilds(buildList, urlPath, type);
            }
            
            return buildsFromStorage[urlPath+'.'+type];
            
        }
        
    };
    
    return ModuleBuild;
    
})();