// ==UserScript==
// @name         Bingze NG
// @namespace    http://dl.dropbox.com/u/5295438/Waze/bingze-ng
// @description  Show aerial photos from Google Maps in Waze cartouche editor
// @include      *waze.com/editor*
// @version      1.1
// @copyright    :)
// ==/UserScript==

function bingzeBootstrap() {
	if (document.readyState == "complete") {
		doMyStuffAfterLoad();
	} else {
		document.onreadystatechange = function() {
		if (document.readyState == "complete") {
			doMyStuffAfterLoad();
		}
	};
}
	
	function doMyStuffAfterLoad() { 
			// Load jQuery plugin for saving Bingze settings
			var jQCookie = document.createElement('script');
			jQCookie.src='https://dl.dropbox.com/u/5295438/Waze/addons/bingze-ng/jquery.cookie.js';
			document.getElementsByTagName('head')[0].appendChild(jQCookie);
			
			// Load external script which has all the functionality embedded
			var script = document.createElement('script');
			script.src='https://dl.dropbox.com/u/5295438/Waze/addons/bingze-ng/bingze.js';
			document.getElementsByTagName('head')[0].appendChild(script);
			
			var scriptDiv = document.createElement('div');
			scriptDiv.id = 'googze';
			document.getElementById('sidebar').appendChild(scriptDiv);
			
			console.log("bingze: loaded");
        }
}

bingzeBootstrap();

