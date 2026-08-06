---
"@tiptap/extension-table": patch
---

Fix `TableView` not syncing node attribute changes (e.g. `class` set via `addGlobalAttributes`) to the `<table>` DOM element after the initial render. Previously `TableView.update()` only re-rendered column widths, so attribute changes made via `tr.setNodeAttribute()` were reflected in the ProseMirror state and serialized HTML but invisible in the live editor DOM.
