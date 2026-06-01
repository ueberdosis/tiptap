---
'@tiptap/extension-image': patch
---

Fix `HTMLAttributes` not being applied to the editor DOM when `resize` is enabled. The `addNodeView` path was using only the resolved node attributes and skipping the user-configured `HTMLAttributes` option. Now it merges them consistently with how `renderHTML` already works.
