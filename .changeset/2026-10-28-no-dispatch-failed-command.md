---
'@tiptap/core': patch
---

Keyboard shortcuts that do not handle a key (for example Backspace during IME composition) no longer dispatch an empty transaction, which was cancelling the composition.
