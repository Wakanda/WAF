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
    
    return {
        
        init : function(){
            
            var WAF_PACKAGES_DEFINITION_STORAGE_KEY  = 'wafPackagesDefinitionStorage',
                walibFilePath   = getWalibFolder().path,
                wafFilePath     = walibFilePath+'WAF/',
                buildCores      = require(wafFilePath+"builder/builder-build/build-cores");

            console.log('>buildInit() - mode : ',process.productType);
            //if we are on a debug build of the server, get plain WAF package definition (not the one with the core.min*)
            if(process.productType === "debug"){
                try{
                    storage.lock();
                    storage.setItem(WAF_PACKAGES_DEFINITION_STORAGE_KEY, buildCores.getPackagesDefinitionStorage(true));
                    storage.unlock();
                    console.log('>buildInit() DEBUG MODE - added plain WAF package definition');
                }
                catch(e){
                    storage.unlock();
                    console.log('>buildInit() DEBUG MODE - crashed while adding package definition to storage ',e);
                }
            }
            //if the minified files of the cores exist, inject the package definition with the min files version of the cores
            else if(buildCores.minCoresFilesExist()){
                console.log('>buildInit() - minified core files detected - try to add package definition to storage');
                try{
                    storage.lock();
                    storage.setItem(WAF_PACKAGES_DEFINITION_STORAGE_KEY, buildCores.getPackagesDefinitionStorage());
                    storage.unlock();
                    console.log('>buildInit() - added package definition to storage');
                }
                catch(e){
                    storage.unlock();
                    console.log('>buildInit() - crashed while adding package definition to storage ',e);
                    throw e;
                }
            }
            console.log('<buildInit()');
            //otherwise, do nothing, the handler will take care of it at the first call
            
        }
        
    };
    
})();