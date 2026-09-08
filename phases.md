# Visual Click Prompt (VCP) — Architectural Phases & Execution Roadmap

## North Star & Ultimate Goal
Build a zero-friction, production-grade Chrome Extension (Manifest V3) and Local Agent Bridge that turns any live website into an interactive prompt canvas. Users can point and click on any web element, enter in-context instructions via a popover appearing directly at the clicked spot, navigate freely across pages and routes without losing pins or prompts, add overarching macro prompts, connect to any project workspace, and dispatch structured, high-context task briefs straight into Antigravity agents.

---

## Phase 1: In-Page DOM Inspector, Isolated Shadow DOM & Popover Engine
**Boundary Lines:**
- **In Scope:** Isolated Shadow DOM container (`<vcp-feedback-root>`), CSS reset, capture-phase event trapping, hover bounding highlight, popover rendering at clicked coordinates with collision handling, resilient element anchor generation (selectors, test-ids, text quotes, geometry, computed styles).
- **Out of Scope:** Multi-page storage, background HTTP proxy, local bridge server, V2 drawing.

### Layers & Tasks:
- [x] **Layer 1.1: DOM Isolation & CSS Reset**
  - [x] Implement custom element `<vcp-feedback-root>` mounted to `document.documentElement`.
  - [x] Apply `all: initial` isolation with zero host page style leakage.
- [x] **Layer 1.2: Capture-Phase Inspector & Non-Destructive Highlighting**
  - [x] Capture-phase pointer listener preventing host link clicks, form submissions, and SPA events when inspect mode is active.
  - [x] Non-destructive hover bounding box rendered strictly inside the Shadow DOM layer.
- [x] **Layer 1.3: In-Context Popover Physics & Placement**
  - [x] Viewport-relative dynamic positioning with boundary flip and collision clamping.
  - [x] Prompt input card with auto-focus, element breadcrumb preview, and Save / Cancel actions.
- [x] **Layer 1.4: Resilient Multi-Tier Element Anchor Generation**
  - [x] Extract test IDs (`data-testid`, `data-cy`, `data-qa`), cleaned CSS selectors, W3C text quotes, structural XPath, and geometric ratios.
  - [x] Capture computed style snapshot (dimensions, colors, typography).

**Phase 1 Exit Criteria:**
Clicking on any element opens the popover at the clicked position with full element metadata, and no host page interactions or CSS breaks occur. *(PASSED)*

---

## Phase 2: Multi-Page Persistent Pins, SPA Navigation & Storage Engine
**Boundary Lines:**
- **In Scope:** `chrome.storage.local` schema partitioned by domain origin and normalized route path, persistent numbered pin markers (`1`, `2`, `3`...), SPA client-side route change monitoring (`pushState`, `popstate`, webNavigation), fuzzy DOM re-hydration with MutationObserver retry.
- **Out of Scope:** Local bridge server, agent prompt writing.

### Layers & Tasks:
- [x] **Layer 2.1: Storage Schema & URL Normalization Engine**
  - [x] Partition annotations by origin (`vcp_pins_https://...`).
  - [x] Normalize URLs by stripping tracking queries and hashes to prevent duplicate stores.
- [x] **Layer 2.2: Persistent Pin Markers & In-Page Overlay**
  - [x] Render sleek numbered pin markers anchored over annotated elements.
  - [x] Click-to-edit or delete existing pins directly on the live page.
- [x] **Layer 2.3: SPA Route Transition & History Interception**
  - [x] Monitor History API (`pushState`, `replaceState`, `popstate`) in content script.
  - [x] Synchronize route changes from `background.js` via `webNavigation.onHistoryStateUpdated`.
  - [x] Dynamic re-anchoring of saved pins when navigating across different pages of the website.
- [x] **Layer 2.4: Dynamic Badge Counter**
  - [x] Maintain Chrome action badge counter displaying active pins for current tab/page.

**Phase 2 Exit Criteria:**
User can leave pins on page A, navigate to page B, leave pins on page B, return to page A, and observe all pins persisting accurately at their respective elements. *(PASSED)*

---

## Phase 3: Extension Popup UI, Macro Prompts & Multi-Project Workspace Switcher
**Boundary Lines:**
- **In Scope:** Extension popup window (`popup.html` / `popup.js`), pin review list, macro/general prompt editor, project directory switcher with persistence, and one-click dispatch trigger.
- **Out of Scope:** Bridge server implementation (runs in Phase 4).

### Layers & Tasks:
- [x] **Layer 3.1: Modern Popup Dashboard**
  - [x] Polished dark UI displaying page URL, pin count, and project connection status.
  - [x] Review list showing all element prompts with element tag, selector, and text preview.
  - [x] Delete or jump-to-element actions for individual items.
- [x] **Layer 3.2: Macro Prompting & Summary Layer**
  - [x] Global instruction text area for task-wide directives (e.g., overall architectural rules, brand updates).
- [x] **Layer 3.3: Project Workspace Selector**
  - [x] Target directory input / dropdown selector supporting any local path (e.g. `C:\prj\vcp`, `C:\prj\pdf-anki-sync`, etc.).
  - [x] Recent projects list stored in `chrome.storage.local`.

