---
'@tiptap/core': patch
---

Splitting a list item at the very start no longer moves attributes with `keepOnSplit: false` onto the half that keeps the content. Pressing Enter before the text of a checked task item now leaves the new empty item unchecked and the item with the text checked.
