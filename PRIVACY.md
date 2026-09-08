# Privacy Policy for Visual Click Prompt (VCP)

*Last updated: September 8, 2026*

**Visual Click Prompt (VCP)** ("we", "our", or "the extension") is an open-source developer productivity tool and Chrome Extension designed to enable visual in-context prompting on live websites and direct dispatch to local Antigravity AI agents.

This Privacy Policy describes our practices regarding the collection, storage, and handling of data when you use the Visual Click Prompt Chrome Extension.

---

## 1. Zero Data Collection Policy

We believe in complete privacy and local-first computing:

- **No Personal Data Collected:** We do not collect, harvest, store, or sell any Personally Identifiable Information (PII) such as names, email addresses, IP addresses, browsing histories, or location data.
- **No Third-Party Analytics:** The extension contains zero tracking pixels, telemetry probes, third-party analytics (e.g. Google Analytics, Mixpanel, Sentry), or external logging services.
- **No Remote Telemetry:** The extension communicates **strictly with your local machine** (`http://127.0.0.1:8765`). No code, prompts, selectors, or screenshots are ever transmitted to any remote cloud server or external API.

---

## 2. What Data Is Processed and Where It Is Stored

All data processed by Visual Click Prompt remains strictly on your local computer:

1. **In-Context Prompts & Visual Pin Coordinates:**
   - When you click an element on a webpage and save an instruction, the extension captures the target element's tag name, CSS selector, text quote, bounding box coordinates, and your typed instruction.
   - **Storage Location:** This data is stored locally in your browser using Chrome's built-in `chrome.storage.local` API, partitioned by the domain origin. It never leaves your browser unless you initiate a local dispatch.

2. **Local Bridge Dispatch:**
   - When you click **"Send to Antigravity"**, the extension sends your collected prompts over your computer's local loopback network (`127.0.0.1:8765`) to the local bridge daemon (`bridge/server.js`).
   - The bridge daemon writes the task files directly to your specified local workspace directory (e.g. `FEEDBACK_PROMPT.md` and `.gemini/tasks/`).

---

## 3. Chrome Permissions and Why They Are Needed

In accordance with Google Chrome Web Store Developer Program Policies, here is the strict single-purpose justification for every permission declared in `manifest.json`:

| Permission | Justification / Purpose |
| :--- | :--- |
| **`storage`** | Used to persist your visual pin coordinates and prompts locally in `chrome.storage.local` across browser sessions and page reloads. |
| **`activeTab`** | Used to inspect the DOM element clicked by the user during active Pin Mode to generate CSS selectors and text snippets. |
| **`tabs`** | Used to query the active tab URL and route changes so pins can be properly associated with and rendered on their respective web pages. |
| **`webNavigation`** | Used to detect Single Page Application (SPA) client-side route changes (`history.pushState`) to dynamically re-anchor pins when navigating between pages. |
| **`<all_urls>`** | Allows you to use the in-context feedback tool on any website, web application, or local development server (`localhost`) that you are building or testing. |
| **`http://127.0.0.1:*/*` & `http://localhost:*/*`** | Used exclusively by the Background Service Worker to communicate with the local Antigravity bridge daemon running on your computer. |

---

## 4. User Control and Data Deletion

You have full control over all stored data at all times:
- **Delete Individual Pins:** Click any pin on the page or inside the extension popup and click "Delete".
- **Clear All Page Pins:** Click "Clear Page Pins" in the extension popup to remove all annotations for that route.
- **Complete Data Wipe:** Clearing your browser's extension storage or uninstalling the extension permanently wipes all stored pins and settings immediately.

---

## 5. Open Source Transparency

Visual Click Prompt is 100% open-source software under the MIT License. The entire source code is publicly auditable on GitHub:
👉 **[https://github.com/shatinz/vcp](https://github.com/shatinz/vcp)**

---

## 6. Contact Information

If you have any questions, concerns, or feedback regarding this Privacy Policy, please open an issue on GitHub or contact the maintainer:
- **Repository:** [https://github.com/shatinz/vcp/issues](https://github.com/shatinz/vcp/issues)
- **Maintainer:** `@shatinz`
