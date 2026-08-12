---
'@tiptap/core': patch
'@tiptap/react': patch
'@tiptap/vue-3': patch
'@tiptap/vue-2': patch
---

Speed up selection changes and node view updates in documents with many node views. Moving the cursor no longer makes every node view look up its position, and updating a node view no longer copies the whole list of React portals.
