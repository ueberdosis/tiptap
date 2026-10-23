---
'@tiptap/extension-hard-break': patch
---

A hard break inside a heading is now written to Markdown as `<br>` instead of a Markdown line break, so the heading no longer splits into a heading and a paragraph when the Markdown is parsed back.
