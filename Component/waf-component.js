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
    length = 0,
    regex = null,
    match = null,
    attr = null,
    catalog = '',
    reqCss = '',
    reqJs = '',
    packageCssPath = '',
    packageJsPath = '';

    param = initParam(param);

    if (isCached(param)) {
        getComponentFromCache();
        emptyPlaceholder();
        setCssFromCache();
        setJsFromCache();
        setClassFromCache();
        setCatalogFromCache();
        createWidgets();
    } else {
        initLoad();
        emptyPlaceholder();
        loadCss();
        loadJs();
    }

    /* 
     * Internal methods
     */

    /**
     * init the param object with default values
     * @method initParam
     * @param {Object} param parameter
     * @return {Object} param parameter with default values
     */
    function initParam(param) {
        param = param || {};
        param.id = param.id || '';
        param.path = param.path || '';
        param.onSuccess = param.onSuccess || function() {
        };

        // clean path
        length = param.path.length;
        if (length && param.path[length - 1] === '/') {
            param.path = param.path.substr(0, length - 1);
        }

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

        if (typeof param.userData !== 'undefined') {
            param.data.userData = param.userData;
        }

        return param;
    }

    /**
     * Test if the web component ressources are already cached
     * @method isCached
     * @param {Object} param parameters send to the web component
     * @return {Boolean} true if the ressources about the web component are cached
     */
    function isCached(param) {
        var result = false;
        if (typeof WAF.webcomponents !== 'undefined' && WAF.webcomponents[param.path]) {
            result = true;
        }
        return result;
    }

    /**
     * Get the Web Component from the cache
     * @method getComponentFromCache
     */
    function getComponentFromCache() {
        widgetComponent = $$(param.id);

        icomponent = WAF.webcomponents[param.path];

        WAF.widgets[param.id] = {};
        WAF.widgets[param.id].data = param.data;

        $('#' + param.id).css('visibility', 'hidden');
    }

    /**
     * Remove all ressources already loaded in the place holder
     * @method emptyPlaceholder
     */
    function emptyPlaceholder() {
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

        if (widgetComponent && widgetComponent.widgets) {
            for (wigdetName in widgetComponent.widgets) {
                if ($$(param.id + '_' + wigdetName)) {
                    $$(param.id + '_' + wigdetName).destroy();
                }
            }
        }

        if (widgetComponent && widgetComponent.sources) {
            for (localSourceName in widgetComponent.sources) {
                localSource = widgetComponent.sources[localSourceName];
                if (localSource) {
                    WAF.dataSource.destroy(localSource);
                }
                delete localSource;
            }
        }

        if (widgetComponent && widgetComponent.unload) {
            widgetComponent.unload();
        }

        //$('#' + param.id).empty();
        $('#' + param.id).children().not('.ui-resizable-handle').remove();
    }


    /**
     * Set the catalog from the inforamtion located in the HTML (in cache)
     * @method setCatalogFromCache
     */
    function setCatalogFromCache() {
        if (icomponent.html) {
            regex = /[^\"]"WAF.catalog"[^>]+/;
            match = regex.exec(icomponent.html);

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
        }
    }

    /**
     * Get the HTML ressource of the web component from the cache
     * @method setHtmlFromCache
     */
    function setHtmlFromCache() {
        if (icomponent.html) {
            htmlUpdate = icomponent.html.replace(/{id}/g, param.id + '_');
            htmlUpdate = htmlUpdate.replace('<!DOCTYPE html >', '');
            htmlUpdate = htmlUpdate.replace('<meta name="generator" content="Wakanda GUIDesigner"/>', '');
            $('#' + param.id).append(htmlUpdate);
        }
    }

    /**
     * Get the CSS ressources of the web component from the cache
     * @method setCssFromCache
     */
    function setCssFromCache() {
        if (icomponent.css) {
            if (document.getElementById('waf-component-' + param.id)) {
                $('#' + 'waf-component-' + param.id).remove();
            }

            tagStyle = document.createElement('style');
            tagStyle.setAttribute('id', 'waf-component-' + param.id);
            styleUpdate = icomponent.css.replace(/{id}/g, param.id + '_');
            styleUpdate = styleUpdate.replace('#' + param.id + '_ ', '#' + param.id);
            tagStyle.innerHTML = styleUpdate;

            tagWafCss = document.getElementById('waf-interface-css');

            tagWafCss.parentNode.appendChild(tagStyle);
        }
    }

    /**
     * Get the script ressources of the web component from the cache
     * @method setJsFromCache
     */
    function setJsFromCache() {
        if (icomponent.js) {
            tagScript = document.createElement('script');
            tagScript.setAttribute('type', 'text/javascript');
            tagScript.setAttribute('data-component-script-id', 'waf-component-' + param.id);
            tagScript.text = icomponent.js;
            document.getElementsByTagName('head')[0].appendChild(tagScript);
        }
    }

    /**
     * Get the web component class from the cache
     * @method setClassFromCache
     */
    function setClassFromCache() {
        if (typeof WAF.widget[param.name] === 'undefined') {
            eval(icomponent.wcMainJs);
        }
    }

    /**
     * Create the widgets inside the web components
     * @method createWidgets
     */
    function createWidgets() {
        ds.addToCatalog(icomponent.catalog, {'onSuccess': function() {
				
                setHtmlFromCache();
                
                WAF.tags.generate(param.id, false);

                $('#' + param.id).css('visibility', '');

                myComp = new WAF.widget[param.name](param.data);
                WAF.widgets[param.id] = myComp;

                if (typeof myComp.widgets === 'undefined') {
                    throw new Error('WAF> ' + param.name + ' Widget class was overridden by the ' + param.id + ' Web Component.');
                }

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

                if (myComp.load) {
                    myComp.load(param.data);

                    /**
                     * On resize function on widget. Call children widgets resize functions
                     * @method onResize
                     */
                    myComp.onResize = function() {
                        var i = 0,
                        child = null,
                        children = null,
                        childrenLength = 0;

                        children = this.getChildren();
                        childrenLength = children.length;

                        for (i = 0; i < childrenLength; i += 1) {
                            child = children[i];
                            if (child.onResize) {
                                child.onResize();
                            }
                        }
                    };

                    myComp.onResize();

                    // Call onReady function
                    for (i in myComp.widgets) {
                        if (myComp.widgets[i] && myComp.widgets[i].ready) {
                            myComp.widgets[i].ready();
                        }
                    }

                }

                for (wigdetName in WAF.widgets) {
                    if (wigdetName.indexOf(param.id + '_') === 0) {
                        if (WAF.widgets[wigdetName].onComponentLoad) {
                            WAF.widgets[wigdetName].onComponentLoad();
                        }
                    }
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
            }});
    }

    /**
     * Init some parameters before the load of the ressources of the web component
     * @method initLoad
     */
    function initLoad() {
        packageCssPath = param.path + '/' + param.name + '.package.json~waf-build.css',
        packageJsPath = param.path + '/' + param.name + '.package.json~waf-build.js';

        WAF.statuswebcomponents[param.path] = {};
        WAF.statuswebcomponents[param.path].styleLoaded = false;
        WAF.statuswebcomponents[param.path].scriptLoaded = false;
    }

    /** Load the CSS ressources of the web component
     * @method loadCss
     */
    function loadCss() {
        reqCss = new XMLHttpRequest();
        reqCss.open('POST', packageCssPath, true);
        reqCss.onreadystatechange = function() {
            if (reqCss.readyState === 4) {
                if (reqCss.status === 200) {
                    var tagStyle = null,
                    styleUpdate = '',
                    tagWafCss = null;
                    styleUpdate = reqCss.responseText.replace(/{id}/g, param.id + '_');
                    styleUpdate = styleUpdate.replace('#' + param.id + '_ ', '#' + param.id);

                    tagStyle = document.createElement('style');
                    tagStyle.setAttribute('id', 'waf-component-widget-' + param.id);
                    tagStyle.innerHTML = styleUpdate;
                    tagWafCss = document.getElementById('waf-interface-css');

                    tagWafCss.parentNode.insertBefore(tagStyle, tagWafCss);
                    WAF.statuswebcomponents[param.path].styleLoaded = true;
                }
            }
        };
        reqCss.send(null);
    }

    /** Load the script ressources of the web component
     * @method loadJs
     */
    function loadJs() {
        reqJs = new XMLHttpRequest();
        reqJs.open('POST', packageJsPath, true);
        callBackComponentJS = function() {
            if (reqJs.readyState === 4) {
                if (reqJs.status === 200) {
                    var tagScript = null;

                    tagScript = document.createElement('script');
                    tagScript.setAttribute('type', 'text/javascript');
                    tagScript.setAttribute('data-component-script-id', 'waf-component-widget-' + param.id);
                    tagScript.text = reqJs.responseText;
                    document.getElementsByTagName('head')[0].appendChild(tagScript);
                    WAF.statuswebcomponents[param.path].scriptLoaded = true;

                    /**
                     *  @param {Object} param object that contains the paamater
                     *  of loadComponent
                     *  @private
                     */
                    function waitForLoad(param) {
                        icomponent = WAF.statuswebcomponents[param.path];

                        if (!icomponent.styleLoaded || WAF.loader.scriptToLoad.length !== 0) {
                            // wait for the stylesheet
                            window.setTimeout(waitForLoad, 100, param);
                        } else {
                            if (typeof WAF.webcomponents !== 'undefined') {
                                icomponent = WAF.webcomponents[param.path];
                            }
                            if (icomponent && typeof WAF.webcomponents !== 'undefined') {

                                if (icomponent.html) {
                                    htmlUpdate = icomponent.html.replace(/{id}/g, param.id + '_');
                                    htmlUpdate = htmlUpdate.replace('<!DOCTYPE html >', '');
                                    htmlUpdate = htmlUpdate.replace('<meta name="generator" content="Wakanda GUIDesigner"/>', '');
                                    $('#' + param.id).append(htmlUpdate);

                                    // get catalog
                                    regex = /[^\"]"WAF.catalog"[^>]+/;
                                    match = regex.exec(icomponent.html);

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
                                }

                                if (icomponent.css) {
                                    if (document.getElementById('waf-component-' + param.id)) {
                                        $('#' + 'waf-component-' + param.id).remove();
                                    }

                                    tagStyle = document.createElement('style');
                                    tagStyle.setAttribute('id', 'waf-component-' + param.id);
                                    styleUpdate = icomponent.css.replace(/{id}/g, param.id + '_');
                                    styleUpdate = styleUpdate.replace('#' + param.id + '_ ', '#' + param.id);
                                    tagStyle.innerHTML = styleUpdate;

                                    tagWafCss = document.getElementById('waf-interface-css');

                                    tagWafCss.parentNode.insertBefore(tagStyle, tagWafCss);
                                }

                                if (icomponent.js) {
                                    tagScript = document.createElement('script');
                                    tagScript.setAttribute('type', 'text/javascript');
                                    tagScript.setAttribute('data-component-script-id', 'waf-component-' + param.id);
                                    tagScript.text = icomponent.js;
                                    document.getElementsByTagName('head')[0].appendChild(tagScript);
                                }

                                if (typeof WAF.widget[param.name] === 'undefined') {
                                    eval(icomponent.wcMainJs);
                                }

                                ds.addToCatalog(icomponent.catalog, {'onSuccess': function() {
                                        var widgetCreated = false;

                                        WAF.tags.generate(param.id, false);

                                        $('#' + param.id).css('visibility', '');

                                        myComp = new WAF.widget[param.name](param.data);

                                        if (typeof myComp.widgets === 'undefined') {
                                            throw new Error('WAF> ' + param.name + ' Widget class was overridden by the ' + param.id + ' Web Component.');
                                        }

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

                                        if (myComp.load && widgetCreated) {
                                            myComp.load(param.data);

                                            // prevent bubbling
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
                                                var i = 0,
                                                child = null,
                                                children = this.getChildren(),
                                                childrenLength = children.length;

                                                for (i = 0; i < childrenLength; i += 1) {
                                                    child = children[i];
                                                    if (child.onResize) {
                                                        child.onResize();
                                                    }
                                                }
                                            };

                                            myComp.onResize();

                                            for (i in myComp.widgets) {
                                                if (myComp.widgets[i].ready) {
                                                    myComp.widgets[i].ready();
                                                }
                                            }
                                        }

                                        for (wigdetName in WAF.widgets) {
                                            if (wigdetName.indexOf(param.id + '_') === 0) {
                                                if (WAF.widgets[wigdetName].onComponentLoad) {
                                                    WAF.widgets[wigdetName].onComponentLoad();
                                                }
                                            }
                                        }

                                        WAF.widgets[param.id] = myComp;

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
                                    }});
                            }
                        }
                    }
                    waitForLoad(param);
                }
            }
        };
        reqJs.onreadystatechange = callBackComponentJS;
        reqJs.send(null);
    }
};