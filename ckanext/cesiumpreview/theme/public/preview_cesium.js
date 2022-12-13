// json preview module
ckan.module('cesiumpreview', function (jQuery, _) {
    var options = '';
    var catalog_url = "";
    var explorer = false;
    var vis_server = 'https://vmcatalog.nso.go.th';
    var countryLatLongMapper = {
	    "odc": {"lon": 105.0, "lat": 13.0},
        "odl": {"lon": 105.0, "lat": 18.0},
        "odmy": {"lon": 98.0, "lat": 22.0},
        "odv": {"lon": 106.266, "lat": 9.632},
        "odt": {"lon": 100.992, "lat": 15.87}
    }

    var config = {
        "version": "0.0.03",
        "initSources": [{
            "catalog": [],
            "catalogIsUserSupplied": true,
        }]
    };

    var _genConfig = function () {

            // load dataset spatial extent as default home camera if available
            if (window.spatial && window.spatial != '') {
                var extent;
                if (typeof(window.spatial) == typeof('')) {
                    extent = JSON.parse(window.spatial); //[WSEN]
                } else {
                    extent = window.spatial;
                }

                if (extent[0] != extent[2]) {
                    config["initSources"][0]['initialCamera'] = {west: extent[0],
                                                                 south: extent[1],
                                                                 east: extent[2],
                                                                 north: extent[3]}
                }
            }

            var resourceToItem = function(resource) {
                var item = {
                    "type": "kml",
                    "name": "",
                    "isUserSupplied": true,
                    "isOpen": true,
                    "isEnabled": true,
                    "isShown": true,
                    "zoomOnEnable": true,
                    "url": "http://"
                }
                var lang = $('html').attr('lang') || 'en';
                var country_code = $('body').attr('class') || 'default';
                if (Object.keys(countryLatLongMapper).includes(country_code)) {
                    var Camera = {
                        "lookAt": {
                        "targetLongitude": countryLatLongMapper[country_code].lon,
                        "targetLatitude": countryLatLongMapper[country_code].lat,
                        "targetHeight": 0,
                        "heading": 0,
                        "pitch": 90,
                        "range": 1000000
                        }
                    }
                    //if (!(config["initSources"][0]['initialCamera'])) {
			//config["initSources"][0]['initialCamera'] = Camera;
		    //}
                }

                if (config["initSources"][0]['initialCamera']) {
                    item['zoomOnEnable'] = false;
                }

                if (resource['name_translated']) {
                    item['name'] = resource['name_translated'][lang] || resource['name_translated']['en']
                }

                if (!item['name'] && resource['name']) {
                    item['name'] = resource['name'];
                }

                if (!item['name']) {
                    item['name'] = "User Data"
                }

                if (resource['package_description']) {
                    item['description'] = resource['package_description']
                } else if (window.pkg && window.pkg['notes_translated'] && window.pkg['notes_translated'][lang]) {
                    item['description'] = pkg['notes_translated'][lang]
                }

                if (window.pkg) {
                    item['dataUrl'] = ckan.url('/dataset/' + pkg['name'], true);
                    item['dataUrlType'] = 'direct';
                } else {
                    item['dataUrl'] = ckan.url('/dataset/' + resource['package_id'], true);
                    item['dataUrlType'] = 'direct';
                }

                item['url'] = resource['url'];
                if (resource['url'].indexOf('http') !== 0) {
                    item['url'] = "http:" + resource['url'];
                }
                item['type'] = resource['format'].toLowerCase();

                if (typeof resource['feature_info_template'] != 'undefined' &&
                    resource['feature_info_template'] != '' ) {
                    item['featureInfoTemplate'] = resource['feature_info_template']
                }

                if (item['type'] == 'wms' || item['type'] == 'wfs') {
                    // if wms_layer specified in resource, display that layer/layers by default
                    if (typeof resource['wms_layer'] != 'undefined' && resource['wms_layer'] != '') {
                        item['layers'] = resource['wms_layer'];
                        // hack -- UNDO SOONEST, just use the workspace not the item
                        var re = new RegExp('(geoserver/[^/]*/)([^/]*/)(wms)');
                        item['url'] = item['url'].replace(re, "$1$3");
                        item['hideLayerAfterMinScaleDenominator'] = true
                    }
                    else {
                        item['type'] = item['type'] + '-getCapabilities';
                    }
                }
                if (item['type'] == 'arcgis rest api') {
                    item['type'] = 'esri-mapServer-group';
                }

                if (typeof resource['isLegendVisible'] != 'undefined') {
                    item['isLegendVisible'] = resource['isLegendVisible']
                }

                if (typeof resource['isShown'] != 'undefined') {
                    item['isShown'] = resource['isShown']
                }

                if (window.cql_filter) {
                    item['parameters'] = { 'cql_filter': _genFilter(window.cql_filter) };
                }
                return item
            }


            if (Array.isArray(preload_resource)) {
                config["initSources"][0]['catalog'] = preload_resource.map(resourceToItem)
            } else {
                config["initSources"][0]['catalog'][0] = resourceToItem(preload_resource)
            }

            return config;
        }

        var _genHash = function() {
            var encoded_config = encodeURIComponent(JSON.stringify(_genConfig()));

            if (window.terriamap_options) {
                options = jQuery.param(window.terriamap_options) + '&'
            }
            if (window.catalog_url) {
                catalog_url = window.catalog_url + "&"
            }

            return catalog_url + options + 'map=2d&start=' + encoded_config;
        }

        var _genIframeUrl = function() {
            //N.B. add "clean" to have a viewer only for this dataset - we removed this
            var lang = $('html').attr('lang') || '';
            var country_code = $('body').attr('class') || 'default';
            if (lang) {
                if (lang == 'en') {
                    lang = 'en_US';
                }
                lang = "?lang=" + lang
            }

            if (window.explorer) {
                if (lang) {
                    lang = lang + '&explorer=true';
                } else
                    lang = "?explorer=true";
            }

            return vis_server + lang + '&country_code=' + country_code + '#' + _genHash()

    };

    var _genFilter = function(cql_filter) {
        /* filter: (key1=value1 OR key1=valueB) AND (key2=value2)
           { key: [value1, value2], key2: value2 }  */
        var filters = Object.keys(cql_filter).map(function (k) {
            if (typeof(cql_filter[k]) == typeof([])) {
                return "(" + cql_filter[k].map( (v) => k + "='" + v + "'").join(" OR ") + ")";
            } else {
                return k +"='" + cql_filter[k] +"'"
            }
        })
        return filters.length ?  '(' + filters.join(" AND ") + ')' : undefined;
    }

    var _parseFilter = function() {
        window.cql_filter = {}
        var params = new URLSearchParams(window.location.search)
        var filters = params.get('filters').trim()
        if (!filters) { return }
        filters.split('|').forEach(function(e) {
            var elts = e.split(':')
            var key = elts.shift()
            var value = elts.join(":")
            if (window.cql_filter[key]) {
                window.cql_filter[key].push(value)
            } else {
                window.cql_filter[key] = [value]
            }
        })
    };

    var _getBoundingBoxes = function(cql_filter, cb_done) {
        var deferreds = [];
        var _boxRequest = function(wms_resource) {
            params = {"cql_filter": cql_filter,
                      'maxFeatures':'101',
                      'service':'WFS',
                      'version':'1.1.0',
                      'request':'GetFeature',
                      'typeName': wms_resource['wms_layer'],
                      'outputFormat':'application/json',
                      'srsName':'EPSG:4326',
                     }
            return $.ajax(wms_resource['wms_server'], {
                data: params,
                method: 'GET'}
                         )
        }

        if (Array.isArray(preload_resource)) {
            deferreds = preload_resource.map(_boxRequest)
        } else {
            deferreds = [_boxRequest(preload_resource)]
        }

        // make all of the requests, then process.
        $.when.apply($,deferreds).then(function() { // success
            var objects=arguments; // The array of resolved objects as a pseudo-array
            // objects is a list of [[data, status, jqXHR], ... ]
            // write the final bbox to window.spatial
            // This hoists the bbox from the response,
            // runs min/max on the values,
            // and then adds/subtracts scale from the values, and rounds to precision.
            // This should ensure that there's some context around a feature, and
            // a point feature will not be zoomed in to the tightest zoom.
            try {
                var bbox = [];
                if (!Array.isArray(objects[0])) {
                    bbox = objects[0]['bbox'];
                } else {
                    bbox = Array.prototype.slice.call(objects).map(function(arr) {
                    return arr[0]['bbox'];  // hoist the bbox
                    }).reduce(function(box, current){
                        if (! current) { return box }
                        //[wsen]
                        return [ Math.min(box[0], current[0]),
                                 Math.min(box[1], current[1]),
                                 Math.max(box[2], current[2]),
                                 Math.max(box[3], current[3]) ]
                    })
                }
                // expand/round
                var scale = 0.3
                var precision = 1
                // non point bounding boxes
                bbox = [ Number.parseFloat((bbox[0] - scale).toFixed(precision)),
                         Number.parseFloat((bbox[1] - scale).toFixed(precision)),
                         Number.parseFloat((bbox[2] + scale).toFixed(precision)),
                         Number.parseFloat((bbox[3] + scale).toFixed(precision)) ]

                window.spatial = bbox
            } catch (e) {
                console.log(e)
                console.log(objects)
                // just quietly bail on errors
                window.spatial = undefined
            }
            cb_done()
        }, function() { // fail
            // just fall through and call the done callback
            window.spatial = undefined
            cb_done()
        })
    }

    var _onpopstate = function(e, state) {
        _parseFilter()
        var target = $("iframe#cesiumpreview_frame")[0].contentWindow;
        // Posting message doesn't seem to be getting through.
        //target.postMessage(_genConfig(), window.origin)
        _getBoundingBoxes(_genFilter(window['cql_filter'] || {}), function() {
            target.location.hash = _genHash()
        })
    }

    var _onmessage = function(e, state) {
        var target = $("iframe#cesiumpreview_frame")[0].contentWindow;
        if (e.source === target && e.data === 'ready') {
            console.log("Map is ready")
        }
    }

    return {
            initialize: function () {
            var self = this;
            var url = _genIframeUrl();

            var style = 'height: 600px; width: 100%; border: none;';
            var display = 'allowFullScreen="true" mozAllowFullScreen="true" webkitAllowFullScreen="true"';

            // This is for fullscreen terriamap button
            // Problem how to get translated string for Fullscreen????
            var wms_fullscreen_tag = '<a class="btn btn-primary" target="_blank" href="'+url+'"><i class="fa fa-arrows-alt"></i>Fullscreen</a>';
            var actions = '<div class="actions">'+wms_fullscreen_tag+'</div>'
            $('div.module-content:first').prepend(actions);

            var html = '<iframe id="cesiumpreview_frame" src="' + url + '" style="' + style + '" ' + display + '></iframe>';
            self.el.html(html);

            $(window).on('popstate', _onpopstate);
            window.addEventListener('message', _onmessage);

            try{
                $('.map-explorer-fullscreen').css('display', 'block');
                $('.map-explorer-fullscreen>a').attr("href", url);
           } catch(e) {}


           // Start Config User add data
           var config = {
            "version": "0.0.03",  
            "initSources": [
            {
                "catalog": [
                 {
                        "type": "group",
                        "name": "User-Added Data",
                        "description": "The group for data that was added by the user via the Add Data panel.",
                        "isUserSupplied": true,
                        "isOpen": true,
                        "items": [{
                            "type": "kml",
                            "name": "ข้อมูลผู้ใช้กำหนดเอง",
                            "isUserSupplied": true,
                            "isOpen": true,
                            "isEnabled": true,
                            "url": "http://"
                        }]
                    }
                ],
                "catalogIsUserSupplied": true,
                "homeCamera": {
                    "north": 83,
                    "east": 135,
                    "south": -55,
                    "west": 66,
                    "lookAt": {
                        "targetLongitude": 100.5633786,
                        "targetLatitude": 13.8819295,
                        "targetHeight": 1500000,
                        "heading": 0,
                        "pitch": 90,
                        "range": 1000
                    }
                },
                "initialCamera": {
                    "north": 83,
                    "east": 135,
                    "south": -55,
                    "west": 66,
                    "lookAt": {
                        "targetLongitude": 100.5633786,
                        "targetLatitude": 13.8819295,
                        "targetHeight": 1450000,
                        "heading": 0,
                        "pitch": 90,
                        "range": 1000
                    }
                },
            }
            ]
        };

            if (spatial != '') {
                extent = geojsonExtent(JSON.parse(spatial)); //[WSEN]
                if (extent[0] != extent[2]) {
                    config["initSources"][0]['homeCamera']['west'] = extent[0];
                    config["initSources"][0]['homeCamera']['south'] = extent[1];
                    config["initSources"][0]['homeCamera']['east'] = extent[2];
                    config["initSources"][0]['homeCamera']['north'] = extent[3];
                }
            }
            
            config["initSources"][0]['catalog'][0]['items'][0]['url'] = preload_resource['url'];
                if (preload_resource['url'].indexOf('http') !== 0) {
                    config["initSources"][0]['catalog'][0]['items'][0]['url'] = "http:" + preload_resource['url'];
                }
            config["initSources"][0]['catalog'][0]['items'][0]['type'] = preload_resource['format'].toLowerCase();
            
            if (config["initSources"][0]['catalog'][0]['items'][0]['type'] == 'wms' || config["initSources"][0]['catalog'][0]['items'][0]['type'] == 'wfs') {
                // if wms_layer specified in resource, display that layer/layers by default
                if (typeof preload_resource['wms_layer'] != 'undefined' && preload_resource['wms_layer'] != '') {
                    config["initSources"][0]['catalog'][0]['items'][0]['layers'] = preload_resource['wms_layer'];
                }
                else {
                    config["initSources"][0]['catalog'][0]['items'][0]['type'] = config["initSources"][0]['catalog'][0]['items'][0]['type'] + '-getCapabilities';
                }
            }
            if (config["initSources"][0]['catalog'][0]['items'][0]['type'] == 'arcgis rest api') {
                config["initSources"][0]['catalog'][0]['items'][0]['type'] = 'esri-mapServer-group';
            }
    
                var encoded_config = encodeURIComponent(JSON.stringify(config));
                var style2 = 'height: 600px; width: 100%; border: none;';
                var display2 = 'allowFullScreen mozAllowFullScreen webkitAllowFullScreen';
                var vis_server = 'https://vmcatalog.nso.go.th';
    
                var html = '<iframe src="' + vis_server + '#start=' + encoded_config + '" style="' + style2 + '" ' + display2 + '></iframe>';
    
                console.log(html);
    
                self.el.html(html);

        }
    }
});
