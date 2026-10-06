---
"@tiptap/extension-character-count": patch
---

Fix autoTrim to trim from the end of the document instead of the beginning. Also fix `findDocPositionAtChar` to account for non-text leaf/atom nodes (images, hard breaks, etc.) that contribute to the character count via `leafText`, and add a safety re-check loop so the document is always trimmed to within the limit even when ProseMirror re-closes nodes after deletion.
