# 🌐 Free Browser Stores Publishing Guide for VCP

Publish **Visual Click Prompt (VCP)** to global browser stores with **zero registration fees ($0.00)**.

Unlike the Google Chrome Web Store (which requires a mandatory $5.00 developer fee), the following major official stores are **100% free** to register, publish, and update:

| Store | Developer Fee | Engine | User Base | Ready Package | Direct Submission Portal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Microsoft Edge Add-ons** | **$0.00 (FREE)** | Chromium (Identical to Chrome) | 300M+ (Edge + Chrome users) | `dist/vcp-edge-extension.zip` | [partner.microsoft.com](https://partner.microsoft.com/dashboard/microsoftedge) |
| **Mozilla Firefox (AMO)** | **$0.00 (FREE)** | Gecko / WebExtensions | 180M+ (Firefox, Zen, LibreWolf) | `dist/vcp-firefox-extension.zip` | [addons.mozilla.org](https://addons.mozilla.org/developers/) |
| **Opera Add-ons** | **$0.00 (FREE)** | Chromium | 100M+ (Opera, Opera GX) | `dist/vcp-opera-extension.zip` | [addons.opera.com](https://addons.opera.com/developer/) |
| **GitHub Releases / Direct** | **$0.00 (FREE)** | All Browsers | Unlimited Global Access | `dist/vcp-chrome-extension.zip` | [github.com/shatinz/vcp/releases](https://github.com/shatinz/vcp/releases) |

---

## 📦 How to Build Store Packages

Run the 1-click batch script from project root:
```bash
.\package-stores.bat
```
*(Or run `node package-all-stores.js`)*. All clean packages will be generated inside `C:\prj\vcp\dist\`.

---

## 📝 Copy-Paste Store Listing Metadata (Used Across All Stores)

### 🏷️ Basic Information
- **Name:** `Visual Click Prompt (VCP) - AI Agent Bridge`
- **Short Description (Max 132 chars):**
  `Point and click on any live website, capture in-context prompts, and dispatch structured task briefs directly to Antigravity AI.`
- **Primary Category:** `Developer Tools`
- **Secondary Category:** `Productivity`
- **Language:** `English`
- **Website URL:** `https://github.com/shatinz/vcp`
- **Support / Issues URL:** `https://github.com/shatinz/vcp/issues`
- **Privacy Policy URL:** `https://github.com/shatinz/vcp/blob/main/PRIVACY.md`

### 📄 Detailed Description (Copy & Paste directly into store description fields)

```text
Turn any live website into an interactive prompt canvas for Antigravity AI coding agents.

Visual Click Prompt (VCP) eliminates the friction of switching back and forth between your browser and IDE when developing, testing, or auditing web applications. Simply point and click on any button, card, text, or layout element, enter in-context instructions via a sleek popover at your cursor, navigate freely across pages with persistent glowing pin markers, and dispatch structured task briefs straight into your local Antigravity AI agent.

⚡ KEY FEATURES:

1. MASTER ON / OFF POWER SWITCH
A prominent master power switch in the popup and floating HUD lets you turn VCP dormant with 1 click. When turned OFF, VCP exerts zero DOM modifications and zero performance overhead on websites.

2. PRECISION IN-CONTEXT PROMPTING
Click any element to open a sleek popover positioned right at the clicked coordinate with automatic boundary collision detection. Auto-categorize your feedback with quick tags: Style, Copy, Layout, Bug, UX.

3. PERSISTENT GLOWING PINS ACROSS PAGES
Pins leave illuminated, numbered markers anchored to exact spots. They stay glued to elements during scrolling, persist in local storage per domain and route, and automatically re-anchor when navigating across Single Page Application (SPA) routes.

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
2. Run the local bridge in your project (start-bridge.bat or node bridge/server.js).
3. Press Alt+Shift+V on any webpage to start pointing and prompting!

Open source under MIT License: https://github.com/shatinz/vcp
```

### 🛡️ Reviewer Notes & Single Purpose Statement (For Store Certification Teams)

> **Single Purpose Statement:**
> "To provide web developers and designers with an interactive point-and-click interface to record in-context visual feedback on live websites and dispatch structured task briefs to their local Antigravity AI coding agent."

> **Permission Justifications:**
> - `storage`: Required to store and persist user-created pin coordinates, prompts, target project workspace paths, and power switch state locally on the user's device using chrome.storage.local.
> - `activeTab`: Required to inspect the DOM element clicked by the user during active Pin Mode in order to generate CSS selectors, text quotes, and bounding box geometry.
> - `tabs`: Required to associate pins with the active tab's URL and transmit toggle commands between the extension popup and content script.
> - `webNavigation`: Required to listen to Single Page Application (SPA) client-side route changes (history.pushState) so that visual pin markers can be dynamically re-rendered as the user navigates across different pages.
> - `host_permissions: <all_urls>`: The extension is a developer tool allowing developers to annotate, inspect, and prompt on any website, staging environment, or local web server (e.g. localhost:3000) they are actively developing.
> - `host_permissions: http://127.0.0.1:*/* and http://localhost:*/*`: Required to allow the Background Service Worker to communicate with the local Antigravity bridge daemon running on the user's machine at 127.0.0.1:8765.

---

## 1️⃣ Store #1: Microsoft Edge Add-ons (100% FREE)

Microsoft Edge is Chromium-based. **Google Chrome users can also install extensions directly from Microsoft Edge Add-ons** by clicking *"Allow extensions from other stores"*.

### Step-by-Step Submission:
1. **Log in to Partner Center:**
   - Go to [https://partner.microsoft.com/dashboard/microsoftedge](https://partner.microsoft.com/dashboard/microsoftedge).
   - Sign in with any free Microsoft account (Outlook / Hotmail / GitHub).
   - Complete your free developer registration (zero developer fee, $0).
2. **Create New Extension:**
   - Click **"Create new extension"**.
   - Drag & drop **`C:\prj\vcp\dist\vcp-edge-extension.zip`**.
3. **Fill Store Listing:**
   - Paste the **Title**, **Short Description**, and **Detailed Description** from above.
   - Category: `Developer tools`.
   - Upload Logo: `extension/icons/icon128.png`.
   - Upload 1 or 2 screenshots (1280x800 px) showing VCP pin mode on a website.
4. **Fill Privacy & Certification Details:**
   - Paste Privacy Policy URL: `https://github.com/shatinz/vcp/blob/main/PRIVACY.md`.
   - In **Notes for Certification**, paste the *Reviewer Notes & Single Purpose Statement* above.
5. **Publish:**
   - Click **"Publish"**. Microsoft reviews and approves within 24–48 hours.

---

## 2️⃣ Store #2: Mozilla Firefox Add-ons / AMO (100% FREE)

Mozilla AMO supports developers worldwide with zero registration fees.

### Step-by-Step Submission:
1. **Log in to AMO Developer Hub:**
   - Go to [https://addons.mozilla.org/developers/](https://addons.mozilla.org/developers/).
   - Sign in with your free Firefox account.
2. **Submit a New Add-on:**
   - Click **"Submit a New Add-on"**.
   - Select distribution channel: **"On this site"** (listed on addons.mozilla.org).
   - Upload **`C:\prj\vcp\dist\vcp-firefox-extension.zip`**.
   - Automatic validation will verify the manifest (which includes `browser_specific_settings.gecko.id: "vcp-bridge@shatinz.github.io"`).
3. **Fill Listing Information:**
   - Add summary, description, and categories (`Developer Tools`).
   - Add screenshots and icon (`extension/icons/icon128.png`).
4. **Submit for Review:**
   - In notes for reviewers, paste the *Reviewer Notes* above.
   - Click **"Submit Version"**.

---

## 3️⃣ Store #3: Opera Add-ons (100% FREE)

Opera and Opera GX have over 100 million active users.

### Step-by-Step Submission:
1. **Log in to Opera Developer Portal:**
   - Go to [https://addons.opera.com/developer/](https://addons.opera.com/developer/).
   - Sign in with your free Opera account.
2. **Create New Package:**
   - Click **"Submit an addon"**.
   - Upload **`C:\prj\vcp\dist\vcp-opera-extension.zip`**.
3. **Fill Details:**
   - Category: `Developer`.
   - Paste the descriptions and metadata.
   - Submit for moderation.

---

## 4️⃣ Free Direct Distribution via GitHub Releases

You can also distribute VCP directly to developers with zero intermediaries:

1. Create a new Release on GitHub: `https://github.com/shatinz/vcp/releases/new`.
2. Tag: `v1.0.0`.
3. Title: `Visual Click Prompt (VCP) v1.0.0 - Official Release`.
4. Attach `dist/vcp-chrome-extension.zip`, `dist/vcp-edge-extension.zip`, and `dist/vcp-firefox-extension.zip`.
5. Users can download, unzip, and run `add-to-chrome.bat` for instant 5-second setup!
