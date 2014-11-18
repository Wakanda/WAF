(function() {
    "use strict";
    /* global Designer */
    var Style = WAF.require('waf-behavior/style');
    Style.inherit(WAF.require('waf-behavior/studio'));

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
