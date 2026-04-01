---
'@tiptap/core': patch
'@tiptap/react': patch
'@tiptap/vue-3': patch
'@tiptap/vue-2': patch
---

Fix NodeView not re-rendering when a node's position changes without content or decoration changes (e.g. when a sibling node is moved within the same parent)
