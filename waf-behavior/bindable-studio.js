(function() {
    "use strict";
    var klass = WAF.require('waf-behavior/bindable');
    klass.inherit(WAF.require('waf-behavior/studio'));

    klass.doAfterClassMethod('makeBindableProperty', function(property) {
        if(typeof property !== 'string') {
            property = '';
        }

        this.addAttribute('data-binding' + (property ? '-' : '') + property, {
            description: property.split('-').map(String.capitalize).join(' ') + ' Source',
            typeValue: 'datasource'
        });
    });

})();
