WAF.define('waf-behavior/style', function() {
    var Behavior = WAF.require('waf-core/behavior'),
    Event = WAF.require('waf-core/event'),
    WakError = WAF.require('waf-core/error');

    /**
     * @class Style
     * @augments Style
     * @param {string} [options.hideonload]
     * @param {string} [options.binding-css] - semicolon separated list of css_property=datasource.attribute pairs
     */
    var klass = Behavior.create('Style');
    var proto = klass.prototype;

    klass.classes = ['waf-widget'];
    klass.mergeClassAttributeOnInherit('classes');

    /**
     * Tell if the widget have a css class by default
     * @param {string} class - CSS class name
     * @returns {boolean}
     * @memberof Style
     */
    klass.hasClass = function(c) {
        return !!~this.classes.indexOf(c);
    };

    /**
     * Add a default css class
     * @param {string} class - CSS class name
     * @memberof Style
     */
    klass.addClass = function(c) {
        if (!this.hasClass(c)) {
            this.classes.push(c);
        }
    };

    /**
     * Remove a default css class
     * @param {string} class - CSS class name
     * @memberof Style
     */
    klass.removeClass = function(c) {
        var i = this.classes.indexOf(c);
        if (~i)
            this.classes.splice(i, 1);
    };

    klass._options_classes = {};
    /**
     * Add a new option to the widget where values will correspond to css classes
     * @param {string} option_name
     * @param {object} values - An object with keys as option values and values as css classes names
     * @param {string} [default] - The default otion value
     * @memberof Style
     */
    klass.addClassOption = function(option_name, values, _default) {
        // add support for a new option that directly transform into a class
        var o = this._options_classes[option_name] = {
            values: values,
            'default': _default
        };
        if (arguments.length > 2)
            this.default_options[option_name] = _default;
        this.options_parsers[option_name] = function() {
            Object.values(o.values).forEach(function(c) {
                this.removeClass(c);
            }.bind(this));
            this.addClass(o.values[this.options[option_name]] || o.values[o['default']]);
        };
    };

    /**
     * Add a css class
     * @param {string} class - CSS class name
     * @param {string} [selector] - a css selector to select the dom sub node where to add the class
     * @memberof Style
     * @instance
     */
    proto.addClass = function(klass, selector) {
        if (selector) {
            $(this.node).find(selector).addClass(klass);
        } else {
            $(this.node).addClass(klass);
            if (typeof Designer !== 'undefined') {
                var tag = Designer.getById(this.id);
                if (tag) {
                    tag.addClass(klass);
                }
            }
        }
    };

    /**
     * Remove a css class
     * @param {string} class - CSS class name
     * @param {string} [selector] - a css selector to select the dom sub node where to remove the class
     * @memberof Style
     * @instance
     */
    proto.removeClass = function(klass, selector) {
        if (selector)
            $(this.node).find(selector).removeClass(klass);
        else
            $(this.node).removeClass(klass);
        if (typeof Designer !== 'undefined') {
            var tag = Designer.getById(this.id);
            if (tag) {
                tag.removeClass(klass);
            }
        }
    };

    /**
     * Tell if the widget have a css class
     * @param {string} class - CSS class name
     * @returns {boolean}
     * @memberof Style
     * @instance
     */
    proto.hasClass = function(klass, selector) {
        if (selector)
            return $(this.node).find(selector).hasClass(klass);
        else
            return $(this.node).hasClass(klass);
    };

    /**
     * Toggle a css class
     * @param {string} class - CSS class name
     * @param {string} [selector] - a css selector to select the dom sub node where to toggle the class
     * @memberof Style
     * @instance
     */
    proto.toggleClass = function(klass, selector) {
        if (selector)
            $(this.node).find(selector).toggleClass(klass);
        else
            $(this.node).toggleClass(klass);
    };

    /**
     * Set style values
     * @param {object} object - list of css properties and values
     * @memberof Style
     * @instance
     */
    /**
     * Set style values
     * @param {string} object - css property
     * @param {string} value - css value
     * @memberof Style
     * @instance
     */
    proto.style = function(obj_or_name, value) {
        if (typeof obj_or_name == 'object') {
            for (var k in obj_or_name) {
                this.style(k, obj_or_name[k]);
            }
            return;
        }
        var name = String.toCamelCase(obj_or_name, '-');
        if (arguments.length == 2) {
            this.node.style[name] = value;
        }
        return this.node.style[name];
    };

    /**
     * Make the widget visible
     * @param {object} object - list of css properties and values
     * @memberof Style
     * @instance
     */
    proto.show = function() {
        $(this.node).show();
    };

    /**
     * Make the widget not visible
     * @param {object} object - list of css properties and values
     * @memberof Style
     * @instance
     */
    proto.hide = function() {
        $(this.node).hide();
    };

    klass.options_parsers.hideonload = function() {
        if (this.options.hideonload == 'true')
            this.hide();
    };

    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof Style
     * @instance
     */
    proto.initProperties = function() {
        this._binded_css_attributes = {};
    };

    /**
     * Called to initialize behaviors 
     * @private
     * @memberof Style
     * @instance
     */
    proto.initBehavior = function() {
        this.constructor.classes.forEach(function(c) {
            this.addClass(c);
        }.bind(this));
    };

    /**
     * Called when enabling the widget to let behavior do what they need
     * @private
     * @memberof Style
     * @instance
     */
    proto.enableBehavior = function() {
        this.removeClass('waf-state-disabled');
    };

    /**
     * Called when disabling the widget to let behavior do what they need
     * @private
     * @memberof Style
     * @instance
     */
    proto.disableBehavior = function() {
        this.addClass('waf-state-disabled');
    };

    if ('waf-behavior/bindable' in WAF.require.modules) {
        klass.inherit(WAF.require('waf-behavior/bindable'));

        /**
         * Bind a datasource attribute to a css property
         * @param {Datasource} datasource - Datasource instance to bind to
         * @param {string} attribute - The attribute name
         * @param {string} css_property - The css property to bind
         * @memberof Style
         * @instance
         */
        proto.bindDatasourceAttributeCSS = function(datasource, attribute, css_property) {
            var that = this;

            if (this._binded_css_attributes[css_property])
                this._binded_css_attributes[css_property].unsubscribe();
            var subscriber = this._binded_css_attributes[css_property] = this.bindDatasourceAttributeWithCallback(datasource, attribute, function(value) {
                this.style(css_property, value);
            });

            var original_unsubscribe = subscriber.unsubscribe;
            subscriber.unsubscribe = function() {
                original_unsubscribe.call(this);
                delete that._binded_css_attributes[css_property];
            };
            subscriber.unbind = subscriber.unsubscribe;
            return subscriber;
        };

        klass.options_parsers['binding-css'] = function(name, value) {
            value = value.split(/ *; */);
            var re = / *([^ :]*) *: *([^.]*)\.([^ ]*)/;
            value.forEach(function(v) {
                v = re.exec(v);
                if (sources[v[2]])
                    this.bindDatasourceAttributeCSS(sources[v[2]], v[3], v[1]);
            }.bind(this));
        };

        /**
         * Called to initialize behaviors of a cloned widget
         * @param {BaseWidget} master - The widget cloned from
         * @private
         * @memberof Style
         * @instance
         */
        proto.cloneBehavior = function(master) {
            for (var css_property in master._binded_css_attributes) {
                var property = master._binded_css_attributes[css_property].property;
                var ba = this._binded_attributes[property]
                ba.subscriber.unsubscribe();
                this.bindDatasourceAttributeCSS(ba.datasource, ba.attribute, css_property);
            }
        };
    }



    return klass;
});
