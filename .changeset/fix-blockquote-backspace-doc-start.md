---
"@tiptap/extension-blockquote": patch
---

Fix a crash when pressing backspace at the very start of the document with a leading image. The blockquote backspace handler dereferenced an undefined parent at the top (doc) level, throwing `TypeError: Cannot read properties of undefined (reading 'type')`. It now bails out so backspace is a no-op at the document start.
