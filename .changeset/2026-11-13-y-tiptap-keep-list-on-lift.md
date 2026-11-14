---
'@tiptap/y-tiptap': patch
---

In a collaborative editor, adding a block of a different type before a block that also changed, like lifting the first item out of a list, no longer replaces the changed block. Other users' edits in it at the same time are kept and not duplicated.
