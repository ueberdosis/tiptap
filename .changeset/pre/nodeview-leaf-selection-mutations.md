---
'@tiptap/core': patch
---

Node views without a `contentDOM` no longer ignore selection mutations, so ProseMirror moves the caret back to a valid position when the browser places it inside the node view.
