---
"@tiptap/core": patch
---

Fix `toggleList` (and the `toggleBulletList`/`toggleOrderedList`/`toggleTaskList` commands built on it) only converting the outermost list node when changing list type on a selection that spans nested sublists. Previously `tr.setNodeMarkup` was called on the top-level list only, leaving nested sublists on their original type and breaking the visual nesting hierarchy (e.g. converting a bullet list to an ordered list left nested bullet sublists as bullets). Nested list nodes of the original type are now recursively converted along with the top-level list.
