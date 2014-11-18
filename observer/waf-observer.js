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
 * @class Observer
 */
WAF.Observer = function() {
    var storage = {};

    /**
     * @namespace WAF.Observer
     * @method observe
     * @param {Object} args
     */
    this.observe = function(args) {
        var fn,
        event,
        target,
        evType,
        attribute,
        initTarget,
        options,
        userData,
        obj,
        isAttr;

        fn = args.fn;
        event = args.event;
        target = initTarget = args.target;
        options = args.options || {};
        userData = args.userData;

        if (!target || !fn) {
            return false;
        }

        if (target && target.indexOf('.') >= 0) {
            var struct = target.split('.');
            target = struct[0];
            attribute = struct[1];
            isAttr = true;
        }

        if (target in WAF.widgets) {
            evType = 'widgetEvent';
            if (isAttr) {
                evType = 'widgetPropertyEvent';
                event = 'change';
            }
        } else if (target in sources) {
            evType = 'dsEvent';
        }

        if (evType) {
            if (!(evType in storage)) {
                storage[evType] = {};
            }

            if (!(initTarget in storage[evType])) {
                storage[evType][initTarget] = {};
            }

            if (!(event in storage[evType][initTarget])) {
                storage[evType][initTarget][event] = [];
            }

            obj = {
                options: options,
                userData: userData,
                fn: fn
            };

            storage[evType][initTarget][event].push(obj);
            WAF.observerManager.addObserver({
                observer: this,
                target: target,
                event: event
            });
        }
    };


    /**
     * @namespace WAF.Observer
     * @method notify
     * @param {Object} event
     */
    this.notify = function(event) {
        var callbackCollection,
        target,
        evType,
        eventKind,
        i,
        p,
        obj,
        opt,
        uData,
        fn,
        attribute,
        targetTmp,
        newEvent,
        sourceStr,
        storageTmp,
        match,
        makeDispatch = true;

        if (event) {
            callbackCollection = [];
            target = event.target;
            eventKind = event.eventKind;
            evType = event.eventType;
            attribute = event.attributeName;

            if (evType === 'dsEvent') {

                storageTmp = storage[evType][target] || [];

                if (storageTmp['all']) {
                    callbackCollection = callbackCollection.concat(storageTmp['all']);
                }

                switch (eventKind) {                 
                    case 'onCurrentElementChange':
                        if (storageTmp['onCurrentElementChange']) {
                            callbackCollection = callbackCollection.concat(storageTmp['onCurrentElementChange']);
                        }

                        if (storageTmp['onAttributeChange']) {
                            callbackCollection = callbackCollection.concat(storageTmp['onAttributeChange']);
                        }

                        sourceStr = target + '.';
                        for (p in storage[evType]) {
                            if (p.indexOf(sourceStr) === 0) {
                                callbackCollection = callbackCollection.concat(storage[evType][p]['onAttributeChange']);
                            }
                        }
                        break;
                    case 'onAttributeChange':
                        callbackCollection = callbackCollection.concat(storageTmp['onAttributeChange']);
                        if (attribute) {
                            targetTmp = target + '.' + attribute;
                            if (storage[evType][targetTmp] && storage[evType][targetTmp][eventKind]) {
                                callbackCollection = callbackCollection.concat(storage[evType][targetTmp][eventKind]);
                            }
                        }
                        break;
                    default :
                        if (storageTmp[eventKind]) {
                            callbackCollection = callbackCollection.concat(storageTmp[eventKind]);
                        }
                        break;
                }
            } else if (storage[evType] && storage[evType][target] && storage[evType][target][eventKind]) {
                callbackCollection = storage[evType][target][eventKind];
            }

            if (callbackCollection) {
                for (i = 0; i < callbackCollection.length; i++) {
                    obj = callbackCollection[i];
                    makeDispatch = true;

                    // check to avoid loop
                    if (obj.options && (obj.options.subID != null || event.dispatchSubID != null)) {
                        if (obj.options.subID) {
                            match = obj.options.subID.match(event.dispatchSubID);
                            if (match && match.length >= 1 && match[0]) {
                                makeDispatch = true;
                            }
                            else {
                                makeDispatch = false;
                            }
                        }
                        else {
                            makeDispatch = (event.dispatchSubID === obj.options.subID);
                        }
                    }

                    if (makeDispatch) {
                        opt = obj.options || {};
                        uData = obj.userData;

                        newEvent = new WAF.Event(event);
                        newEvent.data = obj.userData;
                        newEvent.userData = obj.userData;
                        fn = obj.fn;

                        fn(newEvent, opt, uData);
                    }
                }
            }
        }
    };
};