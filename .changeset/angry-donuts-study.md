---
'@tiptap/core': patch
---

Fix plain-text copy of table cell selections including content from unselected cells in between. Each selected range is now serialized independently and joined in document order, so dragging upward (reverse selection) also produces output in document order.
