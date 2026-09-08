/**
 * Visual Click Prompt (VCP) - Background Service Worker
 * MV3 secure proxy for local Antigravity bridge, badge counters, and SPA routing.
 */

const LOCAL_BRIDGE_URL = 'http://127.0.0.1:8765';

// Keyboard shortcut command listener
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-inspect') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'TOGGLE_INSPECT_MODE' });
      }
    });
  }
});

// SPA Route change listener via webNavigation
chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
  if (details.frameId === 0) { // Top frame only
    try {
      await chrome.tabs.sendMessage(details.tabId, {
        action: 'ROUTE_CHANGED',
        url: details.url
      });
    } catch (e) {
      // Content script might not be injected yet
    }
  }
});

// Update badge counter helper
async function setTabBadge(tabId, count) {
  if (!tabId) return;
  try {
    const text = count > 0 ? String(count) : '';
    await chrome.action.setBadgeText({ tabId, text });
    await chrome.action.setBadgeBackgroundColor({ tabId, color: '#4f46e5' });
  } catch (err) {
    // Ignore tab errors
  }
}

// Inter-process message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Update badge request from content script
  if (message.action === 'UPDATE_BADGE') {
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId) {
      setTabBadge(tabId, message.count);
    }
    sendResponse({ success: true });
    return true;
  }

  // Check bridge server health
  if (message.action === 'CHECK_BRIDGE_HEALTH') {
    fetch(`${LOCAL_BRIDGE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  // Get project workspaces from bridge
  if (message.action === 'GET_PROJECTS') {
    fetch(`${LOCAL_BRIDGE_URL}/api/projects`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  // Proxy feedback prompt bundle to local Antigravity bridge
  if (message.action === 'SEND_FEEDBACK_TO_AGENT') {
    fetch(`${LOCAL_BRIDGE_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(message.payload),
      signal: AbortSignal.timeout(8000)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Bridge returned HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        sendResponse({ success: true, data });
      })
      .catch(err => {
        console.error('VCP Service Worker bridge error:', err);
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep message channel open for async fetch
  }

  return false;
});
