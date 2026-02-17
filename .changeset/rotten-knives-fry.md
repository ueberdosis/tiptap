---
'@tiptap/core': patch
---

Fix inline `style` parsing in `mergeAttributes` for values containing `:` (e.g. `url(https://...)`) and skip incomplete declarations
