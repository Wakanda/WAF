WAF.define('waf-widget/menu', function() {
    "use strict";
    var Widget = WAF.require('waf-core/widget'),
        Event = WAF.require('waf-core/event');
    Widget.create('MenuBar');
    Widget.MenuBar.inherit(WAF.require('waf-behavior/layout/container'));
    Widget.MenuBar.inherit(WAF.require('waf-behavior/listable'));
    Widget.MenuBar.removeClass('waf-container');
    
    Widget.MenuBar.prototype._createButton = function(index, value) {
        var options = {};
        if('close_button' in this.options)
            options.close_button = this.options.close_button;
        var b = new this._restrict(options);
        b.value(value);
        return b;
    };
    
    Widget.MenuBar.prototype.item = function(index, value) {
        if(arguments.length > 1) {
            var b = this._createButton(index, value);
            this.widget(index, b);
        }
        return this.widget(index).value();
    };
    
    Widget.MenuBar.prototype.insertItem = function(index, value) {
        var b = this._createButton(index, value);
        this.insertWidget(index, b);
        this.fire(new Event.Insert({ index: index, item: b }));
    };
    
    Widget.MenuBar.prototype.removeItem = function(index) {
        this.detachWidget(index);
        this.fire(new Event.Remove({ index: index }));
    };
    
    Widget.MenuBar.prototype.countItems = function() {
        return this.countWidgets();
    };
    
    Widget.MenuBar.prototype.createDomNode = function() {
        this.$super('createDomNode')();
        var e = document.createElement('div');
        e.className = 'waf-' + this.kind.toLowerCase() + '-content';
        this.node.appendChild(e);
        this._container_node = document.createElement('ul');
        e.appendChild(this._container_node);
        e = document.createElement('div');
        e.className = 'waf-' + this.kind.toLowerCase() + '-previous';
        e.addEventListener('mousedown', this._scroll.bind(this, false));
        e.addEventListener('mouseup', this._stopScroll.bind(this));
        this.node.appendChild(e);
        var e = document.createElement('div');
        e.className = 'waf-' + this.kind.toLowerCase() + '-next';
        this.node.appendChild(e);
        e.addEventListener('mousedown', this._scroll.bind(this, true));
        e.addEventListener('mouseup', this._stopScroll.bind(this));
    };
    
    Widget.MenuBar.prototype.initChildrenFromDom = (function(original_function) {
        return function() {
            this._container_node = $(this.node).find('>div>ul').get(0);
            original_function.call(this);
        };
    })(Widget.MenuBar.prototype.initChildrenFromDom);
    
    Event.create('Select');
    Widget.MenuBar.addIndexedEvent(Event.Action, Event.Select);
    
    // overflow management
    Widget.MenuBar.prototype._setStyleAndClasses = function() {
        var size_min = this.options['menu-minsize'];
        var size_property = 'width'; // FIXME: support height for tabview
        if(size_min)
            this.invoke('style', 'min-' + size_property, size_min + 'px');
        var s = this.invoke(size_property).reduce(function(a, b) { return a + b; }, 0);
        var ul = $(this.node).find('>div>ul')
        var size_menu = ul.parent()[size_property]();
        var scroller = this._container_node.parentNode;
        if(size_menu < s) { // scroll mode
            ul.css(size_property, s + 'px');
            var size_max = size_menu / this.countWidgets();
            if(size_min)
            size_max = Math.max(size_min, size_max);
            console.log(size_max);
            this.invoke('style', 'max-' + size_property, size_max + 'px');
            s = this.invoke(size_property).reduce(function(a, b) { return a + b; });
            if(size_menu < s) {
                this.addClass('waf-' + this.kind.toLowerCase() + '-scrollable');
                this.addClass('waf-' + this.kind.toLowerCase() + '-scrollable-next');
            }
            if(scroller.scrollLeft > 0 && scroller.scrollLeft + scroller.offsetWidth > s)
                scroller.scrollLeft = s - scroller.offsetWidth;
        } else { // standard mode
            scroller.scrollLeft = 0;
            ul.css(size_property, '');
            this.removeClass('waf-' + this.kind.toLowerCase() + '-scrollable');
            this.removeClass('waf-' + this.kind.toLowerCase() + '-scrollable-previous');
            this.removeClass('waf-' + this.kind.toLowerCase() + '-scrollable-next');
            this.invoke('style', 'max-' + size_property, 100 / this.countWidgets() + '%');
        }
    };
    Widget.MenuBar.doAfter('insertWidget', Widget.MenuBar.prototype._setStyleAndClasses);
    Widget.MenuBar.doAfter('detachWidget', Widget.MenuBar.prototype._setStyleAndClasses);
    
    Widget.MenuBar.prototype._scroll = function(dir) {
        var timeout = 200;
        var offset = 2;
        var scroller = this._container_node.parentNode;
        for(var i = 0, l = this._container_node.childNodes.length; i < l; i++) {
            var node = this._container_node.childNodes[i];
            if(node.nodeType != 1) continue;
            if(!dir && node.offsetLeft >= scroller.scrollLeft) {
                var node = this._container_node.childNodes[i - 1];
                offset = node.offsetLeft - scroller.scrollLeft;
                break;
            }
            if(dir && node.offsetLeft + node.offsetWidth > scroller.scrollLeft + scroller.offsetWidth) {
                offset = node.offsetLeft + node.offsetWidth - scroller.scrollLeft - scroller.offsetWidth;
                break;
            }
        }
        scroller.scrollLeft += offset;
        if(scroller.scrollLeft > 0)
            this.addClass('waf-' + this.kind.toLowerCase() + '-scrollable-previous');
        else
            this.removeClass('waf-' + this.kind.toLowerCase() + '-scrollable-previous');
        if(scroller.scrollLeft >= scroller.scrollWidth - scroller.offsetWidth)
            this.removeClass('waf-' + this.kind.toLowerCase() + '-scrollable-next');
        else
            this.addClass('waf-' + this.kind.toLowerCase() + '-scrollable-next');
            
        if((!dir && scroller.scrollLeft > 0) || (dir && scroller.scrollLeft < scroller.scrollWidth - scroller.offsetWidth))
            this._scroll_timeout = setTimeout(this._scroll.bind(this, dir), timeout);
    };

    Widget.MenuBar.prototype._stopScroll = function() {
        clearTimeout(this._scroll_timeout);
    };

    Widget.MenuBar.options_parsers.close_button = function() {
        this.invoke('changeOption', 'close_button', this.options.close_button);
    };


    // MenuItem
    Widget.create('MenuItem');
    Widget.MenuItem.inherit(WAF.require('waf-widget/button'));
    Widget.MenuItem.inherit(WAF.require('waf-behavior/layout/composed'));
    Widget.MenuItem.removeClass('waf-button');
    Widget.MenuItem.removeClass('waf-widget');
    Widget.MenuItem.addClass('waf-skin-textMenus');
    Widget.MenuItem.tagname = 'li';
    Widget.MenuItem.prototype.createDomNode = function() {
        this.$super('createDomNode')();
        this.node.innerHTML = '<span></span>';
    };
    Widget.MenuItem.addDomHtmlProperty('value', { selector: '>span' });

    Event.create('Close');

    Widget.MenuItem.setPart('close');
    Widget.MenuItem.addProxiedEvent(Event.Action, 'close', Event.Close);
    Widget.MenuItem.options_parsers.close_button = function() {
        if(this.options.close_button) {
            if(!this.getPart('close'))
                this.setPart('close', new Widget.Button({ value: this.options.close_button_label || 'X' }));
            this.addClass('waf-menuitem-closable');
        } else {
            this.setPart('close');
            this.removeClass('waf-menuitem-closable');
        }
    };
    
    Widget.MenuBar.restrictWidget(Widget.MenuItem);
    Widget.MenuBar.addIndexedEvent(Event.Close);
    
    
    /******************************************************************************/
    
    
    Widget.create('ToggleMenuBar')
    Widget.ToggleMenuBar.inherit(Widget.MenuBar);
    Widget.ToggleMenuBar.removeClass('waf-menubar');
    
    Widget.ToggleMenuBar.prototype.init = function() {
        this.$super('init')();
        this.subscribe(Event.Select, function(event) {
            this.invoke('removeClass', 'waf-state-selected');
            event.data.widget.addClass('waf-state-selected');
        }.bind(this));
    };
    
    Widget.ToggleMenuBar.prototype.select = function(index) {
        var widget = this.widget(index);
        if(!widget) return;
        this.invoke('removeClass', 'waf-state-selected');
        widget.addClass('waf-state-selected');
        this.fire(new Event.Select({ widget: widget, index: index }));
    };
    
});
