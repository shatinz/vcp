/**
 * Visual Click Prompt (VCP) - In-Page Content Script
 * 100% CSP-Safe Inlined Styles, Precision Popover at Click Coordinates,
 * Persistent Glowing Numbered Dots at Edited Spots, and Multi-Option Antigravity Dispatch.
 */

(function () {
  if (window.__VCP_INITIALIZED__) return;
  window.__VCP_INITIALIZED__ = true;

  // Embedded CSP-Proof Stylesheet
  const VCP_CSS = `
    :host {
      all: initial !important;
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      pointer-events: none !important;
      z-index: 2147483647 !important;
      display: block !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
      -webkit-font-smoothing: antialiased !important;
    }

    *, *::before, *::after {
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
      font-family: inherit !important;
    }

    /* Hover Highlight Box */
    .vcp-highlight-box {
      position: fixed;
      pointer-events: none;
      border: 2px dashed #6366f1;
      background-color: rgba(99, 102, 241, 0.15);
      border-radius: 4px;
      transition: all 0.05s ease-out;
      z-index: 2147483630;
      display: none;
    }

    .vcp-highlight-label {
      position: absolute;
      top: -26px;
      left: 0;
      background: #4f46e5;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Persistent Glowing Dots / Pins Layer */
    .vcp-pins-container {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483635;
    }

    .vcp-pin-dot {
      position: fixed;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      pointer-events: auto;
      box-shadow: 0 0 0 3px #ffffff, 0 4px 14px rgba(79, 70, 229, 0.7);
      transform: translate(-50%, -50%);
      transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
      user-select: none;
    }

    .vcp-pin-dot:hover {
      transform: translate(-50%, -50%) scale(1.25);
      box-shadow: 0 0 0 4px #ffffff, 0 6px 18px rgba(79, 70, 229, 0.9);
    }

    .vcp-pin-dot::after {
      content: '';
      position: absolute;
      inset: -5px;
      border-radius: 50%;
      border: 2px solid #6366f1;
      opacity: 0.7;
      animation: vcp-pulse 2s infinite ease-out;
      pointer-events: none;
    }

    @keyframes vcp-pulse {
      0% {
        transform: scale(0.85);
        opacity: 0.9;
      }
      70% {
        transform: scale(1.6);
        opacity: 0;
      }
      100% {
        transform: scale(1.6);
        opacity: 0;
      }
    }

    .vcp-pin-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: #0f172a;
      color: #f8fafc;
      font-size: 11px;
      font-weight: 500;
      padding: 6px 10px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, visibility 0.15s ease;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .vcp-pin-dot:hover .vcp-pin-tooltip {
      opacity: 1;
      visibility: visible;
    }

    /* In-Context Popover Floating Window */
    .vcp-popover {
      position: fixed;
      width: 330px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
      pointer-events: auto;
      z-index: 2147483645;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: vcp-pop-in 0.15s ease-out;
    }

    @keyframes vcp-pop-in {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(4px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .vcp-popover-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .vcp-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #e0e7ff;
      color: #4338ca;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 9999px;
    }

    .vcp-element-tag {
      color: #64748b;
      font-size: 11px;
      font-family: ui-monospace, monospace;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .vcp-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      font-size: 16px;
      line-height: 1;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .vcp-close-btn:hover {
      color: #334155;
      background: #e2e8f0;
    }

    .vcp-popover-body {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .vcp-element-preview {
      font-size: 11px;
      color: #475569;
      background: #f1f5f9;
      padding: 6px 10px;
      border-radius: 6px;
      border-left: 3px solid #6366f1;
      max-height: 48px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .vcp-textarea {
      width: 100%;
      height: 90px;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      color: #0f172a;
      line-height: 1.4;
      resize: vertical;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      background: #ffffff;
    }

    .vcp-textarea:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    .vcp-quick-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .vcp-tag-chip {
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      background: #f1f5f9;
      color: #475569;
      cursor: pointer;
      border: 1px solid #e2e8f0;
      user-select: none;
    }

    .vcp-tag-chip:hover {
      background: #e0e7ff;
      color: #4338ca;
      border-color: #c7d2fe;
    }

    .vcp-popover-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .vcp-btn {
      font-size: 12px;
      font-weight: 600;
      padding: 7px 14px;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .vcp-btn-primary {
      background: #4f46e5;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35);
    }

    .vcp-btn-primary:hover {
      background: #4338ca;
    }

    .vcp-btn-ghost {
      background: transparent;
      color: #64748b;
    }

    .vcp-btn-ghost:hover {
      background: #e2e8f0;
      color: #1e293b;
    }

    .vcp-btn-danger {
      background: transparent;
      color: #ef4444;
      font-size: 11px;
      padding: 6px 8px;
    }

    .vcp-btn-danger:hover {
      background: #fee2e2;
    }

    /* Floating Docked HUD */
    .vcp-hud {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 9999px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
      pointer-events: auto;
      z-index: 2147483646;
      user-select: none;
    }

    .vcp-hud-brand {
      display: flex;
      align-items: center;
      gap: 6px;
      padding-right: 4px;
    }

    .vcp-hud-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #6366f1;
      box-shadow: 0 0 10px #6366f1;
    }

    .vcp-hud-title {
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .vcp-hud-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 9999px;
      border: 1px solid transparent;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .vcp-hud-toggle {
      background: rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
    }

    .vcp-hud-toggle:hover {
      background: rgba(255, 255, 255, 0.22);
      color: #ffffff;
    }

    .vcp-hud-toggle.active {
      background: #4f46e5;
      color: #ffffff;
      box-shadow: 0 0 14px rgba(99, 102, 241, 0.7);
    }

    .vcp-hud-counter {
      background: rgba(99, 102, 241, 0.35);
      color: #a5b4fc;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 9999px;
    }

    .vcp-hud-action {
      background: #22c55e;
      color: #ffffff;
    }

    .vcp-hud-action:hover {
      background: #16a34a;
    }

    /* In-Page Dispatch Modal */
    .vcp-dispatch-modal {
      position: fixed;
      bottom: 75px;
      right: 24px;
      width: 360px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      pointer-events: auto;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: vcp-pop-in 0.15s ease-out;
    }

    .vcp-modal-pins-list {
      max-height: 160px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 2px;
    }

    .vcp-modal-pin-row {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 11px;
      color: #1e293b;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
  `;

  // State
  let isInspectMode = true; // Pin Mode is active by default for fast interaction
  let currentHoverElement = null;
  let activePopover = null;
  let activeModal = null;
  let pagePins = [];
  let hostElement = null;
  let shadowRoot = null;
  let highlightBox = null;
  let highlightLabel = null;
  let pinsContainer = null;
  let hudContainer = null;
  let lastUrl = window.location.href;

  // --- Normalization ---
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
        path: `${path}${search}`
      };
    } catch (e) {
      return { origin: 'local', path: window.location.pathname };
    }
  }

  // --- Element Anchor Extraction ---
  function isDynamicToken(token) {
    if (!token) return true;
    return /^(sc-|css-|style-|_|:r[0-9a-z]+:|\w{5,8}-\d|[0-9a-f]{6,}|tw-)/i.test(token) || token.includes('[');
  }

  function getCleanSelector(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
    const testId = el.getAttribute('data-testid') || el.getAttribute('data-cy') || el.getAttribute('data-qa');
    if (testId) return `[data-testid="${testId}"]`;

    if (el.id && !isDynamicToken(el.id)) return `#${CSS.escape(el.id)}`;

    const parts = [];
    let curr = el;
    let depth = 0;

    while (curr && curr.nodeType === Node.ELEMENT_NODE && depth < 4) {
      if (curr === document.body || curr === document.documentElement) {
        parts.unshift(curr.tagName.toLowerCase());
        break;
      }
      let tag = curr.tagName.toLowerCase();
      const cleanClasses = Array.from(curr.classList || []).filter(c => !isDynamicToken(c)).slice(0, 2);
      if (cleanClasses.length > 0) {
        tag += '.' + cleanClasses.map(c => CSS.escape(c)).join('.');
      } else if (curr.parentElement) {
        const siblings = Array.from(curr.parentElement.children).filter(s => s.tagName === curr.tagName);
        if (siblings.length > 1) {
          tag += `:nth-of-type(${siblings.indexOf(curr) + 1})`;
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
    const parts = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = el.previousElementSibling;
      while (sibling) {
        if (sibling.nodeName === el.nodeName) index++;
        sibling = sibling.previousElementSibling;
      }
      parts.unshift(`${el.nodeName.toLowerCase()}[${index}]`);
      el = el.parentElement;
    }
    return '/' + parts.join('/');
  }

  function getAnchor(el, clickX, clickY) {
    const rect = el.getBoundingClientRect();
    const computed = window.getComputedStyle(el);
    const text = (el.innerText || el.textContent || '').trim().substring(0, 100);

    return {
      tagName: el.tagName.toLowerCase(),
      testId: el.getAttribute('data-testid') || el.getAttribute('data-cy') || null,
      stableId: el.id && !isDynamicToken(el.id) ? el.id : null,
      cssSelector: getCleanSelector(el),
      xpath: getXPath(el),
      textQuote: { exact: text },
      geometry: {
        // Document coordinates
        docX: clickX + window.scrollX,
        docY: clickY + window.scrollY,
        // Element relative offset
        offsetFromElementLeft: clickX - rect.left,
        offsetFromElementTop: clickY - rect.top,
        rect: {
          width: rect.width,
          height: rect.height
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

  // --- Element Resolution ---
  function resolveElement(anchor) {
    if (!anchor) return null;
    if (anchor.testId) {
      const el = document.querySelector(`[data-testid="${anchor.testId}"], [data-cy="${anchor.testId}"]`);
      if (el) return el;
    }
    if (anchor.stableId) {
      const el = document.getElementById(anchor.stableId);
      if (el) return el;
    }
    if (anchor.cssSelector) {
      try {
        const el = document.querySelector(anchor.cssSelector);
        if (el) return el;
      } catch (e) { }
    }
    if (anchor.xpath) {
      try {
        const res = document.evaluate(anchor.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        if (res.singleNodeValue) return res.singleNodeValue;
      } catch (e) { }
    }
    return null;
  }

  // --- Setup Isolated Shadow DOM ---
  function initHost() {
    if (hostElement) return;

    hostElement = document.createElement('vcp-feedback-root');
    hostElement.style.cssText = `
      all: initial !important;
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      pointer-events: none !important;
      z-index: 2147483647 !important;
      display: block !important;
      overflow: visible !important;
    `;

    shadowRoot = hostElement.attachShadow({ mode: 'open' });

    // Inject inlined CSS (CSP-Proof)
    const styleEl = document.createElement('style');
    styleEl.textContent = VCP_CSS;
    shadowRoot.appendChild(styleEl);

    // Hover Highlight Box
    highlightBox = document.createElement('div');
    highlightBox.className = 'vcp-highlight-box';
    highlightLabel = document.createElement('div');
    highlightLabel.className = 'vcp-highlight-label';
    highlightBox.appendChild(highlightLabel);
    shadowRoot.appendChild(highlightBox);

    // Persistent Pin Dots Container
    pinsContainer = document.createElement('div');
    pinsContainer.className = 'vcp-pins-container';
    shadowRoot.appendChild(pinsContainer);

    // Floating HUD Dock
    initHud();

    // Mount to document.documentElement
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
      <button class="vcp-hud-btn vcp-hud-toggle active" id="vcp-toggle-inspect">
        <span>🎯 Pin Mode: ON</span>
      </button>
      <span class="vcp-hud-counter" id="vcp-pin-counter">0 pins</span>
      <button class="vcp-hud-btn vcp-hud-action" id="vcp-send-btn">
        <span>⚡ Send</span>
      </button>
    `;

    const toggleBtn = hudContainer.querySelector('#vcp-toggle-inspect');
    toggleBtn.addEventListener('click', () => {
      setInspectMode(!isInspectMode);
    });

    const sendBtn = hudContainer.querySelector('#vcp-send-btn');
    sendBtn.addEventListener('click', () => {
      openDispatchModal();
    });

    shadowRoot.appendChild(hudContainer);
  }

  function setInspectMode(active) {
    isInspectMode = active;
    const toggleBtn = hudContainer?.querySelector('#vcp-toggle-inspect');
    if (toggleBtn) {
      if (isInspectMode) {
        toggleBtn.classList.add('active');
        toggleBtn.innerHTML = `<span>🎯 Pin Mode: ON</span>`;
      } else {
        toggleBtn.classList.remove('active');
        toggleBtn.innerHTML = `<span>🎯 Pin Mode: OFF</span>`;
      }
    }
    if (!isInspectMode && highlightBox) {
      highlightBox.style.display = 'none';
    }
  }

  function updateHudCounter() {
    const counter = hudContainer?.querySelector('#vcp-pin-counter');
    if (counter) {
      counter.textContent = `${pagePins.length} pin${pagePins.length === 1 ? '' : 's'}`;
    }
  }

  // --- Hover Inspector ---
  function onPointerMove(e) {
    if (!isInspectMode || activePopover || activeModal) return;

    if (e.composedPath().includes(hostElement)) {
      if (highlightBox) highlightBox.style.display = 'none';
      return;
    }

    const target = e.target;
    if (!target || target === document.documentElement || target === document.body) {
      if (highlightBox) highlightBox.style.display = 'none';
      return;
    }

    currentHoverElement = target;
    const rect = target.getBoundingClientRect();

    highlightBox.style.display = 'block';
    highlightBox.style.top = `${rect.top}px`;
    highlightBox.style.left = `${rect.left}px`;
    highlightBox.style.width = `${rect.width}px`;
    highlightBox.style.height = `${rect.height}px`;

    const tag = target.tagName.toLowerCase();
    const cleanClasses = Array.from(target.classList || []).filter(c => !isDynamicToken(c)).slice(0, 2).join('.');
    highlightLabel.textContent = `<${tag}${cleanClasses ? '.' + cleanClasses : ''}>`;
  }

  // --- Click Capture & Popover Trigger ---
  function onPointerClick(e) {
    if (!isInspectMode) return;

    // If clicked inside VCP Shadow DOM, allow normal interaction
    if (e.composedPath().includes(hostElement)) {
      return;
    }

    // Intercept host page clicks
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const target = e.target;
    if (!target || target === document.documentElement) return;

    if (highlightBox) highlightBox.style.display = 'none';

    // Open popover directly at clicked coordinates
    openPopover(target, e.clientX, e.clientY);
  }

  // --- Popover at Exact Click Spot ---
  function closePopover() {
    if (activePopover) {
      activePopover.remove();
      activePopover = null;
    }
  }

  function openPopover(targetEl, clickX, clickY, existingPin = null) {
    closePopover();
    if (activeModal) closeModal();

    const anchor = existingPin ? existingPin.anchor : getAnchor(targetEl, clickX, clickY);
    const pinIndex = existingPin ? existingPin.index : pagePins.length + 1;

    const popover = document.createElement('div');
    popover.className = 'vcp-popover';

    const cleanTag = anchor.tagName;
    const selector = anchor.cssSelector || anchor.xpath || 'element';
    const previewText = anchor.textQuote?.exact || '(No text content)';

    popover.innerHTML = `
      <div class="vcp-popover-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="vcp-badge-pill">📌 Pin #${pinIndex}</span>
          <span class="vcp-element-tag" title="${selector}">&lt;${cleanTag}&gt;</span>
        </div>
        <button class="vcp-close-btn" id="vcp-pop-close">✕</button>
      </div>
      <div class="vcp-popover-body">
        <div class="vcp-element-preview" title="${previewText}">
          ${escapeHtml(previewText)}
        </div>
        <textarea class="vcp-textarea" id="vcp-pop-textarea" placeholder="Type what to change here (e.g. Change color to navy, make bolder, fix alignment)..."></textarea>
        <div class="vcp-quick-tags">
          <span class="vcp-tag-chip" data-prefix="Style: ">Style</span>
          <span class="vcp-tag-chip" data-prefix="Copy: ">Copy</span>
          <span class="vcp-tag-chip" data-prefix="Layout: ">Layout</span>
          <span class="vcp-tag-chip" data-prefix="Bug: ">Bug</span>
          <span class="vcp-tag-chip" data-prefix="UX: ">UX</span>
        </div>
      </div>
      <div class="vcp-popover-footer">
        <div>
          ${existingPin ? '<button class="vcp-btn vcp-btn-danger" id="vcp-pop-delete">Delete</button>' : ''}
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="vcp-btn vcp-btn-ghost" id="vcp-pop-cancel">Cancel</button>
          <button class="vcp-btn vcp-btn-primary" id="vcp-pop-save">${existingPin ? 'Update' : 'Save Pin'}</button>
        </div>
      </div>
    `;

    // Position popover right at clicked coordinates with boundary flipping
    const popWidth = 330;
    const popHeight = 260;
    const pad = 16;

    let posX = clickX + 12;
    let posY = clickY + 12;

    if (posX + popWidth > window.innerWidth - pad) {
      posX = clickX - popWidth - 12;
    }
    if (posX < pad) posX = pad;

    if (posY + popHeight > window.innerHeight - pad) {
      posY = clickY - popHeight - 12;
    }
    if (posY < pad) posY = pad;

    popover.style.left = `${posX}px`;
    popover.style.top = `${posY}px`;

    shadowRoot.appendChild(popover);
    activePopover = popover;

    const textarea = popover.querySelector('#vcp-pop-textarea');
    if (existingPin) {
      textarea.value = existingPin.prompt;
    }
    textarea.focus();

    // Quick tag chips
    popover.querySelectorAll('.vcp-tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const prefix = chip.getAttribute('data-prefix');
        if (!textarea.value.startsWith(prefix)) {
          textarea.value = prefix + textarea.value;
        }
        textarea.focus();
      });
    });

    // Close / Cancel
    popover.querySelector('#vcp-pop-close').addEventListener('click', closePopover);
    popover.querySelector('#vcp-pop-cancel').addEventListener('click', closePopover);

    // Enter / Ctrl+Enter saves
    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        saveBtn.click();
      }
    });

    // Save
    const saveBtn = popover.querySelector('#vcp-pop-save');
    saveBtn.addEventListener('click', () => {
      const promptText = textarea.value.trim();
      if (!promptText) {
        textarea.focus();
        return;
      }

      if (existingPin) {
        existingPin.prompt = promptText;
        existingPin.updatedAt = Date.now();
      } else {
        const norm = normalizeUrl(window.location.href);
        const newPin = {
          id: 'pin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          index: pinIndex,
          url: window.location.href,
          normalizedPath: norm.path,
          prompt: promptText,
          anchor: anchor,
          createdAt: Date.now()
        };
        pagePins.push(newPin);
      }

      savePinsToStorage();
      closePopover();
      renderPinDots();
      updateHudCounter();
    });

    // Delete
    if (existingPin) {
      const deleteBtn = popover.querySelector('#vcp-pop-delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          pagePins = pagePins.filter(p => p.id !== existingPin.id);
          pagePins.forEach((p, idx) => p.index = idx + 1);
          savePinsToStorage();
          closePopover();
          renderPinDots();
          updateHudCounter();
        });
      }
    }
  }

  // --- Render Glowing Numbered Dots at Edited Spots ---
  function renderPinDots() {
    if (!pinsContainer) return;
    pinsContainer.innerHTML = '';

    pagePins.forEach(pin => {
      let dotX = 0;
      let dotY = 0;
      const el = resolveElement(pin.anchor);

      if (el) {
        const rect = el.getBoundingClientRect();
        const offsetLeft = pin.anchor.geometry?.offsetFromElementLeft ?? 12;
        const offsetTop = pin.anchor.geometry?.offsetFromElementTop ?? 12;
        dotX = rect.left + Math.min(rect.width, Math.max(0, offsetLeft));
        dotY = rect.top + Math.min(rect.height, Math.max(0, offsetTop));
      } else if (pin.anchor.geometry?.docX) {
        dotX = pin.anchor.geometry.docX - window.scrollX;
        dotY = pin.anchor.geometry.docY - window.scrollY;
      }

      // Hide if offscreen
      if (dotX < -50 || dotX > window.innerWidth + 50 || dotY < -50 || dotY > window.innerHeight + 50) {
        return;
      }

      const dotEl = document.createElement('div');
      dotEl.className = 'vcp-pin-dot';
      dotEl.style.left = `${dotX}px`;
      dotEl.style.top = `${dotY}px`;
      dotEl.innerHTML = `
        ${pin.index}
        <div class="vcp-pin-tooltip">
          <strong>#${pin.index}:</strong> ${escapeHtml(pin.prompt.substring(0, 60))}${pin.prompt.length > 60 ? '...' : ''}
        </div>
      `;

      dotEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openPopover(el || document.body, dotX, dotY, pin);
      });

      pinsContainer.appendChild(dotEl);
    });
  }

  // Reposition dots on scroll and resize
  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(renderPinDots);
  }, { passive: true });

  window.addEventListener('resize', () => {
    renderPinDots();
  }, { passive: true });

  // --- In-Page Dispatch Modal (Send to Antigravity) ---
  function closeModal() {
    if (activeModal) {
      activeModal.remove();
      activeModal = null;
    }
  }

  async function openDispatchModal() {
    closePopover();
    closeModal();

    const modal = document.createElement('div');
    modal.className = 'vcp-dispatch-modal';

    const norm = normalizeUrl(window.location.href);
    const storage = await chrome.storage.local.get(['vcp_target_project', 'vcp_auto_trigger']);
    const targetProject = storage.vcp_target_project || 'C:\\prj\\vcp';
    const autoTrigger = storage.vcp_auto_trigger !== false;

    modal.innerHTML = `
      <div class="vcp-popover-header">
        <span class="vcp-badge-pill">⚡ Dispatch to Antigravity</span>
        <button class="vcp-close-btn" id="vcp-modal-close">✕</button>
      </div>
      <div class="vcp-popover-body">
        <div style="font-size: 12px; color: #334155;">
          <strong>${pagePins.length} pin(s)</strong> captured on <code>${norm.path}</code>
        </div>

        <div class="vcp-modal-pins-list">
          ${pagePins.length === 0 ? '<div style="font-size: 11px; color: #94a3b8; font-style: italic; padding: 10px; text-align: center;">No pins yet. Click anywhere on the page to leave pins!</div>' : ''}
          ${pagePins.map(p => `
            <div class="vcp-modal-pin-row">
              <div><strong>#${p.index} &lt;${p.anchor.tagName}&gt;:</strong> ${escapeHtml(p.prompt)}</div>
            </div>
          `).join('')}
        </div>

        <div>
          <label style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Target Workspace</label>
          <input type="text" id="vcp-modal-project" class="vcp-textarea" style="height: 32px; padding: 4px 8px; font-size: 12px;" value="${targetProject}">
        </div>

        <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #334155;">
          <input type="checkbox" id="vcp-modal-autotrigger" ${autoTrigger ? 'checked' : ''}>
          <label for="vcp-modal-autotrigger">🤖 <strong>Auto-trigger Agent</strong> (Autonomous run via agy)</label>
        </div>

        <textarea class="vcp-textarea" id="vcp-modal-macro" style="height: 50px;" placeholder="Optional overarching instructions for Antigravity..."></textarea>
      </div>
      <div class="vcp-popover-footer">
        <button class="vcp-btn vcp-btn-ghost" id="vcp-modal-cancel">Close</button>
        <button class="vcp-btn vcp-btn-primary" id="vcp-modal-send" ${pagePins.length === 0 ? 'disabled' : ''}>
          <span>⚡ Send to Agent</span>
        </button>
      </div>
      <div id="vcp-modal-result" style="display: none; padding: 8px 12px; font-size: 11px; text-align: center;"></div>
    `;

    shadowRoot.appendChild(modal);
    activeModal = modal;

    modal.querySelector('#vcp-modal-close').addEventListener('click', closeModal);
    modal.querySelector('#vcp-modal-cancel').addEventListener('click', closeModal);

    const projectInput = modal.querySelector('#vcp-modal-project');
    const autoTriggerCheck = modal.querySelector('#vcp-modal-autotrigger');
    const macroInput = modal.querySelector('#vcp-modal-macro');
    const sendBtn = modal.querySelector('#vcp-modal-send');
    const resultBanner = modal.querySelector('#vcp-modal-result');

    sendBtn.addEventListener('click', async () => {
      const proj = projectInput.value.trim() || 'C:\\prj\\vcp';
      const auto = autoTriggerCheck.checked;
      const macro = macroInput.value.trim();

      await chrome.storage.local.set({
        vcp_target_project: proj,
        vcp_auto_trigger: auto
      });

      sendBtn.disabled = true;
      sendBtn.innerHTML = `<span>⏳ Sending...</span>`;

      const payload = {
        projectPath: proj,
        url: window.location.href,
        normalizedPath: norm.path,
        macroPrompt: macro,
        autoTrigger: auto,
        pins: pagePins,
        timestamp: Date.now()
      };

      chrome.runtime.sendMessage({
        action: 'SEND_FEEDBACK_TO_AGENT',
        payload: payload
      }, (response) => {
        sendBtn.disabled = false;
        sendBtn.innerHTML = `<span>⚡ Send to Agent</span>`;

        if (response && response.success) {
          resultBanner.style.display = 'block';
          resultBanner.style.background = '#dcfce7';
          resultBanner.style.color = '#166534';
          resultBanner.innerHTML = `
            <div><strong>✓ Successfully Dispatched!</strong></div>
            <div style="font-size: 10px; margin-top: 2px;">${response.data?.agentTriggered ? '🤖 Antigravity Agent auto-triggered via agy!' : 'Written to: ' + (response.data?.savedFile || 'FEEDBACK_PROMPT.md')}</div>
          `;
          setTimeout(() => {
            closeModal();
          }, 2500);
        } else {
          // Fallback: Copy to clipboard so user is NEVER blocked
          const markdownSummary = generateMarkdownSummary(payload);
          navigator.clipboard.writeText(markdownSummary).then(() => {
            resultBanner.style.display = 'block';
            resultBanner.style.background = '#fef3c7';
            resultBanner.style.color = '#92400e';
            resultBanner.innerHTML = `
              <div><strong>⚠️ Bridge offline, but task brief copied to clipboard!</strong></div>
              <div style="font-size: 10px; margin-top: 2px;">Paste directly into Antigravity chat to execute.</div>
            `;
          }).catch(() => {
            resultBanner.style.display = 'block';
            resultBanner.style.background = '#fee2e2';
            resultBanner.style.color = '#991b1b';
            resultBanner.innerHTML = `<div>Bridge offline. Run <code>start-bridge.bat</code> in C:\\prj\\vcp</div>`;
          });
        }
      });
    });
  }

  function generateMarkdownSummary(payload) {
    let md = `# 🎯 Visual Feedback for ${payload.url}\n\n`;
    if (payload.macroPrompt) md += `**Directive:** ${payload.macroPrompt}\n\n`;
    payload.pins.forEach(p => {
      md += `### Pin #${p.index} <${p.anchor.tagName}>\n`;
      md += `- **Prompt:** ${p.prompt}\n`;
      md += `- **Selector:** \`${p.anchor.cssSelector || p.anchor.xpath}\`\n`;
      if (p.anchor.textQuote?.exact) md += `- **Text:** "${p.anchor.textQuote.exact}"\n`;
      md += `\n`;
    });
    return md;
  }

  // --- Storage Engine ---
  async function loadPinsFromStorage() {
    const norm = normalizeUrl(window.location.href);
    const storageKey = `vcp_pins_${norm.origin}`;

    try {
      const data = await chrome.storage.local.get([storageKey]);
      const allPins = data[storageKey] || [];
      pagePins = allPins.filter(p => p.normalizedPath === norm.path);
      pagePins.sort((a, b) => a.index - b.index);
      renderPinDots();
      updateHudCounter();

      chrome.runtime.sendMessage({
        action: 'UPDATE_BADGE',
        count: pagePins.length
      });
    } catch (e) {
      console.warn('VCP: Could not load pins', e);
    }
  }

  async function savePinsToStorage() {
    const norm = normalizeUrl(window.location.href);
    const storageKey = `vcp_pins_${norm.origin}`;

    try {
      const data = await chrome.storage.local.get([storageKey]);
      let allPins = data[storageKey] || [];
      allPins = allPins.filter(p => p.normalizedPath !== norm.path);
      allPins = allPins.concat(pagePins);
      await chrome.storage.local.set({ [storageKey]: allPins });

      chrome.runtime.sendMessage({
        action: 'UPDATE_BADGE',
        count: pagePins.length
      });
    } catch (e) {
      console.warn('VCP: Could not save pins', e);
    }
  }

  // --- SPA Routing ---
  function onRouteChanged(newUrl) {
    if (newUrl === lastUrl) return;
    lastUrl = newUrl;
    closePopover();
    closeModal();
    loadPinsFromStorage();
  }

  const origPushState = history.pushState;
  history.pushState = function () {
    const res = origPushState.apply(this, arguments);
    onRouteChanged(window.location.href);
    return res;
  };

  const origReplaceState = history.replaceState;
  history.replaceState = function () {
    const res = origReplaceState.apply(this, arguments);
    onRouteChanged(window.location.href);
    return res;
  };

  window.addEventListener('popstate', () => onRouteChanged(window.location.href));
  window.addEventListener('hashchange', () => onRouteChanged(window.location.href));

  // --- Keyboard Shortcuts ---
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (activePopover) closePopover();
      else if (activeModal) closeModal();
      else if (isInspectMode) setInspectMode(false);
    }

    if (e.altKey && e.shiftKey && (e.key === 'V' || e.key === 'v')) {
      e.preventDefault();
      setInspectMode(!isInspectMode);
    }
  });

  // --- Inter-Process Communication ---
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'TOGGLE_INSPECT_MODE') {
      setInspectMode(!isInspectMode);
      sendResponse({ isInspectMode });
    } else if (msg.action === 'GET_PAGE_STATUS' || msg.action === 'GET_ALL_PINS') {
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
        const el = resolveElement(pin.anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        renderPinDots();
      }
      sendResponse({ success: true });
    }
    return true;
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // --- Initialize ---
  function init() {
    initHost();
    window.addEventListener('pointermove', onPointerMove, { capture: true, passive: true });
    window.addEventListener('click', onPointerClick, { capture: true });
    loadPinsFromStorage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
