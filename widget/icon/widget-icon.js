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
//// "use strict";

/*global WAF,window*/

/*jslint white: true, browser: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */

WAF.Widget.provide(


    /**
     * A class to provide 4-states icons
     * (normal, hover, active, disabled)
     *
     * @class WAF.Widget.Icon
     * @extends WAF.Widget
     */
    'Icon',
    
    {
        /**
         * The default states attributes
         * 
         * @private
         * @shared
         * @property shared.defaultState
         * @type Object
        */
        defaultState: {
            normalMobile: {
                scale: '0.7 0.7',
                fill: '#fff',
                //opacity: 0.7,
                stroke: 'none'
            },
            normal: {
                scale: '0.7 0.7',
                fill: '#5e5e5e',//5e5e5e
                //opacity: 0.7,
                stroke: 'none'
            },
            hover: {
                //fill: '#888',
                //fill: '#5e5e5e',
                //stroke: 'none'
            },
            active: {
                //fill: '#fff',
                //fill: '#5e5e5e',
                //stroke: 'none'
            },
            disabled: {
                //fill: '#716b65',
                //fill: '#5e5e5e',
                //stroke: 'none'
            }
        },
        
        
        /**
         * The available paths
         * 
         * @private
         * @shared
         * @property shared.path
         * @type Object
        */
        path: {
            'questionMark': 'M 8,0.21875 C 4.2713275,0.14197786 0.80494426,3.1229021 0.30854347,6.8163019 -0.30845812,10.371109 1.9238817,14.126388 5.3268245,15.30845 8.6393979,16.589366 12.693361,15.213442 14.55397,12.191507 16.565547,9.1809685 16.036009,4.8146305 13.3664,2.3694547 11.940025,0.99842746 9.9794657,0.20890504 8,0.21875 z m 0.1875,3.75 C 9.6214659,3.8617741 11.105506,5.1590605 10.699913,6.6594261 10.540219,7.993643 8.7071455,8.3623657 8.71875,9.7296909 8.8687245,10.307797 8.1087289,9.9759333 7.7671638,10.0625 7.1007837,10.277321 7.2324258,9.6515364 7.27211,9.1964456 7.3192005,7.7776594 9.8529406,7.2897556 9.0234873,5.7630303 8.3674501,4.6439043 7.1130327,6.10801 6.5972927,5.5807189 6.2235365,5.1499766 5.6259204,4.6394495 6.5532153,4.390625 7.0502207,4.113654 7.6184865,3.9673256 8.1875,3.96875 z m -0.9375,7.125 c 0.4895833,0 0.9791667,0 1.46875,0 0,0.458333 0,0.916667 0,1.375 -0.4895833,0 -0.9791667,0 -1.46875,0 0,-0.458333 0,-0.916667 0,-1.375 z',
            'plus': 'M 12.95363,0.00218262 H 3.04597 C 1.36359,0.00218262 0,1.3364826 0,2.9826826 V 13.021683 c 0,1.6459 1.36398,2.9805 3.04597,2.9805 h 9.90807 c 1.68238,0 3.04596,-1.335 3.04596,-2.9805 V 2.9830826 c 0,-1.6466 -1.36398,-2.98089998 -3.04637,-2.98089998 z M 12.19861,9.4123826 h -2.7606 l 0,2.6954004 c -4e-4,0.7784 -0.64517,1.4094 -1.4404,1.4101 -0.79562,0 -1.4396,-0.632 -1.4396,-1.4101 l 7.7e-4,-2.6954004 -2.7594,-8e-4 c -0.79482,0 -1.4388,-0.6297 -1.4388,-1.4074 7.7e-4,-0.7781 0.64477,-1.4083 1.4388,-1.4078 h 2.7602 l -4e-4,-2.7009 c 0.001,-0.7785 0.64557,-1.4086 1.4408,-1.409 0.79562,0 1.44,0.6314 1.4392,1.409 l -3.9e-4,2.7009 2.7598,3e-4 c 0.79522,7e-4 1.43959,0.6317 1.44039,1.4098 -10e-4,0.7777 -0.64517,1.4067 -1.44039,1.4059 z',
            'plusMobile': 'M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979,12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z',
            'minus': 'M 12.954026,0.002183 H 3.0459693 C 1.3635807,0.002183 0,1.3364239 0,2.9826132 V 13.021753 c 0,1.645797 1.3639796,2.98043 3.0459693,2.98043 H 12.954026 C 14.636818,16.002183 16,14.667168 16,13.021753 V 2.9830057 C 16,1.3364239 14.636419,0.002183 12.954026,0.002183 z M 12.199001,9.4123666 3.7998001,9.4119741 C 3.004974,9.4115925 2.3609945,8.7818519 2.3609945,8.0041289 2.3617667,7.2260134 3.0057707,6.5958913 3.7998001,6.5966763 h 8.3992009 c 0.794432,7.523e-4 1.438811,0.6316812 1.439606,1.4097858 -5.94e-4,0.777723 -0.645174,1.4066895 -1.439606,1.4059045 z',
            'arrowFullLeft': 'M 6.42825,15.374508 0.6214,9.5205079 C 0.20777,9.1013079 0,8.5475079 0,8.0006079 l 0,0 c 0,-0.5461 0.20777,-1.0976 0.6214,-1.5188 l 0,0 0.001,0 5.80609,-5.85399995 c 0.41478,-0.4184 0.96472,-0.6293 1.50695,-0.627800004869 l 0,0 c 0.54221,0 1.09139,0.209400004869 1.50307,0.625500004869 l 0,0 C 9.85483,1.0392079 10.06802,1.5927079 10.06802,2.1439079 l 0,0 c 0,0.5468 -0.20972,1.1015 -0.62565,1.5191 l 0,0 -2.17274,2.1875 h 6.60088 c 1.17906,0 2.12756,0.9633 2.12949,2.1481 l 0,0 c -0.002,1.1841 -0.94927,2.1474001 -2.12949,2.1474001 l 0,0 H 7.27156 l 2.16888,2.1871 c 0.41439,0.4165 0.62758,0.9699 0.62758,1.5215 l 0,0 c 0,0.5461 -0.20972,1.0995 -0.62758,1.518 l 0,0 c -0.41554,0.4161 -0.96009,0.6274 -1.505,0.6274 l 0,0 c -0.54262,0 -1.09256,-0.211 -1.50734,-0.6274 l 0,0 z',
            'arrowFullRight': 'M 9.57175,15.374508 15.3786,9.5205079 c 0.41363,-0.4192 0.6214,-0.973 0.6214,-1.5199 l 0,0 c 0,-0.5461 -0.20777,-1.0976 -0.6214,-1.5188 l 0,0 -0.001,0 -5.80609,-5.85399995 c -0.41478,-0.4184 -0.96472,-0.6293 -1.50695,-0.627800004869 l 0,0 C 7.52235,7.945131e-6 6.97317,0.20940795 6.56149,0.62550795 l 0,0 C 6.14517,1.0392079 5.93198,1.5927079 5.93198,2.1439079 l 0,0 c 0,0.5468 0.20972,1.1015 0.62565,1.5191 l 0,0 2.17274,2.1875 H 2.12949 c -1.17906,0 -2.12756,0.9633 -2.12949,2.1481 l 0,0 c 0.002,1.1841 0.94927,2.1474001 2.12949,2.1474001 l 0,0 h 6.59895 l -2.16888,2.1871 c -0.41439,0.4165 -0.62758,0.9699 -0.62758,1.5215 l 0,0 c 0,0.5461 0.20972,1.0995 0.62758,1.518 l 0,0 c 0.41554,0.4161 0.96009,0.6274 1.505,0.6274 l 0,0 c 0.54262,0 1.09256,-0.211 1.50734,-0.6274 l 0,0 z',
            'arrowSansLeft': 'M 11 1 L 4 8 L 11 15 L 11 1 z',
            'arrowSansRight': 'M 5 1 L 5 15 L 12 8 L 5 1 z',
            'trash': 'M 6.75 -0.03125 C 6.128465 0.076817308 6.05147 1.1254821 5.5 1.1875 C 4.5426184 1.1568985 3.4370056 1.114832 2.71875 1.875 C 2.3521867 2.2242683 1.7403905 3.247357 2.15625 3.53125 L 13.6875 3.53125 C 13.697157 2.1441629 12.331468 0.98910275 10.96875 1.1875 L 10.03125 1.1875 C 10.059954 0.38472055 9.200304 -0.13856532 8.46875 0 L 7.0625 0 C 6.9491067 -0.028065075 6.8387907 -0.046688187 6.75 -0.03125 z M 2 4.71875 C 2.0151152 7.7993031 1.9769344 10.889794 2.03125 13.96875 C 2.2072088 15.267229 3.5342711 16.19058 4.8125 16 C 7.0974602 15.986541 9.4037307 16.024902 11.6875 15.96875 C 12.97934 15.801558 13.866386 14.446299 13.6875 13.1875 L 13.6875 4.71875 L 2 4.71875 z M 4.625 6.5 C 5.3457596 6.5230087 5.2299452 7.4068785 5.21875 7.90625 C 5.2147422 9.7906036 5.2446673 11.678236 5.21875 13.5625 C 4.9913079 14.551871 3.6298606 13.782735 4.03125 12.96875 C 4.0361739 10.965356 4.0046075 8.972057 4.03125 6.96875 C 4.0796378 6.6993753 4.3517656 6.4932642 4.625 6.5 z M 7.9375 6.5 C 8.6580687 6.5233484 8.5425444 7.4068372 8.53125 7.90625 C 8.527204 9.7906036 8.5572436 11.678236 8.53125 13.5625 C 8.3986177 14.451514 6.9979048 13.943712 7.3125 13.15625 C 7.3206683 11.094294 7.2836818 9.0296457 7.3125 6.96875 C 7.3738846 6.694356 7.6588111 6.4954498 7.9375 6.5 z M 11.21875 6.5 C 11.90116 6.4945188 11.887355 7.3263963 11.84375 7.8125 C 11.838292 9.7282582 11.873293 11.646854 11.84375 13.5625 C 11.595612 14.54458 10.225538 13.799329 10.625 12.96875 C 10.629886 10.965356 10.598625 8.9720586 10.625 6.96875 C 10.672521 6.6988409 10.94534 6.4926256 11.21875 6.5 z',
            'radioactive': 'M 4.7495053,2.3824846 C 3.8243413,2.6462962 4.1157849,3.823571 4.6038227,4.3644301 5.2320236,5.4637816 5.8602244,6.5631331 6.4884253,7.6624846 7.1692961,6.8780436 8.3091481,7.1655221 9.1748265,7.408136 9.9291467,7.623662 10.021617,6.3207181 10.488771,5.86498 10.945486,5.0407792 11.469243,4.2387285 11.84284,3.3774689 11.97655,2.4211178 10.772637,2.2783756 10.081615,2.3824846 c -1.7773701,0 -3.5547399,0 -5.3321097,0 z m 3.22491,5.4697 C 6.7331958,7.7611498 5.9208699,9.4872057 6.7785653,10.387365 7.51891,11.426096 9.413431,10.903469 9.5095854,9.6267657 9.6662484,8.7322249 8.8859315,7.8189714 7.9744153,7.8521846 z m -7.14537998,1.64407 c -1.08464358,0.012331 -0.96463588,1.4550234 -0.36180202,2.0116004 0.9217462,1.558522 1.7824728,3.153241 2.747512,4.68601 0.716755,0.718329 1.5656111,-0.235502 1.8058793,-0.922572 0.7211236,-1.239982 1.4422471,-2.479965 2.1633707,-3.719948 -0.9902269,-0.196271 -1.2119359,-1.327551 -1.6781,-2.0550904 -1.5589533,0 -3.1179067,0 -4.67685998,0 z m 9.42177968,0 c 0.147251,0.9368064 -0.7722997,1.5060524 -1.2965112,2.1257144 0.2334278,0.863027 0.9648908,1.750888 1.3857042,2.625676 0.573525,0.706697 0.748386,1.95318 1.710438,2.210055 1.056004,-0.142493 1.250015,-1.424228 1.804623,-2.147867 0.71404,-1.260181 1.515398,-2.486018 2.130698,-3.793004 0.152224,-0.9652721 -1.062455,-1.1329592 -1.762362,-1.0205744 -1.324197,0 -2.648393,0 -3.97259,0 z',
            'magnifyingGlass': 'M 5.875 0 C 4.5338886 0.016050726 3.1868715 0.45979752 2.15625 1.34375 C 0.072738424 3.0004621 -0.60339095 6.1210439 0.59375 8.5 C 1.7163235 10.926788 4.5811151 12.367751 7.1875 11.75 C 7.7387149 11.725749 8.3589478 11.068707 8.71875 11.71875 C 9.9951609 12.985328 11.242514 14.246548 12.53125 15.5 C 13.532737 16.376934 15.295651 15.977725 15.8125 14.75 C 16.187091 13.964936 15.999118 12.982574 15.375 12.375 L 11.375 8.375 C 12.510678 5.9713281 11.741233 2.8518394 9.625 1.25 C 8.5733253 0.39145237 7.2161114 -0.016050726 5.875 0 z M 5.75 2.0625 C 7.703925 1.916566 9.5740453 3.4902641 9.78125 5.4375 C 10.076514 7.3773921 8.6457976 9.3662014 6.71875 9.71875 C 4.8386012 10.149181 2.7856227 8.9438606 2.25 7.09375 C 2.1341417 6.7226316 2.0623287 6.3262351 2.0625 5.9375 C 2.0151077 3.9453777 3.7586995 2.1182851 5.75 2.0625 z',
            'floppyDisk': 'M 2.8125 0 C 1.2634539 0 0 1.2923468 0 2.84375 L 0 13.1875 C 0 14.737725 1.2634539 16 2.8125 16 L 13.1875 16 C 14.738118 16 16 14.737725 16 13.1875 L 16 2.84375 C 16 1.2923468 14.738118 0 13.1875 0 L 12.9375 0 L 12.9375 6.03125 C 12.9375 6.4531814 12.60786 6.78125 12.1875 6.78125 L 3.8125 6.78125 C 3.3905686 6.78125 3.0625 6.4531814 3.0625 6.03125 L 3.0625 0 L 2.8125 0 z M 9.15625 0.03125 C 8.9464629 0.03125 8.78125 0.19646288 8.78125 0.40625 L 8.78125 5.125 C 8.78125 5.3359657 8.9464629 5.5 9.15625 5.5 L 11.0625 5.5 C 11.273466 5.5 11.4375 5.3359657 11.4375 5.125 L 11.4375 0.40625 C 11.4375 0.19646288 11.273466 0.03125 11.0625 0.03125 L 9.15625 0.03125 z',
            'arrowDown': 'M 8,14 3.2290908,7.6 12.770909,7.6 8,14 z',
            'arrowUp': 'M 8,2 3.2290908,8.4 12.770909,8.4 8,2 z',
            'checkbox': 'M6.039,14.107L0.368,7.708C-0.216,7.052-0.092,6.092,0.65,5.571C1.39,5.05,2.465,5.163,3.052,5.824 L5.93,9.068l6.927-8.442c0.558-0.677,1.627-0.831,2.39-0.335s0.929,1.447,0.375,2.127L6.039,14.107L6.039,14.107z'
        }
    },
    
    /**
     * @constructor
     * @param {Object} inConfig configuration of the widget
     */

    /**
     * The constructor of the widget
     *
     * @shared
     * @property constructor
     * @type Function
     * @default TODO: set to the name to this class (ex: WAF.widget.DataGrid)
     **/
    function WAFWidget(config, data, shared) {
        var  
        widget,
        cssProp,
        
        /*
         * The Raphael viewport
         */
        paper,
        /*
         * The initial icon, normal state
         */
        icon;
        
        /*
         * Set icon widget type
         */
        this._type          = data['icon-type'] ? data['icon-type'] : null;
        
        this._spriteInfo    = data['sprite-info'] || "";
        
        widget      = this;
        
        switch(this._type) {
            /*
             * Images icon behaviour
             */
            case 'images' :
                /*
                 * Show default image
                 */
                this.setState('state1');
                
                /*
                 * Bind states events
                 */
                this.$domNode.bind({
                        mouseenter: function() {
                            widget.setState('state2');
                        },
                        mousedown: function() {
                            widget.setState('state3');
                        },
                        'mouseleave': function() {
                            widget.setState('state1');
                        },
                        'mouseup': function() {
                            widget.setState('state2');
                        }
                });
                
                /*
                 * Resize icon depending on data-fit value
                 */
                this.$domNode.find('img').width('100%').height('100%');
                
                break;
                
                
            /*
             * Sprite icon behaviour
             */
            case 'sprite' :                
                /*
                 * Set image as background-image css property
                 */
                cssProp = {
                    'background-image' : 'url("' + data['image-state1'] + '")'
                }
                
                this.$domNode.css(cssProp);
                
                /*
                 * Show default image
                 */
                this.setState('state1');
                
                /*
                 * Bind states events
                 */
                this.$domNode.bind({
                        mouseenter: function() {
                            widget.setState('state2');
                        },
                        mousedown: function() {
                            widget.setState('state3');
                        },
                        'mouseleave': function() {
                            widget.setState('state1');
                        },
                        'mouseup': function() {
                            widget.setState('state2');
                        }
                });
                
                break;
                
                
            /*
             * Default icon behaviour
             */
            default : 
                /**
                 * The states of this icon instance, default to shared.defaultState
                 *
                 * @private
                 * @property defaultState
                 * @type object
                 */
                this.state = $.extend(true, {}, shared.defaultState, config.state);

                if (shared.path[config.type] == undefined) {
                    config.type = 'questionMark';
                }

                if (config.size == undefined || ("16, 24, 32".indexOf(config.size) === -1)) {
                    config.size = 16;
                }

                $(this.containerNode).prop(
                {
                    id: config.id,
                    'class': 'waf-icon waf-icon-' + config.size + ' ' + [].concat(config.className).join(' ')
                }
                )
                .data(
                {
                    'icon-size': config.size,
                    'icon-type': config.type
                }
                ).bind({
                        mouseenter: function() {
                                $(this).addClass('waf-state-hover');
                        },
                        mousedown: function() {
                                $(this).addClass('waf-state-active');
                        },
                        'mouseleave mouseup': function() {
                                $(this).removeClass('waf-state-hover waf-state-active');
                        }
                });

                paper = Raphael(this.containerNode, config.size, config.size * 4);

                if (WAF.PLATFORM.modulesString === "mobile" || WAF.PLATFORM.modulesString === "touch") {
                    icon = paper.path(shared.path[config.type]).attr(this.state.normalMobile); 
                } else {
                    icon = paper.path(shared.path[config.type]).attr(this.state.normal);
                }
                icon.clone().translate(0, config.size).attr(this.state.hover);
                icon.clone().translate(0, config.size * 2).attr(this.state.active);
                icon.clone().translate(0, config.size * 3).attr(this.state.disabled);

                /* append a transparent foregroung to handle events */
                paper.rect(0, 0, config.size, config.size * 4).attr({
                    fill: '#000', 
                    stroke: 'none', 
                    opacity: 0
                });
                
                $(this.containerNode).append($(paper.node));
                
                break;
        }
        
    },
    {
        _type : null,
        
        _tmpState : 'default',
        
        setState : function icon_set_state (state) {
            var
            label,
            htmlObject,
            toEnable = (state == 'enabled'); // if we're enabling a disabled widget, this method is called before its status is set to enable
                                             // so we check its disable state using the state param as well instead of this._disabled only
            
            label = this.getLabel();
            
            /*
             * Equivalences
             */
            if (state == 'default' || state == 'enabled') {
                state = 'state1';
            }
            
            if (state == 'hover') {
                state = 'state2';
                this.addClass('waf-state-hover');
            }
            
            if (state == 'active') {
                state = 'state3';
            }
            
            if (state == 'disabled') {
                state = 'state4';
            }
            
            if (!this._disabled || toEnable) {
                htmlObject = this.$domNode;

                htmlObject.addClass('waf-state-' + state);
                this._showImage(state);
                
                if (state == 'state2') {
                    htmlObject.removeClass('waf-state-state3');
                }

                if (state == 'state3') {
                    htmlObject.removeClass('waf-state-state2');
                }
                
                if (state == 'state1') {
                    htmlObject.removeClass('waf-state-state2');
                    htmlObject.removeClass('waf-state-state3');
                    htmlObject.removeClass('waf-state-state4');
                    
                    this._tmpState = state;
                }
            
                if (label) {
                    label.setState(state);
                }
            }
        },
        
        /*
         * Display the correct image depending on icon state
         * @method _showImage
         * @param {string} state
         */
        _showImage : function icon_show_image(state) {
            var
            spriteInfo;
            
            switch (this._type){
                case 'images' :
                    var iconState = this.$domNode.find('img.waf-icon-' + state),
                        iconOtherStates = this.$domNode.find('img').not('.waf-icon-' + state),
                        iconDefaultState = this.$domNode.find('img.waf-icon-state1')
                    ;
                    if(iconState.length == 0){
                        // there is no icon corresponding to the current state, fallback to default
                        iconOtherStates.hide();
                        iconDefaultState.show();
                        return;
                    }
                    iconState.show();
                    iconOtherStates.hide();
                    
                    break;
                    
                case 'sprite' :            
                    /*
                     * Get sprite info
                     */
                    /*spriteInfo  = this._spriteInfo;
                    spriteInfo  = JSON.parse(spriteInfo.replace(/\'/g, '"'))[0];*/
                    
                    /*
                     * Change background-position
                     */
                    /*if (spriteInfo[state]) {
                        this.$domNode.css({
                            'background-position' : spriteInfo[state]
                        });
                    }
                    */
                    break;
            }
            
            
        },        
        
        /**
         * Custom disable function (enable sub widgets)
         * @method enable
         */
        disable : function icon_disable() {
            this.setState('disabled');     

            /*
             * Call super class disable function
             */
            WAF.Widget.prototype.disable.call(this);
        },        
        
        /**
         * Custom enable function (enable sub widgets)
         * @method enable
         */
        enable : function icon_enable() {  
            this.setState('enabled');
            
            /*
             * Call super class enable function
             */
            WAF.Widget.prototype.enable.call(this);
        }
    }

    );
