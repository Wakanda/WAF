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
//// "use strict";
/*global WAF,window*/

WAF.Widget.provide(
    'GoogleMaps', 
    {}, 

    /**
     * The constructor of the widget
     *
     * @shared
     * @property constructor
     * @type Function
     **/
    function WAFWidget(config, data, shared) {
        if ( config['data-mtype'] === "static") {
            
            config                  = config                  || {};
            config['id']            = config['id']            || {};
            config['data-mapType']  = config['data-mapType']  || '0';    
            config['data-position'] = config['data-position'] || '0'; 
            
            var addressAtt = config['data-address'];
            var protocol = location.protocol === "http:" ? "http:" : "https:";
            
            var img  = $('<img>');
            $('#'+config.id).append(img);
            
            if (addressAtt && addressAtt.indexOf('.') != -1 ){
                addressAtt = addressAtt.split('.')[1];
            } 

            if (this.source && addressAtt.length !=0 ) {
                this.source.addListener(
                    'onAttributeChange', 
                    function(event) {
                        var widget = event.data.widget;
                        if (widget != null && widget.source.getPosition() != -1) {
                            
                            // base url of static google map
                            var map = protocol + '//maps.google.com/maps/api/staticmap?sensor=false';

                            // fix the position on wich is centered the map
                            map += '&center=' + widget.source[addressAtt];

                            // fix a zoom value
                            map += '&zoom=' + $('#' + widget.divID).data('zoom');

                            // Map type :
                            map += '&maptype=' + config['data-mapType'];
                            
                            //language
                            map += '&language=' + config['data-language'];

                            // fix the size of the image
                            map += '&size=' + $('#' + widget.divID).css('width').replace('px', '') + 'x' + $('#' + widget.divID).css('height').replace('px', '');

                            // add a marker on the map
                            map += '&markers=color:' + config['data-marker-color'] + '|size:' + config['data-marker-size'] + '|label:' + config['data-marker-label'] + '|' +  widget.source[addressAtt];
                            event.data.domNode[0].src = map;
                        }
                    },
                    {
                        attributeName: this.att.name,
                        id: config.id
                    },
                    {
                        widget : this, 
                        domNode: $('#'+config.id + ' img'),
                        addressAtt : addressAtt
                    });      
            } else {
                var map = protocol + '//maps.google.com/maps/api/staticmap?sensor=false';

                // fix the position on wich is centered the map
                map += '&center=' + config['data-position'];

                // fix a zoom value
                map += '&zoom=' + config['data-zoom'];

                // Map type :
                map += '&maptype=' + config['data-mapType'];

                // fix the size of the image
                map += '&size=' + $('#' + config.id).css('width').replace('px','') + 'x' + $('#' + config.id).css('height').replace('px','');

                // add a marker on the map
                map += '&markers=color:' + config['data-marker-color'] + '|size:' + config['data-marker-size'] + '|label:' + config['data-marker-label'] + '|' + config['data-position'];
                //document.getElementById(config.id).src = map;
                img.attr('src',map);
                
                
            }
            
        } else {
            
            var widget = this;

            if (!waf.__googleMaps__) {
                waf.__googleMaps__ = {
                    isLoaded: false,
                    isFirstMap: true
                };
            } else {
                waf.__googleMaps__.isFirstMap = false;
            }

            waf.__googleMaps__[widget.id] = function () {
                widget._initialize();
                waf.__googleMaps__.isLoaded = true;
            }

            this._gmap = {
                map: {},
                overlay: [],
                selectedOverlay: {},
                events: [],
                interval: {}
            };

            if (waf.__googleMaps__.isFirstMap) {

                // JavaScript Maps API link + parameters
                // for exemple link = http://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&sensor=SET_TO_TRUE_OR_FALSE
                var link;

                //build script url
                link = "http://maps.googleapis.com/maps/api/js?";
                // google api file
                // The key parameter contains the application's API key
                link += "&key=" + data.key;
                //Google Private key
                // localization of google map
                if (data.language != 'default') {
                    link += "&language=" + data.language;
                }

                link += "&sensor=false";

                //we instruct the API to only execute the initit() function after the API has fully loaded by passing callback=initit to the Maps API bootstrap:
                link += "&callback=waf.__googleMaps__." + widget.id;

                // Prepare the JavaScript code which loads all symbols and definitions we need in order to use Google Maps API
                var oScript = $("<script>");
                oScript.prop({
                    type: "text/javascript",
                    src: link
                });

                // add the script to the <head>
                $("head")[0].appendChild(oScript[0]);

            } else {
                // The javascript file of gmaps is not loaded yet. We call isGMapsLoaded every 0.5 seconds until the js is loaded.
                // We clear the interval inside isGMapsLoaded function
                this._gmap.interval = window.setInterval('waf.widgets.' + this.id + '._isGMapsLoaded()', 500);
            }

            if(this.source){
                this.source.addListener("all", function(e) {
                    if (!waf.__googleMaps__.isLoaded) {
                        widget._gmap.events.push({
                            e: e,
                            type: e.eventKind
                        });
                    }
                }, {
                    id: config.id
                });
            }
        }
    }, 
    {
        setIconMarker: function setIconMarker(id, icon) {
            if (this.config['data-mtype'] === "static") {
                return "This function is not supported in static mode.";
            }
            
            var overlay = this._getOverlay(id);
            
            
            if (overlay && overlay.marker) {
                overlay.marker.setIcon(icon);
            }
        },

        setCenter: function setCenter(position) {
            
            if (this.config['data-mtype'] === "static") {
                return "This function is not supported in static mode.";
            }
            
            if (position.match(/\b-?\d+\.\d+,\s?-?\d+\.\d+\b/)) {

                var coord = position.split(',');
                var lnglat = new google.maps.LatLng(parseFloat(coord[0]), parseFloat(coord[1]));
                this._gmap.map.panTo(lnglat);

            } else {
                var widget = this;
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                    'address': position
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        widget._gmap.map.panTo(results[0].geometry.location);
                    }
                });
            }
        },

        setZoom: function setZoom(zoomLevel) {
            if (this.config['data-mtype'] === "static") {
                return "This function is not supported in static mode.";
            }
            this._gmap.map.setZoom(zoomLevel);
        },

        setMarker: function setMarker(id, position, options) {
            
            if (this.config['data-mtype'] === "static") {
                return "This function is not supported in static mode.";
            }
            
            var widget = this;
            var entity;
            var marker = new google.maps.Marker({
                map: widget._gmap.map
            });
            
            widget.source.getEntityCollection().findKey( id , {
                onSuccess : function(e){
                    e.entityCollection.getEntity(e.result,{
                        onSuccess : function(e1){
                            entity = e1.entity;
                        }
                    })
                }
            });
            
            google.maps.event.addListener(marker, 'click', (function(){
                return function(e) {
                    var event = $.Event('markerClick', {
                        e: e,
                        marker: marker,
                        entity: entity
                    });
                    $(widget).trigger(event);
                }
            })()
                );
            
            google.maps.event.addListener(marker, 'dblclick', (function() {
                return function(e) {
                    var event = $.Event('markerDblclick', {
                        e: e,
                        marker: marker,
                        entity: entity
                    });
                    $(widget).trigger(event);
                }
            })());
            
            google.maps.event.addListener( marker, 'mouseover', (function() {
                return function(e) {
                    var event = $.Event('markerMouseover', {
                        e: e,
                        marker: marker,
                        entity: entity
                    });
                    $(widget).trigger(event);
                }
            })());
            
            if (position.match(/\b-?\d+\.\d+,\s?-?\d+\.\d+\b/)) {

                var coord = position.split(',');
                var lnglat = new google.maps.LatLng(parseFloat(coord[0]), parseFloat(coord[1]));

                // set marker postion to the returned result
                marker.setPosition(lnglat);
                if (options) {
                    if (options.icon) {
                        marker.setIcon(options.icon);
                    }

                    if (options.title) {
                        marker.setTitle(options.title);
                    }

                    if (options.infoWindowText) {

                        var infoWindow = new google.maps.InfoWindow();
                        infoWindow.setContent(options.infoWindowText);
                        google.maps.event.addListener(marker, 'click', (function(marker) {
                            return function() {
                                infoWindow.open(widget._gmap.map, marker);
                            }
                        })(marker));
                    }
                }

                widget._gmap.overlay.push({
                    marker: marker,
                    infoWindow: infoWindow,
                    address: lnglat,
                    entityKey: id
                });
                return marker;

            } else {
                var geocoder = new google.maps.Geocoder();
                return geocoder.geocode({
                    'address': position
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {

                        // set marker postion to the returned result
                        marker.setPosition(results[0].geometry.location);
                        if (options) {
                            if (options.icon) {
                                marker.setIcon(options.icon);
                            }

                            if (options.title) {
                                marker.setTitle(options.title);
                            }

                            if (options.infoWindowText) {

                                var infoWindow = new google.maps.InfoWindow();
                                infoWindow.setContent(options.infoWindowText);
                                google.maps.event.addListener(marker, 'click', (function(marker) {
                                    return function() {
                                        infoWindow.open(widget._gmap.map, marker);
                                    }
                                })(marker));
                            }
                        }

                        widget._gmap.overlay.push({
                            marker: marker,
                            infoWindow: infoWindow,
                            address: lnglat,
                            entityKey: id
                        });
                        google.maps.event.addListener(marker, 'click', (function() {
                            return function() {
                                widget.source.selectByKey(id);
                            }
                        })());
                        return marker;
                    } else {
                        return null;
                    }
                });
            }
        },

        /**
         * Deletes all markers in the array by removing references to them
         */
        _deleteOverlays: function _deleteOverlays() {
            var overlaySize = this._gmap.overlay.length;
            if (overlaySize !== 0) {
                for (var i = 0; i < overlaySize; i++) {
                    if ('setMap' in this._gmap.overlay[i].marker) {
                        this._gmap.overlay[i].marker.setMap(null);
                    }
                }
                this._gmap.overlay.length = 0;
            }
        },

        /**
         * Get object that conaintes markers, address, infoWindow and position of the selected element
         * @param {int} entityKey
         * @return  {object}
         */
        _getOverlay: function _getOverlay(entityKey) {

            if (this._gmap.overlay) {
                for (var i in this._gmap.overlay) {
                    if (this._gmap.overlay[i].entityKey == entityKey) {
                        return this._gmap.overlay[i];
                    }
                }
            }
            return null;
        },

        /**
         * 
         */
        _initialize: function _initialize() {
            var
            widget,
            markerNb;
            
            if (!this.source) {
                return;
            }

            // How many markers we can display in the map, default value is 1
            widget      = this;
            markerNb    = parseInt(this.config['data-marker-number'], 10);

            this._setMap();

            if (widget.source.getPosition() >= 0) {

                widget.lower = 0;
                widget.upper = ((widget.lower + markerNb) < this.source.length) ? widget.lower + markerNb: this.source.length;
                
                
                this._setOverLay(widget.lower, widget.upper, widget.source.getCurrentElement().getKey(), false);

                if (widget._gmap.events && widget._gmap.events.length > 0) {

                    for (var i = 0; i < widget._gmap.events.length; i++) {

                        if (widget._gmap.events[i].type === "onCurrentElementChange") {
                            widget._onCurrentElementChange(widget._gmap.events[i].e, widget, markerNb);

                        } else if (widget._gmap.events[i].type === "onCollectionChange") {
                            if(widget.source._private.currentEntity){
                                var entityKey = widget.source._private.currentEntity.getKey();
                                widget.lower = 0;
                                widget.upper = ((widget.lower + markerNb) < widget.source.length) ? widget.lower + markerNb: widget.source.length;
                                widget.source.select(0);
                                widget._deleteOverlays();
                                var selectedEntity = widget._getOverlay(entityKey);
                                if (selectedEntity != null) {
                                    widget._updateSelected(selectedEntity);
                                }
                            }
                            widget._deleteOverlays();

                        } else if (widget._gmap.events[i].type === "onCurrentElementSaveEvents") {
                            widget._onCurrentElementSave(e, widget, markerNb);
                        }
                    }
                }

                this.source.addListener("all", function(e) {
                    switch (e.eventKind) {
                        case "onCurrentElementChange":
                            widget._onCurrentElementChange(e, widget, markerNb);
                            break;

                        case "onCollectionChange":
                            if(widget.source._private.currentEntity){
                                var entityKey = widget.source._private.currentEntity.getKey();
                                widget.lower = 0;
                                widget.upper = ((widget.lower + markerNb) < widget.source.length) ? widget.lower + markerNb: widget.source.length;
                                widget.source.select(0);
                                widget._deleteOverlays();
                                var selectedEntity = widget._getOverlay(entityKey);
                                if (selectedEntity != null) {
                                    widget._updateSelected(selectedEntity);
                                }
                            }
                            widget._deleteOverlays();
                            break;

                        case "onElementSaved":
                            widget._onCurrentElementSave(e, widget, markerNb);
                            break;
                    }
                }, {
                    id: this.id
                });
            }
        },

        /**
             * this function is called every 0.5 seconds until the google map api is loaded. then it clears interval
             */
        _isGMapsLoaded: function _isGMapsLoaded() {
            if (waf.__googleMaps__.isLoaded) {
                window.clearInterval(this._gmap.interval);
                this._initialize();
            }
        },

        _onCurrentElementChange: function _onCurrentElementChange(e, widget, markerNb) {

            var
            mFlag,
            entityKey,
            selectedEntity,
            currentposition;
            
            currentposition = widget.source.getPosition();

            if (currentposition >= 0) {
                // we show markerNb on map, if the selected element in the datasource is already displayed,
                // then we do not refreash the map.
                // otherwise, we alter the upper and lower limits, we set the mFlag idicator to true and 
                // we put markers of each element betweeen lower and upper.
                mFlag       = false;
                entityKey   = e.dataSource._private.currentEntity.getKey();
                
                if (currentposition >= widget.upper) {
                    widget.upper = ((currentposition + markerNb) < widget.source.length) ? currentposition + markerNb: widget.source.length;
                    widget.lower = widget.upper - markerNb;
                    mFlag = true;
                }

                if (currentposition < widget.lower) {
                    widget.upper = (currentposition - markerNb + 1) >= 0 ? currentposition + 1: markerNb;
                    widget.lower = widget.upper - markerNb;
                    mFlag = true;
                }
                if (mFlag || widget._gmap.overlay.length == 0) {
                    //add new markers
                    widget._setOverLay(widget.lower, widget.upper, entityKey, true);
                }

                selectedEntity = widget._getOverlay(entityKey);
                
                if (selectedEntity != null) {
                    widget._updateSelected(selectedEntity);
                }
            }
        },

        _onCurrentElementSave: function _onCurrentElementSave(e, widget, markerNb) {
            var
            entityKey,
            currentposition;
            
            entityKey       = e.dataSource._private.currentEntity.getKey();
            currentposition = e.position;

            if (currentposition >= 0) {

                if (currentposition >= widget.upper) {
                    widget.upper = ((currentposition + markerNb) < widget.source.length) ? currentposition + markerNb: widget.source.length;
                    widget.lower = widget.upper - markerNb;
                }

                if (currentposition < widget.lower) {
                    widget.upper = (currentposition - markerNb + 1) >= 0 ? currentposition + 1: markerNb;
                    widget.lower = widget.upper - markerNb;
                }

                //add new marker
                widget._setOverLay(widget.lower, widget.upper, entityKey, true);
            }
        },

        /**
             * Build infowindow's text 
             * @param e {object} event contains a summarized copy of the retrieved entity from datasource
             * @param infoWindowSource {object} : containes one or too many attributes name, it might be sourended by html tags and string
             * @return {string} : infowindow text
             */
        _parseInfoWindow: function _parseInfoWindow(e, infoWindowSource) {
            /* infoWindow could be:
                 * attribute
                 * attribute.relatedAtt
                 * left<%attribute%>right
                 * left<%attribute.relatedAtt%>right
                 * right and left may contains html tags
                */
            var 
            left = '',
            right = '',
            content = '', // source.attribute
            attribute = '', // attribute || attribute.relatedAtt
            infoWindowTxt = '', // infowWindowTxt = left + content + right
            infoWindowRows;

            infoWindowRows = infoWindowSource.split('+,');

            for (var j = 0; j < infoWindowRows.length; j++) {

                var 
                cell            = infoWindowRows[j].split('+:'),
                attributeTxt    = cell[0],
                endLine         = cell[1],
                leftIndex       = attributeTxt.indexOf("<%");

                // if the source is written between <% %>
                if (leftIndex != -1) {
                    var rightIndex;

                    rightIndex = attributeTxt.indexOf("%>");
                    left = attributeTxt.substring(0, leftIndex);
                    right = attributeTxt.substring(rightIndex + 2, cell[0].length);
                    attribute = attributeTxt.substring(leftIndex + 2, rightIndex);
                //attribute   = attribute.split('.');
                } else {
                    //bubbleSource = cell[0].split('.'); 
                    attribute = attributeTxt;
                }

                // in case the attribute is written as attribute.attribute
                if (attribute.indexOf(".") != -1) {
                    var arr = attribute.split('.');
                    // the first attribute is the name of the source, we can ommited
                    if (arr[0] == this.config['data-binding']) {
                        attribute = arr[1];
                        content = e.element[attribute];
                    }
                    // in case of related attribute
                    else {

                        var dataClass = this.source.getDataClass();
                        if (dataClass[arr[0]].kind == "relatedEntity") {
                            var className = this.source.getClassTitle().toLowerCase();
                            var relatedAtt = arr[0];
                            var att = arr[1];
                            sources[className][relatedAtt].load({
                                onSuccess: function(event)
                                // only if there is a current entity in the person datasource
                                {
                                    content = event.entity[att].getValue();
                                },
                                sync: true
                            });
                        }
                    }
                } else {
                    content = e.element[attribute] ? e.element[attribute] : '';
                }

                infoWindowTxt = infoWindowTxt + left + content + right;

                left = '';
                right = '';

                if (endLine === 'true') {
                    infoWindowTxt += '<br />';
                }
            }
            return infoWindowTxt;
        },

        /**
         * 
         */
        _updateSelected: function _updateSelected(selectedEntity) {

            var selectedMarkerIcon = this.config['data-marker-icon-selected'];
            var markerIcon = this.config['data-marker-icon'];

            if (!markerIcon) {
                markerIcon = '/walib/WAF/widget/googleMaps/icons/red-dot.png';
            }
            if (!selectedMarkerIcon) {
                selectedMarkerIcon = '/walib/WAF/widget/googleMaps/icons/blue-dot.png';
            }

            // rest icon and infoWindow of the old selected marker
            if (this._gmap.selectedOverlay && this._gmap.selectedOverlay.marker) {
                this._gmap.selectedOverlay.marker.setIcon(markerIcon);
                this._gmap.selectedOverlay.marker.setZIndex(undefined);
            }

            if (this._gmap.selectedOverlay && this._gmap.selectedOverlay.infoWindow) {
                this._gmap.selectedOverlay.infoWindow.close();
            }

            if (selectedEntity && selectedEntity.marker) {
                // change icon
                selectedEntity.marker.setIcon(selectedMarkerIcon);
                selectedEntity.marker.setZIndex(9999);
            }
            
            if (selectedEntity ){
                if (selectedEntity.marker) {
                    // change icon
                    selectedEntity.marker.setIcon(selectedMarkerIcon);
                    selectedEntity.marker.setZIndex(9999);
                }
                if (selectedEntity.address) {
                    //Changes the center of the map to the given LatLng. If the change is less than both the width and height of the map, 
                    //the transition will be smoothly animated.
                    this._gmap.map.panTo(selectedEntity.address);

                }

                // Open infoWindow if autodisplay is true
                if (selectedEntity.infoWindow && this.config['data-infowindow-display'] === 'true') {
                    selectedEntity.infoWindow.open(this._gmap.map, selectedEntity.marker);
                }

                this._gmap.selectedOverlay = selectedEntity;
            } 
            
            if (!selectedEntity && parseInt(this.config['data-marker-number'], 10) == 1){
                this._deleteOverlays();
            }
        },

        /**
         * Add infoWindow to a marker if there is
         * @param {object} e:  event contains a summarized copy of the retrieved entity from datasource
         * @param {object} marker: a geographic coordinate
         * @return {object} return the created infowindow if there is binding, null otherwise
         */
        _setInfoWindow: function _setInfoWindow(e, marker) {

            var widget = this;
            var infoWindowSource = this.config['data-infowindow'];
            if (!infoWindowSource) {
                return null;
            }

            var infoWindow = new google.maps.InfoWindow();
            var text = widget._parseInfoWindow(e, infoWindowSource);
            if (text) {
                infoWindow.setContent(text);
                google.maps.event.addListener(marker, 'click', (function(marker) {
                    return function() {
                        infoWindow.open(widget._gmap.map, marker);
                    }
                })(marker));
            }

            return infoWindow;
        },

        /**
         *
         */
        _setMap: function _setMap() {
            
            var
            widget,
            mapType,
            panCtrl,
            mapZoom,
            zoomCtrl,
            scaleCtrl,
            myOptions,
            streetViewCtrl;
            
            widget          = this;
            mapType         = this.config["data-mapType"];
            mapZoom         = parseInt(this.config["data-zoom"]);
            panCtrl         = this.config["data-panControl"];
            zoomCtrl        = this.config["data-zoomControl"];
            scaleCtrl       = this.config["data-scaleControl"];
            streetViewCtrl  = this.config["data-streetView"];

            myOptions       = {
                mapTypeId           : mapType,
                zoom                : mapZoom,
                center              : new google.maps.LatLng(0, 0),
                panControl          : ("true" === panCtrl),
                zoomControl         : ("true" === zoomCtrl),
                scaleControl        : ("true" === scaleCtrl),
                streetViewControl   : ("true" === streetViewCtrl)
            };

            this._gmap.map  = new google.maps.Map(document.getElementById(this.id), myOptions);
            
            google.maps.event.addListener(this._gmap.map, 'click', function(e) {
                var event = $.Event('click', {
                    e: e,
                    map: widget._gmap.map
                });
                $(widget).trigger(event);
            });
            
            google.maps.event.addListener(this._gmap.map, 'dblclick', function(e) {
                var event = $.Event('dblclick', {
                    e: e,
                    map: widget._gmap.map
                });
                $(widget).trigger(event);
            });
            
            google.maps.event.addListener(this._gmap.map, 'mouseover', function(e) {
                var event = $.Event('mouseover', {
                    e: e,
                    map: widget._gmap.map
                });
                $(widget).trigger(event);
            });
        },

        /**
         * @param {object} e:  event contains a summarized copy of the retrieved entity from datasource
         * @param {object} langlat: a geographic coordinate
         * @return {object} return the created marker
         */
        _setMarker: function _setMarker(e, langlat) {

            var
            marker,
            widget,
            markerIcon,
            tooltipSource;
            
            widget          = this;
            markerIcon      = this.config['data-marker-icon'] || '';
            tooltipSource   = this.config['data-binding-tooltip'] || '';
            
            marker          = new google.maps.Marker({
                map: widget._gmap.map  // initiate the marker with our map
            });
            
            if(tooltipSource.indexOf('.') != -1) {
                tooltipSource = tooltipSource.substr(tooltipSource.indexOf('.') +1);
            }

            if (!markerIcon) {
                markerIcon = '/walib/WAF/widget/googleMaps/icons/red-dot.png';
            }
            
            // set marker postion to the returned result
            marker.setPosition(langlat);
            marker.setIcon(markerIcon);
            
            if (tooltipSource) {
                var tooltip = e.element[tooltipSource];
                if (tooltip && tooltip.length > 0) {
                    marker.setTitle(e.element[tooltipSource]);
                }
            }
            
            google.maps.event.addListener(marker, 'click', (function() {
                return function(event) {
                    widget.source.select(e.position);
                    var jQueryEvent = $.Event('markerClick', {
                        e: event,
                        marker: marker,
                        entity : e.element._private.currentEntity
                    });
                    $(widget).trigger(jQueryEvent);

                }
            })());
            
            google.maps.event.addListener(marker, 'dblclick', (function() {
                return function(event) {
                    widget.source.select(e.position);
                    var jQueryEvent = $.Event('markerDblclick', {
                        e: event,
                        marker: marker,
                        entity : e.element._private.currentEntity
                    });
                    $(widget).trigger(jQueryEvent);
                }
            })());
            
            google.maps.event.addListener( marker, 'mouseover', (function() {
                return function(event) {
                    var jQueryEvent = $.Event('markerMouseover', {
                        e: event,
                        marker: marker,
                        entity : e.element._private.currentEntity
                    });
                    $(widget).trigger(jQueryEvent);
                }
            })());
            

            return marker;
        },

        /**
         * @param {int} entityKey: 
         * @param {int} lower: 
         * @param {int} upper: 
         * @param {function} clearOverLayFlag: 
         */
        _setOverLay: function _setOverLay(lower, upper, entityKey, clearOverLayFlag) {

            var 
            widget,
            geocoder,
            errorDiv,
            addressSource;

            
            widget          = this;
            geocoder        = new google.maps.Geocoder();
            addressSource   = this.config['data-address'];
            
            if(addressSource.indexOf('.') != -1) {
                addressSource = addressSource.substr(addressSource.indexOf('.') +1);
            }
            
            errorDiv = this.getErrorDiv();
            if (errorDiv) {
                errorDiv.hide();
            }

            for (var i = lower; i < upper; i++) {

                widget.source.getElement(i, {

                    onSuccess: function(e) {

                        if (e.element == null) {
                            return;
                        }

                        var address = e.element[addressSource];
                        if (address && address !== '') {

                            if (address.match(/\b-?\d+\.\d+,\s?-?\d+\.\d+\b/)) {

                                if (clearOverLayFlag) {
                                    widget._deleteOverlays();
                                    clearOverLayFlag = false;
                                }

                                var coord,
                                lnglat,
                                marker,
                                infoWindow;

                                coord = address.split(',');
                                lnglat = new google.maps.LatLng(parseFloat(coord[0]), parseFloat(coord[1]));
                                marker = widget._setMarker(e, lnglat);
                                infoWindow = widget._setInfoWindow(e, marker);

                                var selectedEntity = {
                                    marker: marker,
                                    infoWindow: infoWindow,
                                    address: lnglat,
                                    entityKey: e.element._private.currentEntity.getKey()
                                };

                                widget._gmap.overlay.push(selectedEntity);

                                if (entityKey === e.element._private.currentEntity.getKey()) {
                                    widget._updateSelected(selectedEntity);
                                }

                            } else {

                                geocoder.geocode({
                                    'address': address
                                }, function(results, status) {
                                    var 
                                    marker,
                                    infoWindow,
                                    selectedEntity;
                                    
                                    if (status == google.maps.GeocoderStatus.OK) {

                                        if (clearOverLayFlag) {
                                            widget._deleteOverlays();
                                            clearOverLayFlag = false;
                                        }
                                        
                                        marker      = widget._setMarker(e, results[0].geometry.location);
                                        infoWindow  = widget._setInfoWindow(e, marker);

                                        selectedEntity = {
                                            marker      : marker,
                                            address     : results[0].geometry.location,
                                            entityKey   : e.element._private.currentEntity.getKey(),
                                            infoWindow  : infoWindow
                                        };

                                        widget._gmap.overlay.push(selectedEntity);

                                        if (entityKey === e.element._private.currentEntity.getKey()) {
                                            widget._updateSelected(selectedEntity);
                                        }

                                    } else {
                                        var 
                                        errorDiv = widget.getErrorDiv();
                                        if(errorDiv) {
                                            // geocode faild to return coordinates (i.e. invalide address)
                                            widget.setErrorMessage({
                                                message: address+" is an invalid address"
                                            }); 
                                            widget.getErrorDiv().show(); 
                                        }
                                        
                                        // rest icon and infoWindow of the old selected marker
                                        widget._updateSelected(null);
                                    }
                                });
                            }
                        }
                    }
                });
            }
        }
    }
);