(function() {
    "use strict";
    var MultiContainer = WAF.require('waf-behavior/layout/multicontainer');

    MultiContainer.addEvent('select');
    MultiContainer.setBehaviors({ isContainer: false }); 
})();
