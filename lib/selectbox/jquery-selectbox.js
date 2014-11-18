jQuery.fn.extend({
	selectbox: function(options) {
		return this.each(function() {
			new jQuery.SelectBox(this, options);
		});
	}
});


/*if (!window.console) {
	var console = {
		log: function(msg) { 
	 }
	}
}*/

jQuery.SelectBox = function(selectobj, options) {
	
	var opt = options || {};
	opt.inputClass = opt.inputClass || "selectbox";
	opt.containerClass = opt.containerClass || "selectbox-wrapper";
	opt.hoverClass = opt.hoverClass || "selected";
	opt.debug = opt.debug || false;
	
	var elm_id = selectobj.id;
	var active = -1;
	var inFocus = false;
	var hasfocus = 0;
	//jquery object for select element
	var $select = $(selectobj);
	// jquery container object
	var $container = setupContainer(opt);
	//jquery input object 
	var $input = setupInput(opt);
	// hide select and append newly created elements
	$select.hide().before($input).before($container);
	
	
	init();
	
	$input
	.click(function(){
        if (!inFocus) {
		  $container.toggle();
		}
	})
	.focus(function(){
	   if ($container.not(':visible')) {
	       inFocus = true;
	       $container.show();
	   }
	})
	.keydown(function(event) {	   
		switch(event.keyCode) {
			case 38: // up
				event.preventDefault();
				moveSelect(-1);
				break;
			case 40: // down
				event.preventDefault();
				moveSelect(1);
				break;
			//case 9:  // tab 
			case 13: // return
				event.preventDefault(); // seems not working in mac !
				setCurrent();
				hideMe();
				break;
		}
	})
	.blur(function() {
		if ($container.is(':visible') && hasfocus > 0 ) {
			if(opt.debug) console.log('container visible and has focus')
		} else {
			hideMe();	
		}
	});


	function hideMe() { 
		hasfocus = 0;
		$container.hide(); 
	}
	
	function init() {
		$container.append(getSelectOptions($input.prop('id'))).hide();
		var width = $input.css('width');
		$container.width(width);
    }
	
	function setupContainer(options) {
		var container = document.createElement("div");
		$container = $(container);
		$container.prop('id', elm_id+'_container');
		$container.addClass(options.containerClass);
		
		return $container;
	}
	
	function setupInput(options) {
		var input = document.createElement("input");
		var $input = $(input);
		$input.prop("id", elm_id+"_input");
		$input.prop("type", "text");
		$input.addClass(options.inputClass);
		$input.prop("autocomplete", "off");
		$input.prop("readonly", "readonly");
		$input.prop("tabIndex", $select.prop("tabindex")); // "I" capital is important for ie
		
		return $input;	
	}
	
	function moveSelect(step) {
		var lis = $("li", $container);
		if (!lis) return;

		active += step;

		if (active < 0) {
			active = 0;
		} else if (active >= lis.size()) {
			active = lis.size() - 1;
		}

		lis.removeClass(opt.hoverClass);

		$(lis[active]).addClass(opt.hoverClass);
	}
	
	function setCurrent() {	
		var li = $("li."+opt.hoverClass, $container).get(0);
		var ar = (''+li.id).split('_');
		var el = ar[ar.length-1];
		$select.val(el);
		$input.val($(li).html());
		return true;
	}
	
	// select value
	function getCurrentSelected() {
		return $select.val();
	}
	
	// input value
	function getCurrentValue() {
		return $input.val();
	}
	
	function getSelectOptions(parentid) {
		var select_options = new Array();
		var ul = document.createElement('ul');
		$select.children('option').each(function() {
			var li = document.createElement('li');
			li.setAttribute('id', parentid + '_' + $(this).val());
			li.innerHTML = $(this).html();
			if ($(this).is(':selected')) {
				$input.val($(this).html());
				$(li).addClass(opt.hoverClass);
			}
			ul.appendChild(li);
			$(li)
			.mouseover(function(event) {
				hasfocus = 1;
				if (opt.debug) console.log('out on : '+this.id);
				jQuery(event.target, $container).addClass(opt.hoverClass);
			})
			.mouseout(function(event) {
				hasfocus = -1;
				if (opt.debug) console.log('out on : '+this.id);
				jQuery(event.target, $container).removeClass(opt.hoverClass);
			})
			.click(function(event) {
				if (opt.debug) console.log('click on :'+this.id);
				$(this).addClass(opt.hoverClass);
				setCurrent();
				hideMe();
			});
		});
		return ul;
	}
	
};



(function($){
	
	$.fn.csb = function(options) {
		$(this).hide();

		var style = options.style;
		var mode = options.mode;

		var thisid = $(this).prop('id');
		var selected = this.find("option[selected]");

		if (mode == 'link') var selects = this.find("option:not([selected])");
		else var selects = this.find("option");
		$(this).parent().append('<dl id="'+thisid+'" class="csb '+style+'"></dl>');
		$('dl#'+thisid).append('<dt><a name="' + selected.val() + '">' + selected.text() + '</a></dt>');
		$('dl#'+thisid).append('<dd><ul></ul></dd>');
		selects.each(function(){
			$('dl#'+ thisid + " dd ul").append('<li><a name="' + $(this).val() + '">' + $(this).text() + '</a></li>');
		});

		$('.'+style+' dt a').click(function() {
			$('.'+style+' dd ul').toggle();
			return false;
		});

		$(document).bind('click', function(e) {
			var $clicked = $(e.target);
			if (! $clicked.parents().hasClass(style)) $('.'+style+' dd ul').hide();
		});

		if (mode == 'link') {
			$(document).on('click', '.' + style + ' dd ul li a', function() {
				$('.'+style+' dd ul').hide();
				var functvar = $(this).prop('name');
				
				// now call a callback function
				if(typeof options.callback == 'function'){
					options.callback(functvar);
				}
				return false;
			});
		}
		else {
			$(document).on('click', '.' + style + ' dd ul li a', function() {
				var text = $(this).html();
				$('.'+style+' dt a').html(text);
				$('.'+style+' dd ul').hide();

				var source = $('select#'+thisid);
				var functvar = $(this).prop('name');
				source.val(functvar);
				
				// now call a callback function
				if(typeof options.callback == 'function'){
					options.callback(functvar, options.data);
				}
				return false;
			});
		}	
	}
})(jQuery);