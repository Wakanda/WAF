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
 * @namespace WAF
 * @method buildBehavior
 * @param {Object} definition
 * @param {String} name
 * @static
 */
WAF.buildBehavior = function(definition, name) {
    var prot = new function() {
    },
    protParent = {},
    inherited = definition.getInheritedBehavior(),
    methodList = definition.getMethods(),
    attrList = definition.getAttributes(),
    l = inherited.length,
    behaviorParent,
    i = 0,
    v = null,
    p = null,
    attributeList = {},
    parentDefName = null,
    parentDef = null;

    if (l) {
        for (i = 0; i < l; i++) {
            parentDefName = inherited[i];
            parentDef = WAF.behaviorsDefinition[parentDefName];

            if (!WAF.behaviorsConstructor[parentDefName]) {
                arguments.callee(parentDef, parentDefName);
            }

            behaviorParent = new WAF.behaviorsConstructor[parentDefName];

            for (p in behaviorParent) {
                if (typeof behaviorParent[p] === 'function') {
                    prot[p] = protParent[p] = behaviorParent[p];
                } else {
                    attributeList[p] = behaviorParent[p];
                }
            }
        }
    }

    for (v in methodList) {
        if (protParent[v]) {
            prot[v] = (function(name, fn) {
                var prot = protParent[name];
                return function() {
                    var ctxTmp = this.Base;
                    this.Base = prot;
                    var result = fn.apply(this, arguments);
                    this.Base = ctxTmp;
                    return result;
                };
            })(v, methodList[v]);

        } else {
            prot[v] = methodList[v];
        }
    }

    for (p in attrList) {
        attributeList[p] = attrList[p];
    }

    prot['init'] = prot['init'] || function() {
    };

    var behavDef = (function(attr, proto) {
        return function Behavior() {
            var _attr = attr || {};

            for (p in _attr) {
                this[p] = _attr[p];
            }
        };
    })(attributeList);
    
    behavDef.prototype = prot;
    WAF.behaviorsConstructor[name] = behavDef;
    WAF.behaviors[name] = new behavDef();
};