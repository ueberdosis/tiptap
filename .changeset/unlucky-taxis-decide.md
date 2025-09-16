---
'@tiptap/core': patch
---

Fix bug in `insertContentAt` command where extra content would get deleted when the selection was at the beginning of the document and a node was inserted
