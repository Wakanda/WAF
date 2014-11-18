WAF.define('waf-behavior/style', function() {
    "use strict";
    /* global sources */
    var Behavior = WAF.require('waf-core/behavior');

    /**
     * @class Style
     * @augments Style
     * @param {string} [options.hideonload]
     * @param {string} [options.binding-css] - semicolon separated list of cssProperty=datasource.attribute pairs
     */
    var klass = Behavior.create();
    var proto = klass.prototype;

    klass.classes = ['waf-widget'];
    klass.mergeClassAttributeOnInherit('classes');

    /**
     * Tell if the widget have a css class by default
     * @param {string} class - CSS class name
     * @returns {boolean}
     * @memberof Style
     * @method hasClass
     * @public
     */
    klass.hasClass = function(c) {
        return this.classes.indexOf(c) >= 0;
    };

    /**
     * Add a default css class
     * @param {string} class - CSS class name
     * @memberof Style
     * @method addClass
     * @public
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
     * @method removeClass
     * @public
     */
    klass.removeClass = function(c) {
        var i = this.classes.indexOf(c);
        if (i >= 0) {
            this.classes.splice(i, 1);
        }
    };

    /**
     * Add a css class
     * @param {string} class - CSS class name
     * @param {string} [selector] - a css selector to select the dom sub node where to add the class
     * @memberof Style
     * @instance
     * @method addClass
     * @public
     */
    proto.addClass = function(klass, selector) {
        if (selector) {
            $(this.node).find(selector).addClass(klass);
        } else {
            $(this.node).addClass(klass);
        }
    };

    /**
     * Remove a css class
     * @param {string} class - CSS class name
     * @param {string} [selector] - a css selector to select the dom sub node where to remove the class
     * @memberof Style
     * @instance
     * @method removeClass
     * @public
     */
    proto.removeClass = function(klass, selector) {
        if (selector) {
            $(this.node).find(selector).removeClass(klass);
        } else {
            $(this.node).removeClass(klass);
        }
    };

    /**
     * Tell if the widget have a css class
     * @param {string} class - CSS class name
     * @returns {boolean}
     * @memberof Style
     * @instance
     * @method hasClass
     * @public
     */
    proto.hasClass = function(klass, selector) {
        if (selector) {
            return $(this.node).find(selector).hasClass(klass);
        } else {
            return $(this.node).hasClass(klass);
        }
    };

    /**
     * Toggle a css class
     * @param {string} class - CSS class name
     * @param {string} [selector] - a css selector to select the dom sub node where to toggle the class
     * @memberof Style
     * @instance
     * @method toggleClass
     * @public
     */
    proto.toggleClass = function(klass, selector) {
        if (selector) {
            $(this.node).find(selector).toggleClass(klass);
        } else {
            $(this.node).toggleClass(klass);
        }
    };

    /**
     * Set style values
     * @param {object} object - list of css properties and values
     * @memberof Style
     * @instance
     * @public
     */
    /**
     * Set style values
     * @param {string} object - css property
     * @param {string} value - css value
     * @memberof Style
     * @instance
     * @method style
     * @public
     */
    proto.style = function(objOrName, value) {
        if (typeof objOrName === 'object') {
            for (var k in objOrName) {
                this.style(k, objOrName[k]);
            }
            return;
        }
        var name = String.toCamelCase(objOrName, '-');
        if (arguments.length === 2) {
            this.node.style[name] = value;
        }
        return this.node.style[name];
    };

    /**
     * Make the widget visible
     * @param {object} object - list of css properties and values
     * @memberof Style
     * @instance
     * @method show
     * @public
     */
    proto.show = function() {
        $(this.node).show();
    };

    /**
     * Make the widget not visible
     * @param {object} object - list of css properties and values
     * @memberof Style
     * @instance
     * @method hide
     * @public
     */
    proto.hide = function() {
        $(this.node).hide();
    };

    klass.optionsParsers.hideonload = function() {
        if (this.options.hideonload === 'true') {
            this.hide();
        }
    };

    /**
     * Called to initialize behaviors properties
     * @private
     * @memberof Style
     * @instance
     * @method _initProperties
     */
    proto._initProperties = function() {
        this._bindedCssAttributes = {};
    };

    /**
     * Called to initialize behaviors 
     * @private
     * @memberof Style
     * @instance
     * @method _initBehavior
     */
    proto._initBehavior = function() {
        this.constructor.classes.forEach(function(c) {
            this.addClass(c);
        }.bind(this));
    };

    /**
     * Called when enabling the widget to let behavior do what they need
     * @private
     * @memberof Style
     * @instance
     * @method _enableBehavior
     */
    proto._enableBehavior = function() {
        this.removeClass('waf-state-disabled');
    };

    /**
     * Called when disabling the widget to let behavior do what they need
     * @private
     * @memberof Style
     * @instance
     * @method _disableBehavior
     */
    proto._disableBehavior = function() {
        this.addClass('waf-state-disabled');
    };

    if ('waf-behavior/bindable' in WAF.require.modules) {
        klass.inherit(WAF.require('waf-behavior/bindable'));

        /**
         * Bind a datasource attribute to a css property
         * @param {Datasource} datasource - Datasource instance to bind to
         * @param {string} attribute - The attribute name
         * @param {string} cssProperty - The css property to bind
         * @memberof Style
         * @instance
         * @method bindDatasourceAttributeCSS
         */
        proto.bindDatasourceAttributeCSS = function(datasource, attribute, cssProperty) {
            var that = this;

            if (this._bindedCssAttributes[cssProperty]) {
                this._bindedCssAttributes[cssProperty].unsubscribe();
            }
            var subscriber = this._bindedCssAttributes[cssProperty] = this.bindDatasourceAttribute({
                datasource: datasource,
                attribute: attribute,
                setGetCallback: function(value) {
                    this.style(cssProperty, value);
                }
            });

            if(subscriber) {
                var originalUnsubscribe = subscriber.unsubscribe;
                subscriber.unsubscribe = function() {
                    originalUnsubscribe.call(this);
                    delete that._bindedCssAttributes[cssProperty];
                };
                subscriber.unbind = subscriber.unsubscribe;
            }
            return subscriber;
        };

        klass.optionsParsers['binding-css'] = function(name, value) {
            value = value.split(/ *; */);
            var re = / *([^ :]*) *: *([^.]*)\.([^ ]*)/;
            value.forEach(function(v) {
                v = re.exec(v);
                if (sources[v[2]]) {
                    this.bindDatasourceAttributeCSS(sources[v[2]], v[3], v[1]);
                }
            }.bind(this));
        };

        /**
         * Called to initialize behaviors of a cloned widget
         * @param {BaseWidget} master - The widget cloned from
         * @private
         * @memberof Style
         * @instance
         * @method _cloneBehavior
         */
        proto._cloneBehavior = function(master) {
            for (var cssProperty in master._bindedCssAttributes) {
                var property = master._bindedCssAttributes[cssProperty].property;
                var ba = this._bindedAttributes[property];
                ba.subscriber.unsubscribe();
                this.bindDatasourceAttributeCSS(ba.datasource, ba.attribute, cssProperty);
            }
        };
    }



    return klass;
});
