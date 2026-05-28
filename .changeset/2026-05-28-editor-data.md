---
'@tiptap/core': minor
---

Add an `EditorData` shape for persisting a document: JSON `content`, `documentVersion`, and a typed `meta` map. Use `getHTML()` / `getMarkdown()` separately when you need serialized export formats.

- Initialize the editor with `data: { content, documentVersion?, meta? }` instead of only `content` (the `content` option remains supported but is deprecated in favor of `data` for Tiptap v4).
- Use `editor.getData()` when saving and `editor.getMeta()` / `editor.setMeta()` for app-specific metadata.
- `editor.initializedWithData` indicates whether the editor was created via the `data` option.
