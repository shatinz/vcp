# Contributing to Visual Click Prompt (VCP)

Thank you for your interest in contributing to Visual Click Prompt!

## How to Contribute

1. **Reporting Bugs**: Open a GitHub Issue detailing the browser version, host website framework, and steps to reproduce.
2. **Suggesting Features**: We welcome suggestions for V2 (drawing layers, screenshot clipping, IDE plugins).
3. **Submitting Pull Requests**:
   - Fork the repository.
   - Create a feature branch: `git checkout -b feature/my-new-feature`
   - Test your changes:
     ```bash
     node bridge/test-bridge.js
     node --check extension/content.js
     node --check extension/popup.js
     ```
   - Commit using conventional commits (`feat: ...`, `fix: ...`, `docs: ...`).
   - Push to your fork and submit a PR to `main`.
