---
'@tiptap/core': patch
'@tiptap/extension-mention': patch
---

Fix a denial-of-service risk where crafted block or inline Markdown attributes could consume excessive CPU and block the browser or server event loop.
