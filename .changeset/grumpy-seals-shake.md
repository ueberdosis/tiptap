---
'@tiptap/core': patch
---

Fix: Avoid the JSX Runtime to globally overwrite React's Element types when `/** @jsxImportSource @tiptap/core */` is not used
