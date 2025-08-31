---
"@tiptap/core": patch
---

Fix `can().toggleMark()` returning incorrect result when cursor is inside nodes that disallow marks

Fixed an issue where `can().toggleMark('bold')` incorrectly returned `true` when the cursor was positioned inside a code block (with no selection), even though marks are not allowed in code blocks. The method now correctly returns `false` in this scenario by checking if the parent node allows the mark type when the selection is a cursor.
