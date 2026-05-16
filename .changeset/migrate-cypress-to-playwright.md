---
'tiptap': patch
---

Migrated E2E test suite from Cypress to Playwright. The Tiptap monorepo now uses Playwright for all browser-based end-to-end tests. Cypress, its config (`tests/cypress.config.js`, `tests/cypress/`), its custom commands, and the `cypress`, `@cypress/webpack-preprocessor`, and `eslint-plugin-cypress` dev dependencies have been removed. Playwright is configured via `playwright.config.ts` at the repo root, with shared helpers in `tests/e2e/support/` and integration tests in `tests/e2e/core/`. GitHub Actions has been updated to install Playwright browsers and run the Playwright suite. New scripts: `pnpm test:e2e`, `pnpm test:e2e:ui`, `pnpm test:e2e:debug`, `pnpm test:e2e:report`.
