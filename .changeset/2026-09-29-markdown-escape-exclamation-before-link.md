---
'@tiptap/markdown': patch
---

A literal `!` directly before a link is now escaped when serializing to Markdown, so the link is no longer parsed back as an image.
