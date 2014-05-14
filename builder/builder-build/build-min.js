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
    
    var WAF_PACKAGES_DEFINITION_STORAGE_KEY  = 'wafPackagesDefinitionStorage',
        wafFilePath = getWalibFolder().path+"WAF/",
        fileHelper      = require(wafFilePath+"builder/builder-fileHelper/fileHelper"),
        ModuleBuildMin,
        modulePackage,
        moduleBuild;
        
        ModuleBuildMin = {
            
            /**
             * default settings
             * @todo make a setter/getter to add some settings
             */
            settings : {
                "minifyCores" : [
                    {
                         "from" : {
                             "file" : "builder/packages/desktop.core.package.json",
                             "path" : "WAF"
                         },
                         "to" : {
                            "js" : {
                                "file" : "minifiedCoresWAF/desktop.core.min.js",
                                "path" : "WALIB"
                            },
                            "css" : {
                                "file" : "minifiedCoresWAF/desktop.core.min.css",
                                "path" : "WALIB"
                            }
                        }
                    },
                    {
                         "from" : {
                             "file" : "builder/packages/mobile.core.package.json",
                             "path" : "WAF"
                         },
                         "to" : {
                            "js" : {
                                "file" : "minifiedCoresWAF/mobile.core.min.js",
                                "path" : "WALIB"
                            },
                            "css" : {
                                "file" : "minifiedCoresWAF/mobile.core.min.css",
                                "path" : "WALIB"
                            }
                        }
                    }
                ]
            },
            
            /**
             * Checks if ALL the minified files of the fileListName exist
             * @param {String} fileListName
             * @returns {Boolean}
             */
            minFilesExist : function(fileListName){
                
                var type,i,
                    settingsList;
                    
                settingsList = this.settings[fileListName];
                
                if(settingsList && settingsList.length > 0){
                    for(i=0; i < settingsList.length; i++ ){
                        for(type in settingsList[i]["to"]){
                            try{
                                if(!fileHelper.getFile(settingsList[i]["to"][type].file, settingsList[i]["to"][type].path).exists){
                                    throw "No minified file here - file : "+settingsList[i]["to"][type].file+" path : "+settingsList[i]["to"][type].path;
                                }
                            }
                            catch(e){
                                //if any of the min files doesn't exists, break the loop and return false otherwise, return true
                                return false;
                            }
                        }
                    }
                }
                
                return true;
                
            },
                    
            /**
             * Creates the minified files according to settings[fileListName]
             * If doNotMinify=true -> doesn't minifies the js/css
             * @param {String} fileListName
             * @param {Boolean} doNotMinify @optional
             * @param {Boolean} specifyTimestamp
             * @param {Function} packagesDefinitionCallback_before @optional should return the packages definition to start on
             * @param {Function} packagesDefinitionCallback_after @optional should return the packages definition to save after creating files
             * @returns {String}
             * @warn flushes all cache before making the files
             */
            makeMinFiles : function(fileListName, doNotMinify, specifyTimestamp, packagesDefinitionCallback_before, packagesDefinitionCallback_after){
        
                var type,i,
                    settingsList,
                    buildList,
                    builds = [],
                    output = "",
                    file,
                    packagesDefinition,
                    stream;
            
                settingsList = this.settings[fileListName];        
                modulePackage = require(wafFilePath+'builder/builder-package/package');
                moduleBuild     = require(wafFilePath+'builder/builder-build/build');
                
                console.log('>makeMinFiles');
                //build creation loop (using storage)
                if(settingsList && settingsList.length > 0){
                    try{
                        //lock the storage before the first access until the very last one
                        storage.lock();
                        console.log('>>Cache reseted');
                        //update the package definition in storage with the callback return before starting resolving/creating the files
                        if(typeof packagesDefinitionCallback_before === "function"){
                            packagesDefinition = packagesDefinitionCallback_before();
                            if(packagesDefinition){
                                storage.setItem(WAF_PACKAGES_DEFINITION_STORAGE_KEY,packagesDefinition);
                            }
                        }
                        storage.setItem('buildsStorage', {});
                        storage.setItem('packageList', {});
                        for(i=0; i < settingsList.length; i++ ){
                            buildList = modulePackage.buildList(settingsList[i]["from"].file, settingsList[i]["from"].path, false);
                            //make the builds and cache them
                            moduleBuild.makeBuilds(buildList, settingsList[i]["from"].file, settingsList[i]["from"].path, undefined, doNotMinify, specifyTimestamp);
                            //retrieve the builds from cache
                            for(type in settingsList[i]["to"]){
                                builds.push({
                                    output : moduleBuild.getBuildFromCache(buildList, settingsList[i]["from"].file, settingsList[i]["from"].path, type).output,
                                    file : settingsList[i]["to"][type].file,
                                    path : settingsList[i]["to"][type].path
                                });
                            }
                        }
                        //update the package definition in storage with the callback return before unlocking the storage
                        if(typeof packagesDefinitionCallback_after === "function"){
                            packagesDefinition = packagesDefinitionCallback_after();
                            if(packagesDefinition){
                                storage.setItem(WAF_PACKAGES_DEFINITION_STORAGE_KEY,packagesDefinition);
                            }
                        }
                        //reset the packageList (we don't need to keep those) although, we keep the buildsStorage (if the user want to create a script based on one of the resources so that it won't have to be reprocessed)
                        storage.setItem('packageList', {});
                        //we don't access the storage anymore
                        storage.unlock();
                    }
                    catch(e){
                        //if an exception throws during creation, catch it end unlock the storage to prevent dead lock
                        storage.unlock();
                        //rethrow exception
                        throw e;
                    }
                }
                
                //@todo should include this part inside the storage lock to keep it transactional
                
                //min files creation loop
                if(builds && builds.length > 0){
                    for(i = 0; i<builds.length; i++){
                        file = fileHelper.getFile(builds[i].file, builds[i].path);
                        //creates 1rst layer of folder if doesn't exist @todo : manage multiple folders layers
                        if(file.parent.exists === false){
                            (Folder (file.parent.path)).create();
                        }
                        //make a new file each time
                        if (file.exists){
                            file.remove();
                        }
                        if(!file.create()){
                            console.error("couldn't create file : "+builds[i].file+" path : "+builds[i].path);
                            throw new Error("couldn't create file : "+builds[i].file+" path : "+builds[i].path);
                        }
                        stream = TextStream(file, "write");  // open the stream in write mode
                        stream.write(builds[i].output); // append the message to the end of stream
                        stream.close(); // do not forget to close the stream
                        console.log(">makeMinFiles > minified file created at : "+builds[i].file+" path : "+builds[i].path);
                    }
                }
                
                console.log('<makeMinFiles');
                //debug
                if(builds && builds.length > 0){
                    for(i = 0; i<builds.length; i++){
                        output += "=======================\n\n"+ "file : " + builds[i].file + " path : " + builds[i].path + "\n" + builds[i].output+"\n\n";
                    }
                    return output;
                }
                
            },
                    
            /**
             * Removes the minified files from the hard drive
             * @param {String} fileListName
             * @todo to implement
             */
            flushMinFiles : function(fileListName){
                
                var type,i,file,
                    settingsList;
                    
                settingsList = this.settings[fileListName];
                
                if(settingsList && settingsList.length > 0){
                    for(i=0; i < settingsList.length; i++ ){
                        for(type in settingsList[i]["to"]){
                            try{
                                file = fileHelper.getFile(settingsList[i]["to"][type].file, settingsList[i]["to"][type].path);
                                if(file.exists){
                                    if(file.remove() === false){
                                        throw new Error("Can't remove file "+settingsList[i]["to"][type].path+'/'+settingsList[i]["to"][type].file);
                                    }
                                }
                                else{
                                    console.info('ModuleBuildMin.flushMinFiles() - /'+settingsList[i]["to"][type].path+'/'+settingsList[i]["to"][type].file+" didn't exist before its removal");
                                }
                            }
                            catch(e){
                                //if any of the min files doesn't exists, break the loop and return false otherwise, return true
                                console.error('ModuleBuildMin.flushMinFiles() - /'+settingsList[i]["to"][type].path+'/'+settingsList[i]["to"][type].file+" - an error has occured while trying to remove the file - "+e.message);
                            }
                        }
                    }
                }
                
            }
            
        };
        
        return ModuleBuildMin;
    
})();
