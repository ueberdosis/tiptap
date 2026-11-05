---
'@tiptap/core': patch
---

Fixed `editor.commands`, `editor.getHTML()` and `editor.getText()` throwing after the editor was destroyed. `getHTML()` and `getText()` return the last document again, and commands return `false`. `getHTML()` and `getText()` also no longer throw inside `onBeforeCreate` and return an empty string there.
