// json preview module
ckan.module('cesiumpreview', function(jQuery, _) {
    return {
        initialize: function() {
            var self = this;

            var vis_server = this.options.vis_server;
            // var vis_server = 'https://vmcatalog.nso.go.th/';
            // var vis_server = 'https://nationalmap.gov.au/';

            var config = {
                "version": "0.0.03",
                "initSources": [{
                    "catalog": [{
                            "type": "esri-mapServer-group",
                            "name": "Catchment Scale Land Use",
                            "id": "354db2f2",
                            "url": "https://www.asris.csiro.au/arcgis/rest/services/abares/clum_50m_2018/MapServer",
                            "forceProxy": true
                        },
                        {
                            "id": "5z6OTFssaW",
                            "name": "CSIRO Soil and Landscape Grid",
                            "url": "https://www.asris.csiro.au/arcgis/rest/services/TERN",
                            "type": "esri-group"
                        },
                        {
                            "id": "6ada988252b4",
                            "type": "sdmx-group",
                            "name": "TNSO Data Hub",
                            "url": "https://ns1-oshub.nso.go.th/rest"
                        },
                        {
                            "id": "6ada988252b5",
                            "type": "sdmx-group",
                            "name": "Pacific Data Hub",
                            "url": "https://stats-nsi-stable.pacificdata.org/rest"
                        },
                        {
                            "id": "58b57301b7e0",
                            "type": "esri-group",
                            "name": "พื้นที่อ่อนไหวต่อการเกิดแผ่นดินถล่ม",
                            "url": "https://gisportal.dmr.go.th/arcgis/rest/services/HAZARD/LANDSLIDE_SUSCEPTIBILITY/MapServer"
                        },
                        {
                            "id": "810be172e072",
                            "type": "wms-group",
                            "name": "ประชากรและสำมะโนประชากร",
                            "members": [{
                                "type": "wms",
                                "name": "จำนวนประชากรในประเทศไทย (2562)",
                                "id": "zrPtHVJcPi",
                                "url": "https://data.opendevelopmentmekong.net/geoserver/ODMekong/populationthailand_th/wms"
                            }]
                        },
                        {
                            "id": "810be172e072",
                            "type": "wms-group",
                            "name": "เขตการปกครอง",
                            "members": [{
                                "id": "6ada988252b3",
                                "type": "geojson",
                                "name": "แบ่งเขตพื้นที่จังหวัด",
                                "url": "https://demo.gdcatalog.go.th/dataset/25eba9bb-906b-47f5-94e4-d2ae936a9c15/resource/053c668f-97c1-479c-a794-6ada988252b3/download/thailandwithdensity.json"
                            }]
                        }
                    ],
                    //"initializationUrls": ["https://vmcatalog.nso.go.th/init/datacatalog.json"],
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
                    }
                }]
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
            var zero_item = config["initSources"][0]['catalog'][0]['items'][0];

            zero_item['url'] = preload_resource['url'];
            if (preload_resource['url'].indexOf('http') !== 0) {
                zero_item['url'] = "http:" + preload_resource['url'];
            }
            if (preload_resource['wms_url']) {
                zero_item['url'] = preload_resource['wms_url'];
            }
            zero_item['type'] = preload_resource['format'].toLowerCase();

            if (zero_item['type'] == 'wms') {
                // if wms_layer specified in resource, display that layer/layers by default
                if (typeof preload_resource['wms_layer'] != 'undefined' &&
                    preload_resource['wms_layer'] != '') {
                    zero_item['layers'] = preload_resource['wms_layer'];
                } else {
                    zero_item['type'] = zero_item['type'] + '-getCapabilities';
                }
            }
            if (zero_item['type'] == 'wfs') {
                if (preload_resource['typeNames'])
                    zero_item['typeNames'] = preload_resource['typeNames'];
                else
                    zero_item['type'] = zero_item['type'] + '-getCapabilities';
            }
            if (zero_item['type'] == 'aus-geo-csv' || zero_item['type'] == 'csv-geo-au') {
                zero_item['type'] = 'csv';
            }
            var encoded_config = encodeURIComponent(JSON.stringify(config));
            var style = 'height: 600px; width: 100%; border: none;';
            var display = 'allowFullScreen mozAllowFullScreen webkitAllowFullScreen';

            var html = '<iframe src="' + vis_server + '#clean&hideExplorerPanel=1&start=' + encoded_config + '" style="' + style + '" ' + display + '></iframe>';
            self.el.html(html);
        }
    };
});
