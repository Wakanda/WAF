(function() {
    "use strict";
    var DomHelpers = WAF.require('waf-behavior/domhelpers');
    DomHelpers.inherit('waf-behavior/studio');

    DomHelpers.doAfterClassMethod('mapDomEvents', function(map, selector) {
        Object.keys(map).forEach(function(events) {
            if(Array.isArray(map[events])) {
                map[events].forEach(function(event) {
                    this.addEvent(event);
                }.bind(this));
            } else {
                this.addEvent(map[events]);
            }
        }.bind(this));
    });

})();
