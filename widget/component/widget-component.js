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

WAF.Widget.provide(
'Component',
{},
/**
 * @namespace WAF.wiget.Component
 * @constructor
 * @param {String} config
 * @param {String} data
 * @param {String} shared
 **/
function(config, data, shared) {

},
{
    /**
     * Remove the current web component from the placeholder
     * @namespace WAF.widget.Component
     * @method removeComponent
     * @param {Object} params load the web component in the place holder
     */
    loadComponent: function(params) {
        this.removeComponent();
        var userData = {},
        param = null;

        // add parameters key into config
        this.config.userData = userData;

        // no parameter
        if (typeof params === 'undefined') {
            if (this.config['data-path'] !== null) {
                WAF.loadComponent({
                    id: this.config.id,
                    path: this.config['data-path'],
                    data: this.config
                });
            }
        } else {
            // parameters

            // if not null
            if (params !== null) {
                // if string
                if (typeof params === 'string') {
                    WAF.loadComponent({
                        id: this.config.id,
                        path: params,
                        data: this.config
                    });
                } else {
                    // if object

                    // add extra parameters 
                    if (typeof params.userData !== 'undefined') {
                        for (param in params.userData) {
                            if (param !== 'id' && param !== 'path' && param !== 'onSuccess') {
                                userData[param] = params.userData[param];
                            }
                        }
                    }

                    WAF.loadComponent({
                        id: params.id || this.config.id,
                        path: params.path || this.config['data-path'],
                        onSuccess: params.onSuccess || function() {
                        },
                        data: this.config
                    });
                }
            }
        }
    },
    /**
     * Remove the current web component from the placeholder
     * @namespace WAF.widget.Component
     * @method removeComponent
     */
    removeComponent: function() {
        var childrens = this.getChildren(),
        length = childrens.length,
        i = 0,
        cssTag = null,
        scriptTag = null,
        children = null,
        localWidgetName = '',
        localSourceName = '',
        localSource = null;

        if (this.unload) {
            this.unload();
        }

        if (this.sources) {
            for (localSourceName in this.sources) {                                
                localSource = this.sources[localSourceName];
                if (localSource) {                              
                    WAF.dataSource.destroy(localSource);
                }
                delete localSource;
            }
        }

        if (this.widgets) {
            for (localWidgetName in this.widgets) {
                if (this.widgets.localWidgetName && this.widgets.localWidgetName.destroy) {
                    this.widgets.localWidgetName.destroy();
                }
            }
        }

        for (i = 0; i < length; i++) {
            children = childrens[i];
            if (children.id) {
                if (children.kind === 'component') {
                    children.removeComponent();
                }
                delete WAF.widgets[children.id];
            }
        }

        // remove new widgets
        $('[data-package][data-type]').each(function() {
            var widget = WAF.require('waf-core/widget');
            if(widget.get(this)) {
                widget.get(this).destroy();
            }
        });

        this.$domNode.children().remove();

        cssTag = $('#waf-component-' + this.id);
        if (cssTag) {
            cssTag.remove();
        }

        scriptTag = $('[data-component-script-id=waf-component-' + this.id + ']');
        if (scriptTag) {
            scriptTag.remove();
        }

        if ($('#waf-component-fade')) {
            $('#waf-component-fade').fadeOut(function() {
                $('#waf-component-fade').remove();
            });
        }
    }
});
