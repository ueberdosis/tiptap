---
'@tiptap/core': patch
'@tiptap/extension-file-handler': patch
'@tiptap/extension-image': patch
---

Fix: dragging an inline/resizable image within the editor no longer creates a duplicate

When the `Image` extension was configured with `inline: true` or `resize` enabled, dragging an image within the editor could insert a duplicate at the drop position instead of moving it. This happened because the browser's native image drag behavior could populate `dataTransfer.files`, causing the FileHandler extension to intercept the drop before ProseMirror's internal move logic could run.
