---
'@tiptap/core': patch
---

Fix `editor.$pos()` returning the wrong node inside container nodes, for example the list item instead of the list.
