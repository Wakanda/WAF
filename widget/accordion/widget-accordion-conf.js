/*
 * This file is part of Wakanda software, licensed by 4D under
 *  (i) the GNU General Public License version 3 (GNU GPL v3), or  
 *  (ii) the Affero General Public License version 3 (AGPL v3) or
 *  (iii) a commercial license.
 * This file remains the exclusive property of 4D and/or its licensors
 * and is protected by national and international legislations.
 * In any event, Licensee's compliance with the terms and conditions
 * of the applicable license constitutes a prerequisite to any use of this file.
 * Except as otherwise expressly stated in the applicable license,
 * such license does not include any other license or rights on this file,
 * 4D's and/or its licensors' trademarks and/or other proprietary rights.
 * Consequently, no title, copyright or other proprietary rights
 * other than those specified in the applicable license is granted.
 */
WAF.addWidget({
    packageName : 'Widget/accordion',
    type        : 'accordion',
    lib         : 'WAF', 
    description : 'Accordion',
    category    : 'Containers/Placeholders',
    img         : '/walib/WAF/widget/accordion/icons/widget-accordion.png',
    css         : [],
    include     : [],
    tag         : 'div', 
    containArea : true,
    menu : [{
        icon        : '/walib/WAF/widget/accordion/icons/round_plus.png',
        title       : 'Add new section',
        callback    : function(){
            this.addSection(true);
        }
    }],

    attributes  : [                                                       
    {
        name        : 'class',                                                 
        description : 'CSS class',                                                 
        defaultValue: '',                                                 
        type        : '',                                                 
        options     : []                                                  
    },
    {
        name        : 'data-expand-several',                                                 
        description : 'One section always expanded',                                                 
        defaultValue: 'true',
        type        : 'checkbox',
        context     : ["disallowDropAndBind"],
        onclick : function () {
            if(this.data.tag.getChildren().length >0 ){
                if( !this.getValue() ){
                    this.data.tag.collapseAll();
                    this.data.tag.activate(0); 
                }
            }
        }
    },
    {
        name        : 'data-duration',                                                 
        description : 'Duration',  
        context     : ["disallowDropAndBind"],                                               
        defaultValue: '400'
    },
    {
        name        : 'data-header-height',                                                 
        description : 'Header height',                                                 
        defaultValue: '40',
        visibility  : 'hidden'
    },
    {
        name        : 'data-content-height',                                                 
        description : 'Content height',                                                 
        defaultValue: '250',
        visibility  : 'hidden'        
    },
    {
        name        : 'data-section',
        description : 'Sections',
        type        : 'grid',
        domAttribute: false,
        columns     : [],
        onRowClick  : function( item ) {
            var
            tag;
            
            tag = this.getData().tag;
            tag.activate(item.getIndex());
            
        },
        
        afterRowAdd : function(data) {
            var
            tag,
            label,
            newSection;
            
            tag = this.getData().tag;
            
            newSection = tag.addSection(true);
            label  = data.items[0];
            label.data = {
                section : newSection
            };            

            label.setValue(tag.getHeader(newSection).getChildren()[0].getAttribute('data-text').getValue());
            data.items[0]._html = data.items[0]._value;
            
            var action = new Designer.action.addAccordionSection({
                val         : tag.sections.length,
                oldVal      : tag.sections.length-1,
                tagId       : tag.id                
            });
            Designer.getHistory().add(action);
        },
        
        afterRowDelete : function(data) {
            var 
            i,
            tmp,
            tag;
            
            tag = this.getData().tag;            
            tmp = tag.sections[data.index]
            for( i=data.index ; i <tag.sections.length-1 ; i++){
                tag.sections[i] = tag.sections[i+1];
            }
            tag.sections.length = tag.sections.length-1;
            tmp.remove(false);
            tag.getHtmlObject().trigger('afterSectionRemove');
            
        },
        
        afterRowSort : function(data) {
            var 
            i,
            top,
            tmp,
            tag;
            tag = this.getData().tag;
            tmp = tag.sections[data.movedIndex];
            top = tag.sections[data.index].getY();
            if( data.movedIndex < data.index){
                for( i=data.movedIndex ; i<data.index ; i++ ){
                    tag.sections[i+1].setY(tag.sections[i].getY(),true);
                    tag.sections[i] = tag.sections[i+1];
                }
                tmp.setY(top,true);
                tag.sections[data.index] = tmp;
            } else {
                for( i=data.movedIndex ; i>data.index ; i-- ){
                    tag.sections[i-1].setY(tag.sections[i].getY(),true);                    
                    tag.sections[i] = tag.sections[i-1];
                }
                tmp.setY(top,true);
                tag.sections[data.index] = tmp;
            }
            tag.resize();
            tag.onDesign(true);
        },
        
        ready       : function() {
            var
            i,
            tag,
            length;
            
            this.getHtmlObject().addClass('waf-form-tab-grid');
            
            tag       = this.getData().tag;
            length  = tag.sections.length;
            
            
            for (i = 0; i < length; i += 1) {
                if(tag.getHeader(tag.sections[i])){
                    this.addRow([{
                        type        : 'textField',
                        value        : tag.getHeader(tag.sections[i]).getChildren()[0].getAttribute('data-text').getValue(),
                        data        : {
                            section : tag.sections[i],
                            index   : i,
                            headerTitle : tag.getHeader(tag.sections[i]).getChildren()[0].getAttribute('data-text')
                        },
                        onchange    : function () {
                            this.data.headerTitle.setValue(this.getValue());
                            this.data.headerTitle.getDescriptor().refresh();
                        }
                    }], false, true, false);  
                }
            }
        }
    }
    
    ],

    // {Array} default height and width of the container for the widget in the GUI Designer
    // 
    // @property {String} name, name of the attribute 
    // @property {String} defaultValue, default value of the attribute  
    style: [                                                                     
    {
        name        : 'width',
        defaultValue: '500px'
    },
    {
        name        : 'height',
        defaultValue: '335px'
    }],

    // {Array} events ot the widget
    // 
    // @property {String} name, internal name of the event (mandatory)     
    // @property {String} description, display name of the event in the GUI Designer
    // @property {String} category, category in which the event is displayed in the GUI Designer (optional)
    events: [                                                              
    {
        name       : 'click',
        description: 'On Click',
        category   : 'Mouse Events'
    },
    {
        name       : 'dblclick',
        description: 'On Double Click',
        category   : 'Mouse Events'
    },
    {
        name       : 'mousedown',
        description: 'On Mouse Down',
        category   : 'Mouse Events'
    },
    {
        name       : 'mouseout',
        description: 'On Mouse Out',
        category   : 'Mouse Events'
    },
    {
        name        : 'mouseover',
        description: 'On Mouse Over',
        category   : 'Mouse Events'
    },
    {
        name       : 'mouseup',
        description: 'On Mouse Up',
        category   : 'Mouse Events'
    }],

    // {JSON} panel properties widget
    //
    // @property {Object} enable style settings in the Styles panel in the Properties area in the GUI Designer
    properties: {
        style: {                                                

            theme       : true,                //themes to hide ('default', 'inherited', roundy, metal, light)
        
            fClass      : true,                 // true to display the "Class" option in the "Theme & Class" section
            text        : false,                 // true to display the "Text" section
            background  : true,                 // true to display widget "Background" section
            border      : true,                 // true to display widget "Border" section
            sizePosition: true,                 // true to display widget "Size and Position" section
            label       : true,                 // true to display widget "Label Text" and "Label Size and Position" sections
            // For these two sections, you must also define the "data-label" in the Attributes array
            disabled     : ['border-radius']     // list of styles settings to disable for this widget
        }
    },

    // (optional area)
    // 
    // {Array} list of sub elements for the widget
    // 
    // @property {String} label of the sub element
    // @property {String} css selector of the sub element
    structure: [{
            description : 'title',
            selector    : '.waf-accordion-title',
            style: {
                theme       : true,                //themes to hide ('default', 'inherited', roundy, metal, light)
        
                fClass      : true,                 // true to display the "Class" option in the "Theme & Class" section
                text        : true,                 // true to display the "Text" section
                sizePosition: true
            },
            state : [{
                    label   : 'expanded',
                    cssClass: 'waf-state-expanded',
                    find    : '.waf-state-expanded .waf-accordion-title',
                    mobile  : true
                },{
                    label   : 'collapsed',
                    cssClass: 'waf-state-collapsed',
                    find    : '.waf-state-collapsed .waf-accordion-title',
                    mobile  : true
                }]
        },
        {
            description : 'header',
            selector    : '.waf-accordion-header',
            style: {
                theme       : true,                //themes to hide ('default', 'inherited', roundy, metal, light)
        
                fClass      : true,                 // true to display the "Class" option in the "Theme & Class" section
//                text        : true,                 // true to display the "Text" section
                background  : true,                 // true to display widget "Background" section
                border      : true,                 // true to display widget "Border" section
//                sizePosition: true,                 // true to display widget "Size and Position" section
                label       : true
            },
            state : [{
                    label   : 'expanded',
                    cssClass: 'waf-state-expanded',
                    find    : '.waf-state-expanded .waf-accordion-header',
                    mobile  : true
                },{
                    label   : 'collapsed',
                    cssClass: 'waf-state-collapsed',
                    find    : '.waf-state-collapsed .waf-accordion-header',
                    mobile  : true
                }]
        },
        {
            description : 'content',
            selector    : '.waf-accordion-content',
            style: {
                theme       : true,                //themes to hide ('default', 'inherited', roundy, metal, light)
        
                fClass      : true,                 // true to display the "Class" option in the "Theme & Class" section
                text        : true,                 // true to display the "Text" section
                background  : true,                 // true to display widget "Background" section
                border      : true,                 // true to display widget "Border" section
//                sizePosition: true,                 // true to display widget "Size and Position" section
                label       : true
            },
            state : [{
                    label   : 'expanded',
                    cssClass: 'waf-state-expanded',
                    find    : '.waf-state-expanded .waf-accordion-content',
                    mobile  : true
                },{
                    label   : 'collapsed',
                    cssClass: 'waf-state-collapsed',
                    find    : '.waf-state-collapsed .waf-accordion-content',
                    mobile  : true
                }]
        }
    ],

    onInit: function (config) {   
        var widget = new WAF.widget.Accordion(config);       
        return widget;
    },

    onDesign: function (config, designer, tag, catalog, isResize) {
        var
        i,
        length,
        content,
        openedSections;
        
        if(isResize && !D.env._preventResize){
            if(D.getCurrent() === tag ){
                length          = tag.sections.length;
                openedSections  = 0;
                for( i=0 ; i<length ; i++ ){
                    content         = tag.getContent(tag.sections[i]);
                    if(content.getHeight() != 0  ) {
                        openedSections++;
                    }
                }
                if(openedSections && openedSections != 0) {
                    var headerHeight  = parseInt(tag.getAttribute('data-header-height').getValue(),10);
                    var contentAttr = tag.getAttribute('data-content-height');
                    contentAttr.setValue(""+Math.floor((tag.getHeight()-(headerHeight*length))/openedSections));  
                    tag.resize();
                }
            }
        } 
    }, 
    
    onCreate: function (tag, param) {
        
    
        var contextdisallowDrodAndBind  = D.env.tagAttributes.context["disallowDropAndBind"];

        tag.addContext(contextdisallowDrodAndBind);
        
        tag.sections = [];
        
        tag.resize = function (refreshSize) {
            var 
            i,
            height,
            length,
            header,
            content,
            tagHeight,
            headerHeight,
            contentHeight;
            D.env._preventResize = true;
            height = 0;
            length = tag.sections.length;
            headerHeight = parseInt(tag.getAttribute('data-header-height').getValue(),10);
            contentHeight = parseInt(tag.getAttribute('data-content-height').getValue(),10); 
            
            tagHeight = tag.getHeight();
            
            if (refreshSize) { 
                contentHeight = tagHeight - length * headerHeight;
                tag.getAttribute('data-content-height').setValue(contentHeight);
            }
            
            for( i=0; i<length; i++ ) {
                header  = tag.getHeader(tag.sections[i]);
                content = tag.getContent(tag.sections[i]);
                
                header.setHeight(headerHeight,false);
                if(content.getHeight() > 10){
                    content.setHeight(contentHeight,false);
                } else {
                    content.setHeight(0, false);
                }
                tag.sections[i].setHeight( header.getHeight() + content.getHeight(),false);
                if( i === 0 ) {
                    tag.sections[i].setY(0,true, false);
                } else {
                    tag.sections[i].setY(tag.sections[i-1].getHeight()+ tag.sections[i-1].getY(),true,false);
                }
                header.setY(0,true,false);
                content.setY(header.getHeight(),true,false);
                height += tag.sections[i].getHeight();
            }
            
            D.env._preventResize = null;
        };
        
        
        tag.collapseAll = function(){
            var
            i,
            length,
            headerHeight;
            
            length          = tag.sections.length;
            headerHeight    = parseInt(tag.getAttribute('data-header-height').getValue(),10);
            
            for ( i=0 ; i<length ; i++){
                tag.getContent(tag.sections[i]).setHeight(0,false);
                tag.sections[i].setHeight(headerHeight,false);
                tag.sections[i].getHtmlObject().removeClass('waf-state-expanded');
                tag.sections[i].getHtmlObject().addClass('waf-state-collapsed');
                tag.sections[i].getAttribute('class').setValue(tag.sections[i].getHtmlObject().attr('class'));
                tag.sections[i].getChildren()[1].addClass('waf-state-collapsed'); //content
                tag.sections[i].getChildren()[0].addClass('waf-state-collapsed'); // header
                tag.sections[i].getChildren()[0].getChildren()[0].addClass('waf-state-collapsed'); // title

                tag.sections[i].getChildren()[1].removeClass('waf-state-expanded'); //content
                tag.sections[i].getChildren()[0].removeClass('waf-state-expanded'); // header
                tag.sections[i].getChildren()[0].getChildren()[0].removeClass('waf-state-expanded'); // title

                
//                tag.getHeader(tag.sections[i]).getChildren()[1].removeClass('waf-state-expanded');
//                tag.getHeader(tag.sections[i]).getChildren()[1].addClass('waf-state-collapsed');
//                tag.getHeader(tag.sections[i]).getChildren()[1].domUpdate();
            }
            tag.getHtmlObject().trigger('changeEnd'); 
            
        };
        
        tag.expand = function (section) {
            
            var headerHeight    = parseInt(tag.getAttribute('data-header-height').getValue(),10);
            var contentHeight   = parseInt(tag.getAttribute('data-content-height').getValue(),10);
            
//            tag.getHeader(section).getChildren()[1].addClass('waf-state-expanded');
//            tag.getHeader(section).getChildren()[1].removeClass('waf-state-collapsed');
//            tag.getHeader(section).getChildren()[1].domUpdate();


            section.getChildren()[1].addClass('waf-state-expanded'); //content
            section.getChildren()[0].addClass('waf-state-expanded'); // header
            section.getChildren()[0].getChildren()[0].addClass('waf-state-expanded'); // title
            
            section.getChildren()[1].removeClass('waf-state-collapsed'); //content
            section.getChildren()[0].removeClass('waf-state-collapsed'); // header
            section.getChildren()[0].getChildren()[0].removeClass('waf-state-collapsed'); // title
            
            
            
            tag.getContent(section).setHeight(contentHeight,false);
            section.setHeight(headerHeight+contentHeight,false);
            section.getHtmlObject().addClass('waf-state-expanded');
            section.getHtmlObject().removeClass('waf-state-collapsed');
            section.getAttribute('class').setValue(section.getHtmlObject().attr('class'));
            section.domUpdate();
            tag.getHtmlObject().trigger('changeEnd');  
        };
        
        
        tag.collapse = function (section) {
            
            var headerHeight = parseInt(tag.getAttribute('data-header-height').getValue(),10);            
            
            tag.getContent(section).setHeight(0);
//            tag.getHeader(section).getChildren()[1].removeClass('waf-state-expanded');
//            tag.getHeader(section).getChildren()[1].addClass('waf-state-collapsed');
//            tag.getHeader(section).getChildren()[1].domUpdate();


            section.getChildren()[1].addClass('waf-state-collapsed'); //content
            section.getChildren()[0].addClass('waf-state-collapsed'); // header
            section.getChildren()[0].getChildren()[0].addClass('waf-state-collapsed'); // title
            
            section.getChildren()[1].removeClass('waf-state-expanded'); //content
            section.getChildren()[0].removeClass('waf-state-expanded'); // header
            section.getChildren()[0].getChildren()[0].removeClass('waf-state-expanded'); // title
            
            
            
            section.setHeight(headerHeight,false);
            section.getHtmlObject().removeClass('waf-state-expanded');
            section.getHtmlObject().addClass('waf-state-collapsed');
            section.getAttribute('class').setValue(section.getHtmlObject().attr('class'));
            section.domUpdate();
            tag.getHtmlObject().trigger('changeEnd');   
        };
        
        
        tag.addSection = function (addToHistory) {
            if(addToHistory){
                Designer.beginUserAction("048");
            }
            var
            top,
            icon,
            title,
            header,
            content,
            section,
            headerHeight;
            
            var group = Designer.getGroup(tag.getGroupId());
            
            var contextProtected            = D.env.tagAttributes.context["protected"],
                contextAllowRemove          = D.env.tagAttributes.context["allowRemove"],
                contextAllowDrop            = D.env.tagAttributes.context["allowDrop"];
            
            top             = tag.sections.length ===0 ? 0 : tag.getHeight();
            headerHeight    = parseInt(tag.getAttribute('data-header-height').getValue(),10);
            
            section = Designer.createTag({
                type        : 'container',
                fit         : ['left', 'top' , 'right'],
                top         : top, 
                left        : 0,
                height      : headerHeight,
                silentMode  : true,
                parent      : tag           
            });
            tag.link(section);
            section.savePosition('right', 0, false, false);
            section.getAttribute('class').setValue(section.getAttribute('class').getValue() + ' accordion-section');
            section.addClass('waf-state-collapsed');

            section.addContext(contextProtected + " " + contextAllowRemove);
            
            header = Designer.createTag({
                type        : 'container',
                fit         : ['left', 'right'],
                top         : 0,
                left        : 0,
                height      : headerHeight,
                silentMode  : true,
                parent      : section,
                context     : contextProtected
            });
            header.savePosition('right', 0, false, false);
            header.getAttribute('class').setValue(header.getAttribute('class').getValue() + ' accordion-header');
            header.getHtmlObject().bind('click', {
                tag: tag,
                container: header
            }, function (e, type) {
                e.data.tag.activate(e.data.container.getParent()); 
            });
            header.addClass('waf-accordion-header waf-state-collapsed')
            
            
            content = Designer.createTag({
                type        : 'container',
                fit         : ['left', 'right', 'bottom'],
                top         : headerHeight,
                left        : 0,
                bottom      : 0,
                silentMode  : true,
                parent      : section,
                context     : contextProtected + " " + contextAllowDrop
            });
            content.savePosition('right', 0, false, false);
            content.savePosition('bottom', 0, false, false);
            content.getAttribute('class').setValue(content.getAttribute('class').getValue() + ' accordion-content');
            content.setHeight(0);
            content.addClass('waf-accordion-content waf-state-collapsed');
            
            title = Designer.createTag({
                type        : 'richText',
                fit         : ['left'],
                height      : 20,
                top         : 11,
                left        : 30,
                silentMode  : true,
                parent      : header
            });
            title.getAttribute('data-text').setValue('[Header '+(tag.sections.length+1)+']');
            title.addClass('waf-accordion-title waf-state-collapsed');
            
            icon = $('<div class="waf-accordion-icon"></div>');
            header.getHtmlObject().append(icon);
            
            title.updateZindex(4);
            header.updateZindex(3);
            content.updateZindex(3);
            section.updateZindex(2);
            
            group.add(title);
            group.add(header);
            group.add(content);
            group.add(section); 
                        
            $(header).bind({
                onResize: function (e) { 
                    if (this.getWidth() != 0) {
                        var attr            = tag.getAttribute('data-header-height');
                        var headerHeight    = parseInt(attr.getValue(),10); 
                        tag.setWidth(this.getWidth()+2);
                        if(this.getPosition().left != 0){
                            tag.setX(tag.getPosition().x + this.getPosition().left);
                            this.setX(0);
                        }
                        if(this.getHeight() != headerHeight ){
                            attr.setValue(""+this.getHeight());
                            tag.resize();
                        }
                    }
                },
                onWidgetDestroy : function(){
                    tag.removeSection(this.getParent());
                }
            });
            
            $(content).bind({
                onResize: function (e) {
                    if (this.getWidth() != 0) {
                        var attr            = tag.getAttribute('data-content-height');
                        var contentHeight    = parseInt(attr.getValue(),10);

                        tag.setWidth(this.getWidth()+2);
                        if(this.getPosition().left != 0){
                            tag.setX(tag.getPosition().x + this.getPosition().left);
                            this.setX(0);
                        }
                        if(this.getHeight() != contentHeight && this.getHeight() !=0 ){

                            attr.setValue(""+this.getHeight());
                            tag.resize();
                        }
                    }
                    
                },
                onWidgetDestroy : function(){
                    tag.removeSection(this.getParent());
                }
            });
            
            
            $(section).bind({
                
                onResize: function (e) {   
                    
                    if (this.getWidth() != 0) {
                        tag.setWidth(this.getWidth()+2);
                        if(this.getPosition().left != 0){
                            tag.setX(tag.getPosition().x + this.getPosition().left);
                            this.setX(0);
                        }
                    }
                    
                },
                onWidgetDestroy : function(){
                    tag.removeSection(this);
                    tag.setCurrent();
                }
            });
            
            
            title.getHtmlObject().bind('click',{
                tag: tag
            }, tag.onAltSelect);
            
                
            content.getHtmlObject().bind('click',{
                tag: tag
            }, tag.onAltSelect);
            
            section.getHtmlObject().bind('click',{
                tag: tag
            }, tag.onAltSelect);
                
            header.getHtmlObject().bind('click',{
                tag: tag
            }, tag.onAltSelect);
            
       
            tag.sections.push(section);
            tag.getHtmlObject().trigger('afterSectionAdd'); 
            return section;
        };
        
        
        tag.removeSection = function (section) {
            var
            i,
            length;
            
            length = tag.sections.length;
            for( i=0 ; i<length; i++) {
                if(tag.sections[i] === section) {
                    break;
                }
            }
            
            if( i != length ) {
                for( ; i<length-1; i++) {
                    tag.sections[i] = tag.sections[i+1];
                }
                tag.sections.length = tag.sections.length - 1;
                section.remove(false);
                tag.getHtmlObject().trigger('afterSectionRemove');
            }
        };
        
        
        
        tag.getHtmlObject().bind({
            activate        : function () {},
            
            afterSectionAdd : function () {
                tag.resize(true);
                Designer.tag.refreshPanels(tag);
            },
            
            afterSectionRemove : function () {
            	if (tag.sections.length === 0 ) {
            		tag.remove();
            	} else {
            		tag.resize(true);
                	Designer.tag.refreshPanels();
                	tag.setCurrent();
            	}
            },
            
            changeEnd   : function(){
                tag.resize();
            }
        });
        
        tag.activate = function (container) {
            
            var
            section;
            
            section = typeof(container) === "number" ? tag.sections[container] : container;
            
            var headerHeight = parseInt(tag.getAttribute('data-header-height').getValue(),10);
            
            if( tag.getAttribute('data-expand-several').getValue() === 'true'){
                if(section.getHeight() == headerHeight){
                    tag.collapseAll();
                    tag.expand(section);
                }
                
            } else {
                if ( section.getHeight() == headerHeight ){
                    tag.expand(section);
                } else {
                    tag.collapse(section);
                }
            }
        };
        
        tag.onAltSelect		= function (e) {            
            if (e.altKey) {  
                e.data.tag.setCurrent();                
                D.tag.refreshPanels();
                return false;
            }
            return true;
        };
        
        tag.onChangeTheme = function (theme) {
            /*var
            group;
            
            group = D.getGroup(this.getGroupId());
        
            if (group) {
                group.applyTheme(theme, this);
            }*/
        };
        
        
        tag.getHeader = function (section) {
            
            var
            className,
            container;
            
            container = section.getChildren()[0];
            if(container){
                className = container.getAttribute('class').getValue();

                if(className.indexOf('accordion-header') !== -1){
                    return container;
                } else {
                    return section.getChildren()[1];
                }    
            }            
        };
        
        
        tag.getContent = function (section) {
            var
            className,
            container;
            
            container = section.getChildren()[0];
            className = container.getAttribute('class').getValue();
            
            if(className.indexOf('accordion-content') !== -1){
                return container;
            } else {
                return section.getChildren()[1];
            }
        };
        
        tag.getSortedSections = function(){
            
            var
            i,
            links,
            length;
            
            links           = tag.getLinks();
            length          = links.length;
            tag.sections    = [];
            
            for( i=0; i<length ; i++){
                tag.sections.push(links[i]);
            }
            
            tag.sections.sort(function(a,b){
                return (a.getY() - b.getY());
            })
            
        }

        $(tag).bind({
            'afterSectionAdd' : function () {
                tag.resize();
                Designer.tag.refreshPanels(tag);
            },
            'onHeaderChange' : function(){
                
            },
            'onReady' : function(){
                var group = new Designer.ui.group.Group();
                group.add(tag);
                
                if (!param._isLoaded) {               
                    
                    tag.addSection();
                    tag.addSection();
                    tag.addSection();
                    tag.activate(0);
                    Designer.ui.group.save();
                } else {
                
                    var
                    k,
                    title,
                    length,
                    header,
                    icon,
                    section,
                    content,
                    sections;
                    tag.getSortedSections();
                    sections = tag.sections;
                    length = sections.length;
                    
                    
                    /*
                     * Disable domUpdate
                     */
                    D.tag.preventDomUpdate();
                
                    for(k=0; k<length ; k++){
                        section = sections[k];
                        header = tag.getHeader(section);
                        content = tag.getContent(section);
                        title = header.getChildren()[0];
                        
                        group.add(title);
                        group.add(header);
                        group.add(content);
                        group.add(section); 
                    
                        icon = $('<div class="waf-accordion-icon"></div>');
                        header.getHtmlObject().append(icon);
                    
                        header.getHtmlObject().bind('click', {
                            tag: tag,
                            container: header
                        }, function (e, type) {
                            e.data.tag.activate(e.data.container.getParent()); 
                        });
            
                        title.getHtmlObject().bind('click',{
                            tag: tag
                        }, tag.onAltSelect);
            
                        content.getHtmlObject().bind('click',{
                            tag: tag
                        }, tag.onAltSelect);
            
                        section.getHtmlObject().bind('click',{
                            tag: tag
                        }, tag.onAltSelect);
                
                        header.getHtmlObject().bind('click',{
                            tag: tag
                        }, tag.onAltSelect);
                    
                        $(header).bind({
                            onResize: function (e) { 
                                if (this.getWidth() != 0) {
                                    var attr            = tag.getAttribute('data-header-height');
                                    var headerHeight    = parseInt(attr.getValue(),10); 
                                    tag.setWidth(this.getWidth()+2);
                                    if(this.getPosition().left != 0){
                                        tag.setX(tag.getPosition().x + this.getPosition().left);
                                        this.setX(0);
                                    }
                                    if(this.getHeight() != headerHeight ){
                                        attr.setValue(""+this.getHeight());
                                        tag.resize();
                                    }
                                }
                            },
                            onWidgetDestroy : function(){
                                tag.removeSection(this.getParent());
                            }
                        });
            
                        $(content).bind({
                            onResize: function (e) {
                                if (this.getWidth() != 0) {
                                    var attr            = tag.getAttribute('data-content-height');
                                    var contentHeight    = parseInt(attr.getValue(),10);

                                    tag.setWidth(this.getWidth()+2);
                                    if(this.getPosition().left != 0){
                                        tag.setX(tag.getPosition().x + this.getPosition().left);
                                        this.setX(0);
                                    }
                                    if(this.getHeight() != contentHeight && this.getHeight() !=0 ){

                                        attr.setValue(""+this.getHeight());
                                        tag.resize();
                                    }
                                }

                            },
                            onWidgetDestroy : function(){
                                tag.removeSection(this.getParent());
                            }
                        });
            
            
                        $(section).bind({
                            onResize: function (e) {   
                    
                                if (this.getWidth() != 0) {
                                    tag.setWidth(this.getWidth()+2);
                                    if(this.getPosition().left != 0){
                                        tag.setX(tag.getPosition().x + this.getPosition().left);
                                        this.setX(0);
                                    }
                                }

                            },
                            onWidgetDestroy : function(){
                                tag.removeSection(this);
                                tag.setCurrent();
                            }
                        });
                    }
                    /*
                     * Enable domUpdate
                     */
                    D.tag.preventDomUpdate(false);
                }
                Designer.ui.group.save();
            }
        });
    }
});                                                                                                                                  
