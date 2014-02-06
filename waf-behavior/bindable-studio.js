(function() {
    "use strict";
    var klass = WAF.require('waf-behavior/bindable');

    var Studio = WAF.require('waf-behavior/studio');

    Studio.doAfterClassMethod('whenInherited', function(klass) {
        // add binding attribute
        for(var k in klass._bindable_properties) {
            klass.addAttribute({
                name: 'data-binding-' + k,
                description: k.split('-').map(String.capitalize).join(' ') + ' Source',
                typeValue: 'datasource'
            });
        }
    });

})();
