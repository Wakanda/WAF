(function() {
    "use strict";
    /* globals Designer */
    var Properties = WAF.require('waf-behavior/properties');
    Properties.inherit(WAF.require('waf-behavior/studio'));

    var custom = Properties._propertiesCustomHelper;

    Properties.types['*'].attribute = { };
    Properties.types['*'].denormalize = function(value) { if(value == null) return ''; return String(value); };
    Properties.types['boolean'].attribute = { type: 'checkbox' };
    Properties.types['integer'].attribute = {
        typeValue: 'custom',
        checkMethod: function(value) {
            if(value === '') {
                return true;
            }
            return /^[-+]?\d+(e[+]?\d+)?$/i.test(value);
        }
    };
    Properties.types['number'].attribute = {
        typeValue: 'custom',
        checkMethod: function(value) {
            if(value === '') {
                return true;
            }
            return /^[-+]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i.test(value);
        }
    };
    Properties.types['date'].attribute = {
        typeValue: 'custom',
        checkMethod: function(value) {
            if(value === '') {
                return true;
            }
            return regexIso8601.test(value);
        },
    };
    Properties.types['date'].denormalize = function(date) {
        return date.toISOString();
    };
    Properties.types['enum'].attribute = function(name, options) {
        var comboOptions = [];
        if(Array.isArray(options.values)) {
            comboOptions = options.values.map(function(i) {
                i = String(i);
                return {
                    key: i,
                    value: i.split(/[-_]/).map(String.capitalize).join(' ')
                };
            });
        } else {
            comboOptions = Object.keys(options.values).map(function(i) {
                return {
                    key: i,
                    value: options.values[i]
                };
            });
        }
        return {
            type: 'combobox',
            allowEmpty: true,
            options: comboOptions,
            defaultValue: options.defaultValue || comboOptions[0].key
        };
    };

    Properties.types['*'].afterAddStudio = function(name, property) {
        var attribute = custom(property, 'attribute');
        if(typeof attribute === 'function') {
            attribute = attribute.call(this, name, property);
        }
        this._addAttribute('data-' + name.toLowerCase(), WAF.extend({
            defaultValue: custom(property, 'denormalize')(property.defaultValue)
        }, attribute));

        if(property.bindable) {
            this._addAttribute('data-binding-' + name.toLowerCase(), {
                description: name.split('-').map(String.capitalize).join(' ') + ' Source',
                typeValue: 'datasource'
            });
        }

        // add the change event
        this.addEvent('change', {
            targets: Object.keys(this._properties),
            category: 'Property Events'
        });
    };

    Properties.doAfterClassMethod('addProperty', function(name) {
        var property = this._properties[name];
        if(['source', 'binding', 'label', 'lib', 'package', 'type'].indexOf(name.toLowerCase()) >= 0 || !/^[a-z0-9_]+$/i.test(name)) {
            throw '"' + name + '" is not a valid name for a property.';
        }
        custom(property, 'afterAddStudio').call(this, name, property);
    });

    Properties.types['*'].afterRemoveStudio = function(name, property) {
        this._removeAttribute('data-' + name);
        this._removeAttribute('data-binding-' + name);
        if(Object.keys(this._properties).length === 0) {
            this.removeEvent('change');
        }
    };

    Properties.doBeforeClassMethod('removeProperty', function(name) {
        var property = this._properties[name];
        custom(property, 'afterRemoveStudio').call(this, name, property);
    });

    Properties.types['*'].afterInitBehaviorStudio = function(name, property) {
        var lname = name.toLowerCase();
        var that = this;
        var accessor = this[property.functionName];
        accessor.show = function() {
            accessor._hide = false;
            if(Designer.env.tag.current && Designer.env.tag.current.getWidget && Designer.env.tag.current.getWidget() === that) {
                Designer.ui.form.property.showAttribute('data-' + lname);
                Designer.ui.form.property.showAttribute('data-binding-' + lname);
            }
        };
        accessor.hide = function() {
            accessor._hide = true;
            if(Designer.env.tag.current && Designer.env.tag.current.getWidget && Designer.env.tag.current.getWidget() === that) {
                Designer.ui.form.property.hideAttribute('data-' + lname);
                Designer.ui.form.property.hideAttribute('data-binding-' + lname);
            }
        };
    };

    Properties.doAfter('_initBehavior', function() {
        Object.keys(this.constructor._properties).forEach(function(name) {
            var property = this.constructor._properties[name];
            custom(property, 'afterInitBehaviorStudio').call(this, name, property);
        }.bind(this));
    });

    Properties._studioOn('propertyPanelReady', function() {
        for(var name in this.getWidget().constructor._properties) {
            var property = this.getWidget().constructor._properties[name];
            var accessor = this.getWidget()[property.functionName];
            if(accessor._hide) {
                accessor.hide();
            } else {
                accessor.show();
            }
        }
    });

    /**
     * customize a property display in the studio
     * @param {string} name - Property name
     * @param {object} options
     * @param {string} [options.title]
     * @param {string} [options.description]
     * @param {boolean} [options.display=true] - show the static field
     * @param {boolean} [options.multiline=false] - show a multiline field (ony for string or * properties)
     * @param {boolean} [options.radio=false] - show a radio group (only for enum properties)
     * @param {string} [options.sourceTitle]
     * @param {boolean} [options.sourceDisplay=true] - Show the source field
     * @method customizeProperty
     * @memberof Properties
     * @public
     */
    Properties.customizeProperty = function(name, options) {
        var attribute;
        if(!(name in this._properties)) {
            throw "You cannot customize the \"" + name + '" property because it is unknown.';
        }
        var property = this._properties[name];

        if('display' in options && !options.display) {
            this._removeAttribute('data-' + name.toLowerCase());
        } else {
            attribute = {};
            attribute.tooltip = name;
            if('description' in options) {
                attribute.tooltip += '\n' + options.description;
            }
            if('title' in options) {
                attribute.description = options.title;
            }
            if(property.type === 'enum' && options.radio) {
                attribute.type = 'radiogroup';
            }
            if((property.type === 'string' || property.type === '*') && options.multiline) {
                attribute.type = 'textarea';
            }
            this._addAttribute('data-' + name.toLowerCase(), attribute);
        }

        if('sourceDisplay' in options && !options.sourceDisplay) {
            this._removeAttribute('data-binding-' + name.toLowerCase());
        } else if('data-binding-' + name.toLowerCase() in this._configuration.attributes) {
            attribute = {};
            if('title' in options) {
                attribute.description = options.title + ' Source';
            }
            if('sourceTitle' in options) {
                attribute.description = options.sourceTitle;
            }
            this._addAttribute('data-binding-' + name.toLowerCase(), attribute);
        }
    };





    // Date polyfill to fix broken webkit Date.parse in studio
    // https://github.com/ckozl/JavaScript-iso8601-Date-Parsing--xbrowser-polyfill-/blob/master/date_iso8601_polyfill.js
    var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,3})(?:Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;
    (function() {
        var d = window.Date;

        if (d.parse('2011-11-29T15:52:30.5') !== 1322581950500 ||
            d.parse('2011-11-29T15:52:30.52') !== 1322581950520 ||
            d.parse('2011-11-29T15:52:18.867') !== 1322581938867 ||
            d.parse('2011-11-29T15:52:18.867Z') !== 1322581938867 ||
            d.parse('2011-11-29T15:52:18.867-03:30') !== 1322594538867 ||
            d.parse('2011-11-29') !== 1322524800000 ||
            d.parse('2011-11') !== 1320105600000 ||
            d.parse('2011') !== 1293840000000) {

            d.__parse = d.parse;

            d.parse = function(v) {

                var m = regexIso8601.exec(v);

                if (m) {
                    return Date.UTC(
                        m[1],
                        (m[2] || 1) - 1,
                        m[3] || 1,
                        m[4] - (m[8] ? m[8] + m[9] : 0) || 0,
                        m[5] - (m[8] ? m[8] + m[10] : 0) || 0,
                        m[6] || 0,
                        ((m[7] || 0) + '00').substr(0, 3)
                    );
                }

                return d.__parse.apply(this, arguments);

            };
        }

        d.__fromString = d.fromString;

        d.fromString = function(v) {

            if (!d.__fromString || regexIso8601.test(v)) {
                return new d(d.parse(v));
            }

            return d.__fromString.apply(this, arguments);
        };
    })();

})();
