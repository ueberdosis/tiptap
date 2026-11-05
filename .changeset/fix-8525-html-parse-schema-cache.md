---
'@tiptap/markdown': patch
---

Cache the HTML-parse schema across `parseHTMLToken` calls so markdown with many HTML tokens (for example table cell `<br>`s) does not rebuild the schema per token.
