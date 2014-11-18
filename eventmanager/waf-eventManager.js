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
 * @namespace WAF.eventManager
 */
WAF.eventManager = {
    /**
     * @namespace WAF.eventManager
     * @method fireEvent
     * @param {Object} eventObj
     * @static
     */
    fireEvent: function(eventObj) {
        WAF.observerManager.notify(eventObj);
    },
    /** Building event process is now in the observer file
     * @namespace WAF.eventManager
     * @method buildEvent
     * @param {Object} eventObj
     * @returns {WAF.widgets}
     * @static
     */
    buildEvent: function(eventObj) {
        var wEvent,
        targetId = eventObj.target,
        arr;

        if (targetId && targetId.indexOf('.') > 0) {
            arr = targetId.split('.');
            targetId = arr[0];
        }

        if (targetId in sources) {
            wEvent = new WAF.Event('widgetEvent', eventObj.event, eventObj.target);
        } else if (targetId in WAF.widgets) {
            wEvent = new WAF.Event({
                eventKind: 'widgetEvent',
                eventType: eventObj.event,
                target: eventObj.target
            });
        } else {
            //other event TO DO
        }

        return wEvent;
    }
};