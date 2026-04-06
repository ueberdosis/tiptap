---
'@tiptap/core': patch
---

Fixed `insertContentAt` corrupting the document when inserting inline content with marks at the start of a paragraph. The `from - 1` position adjustment now only applies to block-level content.
