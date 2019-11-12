/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/* global chrome */

const ports = {};

const IS_FIREFOX = navigator.userAgent.indexOf('Firefox') >= 0;

chrome.runtime.onConnect.addListener(function(port) {
  let tab = null;
  let name = null;
  if (isNumeric(port.name)) {
    tab = port.name;
    name = 'devtools';
    installContentScript(+port.name);
  } else {
    tab = port.sender.tab.id;
    name = 'content-script';
  }

  if (!ports[tab]) {
    ports[tab] = {
      devtools: null,
      'content-script': null,
    };
  }
  ports[tab][name] = port;

  if (ports[tab].devtools && ports[tab]['content-script']) {
    doublePipe(ports[tab].devtools, ports[tab]['content-script']);
  }
});

function isNumeric(str: string): boolean {
  return +str + '' === str;
}

function installContentScript(tabId: number) {
  chrome.tabs.executeScript(
    tabId,
    { file: '/build/contentScript.js' },
    function() {}
  );
}

function doublePipe(one, two) {
  one.onMessage.addListener(lOne);
  function lOne(message) {
    two.postMessage(message);
  }
  two.onMessage.addListener(lTwo);
  function lTwo(message) {
    one.postMessage(message);
  }
  function shutdown() {
    one.onMessage.removeListener(lOne);
    two.onMessage.removeListener(lTwo);
    one.disconnect();
    two.disconnect();
  }
  one.onDisconnect.addListener(shutdown);
  two.onDisconnect.addListener(shutdown);
}

function setIconAndPopup(relayBuildType, tabId) {
  chrome.browserAction.setIcon({
    tabId: tabId,
    path: {
      '16': 'icons/16-' + relayBuildType + '.png',
      '32': 'icons/32-' + relayBuildType + '.png',
      '48': 'icons/48-' + relayBuildType + '.png',
      '128': 'icons/128-' + relayBuildType + '.png',
    },
  });
  chrome.browserAction.setPopup({
    tabId: tabId,
    popup: 'popups/' + relayBuildType + '.html',
  });
}

// Listen to URL changes on the active tab and reset the DevTools icon.
// This prevents non-disabled icons from sticking in Firefox.
// Don't listen to this event in Chrome though.
// It fires more frequently, often after onMessage() has been called.
if (IS_FIREFOX) {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active && changeInfo.status === 'loading') {
      setIconAndPopup('disabled', tabId);
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender) => {
  if (sender.tab) {
    // This is sent from the hook content script.
    // It tells us a renderer has attached.
    if (request.hasDetectedReact) {
      setIconAndPopup('enabled', sender.tab.id);
    }
  }
});
