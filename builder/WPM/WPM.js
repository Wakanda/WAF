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

        /**
         * @scope current closure
         * @private vars
         */
        var WPM, 
            _pkg, 
            _packages,
            _packagesListManager,
            walibFilePath   = getWalibFolder().path,//@todo in WAFServer.init() ?
            wafFilePath     = walibFilePath+'WAF/',     
            fileHelper      = require(wafFilePath+"builder/builder-fileHelper/fileHelper"),
            builderLogger   = require(wafFilePath+"builder/builder-logger")(),
            FOLDER_TYPE_WAF = "WAF",
            FOLDER_TYPE_WEBFOLDER = "WEBFOLDER";




        /**
         * @scope current closure
         * @private _pkg (module builder)
         */   
        _pkg = {


            /**
             * @description Initialisation of the internal _pkg structure. The architecture was made to store 
             * @description all the errors in an array and send it back to the client a full list of possible 
             * @description errors. 
             *
             * @scope _pkg
             * @param {String} file - The file path to the package.json file
             * @param {String} platform - The platform (default, mobile, tablet) for this request 
             */   
            init : function(file, platform){

                this.listOfPackages  = {}; // holds the list of packages and their respective files 

                this.platform = platform || "desktop"; // assign desktop if platfor not defined
                           
                this.err = []; // store all the errors found in the package

                this.warnings = []; // store all the warnings found in the package

                this.mode = this.mode || "strict"; //strict or force, if force, ignores errors

                this.currentPackageFile = file || null; // this variable holds the current Package file being evaluated           

                this.fileStructure = {};

                this.fileStructure[file] = []; // store the files for each type (css, js, json) from valid packages

                this.listOfFiles = {}; //holds the final list of files to be returned               

                this.listOfFilesByType = {}; //holds the final list of files separated by type to be returned 

                this.packageFileName = []; //stores the package file names 

                this.wafpackages = [];

                this.treeLevel = []; //this structure is used to control and avoid recursive calls to already added packages

                this.level = 0; //this variable is used to show the current level from the treeLevel strucutre

                this.maxLevel = 1000; // this is just a precautious measure

            },


            /**
             * @description Verifies recursive problems with the package structure. 
             *  
             *
             * @scope _pkg
             * @param {String} package - The package file name 
             * @returns {Boolean} true if package has recursive Problems 
             * @error adds the recursive error to the error array 
             */  
            checkDuplicatedPackage : function (package) {
                var first = this.packageFileName[0];

                var lastLevel = this.treeLevel.length -1;
                
                //checking if package is not the first
                if (package === first && this.treeLevel[lastLevel] === 1) {
                     this.err.push("There is a package: " + package +
                                    " causing recursive problems. Please verify your package structure");
                    return true;
                }  

                //check if packaging is adding itself - 
                //avoiding the loop if package heritage = pk1->pkg2->pkg2
                //if (package === this.packageFileName[ this.treeLevel[lastLevel] - 1 ] ) {
                //     this.err.push("There is a package: " + package +
                //                    " causing recursive problems by trying to add itself to the same package. Please verify your package structure");
                //    return true;
                //}      

                //check if package not added before in the same tree of packages, 
                //avoiding the loop if package heritage = pk1->pkg2->pkg3->pkg2
                
                for (var k=lastLevel; k > -1; k--) {
                    if (this.treeLevel[k] !== 1 && this.treeLevel[k] < this.level ){
                        if (this.packageFileName[k] === package){
                            this.err.push("There is a package: " + package +
                                    " causing recursive problems, this package was already called before. Please verify your package structure");
                            return true;
                        }      
                    }
                }
               

                // avoiding looping if any other case failed ** along the years this should be deleted 
                if (lastLevel > this.maxLevel) {
                    this.err.push("There is a package: " + package +
                                    " causing serious recursive problems. More than "+ this.maxLevel +" calls were made. Please verify your package structure");
                    return true;                    
                }

                return false;

            },

            /**
             * @description Add the file information (TS, path, type and filesf to 
             * @description the listOfFiles and listOfFilesByType  
             *
             * @scope _pkg
             * @param {String} file - The package file name
             * @param {Object} elemLoad - the array number for the loadDependencies  
             */  
            addFile : function (index, package, elementIndex) {

                var info = package.loadDependencies[elementIndex];                
                
                // getting file extension
                var type = info.id.match(/[^.]*$/gi)[0].toLowerCase(); //json, css, js
                
                //detecting type package
                if (type.toLowerCase() === "json" ){
                    type = "package";
                }

                var rootPackage = this.listOfPackages[index];

                //adding files to  the list  (name, time stamp and type)
                if (! this.listOfFiles[index]){
             
                     this.listOfFiles[index] = {
                            "TS"  : fileHelper.getInfos(rootPackage.fileName, rootPackage.path).lastModifiedDate.toISOString(),
                            "path": rootPackage.path,
                            "files": [], 
                            "type" : rootPackage.type || 'package'
                        };

                    if (rootPackage.webComponent)
                        this.listOfFiles[index].wcMainJs = rootPackage.webComponent;

                }
                
                //check if the file exists before adding it
                try{
                    var fileTS = fileHelper.getInfos(info.id, info.path).lastModifiedDate.toISOString();
                }
                catch(e){
                    this.err.push("File "+info.id+" does not exist in "+info.path);
                    return;
                }
                
                //building the structure to be added
                var strut = {   "file": info.id,
                                "path": info.path,
                                "TS"  : fileTS,
                                "type": type
                            };   


                if (package.webComponent && type !== 'package' ) {
                    strut.wcKey = this.listOfFiles[index].wcMainJs;
                }

                //adding file 
                if (this.listOfFiles[index].files.indexOf(strut) === -1)  { 
                    this.listOfFiles[index].files.push(strut);
                }    

                //adding files by type
                if (info.id && type !== "package") {
                    if (! this.listOfFilesByType[type]){
                        this.listOfFilesByType[type] = [];
                    }  
                    if (this.listOfFilesByType[type].indexOf(info.id) === -1)  { 
                        this.listOfFilesByType[type].push(info.id);
                    }   
                }
            },


            /**
             * @description Returnsthe version array with all the versions available for this package. 
             *
             * @scope _pkg
             * @param {Object} myPackage - The package information 
             * @return {Array} - all the versions for the package
             */  
            getVersions : function (myPackage) {

                //local variables 
                var id, i;
                //getting all the version available for this package
                var versions = [];

                if (typeof myPackage === 'string') {
                    id = myPackage;
                } else {
                    id = myPackage.id;
                }


                for (i = 0; i < _packages.length; i++) {
                    if (id === _packages[i].name) {
                        if (_packages[i].version)
                            versions.push(_packages[i].version);
                    }
                }

                return  versions;

            },   

            /**
             * @description returns the appropriated version in the package (all versions are in the arr)
             *
             * @scope _pkg
             * @param {Array} arr - the list of versions available 
             * @param {Array} token - the token associated ">, >=, !=, etc 
             * @param {Array} value - the version value 
             * @return {String} version - the version available for this package 
             */  
            findVersion: function (arr, token, value) {

                var result, last_version, next_version, previous_version, i;

                //calculating the last version
                for (i = 0; i < arr.length; i++) {
                    
                    //adding last_version
                    if (last_version){
                        if (last_version < arr[i]) {
                          last_version = arr[i];
                        }
                    } else {
                        last_version = arr[i];
                    }

                    if (value) {
                        //adding last_version
                        if (next_version){
                            if (value < arr[i]) {
                                if (next_version > arr[i]){
                                    next_version = arr[i];
                                }                           
                            }
                        } else {
                            if (value < arr[i]) {
                                next_version = arr[i];
                            }
                        }
               

                        if (previous_version){
                            if (value > arr[i]) {
                                if (previous_version < arr[i]){
                                    previous_version = arr[i];
                                }                           
                            }
                        } else {
                            if (value > arr[i]) {
                                previous_version = arr[i];
                            }
                        }         
                    }
                }

                if (token) {
                    switch (token) {
                        case ">=" :
                            result = value || last_version || next_version;
                            break;
                        case ">" :
                            result = last_version || next_version;
                            break;
                        case "<=" :
                            result = value || previous_version;
                            break;
                        case "<" :
                            result = previous_version;
                            break;
                        case "=" :
                            result = value || next_version || last_version;
                            break;
                        case "!=" :
                            result = next_version || previous_version || (value !== last_version ? last_version : undefined );
                            break;
                        default:
                            result = last_version;
                            break;
                    }
                } else {
                    result = last_version;
                }    

                return result;
            },

            /**
             * @description returns the version best suited for the package 
             *
             * @scope _pkg
             * @param {Obj} package - the package information 
             * @param {Array} arr - the list of versions available 
             * @return {String} - the last version available for this package 
             */  

            getPackageVersion: function (package, arr) {
                var version;

                if (package.version) {
                    var token = package.version.match(/(^<=|^>=|^!=|^<|^>|^=)(.*)/);
                    if (token){
                        version = this.findVersion(arr, token[1], token[2]); 
                    } else {
                        version = package.version;             
                    }

                } else {
                    version = this.findVersion(arr); //get latest version
                } 

                if (! version){
                    this.err.push("Unable to find a proper version for package " + JSON.stringify(package));
                }
                return version || null ;
            },


            /**
             * 
             *
             * @scope _pkg
             * @param {String} fileName : the name of the package file    
             * @param {String} path : the relative path to the file     
             * @return {Object} the package object containing all the info about the package  
             * @error    
             */ 
            loadPackageFromDisk: function(fileName, path) {
                   
                    var myPackage = {};
                    var packageFromDisk = fileHelper.getFile(fileName, path);

                    if(packageFromDisk.exists){               

                        //getting the file 
                        myPackage = JSON.parse(packageFromDisk.toString());

                        //adding the full name of the file into the package structure
                        myPackage.fileName = fileName; 
                        myPackage.fullPath = packageFromDisk.path;
                        myPackage.path = path;

                        //adding the package to the list of available packages having the fileName as key 
                        if (! this.listOfPackages[fileName]){
                            this.listOfPackages[fileName] = {};
                        }

                        this.listOfPackages[fileName] = myPackage;  

                        //incrementing the level for each new package 
                        this.level++;
                        
                        //Adding the package to packageFileName array, so we can verify recursive problems
                        this.packageFileName.push(fileName);

                        //adding the level to a treeLevel object, so we can verify recursive problems
                        this.treeLevel.push(this.level);
                    }

                    return myPackage;
            },



            /**
             * 
             *
             * @scope _pkg
             * @param {}   
             * @return {} 
             * @error    
             */ 
            getVerifiedPackage : function (myPackage, path) {
                
                //if string, its a package, then load file to myPackage obj
                //if not a string, the myPackage is already an object, ready for use   
                var str =  typeof myPackage;        
                if (str.toLowerCase() === "string"){
                  myPackage = this.loadPackageFromDisk(myPackage, path);
                } 

                if (Object.keys(myPackage).length !== 0) { //testing if myPackage is valid
                    //testing if the package name exists
                    if (this.verifyName(myPackage)) {   
                        //testing if version exist, if not assign a version
                        if (! this.verifyVersion(myPackage)) {
                            myPackage.version = this.findVersion(this.getVersions(myPackage));
                        }
                    } else {
                        this.err.push("The file " + myPackage + " does not contain a proper definition of a package, please verify if package name exists");
                    }

                    //if the package doesn't exist, we add it to the list of known packages
                    if(_packagesListManager.packageExists(myPackage.name,myPackage.version) === false){
                        _packages.push(myPackage);
                    }
                    
                    //if the myPackage.loadDependencies is not array, then this is a platform based package (with 
                    // default, mobile, tablet...). As a result, we need to get the array inside the loadDependencies of the platform
                    if (! myPackage.loadDependencies.length){           
                        myPackage.loadDependencies = myPackage.loadDependencies[this.platform];
                    }
                } 

                return myPackage;   
            },

            /**
             * @description Opens the package.json file then reccursively adds all the other packages
             * 
             * @param {String} or {Object} myPackage : the package file name or the full package object 
             * @param {String} path : the relative path to the package (in the case is the package file name)
             * @returns {} 
             */
            getPackageInfo: function(myPackage, path){
                var file, version, info, j, myPath, myFile, lastPackage;

                //getting the information about the package

                myPackage = this.getVerifiedPackage(myPackage, path);             
             
                //treating all 3 types of dependencies (PACKAGE, FILE, WAF LIBRARY): 
                if(myPackage.loadDependencies && myPackage.loadDependencies.length > 0){

                    //for each dependency
                    for(j=0;j<myPackage.loadDependencies.length;j++){

                        if (! myPackage.loadDependencies[j].id && typeof myPackage.loadDependencies[j] !== 'string') {
                            this.err.push("Missing obligatory information : 'id' is not assigned for " +
                                JSON.stringify(myPackage.loadDependencies[j]) );
                                return;                             
                         } 

                        if (myPackage.loadDependencies[j]["studioOnly"] && myPackage.loadDependencies[j]["studioOnly"] === true) continue; 

                        if (myPackage.loadDependencies[j].path && myPackage.loadDependencies[j].path.length !== 0) {


                            if (myPackage.loadDependencies[j].id.match(/package\.json/gi)) {

                                // #############################
                                // ######## PACKAGE ############
                                // #############################
                                myPath = myPackage.loadDependencies[j].path || FOLDER_TYPE_WEBFOLDER;
                                myFile = myPackage.loadDependencies[j].id;
                                
                                //adding currentPackageFile to the structure
                                this.fileStructure[this.currentPackageFile].push(myFile);
                                lastPackage = this.currentPackageFile;

                                //addigning new currentPackageFile
                                this.currentPackageFile = myFile;

                                //creating the fileStructure for this currentPackageFile if does not exist
                                if (! this.fileStructure[this.currentPackageFile]){
                                    this.fileStructure[this.currentPackageFile]=[];
                                }


                                if (! this.checkDuplicatedPackage(myPackage.loadDependencies[j].id)) {
                               
                                    //recursive call
                                    this.getPackageInfo(myFile, myPath);   
                                    //getting back to right level                      
                                    this.level--;

                                    this.addFile(lastPackage, myPackage, j );
                                    
                                    //going back one level to get the last currentPackageFile
                                    this.currentPackageFile = lastPackage;

                                }
                            } 
                            else { 
                                // ######################
                                // ######## FILE ########
                                // ######################
                                this.addFile(this.currentPackageFile, myPackage, j );

                            }

                        } else { 
                            // ################################
                            // ######## WAF LIBRARY ###########
                            // ################################

                            if (typeof myPackage.loadDependencies[j] === 'string') {
                                file = myPackage.loadDependencies[j];
                            } else {
                                file = myPackage.loadDependencies[j].id;
                            }

                            //myPackage.version 
                            version = this.getPackageVersion(myPackage.loadDependencies[j], this.getVersions(file));

                            info = _packagesListManager.getFullPackageInfo(file,version); 
                            
                            if (info) {
                                //loading the waf packages just once, if package already loaded, lets skip it. 
                                if (this.wafpackages.indexOf(info.name) === -1)  { 
                                    this.wafpackages.push(info.name);
                                    this.getPackageInfo(info, null);
                                    this.fileStructure[this.currentPackageFile].push(file);
                                }
                            } else {
                                if (myPackage.loadDependencies[j].version) {
                                    this.err.push("No package found for " + file + 
                                                    " " + myPackage.loadDependencies[j].version);

                                } else { 
                                    this.err.push("No package found for " + file + 
                                        " if this is a file, make sure the 'path' information is correct and available");
                                }
                            }
                        }  
                    }
                }              
            },

            /**
             * 
             * @param {String} urlPath The url path to the package.json file (will be transcoded)
             * @returns {Object} the package opened at packageFilePath
             * @trows error if can't open package
             */
            loadFile: function(urlPath){
                var result;
                try{
                    var result = fileHelper.getFileContent(urlPath);
                    return JSON.parse(result);
                }
                catch(e){
                    //log error
                    throw new Error("Impossible to load file ["+fileHelper.getFilePath(urlPath)+"]");
                }
            },


            /**
             * 
             *
             * @scope _pkg
             * @param {}   
             * @return {} 
             * @error    
             */ 
            verifyName : function (obj) {

                if (obj.name){
                    return true;
                } else {
                    this.err.push("The attribute 'name' is missing from the object : " + JSON.stringify(obj));
                    return false;
                }
            },

            /**
             * 
             *
             * @scope _pkg
             * @param {}   
             * @return {} 
             * @error    
             */ 
            verifyVersion : function (obj) {

                if (obj.version) {
                    return true ;
                } else {
                    this.warnings.push("Package : " + obj.name + " has no version associated by the arguments" );
                    return false;
                }

            },



            /**
             * 
             *
             * @scope _pkg
             * @param {}   
             * @return {} 
             * @error    
             */ 
            setMode : function (mode) {
        
                this.mode = mode;

            },


            /**
             * 
             *
             * @scope _pkg
             * @param {}   
             * @return {} 
             * @error    
             */             
             getPackageNames : function() {

                var result = [], k;
                for (k = 0; k < _packages.length; k++) {
                    result.push({
                        name : _packages[k].name,
                        version : _packages[k].version
                    });
                }
                
                return result;

            },

            /**
             * 
             * @param {String} packageFilePath The file path to the package.json file
             * @returns {Object} the package opened at packageFilePath
             * @trows error if can't open package
             */
            getPackageFile: function(packageFilePath, path){
                var result;
                try{
                    result = fileHelper.getFileContent(packageFilePath, path);
                    return JSON.parse(result);
                }
                catch(e){
                    //log error ?
                    throw e;
                }
            },

            /**
             * 
             *
             * @scope _pkg
             * @param {}   
             * @return {} 
             * @error    
             */ 
            getFullPath : function (path, file) {
                var str = path + file;
                return str.replace(/\/\//gi, "\/");
            }

        };
        
        /**
         * @scope current closure
         * @private _packagesManager (packages list updater)
         */
        _packagesListManager = {

            /**
             * 
             *
             * @scope _packagesListManager
             * @param {}   
             * @return {} 
             * @error    
             */ 
            packageExists: function(packageName, version){
                var i;

                if (version === null) {
                    for(i = 0; i<_packages.length; i++){
                        if(_packages[i].name === packageName && ! _packages[i].version) {
                            return true;
                        }
                    }

                }else {
                    for(i = 0; i<_packages.length; i++){
                        if(_packages[i].name === packageName && (version ? _packages[i].version === version : true)){
                            return true;
                        }
                    }

                }
                return false;
            },


            /**
             * 
             *
             * @scope _packagesListManager
             * @param {}   
             * @return {} 
             * @error    
             */ 
            getFullPackageInfo: function(packageName, version){
                var i;
                for(i = 0; i<_packages.length; i++){
                    if(_packages[i].name === packageName && (version ? _packages[i].version === version : true)){
                        return _packages[i];
                    }
                }
                return;
            },

            /**
             * 
             *
             * @scope _packagesListManager
             * @param {}   
             * @return {} 
             * @error    
             */ 

            addPackageToList: function(package, flagNotExists){
                var i;
                
                //case this is a list of packages
                if(package.length && package.length > 0){
                    for(i=0;i<package.length;i++){
                        //if the package doesn't exist, we add it to the list
                        if(this.packageExists(package[i].name, package[i].version) === false){
                            this.addPackageToList(package[i], true);//flagNotExits to true, not to test if exists the next time (optimization)
                        }
                    }
                }
                //case this is a single package
                else{
                    //only add the package if it doesn't already exists
                    if(flagNotExists || this.packageExists(package.name,package.version) === false){
                        _packages.push(package);
                    }
                }
            },
            
            clear: function(){
                _packages = [];
            }
            
        };

        /**
         * @class WPM (WAF Package Manager)
         * @public
         * @scope global
         */
        
        WPM = {
            
            /**
             * Initialize WPM
             * - init _webFolderRootFilePath
             * - reinit _packages with only the WAF packages
             * - then adds the custom widget packages
             */
            load: function(packages){

                //add the WAF core, widgets, etc
                if (packages) 
                    _packages = packages;
                else
                    _packages = _pkg.getPackageFile('builder/packages/packages.WAF.json', FOLDER_TYPE_WAF);
      
            },
            

            /**
             * @returns {_L1._packages}
             */

            getRawData : function(){

                return _packages;
                
            },


            /**
             * 
             * @param {String} packageFilePath The file path to the package.json file
             * @returns {Object} The files (resolved by loadDependencies) to include from the package.json
             */
            getPackageList: function(file, path, platform, debugMode, mode, packages){

                builderLogger('WPM.getPackageList() has been called');

                this.load(packages);

                //defining the package mode : strict or force 
                _pkg.mode = mode || null ;

                path = path || FOLDER_TYPE_WEBFOLDER;

                //initialising all the objects in the class 
                _pkg.init(file, platform);


                //loading physical files into the library
                _pkg.getPackageInfo(file, path);  

                //debugger;
                //throw errors if no force mode
                if (_pkg.err.length > 0 && _pkg.mode !== "force") {
                    throw new Error(_pkg.err.join('\n'));
                }
                //log errors in force mode
                else if(_pkg.err.length > 0){
                    console.warn(_pkg.err.join(' - '));
                }

                if (debugMode) 
                    return _pkg.listOfFilesByType;
                else 
                    return _pkg.listOfFiles; 
 
            },
                                
            /**
             * @todo by ricardo
             * 
             * @param {String} packageFilePath
             * @returns {Object} An object to be saved to package list obj_libs and to be process to build list
             * @throws error if a package is not available
             */
            getPackage: function(file, path, platform, debugMode, mode, packages){

                return this.getPackageList(file, path, platform, true, mode, packages);
                
            },
 
            /**
             * @returns {Object}
             */

            getPackageNames : function () {

                return _pkg.getPackageNames();

            },
            
            /**
             * @description Debug method
             * @returns {String} Complete package list in _packages
             */
            _getCompletelist: function(){
                var result = '',i;
                for(i=0;i<_packages.length;i++){
                    result+="\n"+_packages[i].name;
                }
                return result;
            }
            
        };
    
    return WPM;
    
})();
