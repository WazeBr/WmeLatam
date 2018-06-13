// ==UserScript==
// @name                WME BR Áreas Importantes
// @namespace           
// @description         Creates polygons for BR Áreas Importantes layer
// @include             https://www.waze.com/editor/*
// @include             https://www.waze.com/*/editor/*
// @include             https://editor-beta.waze.com/*
// @version             1.3
// @grant               ericdanieldavid
// @copyright           
// ==/UserScript==

function bootstrap_MapRaidOverlay()
{
  var bGreasemonkeyServiceDefined = false;

  try {
    bGreasemonkeyServiceDefined = (typeof Components.interfaces.gmIGreasemonkeyService === "object");
  }
  catch (err) { /* Ignore */ }

  if (typeof unsafeWindow === "undefined" || ! bGreasemonkeyServiceDefined) {
    unsafeWindow    = ( function () {
      var dummyElem = document.createElement('p');
      dummyElem.setAttribute('onclick', 'return window;');
      return dummyElem.onclick();
    }) ();
  }

    /* begin running the code! */
    setTimeout(InitMapRaidOverlay, 1000);
}

function AddRaidPolygon(raidLayer,groupPoints,groupColor,groupNumber){
    
    var mro_Map = unsafeWindow.Waze.map;
    var mro_OL = unsafeWindow.OpenLayers;
    var raidGroupLabel = 'Área [' + groupNumber + ']';
    var groupName = 'Área [' + groupNumber + ']';
    
    var style = {
        strokeColor: groupColor,
        strokeOpacity: .8,
        strokeWidth: 3,
        fillColor: groupColor,
        fillOpacity: 0.15,
        label: raidGroupLabel,
        labelOutlineColor: "black",
        labelOutlineWidth: 3,
        fontSize: 14,
        fontColor: groupColor,
        fontOpacity: .85,
        fontWeight: "bold"  
    };
    
    var attributes = {
        name: groupName,
        number: groupNumber
    };
    
    var pnt= [];
    for(i=0;i<groupPoints.length;i++){
        convPoint = new OpenLayers.Geometry.Point(groupPoints[i].lon,groupPoints[i].lat).transform(new OpenLayers.Projection("EPSG:4326"), mro_Map.getProjectionObject());
        pnt.push(convPoint);
    }
		       
    var ring = new mro_OL.Geometry.LinearRing(pnt);
    var polygon = new mro_OL.Geometry.Polygon([ring]);
    
    var feature = new mro_OL.Feature.Vector(polygon,attributes,style);
    raidLayer.addFeatures([feature]);

}

function CurrentRaidLocation(raid_mapLayer){
    var mro_Map = unsafeWindow.Waze.map;

    for(i=0;i<raid_mapLayer.features.length;i++){
        var raidMapCenter = mro_Map.getCenter();
        var raidCenterPoint = new OpenLayers.Geometry.Point(raidMapCenter.lon,raidMapCenter.lat);
        var raidCenterCheck = raid_mapLayer.features[i].geometry.components[0].containsPoint(raidCenterPoint);
        
        if(raidCenterCheck === true){
        	var raidLocationLabel = 'Área ' + raid_mapLayer.features[i].attributes.number + ' - ' + $('.WazeControlLocationInfo').text();
    		
			setTimeout(function(){$('.WazeControlLocationInfo').text(raidLocationLabel);},50);
			var str = $('.WazeControlLocationInfo').text();
			
			var n2 = str.indexOf(" - ");
			
			if(n2 > 0){
				var n = str.length;
				var res = str.substring(n2+2, n);
				var rescount = res.indexOf(" - ");
				if(rescount>0){
					var n3 = res.length;
					var res2 = res.substring(rescount+2, n3);
						
				}
				var raidLocationLabel = 'Área ' + raid_mapLayer.features[i].attributes.number + ' - ' + res2;
			} else {
				var raidLocationLabel = 'Área ' + raid_mapLayer.features[i].attributes.number + ' - ' + $('.WazeControlLocationInfo').text();
			}	
    		setTimeout(function(){$('.WazeControlLocationInfo').text(raidLocationLabel);},200);
		}
    }
}

