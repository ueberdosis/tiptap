---
'@tiptap/markdown': patch
---

Fix Markdown serialization of inline code that has whitespace next to a leading or trailing backtick, which lost the code mark or the backtick when parsed again.
