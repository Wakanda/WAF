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

WAF.Widget.provide(
'YahooWeather',
{
    /**
     * YQL params
     *
     * @private
     * @shared
     * @property shared.yql
     * @type Object
     */
    yql: {
        url: 'http://query.yahooapis.com/v1/public/yql',
        sql: 'select * from weather.forecast where location = ',
        query: {
            q: '',
            format: 'json',
            callback: ''
        }
    },
    /**
     * Format url to use in ajax call to YQL
     *
     * @private
     * @shared
     * @method urlFormat
     * @namespace WAF.widget.YahooWeather
     */
    urlFormat: function() {
        return this.yql.url + '?' + $.param(this.yql.query);
    },
    /**
     * Retrieve and format forecast
     *
     * @private
     * @shared
     * @method getForecast
     * @param {String} event
     */
    getForecast: function getForecast(event) {
        var self = this,
        html = null,
        zipCode = null,
        weather = null,
        weatherConditionIcon = null;

        if (this.widget.source.getCurrentElement() !== null) {
            // Get the zipCode
            zipCode = this.widget.sourceAtt.getValue();

            // Set the query
            this.yql.query.q = this.yql.sql + zipCode + ' and u="' + this.widget.settings.units.temperature + '"';

            // Initiate the HTTP GET request
            $.getJSON(this.urlFormat(), function(data) {
                html = '';

                try {
                    // Get results
                    weather = data.query.results.channel;

                    // Point to the condition icon
                    weatherConditionIcon = 'http://l.yimg.com/a/i/us/nws/weather/gr/' + weather.item.condition.code + 'd.png';

                    // Html injection
                    html += '<div class="condition icon" style="background-image: url(' + weatherConditionIcon + ')"></div>';
                    html += '<h2>' + weather.item.condition.temp + '&deg;<span>' + weather.units.temperature + '</span></h2>';
                    html += '<h4>' + weather.location.city + ', ' + weather.location.region + '</h4>';
                    html += '<table>';
                    html += '<col width="25%" />';
                    html += '<col width="25%" />';
                    html += '<col width="25%" />';
                    html += '<col width="25%" />';
                    html += '<tr>';
                    html += '<th colspan="2">' + weather.item.forecast[0].day + '</th>';
                    html += '<th colspan="2">' + weather.item.forecast[1].day + '</th>';
                    html += '</tr>';
                    html += '<tr>';
                    html += '<td colspan="2" align="center">' + weather.item.forecast[0].text + '</td>';
                    html += '<td colspan="2" align="center">' + weather.item.forecast[1].text + '</td>';
                    html += '</tr>';
                    html += '<tr>';
                    html += '<td rowspan="2"><div class="icon" style="background-position: -' + (61 * weather.item.forecast[0].code) + 'px 0;"></div></td>';
                    html += '<td>High:&nbsp;<span class="high">' + weather.item.forecast[0].high + '&deg;</span></td>';
                    html += '<td rowspan="2"><div class="icon" style="background-position: -' + (61 * weather.item.forecast[1].code) + 'px 0;"></div></td>';
                    html += '<td>High:&nbsp;<span class="high">' + weather.item.forecast[1].high + '&deg;</span></td>';
                    html += '</tr>';
                    html += '<tr>';
                    html += '<td>Low:&nbsp;<span class="low">' + weather.item.forecast[0].low + '&deg;</span></td>';
                    html += '<td>Low:&nbsp;<span class="low">' + weather.item.forecast[1].low + '&deg;</span></td>';
                    html += '</tr>';
                    html += '</table>';
                    html += '<a href="' + weather.item.link + '" target="_blank" class="full">Full Forecast at Yahoo! Weather</a>';

                    self.widget.front.html(html);
                } catch (e) {
                    self.widget.front.html('<h4>Sorry ! An error occured</h4>');
                }
            });

        }
    },
    yahooWeatherEventHandler: function(event) {
        event.data.shared.getForecast();
    }
},
/**
 * The constructor of the widget
 *
 * @shared
 * @inherits WAF.Widget
 * @constructor WAF.widget.YahooWeather
 * @param {Object} config description
 * @param {Object} data description
 * @param {Object} shared description
 * 
 **/
function(config, data, shared) {
    var html = '';

    shared.widget = this;

    // Html injection
    html += '<div class="front"></div>';

    $(this.containerNode).html(html);

    // Public instance properties
    this.settings = {
        'units': {
            'temperature': data.unit
        }
    };

    this.front = $(this.containerNode).children('.front');

    // Source attribute change
    if (typeof this.source !== 'undefined') {
        this.source.addListener("onAttributeChange", shared.yahooWeatherEventHandler, {
            id: config.id,
            attributeName: this.att.name
        }, {
            shared: shared
        });
    }
},
{
}

);