chrome.runtime.onInstalled.addListener(function() {
  console.log('Extension installed');
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.scripting.executeScript({
      target: { tabId: activeInfo.tabId },
      files: ['js/passwordCredentials.js']
  }).catch(err => console.error('Error executing script on tab activated:', err));
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.active) {
      chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['js/passwordCredentials.js']
      }).catch(err => console.error('Error executing script on tab updated:', err));
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureLogin') {
      // Store the credentials temporarily (use encryption for real implementations)
      chrome.storage.local.set({
          username: message.username,
          password: message.password,
          url: message.url
      }, () => {
          chrome.windows.getCurrent((window) => {
              chrome.windows.update(window.id, {focused: true}, () => {
                  chrome.action.setPopup({popup: "savepassword.html"});
                  chrome.action.openPopup();  
              });
          });
      });
  }
});
