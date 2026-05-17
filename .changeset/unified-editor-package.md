---
"@tiptap/editor": major
---

Introduce `@tiptap/editor`, the unified entrypoint for Tiptap 4.0.

`@tiptap/editor` consolidates the previously separate lightweight extension packages, the bundled `@tiptap/extensions`, the list bundle, and `@tiptap/starter-kit` into a single package with subpath exports. Heavy / provider-specific extensions (collaboration, mathematics, code-block-lowlight, mention, table, etc.) remain in their own packages.

**Breaking changes**

The following packages are removed in v4. Update imports as shown:

| Old import | New import |
| --- | --- |
| `@tiptap/extension-document` | `@tiptap/editor/nodes/document` |
| `@tiptap/extension-paragraph` | `@tiptap/editor/nodes/paragraph` |
| `@tiptap/extension-text` | `@tiptap/editor/nodes/text` |
| `@tiptap/extension-heading` | `@tiptap/editor/nodes/heading` |
| `@tiptap/extension-blockquote` | `@tiptap/editor/nodes/blockquote` |
| `@tiptap/extension-code-block` | `@tiptap/editor/nodes/code-block` |
| `@tiptap/extension-hard-break` | `@tiptap/editor/nodes/hard-break` |
| `@tiptap/extension-horizontal-rule` | `@tiptap/editor/nodes/horizontal-rule` |
| `@tiptap/extension-bold` | `@tiptap/editor/marks/bold` |
| `@tiptap/extension-italic` | `@tiptap/editor/marks/italic` |
| `@tiptap/extension-strike` | `@tiptap/editor/marks/strike` |
| `@tiptap/extension-code` | `@tiptap/editor/marks/code` |
| `@tiptap/extension-link` | `@tiptap/editor/marks/link` |
| `@tiptap/extension-underline` | `@tiptap/editor/marks/underline` |
| `@tiptap/extension-list/bullet-list` | `@tiptap/editor/nodes/bullet-list` |
| `@tiptap/extension-list/ordered-list` | `@tiptap/editor/nodes/ordered-list` |
| `@tiptap/extension-list/item` | `@tiptap/editor/nodes/list-item` |
| `@tiptap/extension-list/task-list` | `@tiptap/editor/nodes/task-list` |
| `@tiptap/extension-list/task-item` | `@tiptap/editor/nodes/task-item` |
| `@tiptap/extension-list/keymap` | `@tiptap/editor/extensions/list-keymap` |
| `@tiptap/extension-list/kit` | `@tiptap/editor/kits/list` |
| `@tiptap/extensions/character-count` | `@tiptap/editor/extensions/character-count` |
| `@tiptap/extensions/drop-cursor` | `@tiptap/editor/extensions/dropcursor` |
| `@tiptap/extensions/focus` | `@tiptap/editor/extensions/focus` |
| `@tiptap/extensions/gap-cursor` | `@tiptap/editor/extensions/gapcursor` |
| `@tiptap/extensions/placeholder` | `@tiptap/editor/extensions/placeholder` |
| `@tiptap/extensions/selection` | `@tiptap/editor/extensions/selection` |
| `@tiptap/extensions/trailing-node` | `@tiptap/editor/extensions/trailing-node` |
| `@tiptap/extensions/undo-redo` | `@tiptap/editor/extensions/history` |
| `@tiptap/starter-kit` | `@tiptap/editor/kits/starter` |

`@tiptap/react` continues to live in its own package; the `@tiptap/editor/react` subpath re-exports the React API and a defaults-enabled `useEditor`.

**New behavior**

- `Editor` from `@tiptap/editor` automatically registers Document, Paragraph, and Text. Pass a same-named node in `extensions` (or include `StarterKit` which already bundles them) to override the defaults; reach for `@tiptap/core`'s `Editor` to opt out completely.
- The defaults injection is dedup-aware: it walks into kits' `addExtensions()` and skips defaults already present anywhere in the resolved extension tree, so `new Editor({ extensions: [StarterKit] })` produces no duplicate-node warnings.
- The package is `"sideEffects": false` and emits one ESM + one CJS + one .d.ts per subpath, preserving tree-shaking.
- The root entrypoint never imports React, Vue, or Svelte; framework adapters are strictly under subpaths.

**Removed packages**

`@tiptap/extension-{document,paragraph,text,heading,blockquote,code-block,hard-break,horizontal-rule,bold,italic,strike,code,link,underline,list,bullet-list,ordered-list}`, `@tiptap/extensions`, `@tiptap/starter-kit`, and the entire `packages-deprecated/*` set of v3-name aliases are deleted.
