---
'@tiptap/extension-collaboration-caret': major
---

**Breaking Change:** Removed dependencies on deprecated table extensions. These are now consolidated in `@tiptap/extension-table`.

- Removed `@tiptap/extension-table-cell` – use `TableCell` from `@tiptap/extension-table`
- Removed `@tiptap/extension-table-header` – use `TableHeader` from `@tiptap/extension-table`
- Removed `@tiptap/extension-table-row` – use `TableRow` from `@tiptap/extension-table`

All functionality is available through `@tiptap/extension-table`, which should be used alongside this extension.
