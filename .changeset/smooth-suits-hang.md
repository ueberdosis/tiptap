---
'@tiptap/core': patch
---

Editors can now emit `transaction` and `update` events before being mounted.
This means smoother state handling and instant feedback from editors, even when they're not in the DOM.
