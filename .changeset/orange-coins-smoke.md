---
'@tiptap/core': minor
---

the addNodeView function can now return `null` to dynamically disable rendering of a node view

While this should not directly cause any issues, it's noteworthy as it still could affect some behavior in some edge cases.
