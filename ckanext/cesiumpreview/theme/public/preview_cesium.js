// json preview module
ckan.module('cesiumpreview', function (jQuery, _) {
    return {
        initialize: function () {
            var self = this;

//      var vis_server = 'http://localhost';  //local
//      var vis_server = 'http://nationalmap.nicta.com.au/';
	var vis_server = 'https://vmcatalog.nso.go.th/';
	
	var spatial ='';
        var preload_resource='';
        var extent='';
		
            var config = {
                "version": "0.0.03",
		
		"initializationUrls":[{
                    "catalog":[
                        {
                            "type":"group",
                            "name":"Data Catalogue",
                            "description":"test data set on left button",
                            "members":[
                                {
                                    "type": "ersi-mapServer",
                                    "name": "Data Catalogue",
                                    "isUserSupplied": true,
                                    "isOpen": true,
                                    "isEnabled": true,
                                    "url": "https://gistdaportal.gistda.or.th/data/rest/services/GWater/Gistda_water_flood_site/MapServer/9"
                                }
                            ]
                        }
                    ]
                }],
		    
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
                                "hideSource": true,
                                "show":true,
                                "zoomOnAddToWorkbench": true,	
                                "isEnabled": true,
                                "url": "https://"
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
            // load dataset spatial extent as default home camera if available
            if (spatial != '') {
                extent = geojsonExtent(JSON.parse(spatial)); //[WSEN]
                if (extent[0] != extent[2]) {
                    config["initSources"][0]['homeCamera']['west'] = extent[0];
                    config["initSources"][0]['homeCamera']['south'] = extent[1];
                    config["initSources"][0]['homeCamera']['east'] = extent[2];
                    config["initSources"][0]['homeCamera']['north'] = extent[3];
                }
            }
		
// test code
            config["initializationUrls"][0]['catalog'][0]['members'][0]['url'] = preload_resource['url'];
            if (preload_resource['url'].indexOf('https') !== 0) {
                config["initializationUrls"][0]['catalog'][0]['members'][0]['url'] = "https:" + preload_resource['url'];
            }
            config["initializationUrls"][0]['catalog'][0]['members'][0]['type'] = preload_resource['format'].toLowerCase();

            if (config["initializationUrls"][0]['catalog'][0]['members'][0]['type'] == 'wms' || config["initializationUrls"][0]['catalog'][0]['members'][0]['type'] == 'wfs') {
                // if wms_layer specified in resource, display that layer/layers by default
                if (typeof preload_resource['wms_layer'] != 'undefined' && preload_resource['wms_layer'] != '') {
                    config["initializationUrls"][0]['catalog'][0]['members'][0]['layers'] = preload_resource['wms_layer'];
                } else {
                    config["initializationUrls"][0]['catalog'][0]['members'][0]['type'] = config["initializationUrls"][0]['catalog'][0]['members'][0]['type'] + '-getCapabilities';
                }
            }
            if (config["initializationUrls"][0]['catalog'][0]['members'][0]['type'] == 'arcgis rest api') {
                config["initializationUrls"][0]['catalog'][0]['members'][0]['type'] = 'esri-mapServer-group';
            }

// original code

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
            var style = 'height: 600px; width: 100%; border: none;';
            var display = 'allowFullScreen mozAllowFullScreen webkitAllowFullScreen';

            var html = '<iframe src="' + vis_server + '#clean&start=' + encoded_config + '" style="' + style + '" ' + display + '></iframe>';

            console.log(html);

            self.el.html(html);
        }
    };
});
