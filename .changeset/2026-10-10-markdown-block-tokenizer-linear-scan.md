---
'@tiptap/core': patch
'@tiptap/extension-table': patch
---

Markdown parsing no longer slows down quadratically with document length when the Table or TaskList extension is registered: their tokenizers read only the lines they need instead of splitting the whole remaining document at every block
