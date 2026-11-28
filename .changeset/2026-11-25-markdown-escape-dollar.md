---
'@tiptap/markdown': patch
---

Literal dollar signs in text are escaped when serializing Markdown, so they stay text when a mathematics extension is loaded.
