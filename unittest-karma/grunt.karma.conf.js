'use strict';

module.exports = function(grunt) {
    
    var P4HOME = process.env.P4HOME;
    var unitTestMainFolderName = __dirname;
    var unitTestCustomWidgetsFolderName = P4HOME+"/RIA/trunk/WakandaCustom/widgets/";
    
    if(!P4HOME){
        grunt.fail.warn('Your env variable P4HOME is not set, please set it to be able to test custom widget (see readme)');
    }
    
    var UNITTEST_FOLDER = 'UNITTEST_FOLDER';
    var WAF_FOLDER = 'WAF_FOLDER';
    var CUSTOMWIDGETS_FOLDER = 'CUSTOMWIDGETS_FOLDER';
    
    var originalFiles = [
        UNITTEST_FOLDER + 'Loader.js' ,
        
        WAF_FOLDER + 'waf-core/core.js',
        WAF_FOLDER + 'waf-core/class.js',
        WAF_FOLDER + 'waf-core/error.js',
        WAF_FOLDER + 'waf-core/event.js',
        WAF_FOLDER + 'waf-core/behavior.js',
        WAF_FOLDER + 'waf-behavior/methodshelper.js',
        WAF_FOLDER + 'waf-core/subscriber.js',
        WAF_FOLDER + 'waf-behavior/observable.js',
        WAF_FOLDER + 'lib/jquery/jquery.min.js',
        WAF_FOLDER + 'DataSource/Data-Source.js',
        WAF_FOLDER + 'DataSource/Selection.js',
        WAF_FOLDER + 'DataSource/ErrorHandling.js',
        WAF_FOLDER + 'waf-behavior/bindable.js',
        WAF_FOLDER + 'waf-behavior/properties.js',
        WAF_FOLDER + 'waf-behavior/properties-list.js',
        WAF_FOLDER + 'waf-behavior/properties-datasource.js',
        WAF_FOLDER + 'waf-core/widget.js',
        WAF_FOLDER + 'waf-behavior/domhelpers.js',
        WAF_FOLDER + 'waf-behavior/focus.js',
        WAF_FOLDER + 'waf-behavior/style.js',
        WAF_FOLDER + 'waf-behavior/size.js',
        WAF_FOLDER + 'waf-behavior/position.js',
        WAF_FOLDER + 'waf-behavior/layout/composed.js',
        WAF_FOLDER + 'waf-behavior/layout/container.js',
        WAF_FOLDER + 'waf-behavior/layout/multicontainer.js',
        WAF_FOLDER + 'waf-behavior/layout/repeater.js',
        WAF_FOLDER + 'waf-widget/body.js',
        WAF_FOLDER + 'waf-widget/oldwidget.js',
        
        UNITTEST_FOLDER + 'testHelper.js'
    ];
    
    var wafTestFiles = [
        UNITTEST_FOLDER + 'tests/**/*-spec.js' ,
        UNITTEST_FOLDER + 'tests/**/*-fixture.html' ,
        UNITTEST_FOLDER + 'tests/**/*-style.css'
    ];
    
    var customWidgetTestFiles = [
        CUSTOMWIDGETS_FOLDER + '**/*-spec.js' ,
        CUSTOMWIDGETS_FOLDER + '**/*-fixture.html' ,
        CUSTOMWIDGETS_FOLDER + '**/*-style.css'
    ];
    
    var processFiles = function(files){
        return files.map(function(current){
            return current
                .replace(UNITTEST_FOLDER, unitTestMainFolderName+'/')
                .replace(WAF_FOLDER, unitTestMainFolderName+'/../')
                .replace(CUSTOMWIDGETS_FOLDER, unitTestCustomWidgetsFolderName+'/');
        });
    };
    
    var getFiles = function(mode){
        var result;
        switch(mode){
            case "NOTESTS" :
                result = processFiles(originalFiles);
                break;
            case "WAF_RIA" :
                result = processFiles(originalFiles.concat(wafTestFiles.concat(customWidgetTestFiles)));
                break;
            case "RIA" :
                result = processFiles(originalFiles.concat(customWidgetTestFiles));
                break;
            case "WAF" :
            default :
                result = processFiles(originalFiles.concat(wafTestFiles));
                break;
        };
        return result;
    };
    
    return {
        
        getFiles : getFiles
        
    };
    
};