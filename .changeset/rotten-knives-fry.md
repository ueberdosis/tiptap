---
'@tiptap/core': patch
---

Fix inline `style` parsing in `mergeAttributes` for values containing `:` or `;` (e.g. `url(https://...)` or `url(data:...;charset=...,)`) and skip incomplete declarations
