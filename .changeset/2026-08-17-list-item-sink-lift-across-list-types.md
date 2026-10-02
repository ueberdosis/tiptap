---
'@tiptap/core': minor
---

`sinkListItem` and `liftListItem` now work across list types. Pressing Tab on an item right after a nested list of another type (for example a task list inside a bullet list) moves the item into that nested list instead of starting a second one. Pressing Shift+Tab on an item nested in a list of another type lifts it into that list as one of its items, and any items after it move along as its nested list. Nothing changes for lists of a single type.
