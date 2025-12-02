---
'@tiptap/react': patch
---

Fix a bug where React node views could receive invalid positions from `this.getPos()` when ProseMirror and React render cycles got out of sync, which could cause errors during updates.
