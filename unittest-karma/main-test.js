var unitTestFolderName = 'unittest-karma/';
var tests = [];
Object.keys(window.__karma__.files).forEach(function(file) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (/unittest-karma\/tests\/.*\.js$/.test(file)) {
            console.log('Test file added : ' + file);
            tests.push(file);
        }
    }
});
console.log(tests.length+" files added");

require({
    // Testacular serves files from '/base'
    baseUrl: '/base',
    paths: {
        chai: unitTestFolderName + 'node_modules/karma-chai-plugins/node_modules/chai/chai.js?' + (new Date()).getTime(),
        fixtures: unitTestFolderName + 'node_modules/js-fixtures/fixtures'
    },
    // ask requirejs to load these files (all our tests)
    deps: tests,
    // start test run, once requirejs is done
    callback: function() {
        require(['chai'], function(chai) {
            console.warn('require callback');
            window.expect = chai.expect;
            window.testHelper = {
                setInlineCss : function(inlneCss){
                    var css = document.createElement("style");
                    css.id = "tests-inline-css";
                    css.type = "text/css";
                    css.innerHTML = inlneCss;
                    document.head.appendChild(css);
                },
                removeInlineCss : function(){
                    document.getElementById("tests-inline-css").remove();
                }
            };
            window.__karma__.start();
        });
    }
});