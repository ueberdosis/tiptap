---
"@tiptap/extension-drag-handle-react": patch
---

Fix `DragHandle` unmounts by rendering children into the plugin-managed drag handle element with a React portal.

This avoids React trying to remove a host node after the drag handle plugin has moved it into its own wrapper.
