---
"@tiptap/extension-drag-handle-react": patch
---

Fixed the React `DragHandle` breaking drag-and-drop when `onNodeChange` is an inline callback, by no longer re-registering its plugin when a callback's identity changes.
