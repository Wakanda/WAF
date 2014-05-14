(function() {
    "use strict";
    /* global Designer */
    var Style = WAF.require('waf-behavior/style');
    Style.inherit(WAF.require('waf-behavior/studio'));

    Style.doAfterClassMethod('addClassOption', function(name, values, _default) {
        var options = [];
        for(var k in values) {
            options.push({
                key: k,
                value: k.split('-').map(String.capitalize).join(' ')
            });
        }
        this.addAttribute('data-' + name, {
            type: 'combobox',
            options: options,
            defaultValue: _default || options[0].key
        });
    });

    Style.doAfter('addClass', function(klass, selector) {
        if (typeof Designer !== 'undefined') {
            var tag = Designer.getById(this.id);
            if (tag) {
                tag.addClass(klass);
            }
        }
    });

    Style.doAfter('removeClass', function(klass, selector) {
        if (typeof Designer !== 'undefined') {
            var tag = Designer.getById(this.id);
            if (tag) {
                tag.removeClass(klass);
            }
        }
    });

    delete Style.optionsParsers.hideonload;

})();
