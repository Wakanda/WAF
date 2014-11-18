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
 * @namespace WAF.observerManager
 */
WAF.observerManager = (function() {
    var observerStorage = {},
    api = {};

    /**
     * @namespace WAF.observerManager
     * @method addObserver
     * @param {Object} args
     * @static
     */
    api.addObserver = function(args) {
        var obsrvr,
        target,
        eventType;

        obsrvr = args.observer;
        target = args.target;
        eventType = args.event;

        if (obsrvr instanceof WAF.Observer) {

            if (!(target in observerStorage)) {
                observerStorage[target] = {};
            }

            if (!(eventType in observerStorage[target])) {
                observerStorage[target][eventType] = [];
            }

            if (observerStorage[target][eventType].indexOf(obsrvr) < 0) {
                observerStorage[target][eventType].push(obsrvr);
            }
        }
    };

    /**
     * @namespace WAF.observerManager
     * @method notify
     * @param {object} event
     * @static 
     */
    api.notify = function(event) {
        var target,
        eventKind,
        obsrvrCollection,
        i,
        storageTmp;

        obsrvrCollection = [];
        if (event) {
            target = event.target;
            eventKind = event.eventKind;

            if (observerStorage[target]) {
                storageTmp = observerStorage[target];
                if (storageTmp[eventKind]) {
                    obsrvrCollection = obsrvrCollection.concat(storageTmp[eventKind]);
                }

                if (obsrvrCollection) {
                    for (i = 0; i < obsrvrCollection.length; i++) {
                        obsrvrCollection[i].notify(event);
                    }
                }
            }
        }
    };

    return api;
})();