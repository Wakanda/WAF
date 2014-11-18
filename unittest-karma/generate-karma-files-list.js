var http = require('http');

http.get("http://127.0.0.1:8081/unit.package.json~waf-build.custom", function(res) {
    res.setEncoding('utf8');
    res.on('data',function(chunk){
        var data = JSON.parse(chunk);
        var files = data["unit.package.json"].files;
        var result = "";
        for(var i=0; i<files.length; i++){
            result += "{pattern: '"+files[i].file+"', included: true},\n";
        }
        console.log(result);
    });
}).on('error', function(e) {
    console.log("Got error: " + e.message);
});