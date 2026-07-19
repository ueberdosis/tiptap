---
'@tiptap/core': patch
---

Fixed a bug where deleting an `AllSelection` (for example right after Ctrl/Cmd+A) left a lingering "phantom" selection highlight over the emptied document instead of a text cursor. `deleteSelection` now collapses the selection to a cursor.
