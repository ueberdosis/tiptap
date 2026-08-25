# Tiptap

Headless rich text editor toolkit built on ProseMirror. A monorepo of small packages: a framework-agnostic core and extensions, plus React and Vue bindings.

Published packages live in `packages/*`. `demos/` is a Vite app used as playground and as the target for e2e tests. All scripts are in the root `package.json`.

## Rules

- Small, single-purpose diffs. Ask the user to review. Never autocommit.
- Add a changeset for user-facing changes. Public API breaks need a major bump and migration notes.
- Add or update a demo and tests for user-visible behavior. Prefer unit tests over e2e when deterministic.
- Fix fallow findings your change introduced. Don't suppress them.
- Comments should be clear, concise and use plain, simple english.
  - Rather use a oneliner
  - Try to always be intent-focused
  - stay local with comments
  - scannable, no long or complex wording
  - assume the reader doesn't know what you're talking about

## Before opening a PR

```bash
vp run lint
vp run build
vp run test:unit
vp run test:e2e
vp run fallow:audit   # verdict must be pass or warn, never fail
```

Single package failing types: `vp run -F @tiptap/core build`.
Dependency or lockfile errors: `vp run reset`, then rebuild.

## Code style

oxlint lints, oxfmt formats. Vite+ hooks (`vp staged`) run both on commit.

Prefer simple, readable code over clever code. Use early returns. Avoid deep nesting, nested ternaries, and abstractions you don't need yet. Keep functions focused. Apply DRY and SOLID pragmatically, not blindly.

### Files

- Keep files small and focused. Split unrelated utilities, types, constants and logic apart.
- One reusable utility per file, named after its export: `findDecorations.ts`, `addDecoration.ts`. Not `utils.ts`, `helpers.ts`, `decorations.ts`.
- A helper used in one file only can stay local.

### Naming

- Short, clear, recognizable. Never shorten just to save characters. No unclear abbreviations.
- `index` for numeric indexes, the item's real name for collection values. Single letters only in small math contexts like `x` and `y`.
- Use existing project terminology.

```ts
// good
items.map((item, index) => createNode(item, index))
decorations.filter(decoration => decoration.visible)

// bad
items.map((i, idx) => createNode(i, idx))
decorations.filter(d => d.visible)
```

### Comments

Comments are a last resort. Prefer code that explains itself through clear names, structure, and small functions.

- Default to **no comment**.
- Comment only when the **reason for a decision is not apparent from the code**.
- Keep comments **short, local, and intent-focused**.
- Prefer a short one-line fragment or sentence.
- Never restate what the code does.
- Never narrate control flow.
- Never explain surrounding architecture, history, edge cases, or implementation details unless they are essential to understanding the decision.
- Never use comments as a substitute for clearer code, naming, or structure.
- Do not write prose paragraphs, mini-documentation, or essay-style explanations in implementation code.
- Do not add examples, scenarios, or parenthetical explanations to comments.
- Do not use multi-line comments just because an explanation can be written. If it cannot be expressed concisely, reconsider whether the comment belongs in the code at all.
- Existing verbose comments are not a style precedent. Do not imitate them.
- When modifying code, remove comments that merely describe code made obvious by the change.

Prefer:

```ts
// Skip empty text nodes
// Preserve the original selection
// Stop after the first match
// Avoid dispatching during composition
// Keep inactive editors measurable
// Prevent collisions with imported IDs
```

Avoid:

```ts
// While composition is running, the update handler exits early because the
// view is still composing. The final update may also contain no document or
// selection changes, which means the menu would otherwise never update.
```

```ts
/**
 * Page content width used for the off-screen host. This is necessary because
 * inactive editors need to remain measurable for ResizeObserver to detect
 * changes while no overlay is currently open.
 */
```

```ts
/**
 * Generates a unique endnote ID. Imported documents use numeric DOCX IDs,
 * while client-created endnotes use this prefix to ensure that IDs cannot
 * collide with imported endnotes or footnotes.
 */
```

If a short comment loses useful detail, that detail usually belongs in the code structure, a test, commit/PR description, or documentation instead.

JSDoc is exempt **only when it documents a public API**. Public API JSDoc should still be concise and include `@param`, `@returns`, and a runnable example where appropriate.

### Writing

Short, simple English in comments, docs, changesets and PRs. Most important information first. Assume the reader is new to the project or not a native speaker. No filler.

### Before you finish

Simplify what is hard to follow. Remove needless nesting and abstractions. Split large or unfocused files. Move reusable utilities into their own files. Drop redundant comments.

Then run `pnpm fallow` for complexity and dead code, `pnpm fallow:health` for refactor targets, and `pnpm fallow:audit` on your changes.

## Tests

- Unit: Vitest, in `packages/**/__tests__/`, running on happy-dom.
- E2E: Playwright, next to the demo it drives as `demos/src/**/index.spec.ts`. Playwright starts the demo server itself on port 4080, no separate terminal. Helpers live in `demos/test/helpers.ts`. Copy `demos/src/Commands/Cut/index.spec.ts` as a template.

## Demos

- Path pattern is `demos/src/<Category>/<DemoName>/<Variant>`, for example `demos/src/Marks/Bold/React`. Scaffold with `pnpm make:demo`.
- Every demo needs an empty `index.html`. Vite routes by filesystem and ignores folders without it.
- Import from `@tiptap/core` and friends, never relative paths. The demos `tsconfig.json` aliases those to the local package sources.
- Reuse the global styles in `demos/setup/style.scss`: `.button-group` for rows of buttons, `.control-group` to wrap a toolbar, `.output-group` for demo output. Don't style `.tiptap`, that is the editor content itself.

## Changesets

Run `pnpm changeset`, or write the file yourself as `.changeset/YYYY-MM-DD-short-description.md`:

```markdown
---
'@tiptap/core': patch
---

One short sentence on what changed for the user.
```

Describe behavior users notice. No internals, no root-cause detail. `.github/publish-config.json` decides which branches publish and under which npm tag.

## Docs

User-facing documentation lives in the separate `ueberdosis/tiptap-docs` repo. Ask the user for the local path when you need to change it.
