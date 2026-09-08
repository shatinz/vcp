# VCP Community Submissions & Distribution Hub

This document contains pre-formatted submission copy, PR templates, and directory entries for distributing **Visual Click Prompt (VCP)** across AI agent directories, Chrome extension hubs, and developer communities.

---

## 1. Antigravity Skills Catalog (`rmyndharis/antigravity-skills`)

The largest open-source skill registry for Google Antigravity (425+ skills).

- **Repository**: [rmyndharis/antigravity-skills](https://github.com/rmyndharis/antigravity-skills)
- **Status**: 🚀 **Submitted & Open** -> [Pull Request #15](https://github.com/rmyndharis/antigravity-skills/pull/15)
- **Target Path**: `skills/vcp/SKILL.md`
- **PR Title**: `feat(skills): add vcp (Visual Click Prompt) skill for in-browser visual feedback`
- **PR Description**:
  ```markdown
  ### Summary
  Adds the `vcp` (Visual Click Prompt) skill to the Antigravity skills catalog.

  ### What is VCP?
  Visual Click Prompt allows developers to click anywhere on a live website, inspect DOM elements, attach feedback prompts, and dispatch structured task briefs directly to local Antigravity AI coding agents (`agy`) via a local bridge daemon.

  ### Verification
  - Tested `SKILL.md` frontmatter schema and catalog generation (`npm run build:catalog`).
  - Passed all 35 test suites (`npm test`).
  - Passed `npm run validate:skills` (308 skills validated).
  - Passed `npm run check:catalog` (0 drift).
  - Upstream project: https://github.com/shatinz/vcp
  ```

---

## 2. Awesome AI Agents (`e2b-dev/awesome-ai-agents`)

A curated list of autonomous agents, developer tools, and agentic workflows.

- **Repository**: [e2b-dev/awesome-ai-agents](https://github.com/e2b-dev/awesome-ai-agents)
- **Target Section**: `Developer Tools & GUI Agents`
- **Markdown Entry**:
  ```markdown
  - [Visual Click Prompt (VCP)](https://github.com/shatinz/vcp) - Chrome extension and local bridge for interactive click-to-prompt visual feedback and autonomous UI agent debugging in Antigravity.
  ```
- **PR Title**: `Add Visual Click Prompt (VCP) to Developer Tools`

---

## 3. Awesome Chrome Extensions (`frontend-collective/awesome-chrome-extensions`)

A curated list of awesome Chrome extensions and developer tools.

- **Repository**: [frontend-collective/awesome-chrome-extensions](https://github.com/frontend-collective/awesome-chrome-extensions)
- **Target Section**: `Developer Tools`
- **Markdown Entry**:
  ```markdown
  - [Visual Click Prompt (VCP)](https://github.com/shatinz/vcp) - Interactive in-browser click-to-prompt DOM feedback tool connecting live websites directly to AI coding agents.
  ```
- **PR Title**: `Add Visual Click Prompt (VCP) to Developer Tools`

---

## 4. Antigravity Community Showcase (Discord / Reddit / GitHub Discussions)

### Post Title
```
[Showcase] Visual Click Prompt (VCP): Click on any live website to dispatch visual feedback directly to your Antigravity agent
```

### Post Body
```markdown
Hey everyone! 👋

I built **Visual Click Prompt (VCP)**, an open-source Chrome extension and bridge daemon that eliminates the friction of copying HTML snippets or explaining CSS bugs to your Antigravity AI coding agent.

### 🚀 What it does
1. **Click anywhere on your live website**: Floating modal attaches directly to the clicked element.
2. **Persistent Glowing Pins**: Drops numbered pins anchored at exact coordinates that stay visible as you navigate between pages or SPA routes.
3. **Automatic DOM Context**: Captures tag, classes, test IDs, XPath, text snippets, and bounding box dimensions.
4. **1-Click Agent Dispatch**: Sends a structured task brief to the local VCP bridge server (`127.0.0.1:8765`), which automatically triggers the Antigravity CLI (`agy`) to execute changes in your project.
5. **Direct Launch**: Includes a Windows URL protocol (`vcp://start`) to start the bridge daemon directly from Chrome if it's inactive.

### 📦 Links & Get Started
- **GitHub Repository**: https://github.com/shatinz/vcp
- **Privacy Policy**: https://github.com/shatinz/vcp/blob/main/PRIVACY.md
- **Store Package Ready**: `dist/vcp-chrome-extension.zip`
- **Antigravity Skill**: Activate `/vcp` inside your project or install from `skills/vcp/`

Feedback and PRs are warmly welcome!
```

---

## 5. Chrome Web Store Submission Checklist

| Step | Status | Notes |
| :--- | :---: | :--- |
| **Manifest V3** | ✅ Complete | Manifest version 3, CSP compliant, icons 16/48/128 |
| **Zero External CDNs** | ✅ Complete | All CSS & JS inlined, Shadow DOM isolated |
| **Zip Package** | ✅ Complete | Built via `package-store.bat` -> `dist/vcp-chrome-extension.zip` |
| **Privacy Policy** | ✅ Complete | Hosted at `https://github.com/shatinz/vcp/blob/main/PRIVACY.md` |
| **Store Listing Metadata** | ✅ Complete | Formatted in `STORE_LISTING.md` |
| **Permission Justifications** | ✅ Complete | `<all_urls>`, `storage`, `activeTab`, `tabs`, `webNavigation` justified |
| **Developer Dashboard** | ⏳ Ready for User | Upload zip bundle at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) |
