(function() {
    var Style = WAF.require('waf-behavior/style');

    Style.doAfterClassMethod('addClassOption', function(name, values, _default) {
        var options = [];
        for(var k in values)
            options.push({
                key: k,
                value: k.split('-').map(String.capitalize).join(' ')
            });
        this.addAttribute('data-' + name, {
            type: 'combobox',
            options: options,
            defaultValue: _default || options[0].key
        });
    });

})();
