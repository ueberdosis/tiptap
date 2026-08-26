---
'@tiptap/core': patch
---

Fix a `TypeError` thrown after dragging content between editors when the source editor is destroyed right after the drop. A destroyed editor is also no longer kept referenced after a drag.
