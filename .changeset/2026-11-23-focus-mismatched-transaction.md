---
'@tiptap/core': patch
---

Fix `RangeError: Applying a mismatched transaction` when the `focus` command runs on Safari, iOS or Android while focusing the editor changes the document, for example when the `TrailingNode` extension adds a paragraph after a list or heading.
