---
'@tiptap/extension-drag-handle': patch
---

Fixed `findElementNextToCoords` returning incorrect nodes when the position is at a node boundary. The function now correctly identifies leaf nodes (like images, horizontal rules) by checking `$pos.nodeAfter` before falling back to the parent node lookup.