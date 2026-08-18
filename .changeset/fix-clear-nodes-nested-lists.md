---
'@tiptap/core': patch
---

Fix `clearNodes()` leaving nested lists partly wrapped, and throwing `RangeError: Invalid content for node type` when chained with another node command.
