---
'@tiptap/core': patch
---

Guard mark delete event handling when `unsetMark` removes a mark from inline content that starts at position `0`, preventing a `RangeError` during the before-node lookup.
