---
'@tiptap/core': patch
---

`getStyleProperty` now shares the declaration parser used by `mergeAttributes`, so semicolons inside quotes, parentheses, escapes and CSS comments no longer truncate inline style values.
