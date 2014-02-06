(function() {
    "use strict";
    var DomHelpers = WAF.require('waf-behavior/domhelpers');

    // mark dom properties
    DomHelpers.doAfterClassMethod('addDomHtmlProperty', function(name, options) {
        this._properties[name].is_dom = true;
    });

    var Studio = WAF.require('waf-behavior/studio');

    Studio.doAfterClassMethod('whenInherited', function(klass) {
        // add auto fired dom events
        klass._auto_fired_dom_events && klass._auto_fired_dom_events.forEach(function(o) {
            if(o.event)
                klass.addEvent(o.event);
        });

        // allow html checboxes
        for(var k in klass._properties) {
            if(klass._properties[k].is_dom && (k + '-allow-html' in klass._properties)) {
                klass.addAttribute('data-' + k + '-allow-html', {
                    description: 'Allow HTML in ' + k.split('-').map(String.capitalize).join(' '),
                    type: 'checkbox'
                });
                klass.removeAttribute('data-binding-' + k + '-allow-html')
            }
        }
        
        // add inline editing for dom properties
        // for(var k in klass._properties) {
        //     var property = klass._properties[k];
        //     if(property.is_dom) {
        //         klass.addInlineEdit(k, property.selector);
        //     }
        // }
    });
})();
