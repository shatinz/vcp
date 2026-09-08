# 🛒 Chrome Web Store Listing Package & Publisher Guide

This document contains the exact metadata, copy-pasteable descriptions, permission justifications, and submission walkthrough required to publish **Visual Click Prompt (VCP)** to the **Google Chrome Web Store**.

---

## 📋 Store Listing Metadata

| Field | Content / Value | Character Count |
| :--- | :--- | :--- |
| **Extension Name** | `Visual Click Prompt (VCP) - AI Agent Bridge` | 44 / 45 max |
| **Short Description** | `Point and click on any live website, capture in-context prompts, and dispatch structured task briefs directly to Antigravity AI.` | 124 / 132 max |
| **Category** | `Developer Tools` (Secondary: `Productivity`) | - |
| **Language** | `English` | - |
| **Privacy Policy URL** | `https://github.com/shatinz/vcp/blob/main/PRIVACY.md` | Valid Public HTTPS |
| **Support URL** | `https://github.com/shatinz/vcp/issues` | - |
| **Website URL** | `https://github.com/shatinz/vcp` | - |

---

## 📝 Detailed Description (Copy & Paste into Store Console)

```text
Turn any live website into an interactive prompt canvas for Antigravity AI agents.

Visual Click Prompt (VCP) eliminates the friction of alt-tabbing between your browser and IDE when developing, testing, or auditing web applications. Simply point and click on any button, text, or layout element, write your instruction in a floating card right at your cursor, navigate freely across pages with persistent glowing pins, and dispatch structured task briefs directly into your local Antigravity AI agent.

⚡ KEY HIGHLIGHTS:

1. ZERO HOST CSS CONFLICTS (ISOLATED SHADOW DOM)
Mounts to an isolated Shadow Root with complete CSS resets and inlined styles. Host styles cannot break extension controls, and extension styles never bleed into your website.

2. PRECISION IN-CONTEXT PROMPTING
Click any element to open a sleek popover right at the clicked coordinate with automatic boundary collision detection. Auto-categorize your prompts with one click using quick chips: Style, Copy, Layout, Bug, UX.

3. PERSISTENT GLOWING PINS ACROSS PAGES
Pins leave illuminated, pulsing numbered markers anchored to exact spots. They stay glued to elements during scrolling, persist in local storage per domain and route, and automatically re-anchor when navigating across Single Page Application (SPA) routes.

4. MULTI-TIER RESILIENT ANCHORING
Pins record TestIDs (data-testid, data-cy), framework-cleaned CSS selectors, W3C Text Quotes, structural XPath, and geometric ratios to survive dynamic framework re-renders.

5. SEAMLESS LOCAL ANTIGRAVITY BRIDGE
Dispatch prompt bundles directly to your local project workspace (127.0.0.1:8765). Automatically writes structured Markdown briefs to FEEDBACK_PROMPT.md and .gemini/tasks/ with exact element selectors, outerHTML snippets, and computed CSS.

6. AUTONOMOUS ZERO-CLICK EXECUTION
Enable "Auto-trigger Agent" to automatically spawn the Antigravity CLI (agy) in the background with auto-approved permissions. The agent implements code changes hands-free!

7. FAIL-SAFE CLIPBOARD FALLBACK
If the local bridge daemon is offline, clicking Send automatically copies the complete Markdown task brief to your clipboard so you can paste it directly into Antigravity chat without lost work.

---
HOW TO GET STARTED:
1. Install this extension.
2. Run the lightweight local bridge in your project (start-bridge.bat or node bridge/server.js).
3. Press Alt+Shift+V on any webpage to start pointing and prompting!

Open source under MIT License: https://github.com/shatinz/vcp
```

---

## 🛡️ Single Purpose Statement & Permission Justifications

Google Chrome reviewers require a clear single purpose statement and justifications for each permission requested:

### Single Purpose Statement
> *"To provide web developers and designers with an interactive point-and-click interface to record in-context visual feedback on live websites and dispatch structured task briefs to their local Antigravity AI coding agent."*

### Permission Justifications (For Reviewer Notes)

1. **`storage`**:
   > *"Required to store and persist user-created pin coordinates, prompts, and target project workspace paths locally on the user's device using chrome.storage.local."*

2. **`activeTab`**:
   > *"Required to inspect the DOM element clicked by the user during active Pin Mode in order to generate CSS selectors, text quotes, and bounding box geometry."*

3. **`tabs`**:
   > *"Required to associate pins with the active tab's URL and transmit toggle commands between the extension popup and content script."*

4. **`webNavigation`**:
   > *"Required to listen to Single Page Application (SPA) client-side route changes (history.pushState) so that visual pin markers can be dynamically re-rendered as the user navigates across different pages."*

5. **`host_permissions: <all_urls>`**:
   > *"The extension is a developer tool that allows developers to annotate, inspect, and prompt on any website, staging environment, or local web server (e.g. localhost:3000) they are actively developing."*

6. **`host_permissions: http://127.0.0.1:*/* and http://localhost:*/*`**:
   > *"Required to allow the Background Service Worker to communicate with the local Antigravity bridge daemon running on the user's machine at 127.0.0.1:8765."*

---

## 🚀 Step-by-Step Chrome Web Store Submission Walkthrough

1. **Sign in to Chrome Developer Dashboard:**
   - Go to [https://chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole).
   - Sign in with your Google account (a one-time $5 developer registration fee applies if you haven't published before).

2. **Upload Package:**
   - Click **"New Item"**.
   - Drag and drop `C:\prj\vcp\dist\vcp-chrome-extension.zip` generated by `package-store.bat`.

3. **Fill Store Listing Details:**
   - Paste the **Title**, **Short Description**, and **Detailed Description** from above.
   - Select Category: **Developer Tools**.

4. **Upload Promotional Assets:**
   - **Extension Icon:** Upload `extension/icons/icon128.png`.
   - **Screenshots:** Take 1 or 2 screenshots (1280x800 px) of VCP in action on a website showing the in-context popover and glowing pin dots.

5. **Privacy Tab:**
   - Paste Privacy Policy URL: `https://github.com/shatinz/vcp/blob/main/PRIVACY.md`
   - Paste the Permission Justifications from the section above into the designated text fields.
   - Certify that the extension does not sell user data.

6. **Submit for Review:**
   - Click **"Submit for Review"**. Google typically reviews and approves developer tools within 24–48 hours!
