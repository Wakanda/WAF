;(function() {

    var Widget = WAF.require('waf-core/widget');
    var widget = Widget.Container;
    widget.inherit(WAF.require('waf-behavior/studio'));

    widget.setBehaviors({
        isContainer: true,
        //isAbsolutePosition: false
    });
    widget.setCategory('Hidden');

})();