function InitMapRaidOverlay(){

    var mro_Map = unsafeWindow.Waze.map;
    var mro_OL = unsafeWindow.OpenLayers;

    var mro_mapLayers = mro_Map.getLayersBy("uniqueName","__BRImportantAreas");
        
    var raid_mapLayer = new mro_OL.Layer.Vector("BR Áreas Importantes ", {
        displayInLayerSwitcher: true,
        uniqueName: "__BRImportantAreas"
    });
        
    I18n.translations.en.layers.name["__BRImportantAreas"] = "BR Áreas Importantes ";
    mro_Map.addLayer(raid_mapLayer);
    raid_mapLayer.setVisibility(true);    

    $.getJSON("https://spreadsheets.google.com/feeds/list/1d0DC_2tD-i1V9sn79XOZAvbcImKR5Ba15yaAeiqkaLo/od6/public/values?alt=json", function (data) {

        for (var i = 0; i < data.feed.entry.length; i++) {
            //Cada linha será um poligono diferente.

            //Na planilha só em até 130 pares de latitude longitude
            var cordenadas = [];
            for (var j = 1; j <= 130; j++) {
                if (data.feed.entry[i]['gsx$lon' + j]['$t'] != "") {
                    cordenadas.push({ lon: data.feed.entry[i]["gsx$lon" + j]['$t'], lat: data.feed.entry[i]["gsx$lat" + j]['$t'] });
                }
                else
                {
                    break;
                }
            }

            var LinhasMatriz = getConvexHull(cordenadas);
            console.log(LinhasMatriz);

            var pontosContorno = [];
            for (var z = 0; z < LinhasMatriz.length; z++) {
                pontosContorno.push(LinhasMatriz[z][0]);
            }

            AddRaidPolygon(raid_mapLayer, pontosContorno, getRandomColor(), data.feed.entry[i]['gsx$loc']['$t']);

            //AddRaidPolygon(raid_mapLayer, cordenadas, getRandomColor(), data.feed.entry[i]['gsx$loc']['$t']);

            
        }

        setTimeout(function () { CurrentRaidLocation(raid_mapLayer); }, 3000);
        mro_Map.events.register("moveend", Waze.map, function () { CurrentRaidLocation(raid_mapLayer); });
        mro_Map.events.register("zoomend", Waze.map, function () { CurrentRaidLocation(raid_mapLayer); });
    });
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


var allBaseLines = new Array();
var pts;

function getDistant(cpt, bl) {
    var Vy = bl[1].lon - bl[0].lon;
    var Vx = bl[0].lat - bl[1].lat;
    return (Vx * (cpt.lon - bl[0].lon) + Vy * (cpt.lat - bl[0].lat))
}

function findMostDistantPointFromBaseLine(baseLine, points) {
    var maxD = 0;
    var maxPt = new Array();
    var newPoints = new Array();
    //for (var idx in points) {
    for (var idx = 0; idx < points.length; idx++) {
        var pt = points[idx];

        var d = getDistant(pt, baseLine);

        if (d > 0) {
            newPoints.push(pt);
        } else {
            continue;
        }

        if (d > maxD) {
            maxD = d;
            maxPt = pt;
        }

    }
    return { 'maxPoint': maxPt, 'newPoints': newPoints }
}
function buildConvexHull(baseLine, points) {

    allBaseLines.push(baseLine)
    var convexHullBaseLines = new Array();
    var t = findMostDistantPointFromBaseLine(baseLine, points);

    console.log(t);

    if (typeof(t.maxPoint.lat) != "undefined") { // if there is still a point "outside" the base line
        convexHullBaseLines =
            convexHullBaseLines.concat(
                buildConvexHull([baseLine[0], t.maxPoint], t.newPoints)
            );
        convexHullBaseLines =
            convexHullBaseLines.concat(
                buildConvexHull([t.maxPoint, baseLine[1]], t.newPoints)
            );
        return convexHullBaseLines;
    } else {  // if there is no more point "outside" the base line, the current base line is part of the convex hull
        return [baseLine];
    }
}
function getConvexHull(points) {
    //find first baseline
    var maxX, minX;
    var maxPt, minPt;
    for (var i = 0; i < points.length; i++) {
        var pt = points[i];

        if (pt.lon > maxX || !maxX) {
            maxPt = pt;
            maxX = pt.lon;
        }
        if (pt.lon < minX || !minX) {
            minPt = pt;
            minX = pt.lon;
        }
    }

    var ch = [].concat(buildConvexHull([minPt, maxPt], points),
                       buildConvexHull([maxPt, minPt], points))
    return ch;
}

bootstrap_MapRaidOverlay(); 
