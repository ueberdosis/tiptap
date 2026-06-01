---
'@tiptap/core': patch
---

Add `attrsEqual` and `marksEqual` utility functions to `@tiptap/core`. `attrsEqual` compares two attribute objects for equality regardless of key ordering. `marksEqual` compares two arrays of mark objects by type and attributes using `attrsEqual`.
