---
'@tiptap/core': patch
---

Fix `deleteSelection` to delete content across all selection ranges instead of only the first range. This restores multi-cell table selections and other custom selections with multiple ranges.
