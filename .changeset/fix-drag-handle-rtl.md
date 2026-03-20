---
'@tiptap/extension-drag-handle': patch
---

Fixed drag handle ghost image for RTL and mixed-direction content: the ghost wrapper now uses the dragged block’s computed `direction` (via `domAtPos`), and the drag image hotspot uses the cursor position relative to the ghost `wrapper` so the preview aligns with the pointer in both LTR and RTL.
