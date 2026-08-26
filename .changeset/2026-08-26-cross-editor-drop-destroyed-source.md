---
'@tiptap/core': patch
---

Fix a `TypeError` thrown after dragging content between editors when the source editor is destroyed right after the drop. Destroyed editors are also no longer leaked after such a drag.
