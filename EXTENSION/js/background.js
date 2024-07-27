chrome.runtime.onInstalled.addListener(function() {
  console.log('Extension installed');
});
  
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.executeScript(activeInfo.tabId, {
    file: 'js/passwordCredentials.js'
  });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.active) {
    chrome.tabs.executeScript(tabId, {
      file: 'js/passwordCredentials.js'
    });
  }
});
