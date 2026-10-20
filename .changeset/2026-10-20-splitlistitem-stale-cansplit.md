---
'@tiptap/core': patch
---

`splitListItem` no longer deletes the selection when the list item cannot be split. Pressing Enter with a selection inside a block that is a direct child of a list item (for example a code block or a heading, when the item's content requires a leading paragraph) left the deletion applied while the command reported failure, so the key handler that ran next acted on an already-changed document.
