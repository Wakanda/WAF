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
 * @namespace WAF.behavior
 */
WAF.behavior = {};

/**
 * 
 * @namespace WAF.behaviors
 */
WAF.behaviors = {};

/**
 * 
 * @namespace WAF.behaviorsDefinition
 */
WAF.behaviorsDefinition = {};

/**
 * 
 * @namespace WAF.behaviorsConstructor
 */
WAF.behaviorsConstructor = {};

/**
 * @class WAF
 * @namespace BehaviorDefinition
 */
WAF.BehaviorDefinition = function() {
    var attributeStorage = {},
    methodStorage = {},
    inheritedStorage = [];

    /**
     * @namespace WAF.BehaviorDefinition
     * @method define
     * @param {String} name
     * @param {Function} fn
     * @returns {WAF.BehaviorDefinition}
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
     * @returns {WAF.BehaviorDefinition}
     */
    this.addAttribute = function(name, value) {
        attributeStorage[name] = value;
        return this;
    };

    /**
     * @namespace WAF.BehaviorDefinition
     * @method define
     * @param {String} name
     * @returns {WAF.BehaviorDefinition}
     */
    this.inherit = function(name) {
        if (name instanceof Array) {
            inheritedStorage = inheritedStorage.concat(name);
        } else {
            inheritedStorage.push(name);
        }
        return this;
    };

    /**
     * @namespace WAF.BehaviorDefinition
     * @method getAttributes
     * @returns {WAF.BehaviorDefinition}
     */
    this.getAttributes = function() {
        return attributeStorage;
    };

    /**
     * @namespace WAF.BehaviorDefinition
     * @method getMethods
     * @returns {WAF.BehaviorDefinition}
     */
    this.getMethods = function() {
        return methodStorage;
    };

    /**
     * @namespace WAF.BehaviorDefinition
     * @method getInheritedBehavior
     * @returns {WAF.BehaviorDefinition}
     */
    this.getInheritedBehavior = function() {
        return inheritedStorage;
    };
};

/**
 * @namespace WAF.behavior
 * @method define
 * @param {String} behaviorName
 * @param {JSON} def
 * @returns {WAF.BehaviorDefinition}
 */
WAF.behavior.define = function(behaviorName, def) {
    var ref,
    namespace,
    p;

    namespace = WAF.behaviorsDefinition;
    namespace[behaviorName] = ref = new WAF.BehaviorDefinition();
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
 * @namespace WAF
 * @method loadBehaviors
 * @static
 */
WAF.loadBehaviors = function() {
    var b,
    behaviortDef;

    WAF.initBehavior = 1;

    for (b in WAF.behaviorsDefinition) {
        behaviortDef = WAF.behaviorsDefinition[b];
        if (WAF.behaviors[b]) {
            continue;
        }
        WAF.buildBehavior(behaviortDef, b);
    }

    delete WAF.initBehavior;
};