---
'@tiptap/extension-collaboration-caret': patch
'@tiptap/extension-collaboration': patch
'@tiptap/extension-drag-handle': patch
---

Fixed CollaborationCaret crash with "Cannot read properties of undefined (reading 'doc')" error by updating to @tiptap/y-tiptap@3.0.2, which includes a guard against undefined state during editor initialization. This issue affected editors initialized with HTML content, particularly when using tables.
