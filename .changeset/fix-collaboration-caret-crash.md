---
'@tiptap/extension-collaboration-caret': patch
'@tiptap/extension-collaboration': patch
'@tiptap/extension-drag-handle': patch
---

Fixed CollaborationCaret crash with "Cannot read properties of undefined (reading 'doc')" error by patching y-tiptap to guard against undefined state during editor initialization. This issue affected editors initialized with HTML content, particularly when using tables.
