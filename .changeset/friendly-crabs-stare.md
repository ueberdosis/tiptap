---
'@tiptap/extension-drag-handle': minor
'tiptap-demos': patch
'@tiptap/core': patch
'@tiptap/extension-drag-handle-react': patch
'@tiptap/extension-drag-handle-vue-2': patch
'@tiptap/extension-drag-handle-vue-3': patch
---

Enable cross-editor drag and drop functionality

- Add support for dragging content between multiple editor instances
- Improve content preservation using serializeForClipboard
- Add smart deletion control based on source editor's editable state
- Update React, Vue 2, and Vue 3 drag handle components
- Add comprehensive demos and tests for cross-editor functionality

This enhancement allows users to seamlessly move content between different Tiptap editor instances, making it easier to build applications with multiple interconnected editors.
