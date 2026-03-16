---
'@tiptap/core': patch
---

Fixed `isNodeEmpty()` so multi-line text with non-whitespace content is no longer treated as empty when `ignoreWhitespace` is enabled.
