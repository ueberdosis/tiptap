---
'@tiptap/y-tiptap': patch
---

Moving your own cursor no longer dispatches an extra transaction to redraw the collaboration cursors, unless your own cursor is shown.
