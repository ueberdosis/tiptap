---
'@tiptap/core': patch
---

Pressing Enter before the text of a checked task item now leaves the new empty item unchecked and the item with the text checked. Attributes declared with `keepOnSplit: false` now reset on the new item, not on the one that keeps the text.
