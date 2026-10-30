---
'@tiptap/core': patch
---

`splitBlock` no longer throws `TransformError: Inserted content deeper than insertion position` when the selection spans block boundaries (for example from the start of one paragraph into another block, or across an isolating node). The command now returns `false` when the split is not possible.
