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
    packageName: 'Widget/googleMap',
    type: 'googleMap',
    lib: 'WAF',
    description: 'Google Maps',
    category: 'External',
    img: '/walib/WAF/widget/googleMap/icons/widget-googleMap.png',
    tag: 'img',
    attributes: [
        {
            name: 'data-binding',
            defaultValue: '',
            description: 'Source'
        },
        {
            name: 'data-position',
            defaultValue: '',
            description: 'Location'
        },
        {
            name: 'data-mapType',
            type: 'dropdown',
            options: [
                {
                    key: 'hybrid',
                    value: 'Hybrid'
                },
                {
                    key: 'roadmap',
                    value: 'Roadmap'
                },
                {
                    key: 'satellite',
                    value: 'Satellite'
                },
                {
                    key: 'terrain',
                    value: 'Terrain'
                }],
            defaultValue: 'Hybrid',
            description: 'Type'
        },
        {
            name: 'data-zoom',
            defaultValue: '10',
            description: 'Zoom'
        },
        {
            name: 'data-label',
            description: 'Label',
            defaultValue: ''
        },
        {
            name: 'data-label-position',
            description: 'Label position',
            defaultValue: 'left'
        },
        {
            name: 'data-marker-color',
            description: 'Color',
            type: 'dropdown',
            options: ['black', 'brown', 'green', 'purple', 'yellow', 'blue', 'gray', 'orange', 'red', 'white'],
            defaultValue: 'red',
            category: 'Marker'
        },
        {
            name: 'data-marker-size',
            description: 'Size',
            type: 'dropdown',
            options: [{
                    key: '',
                    value: ''
                },
                {
                    key: 'tiny',
                    value: 'tiny'
                },
                {
                    key: 'mid',
                    value: 'mid'
                },
                {
                    key: 'small',
                    value: 'small'
                },
            ],
            defaultValue: '',
            category: 'Marker'
        },
        {
            name: 'data-marker-label',
            description: 'Label',
            type: 'dropdown',
            options: ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', '0', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
            defaultValue: '',
            category: 'Marker'
        }
    ],
    style: [
        {
            name: 'width',
            defaultValue: '338px'
        },
        {
            name: 'height',
            defaultValue: '200px'
        }],
    events: [
        {
            name: 'click',
            description: 'On Click',
            category: 'Mouse Events'
        },
        {
            name: 'dblclick',
            description: 'On Double Click',
            category: 'Mouse Events'
        },
        {
            name: 'mousedown',
            description: 'On Mouse Down',
            category: 'Mouse Events'
        },
        {
            name: 'mouseout',
            description: 'On Mouse Out',
            category: 'Mouse Events'
        },
        {
            name: 'mouseover',
            description: 'On Mouse Over',
            category: 'Mouse Events'
        },
        {
            name: 'mouseup',
            description: 'On Mouse Up',
            category: 'Mouse Events'
        }/*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/],
    properties: {
        style: {
            theme: false,
            fClass: true,
            text: false,
            background: true,
            dropShadow: true,
            border: true,
            sizePosition: true,
            label: true,
            disabled: ['border-radius']
        }
    },
    onInit: function(config) {
        var widget = new WAF.widget.GoogleMap(config);
        return widget;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        document.getElementById(tag.getAttribute('id').getValue()).src = "../walib/WAF/widget/googleMap/images/googleMap.jpg";
    }
});
