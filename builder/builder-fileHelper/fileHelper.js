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
    
    //@todo c++ side ? (virtualFolders)
    var urlPathSettings = {
        "WALIB" : "/walib/",
        "WAF" : "/walib/WAF/",
        "WEBFOLDER" : "/",
        "WIDGETS_CUSTOM" : "/widgets-custom/",
        "THEMES_CUSTOM" : "/themes-custom/"
    };
    if('virtualFolder' in settings) {
        settings.virtualFolder.forEach(function(virtualFolder) {
            // we remove the "/" before and after the location
            var location = virtualFolder.location.slice(1, -1);
            urlPathSettings[location] = '/' + virtualFolder.name + '/';
        });
    }
    
    var fileHelper = {
        urlPathSettings: urlPathSettings,
                
        /**
         * Returns the filePath corresponding to the relativePath, using the parentPath (@see the keyword list in doc)
         * @param {String} relativePath
         * @returns {String} parentPath
         */
        getFilePath: function(relativePath, parentPath){
            return this._resolveFile(relativePath, parentPath).path;
        },
                
        /**
         * Returns the urlPath (accessible via http) corresponding to the relativePath, using the parentPath (@see the keyword list in doc)
         * @param {String} relativePath
         * @returns {String} parentPath
         */
        getHttpPath: function(relativePath, parentPath){
            if(urlPathSettings[parentPath]){
                return urlPathSettings[parentPath]+relativePath;
            }
            else{
                return relativePath;
            }
        },

        /**
         * Returns the filePath + lastModifiedDate from a relativePath, using the parentPath
         * @param {String} relativePath
         * @returns {String} parentPath
         * @returns {Object}
         */
        getInfos: function(relativePath, parentPath){
            var file = this._resolveFile(relativePath, parentPath);
            if(file.exists){
                return {
                    path            : file.path,
                    lastModifiedDate: file.lastModifiedDate
                };
            }
            else{
                throw new Error("fileHelper.getInfos() : No file matching \""+relativePath+"\"");
            }
        },
        /**
         * Returns the File object of the file coresponding to the relativePath, using the parentPath (@see the keyword list in doc)
         * @param {String} relativePath
         * @returns {String} parentPath
         * @returns {File}
         */
        getFile: function(relativePath, parentPath){
            return this._resolveFile(relativePath, parentPath);
        },
        /**
         * Returns the content of the file coresponding to the relativePath, using the parentPath (@see the keyword list in doc)
         * @param {String} relativePath
         * @returns {String} parentPath
         * @returns {File}
         */
        getFileContent: function(relativePath, parentPath){
            return this._resolveFile(relativePath, parentPath).toString();
        },
        /**
         * Returns File from relative and parent path
         * @param {String} relativePath
         * @param {String} parentPath
         * @returns {File}
         */
        _resolveFile: function(relativePath, parentPath){
            parentPath = parentPath || "WEBFOLDER";
            //@todo make a WAF alias
            if(parentPath === "WAF"){
                relativePath = "WAF/"+relativePath;
                parentPath = "WALIB";
            }
            try{
                return File(FileSystemSync(parentPath), relativePath);
            }
            catch(e){
                throw new Error("Can't resolve file "+relativePath+", "+parentPath+"\n"+e.message);
            }
        }

    };
    
    return fileHelper;
    
    
})();
