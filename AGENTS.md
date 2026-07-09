# Tiptap

How to work on the Tiptap monorepo. Written for humans and AI coding assistants.

**IMPORTANT for AI agents**: Read the [Resources](#resources) sub-pages before contributing. They cover repo layout, scripts, coding standards, tests, demos, docs, and versioning. Come back to them when unsure.

---

## What is Tiptap

- Headless rich text editor toolkit built on ProseMirror. Small Core + opt-in Extensions for React, Vue, or vanilla.
- A collection of focused packages. Many are framework-agnostic with separate bindings for React and Vue.
- Favor small pure utilities, deterministic code, explicit side effects.
- Keep packages modular. Breaking changes need a major bump and a migration path.
- Add or update demos and tests when introducing a feature.

---

## AI contributor rules

- Work in small, iterative steps. If a task is too broad, say so and propose smaller steps.
- After changes, ask the user to review them.
- Disclose AI usage in the PR.
- Make single-purpose, small diffs. No sweeping changes in one PR.
- Never autocommit. Ask before committing or opening PRs.
- Run the [validation checklist](#validation-run-before-opening-a-pr) after edits.
- Add a Changeset for user-facing changes. No public API changes without a major bump and migration notes.
- Add or update a demo and tests for user-visible behavior. Prefer unit tests over e2e when deterministic.

---

## Key scripts

Run from the repo root with `pnpm <script>`:

| Script                  | What it does                         |
| ----------------------- | ------------------------------------ |
| `dev`                   | Start demos on port 3000             |
| `build`                 | Build all packages via Turborepo     |
| `lint` / `lint:fix`     | oxlint checks                        |
| `format` / `format:fix` | oxfmt formatting                     |
| `test:unit`             | Vitest unit tests                    |
| `test:e2e`              | Playwright e2e (Chromium)            |
| `fallow:audit`          | Changed-code audit (run after edits) |
| `reset`                 | Full clean + reinstall               |

Full list: [Scripts](agents/SCRIPTS.md)

---

## Validation (run before opening a PR)

```bash
pnpm lint
pnpm build
pnpm test:unit
pnpm test:e2e
pnpm fallow:audit   # must pass (verdict pass or warn, not fail)
```

If a single package fails types, run a targeted build:

```bash
pnpm -w -F @tiptap/core build
```

---

## PR checklist

- All checks pass (lint/build/tests/fallow).
- Changeset added for user-facing changes.
- Demo added or updated for UI-visible changes.
- Short PR description explaining why.

---

## Environment

- Node >=24.x (use nvm, fnm, or Corepack).
- pnpm with the repo lockfile. If you see unexpected errors, run `pnpm reset`.

---

## Troubleshooting

- CI dependency or lockfile errors: `pnpm reset` then rebuild.
- Flaky Playwright tests: reproduce with `pnpm test:e2e:open` or rerun with `--trace on`, inspect with `pnpm test:e2e:report`.
- fallow audit fails: fix the introduced finding. Don't suppress it.

---

## Resources

- [Repository Layout](agents/REPOSITORY_LAYOUT.md) — monorepo structure.
- [Scripts](agents/SCRIPTS.md) — all runnable scripts.
- [Coding Standards](agents/CODING.md) — comments, JSDoc, DRY/SOLID, complexity, fallow workflow.
- [Style Checks](agents/STYLECHECK.md) — oxlint and oxfmt.
- [Demos](agents/DEMOS.md) — running and adding demos.
- [Testing](agents/TESTING.md) — unit and e2e tests.
- [Documentation](agents/DOCUMENTATION.md) — API docs, guides, demos.
- [Versioning](agents/VERSIONING.md) — changesets and releases.
- Commit scopes: [SCOPES.md](./SCOPES.md)
