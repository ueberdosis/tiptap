---
'@tiptap/extension-list': minor
'@tiptap/core': minor
---

`ListKeymap` now registers a `Tab` shortcut that sinks a top-level textblock into the previous list's last item. Pressing Tab at the start of a paragraph right after a bullet/ordered/task list moves the paragraph inside the last list item. The handler does nothing when the cursor is already inside a list item (`sinkListItem` keeps working), when there is no list before the paragraph, when the caret is mid-textblock, or when the selection is not a text selection (for example a gap cursor).

`@tiptap/core` also exposes a new `getPreviousBlockSibling($pos)` helper that returns the block-level sibling before the cursor's textblock, or null at the first child of the block parent.
