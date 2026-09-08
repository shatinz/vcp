/**
 * Visual Click Prompt (VCP) - In-Page Content Script
 * Isolated Shadow DOM, capture-phase DOM inspection, multi-tier anchoring,
 * multi-page persistent pin markers, and SPA navigation synchronization.
 */

(function () {
  // Prevent duplicate injection
  if (window.__VCP_INITIALIZED__) return;
  window.__VCP_INITIALIZED__ = true;

  // State
  let isInspectMode = false;
  let currentHoverElement = null;
  let activePopover = null;
  let pagePins = [];
  let shadowRoot = null;
  let hostElement = null;
  let highlightBox = null;
  let highlightLabel = null;
  let pinsContainer = null;
  let hudContainer = null;
  let drawingLayer = null;
  let mutationObserver = null;
  let lastUrl = window.location.href;

  // --- Utility: URL Normalization ---
  function normalizeUrl(rawUrl) {
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
        path: `${path}${search}`,
        fullNormalized: `${u.origin}${path}${search}`
      };
    } catch (e) {
      return { origin: window.location.origin, path: window.location.pathname, fullNormalized: window.location.href };
    }
  }

  // --- Utility: Resilient Multi-Tier Anchor Extraction ---
  function isDynamicToken(token) {
    if (!token) return true;
    // Filter dynamic hashes from styled-components, css modules, emotion, tailwind arbitrary
    return /^(sc-|css-|style-|_|:r[0-9a-z]+:|\w{5,8}-\d|[0-9a-f]{6,}|tw-)/i.test(token) || token.includes('[');
  }

  function getTestId(el) {
    return el.getAttribute('data-testid') ||
      el.getAttribute('data-cy') ||
      el.getAttribute('data-qa') ||
      el.getAttribute('data-test') ||
      null;
  }

  function getCleanId(el) {
    const id = el.id;
    if (!id || typeof id !== 'string' || isDynamicToken(id)) return null;
    return id;
  }

  function getCleanSelector(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
    const testId = getTestId(el);
    if (testId) return `[data-testid="${testId}"]`;

    const id = getCleanId(el);
    if (id) return `#${CSS.escape(id)}`;

    const parts = [];
    let curr = el;
    let depth = 0;

    while (curr && curr.nodeType === Node.ELEMENT_NODE && depth < 5) {
      if (curr === document.body || curr === document.documentElement) {
        parts.unshift(curr.tagName.toLowerCase());
        break;
      }

      const currTestId = getTestId(curr);
      if (currTestId) {
        parts.unshift(`[data-testid="${currTestId}"]`);
        break;
      }

      const currId = getCleanId(curr);
      if (currId) {
        parts.unshift(`#${CSS.escape(currId)}`);
        break;
      }

      let tag = curr.tagName.toLowerCase();
      const cleanClasses = Array.from(curr.classList || [])
        .filter(c => !isDynamicToken(c))
        .slice(0, 2);

      if (cleanClasses.length > 0) {
        tag += '.' + cleanClasses.map(c => CSS.escape(c)).join('.');
      } else if (curr.parentElement) {
        const siblings = Array.from(curr.parentElement.children).filter(s => s.tagName === curr.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(curr) + 1;
          tag += `:nth-of-type(${index})`;
        }
      }

      parts.unshift(tag);
      curr = curr.parentElement;
      depth++;
    }

    return parts.join(' > ');
  }

  function getXPath(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
    if (el.id && !isDynamicToken(el.id)) return `//*[@id="${el.id}"]`;

    const parts = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = el.previousElementSibling;
      while (sibling) {
        if (sibling.nodeName === el.nodeName) index++;
        sibling = sibling.previousElementSibling;
      }
      const tag = el.nodeName.toLowerCase();
      parts.unshift(`${tag}[${index}]`);
      el = el.parentElement;
    }
    return '/' + parts.join('/');
  }

  function getTextQuote(el) {
    const text = (el.innerText || el.textContent || '').trim();
    if (!text) return { exact: '', prefix: '', suffix: '' };
    return {
      exact: text.substring(0, 100),
      prefix: '',
      suffix: ''
    };
  }

  function getElementAnchor(el, clickX, clickY) {
    const rect = el.getBoundingClientRect();
    const docWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const docHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);

    const computed = window.getComputedStyle(el);

    return {
      tagName: el.tagName.toLowerCase(),
      testId: getTestId(el),
      stableId: getCleanId(el),
      cssSelector: getCleanSelector(el),
      xpath: getXPath(el),
      textQuote: getTextQuote(el),
      geometry: {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
        relativeX: (rect.left + rect.width / 2) / docWidth,
        relativeY: (rect.top + rect.height / 2) / docHeight,
        clickOffset: {
          x: clickX - rect.left,
          y: clickY - rect.top
        }
      },
      computedStyles: {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        display: computed.display
      },
      outerHtml: (el.outerHTML || '').substring(0, 300)
    };
  }

  // --- Fuzzy Re-Hydration / Element Resolution ---
  function resolveElementFromAnchor(anchor) {
    if (!anchor) return null;

    // 1. TestID
    if (anchor.testId) {
      const el = document.querySelector(`[data-testid="${anchor.testId}"], [data-cy="${anchor.testId}"], [data-qa="${anchor.testId}"]`);
      if (el) return el;
    }

    // 2. Stable ID
    if (anchor.stableId) {
      const el = document.getElementById(anchor.stableId);
      if (el) return el;
    }

    // 3. CSS Selector
    if (anchor.cssSelector) {
      try {
        const el = document.querySelector(anchor.cssSelector);
        if (el) return el;
      } catch (e) { }
    }

    // 4. XPath
    if (anchor.xpath) {
      try {
        const result = document.evaluate(anchor.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        if (result.singleNodeValue) return result.singleNodeValue;
      } catch (e) { }
    }

    // 5. Text quote fallback
    if (anchor.textQuote && anchor.textQuote.exact && anchor.tagName) {
      const candidates = document.getElementsByTagName(anchor.tagName);
      for (let i = 0; i < candidates.length; i++) {
        const txt = (candidates[i].innerText || '').trim();
        if (txt && txt.startsWith(anchor.textQuote.exact.substring(0, 40))) {
          return candidates[i];
        }
      }
    }

    return null;
  }

  // --- Shadow DOM & UI Setup ---
  async function initShadowDom() {
    if (hostElement) return;

    hostElement = document.createElement('vcp-feedback-root');
    shadowRoot = hostElement.attachShadow({ mode: 'open' });

    // Inject CSS
    const styleEl = document.createElement('style');
    try {
      const cssUrl = chrome.runtime.getURL('content.css');
      const resp = await fetch(cssUrl);
      styleEl.textContent = await resp.text();
    } catch (err) {
      console.warn('VCP: Could not load external content.css, fallback applied', err);
    }
    shadowRoot.appendChild(styleEl);

    // Initialize V2 Drawing Layer Canvas
    if (window.VcpDrawingLayer) {
      drawingLayer = new window.VcpDrawingLayer(shadowRoot);
    }

    // Layer: Hover Highlight Box
    highlightBox = document.createElement('div');
    highlightBox.className = 'vcp-highlight-box';
    highlightLabel = document.createElement('div');
    highlightLabel.className = 'vcp-highlight-label';
    highlightBox.appendChild(highlightLabel);
    shadowRoot.appendChild(highlightBox);

    // Layer: Pins Container
    pinsContainer = document.createElement('div');
    pinsContainer.className = 'vcp-pins-container';
    shadowRoot.appendChild(pinsContainer);

    // Layer: Floating HUD Bar
    initHud();

    // Mount to document.documentElement (immune to body wipes)
    document.documentElement.appendChild(hostElement);
  }

  function initHud() {
    hudContainer = document.createElement('div');
    hudContainer.className = 'vcp-hud';
    hudContainer.innerHTML = `
      <div class="vcp-hud-brand">
        <div class="vcp-hud-dot"></div>
        <span class="vcp-hud-title">VCP</span>
      </div>
      <button class="vcp-hud-btn vcp-hud-toggle" id="vcp-hud-toggle-btn" title="Toggle Pin Mode (Alt+Shift+V)">
        <span>🎯 Pin Mode: OFF</span>
      </button>
      <span class="vcp-hud-counter" id="vcp-hud-count">0 pins</span>
      <button class="vcp-hud-btn vcp-hud-action" id="vcp-hud-send-btn" title="Open Prompt Review & Antigravity Bridge">
        <span>⚡ Send</span>
      </button>
    `;

    const toggleBtn = hudContainer.querySelector('#vcp-hud-toggle-btn');
    toggleBtn.addEventListener('click', () => {
      setInspectMode(!isInspectMode);
    });

    const sendBtn = hudContainer.querySelector('#vcp-hud-send-btn');
    sendBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'OPEN_POPUP_OR_FOCUS' });
      // Also open local quick brief review if popup cannot be opened programmatically
      openSummaryModal();
    });

    shadowRoot.appendChild(hudContainer);
  }

  function updateHudCounter() {
    if (!hudContainer) return;
    const countEl = hudContainer.querySelector('#vcp-hud-count');
    if (countEl) {
      countEl.textContent = `${pagePins.length} pin${pagePins.length === 1 ? '' : 's'}`;
    }
  }

  function setInspectMode(active) {
    isInspectMode = active;
    if (hudContainer) {
      const toggleBtn = hudContainer.querySelector('#vcp-hud-toggle-btn');
      if (toggleBtn) {
        if (isInspectMode) {
          toggleBtn.classList.add('active');
          toggleBtn.innerHTML = `<span>🎯 Pin Mode: ON</span>`;
        } else {
          toggleBtn.classList.remove('active');
          toggleBtn.innerHTML = `<span>🎯 Pin Mode: OFF</span>`;
        }
      }
    }

    if (!isInspectMode) {
      hideHighlight();
    }
  }

  // --- Hover Highlighting (Capture Phase) ---
  function onPointerMove(e) {
    if (!isInspectMode || activePopover) return;

    // Ignore events generated inside VCP Shadow DOM
    if (e.composedPath().includes(hostElement)) {
      hideHighlight();
      return;
    }

    const target = e.target;
    if (!target || target === document.documentElement || target === document.body) {
      hideHighlight();
      return;
    }

    currentHoverElement = target;
    const rect = target.getBoundingClientRect();

    highlightBox.style.display = 'block';
    highlightBox.style.top = `${rect.top}px`;
    highlightBox.style.left = `${rect.left}px`;
    highlightBox.style.width = `${rect.width}px`;
    highlightBox.style.height = `${rect.height}px`;

    const cleanTag = target.tagName.toLowerCase();
    const cleanClasses = Array.from(target.classList || [])
      .filter(c => !isDynamicToken(c))
      .slice(0, 2)
      .join('.');
    highlightLabel.textContent = `<${cleanTag}${cleanClasses ? '.' + cleanClasses : ''}>`;
  }

  function hideHighlight() {
    if (highlightBox) {
      highlightBox.style.display = 'none';
    }
    currentHoverElement = null;
  }

  // --- Click Capture & Popover Trigger ---
  function onPointerClick(e) {
    if (!isInspectMode) return;

    // Check if clicked inside our own Shadow DOM
    const path = e.composedPath();
    if (path.includes(hostElement)) {
      return; // allow user to interact with popover or HUD
    }

    // Intercept host page clicks completely
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const target = e.target;
    if (!target || target === document.documentElement) return;

    hideHighlight();
    openPopover(target, e.clientX, e.clientY);
  }

  // --- Popover Engine ---
  function closePopover() {
    if (activePopover) {
      activePopover.remove();
      activePopover = null;
    }
  }

  function openPopover(targetEl, clickX, clickY, existingPin = null) {
    closePopover();

    const anchor = existingPin ? existingPin.anchor : getElementAnchor(targetEl, clickX, clickY);
    const pinIndex = existingPin ? existingPin.index : pagePins.length + 1;

    const popover = document.createElement('div');
    popover.className = 'vcp-popover';

    const cleanTag = anchor.tagName;
    const cleanSelector = anchor.cssSelector || anchor.xpath || 'element';
    const textSnippet = anchor.textQuote.exact || '(No text content)';

    popover.innerHTML = `
      <div class="vcp-popover-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="vcp-badge-pill">📌 Pin #${pinIndex}</span>
          <span class="vcp-element-tag" title="${cleanSelector}">&lt;${cleanTag}&gt;</span>
        </div>
        <button class="vcp-close-btn" id="vcp-close-popover" title="Close (Esc)">✕</button>
      </div>
      <div class="vcp-popover-body">
        <div class="vcp-element-preview" title="${textSnippet}">
          ${escapeHtml(textSnippet)}
        </div>
        <textarea class="vcp-textarea" id="vcp-prompt-text" placeholder="What should change here? (e.g. Change font size to 20px, align with left edge, make background navy...)"></textarea>
        <div class="vcp-quick-tags">
          <span class="vcp-tag-chip" data-tag="Style:">Style</span>
          <span class="vcp-tag-chip" data-tag="Copy:">Copy</span>
          <span class="vcp-tag-chip" data-tag="Layout:">Layout</span>
          <span class="vcp-tag-chip" data-tag="Bug:">Bug</span>
          <span class="vcp-tag-chip" data-tag="UX:">UX</span>
        </div>
      </div>
      <div class="vcp-popover-footer">
        <div>
          ${existingPin ? '<button class="vcp-btn vcp-btn-danger" id="vcp-delete-pin">Delete Pin</button>' : ''}
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="vcp-btn vcp-btn-ghost" id="vcp-cancel-popover">Cancel</button>
          <button class="vcp-btn vcp-btn-primary" id="vcp-save-pin">${existingPin ? 'Update' : 'Save Pin'}</button>
        </div>
      </div>
    `;

    // Position Popover safely inside viewport boundaries
    const popoverWidth = 320;
    const popoverHeight = 250;
    const padding = 16;

    let posX = clickX + 12;
    let posY = clickY + 12;

    if (posX + popoverWidth > window.innerWidth - padding) {
      posX = clickX - popoverWidth - 12;
    }
    if (posX < padding) posX = padding;

    if (posY + popoverHeight > window.innerHeight - padding) {
      posY = clickY - popoverHeight - 12;
    }
    if (posY < padding) posY = padding;

    popover.style.left = `${posX}px`;
    popover.style.top = `${posY}px`;

    shadowRoot.appendChild(popover);
    activePopover = popover;

    const textarea = popover.querySelector('#vcp-prompt-text');
    if (existingPin) {
      textarea.value = existingPin.prompt;
    }
    textarea.focus();

    // Event handlers
    popover.querySelector('#vcp-close-popover').addEventListener('click', closePopover);
    popover.querySelector('#vcp-cancel-popover').addEventListener('click', closePopover);

    popover.querySelectorAll('.vcp-tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const tag = chip.getAttribute('data-tag');
        if (!textarea.value.startsWith(tag)) {
          textarea.value = `${tag} ${textarea.value}`;
        }
        textarea.focus();
      });
    });

    const saveBtn = popover.querySelector('#vcp-save-pin');
    saveBtn.addEventListener('click', () => {
      const promptText = textarea.value.trim();
      if (!promptText) {
        textarea.focus();
        return;
      }

      if (existingPin) {
        existingPin.prompt = promptText;
        existingPin.updatedAt = Date.now();
        saveAllPins();
      } else {
        const newPin = {
          id: 'vcp_pin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          index: pinIndex,
          url: window.location.href,
          normalizedPath: normalizeUrl(window.location.href).path,
          anchor: anchor,
          prompt: promptText,
          createdAt: Date.now()
        };
        pagePins.push(newPin);
        saveAllPins();
      }

      closePopover();
      renderPins();
      updateHudCounter();
    });

    if (existingPin) {
      const deleteBtn = popover.querySelector('#vcp-delete-pin');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          pagePins = pagePins.filter(p => p.id !== existingPin.id);
          // Re-index remaining pins
          pagePins.forEach((p, idx) => p.index = idx + 1);
          saveAllPins();
          closePopover();
          renderPins();
          updateHudCounter();
        });
      }
    }
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

  // --- Pin Markers Rendering & Re-Hydration ---
  function renderPins() {
    if (!pinsContainer) return;
    pinsContainer.innerHTML = '';

    pagePins.forEach(pin => {
      const el = resolveElementFromAnchor(pin.anchor);
      let posX = 0;
      let posY = 0;
      let unanchored = false;

      if (el) {
        const rect = el.getBoundingClientRect();
        // Position pin at top-left corner of the element or at the recorded relative click offset
        if (pin.anchor.geometry && pin.anchor.geometry.clickOffset) {
          posX = rect.left + Math.min(rect.width, Math.max(0, pin.anchor.geometry.clickOffset.x));
          posY = rect.top + Math.min(rect.height, Math.max(0, pin.anchor.geometry.clickOffset.y));
        } else {
          posX = rect.left + 12;
          posY = rect.top + 12;
        }
      } else if (pin.anchor.geometry) {
        // Fallback to geometric viewport position
        unanchored = true;
        posX = pin.anchor.geometry.x - window.scrollX;
        posY = pin.anchor.geometry.y - window.scrollY;
      }

      // Hide pin if completely outside current viewport
      if (posX < -50 || posX > window.innerWidth + 50 || posY < -50 || posY > window.innerHeight + 50) {
        return;
      }

      const pinEl = document.createElement('div');
      pinEl.className = `vcp-pin ${unanchored ? 'unanchored' : ''}`;
      pinEl.style.left = `${posX}px`;
      pinEl.style.top = `${posY}px`;
      pinEl.innerHTML = `
        ${pin.index}
        <div class="vcp-pin-tooltip">
          <strong>#${pin.index}:</strong> ${escapeHtml(pin.prompt.substring(0, 60))}${pin.prompt.length > 60 ? '...' : ''}
        </div>
      `;

      pinEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openPopover(el || document.body, posX, posY, pin);
      });

      pinsContainer.appendChild(pinEl);
    });
  }

  // Synchronize pin coordinates during scrolling and window resizing
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        renderPins();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    renderPins();
  }, { passive: true });

  // --- Multi-Page Storage Engine (`chrome.storage.local`) ---
  async function loadPinsForCurrentPage() {
    const norm = normalizeUrl(window.location.href);
    const storageKey = `vcp_pins_${norm.origin}`;

    try {
      const data = await chrome.storage.local.get(storageKey);
      const allPins = data[storageKey] || [];
      // Filter pins belonging to this normalized path
      pagePins = allPins.filter(p => p.normalizedPath === norm.path);
      // Ensure sorted by index
      pagePins.sort((a, b) => a.index - b.index);
      renderPins();
      updateHudCounter();

      // Inform background service worker to update badge
      chrome.runtime.sendMessage({
        action: 'UPDATE_BADGE',
        count: pagePins.length
      });
    } catch (err) {
      console.error('VCP: Failed to load pins from storage', err);
    }
  }

  async function saveAllPins() {
    const norm = normalizeUrl(window.location.href);
    const storageKey = `vcp_pins_${norm.origin}`;

    try {
      const data = await chrome.storage.local.get(storageKey);
      let allPins = data[storageKey] || [];

      // Remove pins for current path and replace with updated pagePins
      allPins = allPins.filter(p => p.normalizedPath !== norm.path);
      allPins = allPins.concat(pagePins);

      await chrome.storage.local.set({ [storageKey]: allPins });

      // Notify background worker
      chrome.runtime.sendMessage({
        action: 'UPDATE_BADGE',
        count: pagePins.length
      });
    } catch (err) {
      console.error('VCP: Failed to save pins to storage', err);
    }
  }

  // --- SPA Navigation & Route Interception ---
  function onRouteChanged(newUrl) {
    if (newUrl === lastUrl) return;
    lastUrl = newUrl;
    closePopover();
    hideHighlight();
    loadPinsForCurrentPage();
  }

  // Monkey patch History API for client-side SPA routing (React, Next.js, Vue)
  const originalPushState = history.pushState;
  history.pushState = function () {
    const result = originalPushState.apply(this, arguments);
    onRouteChanged(window.location.href);
    return result;
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    const result = originalReplaceState.apply(this, arguments);
    onRouteChanged(window.location.href);
    return result;
  };

  window.addEventListener('popstate', () => onRouteChanged(window.location.href));
  window.addEventListener('hashchange', () => onRouteChanged(window.location.href));

  // SPA MutationObserver: re-anchor pins when asynchronous components load
  function setupMutationObserver() {
    if (mutationObserver) mutationObserver.disconnect();

    let mutationDebounce = null;
    mutationObserver = new MutationObserver(() => {
      if (mutationDebounce) clearTimeout(mutationDebounce);
      mutationDebounce = setTimeout(() => {
        renderPins();
      }, 250);
    });

    mutationObserver.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // --- Quick Summary & Send Modal (In-Page Fallback) ---
  function openSummaryModal() {
    closePopover();
    const modal = document.createElement('div');
    modal.className = 'vcp-popover';
    modal.style.width = '360px';
    modal.style.position = 'fixed';
    modal.style.bottom = '70px';
    modal.style.right = '24px';
    modal.style.left = 'auto';
    modal.style.top = 'auto';

    const norm = normalizeUrl(window.location.href);

    modal.innerHTML = `
      <div class="vcp-popover-header">
        <span class="vcp-badge-pill">🚀 Ready to Dispatch</span>
        <button class="vcp-close-btn" id="vcp-close-summary">✕</button>
      </div>
      <div class="vcp-popover-body">
        <div style="font-size: 12px; color: #334155; line-height: 1.4;">
          <strong>${pagePins.length} pin(s)</strong> captured on <code>${norm.path}</code>.
        </div>
        <div style="max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
          ${pagePins.length === 0 ? '<div style="font-size: 11px; color: #94a3b8; font-style: italic;">No pins on this page yet. Click "Pin Mode: ON" and click any element!</div>' : ''}
          ${pagePins.map(p => `
            <div style="font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 8px; border-radius: 6px;">
              <strong>#${p.index} &lt;${p.anchor.tagName}&gt;:</strong> ${escapeHtml(p.prompt)}
            </div>
          `).join('')}
        </div>
        <textarea class="vcp-textarea" id="vcp-macro-prompt" style="height: 60px;" placeholder="Optional overarching prompt for Antigravity..."></textarea>
      </div>
      <div class="vcp-popover-footer">
        <button class="vcp-btn vcp-btn-ghost" id="vcp-close-summary-btn">Close</button>
        <button class="vcp-btn vcp-btn-primary" id="vcp-dispatch-btn">⚡ Send to Antigravity</button>
      </div>
    `;

    shadowRoot.appendChild(modal);
    activePopover = modal;

    modal.querySelector('#vcp-close-summary').addEventListener('click', closePopover);
    modal.querySelector('#vcp-close-summary-btn').addEventListener('click', closePopover);

    modal.querySelector('#vcp-dispatch-btn').addEventListener('click', async () => {
      const macroPrompt = modal.querySelector('#vcp-macro-prompt').value.trim();
      const sendBtn = modal.querySelector('#vcp-dispatch-btn');
      sendBtn.textContent = 'Sending...';
      sendBtn.disabled = true;

      // Get target project from storage
      const storage = await chrome.storage.local.get(['vcp_target_project']);
      const targetProject = storage.vcp_target_project || 'C:\\prj\\vcp';

      chrome.runtime.sendMessage({
        action: 'SEND_FEEDBACK_TO_AGENT',
        payload: {
          projectPath: targetProject,
          url: window.location.href,
          normalizedPath: norm.path,
          macroPrompt: macroPrompt,
          pins: pagePins
        }
      }, (response) => {
        if (response && response.success) {
          sendBtn.textContent = '✓ Sent!';
          sendBtn.style.backgroundColor = '#16a34a';
          setTimeout(() => {
            closePopover();
          }, 1200);
        } else {
          sendBtn.textContent = 'Error (Bridge Down?)';
          sendBtn.style.backgroundColor = '#ef4444';
          sendBtn.disabled = false;
        }
      });
    });
  }

  // --- Keyboard Shortcuts ---
  window.addEventListener('keydown', (e) => {
    // Escape closes popover or turns off inspect mode
    if (e.key === 'Escape') {
      if (activePopover) {
        closePopover();
      } else if (isInspectMode) {
        setInspectMode(false);
      }
    }

    // Alt+Shift+V toggles inspect mode
    if (e.altKey && e.shiftKey && (e.key === 'V' || e.key === 'v')) {
      e.preventDefault();
      setInspectMode(!isInspectMode);
    }
  });

  // --- Message Listener from Background / Popup ---
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'TOGGLE_INSPECT_MODE') {
      setInspectMode(!isInspectMode);
      sendResponse({ isInspectMode });
    } else if (msg.action === 'GET_PAGE_STATUS') {
      sendResponse({
        isInspectMode,
        url: window.location.href,
        pins: pagePins
      });
    } else if (msg.action === 'ROUTE_CHANGED') {
      onRouteChanged(msg.url);
      sendResponse({ success: true });
    } else if (msg.action === 'FOCUS_PIN') {
      const pin = pagePins.find(p => p.id === msg.pinId);
      if (pin) {
        const el = resolveElementFromAnchor(pin.anchor);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        renderPins();
      }
      sendResponse({ success: true });
    }
    return true;
  });

  // --- Initialization ---
  async function init() {
    await initShadowDom();

    // Attach Capture-Phase Event Listeners
    window.addEventListener('pointermove', onPointerMove, { capture: true, passive: true });
    window.addEventListener('click', onPointerClick, { capture: true });

    await loadPinsForCurrentPage();
    setupMutationObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
