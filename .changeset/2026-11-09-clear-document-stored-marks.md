---
'@tiptap/core': patch
---

Deleting a text selection that spans the whole document no longer leaves the deleted text's marks active, so text typed into the emptied editor is no longer bold, linked or otherwise marked.
