Welcome to Wakanda!
===================
An end-to-end JavaScript Development platform for Web & mobile applications.

Please read the [Wiki page for full details](http://github.com/Wakanda/core-Wakanda/wiki) or visit [wakanda.org](http://www.wakanda.org/) for general product information.


Wakanda is made of several parts, each having its own repository.

1. [core-Wakanda](http://github.com/Wakanda/core-Wakanda)

 Implements application logic for Wakanda Server.

2. [core-XToolbox](http://github.com/Wakanda/core-XToolbox)

 Cross-platform c++ framework to ease porting wakanda server on Windows, OSX, Linux.
 It also provides common utilities regarding graphics, network, xml, javascript.

3. [core-Components](http://github.com/Wakanda/core-Components)

 Various components that provide high level functionnalities such as the DataStore, the HTTP Server or the JavaScript symbol parser.

4. [WAF](http://github.com/Wakanda/WAF)

 Wakanda Application Framework (WAF) is the JavaScript framework served by Wakanda Server to implement the magic behind Wakanda HTML widgets.
WAF also provides server side modules or services.

5. External dependencies

 Wakanda uses various open source projects such as:

 - ICU for Unicode handling
 - Xerces for XML parsing
 - OpenSSL for SSL/TLS support
 - Curl for SSJS XMLHttpRequest
 - JavaScriptCore from Webkit
 - zlib and lipzip
 - Pthreads-w32 for posix thread support on windows

 You'll find the sources for these projects on their own website.

Wakanda license is available at the following address: [www.wakanda.org/license](http:www.wakanda.org/license)