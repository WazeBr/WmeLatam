var Googze = {
	enabled : true,
	satellite : true,
	streets : false,
	streets_type : 'google'
};

$('#googze').attr('style',
		'padding: 2px 3px 0px 3px; font-size: 11px; color: #9F9F9F;');

if ($.cookie('googze') == undefined) {
	$.cookie('googze', serialize(Googze));
} else {
	eval('Googze=' + $.cookie('googze'));
}

$(document).on('click', '#googze_satellite', function() {
	Googze.satellite = this.checked;
	$.cookie('googze', serialize(Googze));
	googzeRebuildUI();
});

$(document).on('click', '#googze_streets', function() {
	Googze.streets = this.checked;
	$.cookie('googze', serialize(Googze));
	googzeRebuildUI();
});

$(document).on('change', '#googze_streets_type', function() {
	Googze.streets_type = this.value;
	$.cookie('googze', serialize(Googze));
	googzeRebuildUI();
});

googzeRebuildUI();

function StringBuilder(value) {
    this.strings = new Array("");
    this.append(value);
}

// stolen from http://msdn.microsoft.com/en-us/library/bb259689.aspx
function toBing(x, y, zoom) {
  var x2 = pad(String(x.toString(2)), zoom + 1)
    , y2 = pad(String(y.toString(2)), zoom + 1)
    , quadkey = ''
    ;
  
  function pad(n, p) {
    while (n.length < p) {
      n = '0' + n;
    }
    return n;
  }
 
  for (var i = 0; i < y2.length; i += 1) {
    quadkey += (y2[i] + x2[i]);
  }
 
  quadkey = parseInt('0' + quadkey, 2);
 
  return pad(quadkey.toString(4), zoom);
}

var wazeToGoogle = function() {
	if (Googze.enabled) {
		setTimeout(wazeToGoogle, 3000);
		rgxWorld = /(\d+)\/(\d+)\/(\d+)/;
		var aerialsDiv = document.getElementById('OpenLayers.Layer.Google_30');
		if (aerialsDiv != null) {
			imagesDiv = aerialsDiv.getElementsByTagName('img');
			for ( var i in imagesDiv) {
				if (rgxWorld.test(imagesDiv[i].src)) {
					tiles = imagesDiv[i].src.match(rgxWorld);
					tilez=parseInt(tiles[1]);
					tilex=parseInt(tiles[2]);
					tiley=parseInt(tiles[3]);
					// from http://www.neongeo.com/wiki/doku.php?id=map_servers
					if (Googze.streets_type == 'gmh') {
						var newsrc = 'http://mt1.google.com/vt/lyrs=y&x='+ tilex +'&y='+ tiley +'&z='+ tilez;
					} else if (Googze.streets_type == 'gms') {
						var newsrc = 'http://mt0.google.com/vt/x='+ tilex +'&y='+ tiley +'&z='+ tilez;
					} else if (Googze.streets_type == 'gmt') {
						var newsrc = 'http://mt1.google.com/vt/lyrs=p&x='+ tilex +'&y='+ tiley +'&z='+ tilez;
					} else if (Googze.streets_type == 'osmo') {
						var newsrc = 'http://tile.openstreetmap.org/'+ tilez +'/'+ tilex +'/'+ tiley +'.png';
					} else if (Googze.streets_type == 'osmc') {
						var newsrc = 'http://tile.opencyclemap.org/cycle/'+ tilez +'/'+ tilex +'/'+ tiley +'.png';
					} else if (Googze.streets_type == 'bmsat') {
                                                var newsrc = 'http://ecn.t2.tiles.virtualearth.net/tiles/a'+ toBing(tilex, tiley, tilez) +'?g=915&mkt=en-us';
					} else if (Googze.streets_type == 'bmstr') {
                                                var newsrc = 'http://ecn.t2.tiles.virtualearth.net/tiles/r'+ toBing(tilex, tiley, tilez) +'?g=915&mkt=en-us';
					} else if (Googze.streets_type == 'bmh') {
                                                var newsrc = 'http://ecn.t2.tiles.virtualearth.net/tiles/h'+ toBing(tilex, tiley, tilez) +'?g=915&mkt=en-us';
					} else if (Googze.streets_type == 'nomn') {
                                                var newsrc = 'http://1.maptile.lbs.ovi.com/maptiler/v2/maptile/newest/normal.day/'+ tilez +'/'+ tilex +'/'+ tiley +'/256/png8?app_id=C_3eqqD7IpMucoy_vXk9&token=8LuM8xqrzP4xVJ8V-5ckJw';
					} else if (Googze.streets_type == 'nomng') {
                                                var newsrc = 'http://1.maptile.lbs.ovi.com/maptiler/v2/maptile/newest/normal.day.grey/'+ tilez +'/'+ tilex +'/'+ tiley +'/256/png8?app_id=C_3eqqD7IpMucoy_vXk9&token=8LuM8xqrzP4xVJ8V-5ckJw';
					} else if (Googze.streets_type == 'nomnt') {
                                                var newsrc = 'http://1.maptile.lbs.ovi.com/maptiler/v2/maptile/newest/normal.day.transit/'+ tilez +'/'+ tilex +'/'+ tiley +'/256/png8?app_id=C_3eqqD7IpMucoy_vXk9&token=8LuM8xqrzP4xVJ8V-5ckJw';
					} else if (Googze.streets_type == 'noms') {
                                                var newsrc = 'http://1.maptile.lbs.ovi.com/maptiler/v2/maptile/newest/satellite.day/'+ tilez +'/'+ tilex +'/'+ tiley +'/256/png8?app_id=C_3eqqD7IpMucoy_vXk9&token=8LuM8xqrzP4xVJ8V-5ckJw';
					} else if (Googze.streets_type == 'nomt') {
                                                var newsrc = 'http://1.maptile.lbs.ovi.com/maptiler/v2/maptile/newest/terrain.day/'+ tilez +'/'+ tilex +'/'+ tiley +'/256/png8?app_id=C_3eqqD7IpMucoy_vXk9&token=8LuM8xqrzP4xVJ8V-5ckJw';
					} else {
						var newsrc = 'http://otile1.mqcdn.com/tiles/1.0.0/osm/'+ tilez +'/'+ tilez +'/'+ tiley +'.png';
					}

					imagesDiv[i].setAttribute('src', newsrc);
				}
			}
		}
	}
};

