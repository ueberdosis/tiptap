---
'@tiptap/extension-list': patch
---

When the editor is read-only and `onReadOnlyChecked` returns `true`, clicking a task item checkbox now updates the document and emits `update`. The callback also gets the current task item node, not the one from the first render.
