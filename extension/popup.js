/**
 * Visual Click Prompt (VCP) - Popup Controller
 * Manages project workspaces, prompt reviews, macro instructions,
 * and dispatching to Antigravity agent bridge.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const serverStatusPill = document.getElementById('server-status-pill');
  const masterPowerCard = document.getElementById('master-power-card');
  const masterPowerSwitch = document.getElementById('master-power-switch');
  const powerDot = document.getElementById('power-dot');
  const powerBadge = document.getElementById('power-badge');
  const powerSubtext = document.getElementById('power-subtext');
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
  let isVcpGloballyEnabled = true;
  let activeTab = null;
  let activeUrl = '';
  let activeOrigin = '';
  let activePath = '';
  let activeFilter = 'current'; // 'current' | 'all'
  let allWebsitePins = [];
  let currentPagePins = [];

  // Helper for URL normalization
  function normalizeUrlString(rawUrl) {
    try {
      const u = new URL(rawUrl);
      const cleanParams = new URLSearchParams();
      for (const [k, v] of u.searchParams.entries()) {
        if (!k.startsWith('utm_') && k !== 'gclid' && k !== 'fbclid' && k !== 'ref') {
          cleanParams.append(k, v);
        }
      }
      cleanParams.sort();
      const search = cleanParams.toString() ? `?${cleanParams.toString()}` : '';
      const path = u.pathname.replace(/\/+$/, '') || '/';
      return {
        origin: u.origin,
        path: `${path}${search}`
      };
    } catch (e) {
      return { origin: 'global', path: '/' };
    }
  }

  // 1. Get Active Browser Tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs && tabs[0]) {
    activeTab = tabs[0];
    activeUrl = activeTab.url || '';
    const norm = normalizeUrlString(activeUrl);
    activeOrigin = norm.origin;
    activePath = norm.path;
  }

  const startBridgeBtn = document.getElementById('start-bridge-btn');

  // 2. Check Local Bridge Health
  async function checkBridgeHealth() {
    chrome.runtime.sendMessage({ action: 'CHECK_BRIDGE_HEALTH' }, (response) => {
      if (response && response.success && response.data) {
        serverStatusPill.className = 'server-status online';
        serverStatusPill.querySelector('.status-text').textContent = 'Bridge Online';
        serverStatusPill.title = `Bridge running at 127.0.0.1:8765. Active Project: ${response.data.activeProject || 'Default'}`;
        if (startBridgeBtn) startBridgeBtn.style.display = 'none';
      } else {
        serverStatusPill.className = 'server-status offline';
        serverStatusPill.querySelector('.status-text').textContent = 'Bridge Offline';
        serverStatusPill.title = 'Click Start or run start-bridge.bat to activate local Antigravity bridge';
        if (startBridgeBtn) {
          startBridgeBtn.style.display = 'inline-flex';
          startBridgeBtn.disabled = false;
          startBridgeBtn.textContent = '▶️ Start';
        }
      }
    });
  }

  if (startBridgeBtn) {
    startBridgeBtn.addEventListener('click', () => {
      startBridgeBtn.disabled = true;
      startBridgeBtn.textContent = 'Starting...';
      showToast('Launching bridge daemon via vcp:// protocol...', 'warning');

      // Trigger custom protocol registered in Windows registry
      window.location.href = 'vcp://start';

      // Poll until online
      let attempts = 0;
      const poll = setInterval(() => {
        attempts++;
        chrome.runtime.sendMessage({ action: 'CHECK_BRIDGE_HEALTH' }, (res) => {
          if (res && res.success) {
            clearInterval(poll);
            checkBridgeHealth();
            showToast('✓ Bridge is now Online!', 'success');
          } else if (attempts >= 6) {
            clearInterval(poll);
            checkBridgeHealth();
          }
        });
      }, 1000);
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

  // 3b. Master ON / OFF Power Switch
  async function loadMasterPowerState() {
    const data = await chrome.storage.local.get(['vcp_enabled']);
    isVcpGloballyEnabled = data.vcp_enabled !== false;
    updateMasterPowerUI(isVcpGloballyEnabled);
  }

  function updateMasterPowerUI(enabled) {
    if (!masterPowerSwitch) return;
    masterPowerSwitch.checked = enabled;

    if (enabled) {
      if (masterPowerCard) masterPowerCard.classList.remove('disabled');
      if (powerDot) powerDot.className = 'power-status-indicator';
      if (powerBadge) {
        powerBadge.className = 'power-badge';
        powerBadge.textContent = 'ON';
      }
      if (powerSubtext) powerSubtext.textContent = 'Visual click prompting active';
      document.querySelectorAll('.section').forEach(sec => sec.classList.remove('vcp-dormant-dimmed'));
      const footer = document.querySelector('.footer');
      if (footer) footer.classList.remove('vcp-dormant-dimmed');
    } else {
      if (masterPowerCard) masterPowerCard.classList.add('disabled');
      if (powerDot) powerDot.className = 'power-status-indicator disabled';
      if (powerBadge) {
        powerBadge.className = 'power-badge disabled';
        powerBadge.textContent = 'OFF';
      }
      if (powerSubtext) powerSubtext.textContent = 'Dormant — zero overhead on pages';
      document.querySelectorAll('.section').forEach(sec => sec.classList.add('vcp-dormant-dimmed'));
      const footer = document.querySelector('.footer');
      if (footer) footer.classList.add('vcp-dormant-dimmed');
    }
  }

  if (masterPowerSwitch) {
    masterPowerSwitch.addEventListener('change', async () => {
      const enabled = masterPowerSwitch.checked;
      isVcpGloballyEnabled = enabled;
      await chrome.storage.local.set({ vcp_enabled: enabled });
      updateMasterPowerUI(enabled);

      // Notify all tabs
      try {
        const allTabs = await chrome.tabs.query({});
        for (const t of allTabs) {
          if (t.id) {
            chrome.tabs.sendMessage(t.id, { action: 'SET_VCP_ENABLED', enabled }).catch(() => {});
          }
        }
      } catch (e) { }

      // Update badge via background worker
      chrome.runtime.sendMessage({ action: 'SET_VCP_ENABLED', enabled });

      showToast(enabled ? '⚡ VCP Enabled (Active)' : '⏸️ VCP Turned OFF (Dormant)', enabled ? 'success' : 'warning');
    });
  }

  // 4. Inspection Mode Toggle
  if (activeTab && activeTab.id) {
    chrome.tabs.sendMessage(activeTab.id, { action: 'GET_PAGE_STATUS' }, (res) => {
      if (chrome.runtime.lastError || !res) return;
      if (typeof res.isInspectMode === 'boolean') {
        updateInspectButton(res.isInspectMode);
      }
      if (res.origin) activeOrigin = res.origin;
      if (res.normalizedPath) activePath = res.normalizedPath;
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
    if (!activeOrigin) {
      const norm = normalizeUrlString(activeUrl);
      activeOrigin = norm.origin;
      activePath = norm.path;
    }

    const storageKey = `vcp_pins_${activeOrigin}`;
    const data = await chrome.storage.local.get([storageKey]);
    allWebsitePins = Array.isArray(data[storageKey]) ? data[storageKey] : [];

    // Filter current page pins: matches activePath OR matching URL without hash
    currentPagePins = allWebsitePins.filter(p => {
      if (p.normalizedPath === activePath) return true;
      if (p.url && activeUrl) {
        const cleanP = p.url.split('#')[0].replace(/\/+$/, '');
        const cleanA = activeUrl.split('#')[0].replace(/\/+$/, '');
        if (cleanP === cleanA) return true;
      }
      return false;
    });

    if (countCurrent) countCurrent.textContent = currentPagePins.length;
    if (countAll) countAll.textContent = allWebsitePins.length;

    renderPinsList();
    updateClearPinsButton();
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
      updateClearPinsButton();
      return;
    }

    displayedPins.forEach(pin => {
      const item = document.createElement('div');
      item.className = 'pin-item';
      item.innerHTML = `
        <div class="pin-item-header">
          <span class="pin-item-badge">📌 Pin #${pin.index}</span>
          <span class="pin-item-target" title="${pin.anchor?.cssSelector || pin.anchor?.xpath || ''}">&lt;${pin.anchor?.tagName || 'element'}&gt;</span>
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
          }).catch(() => {});
        }
      });

      item.querySelector('.pin-action-delete').addEventListener('click', async () => {
        await deletePin(pin.id);
      });

      pinsList.appendChild(item);
    });

    updateClearPinsButton();
  }

  async function deletePin(pinId) {
    if (!pinId) return;
    const storageKey = `vcp_pins_${activeOrigin}`;
    allWebsitePins = allWebsitePins.filter(p => p.id !== pinId);
    currentPagePins = currentPagePins.filter(p => p.id !== pinId);
    currentPagePins.forEach((p, idx) => p.index = idx + 1);

    await chrome.storage.local.set({ [storageKey]: allWebsitePins });

    // Notify tab to update pins directly
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, { action: 'DELETE_PIN', pinId }).catch(() => {});
    }

    if (countCurrent) countCurrent.textContent = currentPagePins.length;
    if (countAll) countAll.textContent = allWebsitePins.length;
    renderPinsList();
    updateClearPinsButton();
    showToast('✓ Pin deleted', 'success');
  }

  function updateClearPinsButton() {
    if (!clearPinsBtn) return;
    clearPinsBtn.classList.remove('btn-confirm-delete');

    if (activeFilter === 'current') {
      const count = currentPagePins.length;
      clearPinsBtn.textContent = `Clear Page Pins (${count})`;
      clearPinsBtn.disabled = count === 0;
      clearPinsBtn.title = count === 0 ? 'No pins on this page to clear' : 'Delete all pins on this page';
    } else {
      const count = allWebsitePins.length;
      clearPinsBtn.textContent = `Delete All Pins (${count})`;
      clearPinsBtn.disabled = count === 0;
      clearPinsBtn.title = count === 0 ? 'No website pins to clear' : 'Delete all pins across this entire website';
    }
  }

  // Tabs Switching
  tabCurrent.addEventListener('click', () => {
    activeFilter = 'current';
    tabCurrent.classList.add('active');
    tabAll.classList.remove('active');
    renderPinsList();
    updateClearPinsButton();
  });

  tabAll.addEventListener('click', () => {
    activeFilter = 'all';
    tabAll.classList.add('active');
    tabCurrent.classList.remove('active');
    renderPinsList();
    updateClearPinsButton();
  });

  // Clear Pins Handler - Immediate, Guaranteed 1-Click Execution
  clearPinsBtn.addEventListener('click', async () => {
    const isCurrent = activeFilter === 'current';
    const targetPins = isCurrent ? currentPagePins : allWebsitePins;
    const targetCount = targetPins.length;

    if (targetCount === 0) return;

    const storageKey = `vcp_pins_${activeOrigin}`;

    if (isCurrent) {
      const idsToDelete = new Set(currentPagePins.map(p => p.id));
      allWebsitePins = allWebsitePins.filter(p => {
        if (idsToDelete.has(p.id)) return false;
        if (p.normalizedPath === activePath) return false;
        if (p.url && activeUrl) {
          const cleanP = p.url.split('#')[0].replace(/\/+$/, '');
          const cleanA = activeUrl.split('#')[0].replace(/\/+$/, '');
          if (cleanP === cleanA) return false;
        }
        return true;
      });
      currentPagePins = [];

      await chrome.storage.local.set({ [storageKey]: allWebsitePins });

      if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, {
          action: 'CLEAR_PAGE_PINS',
          pinIds: Array.from(idsToDelete),
          activePath: activePath
        }).catch(() => {});
      }

      showToast(`✓ Cleared ${targetCount} page pin${targetCount === 1 ? '' : 's'}`, 'success');
    } else {
      allWebsitePins = [];
      currentPagePins = [];

      await chrome.storage.local.remove([storageKey]);

      if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'CLEAR_ALL_PINS' }).catch(() => {});
      }

      showToast(`✓ Deleted all ${targetCount} website pin${targetCount === 1 ? '' : 's'}`, 'success');
    }

    if (countCurrent) countCurrent.textContent = '0';
    if (countAll) countAll.textContent = allWebsitePins.length;
    renderPinsList();
    updateClearPinsButton();
  });

  // Real-time synchronization when pins are modified in page
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && activeOrigin) {
      const storageKey = `vcp_pins_${activeOrigin}`;
      if (storageKey in changes) {
        allWebsitePins = Array.isArray(changes[storageKey].newValue) ? changes[storageKey].newValue : [];
        currentPagePins = allWebsitePins.filter(p => {
          if (p.normalizedPath === activePath) return true;
          if (p.url && activeUrl) {
            const cleanP = p.url.split('#')[0].replace(/\/+$/, '');
            const cleanA = activeUrl.split('#')[0].replace(/\/+$/, '');
            if (cleanP === cleanA) return true;
          }
          return false;
        });
        if (countCurrent) countCurrent.textContent = currentPagePins.length;
        if (countAll) countAll.textContent = allWebsitePins.length;
        renderPinsList();
        updateClearPinsButton();
      }
    }
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
  await loadMasterPowerState();
  checkBridgeHealth();
  await loadProjectSettings();
  await loadPins();
});
