DEFAULT

* Install nodejs
* Install PhantomJS
	* download and unzip
	* `sudo cp bin/phantomjs /usr/bin/`
* Terminal :
	* `cd unittest-karma`
	* `npm install`
	* `sudo ln -s $(pwd)/node_modules/karma/bin/karma /usr/bin/karma`

With grunt :

* Install grunt-cli : `npm install grunt-cli -g`
* if you used the tests before, make sure to update your node modules by `npm update`
* Add the P4HOME variable to your env like : `export P4HOME=/Users/Rosset/workspace/perforce`

---

RUN

karma style :

`karma start`

grunt style :

* grunt test:WAF (will test WAF)
* grunt test:RIA (will test your custom widgets which are in RIA)
* grunt test:WAF_RIA (will do both)

By default, the test will keep going on, watch your files (and relaunch your tests if you modify them). To do a single run :

* grunt test:WAF:single
* grunt test:RIA:single
* grunt test:WAF_RIA:single

WARN : All this grunt part / custom widget test is still a work in progress.

---

REPORTS

* reports are logged in the terminal
* also saved in reports/html (readable in a browser)
* you can see your code coverage in `reports/coverage`

---

TODO

* code coverage
* tests with html fixtures
* test exports
* more ...
	* package definition automatisation
