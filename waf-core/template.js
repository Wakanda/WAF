/** @module waf-core/template */
WAF.define('waf-core/template', function() {

	var Template = function(html) {
		this.setHtml(html || 'no html specified');
	};

    function getVariables(statements) {
        var variables = [];

        statements.forEach(function(node) {
            if (node.type === 'mustache') {
                variables.push(node.id.string);
            } else if (node.type === 'block') {
                variables = variables.concat(getVariables(node.program.statements));
            }
        });

        return variables;
    }

	Template.prototype = {
		setHtml: function(html) {
			this.html = html;
            this.template = Handlebars.compile(html);
		},
		// very simple render method for now, simply replaces elements
		render: function(data, domNode) {
            var text = '';

            text = this.template(data);

            if (domNode) {
                jQuery(domNode).html(text);
            }

            return text;
		},
        // get a list of variables found inside the template
        getVariables: function() {
            var variables = [],
                parser = Handlebars.parse(this.html);
            
            variables = getVariables(parser.statements);

            return variables;
        },
        setHelper: function(name, fn) {
            Handlebars.registerHelper(name, fn);
        },
        addPartial: function(name, html) {
            Handlebars.registerPartial(name, html);
        }
	};

    return Template;
});