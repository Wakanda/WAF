module.exports = function(active){

    var builderServiceSettings = null;
    
    //if no active argument passed, take the builder settings in the service (false by default)
    if( !(active === true || active === false) ){
        builderServiceSettings = application ? application.settings.getItem('services')["Builder handler"] : null;
        if(builderServiceSettings !== null && (builderServiceSettings["logsActive"] === true || builderServiceSettings["logsActive"] === "true") ){
            active = true;
        }
        else{
            active = false;
        }
    }
    
    if(active === true){
        return function () { return console.log.apply(console, arguments); };
    }
    else{
        return function(){};
    }

};