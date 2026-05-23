# Testing

Two layers:

* **Unit tests** with Vitest in `packages/**/__tests__/` (happy-dom). These test `@tiptap/core` and individual extensions in isolation.
* **E2E tests** with Playwright, colocated next to their demos as `demos/src/**/index.spec.ts`. They drive the real Vite-served demo pages in Chromium.

Run them:

```bash
pnpm test:unit              # Vitest
pnpm test:e2e               # Playwright headless (Chromium)
pnpm test:e2e:firefox       # Playwright headless (Firefox)
pnpm test:e2e:all           # both browsers — every test twice
pnpm test:e2e:open          # UI mode (Chromium tests)
pnpm test:e2e:open:firefox  # UI mode (Firefox tests)
pnpm test:e2e:open:all      # UI mode, switch between browsers in the project picker
pnpm test:e2e:report        # open the HTML report from the last run
```

Playwright auto-starts the demo dev server (`pnpm -C demos run start:e2e` on port 4080) via `playwright.config.ts` — no separate terminal needed. Shared helpers live in `demos/test/helpers.ts`: `getEditor`, `setEditorContent`, `clickButton`. Use `demos/src/Commands/Cut/index.spec.ts` as a canonical template when adding new specs.

Browser setup:

* CI installs Chromium only (cached between runs) and only runs the Chromium project.
* For local Firefox testing, install it once with `pnpm exec playwright install firefox` (~80MB).
* UI mode (`--ui`) always opens its host window in Chromium — that's the Playwright UI app itself, not the browser running your tests. Tests still execute in the project you selected (check the trace metadata or `browserName` fixture if you need to confirm).
