// ==UserScript==
// @name                WME Latam Pack
// @namespace           http://greasemonkey.chizzum.com
// @description         Permite fechar UR velhas, fazer um comentário inicial nas URs sem comentário e outras funções bacanas no WME.
// @include             https://*.waze.com/*editor*
// @include             https://www.waze.com/*/editor/*
// @include             http://www.anp.gov.br/postos/consulta.asp?WmeMunicipio*
// @include             https://www.google.com.br/maps*
// @version             0.165
// @grant               ericdanieldavid, biuick84, JuniorDummer
// ==/UserScript==

var getURL;
if(window.navigator.vendor.match(/Google/)) {
  getURL = function(path) { return chrome.extension.getURL(path); };
}
else {
  getURL = function(path) { return GM_getResourceURL(path); }
}

var bootstrap = document.createElement('script');
  bootstrap.src = getURL("MasterBrasil.js");
  bootstrap.async = false;
  bootstrap.onload = function() {
};

document.head.appendChild(bootstrap);