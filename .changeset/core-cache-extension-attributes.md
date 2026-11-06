---
'@tiptap/core': patch
---

`editor.extensionManager.attributes` is now computed once instead of on every read. React node views with an `attrs` function and `splitBlock` read it often, and each read re-ran every extension's `addOptions` and `addStorage`, which slowed down documents with many node views.
