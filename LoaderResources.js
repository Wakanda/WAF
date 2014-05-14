(function(){
    if(typeof WAFLoader === 'undefined'){
        
        /**
         * @scope current closure
         * @private vars
         */
        var _pkg, _packages, _manifesto;
        
        /**
         * @scope current closure
         * @private _pkg (module builder)
         */
        _pkg = {
            
            build : function(obj){
                this.buildMain(obj);
                this.addVersions();
                this.addDependencies(this.main);
                this.addVersions();
                this.verifyPackage();
            },
            
            buildMain : function(obj){
                this.main = {};
                this.main = this.buildListPackage(obj);
                this.arr_pkg = [];
                this.arr_ver = [];
                this.err = [];
                this.mode = "strict";
                this.files = {};
            },
            
            verifyPackage : function () {
                var i,k;
                for (i = 0; i < this.arr_pkg.length; i++) {
                    //looping thru packages
                    var exist = false;
                    for (k = 0; k < _packages.length; k++) {   
                        //if both structures match 
                        if (_packages[k].name === this.arr_pkg[i] && 
                            _packages[k].version === this.arr_ver[i]) { 
                                // registering the package found
                            exist = true;
                        }                        
                    }  
                    if (! exist) {
                        this.err.push("Library : " + this.arr_pkg[i] + " Version : " + this.arr_ver[i] + " not found in the package");
                    }                 
                }
            },
                    
            addFiles : function (obj) {
                var f,k,i,l;
                //looping thru packages
                for (var k = 0; k < _packages.length; k++) {
                    //looping the arr structure created in the previous steps    
                     for (var i = 0; i < this.arr_pkg.length; i++) {
                        //if both structures match 
                        if (_packages[k].name === this.arr_pkg[i] && 
                            _packages[k].version === this.arr_ver[i]) { 
                                for (f in _packages[k].files) {
                                    for (var l = 0; l < _packages[k].files[f].length; l++) {
                                        this.files.push(_packages[k].files[f][l]);
                                    }
                                }
                        }                        
                    }                   
                }
            },
            
            addFilesByType : function (obj) {
                var k,i,f,l;
                //looping thru packages
                for (k = 0; k < _packages.length; k++) {
                    //looping the arr structure created in the previous steps    
                     for (i = 0; i < this.arr_pkg.length; i++) {
                        //if both structures match 
                        if (_packages[k].name === this.arr_pkg[i] && 
                            _packages[k].version === this.arr_ver[i]) { 
                                for (f in _packages[k].files) {
                                    for (l = 0; l < _packages[k].files[f].length; l++) {
                                        if (! this.files[f]){
                                            this.files[f] = [];    
                                        }
                                        console.log (f + " " + _packages[k].files[f][l]);
                                        this.files[f].push(_packages[k].files[f][l]);
                                    }
                                }
                        }                        
                    }                   
                }
            },
            
            setMode : function (mode) {
                this.mode = mode;
            },
            
            buildListPackage : function (obj) {
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
            
            addDependencies : function (obj) {
                var k,i,l,pkg,version;
                //getting packages from the user/manifesto
                for (k = 0; k < obj.length; k++) { 
                    //looping thru all the packages in Wakanda  
                    for (i = 0; i < _packages.length; i++) {
                        if (_packages[i].name === obj[k].name && _packages[i].version === obj[k].version){
                            if (_packages[i].dependencies) {
                                for (l = 0; l < _packages[i].dependencies.length; l++) {
                                    pkg = _packages[i].dependencies[l].name;
                                    version = _packages[i].dependencies[l].version;
                                    if (this.addPackage(pkg, version)) {
                                        this.addDependencies(_packages[i].dependencies[l]);
                                        this.main.push(_packages[i].dependencies[l]);
                                    }
                                }
                            }
                        }
                    }
                } 
            },
            
            addVersions : function () {
                var k,i;
                //getting all the packages from the user/manifesto
                for (k = 0; k < this.main.length; k++) { 
                    var versions = [];           
                    //looping thru all the packages 

                    if (! this.main[k].last_version){
                        for (i = 0; i < _packages.length; i++) {
                            // testing if we have the package
                            if (_packages[i].name === this.main[k].name){
                                //adding the version to the list of versions available for the package
                                versions.push(_packages[i].version);
                                //adding last_version
                                if (this.main[k].last_version){
                                    if (this.main[k].last_version < _packages[i].version) {
                                      this.main[k].last_version = _packages[i].version;                                
                                    }
                                } else {
                                    this.main[k].last_version = _packages[i].version;
                                }
                            } 
                        }

                        //verifying if package has minimal info
                        if (versions.length === 0) {
                            this.main[k].list_versions = [];
                            this.err.push("Package " + this.main[k].name + " has invalid version");  
                        } else {
                            this.main[k].list_versions = versions;         
                        }
                    }

                    // assigning the current version to the latest version available
                    this.main[k].version = this.main[k].version || this.main[k].last_version;
                    //adding the Package to pkg
                    this.addPackage(this.main[k].name,this.main[k].version);
                 } 
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
            },
            
            addPackage : function (pkg, version) {
                var duplicated = false, k;    
                for (k = 0; k < this.arr_pkg.length; k++) { 
                    if (this.arr_pkg[k] === pkg && this.arr_ver[k] != version) {
                        
                        this.err.push("conflict with the Package : " +
                            this.arr_pkg[k] + " version " + this.arr_ver[k] +
                            " and Package " + pkg + " version " + version);
                    } else {
                        if (this.arr_pkg[k] === pkg && this.arr_ver[k] === version){
                            duplicated = true;
                        }
                    } 
                }

                if (! duplicated) {
                    this.arr_pkg.push(pkg);
                    this.arr_ver.push(version);   
                    return true;       
                } else {
                    return false;
                }
            }       
            
        };
 
        /**
         * @class WAFLoader
         * @public
         * @scope global
         */
        WAFLoader = {
            
            /**
             * Returns the file list with every infos (old style)
             * @returns {Object}
             */
            getModulesInfo : function(){
                var result = {}, p, oldLoad = ["allmodules", "mobile", "reporting", "dataprovider"];
                for (p in oldLoad){
                    _pkg.build(oldLoad[p]);
                    _pkg.addFilesByType();
                    result[oldLoad[p]]   = _pkg.files;
                }
                return result;
            },

            /**
             * @returns {_L1._packages}
             */
            getRawData : function(){
                return _packages;
            },

            /**
             * Returns the file list for the specified package
             * @param {Object}|{String} obj
             * @param {String} mode 'force' @optional
             * @returns {Object}
             * 
             * @examples
             * WAFLoader.getPackage({name : 'allmodules', version : '1.0.0'})
             * WAFLoader.getPackage({name : 'allmodules'})
             * WAFLoader.getPackage('allmodules')
             */
            getPackage : function (obj, mode) {

                _pkg.mode = mode || null ;

                _pkg.build(obj);

                _pkg.addFilesByType();

                //verifying errors
                if (_pkg.err.length > 0 && _pkg.mode != "force") {
                    return _pkg.err;
                }
                
                return _pkg.files;
            },

            /**
             * 
             * @param {String} project
             * @returns {Object}
             */
            getManifesto : function (project) {
                //verifying the project, setting the mode and building based on resources
                if (project) {
                    if (_manifesto[project].mode) {
                        _pkg.setMode(_manifesto[project].mode);
                    }
                    if (_manifesto[project].resources){
                        _pkg.build(_manifesto[project].resources);
                    }
                } else {
                    _pkg.build('allmodules');
                }
                
                _pkg.addFilesByType();

                //verifying if any errors   
                if (_pkg.err.length > 0) {
                    return _pkg.err;
                }

                return _pkg.files;                

            },

            /**
             * @returns {Object}
             */
            getPackageNames : function () {
                return _pkg.getPackageNames();
            }
        };
        
        //@begin metadata =====================================

        /**
         * @var _manifesto
         * @private
         */
        _manifesto = {
            "CRM" : {
                solution : "My Company",
                project : "CRM",
                mode : "force",
                resources : [
                    { 
                        pkg : "dataprovider", 
                        version : "1.0.0"
                    },
                    { 
                        pkg : "MenuBar",
                        version : "1.0.0"
                    }
                ]
            }    
        };

        /**
         * @var _packages
         * @private
         */
        _packages = [

            {
                name : 'dataprovider',
                version : "wak4",
                dependencies : [
                    { name : 'Native', type : 'package', version : '1.0.0', path : ''},
                    { name : 'Utils', type : 'package', version : '1.0.0', path : ''},
                    { name : 'DataSourceSelection', type : 'package', version : '1.0.0', path : ''}                 
                ], 
                files : {
                    require :[
                           '+/DataProvider/Data-Provider.js'
                    ]                   
                }
            },
            {
                name : 'dataprovider',
                version : "wak3",
                dependencies : [
                    { name : 'Native', type : 'package', version : '1.0.0', path : ''},  
                    { name : 'Utils', type : 'package', version : '1.0.0', path : ''}                                                      
                ], 
                files : {
                    require :[
                           '+/DataProvider/Data-Provider.js'
                    ],
                    json :[
                           '+/DataProvider/Data-ProviderJSON.json'
                    ]                     
                }
            },
            {
                name : 'allmodules',
                version : "1.0.0",
                dependencies : [
                    { name : 'Native', type : 'package', version : '1.0.0', path : ''},                                     
                    { name : 'jQuery', type : 'package', version : '1.0.0', path : ''} 
                ]
            },         
            {
                name : 'mobile',
                version : "1.0.0",
                dependencies : [
                    { name : 'Utils', type : 'package', version : '1.0.0', path : ''}, 
                    { name : 'MenuBar', type : 'package', version : '1.0.0', path : ''}, 
                    { name : 'Grid', type : 'package', version : '1.0.0', path : ''}
                ]
            },    
            {
                name : 'reporting',
                version : "1.0.0",
                dependencies : [
                    { name : 'Utils', type : 'package', version : '1.0.0', path : ''},                                     
                    { name : 'jQuery', type : 'package', version : '1.0.0', path : ''} 
                ]
            },
            {
                name : 'mobile_core',
                version : "1.0.0",
                dependencies : [
                    { name : 'Utils', type : 'package', version : '1.0.0', path : ''}

                ]
            },
            {
                name : 'Utils',
                version : "1.0.0",
                dependencies : [
                    { name : 'Timer', type : 'package', version : '1.0.0', path : ''}

                ],
                files : {
                    require :[
                        '+/Core/Utils/Timers.js',                                                                                           
                        '+/Core/Utils/DebugTools.js',
                        '+/Core/Utils/Environment.js',                
                        '+/Core/Utils/Strings.js',
                        '+/Core/Utils/Dates.js'
                    ]
                }
            },
            {
                name : 'Con',
                version : "1.0.0",
                dependencies : [
                    { name : 'Timer', type : 'package', version : '1.0.0', path : ''} 

                ]
            },
            {
                name : 'Timer',
                version : "1.0.0",
                files : {
                    require :[
                        '+/Core/Utils/Timers.js'                                                                                           
                    ]
                }
            },
            {
                name : 'Native',
                version : "1.0.0",
                files : {
                    require :[
                        '+/Core/Native/Timers.js',  
                        '+/Core/Native/Dates.js',
                        '+/Core/Native/Strings.js',
                        '+/Core/Native/DebugTools.js',
                        '+/Core/Native/Environment.js'
                    ]
                }
            },
            {
                name : 'DataSourceSelection',
                version : "1.0.0",
                files : {
                    require :[
                        '+/DataSource/Selection.js'
                    ]
                }
            },
            {
                name : 'jQuery',
                version : "1.0.0",
                dependencies : [
                    { name : 'allmodules', type : 'package', version : '1.0.0', path : ''}                                     
                ],
                files : {
                    css : [
                        '+/lib/jquery-ui/themes/base/jquery.ui.core.css',
                        '+/lib/jquery-ui/themes/base/jquery.ui.resizable.css'                
                    ],
                    require :[
                        '+/lib/jquery/jquery.min.js',
                        '+/lib/jquery.svg/jquery.svg.min.js'
                    ]
                }
            },
            {
                name : 'MenuBar',
                version : "1.0.0",            
                dependencies : [
                    { name : 'MenuItem', type : 'package', version : '1.0.0', path : ''}                                     
                ], 
                files : {
                    css : [
                        '+/widget/menubar/css/widget-menubar.css',
                        '+/widget/menubar/skin/default/css/widget-menubar-skin-default.css',
                        '+/widget/menubar/skin/metal/css/widget-menubar-skin-metal.css',
                        '+/widget/menubar/skin/light/css/widget-menubar-skin-light.css',
                        '+/widget/menubar/skin/cupertino/css/widget-menubar-skin-cupertino.css'
                    ],
                    require :[
                        '+/widget/menubar/widget-menubar.js',
                        '+/widget/menubar/widget-menubar-conf.js'
                    ]
                }
            },

            {
                name : 'MenuItem',
                version : "1.0.0",            
                files : {
                     css : [
                        '+/widget/menuitem/css/widget-menuitem.css',
                        '+/widget/menuitem/skin/default/css/widget-menuitem-skin-default.css',
                        '+/widget/menuitem/skin/metal/css/widget-menuitem-skin-metal.css',
                        '+/widget/menuitem/skin/light/css/widget-menuitem-skin-light.css',
                        '+/widget/menuitem/skin/cupertino/css/widget-menuitem-skin-cupertino.css'
                    ],
                    require :[
                        '+/widget/menubar/widget-item.js',
                        '+/widget/menubar/widget-item-conf.js'
                    ]
                }
            }
        ];
        
        //@end metada =========================================
        
    }
})();