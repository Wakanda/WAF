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
    
    var walibFilePath           = getWalibFolder().path,//@todo in WAFServer.init() ?
        wafFilePath             = walibFilePath+'WAF/',
        customWidgetFilePath    = wafFilePath+'wpmTests/packages.WidgetCustom.json',//temporary
        wafUrlPath              = '/',
        customWidgetUrlPath     = '/custom/',
        filePathTransco = {
            '+/'         : wafFilePath,
            '$custom/'   : customWidgetFilePath
        },
        urlPathTransco = {
            '+/'         : wafUrlPath,
            '$custom/'   : customWidgetUrlPath
        },
        fileHelper,
        _webFolderRootFilePath = application.getItemsWithRole( 'webFolder').path;
    
    fileHelper = {
                
        /**
         * Returns the filePath corresponding to the urlPath (using the joker prefixes)
         * @param {String} urlPath
         * @returns {String} filePath
         */
        getFilePath: function(urlPath){
            var prefix;
            for(prefix in filePathTransco){
                if(urlPath.indexOf(prefix) === 0){
                    return urlPath.replace(prefix,filePathTransco[prefix]);
                }
            }
            //if no prefix, return the filePath in the current webFolder
            return _webFolderRootFilePath.slice(0,_webFolderRootFilePath.length-1)+urlPath;
        },
                
        /**
         * Returns the realUrlPath (the one that would be served via http), using joker prefixes
         * @param {String} urlPath
         * @returns {String} realUrlPath
         */
        getRealUrlPath: function(urlPath){
            var prefix;
            for(prefix in urlPathTransco){
                if(urlPath.indexOf(prefix) === 0){
                    return urlPath.replace(prefix,urlPathTransco[prefix]);
                }
            }
            //if no prefix, return the filePath in the urlPath
            return urlPath;
        },

        /**
         * Returns the filePath + lastModifiedDate from a urlPath
         * @param {String} urlPath
         * @returns {Object}
         */
        getInfos: function(urlPath){
            var filePath = this.getFilePath(urlPath),file;
            file = File(filePath);
            if(file.exists){
                return {
                    path            : file.path,
                    lastModifiedDate: file.lastModifiedDate
                };
            }
            else{
                throw new Error("No file matching \""+filePath+"\"");
            }
        },

        /**
         * Returns the content of the file coresponding to the urlPath (using joker prefixes)
         * @param {String} urlPath
         * @returns {String}
         */
        getFile: function(urlPath){
            var result,filePath = this.getFilePath(urlPath);
            result = loadText(filePath);
            return result;
        }

    };
    
    return fileHelper;
    
    
})();