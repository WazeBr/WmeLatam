// ==UserScript==
// @name                WME BR Áreas Importantes
// @namespace           
// @description         Creates polygons for BR Áreas Importantes layer
// @include             https://www.waze.com/editor/*
// @include             https://www.waze.com/*/editor/*
// @include             https://editor-beta.waze.com/*
// @version             1.2
// @grant               ericdanieldavid
// @copyright           
// ==/UserScript==

var getURL;
if (window.navigator.vendor.match(/Google/)) {
    getURL = function (path) { return chrome.extension.getURL(path); };
}
else {
    getURL = function (path) { return GM_getResourceURL(path); }
}

var bootstrap = document.createElement('script');
bootstrap.src = getURL("WMEBRAreasImportantes.js");
bootstrap.async = false;
bootstrap.onload = function () {
};

document.head.appendChild(bootstrap);