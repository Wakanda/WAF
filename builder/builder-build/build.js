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
module.exports = (function() {

    var wafFilePath = getWalibFolder().path + "WAF/",
    BUILDS_STORAGE_KEY = 'buildsStorage',
    BUILD_TYPES = ['js', 'css', 'html'],
    builderLogger = require(wafFilePath + "builder/builder-logger")(),
    ModuleBuild, buildHelper, fileHelper;

    buildHelper = {
        /**
         * Returns the list from the Build Storage
         * @returns {Object}
         */
        getBuildsFromStorage: function() {
            return storage.getItem(BUILDS_STORAGE_KEY);
        },
        /**
         * Saves builds to the Build Storage
         * @param {Object} builds
         */
        saveBuildsToStorage: function(builds) {
            storage.setItem(BUILDS_STORAGE_KEY, builds);
        },
        /**
         * Returns true if the buildList has package changed or files changed
         * @todo Only check buildList.changed === true should be ok (no need to loop through all the files)
         * @param {Object} buildList
         * @param {String} type
         * @returns {Boolean}
         */
        hasBuildListChanged: function(buildList) {
            var i, type;
            //if the whole buildList is tag as changed, return true
            if (buildList.changed === true) {
                return true;
            }
            //if not, look for the files inside each type section which can have change
            for (type in buildList) {
                if (buildList[type].length > 0) {
                    for (i = 0; i < buildList[type].length; i++) {
                        if (buildList[type][i].changed === true) {
                            return true;
                        }
                    }
                }
            }
            //we looped through all the buildList without finding any change
            return false;
        },
        /**
         * Processes the webcomponent main js source file
         * @param {File} componentSourceFile
         * @returns {String}
         */
        createWcMainJs: function(componentSourceFile) {
            var codeWidgetClass = '',
            extObject = '',
            componentName = "",
            componentSource = componentSourceFile.toString();

            //find the componentName from its file path
            componentName = componentSourceFile.path.substring(componentSourceFile.path.lastIndexOf("/") + 1, componentSourceFile.path.lastIndexOf("."));

            // add properties                                        
            extObject += "this.sources    = {};\r\n\t";
            extObject += "this.sourcesVar = {};\r\n\t";
            extObject += "this.widgets    = {};\r\n\t";

            // add internal methods dynamically                                        
            componentSource = componentSource.replace("constructor (id) {",
            "constructor (id) { " +
            "\r\n\r\n\t// @region generated code" +
            "\r\n\t" + extObject +
            "\r\n\tfunction getHtmlObj (componentId) { \r\n\t\treturn $('#' + id + '_' + componentId);\r\n\t};" +
            "\r\n\r\n\tfunction getHtmlId (componentId) { \r\n\t\treturn id + '_' + componentId;\r\n\t};" +
            "\r\n\t// @endregion generated code"
            );

            // replace comment                                        
            componentSource = componentSource.replace('var $comp = this;', 'var $comp = $$$(id);\r\n\t');
            componentSource = componentSource.replace("// Add the code that needs to be shared between components here", "");

            componentSource = componentSource.replace(/\\(?=[^\\rn])/g, '\\\\');
            componentSource = componentSource.replace(/\\r/g, '\\\r').replace(/\\n/g, '\\\n');
            componentSource = componentSource.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/'/g, "\\'");
            componentSource = componentSource.replace('})();', '})(id);');

            // add code for Function method
            componentSource = 'var comp =' + componentSource + ';\\r\\nreturn new comp(id)';

            codeWidgetClass += "WAF.Widget.provide('" + componentName + "',{}, function WAFWidget (config, data, shared) {";
            codeWidgetClass += "var componentSource = '" + componentSource + "';\r\n\t";
            codeWidgetClass += "var Component = new Function('id','" + componentSource + "') \r\n\t";
            codeWidgetClass += "var component = new Component(config.id); \r\n\t";
            codeWidgetClass += "var propName = ''; for (propName in component) { this[propName] = component[propName];}\r\n\t";
            codeWidgetClass += "\r\n\t},{ \r\n\t";
            codeWidgetClass += "loadComponent : function (params) {\r\n\t";
            codeWidgetClass += "    this.removeComponent();\r\n\t";
            codeWidgetClass += "    var userData = {},\r\n\t";
            codeWidgetClass += "    param = null,\r\n\t";
            codeWidgetClass += "    i = 0;\r\n\t";
            codeWidgetClass += "    this.config.userData = userData;\r\n\t";
            codeWidgetClass += "    if (typeof params === 'undefined') {\r\n\t";
            codeWidgetClass += "        if (this.config['data-path'] != null) {\r\n\t";
            codeWidgetClass += "            WAF.loadComponent({\r\n\t";
            codeWidgetClass += "                id   : this.config.id,\r\n\t";
            codeWidgetClass += "                path : this.config['data-path'],\r\n\t";
            codeWidgetClass += "                data : this.config\r\n\t";
            codeWidgetClass += "            });\r\n\t";
            codeWidgetClass += "        }   \r\n\t";
            codeWidgetClass += "    } else {\r\n\t";
            codeWidgetClass += "        if (params != null) {\r\n\t";
            codeWidgetClass += "            if (typeof params === 'string') {\r\n\t";
            codeWidgetClass += "                WAF.loadComponent({\r\n\t";
            codeWidgetClass += "                id   : this.config.id,\r\n\t";
            codeWidgetClass += "                path : params,\r\n\t";
            codeWidgetClass += "                data : this.config\r\n\t";
            codeWidgetClass += "            });\r\n\t";
            codeWidgetClass += "        } else {\r\n\t";
            codeWidgetClass += "           if (typeof params.userData !== 'undefined') {\r\n\t";
            codeWidgetClass += "            for (param in params.userData) {\r\n\t";
            codeWidgetClass += "                if (param != 'id' && param != 'path') {\r\n\t";
            codeWidgetClass += "                  userData[param] = params.userData[param];\r\n\t";
            codeWidgetClass += "                }\r\n\t";
            codeWidgetClass += "            }\r\n\t";
            codeWidgetClass += "          }\r\n\t";
            codeWidgetClass += "          WAF.loadComponent({\r\n\t";
            codeWidgetClass += "              id        : params.id        || this.config.id,\r\n\t";
            codeWidgetClass += "              path      : params.path      || this.config['data-path'],\r\n\t";
            codeWidgetClass += "              onSuccess : params.onSuccess || function () {},\r\n\t";
            codeWidgetClass += "              data      : this.config\r\n\t";
            codeWidgetClass += "          });\r\n\t";
            codeWidgetClass += "      }\r\n\t";
            codeWidgetClass += "  }\r\n\t";
            codeWidgetClass += "}\r\n\t";
            codeWidgetClass += "},\r\n\t";
            codeWidgetClass += "removeComponent : function () {\r\n\t";
            codeWidgetClass += "    var childrens = this.getChildren(),\r\n\t";
            codeWidgetClass += "    length = childrens.length,\r\n\t";
            codeWidgetClass += "    cssTag = null,\r\n\t";
            codeWidgetClass += "    scriptTag = null,\r\n\t";
            codeWidgetClass += "    i = 0,\r\n\t";
            codeWidgetClass += "    children = null,\r\n\t";
            codeWidgetClass += "    localSource = null,\r\n\t";
            codeWidgetClass += "    localSourceName = '';\r\n\t";
            codeWidgetClass += "    if (this.unload) {\r\n\t";
            codeWidgetClass += "        this.unload();\r\n\t";
            codeWidgetClass += "    }\r\n\t";
            codeWidgetClass += "    if (this.sources) {\r\n\t";
            codeWidgetClass += "        for (localSourceName in this.sources) {\r\n\t";
            codeWidgetClass += "        localSource = this.sources[localSourceName];\r\n\t";
            codeWidgetClass += "        if (localSource) {\r\n\t";
            codeWidgetClass += "            WAF.dataSource.destroy(localSource);\r\n\t";
            codeWidgetClass += "        }\r\n\t";
            codeWidgetClass += "        delete localSource;\r\n\t";
            codeWidgetClass += "        }\r\n\t";
            codeWidgetClass += "    }\r\n\t";
            codeWidgetClass += "    for (i = 0; i < length; i++) {\r\n\t";
            codeWidgetClass += "        children = childrens[i];    \r\n\t";
            codeWidgetClass += "        if (children.id) {\r\n\t";
            codeWidgetClass += "            if (children.kind === 'component') {\r\n\t";
            codeWidgetClass += "                children.removeComponent();\r\n\t";
            codeWidgetClass += "            }\r\n\t";
            codeWidgetClass += "            WAF.widgets[children.id].destroy();//delete WAF.widgets[children.id];\r\n\t";
            codeWidgetClass += "        }\r\n\t";
            codeWidgetClass += "    }\r\n\t";
            codeWidgetClass += "    // remove new widgets\r\n\t";
            codeWidgetClass += "    if ('waf-core/widget' in WAF.require.modules) { \r\n\t";
            codeWidgetClass += "        var widget = WAF.require('waf-core/widget');\r\n\t";
            codeWidgetClass += "        if(this.id in widget._instances) {\r\n\t";
            codeWidgetClass += "            widget._instances[this.id].invoke('destroy');\r\n\t";
            codeWidgetClass += "        }\r\n\t";
            codeWidgetClass += "    }\r\n\t";
            codeWidgetClass += "    cssTag = $('#waf-component-' + this.id);\r\n\t";
            codeWidgetClass += "    if (cssTag) {\r\n\t";
            codeWidgetClass += "        cssTag.remove();\r\n\t";
            codeWidgetClass += "    }\r\n\t";
            codeWidgetClass += "    scriptTag = $('[data-component-script-id=waf-component-' + this.id + ']');\r\n\t";
            codeWidgetClass += "    if (scriptTag) {\r\n\t";
            codeWidgetClass += "        scriptTag.remove();\r\n\t";
            codeWidgetClass += "    }\r\n\t";
            codeWidgetClass += "    this.$domNode.children().not('.ui-resizable-handle').remove();\r\n\t";
            codeWidgetClass += "if (this.config['data-modal'] && this.config['data-modal'] === 'true' && $('#waf-component-fade')) {\r\n\t";
            codeWidgetClass += "$('#waf-component-fade').fadeOut(0, function() {\r\n\t";
            codeWidgetClass += "$('#waf-component-fade').remove();\r\n\t";
            codeWidgetClass += "});\r\n\t";
            codeWidgetClass += "}\r\n\t";
            codeWidgetClass += "    }\r\n\t";
            codeWidgetClass += "});";

            return codeWidgetClass;
        }

    };

    ModuleBuild = {
        /**
         * Make the builds for each BUILD_TYPES and caches them in storage to be retrieved by getBuild
         * If debug true, will directly return the build, won't touch the cache in any way
         * If doNotMinify true, the css/js won't be minified (doesn't affect the debug mode)
         * -> you can't have both debug and doNotMinify to true (debug will take precedence)
         * @param {Object} buildList
         * @param {String} packageJsonPath
         * @param {Boolean} debug
         * @param {Boolean} doNotMinify
         * @param {Boolean} specifyTimestamp
         */
        makeBuilds: function(buildList, packageJsonUrlPath, path, debug, doNotMinify, specifyTimestamp) {

            var startDate = new Date();
            var buildsFromStorage,
            buildChanged, //will be flagged at true if there is a need to rebuild (all or fragments)
            buildComplete = {
                "js": "", //contains the global result (libs + webcomponents) for the js part of this build
                "css": ""                      //contains the global result (only libs - for css) for the css part of this build
            },
            buildWebComponent = {}, //contains the json object with the webcomponents that will be appened at the end of the buildJsComplete
            flagContainsWebComponent = false, //flagged at true when there is a webComponent
            i, j,
            type,
            minifier,
            tempFile,
            tempOutput,
            buildDebug = "";

            //default value for path
            path = path || "WEBFOLDER";

            //load fileHelper module
            fileHelper = fileHelper || require(wafFilePath + 'builder/builder-fileHelper/fileHelper');

            try {

                //release mode
                if (!debug) {

                    //retrieve builds from storage
                    buildsFromStorage = buildHelper.getBuildsFromStorage() || {};

                    //the build needs to be updated only if : a fragment has changed, or if there is no build in cache / anyway, when we are in debug
                    buildChanged = buildHelper.hasBuildListChanged(buildList) || !buildsFromStorage["/" + path + "/" + packageJsonUrlPath + '.js'] || !buildsFromStorage["/" + path + "/" + packageJsonUrlPath + '.css'];

                    if (buildChanged) {
                        for (type in buildList) {
                            //check if we're not looping on changed for example
                            if (BUILD_TYPES.indexOf(type) > -1 && buildList[type].length > 0) {
                                minifier = require(wafFilePath + 'builder/builder-minifier/' + type + '-minifier');
                                for (i = 0; i < buildList[type].length; i++) {
                                    //if the file has changes, we re-minify it, add the fragment to the builds and concat it to the comple build
                                    if (buildList[type][i].changed === true || !buildsFromStorage["/" + buildList[type][i].path + "/" + buildList[type][i].file]) {
                                        //retrieve infos about the file
                                        tempFile = fileHelper.getFile(buildList[type][i].file, buildList[type][i].path);
                                        //case this is a webComponent
                                        if (buildList[type][i].wcKey) {
                                            flagContainsWebComponent = true;
                                            //init the webcomponent entry in the hashtable
                                            if (!buildWebComponent[buildList[type][i].wcKey]) {
                                                buildWebComponent[buildList[type][i].wcKey] = {};
                                            }
                                            if (buildList[type][i].wcMainJs) {
                                                //don't minify the wcMainJs
                                                tempOutput = minifier(buildHelper.createWcMainJs(tempFile), fileHelper.getHttpPath(buildList[type][i].file, buildList[type][i].path), true, true, specifyTimestamp);
                                                buildWebComponent[buildList[type][i].wcKey].wcMainJs = "\n\n" + tempOutput;
                                            }
                                            else {
                                                tempOutput = minifier(tempFile, fileHelper.getHttpPath(buildList[type][i].file, buildList[type][i].path), true, true, specifyTimestamp);
                                                if (typeof buildWebComponent[buildList[type][i].wcKey][type] !== "string") {
                                                    buildWebComponent[buildList[type][i].wcKey][type] = "";
                                                }
                                                buildWebComponent[buildList[type][i].wcKey][type] += "\n\n" + tempOutput;
                                            }
                                        }
                                        //normal files (only js/css - not html)
                                        else {
                                            tempOutput = minifier(tempFile, fileHelper.getHttpPath(buildList[type][i].file, buildList[type][i].path), undefined, doNotMinify, specifyTimestamp);
                                            buildComplete[type] += "\n\n" + tempOutput;
                                        }
                                        //save the processed file to the builds
                                        buildsFromStorage["/" + buildList[type][i].path + "/" + buildList[type][i].file] = {
                                            "output": tempOutput
                                        };
                                    }
                                    //if the file has not changed, we only concat it to the complete build
                                    else if (buildsFromStorage["/" + buildList[type][i].path + "/" + buildList[type][i].file]) {
                                        //retrieve the output from cache
                                        tempOutput = buildsFromStorage["/" + buildList[type][i].path + "/" + buildList[type][i].file].output
                                        //case this is a webComponent
                                        if (buildList[type][i].wcKey) {
                                            flagContainsWebComponent = true;
                                            //init the webcomponent entryin the hashtable
                                            if (!buildWebComponent[buildList[type][i].wcKey]) {
                                                buildWebComponent[buildList[type][i].wcKey] = {};
                                            }
                                            if (buildList[type][i].wcMainJs) {
                                                buildWebComponent[buildList[type][i].wcKey].wcMainJs = "\n\n" + tempOutput;
                                            }
                                            else {
                                                if (typeof buildWebComponent[buildList[type][i].wcKey][type] !== "string") {
                                                    buildWebComponent[buildList[type][i].wcKey][type] = "";
                                                }
                                                buildWebComponent[buildList[type][i].wcKey][type] += "\n\n" + tempOutput;
                                            }
                                        }
                                        //normal files (only js/css - not html)
                                        else {
                                            buildComplete[type] += "\n\n" + tempOutput;
                                        }
                                    }
                                }
                            }
                        }

                        //add the webComponent part if there is a webcomponent
                        if (flagContainsWebComponent) {
                            buildComplete.js += "\n\n/** Minified WAF.component object */\n\nWAF.loader.loadComponents(" + JSON.stringify(buildWebComponent) + ");";
                        }

                        //add the aggregated fragments to the builds
                        for (type in buildComplete) {
                            buildsFromStorage["/" + path + "/" + packageJsonUrlPath + '.' + type] = {
                                "hashCode": (new Date()).getTime().toString() + '-' + type, //hashCode for the build to manage browser cache / http 304 responses
                                "output": "/** Complete build done " + (specifyTimestamp === true ? " at " + (new Date()).toUTCString() : "") + (packageJsonUrlPath ? " for " + packageJsonUrlPath : "") + " */" + buildComplete[type]
                            };
                        }

                        //save the updated buildsFromStorage to storage
                        buildHelper.saveBuildsToStorage(buildsFromStorage);
                    }

                }
                //debug mode
                else {
                    buildComplete.js = [];
                    buildComplete.css = [];
                    for (type in buildList) {
                        //check if we're not looping on changed for example
                        if (BUILD_TYPES.indexOf(type) > -1 && buildList[type].length > 0) {
                            minifier = require(wafFilePath + 'builder/builder-minifier/' + type + '-minifier');
                            for (i = 0; i < buildList[type].length; i++) {
                                //case this is a webComponent
                                if (buildList[type][i].wcKey) {
                                    //retrieve infos about the file
                                    tempFile = fileHelper.getFile(buildList[type][i].file, buildList[type][i].path);
                                    flagContainsWebComponent = true;
                                    //init the webcomponent entry in the hashtable
                                    if (!buildWebComponent[buildList[type][i].wcKey]) {
                                        buildWebComponent[buildList[type][i].wcKey] = {};
                                    }
                                    //don't minify any of the files for the webcomponents
                                    if (buildList[type][i].wcMainJs) {
                                        tempOutput = minifier(buildHelper.createWcMainJs(tempFile), fileHelper.getHttpPath(buildList[type][i].file, buildList[type][i].path), true, true, specifyTimestamp);
                                        buildWebComponent[buildList[type][i].wcKey].wcMainJs = "\n\n" + tempOutput;
                                    }
                                    else {
                                        tempOutput = minifier(tempFile, fileHelper.getHttpPath(buildList[type][i].file, buildList[type][i].path), true, true, specifyTimestamp);
                                        if (typeof buildWebComponent[buildList[type][i].wcKey][type] !== "string") {
                                            buildWebComponent[buildList[type][i].wcKey][type] = "";
                                        }
                                        buildWebComponent[buildList[type][i].wcKey][type] += "\n\n" + tempOutput;
                                    }
                                }
                                //normal files (only js/css - not html)
                                else {
                                    buildComplete[type].push(fileHelper.getHttpPath(buildList[type][i].file, buildList[type][i].path));
                                }
                            }
                        }
                    }

                    //generate the debug build
                    for (type in buildComplete) {
                        if (buildComplete[type] && buildComplete[type].length > 0) {
                            if (type === 'js') {
                                buildDebug += "\n\nWAF.loader.debug.loadJs([";
                            }
                            else if (type === 'css') {
                                buildDebug += "\n\nWAF.loader.debug.loadCss([";
                            }
                            for (i = 0; i < buildComplete[type].length; i++) {
                                buildDebug += "\n    '" + buildComplete[type][i] + "'" + (i < buildComplete[type].length - 1 ? "," : "");
                            }
                            buildDebug += "\n])";
                        }
                    }

                    //add the webComponent part if there is a webcomponent
                    if (flagContainsWebComponent) {
                        buildDebug += "\n\n/** WAF.component object */\n\nWAF.loader.loadComponents(" + JSON.stringify(buildWebComponent) + ");";
                    }

                    return buildDebug;

                }

            }
            catch (e) {

                //rethrow the error
                throw e;

            }

            builderLogger('builds made in ' + ((new Date()).getTime() - startDate.getTime()) + 'ms');


        },
        /**
         * Returns a string of minified / concatened js or css for this buildList
         * @param {Object} buildList
         * @param {String} packageJsonUrlPath
         * @param {String} type
         * @return {Object} {"hashCode" : "1368800627032css", "output" : "(function(){ ... ... }) .... ...."}
         */
        getBuildFromCache: function(buildList, packageJsonUrlPath, path, type) {
            var buildsFromStorage, output, build;

            path = path || "WEBFOLDER";

            //retrieve builds from storage
            buildsFromStorage = buildHelper.getBuildsFromStorage() || {};

            //if no build in cache, rebuild
            if (!buildsFromStorage["/" + path + "/" + packageJsonUrlPath + '.' + type]) {
                this.makeBuilds(buildList, packageJsonUrlPath, path);
            }
            return buildsFromStorage["/" + path + "/" + packageJsonUrlPath + '.' + type];

        },
        getStorageSnapShot: function() {

            var buildsFromStorage, fileName, output;

            output = "";
            buildsFromStorage = buildHelper.getBuildsFromStorage();
            for (fileName in buildsFromStorage) {
                output += fileName + "\n";
            }
            return output;
            return JSON.stringify(buildsFromStorage, null, "\t");
        }

    };

    return ModuleBuild;

})();
