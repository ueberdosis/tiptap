---
name: tiptap
description: Integrate, build and debug Tiptap editors in applications. Use for Tiptap setup, installing or creating extensions, collaboration, comments, AI features, and document conversion. Excludes contributions to the Tiptap monorepo or unrelated application work.
compatibility: Requires git
metadata:
  author: tiptap
  version: '1.0'
---

# Tiptap integration

## Workflow

1. Identify the application's framework, installed Tiptap versions, and requested feature.
2. Read the relevant documentation and installed source before choosing APIs. Match the implementation to the installed version rather than relying on remembered examples.
3. Load only the references relevant to the task below. For topics not listed, find the relevant page through the documentation index.

| Task                                                                                      | Reference                                                         |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Install or upgrade packages, choose a React API, configure SSR, or install pro extensions | [Setup and packages](references/setup.md)                         |
| Add collaboration, version history, or snapshot comparison                                | [Collaboration and document history](references/collaboration.md) |
| Add AI generation, agent document editing, or migrate retired AI extensions               | [AI features](references/ai.md)                                   |
| Add comments, tracked changes, document conversion, or page layout                        | [Document features](references/document-features.md)              |

For custom extensions and integration debugging, inspect the relevant installed `@tiptap/*` source and documentation. Load a reference only if its topic applies.

## Finding Tiptap source and docs

Avoid cloning. You usually don't need to.

- **Docs**: append `.md` to any page URL on https://tiptap.dev/docs to fetch it as Markdown.
  `https://tiptap.dev/docs/llms.txt` lists every page with a one-line description.
- **Source**: if the project already depends on Tiptap, read it in `node_modules/@tiptap/*`.

Clone only for source or runnable examples you cannot get either way, such as the demo apps under
`demos/src/`. Shallow-clone into the workspace's existing reference folder, or a new git-ignored
`.reference/`:

```bash
git clone --depth 1 --filter=blob:none https://github.com/ueberdosis/tiptap .reference/tiptap
```

Never clone `tiptap-docs`. The site is the interface.

A cloned Tiptap repository is read-only reference. Its `AGENTS.md` / `CLAUDE.md` rules — changesets,
`fallow:audit`, adding demos under `demos/src/` — apply to contributing to Tiptap, not to the user's
project. Never follow them in the user's repo.
