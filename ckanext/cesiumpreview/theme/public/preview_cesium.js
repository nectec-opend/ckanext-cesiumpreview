!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.geojsonExtent=e()}}(function(){return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a="function"==typeof require&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}for(var i="function"==typeof require&&require,o=0;o<r.length;o++)s(r[o]);return s}({1:[function(require,module){function getExtent(_){for(var ext=extent(),coords=geojsonCoords(_),i=0;i<coords.length;i++)ext.include(coords[i]);return ext}var geojsonCoords=require("geojson-coords"),traverse=require("traverse"),extent=require("extent");module.exports=function(_){return getExtent(_).bbox()},module.exports.polygon=function(_){return getExtent(_).polygon()},module.exports.bboxify=function(_){return traverse(_).map(function(value){value&&"string"==typeof value.type&&(value.bbox=getExtent(value).bbox(),this.update(value))})}},{extent:2,"geojson-coords":4,traverse:7}],2:[function(require,module){function Extent(){return this instanceof Extent?(this._bbox=[1/0,1/0,-1/0,-1/0],void(this._valid=!1)):new Extent}module.exports=Extent,Extent.prototype.include=function(ll){return this._valid=!0,this._bbox[0]=Math.min(this._bbox[0],ll[0]),this._bbox[1]=Math.min(this._bbox[1],ll[1]),this._bbox[2]=Math.max(this._bbox[2],ll[0]),this._bbox[3]=Math.max(this._bbox[3],ll[1]),this},Extent.prototype.union=function(other){return this._valid=!0,this._bbox[0]=Math.min(this._bbox[0],other[0]),this._bbox[1]=Math.min(this._bbox[1],other[1]),this._bbox[2]=Math.max(this._bbox[2],other[2]),this._bbox[3]=Math.max(this._bbox[3],other[3]),this},Extent.prototype.bbox=function(){return this._valid?this._bbox:null},Extent.prototype.contains=function(ll){return this._valid?this._bbox[0]<=ll[0]&&this._bbox[1]<=ll[1]&&this._bbox[2]>=ll[0]&&this._bbox[3]>=ll[1]:null},Extent.prototype.polygon=function(){return this._valid?{type:"Polygon",coordinates:[[[this._bbox[0],this._bbox[1]],[this._bbox[2],this._bbox[1]],[this._bbox[2],this._bbox[3]],[this._bbox[0],this._bbox[3]],[this._bbox[0],this._bbox[1]]]]}:null}},{}],3:[function(require,module){module.exports=function(list){function _flatten(list){return Array.isArray(list)&&list.length&&"number"==typeof list[0]?[list]:list.reduce(function(acc,item){return Array.isArray(item)&&Array.isArray(item[0])?acc.concat(_flatten(item)):(acc.push(item),acc)},[])}return _flatten(list)}},{}],4:[function(require,module){var geojsonNormalize=require("geojson-normalize"),geojsonFlatten=require("geojson-flatten"),flatten=require("./flatten");module.exports=function(_){if(!_)return[];var normalized=geojsonFlatten(geojsonNormalize(_)),coordinates=[];return normalized.features.forEach(function(feature){feature.geometry&&(coordinates=coordinates.concat(flatten(feature.geometry.coordinates)))}),coordinates}},{"./flatten":3,"geojson-flatten":5,"geojson-normalize":6}],5:[function(require,module){function flatten(gj){switch(gj&&gj.type||null){case"FeatureCollection":return gj.features=gj.features.reduce(function(mem,feature){return mem.concat(flatten(feature))},[]),gj;case"Feature":return flatten(gj.geometry).map(function(geom){return{type:"Feature",properties:JSON.parse(JSON.stringify(gj.properties)),geometry:geom}});case"MultiPoint":return gj.coordinates.map(function(_){return{type:"Point",coordinates:_}});case"MultiPolygon":return gj.coordinates.map(function(_){return{type:"Polygon",coordinates:_}});case"MultiLineString":return gj.coordinates.map(function(_){return{type:"LineString",coordinates:_}});case"GeometryCollection":return gj.geometries;case"Point":case"Polygon":case"LineString":return[gj];default:return gj}}module.exports=flatten},{}],6:[function(require,module){function normalize(gj){if(!gj||!gj.type)return null;var type=types[gj.type];return type?"geometry"===type?{type:"FeatureCollection",features:[{type:"Feature",properties:{},geometry:gj}]}:"feature"===type?{type:"FeatureCollection",features:[gj]}:"featurecollection"===type?gj:void 0:null}module.exports=normalize;var types={Point:"geometry",MultiPoint:"geometry",LineString:"geometry",MultiLineString:"geometry",Polygon:"geometry",MultiPolygon:"geometry",GeometryCollection:"geometry",Feature:"feature",FeatureCollection:"featurecollection"}},{}],7:[function(require,module){function Traverse(obj){this.value=obj}function walk(root,cb,immutable){var path=[],parents=[],alive=!0;return function walker(node_){function updateState(){if("object"==typeof state.node&&null!==state.node){state.keys&&state.node_===state.node||(state.keys=objectKeys(state.node)),state.isLeaf=0==state.keys.length;for(var i=0;i<parents.length;i++)if(parents[i].node_===node_){state.circular=parents[i];break}}else state.isLeaf=!0,state.keys=null;state.notLeaf=!state.isLeaf,state.notRoot=!state.isRoot}var node=immutable?copy(node_):node_,modifiers={},keepGoing=!0,state={node:node,node_:node_,path:[].concat(path),parent:parents[parents.length-1],parents:parents,key:path.slice(-1)[0],isRoot:0===path.length,level:path.length,circular:null,update:function(x,stopHere){state.isRoot||(state.parent.node[state.key]=x),state.node=x,stopHere&&(keepGoing=!1)},"delete":function(stopHere){delete state.parent.node[state.key],stopHere&&(keepGoing=!1)},remove:function(stopHere){isArray(state.parent.node)?state.parent.node.splice(state.key,1):delete state.parent.node[state.key],stopHere&&(keepGoing=!1)},keys:null,before:function(f){modifiers.before=f},after:function(f){modifiers.after=f},pre:function(f){modifiers.pre=f},post:function(f){modifiers.post=f},stop:function(){alive=!1},block:function(){keepGoing=!1}};if(!alive)return state;updateState();var ret=cb.call(state,state.node);return void 0!==ret&&state.update&&state.update(ret),modifiers.before&&modifiers.before.call(state,state.node),keepGoing?("object"!=typeof state.node||null===state.node||state.circular||(parents.push(state),updateState(),forEach(state.keys,function(key,i){path.push(key),modifiers.pre&&modifiers.pre.call(state,state.node[key],key);var child=walker(state.node[key]);immutable&&hasOwnProperty.call(state.node,key)&&(state.node[key]=child.node),child.isLast=i==state.keys.length-1,child.isFirst=0==i,modifiers.post&&modifiers.post.call(state,child),path.pop()}),parents.pop()),modifiers.after&&modifiers.after.call(state,state.node),state):state}(root).node}function copy(src){if("object"==typeof src&&null!==src){var dst;if(isArray(src))dst=[];else if(isDate(src))dst=new Date(src.getTime?src.getTime():src);else if(isRegExp(src))dst=new RegExp(src);else if(isError(src))dst={message:src.message};else if(isBoolean(src))dst=new Boolean(src);else if(isNumber(src))dst=new Number(src);else if(isString(src))dst=new String(src);else if(Object.create&&Object.getPrototypeOf)dst=Object.create(Object.getPrototypeOf(src));else if(src.constructor===Object)dst={};else{var proto=src.constructor&&src.constructor.prototype||src.__proto__||{},T=function(){};T.prototype=proto,dst=new T}return forEach(objectKeys(src),function(key){dst[key]=src[key]}),dst}return src}function toS(obj){return Object.prototype.toString.call(obj)}function isDate(obj){return"[object Date]"===toS(obj)}function isRegExp(obj){return"[object RegExp]"===toS(obj)}function isError(obj){return"[object Error]"===toS(obj)}function isBoolean(obj){return"[object Boolean]"===toS(obj)}function isNumber(obj){return"[object Number]"===toS(obj)}function isString(obj){return"[object String]"===toS(obj)}var traverse=module.exports=function(obj){return new Traverse(obj)};Traverse.prototype.get=function(ps){for(var node=this.value,i=0;i<ps.length;i++){var key=ps[i];if(!node||!hasOwnProperty.call(node,key)){node=void 0;break}node=node[key]}return node},Traverse.prototype.has=function(ps){for(var node=this.value,i=0;i<ps.length;i++){var key=ps[i];if(!node||!hasOwnProperty.call(node,key))return!1;node=node[key]}return!0},Traverse.prototype.set=function(ps,value){for(var node=this.value,i=0;i<ps.length-1;i++){var key=ps[i];hasOwnProperty.call(node,key)||(node[key]={}),node=node[key]}return node[ps[i]]=value,value},Traverse.prototype.map=function(cb){return walk(this.value,cb,!0)},Traverse.prototype.forEach=function(cb){return this.value=walk(this.value,cb,!1),this.value},Traverse.prototype.reduce=function(cb,init){var skip=1===arguments.length,acc=skip?this.value:init;return this.forEach(function(x){this.isRoot&&skip||(acc=cb.call(this,acc,x))}),acc},Traverse.prototype.paths=function(){var acc=[];return this.forEach(function(){acc.push(this.path)}),acc},Traverse.prototype.nodes=function(){var acc=[];return this.forEach(function(){acc.push(this.node)}),acc},Traverse.prototype.clone=function(){var parents=[],nodes=[];return function clone(src){for(var i=0;i<parents.length;i++)if(parents[i]===src)return nodes[i];if("object"==typeof src&&null!==src){var dst=copy(src);return parents.push(src),nodes.push(dst),forEach(objectKeys(src),function(key){dst[key]=clone(src[key])}),parents.pop(),nodes.pop(),dst}return src}(this.value)};var objectKeys=Object.keys||function(obj){var res=[];for(var key in obj)res.push(key);return res},isArray=Array.isArray||function(xs){return"[object Array]"===Object.prototype.toString.call(xs)},forEach=function(xs,fn){if(xs.forEach)return xs.forEach(fn);for(var i=0;i<xs.length;i++)fn(xs[i],i,xs)};forEach(objectKeys(Traverse.prototype),function(key){traverse[key]=function(obj){var args=[].slice.call(arguments,1),t=new Traverse(obj);return t[key].apply(t,args)}});var hasOwnProperty=Object.hasOwnProperty||function(obj,key){return key in obj}},{}]},{},[1])(1)});
// json preview module
ckan.module('cesiumpreview', function (jQuery, _) {
    var options = '';
    var catalog_url = "";
    var explorer = false;
    var vis_server = '/terriamap/';
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
            console.log("Terria is ready")
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

        }
    }
});