**Phase 3 Exit Criteria:**
Popup displays all captured page annotations, allows adding a macro prompt, and lets user specify or switch target project directory. *(PASSED)*

---

## Phase 4: Antigravity Localhost Bridge Server & Agent Task Dispatch
**Boundary Lines:**
- **In Scope:** Background Service Worker HTTP proxy (evading Mixed Content / PNA blocks), Node.js bridge daemon (`bridge/server.js` on `127.0.0.1:8765`), `.gemini/tasks/` automated markdown prompt writer, 1-click launcher (`start-bridge.bat`), automated test suite.
- **Out of Scope:** V2 drawing.

### Layers & Tasks:
- [x] **Layer 4.1: Background Service Worker Proxy**
  - [x] Forward dispatch requests from popup/content script to `http://127.0.0.1:8765/api/feedback`.
  - [x] Return status, errors, and task file paths back to extension UI.
- [x] **Layer 4.2: Local Bridge Daemon (`server.js`)**
  - [x] Lightweight HTTP server with zero external dependencies.
  - [x] Healthcheck (`GET /health`), project validation (`GET /api/projects`), and task generation (`POST /api/feedback`).
- [x] **Layer 4.3: Structured Task Brief & Antigravity Prompt Formatter**
  - [x] Automatically writes markdown task briefs to `<target_project>/.gemini/tasks/task-<timestamp>.md` and `<target_project>/FEEDBACK_PROMPT.md`.
  - [x] Formats element selectors, computed styles, text snippets, page URLs, and user directives ready for immediate execution by Antigravity.
- [x] **Layer 4.4: Bridge Test Suite & Launcher**
  - [x] Automated integration test script (`test-bridge.js`).
  - [x] Windows launcher batch script (`start-bridge.bat`).

**Phase 4 Exit Criteria:**
Clicking "Send to Antigravity" immediately writes structured task markdown files in the selected project workspace with complete verification pass. *(PASSED)*

---

## Phase 5: V2 Drawing Layer Architecture Readiness
**Boundary Lines:**
- **In Scope:** Modular SVG drawing layer structure (`drawing-layer.js`), canvas event-loop readiness, vector primitive placeholders.
- **Out of Scope:** Full freehand Bezier smoothing implementation (scheduled for V2).

### Layers & Tasks:
- [x] **Layer 5.1: SVG Layer Cake Integration**
  - [x] Fullscreen `<svg id="vcp-drawing-canvas">` mounted inside Shadow DOM below the pins layer.
  - [x] Pointer-events toggle controller between Pin Mode and Drawing Mode.

**Phase 5 Exit Criteria:**
SVG vector layer exists cleanly within the Shadow DOM hierarchy without blocking pin or popover interactions. *(PASSED)*

---

## Phase 6: End-to-End Verification, Documentation & Git Synchronization
**Boundary Lines:**
- **In Scope:** Node.js syntax & API tests, README user manual, git commit and upstream tracking.

### Layers & Tasks:
- [x] **Layer 6.1: Verification & Syntax Checks**
  - [x] Run `node --check` across all JS files.
  - [x] Run automated bridge API suite.
- [x] **Layer 6.2: Complete Documentation**
  - [x] Write `README.md` with step-by-step setup for Chrome and bridge server.
- [x] **Layer 6.3: Git Synchronization**
  - [x] Stage and commit all code to `main` branch.

**Phase 6 Exit Criteria:**
All tests pass, repository is fully committed, and documentation is crystal-clear. *(PASSED)*

---

## Phase 7: Chrome Web Store Packaging & Ecosystem Distribution
**Boundary Lines:**
- **In Scope:** Production ZIP bundling script, Chrome Web Store listing metadata and permission justifications, Privacy Policy hosted on GitHub, Antigravity skills catalog pull request, and awesome-list submission entries.

### Layers & Tasks:
- [x] **Layer 7.1: Chrome Web Store Packaging**
  - [x] Automated packaging script (`package-extension.js`, `package-store.bat`) building clean ZIP bundle without temporary/dev files (`dist/vcp-chrome-extension.zip`).
- [x] **Layer 7.2: Store Listing & Privacy Compliance**
  - [x] Production privacy policy complying with Chrome Web Store Developer Policies (`PRIVACY.md`).
  - [x] Full store listing metadata, single-purpose statement, and permission justifications (`STORE_LISTING.md`).
- [x] **Layer 7.3: Antigravity Skills Catalog Registration**
  - [x] Registered `vcp` skill into upstream `rmyndharis/antigravity-skills` (425+ skills catalog).
  - [x] Validated frontmatter and zero catalog drift (`npm run validate:skills`, `npm run check:catalog`).
  - [x] Submitted Pull Request #15 to `rmyndharis/antigravity-skills`.
- [x] **Layer 7.4: Community Directory Submissions & Showcases**
  - [x] Created `COMMUNITY_SUBMISSIONS.md` with PR drafts for `e2b-dev/awesome-ai-agents`, `frontend-collective/awesome-chrome-extensions`, and Antigravity community forum/Discord showcases.

**Phase 7 Exit Criteria:**
Clean Web Store zip generated, privacy policy published, upstream Antigravity skills PR submitted, and all submission guides compiled. *(PASSED)*

