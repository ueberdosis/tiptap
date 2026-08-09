---
'@tiptap/markdown': patch
---

Markdown with inline HTML such as an unclosed `<b>` tag no longer parses into an invalid document. The tag is dropped and its text is kept.
