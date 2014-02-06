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
 * 
 * @namespace WAF
 * @class WidgetDefinition
 */
WAF.WidgetDefinition = function () {
    var attributeStorage = {},
    observableAttributeStorage = {},
    methodStorage = {},
    useStorage = [],
    widgetInherited = null;

    /**
     * @namespace WAF.BehaviorDefinition
     * @method addMethod
     * @param {String} name
     * @param {Function} fn
     * @returns {WAF.WidgetDefinition}
     */
    this.addMethod = function(name, fn) {
        methodStorage[name] = fn;
        return this;
    };

    /**
     * @namespace WAF.BehaviorDefinition
     * @method addAttribute
     * @param {String} name
     * @param {String} value
     * @param {Boolean} observable
     * @returns {WAF.WidgetDefinition}
     */
    this.addAttribute = function(name, value, observable) {
        if (attributeStorage[name] || observableAttributeStorage[name]) {
            delete attributeStorage[name];
            delete observableAttributeStorage[name];
        }

        if (observable) {
            observableAttributeStorage[name] = value;
        } else {
            attributeStorage[name] = value;
        }

        return this;
    };

    /**
     * @namespace WAF.BehaviorDefinition
     * @method inherit
     * @param {String} name
     * @returns {WAF.WidgetDefinition}
     */
    this.inherit = function(name) {
        if (name in WAF.behaviorsDefinition) {
            if (useStorage.indexOf(name) < 0) {
                useStorage.push(name);
            }
            return this;
        }

        widgetInherited = name;
        return this;
    };

    /**
     * @namespace WAF.BehaviorDefinition
     * @method getAttributes
     * @returns {Object}
     */
    this.getAttributes = function() {
        return attributeStorage;
    };

    /**
     * @namespace WAF.BehaviorDefinition
     * @method getObservableAttributes
     * @returns {Object}
     */
    this.getObservableAttributes = function() {
        return observableAttributeStorage;
    };

    /**
     * @namespace WAF.BehaviorDefinition
     * @method getMethods
     * @returns {Object}
     */
    this.getMethods = function() {
        return methodStorage;
    };

    /**
     * @namespace WAF.BehaviorDefinition
     * @method getUses
     * @returns {Array}
     */
    this.getUses = function() {
        return useStorage;
    };

    /**
     * @namespace WAF.BehaviorDefinition
     * @method getInheritedWidget
     * @returns {String}
     */
    this.getInheritedWidget = function() {
        return widgetInherited;
    };
};

/**
 * 
 * @namespace WAF
 * @method defineCustom
 * @param {String} widgetName
 * @param {Object} def
 * @static
 */
WAF.defineCustom = function(widgetName, def) {
    WAF.define(widgetName, true, def);
};

/**
 * 
 * @namespace WAF
 * @method define
 * @param {String} widgetName
 * @param {Boolean} custom
 * @param {Object} def
 * @static
 */
WAF.define = function(widgetName, custom, def) {
    var namespace, 
    ref, 
    p;

    if (typeof custom === 'undefined') {
        custom = true;
    }

    if (custom) {
        namespace = WAF.customWidgets;
    } else {
        namespace = WAF.customWAFWidgets;
    }
    namespace[widgetName] = ref = new WAF.WidgetDefinition();

    if (def) {
        if (def['inherit']) {
            ref.inherit(def['inherit']);
            delete def['inherit'];
        }

        for (p in def) {
            if (typeof def[p] === 'function') {
                ref.addMethod(p, def[p]);
            } else {
                ref.addAttribute(p, def[p]);
            }
        }
    }

    return ref;
};


/**
 * 
 * @namespace WAF
 * @method loadWidgets
 * @static
 */
WAF.loadWidgets = function() {
    var wid, 
    widgetDef;

    WAF.initWidgetInProcess = 1;

    for (wid in WAF.customWidgets) {
        widgetDef = WAF.customWidgets[wid];
        if (WAF.widget[wid]) {
            continue;
        }
        WAF.buildWidgetConstructor(widgetDef, wid);
    }
    delete WAF.initWidgetInProcess;
};