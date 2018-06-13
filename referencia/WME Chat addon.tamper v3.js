// ==UserScript==
// @name 			WME Chat addon
// @description 	removes duplicates messages, formats link and permalinks, and some stuffs
// @namespace 		dummyd2
// @grant 			none
// @version 		0.2
// @include         https://www.waze.com/editor/*
// @include         https://www.waze.com/*/editor/*
// @include         https://editor-beta.waze.com/*
// @author			Dummyd2
// ==/UserScript==


/*******
 * 
 * Many thanks to Pawel Pyrczak (aka tkr85) for his script chat jumper compatible with this script
 * 
 *  You are free to:
 *   Share, copy, and redistribute the script in any medium or format
 *   under the following terms:
 *   Attribution - You must give appropriate credit. You may do so in any
 *     reasonable manner, but not in any way that suggests the licensor
 *     endorses you or your use.
 * 
 *   NonCommercial - You may not use the script for commercial purposes.
 *
 *   NoModifications - You may NOT MODIFY the script.
 * 
 *  You are invited to contact the author: dummyd2 on waze forum for more details.
 * 
********/


var ca_version = "0.2", isDebug = !1, targetCount = 0, divPerma = null;
function getElementsByClassName(b, a) {
  a || (a = document.getElementsByTagName("body")[0]);
  for (var c = [], d = new RegExp("\\b" + b + "\\b"), f = a.getElementsByTagName("*"), e = 0, g = f.length;e < g;e++) {
    d.test(f[e].className) && c.push(f[e]);
  }
  return c;
}
function getId(b) {
  return document.getElementById(b);
}
function logBeta(b, a) {
}
function logDebug(b, a) {
  isDebug && log("DEBUG - " + b, a);
}
function log(b, a) {
  null == a ? console.log("Chat addon v" + ca_version + " - " + b) : console.debug("Chat addon v" + ca_version + " - " + b + " ", a);
}
function waitForObject(b, a) {
  var c = null, c = eval("typeof(" + b + ")");
  if ("undefined" === c) {
    return log(b + " KO"), window.setTimeout(waitForObject.caller, 500), !1;
  }
  logBeta(b + " OK");
  null != a && eval(a + "=" + b);
  return!0;
}
function initializeWazeObjects() {
  for (var b = [{o:"unsafeWindow.Waze", s:null}, {o:"unsafeWindow.Waze.model", s:"wazeModel"}, {o:"unsafeWindow.Waze.map", s:"wazeMap"}, {o:"unsafeWindow.Waze.model.chat", s:"wazeChat"}, {o:"unsafeWindow.Waze.app.loginManager", s:"loginManager"}, {o:"unsafeWindow.Waze.selectionManager", s:"selectionManager"}, {o:"unsafeWindow.Waze.updateRequestsControl", s:"updateRequestsControl"}, {o:"unsafeWindow.Waze.problemsControl", s:"problemsControl"}, {o:"unsafeWindow.Waze.app.loginManager.user", s:"me"}, 
  {o:"me.rank", s:"ul"}], a = 0;a < b.length;a++) {
    if (!waitForObject(b[a].o, b[a].s)) {
      return;
    }
  }
  initialiseCA();
}
function initialiseCA() {
  wazeChat.messages._events.register("messageUpdated", null, newMessage);
  wazeChat.messages._events.register("add", null, newMessage);
  var b = getElementsByClassName("new-message", getId("chat"));
  if (1 != b.length) {
    log("Error: cannot detect input message element");
  } else {
    b = b[0];
    b.style.paddingRight = "30px";
    var a = document.createElement("a");
    a.innerHTML = "+";
    a.className = "icon-link";
    a.style.cssFloat = "right";
    a.style.position = "relative";
    a.style.left = "25px";
    a.style.marginTop = "-20px";
    a.style.display = "block";
    a.onclick = insertPermalink;
    b.appendChild(a);
  }
  b = getElementsByClassName("WazeControlPermalink");
  0 == b.length ? log("error: can't find permalink container") : divPerma = b[0];
  b = getElementsByClassName("message-list", getId("chat"))[0];
  a = document.createElement("div");
  a.className = "message system-message";
  a.innerHTML = '<div class="from"></div><div class="body"><div style="direction: ltr; text-align: left;">Chat addon v' + ca_version + " rocks!</div></div>";
  b.appendChild(a);
  log("Init done");
}
function setFocusOnInputMessge() {
  var b = getElementsByClassName("message-input", getId("chat"));
  1 != b.length ? log("Error: cannot detect input message element") : b[0].focus();
}
function insertPermalink() {
  var b = getElementsByClassName("message-input", getId("chat"));
  1 != b.length ? log("Error: cannot detect input message element") : (b[0].value += divPerma.firstElementChild.href, window.setTimeout(setFocusOnInputMessge, 100));
}
function removeDuplicates() {
  for (var b = getElementsByClassName("message", getId("chat")), a = 0;a < b.length;a++) {
    for (var c = b[a].children, d = 0;d < c.length;d++) {
      if ("body" == c[d].className) {
        for (var f = c[d].children, e = 0;e < f.length;e++) {
          f[e].innerHTML.split("\n").filter(function(a, b, c) {
            return c.indexOf(a) != b ? (log('Message: "' + a.innerHTML + '" removed'), !1) : !0;
          }), 0 != e && f[e].innerHTML == f[e - 1].innerHTML && "none" != f[e].style.display && (f[e].style.display = "none", log('Message: "' + f[e].innerHTML + '" removed'));
        }
      }
    }
  }
}
function convertPermalinksAndLinks() {
  var b = [/https:\/\/www.waze.com\/editor\//, /https:\/\/www.waze.com\/[^/]+\/editor\//, /https:\/\/editor-beta.waze.com\//];
  logDebug(b);
  var a = "", c = [], d = [];
  logDebug("New message (/" + wazeChat.messages.models.length + "):", wazeChat.messages.models[wazeChat.messages.models.length - 1]);
  for (var f = getElementsByClassName("message", getId("chat")), e = 0;e < f.length;e++) {
    logDebug("messages[" + e + "]:", f[e]);
    for (var g = f[e].children, h = 0;h < g.length;h++) {
      logDebug("children[" + h + "]:", g[h]);
      if ("from" == g[h].className) {
        if (a = g[h].innerHTML.split(" "), 1 == a.length) {
          if (a = g[h].innerHTML, "" != a) {
            if (a == me.userName) {
              g[h].innerHTML = g[h].innerHTML + " (" + (me.rank + 1) + ")";
            } else {
              var k = getRankOfLiveUser(a);
              g[h].innerHTML = '<a href="#" id="CA-t-' + targetCount + '">' + a + "</a> (" + (null != k ? k + 1 : "?") + ")";
              logDebug("jump to user on a element: ", g[h].firstChild);
              logDebug("jump to user: ", a);
              d.push({id:targetCount, userName:a});
              targetCount++;
            }
            g[h].innerHTML = g[h].innerHTML + " - " + (new Date).toLocaleString();
          }
        } else {
          a = a[0].innerHTML;
        }
      }
      if ("body" == g[h].className) {
        a == me.userName && (g[h].style.backgroundColor = "#A1DCF5");
        for (var k = g[h].children, l = 0;l < k.length;l++) {
          if (logDebug("list[" + l + "]:", k[l]), "undefined" === typeof k[l].chatAddonOk) {
            k[l].chatAddonOk = !0;
            for (var m = k[l].innerHTML, n = m;0 < n.length;) {
              var p = getFirstPermalink(b, n);
              if (p) {
                var q = getJumpSetFromPermalink(p.permalink);
                if (q.lon && q.lat) {
                  m = m.replace(p.permalink, '<a href="#" id="CA-t-' + targetCount + '"><i class="crosshair icon-screenshot"></i></a>');
                  c.push({id:targetCount, jumpDetails:q});
                  log("permalink replaced by target on message posted by " + a);
                  logDebug("jumpTargets", c);
                  targetCount++;
                  n = n.substring(p.end);
                  continue;
                }
              }
              n = n.substring(1);
            }
            m = m.replace(/(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g, '<a target="_blank" href="$1">$1</a>');
            k[l].innerHTML != m && (k[l].innerHTML = m);
          }
        }
      }
    }
  }
  logDebug("jumpTargets for onclick", c);
  for (e = 0;e < c.length;e++) {
    logDebug("target elt:", getId("CA-t-" + c[e].id)), getId("CA-t-" + c[e].id).onclick = getFunctionWithArgs(jumpTo, [c[e].jumpDetails]);
  }
  for (e = 0;e < d.length;e++) {
    logDebug("target user: " + d[e].userName, getId("CA-t-" + d[e].id)), getId("CA-t-" + d[e].id).onclick = getFunctionWithArgs(jumpToUser, [d[e].userName]);
  }
}
function newMessage() {
  removeDuplicates();
  convertPermalinksAndLinks();
}
function getMessageObjectFromData(b, a) {
  for (var c = null, d = 0;d < wazeModel.chat.messages.models.length;d++) {
    if (c = wazeModel.chat.messages.models[d], c.attributes.body == a && c.attributes.from.name == b) {
      return c;
    }
  }
  return null;
}
function getFirstPermalink(b, a) {
  for (var c = 0;c < b.length;c++) {
    var d = a.search(b[c]);
    if (-1 != d) {
      for (c = d + 1;c < a.length && " " != a.charAt(c) && "\n" != a.charAt(c);) {
        c++;
      }
      return{start:d, end:c, permalink:a.substring(d, c)};
    }
  }
  return null;
}
function getJumpSetFromPermalink(b) {
  logDebug("permalink: ", b);
  var a = b.match(/lon=([-]?[0-9]*[.]?[0-9]*)/), c = b.match(/lat=([-]?[0-9]*[.]?[0-9]*)/), d = b.match(/zoom=([0-9]+)/), f = b.match(/segments=(([0-9]+[,]?)+)+/), e = b.match(/nodes=(([0-9]+[,]?)+)+/), g = b.match(/venues=(([0-9|\.|\-]+[,]?)+)+/);
  b = b.match(/mapUpdateRequest=([0-9]*)/);
  logDebug("lon: ", a);
  logDebug("lat: ", c);
  logDebug("zoom: ", d);
  logDebug("segments: ", f);
  logDebug("nodes: ", e);
  logDebug("venues: ", g);
  logDebug("mapUpdateRequest: ", b);
  return{lon:2 == a.length ? parseFloat(a[1]) : null, lat:2 == c.length ? parseFloat(c[1]) : null, zoom:2 == d.length ? parseFloat(d[1]) : null, segments:f ? f[1].split(",") : null, nodes:e ? e[1].split(",") : null, venues:g ? g[1].split(",") : null, venues:g ? g[1].split(",") : null, mapUpdateRequest:b ? b[1].split(",") : null};
}
function getRankOfLiveUser(b) {
  for (var a = 0;a < wazeChat.users.models.length;a++) {
    if (wazeChat.users.models[a].attributes.name == b) {
      return wazeChat.users.models[a].attributes.rank;
    }
  }
  return null;
}
function jumpToUser(b) {
  for (var a = null, c = 0;c < wazeChat.users.models.length && (a = wazeChat.users.models[c], a.attributes.name != b);c++) {
    a = null;
  }
  a ? jumpTo({lon:a.attributes.center.lon, lat:a.attributes.center.lat, zoom:null, segments:null, nodes:null, venues:null, mapUpdateRequest:null}) : log("Can't find user: loggued out or invisible???");
  return!1;
}
function jumpTo(b) {
  logDebug("jumping to: ", b);
  if ("undefined" !== typeof ChatJumper && !ChatJumper.isLast) {
    var a = wazeMap.getCenter(), c = wazeMap.getZoom();
    ChatJumper.last = [a.lon, a.lat];
    ChatJumper.zoom = c;
    ChatJumper.isLast = !0;
    ChatJumper.saveLS();
    ChatJumper.showButton();
  }
  a = OpenLayers.Layer.SphericalMercator.forwardMercator(b.lon, b.lat);
  b.zoom ? wazeMap.setCenter(a, b.zoom) : wazeMap.setCenter(a);
  (b.segments || b.nodes || b.venues || b.mapUpdateRequest) && window.setTimeout(getFunctionWithArgs(selectData, [b]), 500);
}
function selectData(b) {
  var a = !0;
  if (b.segments) {
    for (var c = [], d = 0;d < b.segments.length;d++) {
      var f = parseInt(b.segments[d]);
      if ("undefined" === typeof wazeModel.segments.objects[f]) {
        a = !1;
        break;
      }
      c.push(wazeModel.segments.objects[f]);
    }
    a && selectionManager.select(c);
  }
  if (b.nodes) {
    c = [];
    for (d = 0;d < b.nodes.length;d++) {
      f = parseInt(b.nodes[d]);
      if ("undefined" === typeof wazeModel.nodes.objects[f]) {
        a = !1;
        break;
      }
      c.push(wazeModel.nodes.objects[f]);
    }
    a && selectionManager.select(c);
  }
  if (b.venues) {
    wazeMap.landmarkLayer.setVisibility(!0);
    c = [];
    for (d = 0;d < b.venues.length;d++) {
      f = b.venues[d];
      if ("undefined" === typeof wazeModel.venues.objects[f]) {
        a = !1;
        break;
      }
      c.push(wazeModel.venues.objects[f]);
    }
    a && selectionManager.select(c);
  }
  b.mapUpdateRequest && 1 <= b.mapUpdateRequest.length && !b.segments && !b.nodes && !b.venues && (d = wazeModel.problems.objects[parseInt(b.mapUpdateRequest[0])], c = null, null == d && (c = wazeModel.turnProblems.objects[parseInt(b.mapUpdateRequest[0])]), logDebug("mp :", d), logDebug("tp :", c), null != d && (problemsControl.selectProblem(d), a = !0), null != c && (problemsControl.selectProblem(c), a = !0));
  a ? log("Data selected...:") : (log("Select data failed. Waiting for data..."), window.setTimeout(getFunctionWithArgs(selectData, [b]), 500));
}
function getFunctionWithArgs(b, a) {
  return function() {
    var c = JSON.stringify(a);
    return function() {
      var a = JSON.parse(c);
      b.apply(this, a);
    };
  }();
}
initializeWazeObjects();