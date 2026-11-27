---
'@tiptap/core': patch
---

`deleteSelection` keeps the marks of the deleted text again, so typing after deleting bold text is bold, like in ProseMirror.
