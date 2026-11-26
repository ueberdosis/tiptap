---
'@tiptap/y-tiptap': patch
---

Typing in a paragraph no longer rewrites the formatting of runs it did not change, so undo and concurrent edits keep the current value of other marks.
