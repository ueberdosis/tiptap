---
'@tiptap/react': patch
'@tiptap/vue-2': patch
'@tiptap/vue-3': patch
'@tiptap/core': patch
---

Add `selectedOnTextSelection` option to node view renderers. When enabled, the `selected` prop also becomes true when a TextSelection is fully inside the node's range, not only on NodeSelection.
