/**
 * Visual Click Prompt (VCP) - Popup Controller
 * Manages project workspaces, prompt reviews, macro instructions,
 * and dispatching to Antigravity agent bridge.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const serverStatusPill = document.getElementById('server-status-pill');
  const projectInput = document.getElementById('project-input');
  const projectSaveBtn = document.getElementById('project-save-btn');
  const recentProjectsList = document.getElementById('recent-projects-list');
  const toggleInspectBtn = document.getElementById('toggle-inspect-btn');
  const inspectBtnText = document.getElementById('inspect-btn-text');
  const tabCurrent = document.getElementById('tab-current');
  const tabAll = document.getElementById('tab-all');
  const countCurrent = document.getElementById('count-current');
  const countAll = document.getElementById('count-all');
  const pinsList = document.getElementById('pins-list');
  const macroPrompt = document.getElementById('macro-prompt');
  const clearPinsBtn = document.getElementById('clear-pins-btn');
  const sendAgentBtn = document.getElementById('send-agent-btn');
  const toastBanner = document.getElementById('toast-banner');

  // Active State
  let activeTab = null;
  let activeUrl = '';
  let activeOrigin = '';
  let activePath = '';
  let activeFilter = 'current'; // 'current' | 'all'
  let allWebsitePins = [];
  let currentPagePins = [];

  // 1. Get Active Browser Tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs && tabs[0]) {
    activeTab = tabs[0];
    activeUrl = activeTab.url || '';
    try {
      const u = new URL(activeUrl);
      activeOrigin = u.origin;
      const cleanParams = new URLSearchParams();
      for (const [k, v] of u.searchParams.entries()) {
        if (!k.startsWith('utm_') && k !== 'gclid' && k !== 'fbclid') {
          cleanParams.append(k, v);
        }
      }
      cleanParams.sort();
      const search = cleanParams.toString() ? `?${cleanParams.toString()}` : '';
      activePath = (u.pathname.replace(/\/+$/, '') || '/') + search;
    } catch (e) {
      activeOrigin = 'global';
      activePath = '/';
    }
  }

  // 2. Check Local Bridge Health
  async function checkBridgeHealth() {
    chrome.runtime.sendMessage({ action: 'CHECK_BRIDGE_HEALTH' }, (response) => {
      if (response && response.success && response.data) {
        serverStatusPill.className = 'server-status online';
        serverStatusPill.querySelector('.status-text').textContent = 'Bridge Online';
        serverStatusPill.title = `Bridge running at 127.0.0.1:8765. Active Project: ${response.data.activeProject || 'Default'}`;
      } else {
        serverStatusPill.className = 'server-status offline';
        serverStatusPill.querySelector('.status-text').textContent = 'Bridge Offline';
        serverStatusPill.title = 'Run start-bridge.bat to activate local Antigravity bridge';
      }
    });
  }

  // 3. Project Workspace Management
  async function loadProjectSettings() {
    const data = await chrome.storage.local.get(['vcp_target_project', 'vcp_recent_projects']);
    const targetProject = data.vcp_target_project || 'C:\\prj\\vcp';
    projectInput.value = targetProject;

    const recents = data.vcp_recent_projects || ['C:\\prj\\vcp', 'C:\\prj\\pdf-anki-sync'];
    renderRecentProjects(recents);
  }

  function renderRecentProjects(recents) {
    recentProjectsList.innerHTML = '';
    recents.forEach(proj => {
      const chip = document.createElement('span');
      chip.className = 'recent-chip';
      const base = proj.split(/[\\/]/).pop() || proj;
      chip.textContent = base;
      chip.title = proj;
      chip.addEventListener('click', () => {
        projectInput.value = proj;
        saveProject(proj);
      });
      recentProjectsList.appendChild(chip);
    });
  }

  async function saveProject(projPath) {
    const cleanPath = (projPath || '').trim();
    if (!cleanPath) return;

    const data = await chrome.storage.local.get(['vcp_recent_projects']);
    let recents = data.vcp_recent_projects || [];
    if (!recents.includes(cleanPath)) {
      recents.unshift(cleanPath);
      if (recents.length > 5) recents = recents.slice(0, 5);
    }

    await chrome.storage.local.set({
      vcp_target_project: cleanPath,
      vcp_recent_projects: recents
    });

    renderRecentProjects(recents);
    showToast(`Target project set to ${cleanPath}`, 'success');
  }

  projectSaveBtn.addEventListener('click', () => {
    saveProject(projectInput.value);
  });

  // 4. Inspection Mode Toggle
  if (activeTab && activeTab.id) {
    chrome.tabs.sendMessage(activeTab.id, { action: 'GET_PAGE_STATUS' }, (res) => {
      if (chrome.runtime.lastError || !res) return;
      updateInspectButton(res.isInspectMode);
    });
  }

  function updateInspectButton(isActive) {
    if (isActive) {
      toggleInspectBtn.classList.add('active');
      inspectBtnText.textContent = 'Turn OFF Pin Mode';
    } else {
      toggleInspectBtn.classList.remove('active');
      inspectBtnText.textContent = 'Turn ON Pin Mode (Alt+Shift+V)';
    }
  }

  toggleInspectBtn.addEventListener('click', () => {
    if (!activeTab || !activeTab.id) return;
    chrome.tabs.sendMessage(activeTab.id, { action: 'TOGGLE_INSPECT_MODE' }, (res) => {
      if (res && typeof res.isInspectMode === 'boolean') {
        updateInspectButton(res.isInspectMode);
      }
    });
  });

  // 5. Load & Render Pins
  async function loadPins() {
    // 1. Try to query active tab directly first
    if (activeTab && activeTab.id) {
      try {
        const res = await chrome.tabs.sendMessage(activeTab.id, { action: 'GET_ALL_PINS' });
        if (res && Array.isArray(res.pins)) {
          currentPagePins = res.pins;
        }
      } catch (e) { }
    }

    // 2. Also load from storage
    if (activeOrigin) {
      const storageKey = `vcp_pins_${activeOrigin}`;
      const data = await chrome.storage.local.get([storageKey]);
      allWebsitePins = data[storageKey] || [];
      if (currentPagePins.length === 0) {
        currentPagePins = allWebsitePins.filter(p => p.normalizedPath === activePath);
      }
    }

    countCurrent.textContent = currentPagePins.length;
    countAll.textContent = allWebsitePins.length;

    renderPinsList();
  }

  function renderPinsList() {
    pinsList.innerHTML = '';
    const displayedPins = activeFilter === 'current' ? currentPagePins : allWebsitePins;

    if (displayedPins.length === 0) {
      pinsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📌</div>
          <p>No pins ${activeFilter === 'current' ? 'on this page' : 'on this website'} yet.</p>
          <span>Click "Turn ON Pin Mode" and click any element to capture prompts!</span>
        </div>
      `;
      return;
    }

    displayedPins.forEach(pin => {
      const item = document.createElement('div');
      item.className = 'pin-item';
      item.innerHTML = `
        <div class="pin-item-header">
          <span class="pin-item-badge">📌 Pin #${pin.index}</span>
          <span class="pin-item-target" title="${pin.anchor.cssSelector || pin.anchor.xpath}">&lt;${pin.anchor.tagName}&gt;</span>
        </div>
        <div class="pin-item-prompt">${escapeHtml(pin.prompt)}</div>
        <div class="pin-item-actions">
          <span class="pin-action-link pin-action-jump">Jump to Element</span>
          <span class="pin-action-link pin-action-delete">Delete</span>
        </div>
      `;

      item.querySelector('.pin-action-jump').addEventListener('click', () => {
        if (activeTab && activeTab.id) {
          chrome.tabs.sendMessage(activeTab.id, {
            action: 'FOCUS_PIN',
            pinId: pin.id
          });
        }
      });

      item.querySelector('.pin-action-delete').addEventListener('click', async () => {
        await deletePin(pin.id);
      });

      pinsList.appendChild(item);
    });
  }

  async function deletePin(pinId) {
    const storageKey = `vcp_pins_${activeOrigin}`;
    allWebsitePins = allWebsitePins.filter(p => p.id !== pinId);
    // Re-index
    currentPagePins = allWebsitePins.filter(p => p.normalizedPath === activePath);
    currentPagePins.forEach((p, idx) => p.index = idx + 1);

    await chrome.storage.local.set({ [storageKey]: allWebsitePins });
    await loadPins();

    // Notify tab to update pins
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, { action: 'ROUTE_CHANGED', url: activeUrl });
    }
  }

  // Tabs Switching
  tabCurrent.addEventListener('click', () => {
    activeFilter = 'current';
    tabCurrent.classList.add('active');
    tabAll.classList.remove('active');
    renderPinsList();
  });

  tabAll.addEventListener('click', () => {
    activeFilter = 'all';
    tabAll.classList.add('active');
    tabCurrent.classList.remove('active');
    renderPinsList();
  });

  // Clear Pins
  clearPinsBtn.addEventListener('click', async () => {
    if (currentPagePins.length === 0) return;
    if (!confirm(`Delete all ${currentPagePins.length} pins on this page?`)) return;

    const storageKey = `vcp_pins_${activeOrigin}`;
    allWebsitePins = allWebsitePins.filter(p => p.normalizedPath !== activePath);
    await chrome.storage.local.set({ [storageKey]: allWebsitePins });
    await loadPins();

    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, { action: 'ROUTE_CHANGED', url: activeUrl });
    }
    showToast('Page pins cleared', 'success');
  });

  const autoTriggerCheckbox = document.getElementById('auto-trigger-checkbox');

  // Load auto-trigger setting
  chrome.storage.local.get(['vcp_auto_trigger'], (res) => {
    if (autoTriggerCheckbox) {
      autoTriggerCheckbox.checked = res.vcp_auto_trigger !== false;
    }
  });

  if (autoTriggerCheckbox) {
    autoTriggerCheckbox.addEventListener('change', () => {
      chrome.storage.local.set({ vcp_auto_trigger: autoTriggerCheckbox.checked });
    });
  }

  // 6. Send to Antigravity
  sendAgentBtn.addEventListener('click', async () => {
    const pinsToSend = activeFilter === 'all' ? allWebsitePins : currentPagePins;

    if (pinsToSend.length === 0) {
      showToast('No pins to send! Add some pins on the website first.', 'error');
      return;
    }

    const targetProject = projectInput.value.trim() || 'C:\\prj\\vcp';
    const macro = macroPrompt.value.trim();
    const autoTrigger = autoTriggerCheckbox ? autoTriggerCheckbox.checked : false;

    sendAgentBtn.disabled = true;
    sendAgentBtn.innerHTML = `<span>⏳ ${autoTrigger ? 'Triggering Agent...' : 'Sending to Bridge...'}</span>`;

    const payload = {
      projectPath: targetProject,
      url: activeUrl,
      origin: activeOrigin,
      normalizedPath: activePath,
      filterMode: activeFilter,
      macroPrompt: macro,
      autoTrigger: autoTrigger,
      pins: pinsToSend,
      timestamp: Date.now()
    };

    chrome.runtime.sendMessage({
      action: 'SEND_FEEDBACK_TO_AGENT',
      payload: payload
    }, (response) => {
      sendAgentBtn.disabled = false;
      sendAgentBtn.innerHTML = `<span>⚡ Send to Antigravity</span>`;

      if (response && response.success) {
        if (response.data?.agentTriggered) {
          showToast(`✓ Prompts written & Agent Auto-Triggered via agy!`, 'success');
        } else {
          showToast(`✓ Prompts written to ${response.data.savedFile || 'Antigravity workspace'}!`, 'success');
        }
        macroPrompt.value = '';
      } else {
        const err = response?.error || 'Bridge server not reachable';
        const mdText = generateMarkdownForClipboard(pinsToSend, macro, activeUrl);
        navigator.clipboard.writeText(mdText).then(() => {
          showToast(`⚠️ Bridge offline, but task brief copied to clipboard for Antigravity!`, 'warning');
        }).catch(() => {
          showToast(`Bridge offline (${err}). Run start-bridge.bat!`, 'error');
        });
      }
    });
  });

  function generateMarkdownForClipboard(pins, macro, url) {
    let md = `# 🎯 Visual Feedback for ${url}\n\n`;
    if (macro) md += `> **Directive:** ${macro}\n\n`;
    pins.forEach(p => {
      md += `### Pin #${p.index} <${p.anchor?.tagName || 'element'}>\n`;
      md += `- **Prompt:** ${p.prompt}\n`;
      md += `- **Selector:** \`${p.anchor?.cssSelector || p.anchor?.xpath || 'unknown'}\`\n`;
      if (p.anchor?.textQuote?.exact) md += `- **Text:** "${p.anchor.textQuote.exact}"\n`;
      md += `\n`;
    });
    return md;
  }

  function showToast(message, type = 'success') {
    toastBanner.className = `toast-banner ${type}`;
    toastBanner.textContent = message;
    setTimeout(() => {
      toastBanner.style.display = 'none';
      toastBanner.className = 'toast-banner';
    }, 4500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize
  checkBridgeHealth();
  await loadProjectSettings();
  await loadPins();
});
