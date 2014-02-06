(function() {
    "use strict";
    var Studio = WAF.require('waf-behavior/studio');

    Studio.doAfterClassMethod('whenInherited', function(klass) {
        // add the properties
        for(var k in klass._properties) {
            klass.addAttribute({
                name: 'data-' + k,
                defaultValue: klass._properties[k].defaultValue
            });
        }

        // add the change event
        klass.addEvent('Change', {
            targets: Object.keys(klass._properties)
        });
    });

})();
