---
'@tiptap/core': patch
---

Fixed `editor.commands`, `editor.getHTML()` and `editor.getText()` throwing after the editor was destroyed. Commands now return `false`, `getHTML()` and `getText()` return an empty string.
