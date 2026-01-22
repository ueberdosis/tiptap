---
applyTo: '**'
---

# Tiptap

This document explains how to work on the Tiptap monorepo in VS Code. It covers repo layout, local dev, linting and formatting, tests, docs, and release workflow. It is written to be friendly for both humans and AI coding assistants.

---

## What is Tiptap

Tiptap is a headless rich text editor toolkit built on ProseMirror. It ships a small Core and many opt-in Extensions so you can compose exactly the editor you need for React, Vue, or vanilla apps. The project is optimized for user experience and developer experience. APIs are predictable, behavior is testable, and everything should be documented with JSDoc and runnable examples so we can generate API docs automatically.

Key points for AI assistants:

* Treat Tiptap as a collection of focused packages that together form an editor system.
* Do not assume a single framework. Many packages are framework agnostic, with separate bindings for React and Vue.
* Favor small pure utilities and deterministic code. Side effects should be explicit.

---

## Repository layout

```
.
├─ packages/                 # Core and all first-party extensions
│  ├─ core/                  # Editor core (@dibdab/core)
│  ├─ extension-*/           # Individual extensions
│  ├─ pm/                    # ProseMirror related internals and helpers
│  └─ ...                    # Shared utilities, framework bindings, etc.
├─ demos/                    # Vite app for live examples
│  ├─ react/                 # React demos
│  └─ vue/                   # Vue demos
├─ tests/                    # Cypress e2e tests that run against the demos
├─ .changeset/               # Changesets for versioning and changelogs
└─ .github/                  # Workflows and docs like this file
```

Notes:

* All packages we publish or use live under `packages/*`.
* The `demos/` folder contains a Vite app. It automatically discovers and parses React and Vue demos so they appear in the UI without manual wiring.
* Cypress tests in `tests/` expect the demos to be available on `http://localhost:3000`.

## NPM scripts

Scripts defined at the repo root:

* `pnpm dev` - start the demos on port 3000
* `pnpm build` - build all packages via Turborepo
* `pnpm lint` - run eslint checks
* `pnpm lint:fix` - run prettier + eslint fix
* `pnpm test:open` - open Cypress against `tests/`
* `pnpm test:run` - run Cypress in headless mode
* `pnpm test` - build then run all tests
* `pnpm serve` - build and serve the demos on port 3000
* `pnpm publish` - build and publish with Changesets
* `pnpm reset` - remove caches, build artifacts, and reinstall deps

---

## Linting & formatting

* ESLint config is at **`.eslintrc.js`** in the repo root.
* Prettier config is at **`.prettierrc`** (or `prettier.config.json`).
* Husky and lint-staged run automatically on commits.

Run manually:

```bash
pnpm lint
pnpm lint:fix
```

---

## Demos

* Demos are a Vite app in `demos/`.
* React and Vue examples live in `demos/react` and `demos/vue`. They are automatically parsed into the app.
* Start in dev mode:

  ```bash
  pnpm dev
  ```
* Build static output and serve locally:

  ```bash
  pnpm serve
  ```

When adding a demo, keep it small and self-contained, with imports from published package names (`@dibdab/...`).

---

## Testing with Cypress

* Cypress lives in `tests/` and drives the demos in a browser.
* Tests assume the app is running on `http://localhost:3000`.

Workflow:

```bash
pnpm dev         # terminal A
pnpm test:open   # terminal B
```

or for headless CI runs:

```bash
pnpm test:run
```

---

## Documentation style

We focus heavily on **User Experience** and **Developer Experience**. Every public API must be documented with JSDoc, including:

* `@param` and `@returns` annotations
* Argument descriptions
* At least one runnable example

This ensures our automated API docs are complete and examples are usable without extra context.

Example:

````ts
/**
 * Toggle bold mark on the current selection.
 *
 * Example
 * ```ts
 * editor.chain().focus().toggleBold().run()
 * ```
 *
 * @param editor - The editor instance
 * @returns true if the command was applied
 */
export function toggleBold(editor: Editor): boolean {
  // ...
}
````

---

## Versioning and releases with Changesets

* Run `pnpm changeset` to create a new changeset (choose packages + bump type).
* Run `pnpm version` to update versions and changelogs.
* Maintainers publish with `pnpm publish`.

Changelogs must describe **user-facing changes**. Avoid internal noise.

---

## Cleaning and resetting

* `pnpm run clean:packages` - remove build artifacts
* `pnpm run clean:packs` - remove generated tarballs
* `pnpm reset` - full reset of caches, node\_modules, and lockfiles

---

## Principles

* Keep packages modular and framework-agnostic where possible.
* Breaking changes require a major bump and a clear migration path.
* Always add or update demos and tests when introducing a feature.
* Code should be deterministic, documented, and tested.

---

## Extra guidance (short additions)

To make these instructions easier for automated agents and new contributors, the sections below add a few operational details and guardrails that speed up safe, repeatable changes.

### Environment

- Recommended Node version: >=18.x. Use a node version manager (nvm, fnm) or Corepack to pin a runtime.
- Recommended package manager: pnpm (use the repo's lockfile). If you see unexpected errors, run `pnpm reset`.

### Where to edit packages

Packages live under `packages/*`. Public entry points are typically `packages/<name>/src/index.ts` and are referenced by the package's `package.json` (`main`/`module`/`exports`). Prefer editing `src/` files and keep package diffs focused. For framework bindings check `packages/react/` and `packages/vue-2/` or `packages/vue-3/`.

### Demos auto-discovery rules

The demos app discovers examples automatically. When adding a demo:
- Keep demo files small and self-contained. Import from published package names (for example `@dibdab/extension-foo`).
- Name demo files clearly; follow existing naming conventions in `demos/`.

### Validation checklist (run locally before opening a PR)

Run the following to validate changes quickly:

```bash
pnpm lint
pnpm build
pnpm test       # runs unit and/or cypress where configured
pnpm dev        # optionally run the demos and open http://localhost:3000
```

If a single package is failing types, run a targeted build for that package (e.g. `pnpm -w -F @dibdab/core build`), or run `pnpm build` at the repo root.

### PR checklist

- All checks pass (lint/build/tests).
- Changeset added for user-facing changes (`pnpm changeset`).
- Demo added/updated for UI-visible changes.
- Short, clear PR description and changelog entry that explains why the change is needed.

### Guidance for automated agents and AI assistants

- Make single-purpose, small diffs. Avoid sweeping changes in one PR.
- Always run the validation checklist above after edits.
- Add or update a demo and tests for user-visible behavior. For deterministic behaviour, favour unit tests over fragile e2e tests where possible.
- Add a Changeset for any user-facing change. Do not change public APIs without a major bump; document migration steps in the PR description.

### Troubleshooting notes

- If CI fails with dependency or lockfile errors, run `pnpm reset` locally and re-run the build.
- For flaky Cypress tests, run the demo locally with `pnpm dev` and reproduce the failing test in `pnpm test:open`.

---

These additions are intentionally short so they are easy to follow and scriptable by tools and agents. If you'd like, I can apply a slightly different tone or expand any section into more detail (for example, exact node/pnpm version pinning or demo naming patterns).
