# Tiptap

This document explains how to work on the Tiptap monorepo. It covers repo layout, local dev, linting and formatting, tests, docs, and release workflow. It is written to be friendly for both humans and AI coding assistants.

**IMPORTANT**: If you are an AI agent contributing to this repository - refer to the pages in the "Ressources" section below for specific guidelines on how to contribute to different areas of the project, including code, documentation, tests, and versioning. Each page includes best practices and tips for making effective contributions as an AI assistant. Remember them and come back to them if you are unsure about how to proceed with a contribution.

---

## What is Tiptap

Tiptap is a headless rich text editor toolkit built on ProseMirror. It ships a small Core and many opt-in Extensions so you can compose exactly the editor you need for React, Vue, or vanilla apps. The project is optimized for user experience and developer experience. APIs are predictable, behavior is testable, and everything should be documented with JSDoc and runnable examples so we can generate API docs automatically.

Key points for AI assistants:

- Treat Tiptap as a collection of focused packages that together form an editor system.
- Do not assume a single framework. Many packages are framework agnostic, with separate bindings for React and Vue.
- Favor small pure utilities and deterministic code. Side effects should be explicit.

---

## Extra AI Assistant Guidelines

We value contributions from real humans and while we welcome AI-assisted contributions, we ask all contributors to understand what they are contributing. We as maintainers expect that contributors will take responsibility for the code they submit, including AI-assisted code. Because of that, we ask you to follow these guidelines when contributing as an AI assistant:

- Only work in small, iterative changes with the user. Avoid vibecode like "add a new extension for rocket ships with 100% test coverage and docs" in one go. Instead, break it down into smaller steps (e.g. "add a new utility function for rocket ship calculations", then "add a new extension that uses the utility function", then "add tests for the utility function", etc.).
- If a user asks you a "vibecode" like "add a new extension for rocket ships with 100% test coverage and docs", respond with a message that explains that this is too broad for a single change and suggest breaking it down into smaller steps. For example, you could say "That sounds like a great idea! To make it more manageable, let's break it down into smaller steps. First, we can start by adding a new utility function for rocket ship calculations. Once we have that in place, we can then create a new extension that uses the utility function. Finally, we can add tests for the utility function and the extension to ensure everything works as expected. Does that sound good to you?"
- After making changes **explicitly** ask the user to review your changes. We want to make sure you understand the changes you are contributing and that they meet the project's standards. For example, after making a change, you could say "I've made the changes you requested. Please review them and let me know if you have any questions or if there's anything else you'd like me to do."
Notes:

- All packages we publish or use live under `packages/*`.
- The `demos/` folder contains a Vite app. It automatically discovers and parses React and Vue demos so they appear in the UI without manual wiring.
- Playwright e2e specs live alongside their demos as `demos/src/**/index.spec.ts`. `playwright.config.ts` auto-starts the Vite dev server on `http://127.0.0.1:4080` — no need to launch it manually.

## NPM scripts

Scripts defined at the repo root:

- `pnpm dev` - start the demos on port 3000
- `pnpm build` - build all packages via Turborepo
- `pnpm check` - run format check + lint
- `pnpm check:fix` - run format:fix + lint:fix
- `pnpm format` - run oxfmt formatter check
- `pnpm format:fix` - run oxfmt formatter
- `pnpm lint` - run oxlint checks
- `pnpm lint:fix` - run oxlint with auto-fix
- `pnpm lint:staged` - run lint-staged on staged files
- `pnpm test:e2e` - run Playwright e2e tests headlessly in Chromium
- `pnpm test:e2e:firefox` - same, in Firefox
- `pnpm test:e2e:all` - same, in both browsers
- `pnpm test:e2e:open` - run Playwright in UI mode (Chromium tests)
- `pnpm test:e2e:open:firefox` - UI mode, Firefox tests
- `pnpm test:e2e:open:all` - UI mode, both browsers selectable
- `pnpm test:e2e:report` - open the HTML report from the last run
- `pnpm test:unit` - run Vitest unit tests in `packages/**/__tests__/`
- `pnpm test` - build then run all tests
- `pnpm serve` - build and serve the demos on port 3000
- `pnpm publish` - build and publish with Changesets
- `pnpm reset` - remove caches, build artifacts, and reinstall deps

