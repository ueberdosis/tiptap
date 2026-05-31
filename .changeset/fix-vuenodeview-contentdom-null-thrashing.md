---
'@tiptap/vue-3': patch
'@tiptap/vue-2': patch
---

Fix `VueNodeViewRenderer` thrashing the DOM when `contentDOM` is null for non-leaf nodes. The renderer now always creates a contentDOM element for non-leaf nodes (matching React's behavior), so ProseMirror has a valid element to render children into even when the NodeView component does not include `NodeViewContent` or renders it conditionally.
