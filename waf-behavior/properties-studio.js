(function() {
    "use strict";
    var Properties = WAF.require('waf-behavior/properties');
    Properties.inherit(WAF.require('waf-behavior/studio'));

    var custom = Properties._propertiesCustomHelper;

    Properties.types['*'].attribute = { };
    Properties.types['boolean'].attribute = { type: 'checkbox' };
    Properties.types['enum'].attribute = function(name, options) {
        var comboOptions = [];
        if(Array.isArray(options.values)) {
            comboOptions = options.values.map(function(i) {
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
            options: comboOptions,
            defaultValue: name.defaultValue || comboOptions[0].key
        };
    };

    Properties.types['*'].afterAddStudio = function(name, options) {
        var attribute = custom(options, 'attribute');
        if(typeof attribute === 'function') {
            attribute = attribute.call(this, name, options);
        }
        this.addAttribute('data-' + name, WAF.extend({
            defaultValue: this._properties[name].defaultValue
        }, attribute));

        // add the change event
        this.addEvent('change', {
            targets: Object.keys(this._properties),
            category: 'Property Events'
        });
    };

    Properties.doAfterClassMethod('addProperty', function(name) {
        var property = this._properties[name];
        custom(property, 'afterAddStudio').call(this, name, property);
    });

    Properties.types['*'].afterRemoveStudio = function(name, property) {
        this.removeAttribute('data-' + name);
        this.removeAttribute('data-binding-' + name);
        if(Object.keys(this._properties).length === 0) {
            this.removeEvent('change');
        }
    };

    Properties.doBeforeClassMethod('removeProperty', function(name) {
        var property = this._properties[name];
        custom(property, 'afterRemoveStudio').call(this, name, property);
    });

    /**
     * customize a property display in the studio
     * @param {string} name - Property name
     * @param {object} options
     * @param {string} [options.title]
     * @param {string} [options.description]
     * @param {boolean} [options.display=true] - show the static field
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

        if('display' in options && !options.display) {
            this.removeAttribute('data-' + name.toLowerCase());
        } else {
            attribute = {};
            attribute.tooltip = name;
            if('description' in options) {
                attribute.tooltip += '\n' + options.description;
            }
            if('title' in options) {
                attribute.description = options.title;
            }
            this.addAttribute('data-' + name.toLowerCase(), attribute);
        }

        if('sourceDisplay' in options && !options.sourceDisplay) {
            this.removeAttribute('data-binding-' + name.toLowerCase());
        } else if('data-binding-' + name.toLowerCase() in this._configuration.attributes) {
            attribute = {};
            if('title' in options) {
                attribute.description = options.title + ' Source';
            }
            if('sourceTitle' in options) {
                attribute.description = options.sourceTitle;
            }
            this.addAttribute('data-binding-' + name.toLowerCase(), attribute);
        }
    };

})();
