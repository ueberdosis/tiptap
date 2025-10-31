---
'@tiptap/extension-drag-handle': patch
---

Fix `findElementNextToCoords` to resolve the parent when `nodeAt(pos)` is null
(e.g., inside an atom node that allows inline content)