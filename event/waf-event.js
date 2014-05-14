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
 * @class Event
 * @param {JSON} args
 */
WAF.Event = function(args) {
    var initTarget = args.target,
    arr,
    p;

    for (p in args) {
        this[p] = args[p];
    }

    if (initTarget && initTarget.indexOf('.')) {
        arr = initTarget.split('.');
        this.attribute = arr[1];
        initTarget = arr[0];
    }

    if (initTarget in WAF.widgets) {
        this.targetObject = WAF.widgets[initTarget];
    } else if (initTarget in sources) {
        this.targetObject = sources[initTarget];
    } else {
        this.targetObject = null;
    }
};