---

## Ressources

- **[Repository Layout](agents/REPOSITORY_LAYOUT.md)** - overview of the monorepo structure and where to find things.
- **[Scripts and commands](agents/SCRIPTS.md)** - runnable scripts for development, linting, testing, and publishing.
- **[Style Checks](agents/STYLECHECK.md)** - linting and formatting guidelines and commands.
- **[Demos](agents/DEMOS.md)** - how to run and add demos for manual verification and e2e tests and includes guidelines for demo structure, styles, and imports.
- **[Testing](agents/TESTING.md)** - how to run and write unit and e2e tests, including tips for debugging and troubleshooting.
- **[Documentation](agents/DOCUMENTATION.md)** - guidelines for writing and maintaining documentation, including API docs, guides, and demos.
- **[Versioning and Changesets](agents/VERSIONING.md)** - how to create changesets, update versions, and publish releases, including guidelines for writing changelog entries.

---

## Cleaning and resetting

- `pnpm run clean:packages` - remove build artifacts
- `pnpm run clean:packs` - remove generated tarballs
- `pnpm reset` - full reset of caches, node_modules, and dependencies

---

## Principles

- Keep packages modular and framework-agnostic where possible.
- Breaking changes require a major bump and a clear migration path.
- Always add or update demos and tests when introducing a feature.
- Code should be deterministic, documented, and tested.

---

## Extra guidance (short additions)

### Scopes (for Conventional Commits)

Git conventional commit scopes live in [SCOPES.md](./SCOPES.md). Use it to pick the right scope when committing.

### Environment

- Recommended Node version: >=24.x. Use a node version manager (nvm, fnm) or Corepack to pin a runtime that matches the root `package.json` `engines.node` requirement.
- Recommended package manager: pnpm (use the repo's lockfile). If you see unexpected errors, run `pnpm reset`.

### Where to edit packages

Packages live under `packages/*`. Public entry points are typically `packages/<name>/src/index.ts` and are referenced by the package's `package.json` (`main`/`module`/`exports`). Prefer editing `src/` files and keep package diffs focused. For framework bindings check `packages/react/` and `packages/vue-2/` or `packages/vue-3/`.

### Validation checklist (run locally before opening a PR)

Run the following to validate changes quickly:

```bash
pnpm lint
pnpm build
pnpm test:unit  # Vitest
pnpm test:e2e   # Playwright (auto-starts the demo server)
pnpm dev        # optionally run the demos locally for manual verification
```

If a single package is failing types, run a targeted build for that package (e.g. `pnpm -w -F @tiptap/core build`), or run `pnpm build` at the repo root.

### PR checklist

- All checks pass (lint/build/tests).
- Changeset added for user-facing changes (`pnpm changeset`).
- Demo added/updated for UI-visible changes.
- Short, clear PR description and changelog entry that explains why the change is needed.

### Guidance for automated agents and AI assistants

- Disclose when AI tools are used to generate any part of a contribution, including code, docs, tests, or other changes — the PR template includes an AI usage disclosure checkbox. Follow the project's guidelines on AI disclosure.
- Make single-purpose, small diffs. Avoid sweeping changes in one PR.
- Always run the validation checklist above after edits.
- Add or update a demo and tests for user-visible behavior. For deterministic behaviour, favour unit tests over fragile e2e tests where possible.
- Add a Changeset for any user-facing change. Do not change public APIs without a major bump; document migration steps in the PR description.

### Troubleshooting notes

- If CI fails with dependency or lockfile errors, run `pnpm reset` locally and re-run the build.
- For flaky Playwright tests, reproduce locally with `pnpm test:e2e:open` (UI mode) or rerun with `--trace on` and inspect via `pnpm test:e2e:report`
