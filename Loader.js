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
/**
 *
 * @module WAF
 */

/**
 * WAF
 *
 * @class WAF
 */
if (typeof (WAF) === 'undefined') {
    WAF = {
        /**
         * The version of the framework
         *
         * @static
         * @property VERSION
         * @type String
         **/
        'VERSION': 'WAK9',
        /**
         * The version of the platform (OS, browser, device)
         *
         * @static
         * @property platform
         * @type Object
         **/
        'PLATFORM': {},
        /**
         * The build number of the framework
         *
         * @static
         * @property BUILD
         * @type String
         **/
        'BUILD': '0001',
        wildchar: '*',
        /**
         * The configuration of the framework
         *
         * @static
         * @property config
         * @type Object
         **/
        config: {
            openAjax: null,
            debugMode: false,
            uniTest: false,
            packageMode: false,
            load: '',
            reporting: {
                path: '',
                walib: ''
            },
            rpc: {
                namespace: '',
                module: '',
                methods: ''
            },
            baseURL: '',
            tld: null,
            taglib: [],
            widget: {}
        },
        /**
         * modulesInfo
         *
         * @static
         * @property modulesInfo
         * @type Object
         **/
        modulesInfo: {
            'dataprovider': {
                css: [],
                require: [
                    '+/Core/Native/Rest.js',
                    '+/Core/Utils/DebugTools.js',
                    '+/Core/Utils/Environment.js',
                    '+/Core/Utils/Strings.js',
                    '+/Core/Utils/Dates.js',
                    '+/DataProvider/Data-Provider.js',
                    '+/DataSource/Selection.js'
                ]
            },
            'allmodules': {
                css: [
                    /* WAF */
                    '+/lib/jquery-ui/themes/base/jquery.ui.core.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.resizable.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.selectable.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.accordion.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.autocomplete.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.button.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.dialog.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.slider.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.tabs.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.datepicker.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.progressbar.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.theme.css',
                    '+/lib/selectbox/jquery-selectbox.css',
                    /* WAF WIDGET */
                    '+/widget/css/widget.css',
                    /* WAF accordion */
                    '+/widget/accordion/css/widget-accordion.css',
                    /* Datepicker */
                    /* WAF GRID */
                    '+/widget/dataGrid/css/widget-dataGrid.css',
                    /* NOTIFY */
                    '+/lib/notify/ui.notify.css',
                    /* WAF AUTOFORM */
                    '+/widget/autoForm/css/widget-autoForm.css',
                    /* WAF CONTAINER */
                    '+/widget/container/css/widget-container.css',
                    /* WAF MATRIX */
                    '+/widget/matrix/css/widget-matrix.css',
                    /* WAF IMAGE */
                    '+/widget/image/css/widget-image.css',
                    /* WAF ICON */
                    '+/widget/icon/css/widget-icon.css',
                    /* WAF TEXTFIELD */
                    '+/widget/textField/css/widget-textField.css',
                    /* WAF BUTTON */
                    '+/widget/button/css/widget-button.css',
                    /* WAF BUTTON IMAGE */
                    '+/widget/buttonImage/css/widget-buttonImage.css',
                    /* WAF RICHTEXT */
                    '+/widget/richText/css/widget-richText.css',
                    /* WAF SLIDER */
                    '+/widget/slider/css/widget-slider.css',
                    /* WAF PROGRESS BAR */
                    '+/widget/progressBar/css/widget-progressBar.css',
                    /* WAF YAHOO WEATHER */
                    '+/widget/yahooWeather/css/widget-yahooWeather.css',
                    /* WAF Google Maps */
                    '+/widget/googleMaps/css/widget-googleMaps.css',
                    /* WAF Combobox */
                    '+/widget/combobox/css/widget-combobox.css',
                    /* WAF select */
                    '+/widget/select/css/widget-select.css',
                    /* WAF Radio Group */
                    '+/widget/radiogroup/css/widget-radiogroup.css',
                    /* WAF Label */
                    '+/widget/label/css/widget-label.css',
                    /* WAF checkbox */
                    '+/widget/checkbox/css/widget-checkbox.css',
                    /* WAF switchBox */
                    '+/widget/switchBox/css/widget-switchbox.css',
                    /* WAF menubar */
                    '+/widget/menubar/css/widget-menubar.css',
                    /* WAF menuitem */
                    '+/widget/menuitem/css/widget-menuitem.css',
                    /* WAF login */
                    '+/widget/login/css/widget-login.css',
                    /* WAF Component */
                    '+/widget/component/css/widget-component.css',
                    /* WAF Chart */
                    '+/widget/chart/css/widget-chart.css',
                    /* WAF FileUpload */
                    '+/widget/fileUpload/css/widget-fileUpload.css',
                    /* WAF Frame */
                    '+/widget/frame/css/widget-frame.css',
                    /* WAF Canvas */
                    '+/widget/canvas/css/widget-canvas.css',
                    /* WAF Video */
                    '+/widget/video/css/widget-video.css',
                    /* Error Div */
                    '+/widget/errorDiv/css/widget-errorDiv.css',
                    /* WAF tabview */
                    '+/widget/tabview/css/widget-tabview.css',
                    /* WAF dialog */
                    '+/widget/dialog/css/widget-dialog.css',
                    /* WAF WYSIWYG Editor */
                    '+/widget/tinymce/css/widget-tinymce.css',
                    /* WAF Calendar Picker */
                    '+/widget/calendar/css/widget-calendar.css',
                    '+/widget/calendar/css/datepicker.css',
                    /* WAF beautytips */
                    '+/lib/beautytips/beautytips.css',
                    /* themes */
                    '+/themes/default.css',
                    '+/themes/light.css',
                    '+/themes/metal.css',
                    '+/themes/softGray.css',
                    '+/themes/lilac.css'
                ],
                require: [
                    /* WAF */
                    '+/Core/Native/Rest.js',
                    '+/Core/Utils/Timers.js',
                    '+/Core/Utils/DebugTools.js',
                    '+/Core/Utils/Environment.js',
                    /* jQuery */
                    '+/lib/jquery/jquery.min.js',
                    /* Hammer */
                    '+/lib/hammer/jquery.hammer.min.js',
                    /* jQuery svg*/
                    '+/lib/jquery.svg/jquery.svg.min.js',
                    '+/Core/Utils/Dates.js',
                    '+/waf-core/core.js',
                    '+/waf-core/class.js',
                    '+/waf-core/error.js',
                    '+/waf-core/event.js',
                    '+/waf-core/behavior.js',
                    '+/waf-behavior/methodshelper.js',
                    '+/waf-core/subscriber.js',
                    '+/waf-behavior/observable.js',
                    '+/Core/Utils/Strings.js',
                    '+/Core/Utils/Dates.js',
                    '+/DataProvider/Data-Provider.js',
                    '+/DataSource/Data-Source.js',
                    '+/DataSource/Selection.js',
                    '+/DataSource/ErrorHandling.js',
                    '+/rpc/Rpc.js',
                    '+/Tags/taglib.js',
                    '+/Tags/tags.js',
                    /* External Library */
                    '+/lib/raphael/raphael-min.js',
                    '+/lib/graphael/g.raphael-min.js',
                    '+/lib/graphael/g.line-min.js',
                    '+/lib/graphael/g.bar-min.js',
                    '+/lib/graphael/g.pie-min.js',
                    '+/lib/jquery-ui/jquery-ui.min.js',
                    '+/lib/jquery-ui/jquery-ui-i18n.js',
                    '+/lib/selectbox/jquery-selectbox.js',
                    '+/lib/combobox/jquery-combobox.js',
                    '+/lib/beautytips/beautytips.js',
                    /* Notify */
                    '+/lib/notify/jquery.notify.js',
                    /* widgets */
                    '+/widget/widget.js',
                    '+/Component/Component.js',
                    //'+/test/waf-test.js',
                    '+/widget/icon/widget-icon.js',
                    '+/widget/icon/widget-icon-conf.js',
                    '+/widget/button/widget-button.js',
                    '+/widget/button/widget-button-conf.js',
                    '+/widget/buttonImage/widget-buttonImage.js',
                    '+/widget/buttonImage/widget-buttonImage-conf.js',
                    '+/widget/checkbox/widget-checkbox.js',
                    '+/widget/checkbox/widget-checkbox-conf.js',
                    '+/widget/switchBox/widget-switchbox.js',
                    '+/widget/switchBox/widget-switchbox-conf.js',
                    '+/widget/container/widget-container.js',
                    '+/widget/container/widget-container-conf.js',
                    '+/widget/richText/widget-richText.js',
                    '+/widget/richText/widget-richText-conf.js',
                    '+/widget/errorDiv/widget-errorDiv.js',
                    '+/widget/errorDiv/widget-errorDiv-conf.js',
                    '+/widget/dataGrid/widget-dataGrid.js',
                    '+/widget/dataGrid/widget-dataGrid-conf.js',
                    '+/widget/autoForm/widget-autoForm.js',
                    '+/widget/autoForm/widget-autoForm-conf.js',
                    '+/widget/queryForm/widget-queryForm.js',
                    '+/widget/queryForm/widget-queryForm-conf.js',
                    '+/widget/image/widget-image.js',
                    '+/widget/image/widget-image-conf.js',
                    '+/widget/label/widget-label.js',
                    '+/widget/label/widget-label-conf.js',
                    '+/widget/slider/widget-slider.js',
                    '+/widget/slider/widget-slider-conf.js',
                    '+/widget/textField/widget-textField.js',
                    '+/widget/textField/widget-textField-conf.js',
                    '+/widget/yahooWeather/widget-yahooWeather.js',
                    '+/widget/yahooWeather/widget-yahooWeather-conf.js',
                    '+/widget/progressBar/widget-progressBar.js',
                    '+/widget/progressBar/widget-progressBar-conf.js',
                    '+/widget/matrix/widget-matrix.js',
                    '+/widget/matrix/widget-matrix-conf.js',
                    '+/widget/toolbar/widget-toolbar.js',
                    '+/widget/combobox/widget-combobox.js',
                    '+/widget/combobox/widget-combobox-conf.js',
                    '+/widget/select/widget-select.js',
                    '+/widget/select/widget-select-conf.js',
                    '+/widget/radiogroup/widget-radiogroup.js',
                    '+/widget/radiogroup/widget-radiogroup-conf.js',
                    '+/widget/menubar/widget-menubar.js',
                    '+/widget/menubar/widget-menubar-conf.js',
                    '+/widget/menuitem/widget-menuitem.js',
                    '+/widget/menuitem/widget-menuitem-conf.js',
                    '+/widget/login/widget-login.js',
                    '+/widget/login/widget-login-conf.js',
                    '+/widget/component/widget-component-conf.js',
                    '+/widget/component/widget-component.js',
                    '+/widget/chart/widget-chart-conf.js',
                    '+/widget/chart/widget-chart.js',
                    '+/widget/fileUpload/widget-fileUpload-conf.js',
                    '+/widget/fileUpload/widget-fileUpload.js',
                    '+/widget/tabview/widget-tabview.js',
                    '+/widget/tabview/widget-tabview-conf.js',
                    '+/widget/dialog/widget-dialog.js',
                    '+/widget/dialog/widget-dialog-conf.js',
                    '+/widget/tinymce/widget-tinymce.js',
                    '+/widget/tinymce/widget-tinymce-conf.js',
                    '+/widget/frame/widget-frame.js',
                    '+/widget/frame/widget-frame-conf.js',
                    '+/widget/video/widget-video.js',
                    '+/widget/video/widget-video-conf.js',
                    '+/widget/video/videoTypes/youtubeVideo.js',
                    '+/widget/video/videoTypes/dailymotionVideo.js',
                    '+/widget/canvas/widget-canvas.js',
                    '+/widget/canvas/widget-canvas-conf.js',
                    '+/widget/calendar/widget-calendar.js',
                    '+/widget/calendar/widget-calendar-conf.js',
                    '+/widget/googleMaps/widget-googleMaps.js',
                    '+/widget/googleMaps/widget-googleMaps-conf.js',
                    '+/widget/accordion/widget-accordion.js',
                    '+/widget/accordion/widget-accordion-conf.js',
                    '+/widget/calendar/js/datepicker.js',
                    '+/lib/tiny_mce/tiny_mce.js',
                ]
            },
            'mobile': {
                css: [
                    /* WAF */
                    '+/lib/jquery-ui/themes/base/jquery.ui.core.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.resizable.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.selectable.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.accordion.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.autocomplete.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.button.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.dialog.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.slider.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.tabs.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.datepicker.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.progressbar.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.theme.css',
                    '+/lib/selectbox/jquery-selectbox.css',
                    /* WAF WIDGET */
                    '+/widget/css/widget-mobile.css',
                    /* WAF list */
                    '+/widget/list/css/widget-list.css',
                    /* WAF popover */
                    '+/widget/popover/css/widget-popover.css',
                    /* WAF accordion */
                    '+/widget/accordion/css/widget-accordion.css',
                    /* WAF login */
                    '+/widget/login/css/widget-login.css',
                    /* Datepicker */
                    /* WAF GRID */
                    '+/widget/dataGrid/css/widget-dataGrid-mobile.css',
                    /* WAF AUTOFORM */
                    '+/widget/autoForm/css/widget-autoForm.css',
                    /* WAF CONTAINER */
                    '+/widget/container/css/widget-container.css',
                    /* WAF MATRIX */
                    '+/widget/matrix/css/widget-matrix.css',
                    /* WAF IMAGE */
                    '+/widget/image/css/widget-image.css',
                    /* WAF ICON */
                    '+/widget/icon/css/widget-icon.css',
                    /* WAF TEXTFIELD */
                    '+/widget/textField/css/widget-textField.css',
                    /* WAF BUTTON */
                    '+/widget/button/css/widget-button.css',
                    /* WAF BUTTON IMAGE */
                    '+/widget/buttonImage/css/widget-buttonImage.css',
                    /* WAF RICHTEXT */
                    '+/widget/richText/css/widget-richText.css',
                    /* WAF SLIDER */
                    '+/widget/slider/css/widget-slider.css',
                    /* WAF PROGRESS BAR */
                    '+/widget/progressBar/css/widget-progressBar.css',
                    /* WAF YAHOO WEATHER */
                    '+/widget/yahooWeather/css/widget-yahooWeather.css',
                    /* WAF Combobox */
                    '+/widget/combobox/css/widget-combobox.css',
                    /* WAF section  */
                    '+/widget/section/css/widget-section.css',
                    /* WAF select */
                    '+/widget/select/css/widget-select.css',
                    /* WAF Radio Group */
                    '+/widget/radiogroup/css/widget-radiogroup.css',
                    /* WAF Label */
                    '+/widget/label/css/widget-label.css',
                    /* WAF checkbox */
                    '+/widget/checkbox/css/widget-checkbox.css',
                    '+/widget/switchBox/css/widget-switchbox.css',
                    /* WAF splitView */
                    '+/widget/splitView/css/widget-splitView.css',
                    /* WAF menubar */
                    '+/widget/menubar/css/widget-menubar.css',
                    /* WAF menuitem */
                    '+/widget/menuitem/css/widget-menuitem.css',
                    /* WAF login */
                    '+/widget/login/css/widget-login.css',
                    /* WAF Component */
                    '+/widget/component/css/widget-component.css',
                    /* WAF Chart */
                    '+/widget/chart/css/widget-chart.css',
                    /* WAF FileUpload */
                    '+/widget/fileUpload/css/widget-fileUpload.css',
                    /* Error Div */
                    '+/widget/errorDiv/css/widget-errorDiv.css',
                    /* WAF tabview */
                    '+/widget/tabview/css/widget-tabview.css',
                    /* WAF navigationView */
                    '+/widget/navigationView/css/widget-navigationView.css',
                    /* WAF tabview */
                    '+/widget/tabview/css/widget-tabview.css',
                    /* WAF dialog */
                    '+/widget/dialog/css/widget-dialog.css',
                    /* WAF WYSIWYG Editor */
                    '+/widget/tinymce/css/widget-tinymce.css',
                    /* WAF Calendar Picker */
                    '+/widget/calendar/css/widget-calendar.css',
                    '+/widget/calendar/css/datepicker.css',
                    /* WAF Frame */
                    '+/widget/frame/css/widget-frame.css',
                    /* WAF Video */
                    '+/widget/video/css/widget-video.css',
                    /* WAF Canvas */
                    '+/widget/canvas/css/widget-canvas.css',
                    /* WAF beautytips */
                    '+/lib/beautytips/beautytips.css',
                    /* WAF mobiscroll */
                    '+/lib/mobile/mobiscroll/css/mobiscroll-1.5.3.min.css',
                    /* themes */
                    '+/themes/cupertinoIpad.css',
                    '+/themes/cupertino.css',
                    //'+/themes/androidHoloDark.css'
                ],
                require: [
                    /* NEW ARCHI */
                    /* jQuery */
                    '+/lib/jquery/jquery.min.js',
                    /* Hammer */
                    '+/lib/hammer/jquery.hammer.min.js',                    
                    '+/waf-core/core.js',
                    '+/waf-core/class.js',
                    '+/waf-core/error.js',
                    '+/waf-core/event.js',
                    '+/waf-core/behavior.js',
                    '+/waf-behavior/methodshelper.js',
                    '+/waf-core/subscriber.js',
                    '+/waf-behavior/observable.js',
                    '+/Core/Native/Rest.js',
                    '+/Core/Utils/Timers.js',
                    '+/Core/Utils/DebugTools.js',
                    '+/Core/Utils/Environment.js',
                    '+/Core/Utils/Strings.js',
                    '+/Core/Utils/Dates.js',
                    '+/DataProvider/Data-Provider.js',
                    '+/DataSource/Data-Source.js',
                    '+/DataSource/Selection.js',
                    '+/DataSource/ErrorHandling.js',
                    '+/rpc/Rpc.js',
                    '+/Tags/taglib.js',
                    '+/Tags/tags.js',
                    '+/lib/jquery-ui/jquery-ui.min.js',
                    '+/lib/jquery-ui/jquery-ui-i18n.js',
                    /* External Librairy */
                    '+/lib/raphael/raphael-min.js',
                    '+/lib/graphael/g.raphael-min.js',
                    '+/lib/graphael/g.line-min.js',
                    '+/lib/graphael/g.bar-min.js',
                    '+/lib/graphael/g.pie-min.js',
                    '+/lib/jquery.svg/jquery.svg.min.js',
                    '+/lib/selectbox/jquery-selectbox.js',
                    '+/lib/combobox/jquery-combobox.js',
                    '+/lib/beautytips/beautytips.js',
                    /* jQuery svg*/
                    '+/lib/jquery.svg/jquery.svg.min.js',
                    /* widgets */
                    '+/widget/widget.js',
                    '+/widget/list/widget-list.js',
                    '+/widget/list/widget-list-conf.js',
                    '+/widget/popover/widget-popover.js',
                    '+/widget/popover/widget-popover-conf.js',
                    '+/widget/icon/widget-icon.js',
                    '+/widget/icon/widget-icon-conf.js',
                    '+/widget/button/widget-button.js',
                    '+/widget/button/widget-button-conf.js',
                    '+/widget/buttonImage/widget-buttonImage.js',
                    '+/widget/buttonImage/widget-buttonImage-conf.js',
                    '+/widget/checkbox/widget-checkbox.js',
                    '+/widget/checkbox/widget-checkbox-conf.js',
                    '+/widget/switchBox/widget-switchbox.js',
                    '+/widget/switchBox/widget-switchbox-conf.js',
                    '+/widget/container/widget-container.js',
                    '+/widget/container/widget-container-conf.js',
                    '+/widget/richText/widget-richText.js',
                    '+/widget/richText/widget-richText-conf.js',
                    '+/widget/errorDiv/widget-errorDiv.js',
                    '+/widget/errorDiv/widget-errorDiv-conf.js',
                    '+/widget/dataGrid/widget-dataGrid.js',
                    '+/widget/dataGrid/widget-dataGrid-conf.js',
                    '+/widget/autoForm/widget-autoForm.js',
                    '+/widget/autoForm/widget-autoForm-conf.js',
                    '+/widget/queryForm/widget-queryForm.js',
                    '+/widget/queryForm/widget-queryForm-conf.js',
                    '+/widget/image/widget-image.js',
                    '+/widget/image/widget-image-conf.js',
                    '+/widget/label/widget-label.js',
                    '+/widget/label/widget-label-conf.js',
                    '+/widget/slider/widget-slider.js',
                    '+/widget/slider/widget-slider-conf.js',
                    '+/widget/textField/widget-textField.js',
                    '+/widget/textField/widget-textField-conf.js',
                    '+/widget/yahooWeather/widget-yahooWeather.js',
                    '+/widget/yahooWeather/widget-yahooWeather-conf.js',
                    '+/widget/progressBar/widget-progressBar.js',
                    '+/widget/progressBar/widget-progressBar-conf.js',
                    '+/widget/matrix/widget-matrix.js',
                    '+/widget/matrix/widget-matrix-conf.js',
                    '+/widget/toolbar/widget-toolbar.js',
                    '+/widget/combobox/widget-combobox.js',
                    '+/widget/combobox/widget-combobox-conf.js',
                    '+/widget/select/widget-select.js',
                    '+/widget/select/widget-select-conf.js',
                    '+/widget/radiogroup/widget-radiogroup.js',
                    '+/widget/radiogroup/widget-radiogroup-conf.js',
                    '+/widget/menubar/widget-menubar.js',
                    '+/widget/menubar/widget-menubar-conf.js',
                    '+/widget/menuitem/widget-menuitem.js',
                    '+/widget/menuitem/widget-menuitem-conf.js',
                    '+/widget/login/widget-login.js',
                    '+/widget/login/widget-login-conf.js',
                    '+/widget/chart/widget-chart-conf.js',
                    '+/widget/chart/widget-chart.js',
                    '+/widget/fileUpload/widget-fileUpload-conf.js',
                    '+/widget/fileUpload/widget-fileUpload.js',
                    '+/widget/navigationView/widget-navigationView.js',
                    '+/widget/navigationView/widget-navigationView-conf.js',
                    '+/widget/tabview/widget-tabview.js',
                    '+/widget/tabview/widget-tabview-conf.js',
                    '+/widget/dialog/widget-dialog.js',
                    '+/widget/dialog/widget-dialog-conf.js',
                    '+/widget/tinymce/widget-tinymce.js',
                    '+/widget/tinymce/widget-tinymce-conf.js',
                    '+/widget/frame/widget-frame.js',
                    '+/widget/frame/widget-frame-conf.js',
                    '+/widget/video/widget-video.js',
                    '+/widget/video/widget-video-conf.js',
                    '+/widget/video/videoTypes/youtubeVideo.js',
                    '+/widget/video/videoTypes/dailymotionVideo.js',
                    '+/widget/canvas/widget-canvas.js',
                    '+/widget/canvas/widget-canvas-conf.js',
                    '+/widget/login/widget-login.js',
                    '+/widget/login/widget-login-conf.js',
                    '+/widget/splitView/widget-splitView.js',
                    '+/widget/splitView/widget-splitView-conf.js',
                    '+/widget/calendar/widget-calendar.js',
                    '+/widget/calendar/widget-calendar-conf.js',
                    '+/widget/calendar/js/datepicker.js',
                    '+/widget/googleMaps/widget-googleMaps.js',
                    '+/widget/googleMaps/widget-googleMaps-conf.js',
                    '+/widget/accordion/widget-accordion.js',
                    '+/widget/accordion/widget-accordion-conf.js',
                    '+/widget/section/widget-section-conf.js',
                    '+/widget/section/widget-section.js',
                    '+/widget/sectionNavigation/widget-sectionNavigation-conf.js',
                    '+/widget/sectionNavigation/widget-sectionNavigation.js',
                    /* mobile */
                    '+/lib/mobile/iscroll/iscroll-lite.js',
                    '+/lib/mobile/jquery.ui.ipad.altfix.js',
                    '+/lib/mobile/mobiscroll/js/mobiscroll-1.5.3.min.js',
                    '+/waf-core/core.js',
                    '+/waf-core/class.js',
                    '+/waf-core/error.js',
                    '+/waf-core/event.js',
                    '+/waf-core/behavior.js',
                    '+/waf-behavior/methodshelper.js',
                    '+/waf-core/subscriber.js',
                    '+/waf-behavior/observable.js',
                ]
            },
            'reporting': {
                css: [
                    /* WAF */
                    '+/lib/jquery-ui/themes/base/jquery.ui.core.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.resizable.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.selectable.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.accordion.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.autocomplete.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.button.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.dialog.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.slider.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.tabs.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.datepicker.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.progressbar.css',
                    '+/lib/jquery-ui/themes/base/jquery.ui.theme.css',
                    '+/lib/selectbox/jquery-selectbox.css',
                    /* WAF WIDGET */
                    '+/widget/css/widget.css',
                    '+/widget/skin/default/css/widget-skin-default.css',
                    '+/widget/skin/metal/css/widget-skin-metal.css',
                    '+/widget/skin/light/css/widget-skin-light.css',
                    '+/widget/skin/cupertino/css/widget-skin-cupertino.css',
                    /* WAF RICHTEXT */
                    '+/report/richText/css/widget-richText.css'
                ],
                require: [
                    /* WAF */
                    '+/Core/Native/Rest.js',
                    '+/Core/Utils/Timers.js',
                    '+/Core/Utils/DebugTools.js',
                    '+/Core/Utils/Environment.js',
                    '+/Core/Utils/Strings.js',
                    '+/Core/Utils/Dates.js',
                    '+/DataProvider/Data-Provider.js',
                    '+/DataSource/Data-Source.js',
                    '+/DataSource/Selection.js',
                    '+/DataSource/ErrorHandling.js',
                    '+/rpc/Rpc.js',
                    '+/Tags/taglib.js',
                    '+/Tags/tags.js',
                    /* jQuery */
                    '+/lib/jquery/jquery.min.js',
                    /* jQuery svg*/
                    '+/lib/jquery.svg/jquery.svg.min.js',
                    /* External Librairy */
                    '+/lib/raphael/raphael-min.js',
                    '+/lib/graphael/g.raphael-min.js',
                    '+/lib/graphael/g.line-min.js',
                    '+/lib/graphael/g.bar-min.js',
                    '+/lib/graphael/g.pie-min.js',
                    '+/lib/jquery-ui/jquery-ui.min.js',
                    '+/lib/jquery-ui/jquery-ui-i18n.js',
                    '+/lib/selectbox/jquery-selectbox.js',
                    '+/lib/combobox/jquery-combobox.js',
                    '+/lib/beautytips/beautytips.js',
                    /* Notify */
                    '+/lib/notify/jquery.notify.js',
                    /* widgets */
                    '+/widget/widget.js',
                    '+/report/richText/widget-richText.js',
                    '+/report/richText/widget-richText-conf.js'
                ]
            }
        },
        /**
         * The constants of the framework
         *
         * @static
         * @property constants
         * @type Object
         **/
        constants: {},
        /**
         * The classes of the framework
         *
         * @static
         * @property classes
         * @type Object
         **/
        classes: {},
        /**
         * utils
         *
         * @static
         * @property utils
         * @type Object
         **/
        utils: {
            debug: {
                console: {
                    log: function(string) {
                    }
                }
            },
            ucFirst: function(str) {
                var f;
                f = str.charAt(0).toUpperCase();
                return f + str.substr(1);
            }
        },
        /**
         * core
         *
         * @static
         * @property core
         * @type Object
         **/
        core: {},
        /**
         * dataStore
         *
         * @static
         * @property core
         * @type WAF.dataProviderFactory|Null
         **/
        ds: null,
        /**
         * _private
         *
         * @static
         * @private
         * @property _private
         * @type Object
         **/
        _private: {
            globals: {
                modulesToLoad: {}
            },
            catalogLoaded: false,
            functions: {},
            handlers: {},
            status: 'init',
            onInit: []
        },
        /**
         * widgets
         *
         * @static
         * @property widgets
         * @type Object
         **/
        widgets: {},
        /**
         * custom widgets
         *
         * @static
         * @property customWidgets
         * @type Object
         **/
        customWidgets: {},
        /**
         * custom widgets
         *
         * @static
         * @property customWAFWidgets
         * @type Object
         **/
        customWAFWidgets: {},
        /**
         * components definition
         *
         * @static
         * @property components
         * @type Object
         **/
        components: {
        },
        /**
         * components core class
         *
         * @static
         * @property component
         * @type Object
         **/
        component: {
        },
        /**
         * cache of web components
         *
         * @static
         * @property webcomponents
         * @type Object
         **/
        webcomponents: {},
        /**
         * cache of web components
         *
         * @static
         * @property statuswebcomponents
         * @type Object
         **/
        statuswebcomponents: {},
        /**
         * widget
         *
         * @static
         * @property widget
         * @type Object
         **/
        widget: {
            themes: {
                'default': {
                    key: 'default',
                    value: 'Default',
                    mobile: "false"
                },
                'lilac': {
                    key: 'lilac',
                    value: 'Lilac',
                    mobile: "false"
                },
                metal: {
                    key: 'metal',
                    value: 'Metal',
                    mobile: "false"
                },
                light: {
                    key: 'light',
                    value: 'Light',
                    mobile: "false"
                },
                cupertino: {
                    key: 'cupertino',
                    value: 'Cupertino',
                    mobile: "true"
                },
                cupertinoIpad: {
                    key: 'cupertinoIpad',
                    value: 'Cupertino iPad',
                    mobile: "true"
                },
                softGray: {
                    key: 'softGray',
                    value: 'Soft Gray',
                    mobile: "false"
                }
            }
        },
        customWidget: {},
        /**
         * forms
         *
         * @static
         * @property forms
         * @type Object
         **/
        forms: {},
        /**
         * source
         *
         * @static
         * @property source
         * @type Object
         **/
        source: {},
        /**
         * event
         *
         * @static
         * @property events
         * @type Object
         **/
        events: {},
        // deferred that will be resolved once afterInit has been called (and user scripts have been executed)
        // this ensures WAF.addEventListener have been called
        onAllScriptsLoaded: null
    };
    if (WAF.config.packageMode) {
        WAF.modulesInfo = {
            'allmodules': {}
        };
    }
    // aliases
    WAF.sources = WAF.source;
    source = WAF.source;
    sources = WAF.source;
    waf = WAF;

    /**
     * get the value of the parameter
     *
     * @static
     * @method getUrlValue
     * @param {String} name parameter name
     * @return {String} value of the param
     */
    WAF.getUrlValue = function(name) {
        var regexS = '',
        regex = '',
        results = '';

        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        regexS = "[\\?&]" + name + "=([^&#]*)";
        regex = new RegExp(regexS);
        results = regex.exec(window.location.href);
        if (results == null) {
            return '';
        } else {
            return results[1];
        }
    };

    /**
     * on after init
     *
     * @static
     * @event onAfterInit
     */
    Object.defineProperty(
    WAF,
    'onAfterInit',
    {
        get: function() {
            return function onAfterInit() {
                var length = WAF._private.onInit.length,
                i = 0;
                for (i = 0; i < length; i++) {
                    WAF._private.onInit[i]();
                }
            }
        },
        set: function(value) {
            WAF._private.onInit.push(value);
        }
    });

    /**
     * on ready
     * @static
     * @method onReady
     */
    WAF.onReady = function() {
        if (WAF._private.status !== 'ready') {
            WAF.utils.init();

            if (typeof jQuery !== 'undefined') {
                WAF.applyTheme();
            }

            // compatibility
            WAF.widget.ComponentPlaceHolder = WAF.widget.Component;

            WAF.onAfterInit();
            if (typeof jQuery !== 'undefined') {
                WAF.onAllScriptsLoaded.resolve();
            }

            // set status
            WAF._private.status = 'ready';
        }
    };

    WAF.applyTheme = function() {
        var body = $("body"),
        theme = body.attr("data-theme");

        if (theme) {
            WAF.pageTheme = theme;
            body.addClass(theme);
        }
    };

    /**
     * <p>Create a namespace</p>
     *
     * @static
     * @method namespace
     * @param {String} namespace namespace to create
     * @return {Object}
     */
    WAF.namespace = function(namespace) {
        var tabNameSpace = [],
        i = 0,
        container = window;

        tabNameSpace = namespace.split('.');

        for (i = 0; i < tabNameSpace.length; i++) {
            container[tabNameSpace[i]] = container[tabNameSpace[i]] || {};
            container = container[tabNameSpace[i]];
        }

        return container;
    };

    /**
     * Create a listener
     *
     * @static
     * @method addListener
     * @param {String} obj object wher to apply the event
     * @param {String} event event to create
     * @param {Function} callback callback
     * @param {String} lib namespace to create
     * @param {String} option option to pass
     */
    WAF.addListener = function(obj, event, callback, lib, option) {
        var ref = {},
        objtemp = null,
        params = {},
        eventName = '';

        lib = lib || 'waf';
        lib = lib.toLowerCase();

        if (typeof callback === 'undefined') {
            return false;
        }

        if (typeof (obj) == 'string') {
            objtemp = WAF.widgets[obj];
            if (typeof (objtemp) == 'undefined') {
            } else {
                obj = objtemp;
            }
        }

        // new archi
        if (obj && obj.subscribe) {
            obj.subscribe(event, callback);
            return true;
        }

        // keep events into WAF.events
        // remove leading "on..." if any (eg. onLoad would become load)
        eventName = event.replace(/^on/, '');

        // change scope of the callback
        function changeScope(scope, fn) {
            return function() {
                var undefVar;
                return fn ? fn.apply(scope, arguments) : undefVar;
            };
        }

        if (obj.id) {
            if (!WAF.events[obj.id]) {
                WAF.events[obj.id] = [];
            }
            WAF.events[obj.id].push({
                name: (event == 'onResize' || event == 'startResize' || event == 'stopResize') ? event : eventName,
                fn: callback
            });

            callback = changeScope($$(obj.id), callback);
            if (event == 'onReady' && obj.addListener) {
                obj.addListener(event, callback);
            }
        }

        if (event == 'onResize' || event == 'startResize' || event == 'stopResize') {

        } else {
            switch (lib.toLowerCase()) {
                case 'yui':
                    obj.subscribe(event, callback);
                    break;
                case 'extjs':
                    obj.on(event, callback);
                    break;
                case 'jquery':
                    $.listen(event, obj, callback);
                    break;
                case 'waf':
                    if (obj.kind) { // check for dataSource
                        switch (obj.kind) {
                            case 'slider':
                                $("#" + obj.renderId).bind(event, {}, function(e, ui) {
                                    if (e && e.data && ui) {
                                        e.data.value = ui.value;
                                        e.data.values = ui.values;
                                    }

                                    this._callbackEvent = callback;
                                    this._callbackEvent(e);
                                });
                                break;
                            case 'googleMaps':
                                $(obj).bind(event, callback);
                                break;
                            case 'dataGrid':
                                ref = obj.gridController;
                                ref[event] = callback;
                                break;
                            case 'chart' :
                            case 'fileUpload':
                            case 'wysiwyg':
                            case 'calendar' :
                                if (!/^on/i.test(event)) {
                                    obj.$domNode.bind(event, callback);
                                }
                                obj.events = obj.events || {};
                                obj.events[event] = callback;
                                break;
                            case 'frame':
                                $(obj).bind(event, callback);
                                break
                            case 'login':
                                obj['on' + event] = callback;
                                break;
                            case 'combobox':
                                    switch (event) {
                                        case 'change':
                                            break;
                                        case 'focus':
                                        case 'blur':
                                            $("#" + obj.renderId + ' input').live(event, callback);
                                            break;
                                        default:
                                            $('#' + obj.renderId).live(event.replace(/^on/, ''), callback);
                                            break;
                                    }
                                break;
                            case 'radioGroup' :
                                var radioItm = $("#" + obj.renderId).find('input[type=radio]');
                                radioItm.live(event.replace(/^on/, ''), callback);
                                break;
                            case 'select':
                                $("#" + obj.renderId).children('select').bind(event, callback);
                                break;
                            case 'button':
                            case 'container':
                            case 'checkbox':
                            case 'displayText':
                            case 'errorDiv':
                            case 'image':
                            case 'list':
                            default :
                                var evt = event.replace(/^on/, '');
                                try {
                                    if (obj.kind === 'matrix' && event === 'onChildrenDraw') {
                                        obj.realDrawEvent = callback;
                                    } else {
                                        obj.$domNode.on(evt, callback);
                                        if (obj.isDisabled()) {

                                            obj._tmpEvents = obj._tmpEvents || [];
                                            obj._tmpEvents.push({
                                                type: evt,
                                                handler: callback
                                            });
                                            obj.$domNode.off(evt);
                                        }
                                    }
                                } catch (e) {
                                }
                                break;
                        }
                    } else {
                        // dataSource
                        if (WAF.source[obj]) {
                            params = {};
                            if (option) {
                                params.attributeName = option;
                                event = 'onAttributeChange';
                            }
                            else if (event == 'onAttributeChange')
                            {
                                params.attributeName = obj;
                            }
                            callback = changeScope(WAF.source[obj], callback);
                            WAF.source[obj].addListener(event, callback, params);
                        } else {
                            // Onload for body or onorientationchange for window
                            if (event == 'onorientationchange') {
                                callback = changeScope(document, callback);
                                window.onorientationchange = callback;
                            } else if (event == 'onLoad') {
                                callback = changeScope(document, callback);
                                $(document).ready(callback)
                            } else if (document.getElementById(obj)) {
                                if (document.getElementById(obj).addEventListener) {
                                    document.getElementById(obj).addEventListener(event.replace(/^on/, ''), callback, false);
                                } else if (document.getElementById(obj).attachEvent) {
                                    document.getElementById(obj).attachEvent('on' + event.replace(/^on/, ''), callback);
                                }
                            }
                        }
                    }
                    break;
                default:
                    try {
                        if (document.getElementById(obj).addEventListener) {
                            document.getElementById(obj).addEventListener(event.replace(/^on/, ''), callback, false);
                        } else if (document.getElementById(obj).attachEvent) {
                            document.getElementById(obj).attachEvent('on' + event.replace(/^on/, ''), callback);
                        }
                    } catch (e) {

                    }
            }
        }
    };

    /**
     * Open a Dialog System
     * @method openDialog
     * @param {JSON} config configuration of a dialog system
     */
    WAF.openDialog = function(config) {
        var
        id,
        dialog,
        render,
        linkedTags,
        defaultConf;

        defaultConf = {
            left: 0,
            top: 0,
            height: 240,
            width: 500,
            minHeight: 0,
            minWidth: 0,
            maxHeight: -1,
            maxWidth: -1,
            draggable: false,
            resizable: false,
            autoOpen: true,
            modal: false
        }

        config = $.extend(true, defaultConf, config);

        function getUuidlet() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        function getNewID() {
            var
            id,
            tag;

            while (typeof tag == 'undefined' || tag.length > 0) {
                id = 'dialog' + getUuidlet();
                tag = $('#' + id);
            }

            return id;
        }

        id = getNewID();

        linkedTags = [
            id + '_titlebar',
            id + '_icon',
            id + '_minimize',
            id + '_maximize',
            id + '_close',
            id + '_content',
            id + '_toolbar',
            id + '_title'
        ];

        render = $('<div>');
        render.attr({
            'id': id,
            'class': 'waf-widget waf-dialog default inherited',
            'data-theme': 'metal inherited',
            'data-linked-tag': linkedTags.join(),
            'data-maxheight': config.maxHeight,
            'data-minheight': config.minHeight,
            'data-maxwidth': config.maxWidth,
            'data-minwidth': config.minWidth,
            'data-autoopen': !config.autoOpen,
            'data-modal': config.modal
        });

        render.css({
            width: config.width,
            height: config.height,
            left: config.left,
            top: config.top,
            position: 'absolute'
        });

        render.appendTo($('body'));

        dialog = new WAF.widget.Dialog({
            'id': id,
            'class': 'waf-widget waf-dialog default inherited',
            'data-theme': 'metal inherited',
            'data-linked-tag': linkedTags.join(),
            'data-maxHeight': config.maxHeight,
            'data-minHeight': config.minHeight,
            'data-maxWidth': config.maxWidth,
            'data-minWidth': config.minWidth,
            'data-resizable': config.resizable + '',
            'data-draggable': config.draggable + '',
            'data-autoopen': !config.autoOpen + '',
            'data-modal': config.modal + ''
        });

        dialog._createNew(config);

        return dialog;
    };

    /**
     * Add a new widget into WAF
     * @method addWidget
     * @param {JSON} config configuration of a widget
     */
    WAF.addWidget = function(config) {
        config = config || {};

        if (config.lib) {
            if (typeof WAF.config.widget[config.lib] === 'undefined') {
                WAF.config.widget[config.lib] = {};
            }
            WAF.config.widget[config.lib][config.type] = config;
        } else {
            WAF.config.widget['WAF'][config.type] = config;
        }

        WAF.config.taglib.push(config);
    };


    /**
     * Loader
     *
     * @class WAF.loader
     */
    WAF.loader = {
        simplePath: {},
        /**
         * scripts to load
         *
         * @static
         * @property scriptToLoad
         * @type Array
         */
        scriptToLoad: [],
        scriptSupToLoad: [],
        /**
         * css to load
         *
         * @static
         * @property styleToLoad
         * @type Array
         */
        styleToLoad: [],
        styleSupToLoad: [],
        /**
         * manage the components loading
         *
         * @static
         * @property componentsManager
         * @type object
         */
        componentsManager: {
            _components: 0,
            init: function() {
                WAF.loader.componentsManager._components = 0;
            },
            add: function() {
                WAF.loader.componentsManager._components++;
            },
            remove: function(callback) {
                WAF.loader.componentsManager._components--;
                callback();
            },
            hasComponent: function() {
                return !(WAF.loader.componentsManager._components == 0);
            }
        },
        /**
         * manage the rpc file loading
         *
         * @static
         * @property rpcFileManager
         * @type object
         */
        rpcFileManager: {
            _files: 0,
            init: function() {
                WAF.loader.rpcFileManager._files = 0;
            },
            add: function() {
                WAF.loader.rpcFileManager._files++;
            },
            remove: function(callback) {
                WAF.loader.rpcFileManager._files--;
                callback();
            },
            hasRpcFile: function() {
                return !(WAF.loader.rpcFileManager._files == 0);
            }
        },
        /**
         * init the loading of required files
         *
         * @static
         * @method loadModules
         * @param {String} moduleName name of the module to load
         */
        loadModules: function(moduleName) {
            var i = 0,
            supCSS = [],
            allAtOnce = false,
            style = '',
            styles = [],
            nbstyles = 0,
            fullCSSList = [],
            pattern = WAF.config.pattern,
            xhref = '',
            path = '',
            fullJSList = '',
            supJS = [];

            if (WAF.modulesInfo[moduleName]) {

                // init
                WAF.loader.scriptToLoad = WAF.modulesInfo[moduleName].require;
                WAF.loader.styleToLoad = WAF.modulesInfo[moduleName].css;

                supCSS = WAF.config.loadCSS;
                for (i = 0; i < supCSS.length; i++) {
                    WAF.loader.styleSupToLoad.push(supCSS[i]);
                }

                supJS = WAF.config.loadJS;
                for (i = 0; i < supJS.length; i++) {
                    WAF.loader.scriptSupToLoad.push(supJS[i]);
                }

                // load
                if (WAF.config.load) {
                    WAF.loader.scriptSupToLoad.push(WAF.config.load);
                }

                if (WAF.getUrlValue('debug') !== '1') {
                    allAtOnce = true;
                    WAF.loader.simplePath = {};

                    styles = WAF.loader.styleToLoad;
                    WAF.loader.styleToLoad = [];
                    nbstyles = styles.length;
                    for (i = 0; i < nbstyles; i++) {
                        style = styles[i];
                        fullCSSList.push(style);
                    }
                    if (fullCSSList.length > 0)
                    {
                        fullCSSList = fullCSSList.join(',');
                        xhref = window.location.href.split('/').join('\\');
                        path = "/waf-optimize?files='" + fullCSSList + "'";
                        if (pattern != null) {
                            path = '/' + pattern + path;
                        }
                        WAF.loader.styleToLoad.push(path);
                    }
                    WAF.loader.simplePath[path] = true;

                    fullJSList = WAF.loader.scriptToLoad.join(',');
                    path = "/waf-optimize?files='" + fullJSList + "'";
                    if (pattern != null) {
                        path = '/' + pattern + path;
                    }
                    WAF.loader.scriptToLoad = [path];
                    WAF.loader.simplePath[path] = true;
                } else {
                    // get non minify jquery
                    WAF.loader.scriptToLoad = WAF.loader.scriptToLoad.join('@@@').replace('jquery.min.js', 'jquery.js').split('@@@');
                }

                if (WAF.loader.styleToLoad.length > 0 || WAF.loader.styleSupToLoad.length > 0) {
                    WAF.loader.loadStyles(allAtOnce);
                }
                if (WAF.loader.scriptToLoad.length > 0 || WAF.loader.scriptSupToLoad.length > 0) {
                    WAF.loader.loadScripts(allAtOnce);
                }
            } else {
                // if module unknow, we load only user script
                if (WAF.config.load) {
                    WAF.loader.scriptSupToLoad.push(WAF.config.load);
                    WAF.loader.loadScripts();
                }
                if (WAF.config.packageMode) {
                    var supCSS = WAF.config.loadCSS;
                    if (supCSS.length > 0) {
                        for (var i = 0, supLen = supCSS.length; i < supLen; i++) {
                            WAF.loader.styleSupToLoad.push(supCSS[i]);
                        }
                        WAF.loader.loadStyles(true);
                    }
                    var supJS = WAF.config.loadJS;
                    if (supJS.length > 0) {
                        for (var i = 0, supLen = supJS.length; i < supLen; i++) {
                            WAF.loader.scriptSupToLoad.push(supJS[i]);
                        }
                        WAF.loader.loadScripts(true);
                    }
                }
            }
        },
        /**
         * Load script
         *
         * @static
         * @method loadScripts
         */
        loadScripts: function(allAtOnce) {
            var path;

            if (WAF.loader.scriptToLoad.length > 0)
                path = WAF.loader.scriptToLoad[0];
            else
                path = WAF.loader.scriptSupToLoad[0];
            var head = null,
            script = null,
            loadHandler = null,
            compManager = WAF.loader.componentsManager,
            rpcFileManager = WAF.loader.rpcFileManager;

            // case of jQuery is already defined
            if (typeof jQuery != 'undefined' && path.indexOf('jquery.js') != -1) {
                WAF.loader.scriptToLoad = WAF.loader.scriptToLoad.slice(1);
                if (WAF.loader.scriptToLoad.length > 0 || WAF.loader.scriptSupToLoad.length > 0) {
                    WAF.loader.loadScripts();
                }
            } else {
                head = document.getElementsByTagName('head')[0];
                script = document.createElement('script');
                script.type = 'text/javascript';
                if (!WAF.config.packageMode) {
                    // WAF modules
                    if (path[0] == '+' && !allAtOnce) {
                        script.src = WAF.config.baseURL + path.slice(1);
                    } else {
                        script.src = path;
                    }
                }

                loadHandler = function(event) {

                    if (WAF.loader.waitForStyleLoading != null)
                    {
                        window.setTimeout(loadHandler, 100);
                    }
                    else
                    {
                        //console.log("scripts ready");
                        if (WAF.loader.scriptToLoad.length > 0)
                            WAF.loader.scriptToLoad = WAF.loader.scriptToLoad.slice(1);
                        else
                            WAF.loader.scriptSupToLoad = WAF.loader.scriptSupToLoad.slice(1);

                        if (WAF.loader.scriptToLoad.length > 0 || WAF.loader.scriptSupToLoad.length > 0) {
                            WAF.loader.loadScripts();
                        } else { // all scripts loaded
                            if (typeof jQuery !== 'undefined') {
                                WAF.onAllScriptsLoaded = new $.Deferred();
                            }

                            var onCatalogLoad = function(event) {
                                var length = 0,
                                i = 0,
                                j = 0,
                                desc = {},
                                nbComponents = 0,
                                component = null,
                                components = [];

                                if (!WAF._private.catalogLoaded) {
                                    if (event && event.error != null) {
                                        WAF.ds = null;
                                    }
                                    ds = WAF.ds; // ds is a global variable and an alias to the dataStore
                                }

                                if (typeof (WAF.tags) !== 'undefined') {

                                    // check if components need to be loaded
                                    components = $('[data-type=component]');
                                    nbComponents = components.length;
                                    if (components.length > 0) {
                                        compManager.init();
                                        for (j = 0; j < nbComponents; j++) {
                                            component = components[j];

                                            // check if we need to load
                                            if (component.getAttribute('data-start-load') == null || component.getAttribute('data-start-load') == 'true') {

                                                // check if we have a valid path
                                                if (component.getAttribute('data-path') != null && component.getAttribute('data-path') != '') {
                                                    compManager.add();
                                                }
                                            }
                                        }
                                    }

                                    if (!WAF._private.catalogLoaded) {
                                        WAF.tags.createView();
                                    }

                                    // show body
                                    document.body.style.display = 'block';
                                    document.body.style.visibility = 'visible';
                                }

                                WAF._private.catalogLoaded = true;

                                /*
                                 * Trigger on ready event on WAF : usefull for widgets events
                                 */
                                if (WAF.tags != null && typeof $ !== 'undefined') {
                                    $(WAF).trigger('onWAFReady');
                                }

                                if (!compManager.hasComponent() && !rpcFileManager.hasRpcFile()) {
                                    WAF.onReady();
                                }

                            }

                            if (WAF.DataStore != null && !WAF._private.catalogLoaded) {
                                var catalog = null; // all by default
                                if (WAF.config.catalog != null) {
                                    catalog = WAF.config.catalog;
                                }
                                if (catalog == '*') {
                                    catalog = null;
                                }
                                if (catalog == '') {
                                    catalog = ' ';
                                }
                                WAF.ds = new WAF.DataStore({
                                    onSuccess: onCatalogLoad,
                                    onError: onCatalogLoad,
                                    catalog: catalog
                                });
                            }
                        }
                    }
                };


                if (script.addEventListener) {
                    script.addEventListener('load', loadHandler, false);
                } else {
                    script.onreadystatechange = function() {
                        if (this.readyState === 'complete' || this.readyState === 'loaded') {
                            loadHandler();
                        }
                    }
                    if (WAF.config.packageMode) {
                        // WAF modules
                        if (path[0] == '+' && !allAtOnce) {
                            script.src = WAF.config.baseURL + path.slice(1);
                        } else {
                            script.src = path;
                        }
                    }
                }

                head.appendChild(script);
            }
        },
        /**
         * Load rpc files
         *
         * @static
         * @method loadRpcFile
         * @param {array}
         */
        loadRpcFile: function(rpcFiles) {
            var src = '',
            i = 0,
            length = rpcFiles.length,
            rpcFile = null,
            head = null,
            script = null,
            loadHandler = null,
            compManager = WAF.loader.componentsManager,
            rpcFileManager = WAF.loader.rpcFileManager;

            head = document.getElementsByTagName('head')[0];

            for (i = 0; i < length; i++) {

                rpcFile = rpcFiles[i];

                script = document.createElement('script');
                script.type = 'text/javascript';
                if (!WAF.config.packageMode) {
                    script.src = rpcFile.replace('//', '/');
                }

                loadHandler = function(event) {
                    rpcFileManager.remove(
                    function() {
                        if (!rpcFileManager.hasRpcFile() && !compManager.hasComponent() && WAF._private.catalogLoaded) {
                            WAF.onReady();
                        }
                    });

                };

                if (script.addEventListener) {
                    script.addEventListener('load', loadHandler, false);
                    script.addEventListener('error', loadHandler, false);
                } else {
                    script.onreadystatechange = function() {
                        if (this.readyState === 'complete' || this.readyState === 'loaded') {
                            loadHandler();
                        }
                    }
                    if (WAF.config.packageMode) {
                        script.src = rpcFile.replace('//', '/');
                    }
                }

                head.appendChild(script);
            }

        },
        /**
         * Load style
         *
         * @static
         * @method loadStyles
         */
        loadStyles: function(allAtOnce) {
            var path = '',
            head = null,
            link = null,
            wafCss = null,
            req = null;

            if (WAF.loader.styleToLoad.length > 0 || WAF.loader.styleSupToLoad.length > 0) {
                if (WAF.loader.styleToLoad.length > 0)
                {
                    path = WAF.loader.styleToLoad[0];
                    WAF.loader.styleToLoad = WAF.loader.styleToLoad.slice(1);
                }
                else
                {
                    path = WAF.loader.styleSupToLoad[0];
                    WAF.loader.styleSupToLoad = WAF.loader.styleSupToLoad.slice(1);
                }

                head = document.getElementsByTagName('head')[0];
                link = document.createElement('link');
                link.type = 'text/css';
                link.rel = 'stylesheet';

                if (path[0] == '+' && !allAtOnce) {
                    link.href = WAF.config.baseURL + path.slice(1);
                } else {
                    link.href = path;
                }

                wafCss = document.getElementById('waf-interface-css');
                var ie = false;
                if (waf.PLATFORM != null && waf.PLATFORM.browser != null && waf.PLATFORM.browser.toLowerCase() === "msie")
                    ie = true;

                if (wafCss) {
                    // check for url limitation on IE9
                    if (link.href.length > 4000 && ie) {
                        req = new XMLHttpRequest();
                        req.open('POST', link.href, false);
                        WAF.loader.waitForStyleLoading = true;
                        req.onreadystatechange = function(evt) {
                            if (req.readyState == 4) {
                                if (req.status == 200) {
                                    var style = document.createElement('style');
                                    style.setAttribute('id', 'waf-page');
                                    if (style.styleSheet) {
                                        style.type = 'text/css';
                                        style.styleSheet.cssText = req.responseText;
                                    } else {
                                        style.innerHTML = req.responseText;
                                    }
                                    wafCss.parentNode.insertBefore(style, wafCss);
                                    WAF.loader.waitForStyleLoading = null;
                                }
                            }
                        };

                        req.send(null);
                    } else {
                        wafCss.parentNode.insertBefore(link, wafCss);
                    }

                } else {
                    // check for url limitation on IE9
                    if (link.href.length > 4000 && ie) {
                        req = new XMLHttpRequest();
                        req.open('POST', link.href, false);
                        WAF.loader.waitForStyleLoading = true;
                        req.onreadystatechange = function(evt) {
                            if (req.readyState == 4) {
                                if (req.status == 200) {
                                    var style = document.createElement('style');
                                    style.setAttribute('id', 'waf-page');
                                    style.innerHTML = req.responseText;
                                    head.appendChild(style);
                                    WAF.loader.waitForStyleLoading = null;
                                }
                            }
                        };
                        req.send(null);
                    } else {
                        head.appendChild(link);
                    }
                }

                WAF.loader.loadStyles();
            }
        },
        /**
         * return the platform info : OS, device, device type (phone, tablet, desktop)
         *
         * @static
         * @method getPlatformInfo
         */
        getPlatformInfo: function() {
            var
            platform = {},
            appVersion = navigator.userAgent,
            detect,
            version,
            place,
            thestring;

            var checkIt = function(string) {
                place = detect.indexOf(string) + 1;
                thestring = string;
                if (place) {
                    return true;
                } else {
                    return false
                }
            };

            switch (true) {

                case (/iPhone/i).test(appVersion) :
                    platform.device = "iPhone";
                    platform.OS = "iOs";
                    platform.type = "phone";
                    break;
                case (/iPod/i).test(appVersion) :
                    platform.device = "iPod";
                    platform.OS = "iOs";
                    platform.type = "phone";
                    break;
                case (/iPad/i).test(appVersion) :
                    platform.device = "iPad";
                    platform.OS = "iOs";
                    platform.type = "tablet";
                    break;
                case (/Android/i).test(appVersion) :
                    if ((/Xoom|Streak|SCH-I800/i).test(appVersion)) {   //known Android tablet devices
                        platform.device = "";
                        platform.OS = "android";
                        platform.type = "tablet";
                    } else {
                        if ((/Mobile/i).test(appVersion)) {            //Most of Android phones devices have the "Mobile" tag despite of the tablets
                            platform.device = "";
                            platform.OS = "android";
                            platform.type = "phone";
                        } else {                                        //in this case we presume the device is a tablet
                            platform.device = "";
                            platform.OS = "android";
                            platform.type = "tablet";
                        }
                    }
                    break;
                default:
                    platform.device = "unknown";
                    platform.type = "desktop";

                    detect = navigator.userAgent.toLowerCase();

                    switch (true) {
                        case checkIt('konqueror'):
                            platform.browser = "Konqueror";
                            platform.OS = "Linux";
                            break;
                        case checkIt('firefox'):
                            platform.browser = "Firefox";
                            break;
                        case checkIt('chrome'):
                            platform.browser = "Chrome";
                            break;
                        case checkIt('safari'):
                            platform.browser = "Safari";
                            break;
                        case checkIt('omniweb'):
                            platform.browser = "OmniWeb";
                            break;
                        case checkIt('icab'):
                            platform.browser = "iCab";
                            break;
                        case checkIt('msie'):
                            platform.browser = "msie";
                            break;
                        default:
                            platform.browser = "unknown";
                    }

                    platform.browserVersion = detect.charAt(place + thestring.length);

                    if (!platform.OS) {
                        switch (true) {
                            case checkIt('linux'):
                                platform.OS = "Linux";
                                break;
                            case checkIt('x11'):
                                platform.OS = "Unix";
                                break;
                            case checkIt('mac'):
                                platform.OS = "Mac";
                                break;
                            case checkIt('win'):
                                platform.OS = "Windows";
                                break;
                            default:
                                platform.OS = "unknown";
                        }
                    }
            }

            if (platform.OS === "iOs") {

                var res = navigator.userAgent.match(/; CPU.*OS (\d_\d)/);

                if (res) {
                    var strVer = res[res.length - 1];
                    strVer = strVer.replace("_", ".");
                    platform.OSVersion = strVer * 1;
                }

            } else {
                platform.OSVersion = "unknown";
            }

            //has webkit 3d transform
            if ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()) {
                platform.webkit3dTransform = true;
            } else {
                platform.webkit3dTransform = false;
            }

            //look for touch capabilities
            platform.isTouch = this.isTouchDevice();
            //html5 features supported
            platform.html5Support = this.detectHtml5Features();

            WAF.PLATFORM = platform;
        },
        /**
         * return the moduleString by device type
         *
         * @static
         * @method getModuleByDeviceType
         * @retutn {string}
         */
        getModuleByDeviceType: function() {
            var platform = WAF.PLATFORM,
            module;

            switch (platform.type) {
                case "tablet":
                    module = "mobile";
                    break;
                case "phone":
                    module = "mobile";
                    break;
                default:
                    module = "allmodules";
            }

            return module;

        },
        /**
         * returns true if the device supports touch
         * (Chrome & IE10/11 on Windows 7/+ incorrectly reports true even though device doesn't have touch)
         *
         * @static
         * @method isTouchDevice
         */
        isTouchDevice: function() {
            return 'ontouchstart' in window || 'onmsgesturechange' in window || false;
        },
        /**
         * set WAF.html5Support value.
         *
         * @static
         * @method detectHtml5Features
         */
        detectHtml5Features: function() {
            // html5attributes to be tested: only test input attributes for now
            var attributes = {
                input: {},
                textarea: {}
            },
            i = 0;

            var inputEl = document.createElement('input'), // check for special input attributes
            textareaEl = document.createElement('textarea'),
            list = 'placeholder'.split(' ');

            for (i = 0; i < list.length; i++) {
                attributes['input'][list[i]] = !!(list[i] in inputEl);
            }

            for (i = 0; i < list.length; i++) {
                attributes['textarea'][list[i]] = !!(list[i] in textareaEl);
            }

            return attributes;
        },
        debug: {
            loadJs: function(list) {
                WAF.loader.scriptToLoad = WAF.loader.scriptToLoad.concat(list);
                WAF.loader.loadScripts();
            },
            loadCss: function(list) {
                // in debug mode, display a warning for the manually added css tag link
                // because, the manually add link tag is not supported by WD2
                // the result in this way in non-debug mode might not be what you expect
                var linkTags = document.getElementsByTagName('link');
                for(i = 0; i< linkTags.length; i++) {
                    if(linkTags[i].rel == 'stylesheet' && linkTags[i].href.indexOf('-desktop~waf-build.css') === -1)
                        console.warn("Warning: The " + linkTags[i].outerHTML + " tag used to load a CSS file in a Page is not supported by WD2. The results when loading CSS files in this way in non-debug mode might not be what you expect.");
                }

                WAF.loader.styleToLoad = WAF.loader.styleToLoad.concat(list);
                WAF.loader.loadStyles();
            }
        },
        loadComponents: function(toLoad) {
            var cleanStruct = {},
            cleanPath = '',
            path = '';

            for (path in toLoad) {
                cleanPath = path;
                cleanPath = '/' + cleanPath.split('.waComponent/')[0] + '.waComponent';
                WAF.webcomponents[cleanPath] = toLoad[path];
            }

        },
        loadPackageByReferer: function() {
            //create a fake (unique path to the package.json)
            var urlBase = location.pathname + '-' + document.getElementsByTagName('body')[0].getAttribute('data-platform');
            this.loadPackage(urlBase, true);
        },
        loadPackage: function(packageName, useReferer, path) {
            var head = null,
            script = null,
            link = null;

            head = document.getElementsByTagName('head')[0];

            //create a script tag to launch the request to urlOfThePackage.json~waf-build.js
            script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = packageName + '~waf-build.js' + (useReferer ? '?useReferer=1' : '') + (path ? '?path=' + path : '');

            if (script.addEventListener) {
                script.addEventListener('load', loadCatalog, false);
            } else {
                script.onreadystatechange = function() {
                    if (this.readyState === 'complete' || this.readyState === 'loaded') {
                        loadHandler();
                    }
                }
            }

            head.appendChild(script);

            function loadCatalog() {
                if (typeof jQuery !== 'undefined') {
                    WAF.onAllScriptsLoaded = new $.Deferred();
                }

                var onCatalogLoad = function(event) {
                    var i = 0,
                    nbComponents = 0,
                    component = null,
                    compManager = WAF.loader.componentsManager,
                    rpcFileManager = WAF.loader.rpcFileManager,
                    components = [];

                    if (event && event.error != null) {
                        WAF.ds = null;
                    }

                    ds = WAF.ds; // ds is a global variable and an alias to the dataStore

                    if (typeof (WAF.tags) !== 'undefined') {

                        // check if components need to be loaded
                        components = $('[data-type=component]');
                        nbComponents = components.length;
                        if (components.length > 0) {
                            compManager.init();
                            for (i = 0; i < nbComponents; i++) {
                                component = components[i];

                                // check if we need to load
                                if (component.getAttribute('data-start-load') == null || component.getAttribute('data-start-load') == 'true') {

                                    // check if we have a valid path
                                    if (component.getAttribute('data-path') != null && component.getAttribute('data-path') != '') {
                                        compManager.add();
                                    }
                                }
                            }
                        }

                        //WAF.loadBehaviors();
                        //WAF.loadWidgets();

                        WAF.tags.createView();

                        // show body
                        document.body.style.display = 'block';
                        document.body.style.visibility = 'visible';
                    }

                    WAF._private.catalogLoaded = true;

                    // Trigger on ready event on WAF : usefull for widgets events
                    if (WAF.tags != null && typeof $ !== 'undefined') {
                        $(WAF).trigger('onWAFReady');
                    }

                    if (!compManager.hasComponent() && !rpcFileManager.hasRpcFile()) {
                        WAF.onReady();
                    }
                }

                if (WAF.DataStore != null) {
                    var catalog = null; // all by default
                    if (WAF.config.catalog != null) {
                        catalog = WAF.config.catalog;
                    }
                    if (catalog == '*') {
                        catalog = null;
                    }
                    if (catalog == '') {
                        catalog = ' ';
                    }
                    WAF.ds = new WAF.DataStore({
                        onSuccess: onCatalogLoad,
                        onError: onCatalogLoad,
                        catalog: catalog
                    });
                }
            }

            //create a css link tag to launch the request to urlOfThePackage.json~waf-build.css
            link = document.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = packageName + "~waf-build.css" + (useReferer ? '?useReferer=1' : '') + (path ? '?path=' + path : '');
            head.appendChild(link);
        },
        /**
         * init the loading of required files
         *
         * @static
         * @method init
         */
        init: function() {
            var i = 0,
            j = 0,
            scriptsList = '',
            script = 0,
            modulesString = 'allmodules',
            metaTags = '',
            modules = '',
            content = '',
            pattern = null,
            req = null,
            loadPackage = false,
            path;
            ;

            WAF.config.loadCSS = [];
            WAF.config.loadJS = [];
            WAF.config.loadRPC = [];

            // Get the base URL
            scriptsList = document.getElementsByTagName('script');
            for (script = 0; script < scriptsList.length; script++) {
                if (scriptsList[script].src.search(/loader.js/i) !== -1) {
                    WAF.config.baseURL = scriptsList[script].src.substring(0, scriptsList[script].src.search(/loader.js/i) - 1);
                }
            }

            //set platform info
            this.getPlatformInfo();

            // fix font-face with safari on japanese
            if (navigator.language && navigator.language.indexOf('jp') != -1 && navigator.userAgent && navigator.userAgent.indexOf('Safari')) {
                WAF.modulesInfo.allmodules.css[14] = '+/widget/skin/default/css/widget-skin-default-fix-japanese.css';
            }

            // look for the meta tags WAF.config.x
            metaTags = document.getElementsByTagName('meta');

            for (i = 0; i < metaTags.length; i++) {
                switch (metaTags[i].name) {
                    case 'WAF.config':
                        break;
                    case 'WAF.catalog':
                        var cat = metaTags[i].content;
                        if (cat != null) {
                            WAF.config.catalog = cat;
                        }
                        break;
                    case 'WAF.packageJson':
                        if ((!metaTags[i].getAttribute('data-use-referer') && metaTags[i].content === "") || (metaTags[i].getAttribute('data-use-referer') === "true" || metaTags[i].getAttribute('data-use-referer') === true)) {
                            WAF.config.packageJson = true;
                            WAF.loader.loadPackageByReferer();
                            loadPackage = true;
                        }
                        else if (metaTags[i].content !== null) {
                            WAF.config.packageJson = metaTags[i].content;
                            path = metaTags[i].getAttribute('data-path');
                            WAF.loader.loadPackage(WAF.config.packageJson, false, path);
                            loadPackage = true;
                        }
                        else {
                            loadPackage = false;
                        }
                        break;
                    case 'WAF.config.modules':
                        modulesString = (metaTags[i].content === '') ? 'allmodules' : metaTags[i].content;
                        if (modulesString === 'tablet' || modulesString === 'smartphone') {
                            modulesString = "mobile";
                        }
                        if (modulesString === 'auto') {
                            modulesString = this.getModuleByDeviceType();
                        }

                        modulesString = modulesString.toLowerCase();
                        WAF.PLATFORM.modulesString = modulesString;

                        break;
                    case 'WAF.config.openAjax':
                        WAF.config.openAjax = (metaTags[i].content === '') ? 'null' : metaTags[i].content;
                        break;
                    case 'WAF.config.debug':
                        WAF.config.debugMode = (metaTags[i].content === 'true') ? true : false;
                        break;
                    case 'WAF.config.uniTest':
                        WAF.config.uniTest = (metaTags[i].content === '') ? 'false' : metaTags[i].content;
                        break;
                    case 'WAF.config.load':
                        WAF.config.load = (metaTags[i].content === '') ? '' : metaTags[i].content;
                        break;
                    case 'WAF.config.loadJS':
                        content = metaTags[i].content;
                        if (content != null) {
                            WAF.config.loadJS.push(content);
                            WAF.loader.simplePath[content] = true;
                        }
                        break;
                    case 'WAF.config.loadCSS':
                        content = metaTags[i].content;
                        if (content != null) {
                            WAF.config.loadCSS.push(content);
                            WAF.loader.simplePath[content] = true;
                        }
                        break;
                    case 'WAF.config.rpc':
                        WAF.config.rpc = (metaTags[i].content === '') ? 'false' : metaTags[i].content;
                        break;
                    case 'WAF.config.rpc.namespace':
                        WAF.config.rpc.namespace = (metaTags[i].content === '') ? 'false' : metaTags[i].content;
                        break;
                    case 'WAF.config.rpc.module':
                        WAF.config.rpc.module = (metaTags[i].content === '') ? '' : metaTags[i].content;
                        break;
                    case 'WAF.config.rpc.methods':
                        WAF.config.rpc.methods = (metaTags[i].content === '') ? '' : metaTags[i].content;
                        break;
                    case 'WAF.config.rpc.validation':
                        WAF.config.rpc.validation = (metaTags[i].content === '') ? 'false' : metaTags[i].content;
                        break;
                    case 'WAF.config.rpc.file':
                        content = metaTags[i].content;
                        if (content != null) {
                            WAF.config.loadRPC.push(content);
                            WAF.loader.rpcFileManager.add();
                        }
                        break;
                    default:
                        break;
                }
            }

            WAF.config.pattern = null;

            // Load the modules
            modules = modulesString.split(',');
            if (!loadPackage) {
                for (j = 0; j < modules.length; j++) {
                    WAF.loader.loadModules(modules[j]);
                }
            }

            // load the rpc files, if any
            WAF.loader.loadRpcFile(WAF.config.loadRPC);

        }
    };

    WAF.loader.init();
}

/**
 * Get a reference to a WAF widget or Designer Tag (GUIDesigner)
 *
 * @param {String} id id of the widget/tag
 * @return {WAF.Widget} a widget/tag or undefined if could not be found
 */
function $$(id) {
    var element = null;
    if (typeof Designer === 'undefined') {
        element = WAF.widgets[id];
    } else {
        element = Designer.tag.getTagById(id);
    }
    return element;
}
;
