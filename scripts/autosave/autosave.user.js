// ==UserScript==
// @name                WME AutoSave
// @namespace           http://www.felicio.com.br
// @description         Auto save for Waze Map Editor
// @include             https://*.waze.com/editor/*
// @include             https://*.waze.com/map-editor/*
// @include             https://*.waze.com/beta_editor/*
// @version             1.4
// ==/UserScript==

var script = document.createElement('script');
script.src='https://dl.dropboxusercontent.com/u/5295438/Waze/addons/autosave/autosave.js';
document.getElementsByTagName('head')[0].appendChild(script);
