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
 * @module js-minifier
 */
module.exports = (function(){
    
    //builderLogger included with fallback if the module isn't executed inside an application context (command line for example)
    var builderLogger   = typeof application !== "undefined" ? require(getWalibFolder().path+'WAF/'+"builder/builder-logger")() : function () { return console.log.apply(console, arguments); };
    
    function minifyJs(file, urlPath, escape, doNotMinify, specifyTimestamp){
    
        builderLogger('minifyJS',urlPath);
        
        var stream;
        specifyTimestamp = typeof specifyTimestamp === "undefined" ? true : specifyTimestamp;

        try{

            if(file.path && file.path.indexOf("min.js") > -1){
                return "/** original minified js "+(urlPath !== undefined ? " - from "+urlPath : "")+(specifyTimestamp === true ? " at "+(new Date()).toUTCString() : "")+" */\n\n"
                        + (escape ? require('./code-escaper')(file.toString()) : file.toString()) + ";";
            }
            else{

                if(!doNotMinify){
                    stream = escape ? require('./code-escaper')(require("./UglifyJS1/uglify-js")(file.toString())) : require("./UglifyJS1/uglify-js")(file.toString());
                }
                else{
                    stream = escape ? require('./code-escaper')(file.toString()) : file.toString();
                }

                return "/** "+(doNotMinify ? "original" : "minified")+" js "+(urlPath !== undefined ? " - from "+urlPath : "")+(specifyTimestamp === true ? " at "+(new Date()).toUTCString() : "")+" */\n\n"
                        + stream + ";";
            }
        
        }
        catch(e){
            throw new Error("minifyJS - couldn't minify script : "+urlPath+" (error on line "+e.line+") "+e.message);
        }
    }
    
    return minifyJs;
    
})();