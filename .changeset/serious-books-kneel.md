---
'@tiptap/extension-blockquote': patch
---

Fix Backspace key getting blocked after merging a paragraph into a blockquote by using the correct TextSelection import and replacing the block boundary atomically.