wazeToGoogle();

function googzeRebuildUI() {
	var html = '';
	if (Googze.enabled) {
		html += 'Bingze NG is <span style="color: green;">enabled</span> (<a href="#" onclick="googzeSetEnabled(false); return false;">disable</a>) ';
	} else {
		html += 'Bingze NG is <span style="color: red;">disabled</span> (<a href="#" onclick="googzeSetEnabled(true); return false;">enable</a>) ';
	}

	html += ' - Build 201312101236';

	html += '<select id="googze_streets_type" style="width: 180px; margin-left: 5px;">';

	html += '<option>-=| Google Maps |=-</option>';
	html += '<option value="gmh"';
	if (Googze.streets_type == 'gmh') {
		html += ' selected="selected"';
	}
	html += '> Hybrid</option>';

	html += '<option value="gms"';
	if (Googze.streets_type == 'gms') {
		html += ' selected="selected"';
	}
	html += '> Street</option>';

	html += '<option value="gmt"';
	if (Googze.streets_type == 'gmt') {
		html += ' selected="selected"';
	}
	html += '> Terrain</option>';

	html += '<option>-=| OpenStreetMap |=-</option>';
	html += '<option value="osmo"';
	if (Googze.streets_type == 'osmo') {
		html += ' selected="selected"';
	}
	html += '> Osmarenderer</option>';

	html += '<option value="osmc"';
	if (Googze.streets_type == 'osmc') {
		html += ' selected="selected"';
	}
	html += '> Cycle</option>';

	html += '<option>-=| Bing Maps |=-</option>';
	html += '<option value="bmsat"';
        if (Googze.streets_type == 'bmsat') {
                html += ' selected="selected"';
        }
        html += '> Satellite</option>';

	html += '<option value="bmstr"';
        if (Googze.streets_type == 'bmstr') {
                html += ' selected="selected"';
        }
        html += '> Street</option>';

	html += '<option value="bmh"';
        if (Googze.streets_type == 'bmh') {
                html += ' selected="selected"';
        }
        html += '> Hybrid</option>';

	html += '<option>-=| Nokia Maps/Navteq |=-</option>';
	html += '<option value="nomn"';
        if (Googze.streets_type == 'nomn') {
                html += ' selected="selected"';
        }
        html += '> Normal</option>';

        html += '<option value="nomng"';
        if (Googze.streets_type == 'nomng') {
                html += ' selected="selected"';
        }
        html += '> Normal - Grey</option>';

        html += '<option value="nomnt"';
        if (Googze.streets_type == 'nomnt') {
                html += ' selected="selected"';
        }
        html += '> Normal - Transit</option>';

	html += '<option value="noms"';
        if (Googze.streets_type == 'noms') {
                html += ' selected="selected"';
        }
        html += '> Satellite</option>';

	html += '<option value="nomt"';
        if (Googze.streets_type == 'nomt') {
                html += ' selected="selected"';
        }
        html += '> Terrain</option>';

	html += '<option>-=| MapQuest |=-</option>';
	html += '<option value="mp"';
	if (Googze.streets_type == 'mp') {
		html += ' selected="selected"';
	}
	html += '> Server1</option>';

	html += '</select>';

	$('#googze').html(html);
}

function googzeSetEnabled(enabled) {
	Googze.enabled = enabled;
	$.cookie('googze', serialize(Googze));
	googzeRebuildUI();
	wazeToGoogle();
}

// Shamelessly stolen from
// http://blog.stchur.com/2007/04/06/serializing-objects-in-javascript/
function serialize(_obj) {
	// Let Gecko browsers do this the easy way
	if (typeof _obj.toSource !== 'undefined'
			&& typeof _obj.callee === 'undefined') {
		return _obj.toSource();
	}
	// Other browsers must do it the hard way
	switch (typeof _obj) {
	// numbers, booleans, and functions are trivial: just return the object
	// itself since its default .toString() gives us exactly what we want
	case 'number':
	case 'boolean':
	case 'function':
		return _obj;
		break;

	// for JSON format, strings need to be wrapped in quotes
	case 'string':
		return '\'' + _obj + '\'';
		break;

	case 'object':
		var str;
		if (_obj.constructor === Array || typeof _obj.callee !== 'undefined') {
			str = '[';
			var i, len = _obj.length;
			for (i = 0; i < len - 1; i++) {
				str += serialize(_obj[i]) + ',';
			}
			str += serialize(_obj[i]) + ']';
		} else {
			str = '{';
			var key;
			for (key in _obj) {
				str += key + ':' + serialize(_obj[key]) + ',';
			}
			str = str.replace(/\,$/, '') + '}';
		}
		return str;
		break;

	default:
		return 'UNKNOWN';
		break;
	}
}
