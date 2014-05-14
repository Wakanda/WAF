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
    type       : 'textField',
    lib        : 'WAF',
    description: 'Text Input',
    category   : 'Form Controls',
    img        : '/walib/WAF/widget/textField/icons/widget-textField.png',
    tag        : 'input',
    attributes : [
    {
        name        : 'type',
        defaultValue: 'text'
    },
    {
        name       : 'data-binding',
        description: 'Source'
    },
    {
        name       : 'data-errorDiv',
        description: 'Error ID'
    },
    {
        name       : 'value',
        description: 'Default value'
    },
    {
        name       : 'class',
        description: 'Css class'
    },    
    {
        name       : 'data-format',
        description: 'Format'
    },
    {
        name        : 'data-label',
        description : 'Label',
        defaultValue: 'label'
    },
    {
        name        : 'data-label-position',
        description : 'Label position',
        defaultValue: 'left'
    },
    {
        name       : 'data-autocomplete',
        description: 'Auto-complete',
        type        : 'checkbox'
    },
    {
        name        : 'data-multiline',
        description : 'Multiline',
        type        : 'checkbox',
        defaultValue: 'false'
    },
    {
        name        : 'data-readOnly',
        description : 'Read only',
        type        : 'checkbox',
        typeValue   : 'bool',
        defaultValue: 'false'
    },
    {
        name        : 'data-password',
        description : 'Password field',
        type        : 'checkbox',
        defaultValue: 'false'
    },
    {
        name        : 'data-datapicker-on',
        description : 'Allow calendar for dates',
        type        : 'checkbox',
        typeValue   : 'bool',
        defaultValue: 'true'
    },
    {
        name        : 'data-datapicker-icon-only',
        description : 'Display calendar when icon is clicked',
        type        : 'checkbox',
        typeValue   : 'bool',
        defaultValue: 'false'
    },
    {
        name        : 'tabindex',
        description : 'Tabindex'
    },
    {
        name		: 'placeholder',
        description	: 'Input placeholder',
        type		: 'string'
    }],
    events: [
    {
        name       : 'touchstart',
        description: 'On Touch Start',
        category   : 'Touch Events'
    },
    {
        name       : 'touchend',
        description: 'On Touch End',
        category   : 'Touch Events'
    },
    {
        name       : 'blur',
        description: 'On Blur',
        category   : 'Focus Events'
    },
    {
        name       : 'change',
        description: 'On Change',
        category   : 'Focus Events'
    },
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
        name       : 'focus',
        description: 'On Focus',
        category   : 'Focus Events'
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
        name       : 'mouseover',
        description: 'On Mouse Over',
        category   : 'Mouse Events'
    },
    {
        name       : 'mouseup',
        description: 'On Mouse Up',
        category   : 'Mouse Events'
    },
    {
        name       : 'keydown',
        description: 'On Key Down',
        category   : 'Keyboard Events'
    },
    {
        name       : 'keyup',
        description: 'On Key Up',
        category   : 'Keyboard Events'
    },
    {
        name       : 'select',
        description: 'On Select',
        category   : 'Keyboard Events'
    }],
    style: [
    {
        name        : 'width',
        defaultValue: '153px'
    },
    {
        name        : 'height',
        defaultValue: '25px'
    }],
    properties: {
        style: {
            theme       : {
                'roundy'    : false
            },
            fClass      : true,
            text        : true,
            background  : true,
            border      : true,
            sizePosition: true,
            label       : true,
            disabled    : ['border-radius']
        }
    },
    onInit: function (config) {
        var widget = new WAF.widget.TextField(config);

        // add in WAF.widgets
        widget.kind     = config['data-type']; // kind of widget
        widget.id       = config['id']; // id of the widget
        widget.renderId = config['id']; // id of the tag used to render the widget
        widget.ref      = document.getElementById(config['id']); // reference of the DOM instance of the widget
        WAF.widgets[config['id']] = widget;

        return widget;
    },
    onDesign: function (config, designer, tag, catalog, isResize) {


        var theme = tag.config.attributes[10].options,
			placeHolder = tag.getAttribute('placeholder');
        var newClass = '';
        var newStyle = '';
        var t = 0;
        var dblClickEvt = function(){};
        
        for(t in theme) {
            $('#' + tag.getAttribute('id').getValue()).removeClass(theme[t]);
        }

        // Setting the theme
        if (tag.getTheme()) {
            $('#' + tag.getAttribute('id').getValue()).addClass(tag.getTheme().replace(',', ' '));
        } else if (tag.tmpTheme) {
            $('#' + tag.getAttribute('id').getValue()).removeClass(tag.tmpTheme);
        }

        // Dblclick event
        $('#' + tag.getId()).bind('dblclick', {}, dblClickEvt = function (e) {
            $('#' + tag.getId()).css('cursor', 'text');
            // Force focus on widget
            tag.setFocus(true);

            // Lock d&d
            tag.lock();

            $('#' + tag.getId()).css('cursor ', 'text');

            // Disable the events key
            Designer.ui.core.disableKeyEvent();

            Designer.event.setListenerMode(false);
            tag.resize.lock(true);
            YAHOO.util.Event.stopEvent(e);

            $('#' + tag.getAttribute('id').getValue()).focus();

            // Force focus on widget on click
            $('#' + tag.getAttribute('id').getValue()).bind('click', {}, function(e){
                tag.setFocus(true)
            })

            $('#' + tag.getId()).bind('keydown', function (e) {
                if (e.keyCode === 13 && (!e.shiftKey || tag.getAttribute('data-multiline').getValue() === 'false')) {
                    $('#' + tag.getAttribute('id').getValue()).blur();
                }
            });

            $('#' + tag.getId()).bind('blur', {}, function(e){
                $('#' + tag.getId()).css('cursor', 'move');

                if (D.getCurrent() && D.getCurrent() === tag) {
                    tag.setResizable(true);
                }

                tag.getAttribute('value').setValue($('#' + tag.getAttribute('id').getValue()).val());
                tag.update();
                tag.domUpdate();

                Designer.ui.core.enableKeyEvent();
                
                Designer.event.setListenerMode(true);
                tag.resize.unlock(true);


                // unlock d&d
                tag.unlock();

                $('#' + tag.getAttribute('id').getValue()).css('cursor ', 'move');
            });

        });

        var changeTagType = function(type) {
            $('<' + type + '/>').prop('id', 'tmp-' + tag.getAttribute('id').getValue()).appendTo('#' + tag.overlay.id + ' .bd');
            newClass = $('#' + tag.getAttribute('id').getValue()).prop('class');
            newStyle = $('#' + tag.getAttribute('id').getValue()).prop('style');
            $('#' + tag.getAttribute('id').getValue()).remove();
            $('#tmp-' + tag.getAttribute('id').getValue()).prop('class', newClass);
            $('#tmp-' + tag.getAttribute('id').getValue()).prop('style', newStyle);

            if (type === 'textarea') {
                $('#tmp-' + tag.getAttribute('id').getValue()).html(tag.getAttribute('value').getValue());
            } else {
                $('#tmp-' + tag.getAttribute('id').getValue()).val(tag.getAttribute('value').getValue());
                document.getElementById('tmp-' + tag.getAttribute('id').getValue()).setAttribute('type', 'text')
            }

            $('#tmp-' + tag.getAttribute('id').getValue()).prop('id', tag.getAttribute('id').getValue());


            $('#' + tag.getAttribute('id').getValue()).bind('dblclick', {}, dblClickEvt);

        }
        if (tag.getAttribute('data-multiline').getValue() === 'false') {
            changeTagType('input');
        } else if (tag.getAttribute('data-multiline').getValue() !== 'false'){
            changeTagType('textarea');
        }

        tag.getHtmlObject().attr('placeholder', placeHolder);
    }
});
