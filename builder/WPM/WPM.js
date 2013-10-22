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
        var WPM, _pkg, _packages,
            walibFilePath           = getWalibFolder().path,//@todo in WAFServer.init() ?
            wafFilePath             = walibFilePath+'WAF/',
            customWidgetFilePath    = wafFilePath+'builder/WPM/packages.WidgetCustom.json',//temporary a json array (will be the folder of the custom widgets, will have to loop through the pacjage.json of the widgets)
            _webFolderRootFilePath,
            PACKAGE_TYPE_WAF            = 'WAF',
            PACKAGE_TYPE_CORE           = 'CORE',
            PACKAGE_TYPE_CUSTOMWIDGET   = 'CustomWidget',
            PACKAGE_TYPE_PAGE           = 'Page',
            PACKAGE_TYPE_WEBCOMPONENT   = 'WebComponent',
            PACKAGE_TYPE_PACKAGE        = 'Package',
            _packagesListManager,
            fileHelper                  = require(wafFilePath+"builder/builder-fileHelper/fileHelper");     
        
        /**
         * @scope current closure
         * @private _packages
         * @description packages list - managed by _packagesListManager / used by _pkg
         */
        //_webFolderRootFilePath;
        
        /**
         * @scope current closure
         * @private _packages
         * @description packages list - managed by _packagesListManager / used by _pkg
         */
        _packages = [];
        
        /**
         * @scope current closure
         * @private _pkg (module builder)
         */
        _pkg = {

            build : function(){                

                //for (var p in this.args) {
                    var mainPackage = this.arr_files[0];

                    //testing if the package name exists
                    if (this.verifyName(mainPackage)) {

                        //testing if version exist, if not assign a version
                        if (! this.verifyVersion(mainPackage)) {
                            mainPackage.version = this.addVersion(mainPackage);
                        }

                        //add dependencies                      
                        if (mainPackage.dependencies){
                            this.addDependencies(mainPackage);
                        }

                        //add main package
                        this.addPackage(mainPackage);
                        
                    }    
                    
                //}

                //verify all packages
                this.verifyPackage();

            },
            init : function(file){

                this.args           = []; //this.argsToArray(obj); 
                this.main           = []; // holds full objects to be treated (name, version etc)
                this.arr_pkg        = []; // holds the list of valid packages names
                this.arr_ver        = []; // holds the list of valid packages versions
                this.arr_files      = []; // holds the list of valid files
                this.currentFile    = file || null;
                this.err            = []; // store all the errors found in the package
                this.warnings       = []; // store all the warnings found in the package
                this.mode           = this.mode || "strict"; //strict or force, if force, ignores errors
                this.files          = {}; // store the files for each type (css, js, json) from valid packages
                this.packageList    = {};
                this.tree           = {}; // store the files for each type (css, js, json) from valid packages
                this.fileStructure  = {};
                this.fileStructure[file] = []; // store the files for each type (css, js, json) from valid packages
                  // adding the arguments to the valid package list

            },

             
            load : function () {

                var mainPackage, arr = [], single;

                mainPackage = this.arr_files[0];
                
                mainPackage = mainPackage || 'allmodules';
                if (mainPackage instanceof Array) {
                    arr = mainPackage;
                } else {
                    if (typeof mainPackage === 'string'){
                        single = { name : mainPackage };
                        arr.push(single);
                    } else {
                        arr.push(mainPackage);
                    }
                }

                this.args = arr;

            },

            /**
             * @description Opens the package.json file then reccursively adds any module of a webcomponent inside the package.json to _packages
             * @param {String} packageFilePath The file path to the package.json file
             * @param {String} forceStandalonePackage true if you want to be sure to process a file with only one package declared
             * @returns {Object} the package opened at packageFilePath
             */
            getPackageFromDisk: function(myPackage, obj){
                 
                //testing type of package             
                if (typeof myPackage === "string"){
                    var file = myPackage;
                    myPackage = this.loadFile(myPackage);   
                    //adding the file information to the package
                    myPackage.fileName = file;            
                    this.arr_files.push(myPackage);     
                } 

                //testing if the package name exists
                if (this.verifyName(myPackage)) {   
                    //testing if version exist, if not assign a version
                    if (! this.verifyVersion(myPackage)) {
                        myPackage.version = this.addVersion(myPackage);
                    }
                } else {
                    this.err.push("The file " + file + " does not contain a proper definition of a package, please verify if package name exists");
                    return;
                }

                //if the package doesn't exist, we add it to the list
                if(_packagesListManager.packageExists(myPackage.name,myPackage.version) === false){
                    _packages.push(myPackage);//flagNotExits to true, not to test if exists the next time (optimization)
                    //if the package has dependencies, loop through the dependencies, look for a WebComponent (to add its nested modules)
                }
            
                obj[myPackage.name] = {};  
             
                if(myPackage.dependencies && myPackage.dependencies.length > 0){

                    for(var j=0;j<myPackage.dependencies.length;j++){
                        
                        //if (! this.fileStructure[this.currentFile]){
                        //    this.fileStructure[this.currentFile]=[];
                        //}
                        if (myPackage.dependencies[j].path && myPackage.dependencies[j].path.length != 0) {
                            this.fileStructure[this.currentFile].push(myPackage.dependencies[j].name);
       
                            this.currentFile = myPackage.dependencies[j].path;
                            if (! this.fileStructure[this.currentFile]){
                                this.fileStructure[this.currentFile]=[];
                            }
                           
                            obj[myPackage.name] = this.getPackageFromDisk(myPackage.dependencies[j].path, obj[myPackage.name] );
                        } else {
                            var info = _packagesListManager.getFullPackageInfo(myPackage.dependencies[j].name, myPackage.dependencies[j].version);
                            obj[myPackage.name] = this.getPackageFromDisk(info, obj[myPackage.name]);
                            this.fileStructure[this.currentFile].push(myPackage.dependencies[j].name);
                        }          



                    }
                } 
                return obj;              
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
                    var result = fileHelper.getFile(urlPath);
                    return JSON.parse(result);
                }
                catch(e){
                    //log error
                    throw new Error("Impossible to load file ["+fileHelper.getFilePath(urlPath)+"]");
                }
            },



            // transforming the argument obj (it can be a string, obj or array) to an array
    
            argsToArray : function (obj) {

                var arr = [], single;
                obj = obj || 'allmodules';
                if (obj instanceof Array) {
                    arr = obj;
                } else {
                    if (typeof obj === 'string'){
                        single = { name : obj };
                        arr.push(single);
                    } else {
                        arr.push(obj);
                    }
                }

                return arr;

            },

            verifyName : function (obj) {

                if (obj.name){
                    return true;
                } else {
                    this.err.push("The attribute 'name' is missing from the object : " + JSON.stringify(obj));
                    return false;
                }
            },

            verifyVersion : function (obj) {

                if (obj.version) {
                    return true ;
                } else {
                    this.warnings.push("Package : " + obj.name + " has no version associated by the arguments" );
                    return false;
                }

            },


            addPackage : function (obj) {
        
                //if obj.name exists
                if (this.verifyName(obj)) {
                    //if obj.version dos not exist, get a version
                    if (! this.verifyVersion(obj)) {
                        obj.version = this.addVersion(obj);
                    }
                    // verifying if the package has not been added
                    if (this.isPackageUnique(obj)){
                        //add the package to the list of valid packages
                        this.registerPackage(obj);
                    } else {
                        // package has been added before, lets warn the fact
                        this.warnings.push("Package : " + obj.name + " Version : " + obj.version + " was already added to the package list");
                        // if the mode is set to force, then override and add the package to the list anyways
                        if (this.mode === 'force') {
                            this.warnings.push("Package : " + obj.name + " Version : " + obj.version +" has being added by 'force' argument ");
                            this.registerPackage(obj);
                        }
                    }
                }

            },


            //it will add a version in the following sequence:

            //1. if attribute "current" from _package is set to true,

            //2. last version if no current available

            //3. set to invalid

            addVersion : function (obj) {

                var i, last_version, current;
                var versions = [];
                for (i = 0; i < _packages.length; i++) {
                    // testing if we have the package
                    if (_packages[i].name === obj.name){
                        //adding the version to the list of versions available for the package
                        if (! _packages[i].version) {
                            this.err ("Package : " + _packages[i].name +  " has no version in the Wakanda package list");
                        } else {
                            versions.push(_packages[i].version);
                           //adding last_version
                            if (last_version){
                                if (last_version < _packages[i].version) {
                                  last_version = _packages[i].version;
                                }
                            } else {
                                last_version = _packages[i].version;
                            }
                            if (_packages[i].current === true) {
                                this.warnings.push("Package : " + _packages[i].name + " Version : " + _packages[i].version + " has being added by the default attribute ");
                                current = _packages[i].version;
                            }
                        }
                    }
                }

                if (versions.length === 0) {
                    this.err.push("Package " + obj.name + " has invalid version");
                }

                return  current || last_version  || 'invalid';

            },

            //Returns true if package not yet in the valid list (arr_pkg).

            isPackageUnique : function (obj) {

                var unique = true, k;
                for (k = 0; k < this.arr_pkg.length; k++) {
                    if (this.arr_pkg[k] === obj.name && this.arr_ver[k] != obj.version) {
                        this.err.push("conflict with the Package : " +
                            this.arr_pkg[k] + " version " + this.arr_ver[k] + " and Package " + obj.name + " version " + obj.version);
                    } else {
                        if (this.arr_pkg[k] === obj.name && this.arr_ver[k] === obj.version){
                            unique = false;
                        }
                    }
                }

                return unique;

            },

            // keep this.main with the list of valid objects

            // add package name and version to arr_pkg and arr_ver

            registerPackage : function (obj) {

                    this.arr_pkg.push(obj.name);
                    this.arr_ver.push(obj.version);
                    this.main.push(obj);

            },

            //recursive method, it will add all the package dependencies in the right order. 

            addDependencies : function (obj) {
                
               var i,l,strut;
               //getting all packages inside obj
               if (! this.verifyVersion(obj)) {
                    obj.version = this.addVersion(obj);
               }

                //looping thru all the packages available
                for (i = 0; i < _packages.length; i++) {
                    //if packages match
                    if (_packages[i].name === obj.name && _packages[i].version === obj.version){
                        //verify if dependencies exists
                        if (_packages[i].dependencies) {
                            // get all dependencies
                            for (l = 0; l < _packages[i].dependencies.length; l++) {
                                strut = _packages[i].dependencies[l];
                                //add the platform if not specified
                                strut.platform = obj.platform || "desktop";
                                //verify if package not in the list
                                if (this.isPackageUnique(strut)) {
                                    //recursively add the package
                                    this.addDependencies(strut);
                                    //add to arrays
                                    this.addPackage(strut);
                                    //add to main the package
                                    this.main.unshift(strut);
                                }
                            }
                        }
                    }
                }

            },
                    
            // last verification to see if all packages have being treated
            verifyPackage : function () {

                var i,k,exist;
                // looping thru all the packages included in the main array
                for (i = 0; i < this.arr_pkg.length; i++) {
                    //looping thru packages
                    exist = false;
                    for (k = 0; k < _packages.length; k++) { 
                        //if both structures match 
                        if (_packages[k].name === this.arr_pkg[i] && _packages[k].version === this.arr_ver[i]) {
                            // flagging the  package 
                            exist = true;
                        }
                    }
                    if (! exist) {
                        this.err.push("Package : " + this.arr_pkg[i] + " Version : " + this.arr_ver[i] + " not found in the list of available packages");
                    }
                }

            },


            addPlatform : function (pkg, version) {

                var i;
                for(i=0; i < this.main.length; i++) {
                    if (this.main[i].name === pkg && this.main[i].version === version){
                        return this.main[i].platform || 'desktop';
                    }
                } 

                //making sure we set the return to the default

                return 'desktop';

            },

            addFiles : function () {

                var k,i,f,l,p,arr,plat;
                //looping the arr structure created in the previous steps that contains a list of packages to be included 
                for (i = 0; i < this.arr_pkg.length; i++) {
                    //looping thru Wakanda packages
                    for (k = 0; k < _packages.length; k++) {
                        //if both structures match the name and the version
                        if (_packages[k].name === this.arr_pkg[i] && _packages[k].version === this.arr_ver[i]) {
                            //getting the platform (desktop, mobile ...)
                            //console.log(_packages[k].name + '  -  ' + _packages[k].version);
                            plat = this.addPlatform(this.arr_pkg[i], this.arr_ver[i]);
                            //looping thru all the files type : css, js, json, c++ etc
                            for (f in _packages[k].files) {
                                //creating the default paramenter
                                arr = ["default"];
                                //adding the platform
                                arr.push(plat);
                                //looping thru "default" and the platform (mobile, desktop...)
                                for (p in arr){
                                    //if any files exists for that plaform
                                    if (_packages[k].files[f][arr[p]]) {
                                        //looping thru all files
                                        for (l = 0; l < _packages[k].files[f][arr[p]].length; l++) {
                                            //adding the type (css, js, json) of the file to the pkg.files 
                                            if (! this.files[f]){
                                                this.files[f] = [];
                                            }
                                            //adding the file if not yet in the list
                                            if (this.files[f].indexOf(_packages[k].files[f][arr[p]][l]) === -1){
                                                this.files[f].push(_packages[k].files[f][arr[p]][l]);
                                            } else {
                                                this.warnings.push("File : " + _packages[k].files[f][arr[p]][l] + " was already added to the list");
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            },





            getFiles : function (lib) {
                var info = [];
                for (var k = 0; k < _packages.length; k++) {
                    //if both structures match the name and the version
                    if (_packages[k].name === lib.name && _packages[k].version === lib.version) {
                        //getting the platform (desktop, mobile ...)
                        //console.log(_packages[k].name + '  -  ' + _packages[k].version);
                        plat = this.addPlatform(lib.name, lib.version);
                        //looping thru all the files type : css, js, json, c++ etc

                        for (f in _packages[k].files) {
                            //creating the default paramenter
                            arr = ["default"];
                            //adding the platform
                            arr.push(plat);
                            //looping thru "default" and the platform (mobile, desktop...)
                            for (p in arr){

                                //if any files exists for that plaform
                                if (_packages[k].files[f][arr[p]]) {
                                    //looping thru all files
                                    for (l = 0; l < _packages[k].files[f][arr[p]].length; l++) {
                                        //adding the type (css, js, json) of the file to the pkg.files 
                                        if (! this.files[f]){
                                            this.files[f] = [];
                                        }

                                        //adding the file if not yet in the list
                                        if (info.indexOf(_packages[k].files[f][arr[p]][l]) === -1){

                                            var fileName = _packages[k].files[f][arr[p]][l];
                                            info.push({ "file": fileName, 
                                                         "TS" : fileHelper.getInfos(fileName).lastModifiedDate, 
                                                         "type" : f });
                                            
                                        } else {
                                            this.warnings.push("File : " + _packages[k].files[f][arr[p]][l] + " was already added to the list");
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return info;
            },

            prepareInfo : function (lib) {

                for (var i = 0; i < this.arr_pkg.length; i++){

                    if (this.arr_pkg[i] === lib){

                        return { "name" : this.arr_pkg[i], "version" : this.arr_ver[i]}
                    }
                }
            },

            isPackage : function (lib) {

                for (var k = 0; k < this.arr_files.length; k++) {
                    if (this.arr_files[k].name === lib){
                        return true;
                    } //add own files
                }
                return false;
            },


            addFilesToList : function () {

                for (var file in this.fileStructure) {

                    this.packageList[file] = {};
                    this.packageList[file]["TS"] = fileHelper.getInfos(file).lastModifiedDate;
                    this.packageList[file]['files'] = []; 

                    //adding dependencies
                    for (var i = 0 ; i < this.fileStructure[file].length ; i++) {
                        if (! this.isPackage(this.fileStructure[file][i])){
                            var strut = this.prepareInfo(this.fileStructure[file][i]);
                            var arr  = this.getFiles(strut);
                            for (info in arr){
                                this.packageList[file]['files'].push(arr[info]); 
                            }
                        }
                    }
                    //adding packages
                    for (var i = 0 ; i < this.fileStructure[file].length ; i++) {
                        if (this.isPackage(this.fileStructure[file][i])){
                            for (var k = 0; k < this.arr_files.length; k++) {
                                if (this.arr_files[k].name === this.fileStructure[file][i] ){
                                   this.packageList[file]['files'].push ({ "file": this.arr_files[k].fileName, 
                                                             "TS" : fileHelper.getInfos(this.arr_files[k].fileName).lastModifiedDate, 
                                                             "type" : 'package' }); 
                                } //add own files
                            }
                        }
                    }
                    //adding files from the package.json
                    for (var k = 0; k < this.arr_files.length; k++) {

                        if (this.arr_files[k].fileName === file){

                            var strut = this.prepareInfo(this.arr_files[k].name);
                            var arr  = this.getFiles(strut);
                            for (info in arr){
                                this.packageList[file]['files'].push(arr[info]); 
                            }
                        } //add own files
                    }
                }
            },

 

            setMode : function (mode) {
        
                this.mode = mode;

            },

            getPackageNames : function() {

                var result = [], k;
                for (k = 0; k < _packages.length; k++) {
                    result.push({
                        name : _packages[k].name,
                        version : _packages[k].version
                    });
                }
                
                return result;

            }

        };
        
        /**
         * @scope current closure
         * @private _packagesManager (packages list updater)
         */
        _packagesListManager = {
            
            packageExists: function(packageName, version){
                var i;
                for(i = 0; i<_packages.length; i++){
                    if(_packages[i].name === packageName && (version ? _packages[i].version === version : true)){
                        return true;
                    }
                }
                return false;
            },

            getFullPackageInfo: function(packageName, version){
                var i;
                for(i = 0; i<_packages.length; i++){
                    if(_packages[i].name === packageName && (version ? _packages[i].version === version : true)){
                        return _packages[i];
                    }
                }
                return;
            },

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
            init: function(){

                //console.info('WPM.init()');
                //init the webfolder root of the project
                _webFolderRootFilePath  = application.getItemsWithRole( 'webFolder').path;
                //clear the _packages list from previously added packages
                _packagesListManager.clear();
                //add the WAF core, widgets, etc ... (it would be could to be already in memory rather than read it on the harddrive)
                var WAFpackageFile = this.getPackageFile(wafFilePath+'builder/WPM/packages.WAF.json');
                _packagesListManager.addPackageToList(WAFpackageFile);
                //add the WAF custom widgets
                //_packagesListManager.addPackageToList(this.getPackageFile(customWidgetFilePath));//temporary (will have to look through folder and look for each package.json of each widget)
            },
            
            /**
             * 
             * @param {String} packageFilePath The file path to the package.json file
             * @returns {Object} the package opened at packageFilePath
             * @trows error if can't open package
             */
            getPackageFile: function(packageFilePath){
                var result;
                try{
                    result = loadText(packageFilePath);
                    return JSON.parse(result);
                }
                catch(e){
                    //log error ?
                    throw e;
                }
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
             * @returns {Object} The files (resolved by dependencies) to include from the package.json
             */
            getPackage: function(file, mode){
            
                this.init();
                //defining the package mode : strict or force 

                _pkg.mode = mode || null ;

                //initialising all the objects in the class 
                _pkg.init(file);

                //loading the main package and preparing structure to be used by the build
                _pkg.load();
                              
                //loading physical files into the library
                _pkg.tree = _pkg.getPackageFromDisk(file, _pkg.tree);

                //resolving dependencies
                _pkg.build();

                //adding all files 
                _pkg.addFiles();

                
                //verifying errors
                if (_pkg.err.length > 0 && _pkg.mode !== "force") {
                    throw new Error(_pkg.err);
                    //return _pkg.err;
                }

                return _pkg.files;
            },
                    
                    
            /**
             * @todo by ricardo
             * 
             * @param {String} packageFilePath
             * @returns {Object} An object to be saved to package list obj_libs and to be process to build list
             * @throws error if a package is not available
             */
            getPackageList: function(file, mode){
                            
                this.init();

                //defining the package mode : strict or force 
                _pkg.mode = mode || null ;

                //initialising all the objects in the class 
                _pkg.init(file);

                //loading physical files into the library
                //the object _pkg.tree is just for debugging 
                _pkg.tree = _pkg.getPackageFromDisk(file, _pkg.tree);  
 
              
                //resolving dependencies
                _pkg.build();
 
                //building the obj_libs structure to be used by the cache
                //_pkg.prepareCache();

                //adding all files 
                _pkg.addFilesToList();
                
                //verifying errors
                if (_pkg.err.length > 0 && _pkg.mode !== "force") {
                    throw new Error(_pkg.err);
                    //return _pkg.err;
                }

                return _pkg.packageList;
                
            },
                    
            /**
             * For the moment returns mock objects
             * 
             * @ricardo : test your code on the method getPackageListByRicardo
             * 
             * @param {String} packageFilePath
             * @returns {Object} An object to be saved to package list storage and to be process to build list
             * @throws error if a package is not available
             */
            getPackageListMock: function(packageFilePath, mode){
                //load fileHelper module (use it to get the time stamps)
                fileHelper = fileHelper || require(wafFilePath+'builder/builder-fileHelper/fileHelper');
                
                //temporary
//                var tempTimeStamp = (new Date("Wed, 03 Apr 2013 09:17:11 GMT")).toUTCString();
                var tempTimeStamp = (new Date()).toUTCString();
                var tempData = {
                      "/index.waPage/index.package.json" : [
                            {"file":"+/widget/menuitem/css/widget-menuitem.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/menuitem/skin/default/css/widget-menuitem-skin-default.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/menuitem/skin/metal/css/widget-menuitem-skin-metal.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/menuitem/skin/light/css/widget-menuitem-skin-light.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/menubar/css/widget-menubar.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/menubar/skin/default/css/widget-menubar-skin-default.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/menubar/skin/metal/css/widget-menubar-skin-metal.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/menubar/skin/light/css/widget-menubar-skin-light.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/tabview/css/widget-tabview.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/tabview/skin/default/css/widget-tabview-skin-default.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/tabview/skin/metal/css/widget-tabview-skin-metal.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/tabview/skin/light/css/widget-tabview-skin-light.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/combobox/css/widget-combobox.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/combobox/skin/default/css/widget-combobox-skin-default.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/combobox/skin/metal/css/widget-combobox-skin-metal.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/combobox/skin/light/css/widget-combobox-skin-light.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/menuitem/widget-menuitem.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"+/widget/menuitem/widget-menuitem-conf.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"+/widget/menubar/widget-menubar.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"+/widget/menubar/widget-menubar-conf.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"+/widget/tabview/widget-tabview.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"+/widget/tabview/widget-tabview-conf.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"+/widget/combobox/widget-combobox.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"+/widget/combobox/widget-combobox-conf.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"/myWebComponent.waComponent/myWebComponent.package.json", "TS":tempTimeStamp, type : "package"},
                            {"file":"+/widget/palette/css/widget-palette-default.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"/index.waPage/styles/index.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"/application.css", "TS":tempTimeStamp, type : "css"}
                      ],
                      "/myWebComponent.waComponent/myWebComponent.package.json" : [
                            {"file":"+/widget/button/css/widget-button.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/button/skin/default/css/widget-button-skin-default.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/button/skin/metal/css/widget-button-skin-metal.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/button/skin/light/css/widget-button-skin-light.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/button/skin/image/css/widget-button-skin-image.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/textField/css/widget-textField.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/textField/skin/default/css/widget-textField-skin-default.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/textField/skin/metal/css/widget-textField-skin-metal.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/textField/skin/light/css/widget-textField-skin-light.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/button/widget-button.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"+/widget/button/widget-button-conf.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"+/widget/textField/widget-textField.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"+/widget/textField/widget-textField-conf.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"/myWebComponent2.waComponent/myWebComponent2.package.json", "TS":tempTimeStamp, type : "package"},
                            {"file":"/myWebComponent.waComponent/myWebComponent.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"/myWebComponent.waComponent/myWebComponent.js", "TS":tempTimeStamp, type : "js"}
                      ],
                      "/myWebComponent2.waComponent/myWebComponent2.package.json" : [
                            {"file":"+/widget/buttonImage/css/widget-buttonImage.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/radiogroup/css/widget-radiogroup.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/radiogroup/skin/default/css/widget-radiogroup-skin-default.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/radiogroup/skin/metal/css/widget-radiogroup-skin-metal.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/radiogroup/skin/light/css/widget-radiogroup-skin-light.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/radiogroup/skin/cupertino/css/widget-radiogroup-skin-cupertino.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"/myWebComponent2.waComponent/myWebComponent2.css", "TS":tempTimeStamp, type : "css"},
                            {"file":"+/widget/buttonImage/widget-buttonImage.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"+/widget/buttonImage/widget-buttonImage-conf.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"+/widget/radiogroup/widget-radiogroup.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"+/widget/radiogroup/widget-radiogroup-conf.js", "TS":tempTimeStamp, type : "js"},
                            {"file":"/myWebComponent2.waComponent/myWebComponent2.js", "TS":tempTimeStamp, type : "js"}
                      ]
                };
                return tempData;
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
            _getCompletePackageList: function(){
                var result = '',i;
                for(i=0;i<_packages.length;i++){
                    result+="\n"+_packages[i].name;
                }
                return result;
            }
            
        };
        
        WPM.init();
    
    return WPM;
    
})();
