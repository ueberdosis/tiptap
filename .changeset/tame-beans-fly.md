---
"@tiptap/core": patch
---

Refined the `JSONContent.attrs` definition to exactly mirror the structure returned by `editor.getJSON()`. This ensures strict type safety and consistency between the editor output and the expected type, eliminating errors caused by mismatched attribute signatures.
