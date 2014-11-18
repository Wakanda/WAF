(function() {
    // prevent Loader.js from loading any javascript or CSS
    var m = document.createElement('meta');
    m.name = "WAF.config.modules";
    m.content = "nothing";
    document.head.appendChild(m);
})();
