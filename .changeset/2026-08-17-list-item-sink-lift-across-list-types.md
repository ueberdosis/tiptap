---
'@tiptap/core': minor
---

`sinkListItem` and `liftListItem` now work across list types. Pressing Tab on an item right after a sublist of another type (for example a task list inside a bullet list) moves the item into that sublist and gives it the sublist's item type instead of starting a second sublist. Pressing Shift+Tab on an item nested in a list of another type lifts it into that list as one of its items, and any items after it move along as its sublist. Nothing changes for lists of a single type.
