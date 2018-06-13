// ==UserScript==
// @name                WME Delete Cameras
// @namespace           http://www.felicio.com.br
// @description         Delete all unconfirmed cameras for Waze Map Editor
// @include             https://*.waze.com/editor/*
// @version             1.1
// ==/UserScript==

function deleteunkcamerasBootstrap() {
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
		var script = document.createElement('script');
		script.src='https://dl.dropboxusercontent.com/u/5295438/Waze/addons/deleteunkcameras/deleteunkcameras.js';
		script.setAttribute('type', 'text/javascript');
		document.getElementsByTagName('head')[0].appendChild(script);
	
		var scriptDiv = document.createElement('div');
		scriptDiv.id = 'deleteunkcameras';
	
		document.getElementById('sidebar').appendChild(scriptDiv);
	
		console.log("deleteunkcameras: loaded");    
    }
}

deleteunkcamerasBootstrap();