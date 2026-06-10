---
"@tiptap/extension-node-range": patch
---

Fixed drag-and-drop duplicating blocks during collaboration. When a remote collaborator edited the document mid-drag, dropping left an empty copy of the dragged block at its original position. This fix also requires a version of `@tiptap/y-tiptap` that restores node range selections across remote updates.
