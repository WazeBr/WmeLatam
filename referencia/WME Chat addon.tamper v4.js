// ==UserScript==
// @name 			WME Chat addon
// @description 	removes duplicates messages, formats link and permalinks, and some stuffs
// @namespace 		dummyd2
// @grant 			none
// @version 		0.4
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

var ca_version = "0.4", isDebug = !1, targetCount = 0, bipCount = 0, divPerma = null, divChat = null, doNotNotifyNext = !1, lastMessageFrom = "", CA_Settings = null;
function getElementsByClassName(a, b) {
  b || (b = document.getElementsByTagName("body")[0]);
  for (var c = [], d = new RegExp("\\b" + a + "\\b"), e = b.getElementsByTagName("*"), g = 0, f = e.length;g < f;g++) {
    d.test(e[g].className) && c.push(e[g]);
  }
  return c;
}
function getId(a) {
  return document.getElementById(a);
}
function logBeta(a, b) {
}
function logDebug(a, b) {
  isDebug && log("DEBUG - " + a, b);
}
function log(a, b) {
  null == b ? console.log("Chat addon v" + ca_version + " - " + a) : console.debug("Chat addon v" + ca_version + " - " + a + " ", b);
}
function waitForObject(a, b) {
  var c = null, c = eval("typeof(" + a + ")");
  if ("undefined" === c) {
    return log(a + " KO"), window.setTimeout(waitForObject.caller, 500), !1;
  }
  logBeta(a + " OK");
  null != b && eval(b + "=" + a);
  return!0;
}
function initializeWazeObjects() {
  var a = !1;
  try {
    a = "object" === typeof Components.interfaces.gmIGreasemonkeyService;
  } catch (b) {
  }
  "undefined" !== typeof unsafeWindow && a || (a = document.createElement("p"), a.setAttribute("onclick", "return window;"), unsafeWindow = a.onclick());
  for (var a = [{o:"unsafeWindow.Waze", s:null}, {o:"unsafeWindow.Waze.model", s:"wazeModel"}, {o:"unsafeWindow.Waze.map", s:"wazeMap"}, {o:"unsafeWindow.Waze.model.chat", s:"wazeChat"}, {o:"unsafeWindow.Waze.app.loginManager", s:"loginManager"}, {o:"unsafeWindow.Waze.selectionManager", s:"selectionManager"}, {o:"unsafeWindow.Waze.updateRequestsControl", s:"updateRequestsControl"}, {o:"unsafeWindow.Waze.problemsControl", s:"problemsControl"}, {o:"unsafeWindow.Waze.app.loginManager.user", s:"me"}, 
  {o:"localStorage", s:null}, {o:"me.rank", s:"ul"}], c = 0;c < a.length;c++) {
    if (!waitForObject(a[c].o, a[c].s)) {
      return;
    }
  }
  initialiseCA();
}
function initialiseCA() {
  wazeChat.messages._events.register("messageUpdated", null, iSendAMessage);
  wazeChat.messages._events.register("add", null, iSendAMessage);
  wazeChat._events.register("change:open", null, openChatGUI);
  wazeChat.users._events.register("add", null, userEnter);
  wazeChat.users._events.register("remove", null, userLeave);
  var a = getElementsByClassName("new-message", getId("chat"));
  if (1 != a.length) {
    log("Error: cannot detect input message element");
  } else {
    a = a[0];
    a.style.paddingRight = "30px";
    var b = document.createElement("a");
    b.innerHTML = "+";
    b.className = "icon-link";
    b.style.cssFloat = "right";
    b.style.position = "relative";
    b.style.left = "25px";
    b.style.marginTop = "-20px";
    b.style.display = "block";
    b.onclick = insertPermalink;
    a.appendChild(b);
  }
  a = getElementsByClassName("WazeControlPermalink");
  0 == a.length ? log("error: can't find permalink container") : divPerma = a[0];
  loadSettings();
  setupOptionPanel();
  a = getElementsByClassName("message-list", getId("chat"))[0];
  b = document.createElement("div");
  b.className = "message system-message";
  b.innerHTML = '<div class="from"></div><div class="body"><div style="direction: ltr; text-align: left;">Chat addon v' + ca_version + ' rocks! <a href="#" id="CA-opensettings">Settings</a></div></div>';
  a.appendChild(b);
  getId("CA-opensettings").onclick = function() {
    getId("CA-settingsPanel").style.display = "block";
  };
  log("Init done");
}
function loadSettings() {
  CA_Settings = {showDate:!0, messageSound:!1, messageBGColor:"A1DCF5", alertBGColor:"880000", alertMatch:me.userName, alertSound:!1, removeInvisible:!1, bipPattern:"@{userName}?", systemMessageOnJoinLeave:!1};
  if ("undefined" !== typeof localStorage.WMEChatAddon_settings) {
    var a = JSON.parse(localStorage.WMEChatAddon_settings);
    logDebug("Loading local storage settings:", a);
    "undefined" !== typeof a.messageSound && (CA_Settings.messageSound = a.messageSound);
    "undefined" !== typeof a.showDate && (CA_Settings.showDate = a.showDate);
    "undefined" !== typeof a.messageBGColor && (CA_Settings.messageBGColor = a.messageBGColor);
    "undefined" !== typeof a.alertBGColor && (CA_Settings.alertBGColor = a.alertBGColor);
    "undefined" !== typeof a.alertMatch && (CA_Settings.alertMatch = a.alertMatch);
    "undefined" !== typeof a.alertSound && (CA_Settings.alertSound = a.alertSound);
    "undefined" !== typeof a.removeInvisible && (CA_Settings.removeInvisible = a.removeInvisible);
    "undefined" !== typeof a.bipPattern && (CA_Settings.bipPattern = a.bipPattern);
    "undefined" !== typeof a.systemMessageOnJoinLeave && (CA_Settings.systemMessageOnJoinLeave = a.systemMessageOnJoinLeave);
  }
  log("Settings loaded");
}
function saveSettings() {
  logDebug("Saving local storage settings:", CA_Settings);
  localStorage.WMEChatAddon_settings = JSON.stringify(CA_Settings);
  log("Settings saved");
}
function applySettings() {
  var a = getId("CA-opt-messagebg").value;
  if (null == a.match(/^[0-9a-f]{6}$/i)) {
    return "Error: Message background color must be a HTML format string\nwith exact length of 6 hexadecimal characters";
  }
  var b = getId("CA-opt-alertbg").value;
  if (null == b.match(/^[0-9a-f]{6}$/i)) {
    return "Error: Alert background color must be a HTML format string\nwith exact length of 6 hexadecimal characters";
  }
  var c = getId("CA-opt-bippattern").value;
  if (-1 == c.indexOf("{userName}")) {
    return "Error: bip pattern must contain {userName}";
  }
  CA_Settings = {messageSound:getId("CA-opt-messagesound").checked, showDate:getId("CA-opt-showdate").checked, messageBGColor:a, alertBGColor:b, alertMatch:getId("CA-opt-alertmatch").value, alertSound:getId("CA-opt-alertsound").checked, removeInvisible:getId("CA-opt-removeinvisibles").checked, bipPattern:c, systemMessageOnJoinLeave:getId("CA-opt-systemmessageonjoinleave").checked};
  return null;
}
function setupOptionPanel() {
  var a = document.createElement("div");
  a.id = "CA-settingsPanel";
  a.setAttribute("style", "border: 1px solid black; background-color: #FFFFFF; padding: 5px; position: absolute; top: 15px; right: 15px; z-index: 9999; border-top-left-radius: 5px; border-top-right-radius: 5px; border-bottom-right-radius: 5px; border-bottom-left-radius: 5px; display: none;");
  var b;
  b = '<center style="font-weight: bold; size: bigger;">Chat addon settings</center><br/>' + ('<label><input type="checkbox" id="CA-opt-messagesound"' + (CA_Settings.messageSound ? " checked" : "") + "> Play sound on new message</input></Label><br />");
  b += '<label><input type="checkbox" id="CA-opt-showdate"' + (CA_Settings.showDate ? " checked" : "") + "> Show message date (uncheck for time only)</input></Label><br />";
  b += '<label>My message background color: <input style="height: 25px;" type="text" size="6" maxlength="6" id="CA-opt-messagebg" value="' + CA_Settings.messageBGColor + '" /></Label><br />';
  b += '<label>Alert color: <input style="height: 25px;" type="text" size="6" maxlength="6" id="CA-opt-alertbg" value="' + CA_Settings.alertBGColor + '" /></Label><br />';
  b += '<label title="words separated by a comma\nCase unsensitive\n\neg:\n' + me.userName + "\nor\n" + me.userName + ',userNameOfAFriend,unlock">Alert match: <input style="height: 25px;" type="text" size="15" id="CA-opt-alertmatch" value="' + CA_Settings.alertMatch + '" /></Label><br />';
  b += '<label><input type="checkbox" id="CA-opt-alertsound"' + (CA_Settings.alertSound ? " checked" : "") + "> Play sound on new alert</input></Label><br />";
  b += '<label><input type="checkbox" id="CA-opt-removeinvisibles"' + (CA_Settings.removeInvisible ? " checked" : "") + "> Remove messages of users not in the users list of the room</input></Label><br />";
  b += '<label title="{userName} will be replaced by the user\'s name you click on\n\nEg:\nHey {userName}, come here please!\nor\n@{userName}?">Bip pattern (must contain {userName}): <input style="height: 25px;" type="text" size="15" id="CA-opt-bippattern" value="' + CA_Settings.bipPattern + '" /></Label><br />';
  b += '<label><input type="checkbox" id="CA-opt-systemmessageonjoinleave"' + (CA_Settings.systemMessageOnJoinLeave ? " checked" : "") + "> Add system message when a user join or leave the chat room</input></Label><br />";
  a.innerHTML = b + '<button id="CA-opt-close">Close</button>';
  getId("map").appendChild(a);
  getId("CA-opt-close").onclick = function() {
    var a = applySettings();
    null != a ? alert(a) : (saveSettings(), getId("CA-settingsPanel").style.display = "none");
  };
}
function iSendAMessage(a) {
  logDebug("ALERT ME iSendAMessage event:", a);
  a.attributes.from.name == me.userName && (a = getChatHelper(), null != a.button && null != a.header && (logDebug("ALERT ME remove bg color on iSendAMessage"), a.button.style.backgroundColor = "", a.header.style.backgroundColor = ""));
  newMessage();
}
function openChatGUI(a) {
  !0 == a.newValue ? logDebug("ALERT chat opens") : (logDebug("ALERT chat closes"), a = getChatHelper(), null != a.button && null != a.header && (logDebug("ALERT ME remove bg color on close chat"), a.button.style.backgroundColor = "", a.header.style.backgroundColor = ""));
}
function setFocusOnInputMessage() {
  var a = getElementsByClassName("message-input", getId("chat"));
  1 != a.length ? log("Error: cannot detect input message element") : a[0].focus();
}
function insertPermalink() {
  var a = getElementsByClassName("message-input", getId("chat"));
  1 != a.length ? log("Error: cannot detect input message element") : (a[0].value += divPerma.firstElementChild.href, window.setTimeout(setFocusOnInputMessage, 100));
}
function getChatHelper() {
  divChat = getId("chat-overlay");
  var a = {button:null, open:null, header:null};
  if (divChat) {
    -1 != divChat.className.indexOf("open") && (a.open = !0);
    var b = getElementsByClassName("toggle", divChat);
    logDebug("ALERT ME chatButtons: ", b);
    1 <= b.length && (a.button = b[0]);
    b = getElementsByClassName("header", divChat);
    1 <= b.length && (a.header = b[0]);
  }
  return a;
}
function removeDuplicates() {
  for (var a = getChatHelper(), b = getElementsByClassName("message", getId("chat")), c = 0;c < b.length;c++) {
    if ("none" != b[c].style.display && "message system-message" != b[c].className) {
      for (var d = b[c].children, e = 0;e < d.length;e++) {
        if ("from" == d[e].className) {
          var g = d[e].innerHTML.split(" "), f = g[0];
          logDebug("live user infos:", g);
          1 != g.length && f != me.userName && (f = d[e].firstChild.innerHTML);
          logDebug("live username:", f);
          doNotNotifyNext = f == me.userName ? !0 : !1;
          lastMessageFrom = f;
          if (!0 == CA_Settings.removeInvisible && f != me.userName && "" != f && null == getRankOfLiveUser(f)) {
            b[c].style.display = "none";
            continue;
          }
        }
        if ("body" == d[e].className) {
          for (var g = d[e].children, h = 0;h < g.length;h++) {
            logDebug("typeof alertMe:" + typeof g[h].alertMe);
            var k = g[h].innerHTML;
            if ("undefined" === typeof g[h].alertMe) {
              logDebug("ALERT ME UNDEFINED on " + k);
              for (var l = !1, m = CA_Settings.alertMatch.split(","), n = 0;n < m.length;n++) {
                if (-1 != k.toLowerCase().indexOf(m[n].toLowerCase())) {
                  l = !0;
                  break;
                }
              }
              !0 == l && f != me.userName && (logDebug("ALERT ME found chatHelper: ", a), g[h].alertMe = !0, null != a.button && null != a.header && (logDebug("ALERT ME setup bg color"), a.button.style.backgroundColor = "#" + CA_Settings.alertBGColor, a.header.style.backgroundColor = "#" + CA_Settings.alertBGColor, !0 == CA_Settings.alertSound && (log("Playing sound for alert..."), (new Audio("data:audio/mp3;base64," + alertSound)).play()), doNotNotifyNext = !0));
            }
            l = k.split("\n").filter(function(a, b, c) {
              return c.indexOf(a) != b ? (log('Message: "' + a.innerHTML + '" removed'), !1) : !0;
            });
            k != l.join("\n") && (g[h].innerHTML = l.join("\n"));
            0 != h && g[h].innerHTML == g[h - 1].innerHTML && "none" != g[h].style.display && (g[h].style.display = "none", log('Message: "' + g[h].innerHTML + '" removed'));
          }
        }
      }
    }
  }
}
function convertPermalinksAndLinks() {
  for (var a = [/https:\/\/www.waze.com\/editor\//, /https:\/\/www.waze.com\/[^/]+\/editor\//, /https:\/\/editor-beta.waze.com\//], b = "", c = [], d = [], e = [], g = getElementsByClassName("message", getId("chat")), f = 0;f < g.length;f++) {
    for (var h = g[f].children, k = 0;k < h.length;k++) {
      if ("from" == h[k].className) {
        var l = h[k].innerHTML.split(" ");
        if (1 == l.length) {
          if (b = h[k].innerHTML, "" != b) {
            l = "";
            if (b == me.userName) {
              h[k].innerHTML = h[k].innerHTML + " (" + (me.rank + 1) + ")";
            } else {
              var l = " ", m = getRankOfLiveUser(b);
              h[k].innerHTML = '<a href="#" id="CA-bip-' + bipCount + '">' + b + "</a> (" + (null != m ? m + 1 : "?") + ') <a href="#" id="CA-t-' + targetCount + '"><i class="crosshair icon-screenshot"></i></a>';
              d.push({id:targetCount, userName:b});
              e.push({id:bipCount, userName:b});
              targetCount++;
              bipCount++;
            }
            h[k].innerHTML = h[k].innerHTML + l + '<span style="float: right; color: #A0A0A0; font-size: smaller;">' + (CA_Settings.showDate ? (new Date).toLocaleString() : (new Date).toLocaleTimeString()) + "</span>";
          }
        } else {
          l = h[k].innerHTML.split(" "), b = l[0], 1 != l.length && b != me.userName && (b = h[k].firstChild.innerHTML);
        }
      }
      if ("body" == h[k].className) {
        for (b == me.userName && (h[k].style.backgroundColor = "#" + CA_Settings.messageBGColor), l = h[k].children, m = 0;m < l.length;m++) {
          if ("undefined" === typeof l[m].chatAddonOk) {
            l[m].chatAddonOk = !0;
            for (var n = l[m].innerHTML, p = n;0 < p.length;) {
              var q = getFirstPermalink(a, p);
              if (q) {
                var r = getJumpSetFromPermalink(q.permalink);
                if (r.lon && r.lat) {
                  n = n.replace(q.permalink, '<a href="#" id="CA-t-' + targetCount + '"><i class="crosshair icon-screenshot"></i></a>');
                  c.push({id:targetCount, jumpDetails:r});
                  log("permalink replaced by target on message posted by " + b);
                  targetCount++;
                  p = p.substring(q.end);
                  continue;
                }
              }
              p = p.substring(1);
            }
            n = n.replace(/(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g, '<a target="_blank" href="$1">$1</a>');
            l[m].innerHTML != n && (l[m].innerHTML = n);
          }
        }
      }
    }
  }
  for (f = 0;f < c.length;f++) {
    getId("CA-t-" + c[f].id).onclick = getFunctionWithArgs(jumpTo, [c[f].jumpDetails]);
  }
  for (f = 0;f < d.length;f++) {
    getId("CA-t-" + d[f].id).onclick = getFunctionWithArgs(jumpToUser, [d[f].userName]);
  }
  for (f = 0;f < e.length;f++) {
    getId("CA-bip-" + e[f].id).onclick = getFunctionWithArgs(bipUser, [e[f].userName]);
  }
}
function processMessages() {
  removeDuplicates();
  convertPermalinksAndLinks();
  logDebug("Last message: " + lastMessageFrom);
  if (lastMessageFrom == me.userName || "" == lastMessageFrom) {
    doNotNotifyNext = !0;
  }
}
function newMessage() {
  logDebug("newMessage called");
  doNotNotifyNext = !1;
  processMessages();
  !1 == doNotNotifyNext && !0 == CA_Settings.messageSound && (logDebug("Playing sound for new message..."), (new Audio("data:audio/mp3;base64," + notificationSound)).play());
  doNotNotifyNext = !1;
}
function bipUser(a) {
  var b = getElementsByClassName("message-input", getId("chat"));
  1 != b.length ? log("Error: cannot detect input message element") : (b = b[0], a = CA_Settings.bipPattern.replace(/\{userName\}/gi, a), b.value += a, window.setTimeout(setFocusOnInputMessage, 100));
}
function getMessageObjectFromData(a, b) {
  for (var c = null, d = 0;d < wazeModel.chat.messages.models.length;d++) {
    if (c = wazeModel.chat.messages.models[d], c.attributes.body == b && c.attributes.from.name == a) {
      return c;
    }
  }
  return null;
}
function getFirstPermalink(a, b) {
  for (var c = 0;c < a.length;c++) {
    var d = b.search(a[c]);
    if (-1 != d) {
      for (c = d + 1;c < b.length && " " != b.charAt(c) && "\n" != b.charAt(c);) {
        c++;
      }
      return{start:d, end:c, permalink:b.substring(d, c)};
    }
  }
  return null;
}
function getJumpSetFromPermalink(a) {
  logDebug("permalink: ", a);
  var b = a.match(/lon=([\-]?[0-9]*[.]?[0-9]*)/), c = a.match(/lat=([\-]?[0-9]*[.]?[0-9]*)/), d = a.match(/zoom=([0-9]+)/), e = a.match(/segments=(([0-9]+[,]?)+)+/), g = a.match(/nodes=(([0-9]+[,]?)+)+/), f = a.match(/venues=(([0-9|\.|\-]+[,]?)+)+/);
  a = a.match(/mapUpdateRequest=([0-9]*)/);
  logDebug("lon: ", b);
  logDebug("lat: ", c);
  logDebug("zoom: ", d);
  logDebug("segments: ", e);
  logDebug("nodes: ", g);
  logDebug("venues: ", f);
  logDebug("mapUpdateRequest: ", a);
  return{lon:2 == b.length ? parseFloat(b[1]) : null, lat:2 == c.length ? parseFloat(c[1]) : null, zoom:2 == d.length ? parseFloat(d[1]) : null, segments:e ? e[1].split(",") : null, nodes:g ? g[1].split(",") : null, venues:f ? f[1].split(",") : null, mapUpdateRequest:a ? a[1].split(",") : null};
}
function getRankOfLiveUser(a) {
  for (var b = 0;b < wazeChat.users.models.length;b++) {
    if (wazeChat.users.models[b].attributes.name == a) {
      return wazeChat.users.models[b].attributes.rank;
    }
  }
  return null;
}
function jumpToUser(a) {
  for (var b = null, c = 0;c < wazeChat.users.models.length && (b = wazeChat.users.models[c], b.attributes.name != a);c++) {
    b = null;
  }
  b ? jumpTo({lon:b.attributes.center.lon, lat:b.attributes.center.lat, zoom:null, segments:null, nodes:null, venues:null, mapUpdateRequest:null}) : log("Can't find user: loggued out or invisible???");
  return!1;
}
function jumpTo(a) {
  logDebug("jumping to: ", a);
  if ("undefined" !== typeof ChatJumper && !ChatJumper.isLast) {
    var b = wazeMap.getCenter(), c = wazeMap.getZoom();
    ChatJumper.last = [b.lon, b.lat];
    ChatJumper.zoom = c;
    ChatJumper.isLast = !0;
    ChatJumper.saveLS();
    ChatJumper.showButton();
  }
  b = OpenLayers.Layer.SphericalMercator.forwardMercator(a.lon, a.lat);
  a.zoom ? wazeMap.setCenter(b, a.zoom) : wazeMap.setCenter(b);
  (a.segments || a.nodes || a.venues || a.mapUpdateRequest) && window.setTimeout(getFunctionWithArgs(selectData, [a]), 500);
}
function selectData(a) {
  var b = !0;
  if (a.segments) {
    for (var c = [], d = 0;d < a.segments.length;d++) {
      var e = parseInt(a.segments[d]);
      if ("undefined" === typeof wazeModel.segments.objects[e]) {
        b = !1;
        break;
      }
      c.push(wazeModel.segments.objects[e]);
    }
    b && selectionManager.select(c);
  }
  if (a.nodes) {
    c = [];
    for (d = 0;d < a.nodes.length;d++) {
      e = parseInt(a.nodes[d]);
      if ("undefined" === typeof wazeModel.nodes.objects[e]) {
        b = !1;
        break;
      }
      c.push(wazeModel.nodes.objects[e]);
    }
    b && selectionManager.select(c);
  }
  if (a.venues) {
    wazeMap.landmarkLayer.setVisibility(!0);
    c = [];
    for (d = 0;d < a.venues.length;d++) {
      e = a.venues[d];
      if ("undefined" === typeof wazeModel.venues.objects[e]) {
        b = !1;
        break;
      }
      c.push(wazeModel.venues.objects[e]);
    }
    b && selectionManager.select(c);
  }
  a.mapUpdateRequest && 1 <= a.mapUpdateRequest.length && !a.segments && !a.nodes && !a.venues && (d = wazeModel.problems.objects[parseInt(a.mapUpdateRequest[0])], c = null, null == d && (c = wazeModel.turnProblems.objects[parseInt(a.mapUpdateRequest[0])]), logDebug("mp :", d), logDebug("tp :", c), null != d && (problemsControl.selectProblem(d), b = !0), null != c && (problemsControl.selectProblem(c), b = !0));
  b ? log("Data selected...:") : (log("Select data failed. Waiting for data..."), window.setTimeout(getFunctionWithArgs(selectData, [a]), 500));
}
function userEnter(a) {
  var b = getElementsByClassName("list-unstyled user-list", getId("chat"));
  if (1 == b.length) {
    for (var b = b[0].children, c = 0;c < b.length;c++) {
      var d = b[c];
      if (1 == d.children.length) {
        for (var e = d.firstChild.getAttribute("data-id"), g = "", f = 0;f < wazeChat.users.models.length;f++) {
          if (wazeChat.users.models[f].attributes.id == e) {
            g = wazeChat.users.models[f].attributes.name;
            break;
          }
        }
        g != me.userName && (e = document.createElement("a"), e.href = "#", e.id = "CA-bell-" + g, e.innerHTML = '<img src="data:image/png;base64,' + bellIcon + '" style="width: 15px;" />', e.style.cssFloat = "left", e.style.marginLeft = "-15px", e.onclick = getFunctionWithArgs(bipUser, [g]), d.insertBefore(e, d.firstChild));
      }
    }
  }
  a.attributes.name != me.userName && !0 == CA_Settings.systemMessageOnJoinLeave && addSystemMessage(a.attributes.name + " has joined");
}
function userLeave(a) {
  var b = getId("CA-bell-" + a.item.attributes.name);
  null != b && b.parentNode.removeChild(b);
  !0 == CA_Settings.systemMessageOnJoinLeave && addSystemMessage(a.item.attributes.name + " has left");
}
function addSystemMessage(a) {
  var b = getElementsByClassName("message-list", getId("chat"))[0], c = document.createElement("div");
  c.className = "message system-message";
  c.innerHTML = '<div class="from"></div><div class="body"><div style="direction: ltr; text-align: left;">' + a + '<span style="float: right; color: #A0A0A0; font-size: smaller;">' + (CA_Settings.showDate ? (new Date).toLocaleString() : (new Date).toLocaleTimeString()) + "</span></div></div>";
  b.appendChild(c);
  a = getElementsByClassName("unread-messages-notification", getId("chat"));
  1 == a.length && "none" == a[0].style.display && (b.scrollTop = b.scrollHeight);
}
function getFunctionWithArgs(a, b) {
  return function() {
    var c = JSON.stringify(b);
    return function() {
      var b = JSON.parse(c);
      a.apply(this, b);
    };
  }();
}
var notificationSound = "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qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+1JkkQ/xoxRS6GYTJiBhKhoAIwLAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7UmS9D/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq", 
alertSound = "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4jKQIiEAhAmZ9zXONKALIZ2jlSWJgjv/kTQ2MCo0CX9H+N3X//tUZOMAEQ4eU2lGLYQi48nVFe1CBPR7SaOs8hCYjyn01BbCkL2uJ3AQWABJpDTZ2erI4nhaW2rmJi0BUPbWHE+sssv0sjUUiyxOJQrzT9T+goMByQAT5o040p3awmNTzWvKAyho0/lvMPnqgcNGjZkJCwsKrYZMGtYt7mAwGZcO1xmy00aUWNMjVgoYE4l20NIlUGphqqgxcWBokhIky4vNk44uAsLCwZMxYXZWK8VFG/qF/8UVTEFNRTMuOTgu//tUZOeAETweVmiiUPwnI8oqNAeghRR7Q6Uk8ICUjylwcx7GMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tUZOcAETQeVWjpPY4mo9rNHSexhOB7VaOM5TiXDyj0dJ7GVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tUROgFAT8XTDGDNKAsIbpaGCNig3Q7ACMEbih6hWEAYJhAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tUZO6P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV", 
bellIcon = "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB94GCw4WEy4ZfF0AAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAABHklEQVQ4y6WUvUpDQRCFvxuCAQ0mptNC7PIEappYWfgCynm2PMGBdD6CsRFre7uLIAgiQoLc2GzkJt6fvclUu7MzH2dmmUmoMUnHwFm4vtpOq+KTCtARMAXOgcPg/gSegVvbH9FASZfAA7AHLHNxq/MCuLL9VAuU1AG+gVZNNzJg3/Y87yxKGkfAVrnjIuemDYi3QQyw3wDYjwFehObX2TLEln+KpDbwBXQiFc6Bru2fMoWzBjBC7KywZEl3wCiy3HzZo5D7T+GkbnoqBmOyBpR0DfQaqsur7AXGn8LhFuo2VQ7zwJTdLV1TJKm1ZckAie0sZn2dlDy/2X4vemjXbJPHgvHKgNPGCzaoTID73Ii9ADe2Fzt1W9KBpG5M7C95FkcoqcMYxwAAAABJRU5ErkJggg==";
initializeWazeObjects();