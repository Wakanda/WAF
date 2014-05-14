WAF.define('waf-widget/combobox', function() {
    "use strict";
    var Widget = WAF.require('waf-core/widget'),
        Event = WAF.require('waf-core/event');
    /* 
     * To change this template, choose Tools | Templates
     * and open the template in the editor.
     */
    
    Widget.create('ComboboxButton');
    Widget.ComboboxButton.inherit(WAF.require('waf-widget/button'));
    Widget.ComboboxButton.prototype.init = function() {
        this.style('width', '20px');
        this.style('height', '20px');
    };
    
    
    //======================================================================
    //======================================================================
    
    Event.create('Next', Event.All);
    Event.create('Previous', Event.All);
    Widget.create('ComboboxInput');
    Widget.ComboboxInput.inherit(WAF.require('waf-widget/text'));
    Widget.ComboboxInput.inherit(WAF.require('waf-behavior/bindable'));
    
    Widget.ComboboxInput.makeBindableProperty('updateTxtField', function(e) {
        this._value = e;
        this.node.value = e;
    });
    
    
    Widget.ComboboxInput.autoFireDomEvent('keyup', function(e) {
        if (this._value != this.node.value) {
            this._value = this.node.value;
            this.fire(new Event.Change({dom_event : e, value : this._value}));
        } else {
            console.log(e.keyCode);
            switch(e.keyCode) {
                case 40:
                    this.fire(new Event.Next({dom_event : e, value : this._value}));
                    break;
                case 38:
                    this.fire(new Event.Previous({dom_event : e, value : this._value}));
                    break;
            }
        }
    });
    
    Widget.ComboboxInput.prototype.init = function(datasource, attribute) {
        /*var that = this;
        
        if (!datasource) {
            return;
        }
        
        this.source = datasource;
        this.attributeName = attribute;
        this.attribute = this.source.getAttribute(attribute);
        this.source.getEntityCollection().getEntity(0, function (r) {
            var v = r.entity[that.attributeName].getValue();
            that.value(v);
        });
        
        this.bindDatasourceAction(this.source, 'next', Event.Next);
        this.bindDatasourceAction(this.source, 'previous', Event.Previous);
        this.mySub = this.bindDatasourceAttribute(this.source, this.attributeName, 'updateTxtField');*/
        
    }
    
    
    //======================================================================
    //======================================================================
    
    
    Widget.create('ComboboxList');
    Widget.ComboboxList.inherit(WAF.require('waf-behavior/observable'));
    Widget.ComboboxList.inherit(WAF.require('waf-behavior/listable'));
    Widget.ComboboxList.inherit(WAF.require('waf-behavior/bindable'));
    Widget.ComboboxList.inherit(WAF.require('waf-behavior/style'));
    Widget.ComboboxList.inherit(WAF.require('waf-behavior/domobservable'));
    Widget.ComboboxList.tagname = 'div';
    
    Widget.ComboboxList.makeBindableDatasource('fillList', function(e) {
        var sc;
        sc = e.data.dataSource;
        
        this.source = sc;
        this.fillList();
        
    }, Event.CollectionChange);
    
    
    Widget.ComboboxList.autoFireDomEvent('click', function(e) {
        var that = this;
        var key = e.target.id;
    
        /*this.source.getElementByKey(key,{
            onSuccess : function (r) {
                that.currentItem = r.element;
                that.fire(new Event.Change({ dom_event: e, currentItem :  that.currentItem}));
            }
        });*/
        
        var entity = this.source.getEntityCollection();
        entity.query(this.dsKey + '=:1', function(r) {
            r.result.getEntity(0, function(res) {
                
                that.source.setCurrentEntity(res.entity);
                that.currentItem = res.entity;
                that.toggle();
            });
        }, key);
        
    });
    
    Widget.ComboboxList.prototype.init = function(conf) {
        var that = this;
        /*this.currentItem = null;
        this.source = ds;
        this.style('cursor', 'pointer');
        this.style('border', 'solid 1px');
        this.style('clear', 'both');
        this.dsKey = (ds) ? ds.getDataClass()._private.primaryKey : null;
        this.keyProperty = keyProperty;
        this.valueProperty = valueProperty;
        this.isOpen = 1;
        
        fillOnInit = true;
        if (!ds) {
            return;
        }
        
        this.bindDatasourceCollection(this.source, 'fillList');
        
        if (fillOnInit) {
            this.fillList(ds.getEntityCollection());
        }*/
    };
    
    Widget.ComboboxList.prototype.getCurrentId = function() {
        if (this.keyProperty && this.currentItem && (this.keyProperty in this.currentItem)) {
            return this.currentItem[this.keyProperty];
        }
    };
    
    Widget.ComboboxList.prototype.getCurrentText = function() {
        if (this.valueProperty && this.currentItem && (this.valueProperty in this.currentItem)) {
            return this.currentItem[this.valueProperty];
        }
    };
    
    Widget.ComboboxList.prototype.getCurrentValue = function() {
        return this.currentItem;
    };
    
    Widget.ComboboxList.prototype.next = function() {
        var curr = this.currentItem;
        curr.next();
    };
    
    Widget.ComboboxList.prototype.fillList = function(list, keyProperty, valueProperty) {
        var that = this;
        list = list || this.source.getEntityCollection();
        if (!this.dsKey) {
            this.dsKey = this.source.getDataClass()._private.primaryKey;
        }
        console.log(list);
        var key = this.dsKey;
        
        this.keyProperty = keyProperty || this.keyProperty;
        valueProperty = this.valueProperty = valueProperty || this.valueProperty;
        
        this.clear();
        
        list.each(function(entity) {
            var itm = entity.entity;
            var div = document.createElement('div');
            div.id = itm[key].getValue();
            div.appendChild(document.createTextNode(itm[key].getValue() + ' : ' + itm[valueProperty].getValue()));
            that.node.appendChild(div);
        });
    };
    
    Widget.ComboboxList.prototype.isOpened = function() {
        return !!this.isOpen;
    }
    
    
    Widget.ComboboxList.prototype.toggle = function() {
        if (!this.isOpen) {
            this.isOpen = 1;
            this.style('display', 'block');
        } else {
            this.isOpen = 0;
            this.style('display', 'none');
        }
    };
    
    
    Widget.ComboboxList.prototype.clear = function() {
        this.node.innerHTML = '';
        //this.currentItem = null;
    };
    
    Widget.ComboboxList.prototype.search = function(val) {
        var that = this;
        var entity = this.source.getEntityCollection();
        var valSearch = '*' + val + '*';
        
        entity.query(this.valueProperty + '==:1', function(queryResult) {
            that.fillList(queryResult.result);
            if (!that.isOpened()) {
                that.toggle();
            }
        }, valSearch);
    };
    
    
    //======================================================================
    //======================================================================
    
    
    Widget.create('ComboboxDraft');
    Widget.ComboboxDraft.inherit(WAF.require('waf-behavior/observable'));
    Widget.ComboboxDraft.inherit(WAF.require('waf-behavior/valuable'));
    Widget.ComboboxDraft.inherit(WAF.require('waf-behavior/layout/composed'));
    Widget.ComboboxDraft.inherit(WAF.require('waf-behavior/listable'));
    Widget.ComboboxDraft.inherit(WAF.require('waf-behavior/bindable'));
    Widget.ComboboxDraft.inherit(WAF.require('waf-behavior/style'));
    Widget.ComboboxDraft.tagname = 'div';
    
    Widget.ComboboxDraft.setPart('input', Widget.ComboboxInput);
    Widget.ComboboxDraft.setPart('btn', Widget.ComboboxButton);
    Widget.ComboboxDraft.setPart('list', Widget.ComboboxList);
    
    
    /*Widget.ComboboxDraft.prototype.bindDatasourceCollection = function (source, attr, key) {
        if (key == 'fillList') {
            this.list.bindDatasourceCollection(source, attr);
        }
        
        if (key == 'updateTxtField') {
            if (!attr) {
                attr = this.searchField.attributeName;
            }
            this.searchField.bindDatasourceAttribute(source, attr, key);
        }
    }*/
    
    Widget.ComboboxDraft.prototype.makeBindableProperty('input', function(e) {
    	this.getPart('input').setValue(e);
        /*this._value = e;
        this.node.value = e;*/
    });
    
    Widget.ComboboxDraft.prototype.makeBindableDatasource('list', function(e) {
    	this.getPart('list').fillList(e);
    });
    
    
    Widget.ComboboxDraft.prototype.init = function() {
        var that = this;
        this.style('width', '200px');
        /*this.dsAttr = {};
        this.ds = {};
        this.dsAttr.key = source.dataClass1.getAttribute('ID');
        this.dsAttr.value = source.dataClass1.getAttribute('attribute3');
        this.ds.list = source.dataClass1; 
        
        this.keyAttribute = this.dsAttr.key.name;
        this.valueAttribute = this.dsAttr.value.name;*/
        
        this.searchField = this.getPart('input');
        this.list = this.getPart('list');
        
        this.getPart('input').init(this.ds.list, 'attribute3');
        this.getPart('list').init(this.ds.list, this.keyAttribute, this.valueAttribute, true);
        
        var input = this.getPart('input');
        var list = this.getPart('list');
        var btn = this.getPart('btn');
        
        input.style('float', 'left');
        btn.style('float', 'left');
        
        var sub1 = list.subscribe(Event.Change, function(e) {
            sub2.pause();
            var txt = list.getCurrentText();
            if (typeof txt != 'undefined') {
                input.value(txt);
            }
            list.toggle();
            list.fillList();
            sub2.resume();
        });
        
        
        var sub2 = input.subscribe(Event.Change, function(e) {
            sub1.pause();
            list.search(e.data.value);
            sub1.resume();
        });
        
        
        var sub3 = btn.subscribe(Event.Action, function(e) {
            list.toggle();
        });
        
    };
    
});
