// Karma configuration
// Generated on Thu Dec 05 2013 10:56:51 GMT+0100 (CET)

module.exports = function(config) {

    var unitTestFolderName = 'unittest-karma/';

    config.set({
        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: [
            'progress',
            'junit',
//            'coverage',
            'osx',
            'html'
        ],
        // base path, that will be used to resolve files and exclude
        basePath: '../',
        // frameworks to use
        frameworks: [
            'mocha'
//            , 'requirejs'
            ,'chai'
            ,'sinon-chai'
        ],
        preprocessors: {
            '**/*.html': ['html2js'],
            '**/*.css': ['html2js'],
            'waf-*/**/*.js': ['coverage']
        },
        // list of files / patterns to load in the browser
        files: [
            //needed for WAF to be declared
            {pattern: unitTestFolderName + 'Loader.js', included: true},
       //    {pattern: 'Loader.js', included: true},

            //from the WAF.package.json
       //    {pattern: 'Core/Native/Rest.js', included: true},
       //    {pattern: 'Core/Utils/Dates.js', included: true},
       //    {pattern: 'Core/Utils/DebugTools.js', included: true},
       //    {pattern: 'Core/Utils/Environment.js', included: true},
       //    {pattern: 'Core/Utils/Strings.js', included: true},
       //    {pattern: 'Core/Utils/Timers.js', included: true},
            {pattern: 'waf-core/core.js', included: true},
            {pattern: 'waf-core/class.js', included: true},
            {pattern: 'waf-core/error.js', included: true},
            {pattern: 'waf-core/event.js', included: true},
            {pattern: 'waf-core/behavior.js', included: true},
            {pattern: 'waf-behavior/methodshelper.js', included: true},
            {pattern: 'waf-core/subscriber.js', included: true},
            {pattern: 'waf-behavior/observable.js', included: true},
            {pattern: 'DataProvider/Data-Provider.js', included: true},
            {pattern: 'lib/jquery/jquery.min.js', included: true},
       //    {pattern: 'lib/jquery-ui/jquery-ui.min.js', included: true},
       //    {pattern: 'lib/jquery-ui/jquery-ui-i18n.js', included: true},
       //    {pattern: 'lib/jquery-ui/themes/base/jquery.ui.core.css', included: true},
       //    {pattern: 'lib/jquery-ui/themes/base/jquery.ui.resizable.css', included: true},
       //    {pattern: 'lib/jquery-ui/themes/base/jquery.ui.selectable.css', included: true},
       //    {pattern: 'lib/jquery-ui/themes/base/jquery.ui.accordion.css', included: true},
       //    {pattern: 'lib/jquery-ui/themes/base/jquery.ui.autocomplete.css', included: true},
       //    {pattern: 'lib/jquery-ui/themes/base/jquery.ui.button.css', included: true},
       //    {pattern: 'lib/jquery-ui/themes/base/jquery.ui.dialog.css', included: true},
       //    {pattern: 'lib/jquery-ui/themes/base/jquery.ui.slider.css', included: true},
       //    {pattern: 'lib/jquery-ui/themes/base/jquery.ui.tabs.css', included: true},
       //    {pattern: 'lib/jquery-ui/themes/base/jquery.ui.datepicker.css', included: true},
       //    {pattern: 'lib/jquery-ui/themes/base/jquery.ui.progressbar.css', included: true},
       //    {pattern: 'lib/jquery-ui/themes/base/jquery.ui.theme.css', included: true},
            {pattern: 'DataSource/Data-Source.js', included: true},
            {pattern: 'DataSource/Selection.js', included: true},
            {pattern: 'DataSource/ErrorHandling.js', included: true},
       //    {pattern: 'widget/calendar/js/datepicker.js', included: true},
       //    {pattern: 'rpc/Rpc.js', included: true},
       //    {pattern: 'Tags/taglib.js', included: true},
       //    {pattern: 'Tags/tags.js', included: true},
       //    {pattern: 'lib/jquery.svg/jquery.svg.min.js', included: true},
       //    {pattern: 'lib/selectbox/jquery-selectbox.js', included: true},
       //    {pattern: 'lib/selectbox/jquery-selectbox.css', included: true},
       //    {pattern: 'lib/combobox/jquery-combobox.js', included: true},
       //    {pattern: 'lib/beautytips/beautytips.js', included: true},
       //    {pattern: 'lib/beautytips/beautytips.css', included: true},
       //    {pattern: 'lib/notify/jquery.notify.js', included: true},
       //    {pattern: 'lib/notify/ui.notify.css', included: true},
       //    {pattern: 'widget/widget.js', included: true},
       //    {pattern: 'widget/css/widget.css', included: true},
       //    {pattern: 'Component/Component.js', included: true},
            {pattern: 'lib/handlebars/handlebars.min-latest.js', included: true},
            {pattern: 'waf-core/formatters.js', included: true},
            {pattern: 'waf-core/binding-parser.js', included: true},
            {pattern: 'waf-behavior/bindable.js', included: true},
            {pattern: 'waf-behavior/properties.js', included: true},
            {pattern: 'waf-behavior/properties-list.js', included: true},
            {pattern: 'waf-behavior/properties-datasource.js', included: true},
            {pattern: 'waf-behavior/properties-template.js', included: true},
            {pattern: 'waf-core/widget.js', included: true},
            {pattern: 'waf-behavior/domhelpers.js', included: true},
            {pattern: 'waf-behavior/focus.js', included: true},
            {pattern: 'waf-behavior/style.js', included: true},
            {pattern: 'waf-behavior/size.js', included: true},
            {pattern: 'waf-behavior/position.js', included: true},
            {pattern: 'waf-behavior/layout/composed.js', included: true},
            {pattern: 'waf-behavior/layout/container.js', included: true},
            {pattern: 'waf-behavior/layout/multicontainer.js', included: true},
            {pattern: 'waf-behavior/layout/repeater.js', included: true},
            {pattern: 'waf-behavior/layout/properties-container.js', included: true},
            {pattern: 'waf-behavior/source-navigation.js', included: true},
            {pattern: 'waf-widget/body.js', included: true},
            {pattern: 'waf-widget/oldwidget.js', included: true},


            {pattern: unitTestFolderName + 'testHelper.js', included: true},
//            {pattern: unitTestFolderName + 'node_modules/karma-chai-plugins/node_modules/chai/chai.js', included: false},
            {pattern: unitTestFolderName + 'tests/**/*-spec.js', included: true},
            {pattern: unitTestFolderName + 'tests/**/*-fixture.html', included: true},
            {pattern: unitTestFolderName + 'tests/**/*-style.css', included: true},
            {pattern: unitTestFolderName + 'testRunner.js', included: true}
        ],
        // list of files to exclude
        exclude: [
//            unitTestFolderName + unitTestFolderName+'reports',
//            unitTestFolderName + 'node_modules',
//            unitTestFolderName + 'nbproject'
        ],
        // the default configuration
        junitReporter: {
            outputFile: unitTestFolderName + 'reports/result/test-results.xml',
            suite: ''
        },
        // optionally, configure the reporter
        coverageReporter: {
            type: 'html',
            dir: unitTestFolderName + 'reports/coverage/'
        },
        htmlReporter: {
            outputDir: 'reports/html/',
            templatePath: 'node_modules/karma-html-reporter/jasmine_template.html'
        },
        // web server port
        port: 9876,
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,
        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
        browsers: [
            //'PhantomJS',
            'Chrome',
            //'Firefox',
        ],
        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,
        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
