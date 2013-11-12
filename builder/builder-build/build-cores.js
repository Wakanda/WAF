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
    
    var ModuleBuildCores,
        wafFilePath = getWalibFolder().path+"WAF/",
        fileHelper      = require(wafFilePath+"builder/builder-fileHelper/fileHelper"),
        ModuleBuildMin = require(wafFilePath+"builder/builder-build/build-min"),
        fileListName = "minifyCores";//settings of buildMin
    
    ModuleBuildCores = {
        
        /**
         * Checks if all the minified cores files exist
         * @returns {Boolean}
         */
        minCoresFilesExist : function(){
            
            return ModuleBuildMin.minFilesExist(fileListName);
            
        },

        /**
         * Creates the minified core files
         * If doNotMinify=true -> doesn't minifies the js/css
         * If debug=true will output a log
         * @param {Boolean} doNotMinify @optional
         * @param {Boolean} specifyTimestamp @optional
         * @param {Boolean} dev @optional
         */
        makeMinCoresFiles : function(doNotMinify,specifyTimestamp,dev){
    
            var self = this;
            return ModuleBuildMin.makeMinFiles(fileListName,doNotMinify,specifyTimestamp,function(){
                return self.getPackagesDefinitionStorage(true);
            },function(){
                return self.getPackagesDefinitionStorage(dev);
            });
    
        },

        /**
         * Removes the minified core files from the hard drive
         * @todo to implement
         */
        flushMinCoresFiles : function(){
    
            return ModuleBuildMin.flushMinFiles(fileListName);
    
        },

        /**
         * Gets the asked packageList into storage
         * @param {Boolean} dev @optional @default false
         */
        getPackagesDefinitionStorage : function(dev){

            var walibFilePath   = getWalibFolder().path,
                wafFilePath     = walibFilePath+'WAF/',     
                fileHelper      = require(wafFilePath+"builder/builder-fileHelper/fileHelper"),
                packagesDefinition,
                coresPackageDefinition,
                otherPackagesDefinition,
                wafThemesPath   = wafFilePath+"themes/",
                FOLDER_TYPE_WAF = "WAF",
                wafThemesFolder, i;
            
            //first concat the right cores (min or verbose with the rest of the definitions)
            try{
                otherPackagesDefinition = JSON.parse(fileHelper.getFile("builder/packages/packages.WAF.json", "WAF"));
            }
            catch(e){
                throw new Error("Parse error in file : builder/packages/packages.WAF.json in WAF - "+e.message);
            }
            if(dev){
                try{
                    coresPackageDefinition = JSON.parse(fileHelper.getFile("builder/packages/cores.packages.WAF.json", "WAF"));
                }
                catch(e){
                    throw new Error("Parse error in file : builder/packages/cores.packages.WAF.json in WAF - "+e.message);
                }
            }
            else{
                try{
                    coresPackageDefinition = JSON.parse(fileHelper.getFile("builder/packages/cores.min.packages.WAF.json", "WAF"));
                }
                catch(e){
                    throw new Error("Parse error in file : builder/packages/cores.min.packages.WAF.json in WAF - "+e.message);
                }
            }
            packagesDefinition = coresPackageDefinition.concat(otherPackagesDefinition);
            
            //then dinamically add the themes
            wafThemesFolder = Folder(wafThemesPath);
            
            wafThemesFolder.forEachFolder(function(folder){
                if(folder.files && folder.files.length > 0){
                    for(i=0; i<folder.files.length;i++){
                        //open only the package.json files, adjusting there name so we can use fileHelper API with the path WAF
                        if(folder.files[i].name === "package.json"){
                            packagesDefinition.push(JSON.parse(fileHelper.getFileContent(folder.files[i].path.replace(/(.*)walib\/WAF\//,""),FOLDER_TYPE_WAF)));
                        }
                    }
                }
            });
            
            return packagesDefinition;
            
        }
        
    };
    
    return ModuleBuildCores;
    
})();