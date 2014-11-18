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

WAF.addWidget({
    packageName: 'Widget/component',
    type: 'component',
    lib: 'WAF',
    description: 'Component',
    category: 'Containers/Placeholders',
    tag: 'div',
    attributes: [
        {
            name: 'class',
            description: 'Css class'
        },
        {
            name: 'data-path',
            description: 'Web component path',
            autocomplete: 'components'
        },
        {
            name: 'data-draggable',
            description: 'Draggable',
            type: 'checkbox'
        },
        {
            name: 'data-resizable',
            description: 'Resizable',
            type: 'checkbox'
        },
        {
            name: 'data-modal',
            description: 'Modal',
            type: 'checkbox'
        },
        {
            name: 'data-start-load',
            description: 'Load by default',
            type: 'checkbox',
            defaultValue: true
        }
    ],
    style: [
        {
            name: 'width',
            defaultValue: '200px'
        },
        {
            name: 'height',
            defaultValue: '200px'
        }],
    events: [
        {
            name: 'startResize',
            description: 'On Start Resize',
            category: 'Resize'

        },
        {
            name: 'onResize',
            description: 'On Resize',
            category: 'Resize'

        },
        {
            name: 'stopResize',
            description: 'On Stop Resize',
            category: 'Resize'

        },
        {
            name: 'click',
            description: 'On Click',
            category: 'Mouse Events'
        },
        {
            name: 'dblclick',
            description: 'On Double Click',
            category: 'Mouse Events'
        },
        {
            name: 'mousedown',
            description: 'On Mouse Down',
            category: 'Mouse Events'
        },
        {
            name: 'mouseout',
            description: 'On Mouse Out',
            category: 'Mouse Events'
        },
        {
            name: 'mouseover',
            description: 'On Mouse Over',
            category: 'Mouse Events'
        },
        {
            name: 'mouseup',
            description: 'On Mouse Up',
            category: 'Mouse Events'
        }],
    properties: {
        style: {
            theme: {
                'roundy': false
            },
            fClass: true,
            text: false,
            background: true,
            border: true,
            sizePosition: true,
            shadow: true,
            label: false,
            disabled: []
        }
    },
    onInit: function(config) {
        if (typeof Designer !== 'undefined') {

            /**
             * Display the html content of the component
             * @method displayHtml;
             */
            function displayHtml() {
                var css = '',
                dom = '',
                html = '',
                name = '',
                path = '',
                tagId,
                stream = null,
                tabName = [],
                re = '',
                widgetName = '',
                pathValue = '';

                tagId = config['id'];
                pathValue = config['data-path'];
                name = pathValue;

                if (pathValue) {
                    tabName = name.split('/');
                    name = tabName[tabName.length - 1].replace('.waComponent', '');

                    if (typeof studio !== 'undefined') {

                        // style
                        if (!Designer.env.isMac) {
                            path = Designer.env.pathProject + '\\' + pathValue + '\\' + name + '.css';
                            path = path.replace('/', '');
                        } else {
                            path = Designer.env.pathProject + '' + pathValue + '/' + name + '.css';
                            path = path.replace('/', '');
                            path = path.replace('\\', '');
                        }
                        try {
                            stream = studio.TextStream(path, 'read');
                            css = stream.read();
                        } catch (e) {
                            console.error('GUI Designer: error on loading file ' + path, e);
                        }

                        css = css.replace(/{id}/g, tagId + '_');
                        css = css.replace('#' + tagId + '_ ', '#' + tagId);
                        // change path of image 
                        css = css.replace(/url\(\'\/images/g, "url('" + Designer.env.pathProject + "/images/");
                        css = '<style>' + css + '</style>';

                        // dom
                        if (!Designer.env.isMac) {
                            path = Designer.env.pathProject + '\\' + pathValue + '\\' + name + '.html';
                            path = path.replace('/', '');
                        } else {
                            path = Designer.env.pathProject + '' + pathValue + '/' + name + '.html';
                            path = path.replace('/', '');
                            path = path.replace('\\', '');
                        }

                        try {
                            stream = studio.TextStream(path, 'read');
                            dom = stream.read();
                        } catch (e) {
                            console.error('GUI Designer: error on loading file ' + path, e);
                        }

                        dom = dom.replace(/{id}/g, tagId + '_');
                        dom = dom.replace('<!DOCTYPE html >', '');
                        dom = dom.replace('<meta name="generator" content="Wakanda GUIDesigner"/>', '');

                        // html
                        html = css + dom;

                        // change path of image 
                        html = html.replace(/data-src="\//g, 'data-src="' + Designer.env.pathProject + '/');
                        html = html.replace(/src="\//g, 'src="' + Designer.env.pathProject + '/');

                        // case of widget customs
                        re = new RegExp(Designer.env.pathProject + '/widgets-custom/', 'g');
                        html = html.replace(re, '/widgets-custom/');

                        document.getElementById(tagId).innerHTML = html;

                        // generate
                        WAF.tags.generate(tagId, false);

                        // lauch ready function
                        for (widgetName in WAF.widgets) {
                            if (widgetName && widgetName.indexOf(tagId) === 0 && WAF.widgets[widgetName].ready) {
                                WAF.widgets[widgetName].ready();
                            }
                        }
                    }
                }
            }

            displayHtml();

        } else {
            var component = new WAF.widget.Component(config);
            
            if (!config["data-resizable"] || config["data-resizable"] !== "true") {
                component.resizable(false);
            }
            
            // hide by default
            if (typeof Designer === 'undefined') {
                $('#' + config.id).css('visibility', 'hidden');
            }

            $('#' + config.id).prop({
                'class': config['class']
            });

            // Setting the theme
            if (typeof config['theme'] === 'string' && config['theme'] !== '') {
                $('#' + config.id).addClass(config['theme']);
            }

            if (!config['data-path']) {
                // nothing
            } else if (!config['data-start-load'] || config['data-start-load'] === 'true') {
                component.loadComponent();
            }
        }
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        /**
         * Display the html content of the component
         * @method displayHtml;
         */
        tag.displayHtml = function() {
            var css = '',
            dom = '',
            res = null,
            html = '',
            name = '',
            path = '',
            tagId = null,
            stream = null,
            tabName = [],
            widgetName,
            re = null,
            pathValue,
            componentPackage = {};

            if (!this.getId) {
                return false;
            }

            tagId = this.getId();

            pathValue = this.getAttribute('data-path').getValue();
            name = pathValue;

            if (pathValue) {
                res = name.match(/[^/]+/g);
                tabName = res.length > 0 ? res[res.length - 1] : res[0];
                name = tabName.replace('.waComponent', '');

                // clean
                var widget = WAF.require('waf-core/widget');
                if(tagId in widget._instances) {
                    widget._instances[tagId].invoke('destroy');
                }

                if (typeof studio !== 'undefined') {

                    if (!tag.getComponentRessource(pathValue)) {

                        // style
                        if (!Designer.env.isMac) {
                            path = Designer.env.pathProject + '\\' + pathValue + '\\' + name + '.css';
                            path = path.replace(/\\\//g, '\\');
                            path = path.replace(/\//g, '\\');
                        } else {
                            path = Designer.env.pathProject + '' + pathValue + '/' + name + '.css';
                            path = path.replace('/', '');
                            path = path.replace(/\\/g, '');
                            path = path.replace(/\/\//g, '/');
                        }

                        try {
                            stream = studio.TextStream(path, 'read');
                            css = stream.read();
                        } catch (e) {
                            console.error('GUI Designer: error on loading file ' + path, e);
                        }

                        css = css.replace(/{id}/g, tagId + '_');
                        css = css.replace('#' + tagId + '_ ', '#' + tagId);
                        css = css.replace(/url\(\'/g, "url('" + Designer.env.pathProject);
                        css = '<style>' + css + '</style>';

                        // dom
                        if (!Designer.env.isMac) {
                            path = Designer.env.pathProject + '\\' + pathValue + '\\' + name + '.html';
                            path = path.replace(/\\\//g, '\\');
                            path = path.replace(/\//g, '\\');
                        } else {
                            path = Designer.env.pathProject + '' + pathValue + '/' + name + '.html';
                            path = path.replace('/', '');
                            path = path.replace(/\\/g, '');
                            path = path.replace(/\/\//g, '/');
                        }

                        try {
                            stream = studio.TextStream(path, 'read');
                            dom = stream.read();
                        } catch (e) {
                            console.error('GUI Designer: error on loading file ' + path, e);
                        }

                        dom = dom.replace(/{id}/g, tagId + '_');
                        dom = dom.replace('<!DOCTYPE html >', '');
                        dom = dom.replace('<meta name="generator" content="Wakanda GUIDesigner"/>', '');

                        if (Designer.env.document.getElementsByAttribute('script', 'src', '/waLib/WAF/lib/tiny_mce/tiny_mce.js').length > 0) {
                            dom = dom.replace('<script type="text/javascript" src="/waLib/WAF/lib/tiny_mce/tiny_mce.js"></script>', '');
                        }

                        // html
                        html = css + dom;

                        // change path of image 
                        html = html.replace(/data-src="\//g, 'data-src="' + Designer.env.pathProject + '/');
                        html = html.replace(/src="\//g, 'src="' + Designer.env.pathProject + '/');

                        // case of widget customs
                        re = new RegExp(Designer.env.pathProject.replace(/\\/g, '\\\\') + '/widgets-custom/', 'g');
                        html = html.replace(re, '/widgets-custom/');

                        tag.setComponentRessource(pathValue, html);

                        // package.json
                        if (!Designer.env.isMac) {
                            path = Designer.env.pathProject + '\\' + pathValue + '\\' + name + '.package.json';
                            path = path.replace(/\\\//g, '\\');
                            path = path.replace(/\//g, '\\');
                        } else {
                            path = Designer.env.pathProject + '' + pathValue + '/' + name + '.package.json';
                            path = path.replace('/', '');
                            path = path.replace(/\\/g, '');
                            path = path.replace(/\/\//g, '/');
                        }

                        try {
                            stream = studio.TextStream(path, 'read');
                            componentPackage = JSON.parse(stream.read());
                            Designer.widget.addPackage(componentPackage);
                            Designer.disablePackage();
                            Designer.widget.injectDependencies(componentPackage.name);
                            Designer.enablePackage();

                        } catch (e) {
                            console.error('GUI Designer: error on loading file ' + path, e);
                        }

                    } else {
                        html = tag.getComponentRessource(pathValue);
                    }

                    document.getElementById(tagId).innerHTML = html;

                    // generate
                    Designer.disablePackage();
                    Designer.disableTagCreation();
                    WAF.tags.generate(tagId, false);
                    Designer.enableTagCreation();
                    Designer.enablePackage();

                    // lauch ready function
                    for (widgetName in WAF.widgets) {
                        if (widgetName && widgetName.indexOf(tagId) === 0 && WAF.widgets[widgetName].ready) {
                            WAF.widgets[widgetName].ready();
                        }
                    }
                } else {

                    // CSS
                    var requestCss = $.ajax({
                        url: pathValue + '/' + name + '.css'
                    });

                    requestCss.done(function(result) {
                        css = result.replace(/{id}/g, tagId + '_');
                        css = css.replace('#' + tagId + '_ ', '#' + tagId);
                        css = css.replace(/url\(\'/g, "url('" + Designer.env.pathProject);
                        css = '<style>' + css + '</style>';

                        // HTML
                        var requestHtml = $.ajax({
                            url: pathValue + '/' + name + '.html'
                        });

                        requestHtml.done(function(result) {
                            dom = result.replace(/{id}/g, tagId + '_');
                            dom = dom.replace('<!DOCTYPE html >', '');
                            dom = dom.replace('<meta name="generator" content="Wakanda GUIDesigner"/>', '');

                            if (Designer.env.document.getElementsByAttribute('script', 'src', '/waLib/WAF/lib/tiny_mce/tiny_mce.js').length > 0) {
                                dom = dom.replace('<script type="text/javascript" src="/waLib/WAF/lib/tiny_mce/tiny_mce.js"></script>', '');
                            }

                            document.getElementById(tagId).innerHTML = css + dom;

                            // generate
                            Designer.disablePackage();
                            Designer.disableTagCreation();
                            WAF.tags.generate(tagId, false);
                            Designer.enableTagCreation();
                            Designer.enablePackage();

                            // lauch ready function
                            for (widgetName in WAF.widgets) {
                                if (widgetName && widgetName.indexOf(tagId) === 0 && WAF.widgets[widgetName].ready) {
                                    WAF.widgets[widgetName].ready();
                                }
                            }
                        });
                    });
                }
            } else {
                html = "";
                tag.setComponentRessource(pathValue, html);
                document.getElementById(tagId).innerHTML = html;
            }
        };

        tag.displayHtml();
    },
    onCreate: function(tag, param) {
        if (param && param._isLoaded && tag.displayHtml) {
            setTimeout(tag.displayHtml, 0);
        }
    }
});                                                                                                                                  
