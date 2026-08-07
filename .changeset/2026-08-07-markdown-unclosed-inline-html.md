---
'@tiptap/markdown': patch
---

Parsing markdown with an unclosed inline HTML tag such as `<b>123` no longer produces a paragraph nested inside another paragraph, which was invalid for the default schema.
