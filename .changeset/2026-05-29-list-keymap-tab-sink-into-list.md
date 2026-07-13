---
'@tiptap/extension-list': minor
'@tiptap/core': minor
---

`ListKeymap` now registers a `Tab` shortcut that sinks a top-level textblock into the previous list's last item. Pressing Tab at the start of a paragraph immediately following a bullet/ordered/task list moves the paragraph (and its inline content) inside the last list item, where it becomes an additional block child. The handler stays out of the way when the cursor is already inside a list item (so `sinkListItem`'s nesting behavior is preserved), when there is no list before the paragraph, when the caret is mid-textblock, or when the selection is not a text selection (for example a gap cursor).

`@tiptap/core` also exposes a new `getPreviousBlockSibling($pos)` helper that returns the block-level sibling immediately before the cursor's textblock (or null when the cursor is at the first child of its block parent). Useful when writing custom keymaps that need to react to what's just before the current block.
