---
'@tiptap/core': patch
'@tiptap/markdown': patch
---

Bind `parseMarkdown` and `renderMarkdown` to the configured extension so hooks can read `this.options` and `this.name` without an Editor.
