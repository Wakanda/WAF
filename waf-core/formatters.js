WAF.define('waf-core/formatters', ['waf-core/class'], function(Class) {
    "use strict";
    var Formatter = Class.create();

    Formatter.prototype.initialize = function(args) {
        this['arguments'] = args;
    };

    Formatter.prototype._run = function(func, value, callback) {
        var that = this;
        var args = [];
        var count = this['arguments'].length;
        function setArg(i, arg) {
            args[i] = arg;
            count--;
            if(!count) {
                callback(that[func].apply(that, [value].concat(args)));
            }
        }
        this['arguments'].forEach(function(arg, i) {
            if(typeof arg !== 'object') {
                setArg(i, arg);
            } else {
                arg._getFormatedValue(setArg.bind(undefined, i));
            }
        });
    };

    Formatter.prototype.unformat = function(value) {
        return value;
    };
    Formatter.prototype.format = function(value) {
        return value;
    };

    Formatter.create = function(name, methods) {
        Formatter[name] = Class.create();
        Formatter[name].kind = name;
        Formatter[name].inherit(this);
        WAF.extend(Formatter[name].prototype, methods);
    };

    Formatter.create('money', {
        unformat: function(value, devise) {
            value = value.replace(' ', '');
            value = value.replace(',', '.');
            return parseFloat(value);
        },
        format: function(value, devise) {
            var v = String(Math.floor(value));
            return [].map.call(v, function(s, i) {
                        if((v.length - i) % 3 === 0 && i) {
                            s = ' ' + s;
                        }
                        return s;
                    }).join('') +
                    ',' +
                    Math.round(100 * (value % 1)) + devise;
        }
    });

    Formatter.create('add', {
        unformat: function(value, mul) {
            return value - mul;
        },
        format: function(value, mul) {
            return value + mul;
        }
    });

    Formatter.create('multiply', {
        unformat: function(value, mul) {
            return value / mul;
        },
        format: function(value, mul) {
            return value * mul;
        }
    });

    return Formatter;
});
