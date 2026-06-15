---
"@tiptap/core": patch
---

Fix `marksEqual` to compare mark arrays as multisets instead of index-by-index, so order of marks no longer affects the result. Broaden the type signature to accept ProseMirror `Mark` objects (where `type` is an object with a `name` property) alongside the existing JSON mark shape (`{ type: string }`).
