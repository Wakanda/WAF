/* brackets-xunit: includes=../../ui/class.js,../../ui/error.js,../../ui/behavior.js,../../ui/behavior/studio/studio.js,../../ui/widget.js */
describe("Behavior Studio ", function() {
    var widget;

    beforeEach(function() {
        widget = Widget.create("MyWidget");
        widget.inherit(Behavior.Studio);
    });

    afterEach(function() {
        widget = null;
    });

    it(" can set a configuration", function() {
        widget.setConf({
            type: 'test',
            description: '',
            category: '',
            attributes: [],
            style: {},
            structures: [],
            events: [],
            on: [],
            panels: {
            }
        });
        var conf = widget._getConf();
        expect(conf.type).toEqual('test');
    });

    it(" can add a description", function() {
        widget.setDescription('my widget');
        var conf = widget._getConf();
        expect(conf.description).toEqual('my widget');
    });

    it(" can add an icon", function() {
        widget.setIcon('./path/icon.png');
        var conf = widget._getConf();
        expect(conf.img).toEqual('./path/icon.png');
    });

    it(" can set the default height", function() {
        widget.setHeight('500');
        var conf = widget._getConf();
        expect(conf.style[0].name).toEqual('height');
        expect(conf.style[0].defaultValue).toEqual('500px');
    });

    it(" can set the default width", function() {
        widget.setWidth('500');
        var conf = widget._getConf();
        expect(conf.style[0].name).toEqual('width');
        expect(conf.style[0].defaultValue).toEqual('500px');
    });

    it(" can set the library", function() {
        widget.setLib('Sencha');
        var conf = widget._getConf();
        expect(conf.lib).toEqual('Sencha');
    });

    it(" can set the panel style", function() {
        widget.setPanelStyle({
            'theme': false,
            'fClass': true,
            'text': true,
            'background': true,
            'border': true,
            'sizePosition': true,
            'label': true,
            'disabled': ['border-radius']
        });
        var conf = widget._getConf();
        expect(conf.properties.style.theme).toEqual(false);
    });

    it(" can set the tag", function() {
        widget.setTag('button');
        var conf = widget._getConf();
        expect(conf.tag).toEqual('button');
    });

    it(" can add an attribute", function() {
        widget.addAttribute({
            'name': 'myatt',
            'description': 'My Att'
        });
        var conf = widget._getConf();
        expect(conf.attributes[0].name).toEqual('myatt');
        expect(conf.attributes[0].description).toEqual('My Att');
    });
    
    it(" can add multiple attributes", function() {
        widget.addAttributes([{
            'name': 'myatt1',
            'description': 'My Att1'
        },
        {
            'name': 'myatt2',
            'description': 'My Att2'
        }]);
        var conf = widget._getConf();
        expect(conf.attributes[0].name).toEqual('myatt1');
        expect(conf.attributes[0].description).toEqual('My Att1');
        
        expect(conf.attributes[1].name).toEqual('myatt2');
        expect(conf.attributes[1].description).toEqual('My Att2');
    });    

    it(" can add an event", function() {
        widget.addEvent({
            'name': 'myevent',
            'description': 'My Event'
        });
        var conf = widget._getConf();
        expect(conf.events[0].name).toEqual('myevent');
        expect(conf.events[0].description).toEqual('My Event');
    });
    
    it(" can add multiple events", function() {
        widget.addEvents([{
            'name': 'myevent1',
            'description': 'My Event1'
        },
        {
            'name': 'myevent2',
            'description': 'My Event2'
        }]);
        var conf = widget._getConf();
        expect(conf.events[0].name).toEqual('myevent1');
        expect(conf.events[0].description).toEqual('My Event1');
        
        expect(conf.events[1].name).toEqual('myevent2');
        expect(conf.events[1].description).toEqual('My Event2');
    });    

    it(" can add a structure", function() {
        widget.addStructure({
            description: 'cells',
            selector: '.waf-dataGrid-cell',
            style: {
                text: true,
                textShadow: true,
                background: true,
                border: true,
                disabled: ['border-radius']
            },
            state: [{
                    label: 'hover',
                    cssClass: 'waf-state-hover',
                    find: '.waf-dataGrid-cell'
                }, {
                    label: 'active',
                    cssClass: 'waf-state-active',
                    find: '.waf-dataGrid-cell'
                }]
        });
        var conf = widget._getConf();
        expect(conf.structure[0].description).toEqual('cells');
    });

});
