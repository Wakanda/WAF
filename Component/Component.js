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

/**
 * Load a Web Component
 *
 * @static
 * @method loadComponent
 * @param {JSON} param parameters to create the component
 */
WAF.loadComponent = function(param) {
    var icomponent = {},
    tagStyle = null,
    tagWafCss = null,
    tagScript = null,
    name = '',
    definition = {},
    attributeName = '',
    nbAttributes = 0,
    domObj = null,
    sourceName = '',
    localSourceName = '',
    wigdetName = '',
    tempId = '',
    styleUpdate = '',
    compManager = WAF.loader.componentsManager,
    rpcFileManager = WAF.loader.rpcFileManager,
    tabName = [],
    htmlUpdate = '',
    sourcesVarName = '',
    localSource = null,
    myComp = null,
    widgetComponent = null,
    i = 0,
    widgetId = '',
    eventDef = null,
    widget = null,
    eventName = '',
    length = 0;

    param = param || {};

    param.id = param.id || '';
    param.path = param.path || '';
    param.onSuccess = param.onSuccess || function() {
    };

    if (typeof param.data === 'undefined') {
        param.data = {};
        definition = WAF.config.widget.WAF['component'];
        domObj = document.getElementById(param.id);
        if (domObj) {

            // create the config
            for (i = 0, nbAttributes = definition.attributes.length; i < nbAttributes; i++) {
                attributeName = definition.attributes[i].name;
                param.data[attributeName] = domObj.getAttribute(attributeName);
            }

            // force getting the mandatory attribute
            attributeName = 'id';
            param.data[attributeName] = domObj.getAttribute(attributeName);
            attributeName = 'data-type';
            param.data[attributeName] = domObj.getAttribute(attributeName);
            attributeName = 'data-lib';
            param.data[attributeName] = domObj.getAttribute(attributeName);
        }
    }

    if (typeof param.data['data-path'] === 'undefined' || param.data['data-path'] === null || param.data['data-path'] === '') {
        param.data['data-path'] = param.path;
    } else {
        param.data['data-path'] = param.path;
        domObj = document.getElementById(param.id);
        if (domObj && domObj.setAttribute) {
            domObj.setAttribute('data-path', param.path);
        }
    }

    if (typeof param.data['id'] === 'undefined' || param.data['id'] === null || param.data['id'] === '') {
        param.data['id'] = param.id;
    }

    // name of the component
    name = param.data['data-path'];
    tabName = name.split('/');
    name = tabName[tabName.length - 1].replace('.waComponent', '');

    param.name = name;

    // add userData if any
    if (typeof param.userData !== 'undefined') {
        param.data.userData = param.userData;
    }

    // get the component
    widgetComponent = $$(param.id);

    // check if component ressources already loaded
    // read the ressources from the client cache
    icomponent = WAF.components[param.path];
    if (icomponent && icomponent.cache && icomponent.cache.html && icomponent.cache.style && icomponent.cache.script) {

        // remove existing event on the component
        
        for (widgetId in WAF.events) {
            eventDef = WAF.events[widgetId];
            if (widgetId.indexOf(param.id + '_') === 0) {
                widget = $$(widgetId);
                length = eventDef.length;
                for (i = 0; i < length; i++) {
                    eventName = eventDef[i].name;
                    if (widget && widget.removeListener) {
                        widget.removeListener(eventName);
                    }
                }
                delete WAF.events[widgetId];
            }
        }


        // clean the component widgets
        if (widgetComponent && widgetComponent.widgets) {
            for (wigdetName in widgetComponent.widgets) {
                if ($$(param.id + '_' + wigdetName)) {
                    $$(param.id + '_' + wigdetName).destroy();
                }
            }
        }
        // clean the component sources
        if (widgetComponent && widgetComponent.sources) {
            for (localSourceName in widgetComponent.sources) {
                localSource = widgetComponent.sources[localSourceName];
                if (localSource) {
                    WAF.dataSource.destroy(localSource);
                }
                delete localSource;
            }
        }

        $('#' + param.id).empty();
        if (document.getElementById('waf-component-' + param.id)) {
            $('#' + 'waf-component-' + param.id).remove();
        }

        // add the component to the list of the widgets

        WAF.widgets[param.id] = {};
        WAF.widgets[param.id].data = param.data;

        // hide component
        $('#' + param.id).css('visibility', 'hidden');

        // load the html
        htmlUpdate = icomponent.cache.html.replace(/{id}/g, param.id + '_');
        htmlUpdate = htmlUpdate.replace('<!DOCTYPE html >', '');
        htmlUpdate = htmlUpdate.replace('<meta name="generator" content="Wakanda GUIDesigner"/>', '');
        $('#' + param.id).append(htmlUpdate);

        // load the css        
        tagStyle = document.createElement('style');
        tagStyle.setAttribute('id', 'waf-component-' + param.id);
        styleUpdate = icomponent.cache.style.replace(/{id}/g, param.id + '_');
        styleUpdate = styleUpdate.replace('#' + param.id + '_ ', '#' + param.id);
        tagStyle.innerHTML = styleUpdate;

        tagWafCss = document.getElementById('waf-interface-css');

        tagWafCss.parentNode.insertBefore(tagStyle, tagWafCss);

        // load the js                          
        tagScript = document.createElement('script');
        tagScript.setAttribute('type', 'text/javascript');
        tagScript.setAttribute('data-component-script-id', 'waf-component-' + param.id);
        tagScript.text = icomponent.cache.script;
        document.getElementsByTagName('head')[0].appendChild(tagScript);

        // generate the widgets
        ds.addToCatalog(icomponent.catalog, {'onSuccess': function() {
                WAF.tags.generate(param.id, false);

                // show component
                $('#' + param.id).css('visibility', '');

                // create the instance of the component                                          
                myComp = new WAF.widget[param.name](param.data);

                // init sources, sourcesVarName and widgets properties
                for (wigdetName in WAF.widgets) {
                    if (wigdetName.indexOf(param.id + '_') === 0) {
                        myComp.widgets[wigdetName.replace(param.id + '_', '')] = WAF.widgets[wigdetName];
                    }
                }

                if (sources) {
                    for (sourceName in sources) {
                        if (sourceName.indexOf(param.id + '_') === 0) {
                            myComp.sources[sourceName.replace(param.id + '_', '')] = sources[sourceName];

                            if (typeof window[sourceName] !== 'undefined') {
                                sourcesVarName = sourceName.replace(param.id + '_', '');

                                (function(that, sourcesVarName, sourceName) {
                                    Object.defineProperty(that.sourcesVar, sourcesVarName, {
                                        configurable: true,
                                        get: function() {
                                            return window[sourceName];
                                        },
                                        set: function(value) {
                                            window[sourceName] = value;
                                        }
                                    });
                                })(myComp, sourcesVarName, sourceName);
                            }
                        }
                    }
                }

                // check if widgets created
                for (i in myComp.widgets) {
                    widgetCreated = true;
                }

                // execute the load
                if (myComp.load && widgetCreated) {
                    myComp.load(param.data);

                    /*
                     * To prevent bubbling
                     */
                    myComp.$domNode.find('label').bind('click', {}, function() {
                        $('#' + $(this).prop('for')).trigger('click');
                        $('#' + $(this).prop('for')).select();
                        return false;
                    });

                    /**
                     * On resize function on widget. Call children widgets resize functions
                     * @method onResize
                     */
                    myComp.onResize = function() {
                        var
                        i,
                        child,
                        children,
                        childrenLength;

                        children = this.getChildren();
                        childrenLength = children.length;

                        for (i = 0; i < childrenLength; i += 1) {
                            child = children[i];
                            if (child.onResize) {
                                child.onResize();
                            }
                        }
                    };

                    /*
                     * Call onResize function
                     */
                    myComp.onResize();

                    /*
                     * Call onReady function
                     */
                    for (i in myComp.widgets) {
                        if (myComp.widgets[i].ready) {
                            myComp.widgets[i].ready();
                        }
                    }

                }

                for (wigdetName in WAF.widgets) {
                    if (wigdetName.indexOf(param.id + '_') === 0) {

                        /*
                         * Execute widget component load custom event
                         */
                        if (WAF.widgets[wigdetName].onComponentLoad) {
                            WAF.widgets[wigdetName].onComponentLoad();
                        }
                    }
                }

                WAF.widgets[param.id] = myComp;


                param.onSuccess();
            }});
    } else {

        icomponent = {};
        icomponent.styleLoaded = false;
        icomponent.scriptLoaded = false;

        if (widgetComponent && widgetComponent.widgets) {
            for (wigdetName in widgetComponent.widgets) {
                $('#' + param.id + '_' + wigdetName).remove();
            }
        }

        tempId = Math.floor((Math.random() * 10000000));

        // get the manifest
        $.ajax({
            url: param.path + '/manifest.json' + '?tmp=' + tempId,
            dataType: 'json',
            success: function(manifest) {
                icomponent = manifest;

                // create the cache
                icomponent.cache = {};

                // add the component to the list of component            
                WAF.components[param.path] = icomponent;

                // add the component to the list of the widgets
                WAF.widgets[param.id] = new WAF.widget.Component({id: param.id});
                WAF.widgets[param.id].data = param.data;

                tempId = Math.floor((Math.random() * 10000000));

                // get the html            
                $.get(param.path + '/' + manifest.html + '?tmp=' + tempId, function(html) {

                    var tabRequire = [],
                    scripts = [],
                    script = '',
                    styles = [],
                    listScripts = '',
                    listStyles = '',
                    i = 0,
                    length = 0,
                    xhref = '',
                    path = '',
                    reqCss = null,
                    reqScript = null,
                    tempId = 0,
                    htmlUpdate = '',
                    regex = '',
                    match = '',
                    catalog = '',
                    callBackJS = null;

                    // add HTML
                    icomponent.cache.html = html;

                    // get catalog
                    regex = /[^\"]"WAF.catalog"[^>]+/;
                    match = regex.exec(html);

                    if (match && match.length > 0) {
                        catalog = match[0];
                        catalog = catalog.split('content');
                        if (catalog && catalog.length > 1) {
                            catalog = catalog[1];
                            catalog = catalog.replace('=\"', '');
                            catalog = catalog.replace('"', '');
                            catalog = catalog.replace('/', '');
                        }
                    }

                    icomponent.catalog = catalog;
                    param.catalog = catalog;

                    htmlUpdate = html.replace(/{id}/g, param.id + '_');
                    htmlUpdate = htmlUpdate.replace('<!DOCTYPE html >', '');
                    htmlUpdate = htmlUpdate.replace('<meta name="generator" content="Wakanda GUIDesigner"/>', '');

                    if ($('script[src="/waLib/WAF/lib/tiny_mce/tiny_mce.js"]').length) {
                        htmlUpdate = htmlUpdate.replace('<script type="text/javascript" src="/waLib/WAF/lib/tiny_mce/tiny_mce.js"></script>', '');
                    }

                    // clean the component placeholder
                    $('#' + param.id).empty();

                    // hide component
                    $('#' + param.id).css('visibility', 'hidden');

                    if (document.getElementById('waf-component-' + param.id)) {
                        $('#' + 'waf-component-' + param.id).remove();
                    }

                    // include the html                    
                    $('#' + param.id).append(htmlUpdate);

                    // add CSS
                    styles = icomponent.styles;
                    length = styles.length;
                    for (i = 0; i < length; i++) {
                        tabRequire[i] = param.data['data-path'] + '/' + styles[i];
                    }
                    listStyles = tabRequire.join(',');
                    xhref = window.location.href.split('/').join('\\');

                    tempId = Math.floor((Math.random() * 10000000));

                    path = "/waf-optimize?referer='" + encodeURIComponent(xhref) + "'&tmp=" + tempId + "&files='" + listStyles + "'";

                    if (path[0] === '+') {
                        path = WAF.config.baseURL + path.slice(1);
                    }

                    reqCss = new XMLHttpRequest();
                    reqCss.open('POST', path, true);
                    reqCss.onreadystatechange = function() {
                        if (reqCss.readyState === 4) {
                            if (reqCss.status === 200) {
                                var tagStyle = null,
                                styleUpdate = '',
                                tagWafCss = null;
                                icomponent.cache.style = reqCss.responseText;
                                styleUpdate = reqCss.responseText.replace(/{id}/g, param.id + '_');
                                styleUpdate = styleUpdate.replace('#' + param.id + '_ ', '#' + param.id);

                                tagStyle = document.createElement('style');
                                tagStyle.setAttribute('id', 'waf-component-' + param.id);
                                tagStyle.innerHTML = styleUpdate;
                                tagWafCss = document.getElementById('waf-interface-css');

                                tagWafCss.parentNode.insertBefore(tagStyle, tagWafCss);
                                icomponent.styleLoaded = true;

                            }
                        }

                    };

                    reqCss.send(null);

                    // add JS     
                    tabRequire = [];
                    scripts = icomponent.scripts;
                    script = '';
                    length = scripts.length;
                    for (i = 0; i < length; i++) {
                        script = scripts[i];
                        if (script.indexOf('/') === 0) {
                            tabRequire[i] = script;
                        } else {
                            tabRequire[i] = param.data['data-path'] + '/' + script;
                        }
                    }
                    listScripts = tabRequire.join(',');
                    xhref = window.location.href.split('/').join('\\');

                    tempId = Math.floor((Math.random() * 10000000));

                    path = "/waf-optimize?referer='" + encodeURIComponent(xhref) + "'&tmp=" + tempId + "&files='" + listScripts + "'";

                    if (path[0] === '+') {
                        path = WAF.config.baseURL + path.slice(1);
                    }

                    reqScript = new XMLHttpRequest();
                    reqScript.open('POST', path, true);

                    callBackJS = function() {
                        if (reqScript.readyState === 4) {
                            if (reqScript.status === 200) {

                                if (!icomponent.styleLoaded) {
                                    // wait for the stylesheet
                                    // need to avoid some position calculation problems
                                    window.setTimeout(callBackJS, 100);
                                } else {
                                    ds.addToCatalog(param.catalog, {'onSuccess': function() {
                                            var codeComponent = '',
                                            includeJavascript = '',
                                            tagScript = null,
                                            tabScript = [],
                                            Component = null,
                                            attr = null,
                                            myComp = null,
                                            codeProvide = '',
                                            sourceName = '',
                                            sourcesVarName = '',
                                            extObject = '',
                                            widgetCreated = false;

                                            // generate the widgets of the component just before the load of the component
                                            // needed for some jQuery widgets
                                            WAF.tags.generate(param.id, false);

                                            // show component
                                            $('#' + param.id).css('visibility', '');

                                            // separate the code of the component
                                            // from the script

                                            // split on end of component code
                                            tabScript = reqScript.responseText.split('})();// @endlock');

                                            if (tabScript.length > 1) {

                                                // check if code already loaded in parallele
                                                if (!icomponent.cache.script) {
                                                    codeComponent = tabScript[0] + '})();// @endlock';
                                                    includeJavascript = tabScript[1];

                                                    // add code for debug
                                                    includeJavascript = '// //@ sourceURL=' + param.id + '-script.js \r\n\t' + includeJavascript;

                                                    // add the script
                                                    tagScript = document.createElement('script');
                                                    tagScript.setAttribute('type', 'text/javascript');
                                                    tagScript.setAttribute('data-component-script-id', 'waf-component-' + param.id);
                                                    tagScript.text = includeJavascript;
                                                    document.getElementsByTagName('head')[0].appendChild(tagScript);

                                                    icomponent.cache.script = includeJavascript;

                                                    // add properties                                        
                                                    extObject += "this.sources    = {};\r\n\t";
                                                    extObject += "this.sourcesVar = {};\r\n\t";
                                                    extObject += "this.widgets    = {};\r\n\t";

                                                    for (wigdetName in WAF.widgets) {
                                                        if (wigdetName.indexOf(param.id + '_') === 0) {
                                                            extObject += "this.widgets['" + wigdetName.replace(param.id + '_', '') + "'] = WAF.widgets['" + wigdetName + "'];\r\n\t";
                                                        }
                                                    }

                                                    if (sources) {
                                                        for (sourceName in sources) {
                                                            if (sourceName.indexOf(param.id + '_') === 0) {
                                                                extObject += "this.sources['" + sourceName.replace(param.id + '_', '') + "'] = sources['" + sourceName + "'];\r\n\t";

                                                                if (typeof window[sourceName] !== 'undefined') {
                                                                    sourcesVarName = sourceName.replace(param.id + '_', '');
                                                                    extObject += "(function (that, " + sourcesVarName + ", " + sourceName + ") {\r\n\t";
                                                                    extObject += "    Object.defineProperty(that.sourcesVar, '" + sourcesVarName + "', {\r\n\t";
                                                                    extObject += "        configurable: true,\r\n\t";
                                                                    extObject += "        get: function() {\r\n\t";
                                                                    extObject += "            return window['" + sourceName + "'];\r\n\t";
                                                                    extObject += "        },\r\n\t";
                                                                    extObject += "        set: function(value) {\r\n\t";
                                                                    extObject += "             window['" + sourceName + "'] = value;\r\n\t";
                                                                    extObject += "        }\r\n\t";
                                                                    extObject += "    });\r\n\t";
                                                                    extObject += "} )(this, '" + sourcesVarName + "', '" + sourceName + "');\r\n\t";
                                                                }
                                                            }
                                                        }
                                                    }

                                                    // add internal methods dynamically                                        
                                                    codeComponent = codeComponent.replace("constructor (id) {",
                                                    "constructor (id) { " +
                                                    "\r\n\r\n\t// @region generated code" +
                                                    "\r\n\t" + extObject +
                                                    "\r\n\tfunction getHtmlObj (componentId) { \r\n\t\treturn $('#' + id + '_' + componentId);\r\n\t};" +
                                                    "\r\n\r\n\tfunction getHtmlId (componentId) { \r\n\t\treturn id + '_' + componentId;\r\n\t};" +
                                                    "\r\n\t// @endregion generated code"
                                                    );

                                                    // replace comment                                        
                                                    codeComponent = codeComponent.replace('var $comp = this;', 'var $comp = $$$(id);\r\n\t');

                                                    codeComponent = codeComponent.replace("// Add the code that needs to be shared between components here", "");

                                                    // add core class in the list of component core class                                                                   
                                                    WAF.component[param.name] = eval(codeComponent);

                                                    // add Provide method
                                                    codeProvide = "WAF.Widget.provide('" + param.name + "',{}, function WAFWidget (config, data, shared) {";
                                                    codeProvide += "var Component = WAF.component['" + param.name + "'] \r\n\t";
                                                    codeProvide += "var component = new Component(config.id); \r\n\t";
                                                    codeProvide += "var propName = ''; for (propName in component) { this[propName] = component[propName];}\r\n\t";
                                                    codeProvide += "\r\n\t},{ \r\n\t";
                                                    codeProvide += "loadComponent : function (params) {\r\n\t";
                                                    codeProvide += "    this.removeComponent();\r\n\t";
                                                    codeProvide += "    var userData = {},\r\n\t";
                                                    codeProvide += "    param = null,\r\n\t";
                                                    codeProvide += "    i = 0;\r\n\t";
                                                    codeProvide += "    this.config.userData = userData;\r\n\t";
                                                    codeProvide += "    if (typeof params === 'undefined') {\r\n\t";
                                                    codeProvide += "        if (this.config['data-path'] != null) {\r\n\t";
                                                    codeProvide += "            WAF.loadComponent({\r\n\t";
                                                    codeProvide += "                id   : this.config.id,\r\n\t";
                                                    codeProvide += "                path : this.config['data-path'],\r\n\t";
                                                    codeProvide += "                data : this.config\r\n\t";
                                                    codeProvide += "            });\r\n\t";
                                                    codeProvide += "        }   \r\n\t";
                                                    codeProvide += "    } else {\r\n\t";
                                                    codeProvide += "        if (params != null) {\r\n\t";
                                                    codeProvide += "            if (typeof params === 'string') {\r\n\t";
                                                    codeProvide += "                WAF.loadComponent({\r\n\t";
                                                    codeProvide += "                id   : this.config.id,\r\n\t";
                                                    codeProvide += "                path : params,\r\n\t";
                                                    codeProvide += "                data : this.config\r\n\t";
                                                    codeProvide += "            });\r\n\t";
                                                    codeProvide += "        } else {\r\n\t";
                                                    codeProvide += "           if (typeof params.userData !== 'undefined') {\r\n\t";
                                                    codeProvide += "            for (param in params.userData) {\r\n\t";
                                                    codeProvide += "                if (param != 'id' && param != 'path') {\r\n\t";
                                                    codeProvide += "                  userData[param] = params.userData[param];\r\n\t";
                                                    codeProvide += "                }\r\n\t";
                                                    codeProvide += "            }\r\n\t";
                                                    codeProvide += "          }\r\n\t";
                                                    codeProvide += "          WAF.loadComponent({\r\n\t";
                                                    codeProvide += "              id        : params.id        || this.config.id,\r\n\t";
                                                    codeProvide += "              path      : params.path      || this.config['data-path'],\r\n\t";
                                                    codeProvide += "              onSuccess : params.onSuccess || function () {},\r\n\t";
                                                    codeProvide += "              data      : this.config\r\n\t";
                                                    codeProvide += "          });\r\n\t";
                                                    codeProvide += "      }\r\n\t";
                                                    codeProvide += "  }\r\n\t";
                                                    codeProvide += "}\r\n\t";
                                                    codeProvide += "},\r\n\t";
                                                    codeProvide += "removeComponent : function () {\r\n\t";
                                                    codeProvide += "    var childrens = this.getChildren(),\r\n\t";
                                                    codeProvide += "    length = childrens.length,\r\n\t";
                                                    codeProvide += "    cssTag = null,\r\n\t";
                                                    codeProvide += "    scriptTag = null,\r\n\t";
                                                    codeProvide += "    i = 0,\r\n\t";
                                                    codeProvide += "    children = null,\r\n\t";
                                                    codeProvide += "    localSource = null,\r\n\t";
                                                    codeProvide += "    localSourceName = '';\r\n\t";
                                                    codeProvide += "    if (this.sources) {\r\n\t";
                                                    codeProvide += "        for (localSourceName in this.sources) {\r\n\t";
                                                    codeProvide += "        localSource = this.sources[localSourceName];\r\n\t";
                                                    codeProvide += "        if (localSource) {\r\n\t";
                                                    codeProvide += "            WAF.dataSource.destroy(localSource);\r\n\t";
                                                    codeProvide += "        }\r\n\t";
                                                    codeProvide += "        delete localSource;\r\n\t";
                                                    codeProvide += "        }\r\n\t";
                                                    codeProvide += "    }\r\n\t";
                                                    codeProvide += "    if (this.widgets) {\r\n\t";
                                                    codeProvide += "      for (wigdetName in this.widgets) { \r\n\t";
                                                    codeProvide += "          if($$(this.id + '_' + wigdetName)) {$$(this.id + '_' + wigdetName).destroy();}\r\n\t";
                                                    codeProvide += "          } \r\n\t";
                                                    codeProvide += "     }\r\n\t";
                                                    codeProvide += "    for (i = 0; i < length; i++) {\r\n\t";
                                                    codeProvide += "        children = childrens[i];    \r\n\t";
                                                    codeProvide += "        if (children.id) {\r\n\t";
                                                    codeProvide += "            if (children.kind === 'component') {\r\n\t";
                                                    codeProvide += "                children.removeComponent();\r\n\t";
                                                    codeProvide += "            }\r\n\t";
                                                    codeProvide += "            WAF.widgets[children.id].destroy();//delete WAF.widgets[children.id];\r\n\t";
                                                    codeProvide += "        }\r\n\t";
                                                    codeProvide += "    }\r\n\t";
                                                    codeProvide += "    // remove new widgets\r\n\t";
                                                    codeProvide += "    if ('waf-core/widget' in WAF.require.modules) { \r\n\t";
                                                    codeProvide += "        var widget = WAF.require('waf-core/widget');\r\n\t";
                                                    codeProvide += "        if(this.id in widget._instances) {\r\n\t";
                                                    codeProvide += "            widget._instances[this.id].invoke('destroy');\r\n\t";
                                                    codeProvide += "        }\r\n\t";
                                                    codeProvide += "    }\r\n\t";
                                                    codeProvide += "    cssTag = $('#waf-component-' + this.id);\r\n\t";
                                                    codeProvide += "    if (cssTag) {\r\n\t";
                                                    codeProvide += "        cssTag.remove();\r\n\t";
                                                    codeProvide += "    }\r\n\t";
                                                    codeProvide += "    scriptTag = $('[data-component-script-id=waf-component-' + this.id + ']');\r\n\t";
                                                    codeProvide += "    if (scriptTag) {\r\n\t";
                                                    codeProvide += "        scriptTag.remove();\r\n\t";
                                                    codeProvide += "    }\r\n\t";
                                                    codeProvide += "    this.$domNode.children().not('.ui-resizable-handle').remove();\r\n\t";
                                                    codeProvide += "    this.$domNode.css('visibility', 'hidden');\r\n\t";
                                                    codeProvide += "if (this.config['data-modal'] && this.config['data-modal'] === 'true' && $('#waf-component-fade')) {\r\n\t";
                                                    codeProvide += "$('#waf-component-fade').fadeOut(0, function() {\r\n\t";
                                                    codeProvide += "$('#waf-component-fade').remove();\r\n\t";
                                                    codeProvide += "});\r\n\t";
                                                    codeProvide += "}\r\n\t";
                                                    codeProvide += "    }\r\n\t";
                                                    codeProvide += "});";

                                                    eval(codeProvide);
                                                } else {
                                                    // DO NOTHING
                                                }

                                                myComp = new WAF.widget[param.name](param.data);

                                                // check if widgets created
                                                for (i in myComp.widgets) {
                                                    widgetCreated = true;
                                                }

                                                // execute the load
                                                if (myComp.load && widgetCreated) {
                                                    myComp.load(param.data);

                                                    /*
                                                     * To prevent bubbling
                                                     */
                                                    myComp.$domNode.find('label').bind('click', {}, function() {
                                                        $('#' + $(this).prop('for')).trigger('click');
                                                        $('#' + $(this).prop('for')).select();
                                                        return false;
                                                    });

                                                    /**
                                                     * On resize function on widget. Call children widgets resize functions
                                                     * @method onResize
                                                     */
                                                    myComp.onResize = function() {
                                                        var
                                                        i,
                                                        child,
                                                        children,
                                                        childrenLength;

                                                        children = this.getChildren();
                                                        childrenLength = children.length;

                                                        for (i = 0; i < childrenLength; i += 1) {
                                                            child = children[i];
                                                            if (child.onResize) {
                                                                child.onResize();
                                                            }
                                                        }
                                                    };

                                                    /*
                                                     * Call onResize function
                                                     */
                                                    myComp.onResize();

                                                    /*
                                                     * Call onReady function
                                                     */
                                                    for (i in myComp.widgets) {
                                                        if (myComp.widgets[i].ready) {
                                                            myComp.widgets[i].ready();
                                                        }
                                                    }

                                                }

                                                for (wigdetName in WAF.widgets) {
                                                    if (wigdetName.indexOf(param.id + '_') === 0) {

                                                        /*
                                                         * Execute widget component load custom event
                                                         */
                                                        if (WAF.widgets[wigdetName].onComponentLoad) {
                                                            WAF.widgets[wigdetName].onComponentLoad();
                                                        }
                                                    }
                                                }

                                                WAF.widgets[param.id] = myComp;

                                            } else {
                                                includeJavascript = tabScript[0];

                                                // add code for debug
                                                includeJavascript = '// //@ sourceURL=' + param.id + '-script.js \r\n\t' + includeJavascript;

                                                tagScript = document.createElement('script');
                                                tagScript.setAttribute('type', 'text/javascript');
                                                tagScript.setAttribute('data-component-script-id', 'waf-component-' + param.id);
                                                tagScript.text = includeJavascript;
                                                document.getElementsByTagName('head')[0].appendChild(tagScript);
                                            }

                                            if (myComp && myComp.$domNode) {
                                                attr = myComp.$domNode.attr('data-start-load');
                                                if (attr === undefined || attr === null || attr === 'true') {
                                                    compManager.remove(
                                                    function() {
                                                        if (!compManager.hasComponent() && !rpcFileManager.hasRpcFile() && WAF._private.catalogLoaded) {
                                                            WAF.onReady();
                                                        }
                                                    });
                                                }
                                            }

                                            param.onSuccess();

                                            // end callback
                                        }});
                                }
                                ;
                            }
                        }
                    };

                    reqScript.onreadystatechange = callBackJS;
                    reqScript.send(null);

                }, 'html');

            }
        });
    }
};
