# Coding standards

## Comments

- Only add a comment when a block is too complex or convoluted to understand by reading the code.
- Max 1-2 lines. Simple, direct English.
- Explain WHY, not WHAT the code does.
- No decorative comments, no emojis.

Good:

```
// We need to check window.DOMParser here because
// server-side rendering does not have it.
```

Bad:

```
// This function returns the editor state for the given editor instance.
function getState(editor) {
```

## JSDoc

- Use JSDoc for public APIs and exported functions:
  `@param`, `@returns`, short description.
- Skip JSDoc for obvious private helpers.
- Include runnable examples — they power auto-generated API docs.
- Full API-docs workflow in [DOCUMENTATION.md](DOCUMENTATION.md).

## Code structure

- DRY, SOLID. Keep complexity low.
- Split long functions into smaller ones.
- Keep files separated by responsibility. Don't dump everything in one big file.
- Prefer early returns over nested if/else.
- Composition over inheritance. Type narrowing over type assertions.
- Immutable data (`readonly`, `const`, `Object.freeze`).
- Extract magic numbers into named constants.
- No circular imports. Separate business logic from UI/framework code.
- Interfaces for external boundaries. Prefer dependency injection over direct imports.
- Run `pnpm fallow` before and after big changes to check complexity, circular deps, and dead code.

## Naming

- Short but descriptive. No `getEditorStateReflowRepaintRenderPattern`.
- No non-descriptive names except loop counters.

## Process

- Work in small chunks: change → review → repeat. No one-shot writes.
- Ask before making changes outside the task scope.
- Self-review your own changes. Use subagents for independent review when possible.
- Never autocommit. Ask the user before committing or opening PRs.
- **Run `pnpm fallow:audit` after edits.** Fix any findings your changes introduced. The verdict must be `pass` or `warn`, not `fail`. Don't leave the repo in a worse state than you found it.
- Run `pnpm fallow:health` before bigger changes to check the health score and refactor targets.
