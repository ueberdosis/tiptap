---
"@tiptap/core": patch
---

Fixed `$nodes()` method to correctly return inline nodes (like text, mention, etc.) by fixing the `children` getter in `NodePos` class
