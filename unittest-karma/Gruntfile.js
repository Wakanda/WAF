module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);
//    console.log('init',grunt.cli.tasks);
    var unitTestTarget = 'WAF_RIA';
    //todo make it cleaner
    if(grunt.cli.tasks.length === 1 && grunt.cli.tasks[0].substr(0,4) === 'test'){
        unitTestTarget = grunt.cli.tasks[0].split(':')[1];
        console.log('target',unitTestTarget);
    }
    // Load external resources (by default load the whole list of file to test)
    var gruntKarmaConf = require('./grunt.karma.conf')(grunt);
    var wakandaConfig = {
        karma : {
            files : gruntKarmaConf.getFiles(unitTestTarget)
        }
    };

    // Define the configuration for all the tasks
    grunt.initConfig({
        
        // Test settings
        karma: {
            options : {
                configFile: 'karma.conf.js',
                files : wakandaConfig.karma.files
            },
            "WAF-single" : {
                singleRun : true
            },
            "RIA-single" : {
                singleRun: true
            },
            "WAF_RIA-single" : {
                singleRun: true
            },
            "WAF-continuous" : {
                singleRun : false
            },
            "RIA-continuous" : {
                singleRun: false
            },
            "WAF_RIA-continuous" : {
                singleRun: false
            }
        },
        
        test : {
            WAF : {
                single : {},
                continuous: {}
            },
            RIA : {
                single : {},
                continuous: {}
            },
            WAF_RIA : {
                single : {},
                continuous: {}
            }
        }

    });
    
    grunt.registerMultiTask('test',"Multi task karma",function(mode){
        console.log(this.target,mode);
        if(['WAF','RIA','WAF_RIA'].indexOf(this.target) === -1){
            grunt.fail.warn('Please specify "WAF","RIA" or "WAF_RIA" as target');
        }
        if(typeof mode === "undefined" || mode == ""){
            mode = "continuous";
        }
        console.log('mode',mode);
        grunt.task.run('karma:'+this.target+'-'+mode);
    });

};