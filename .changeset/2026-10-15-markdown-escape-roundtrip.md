---
'@tiptap/markdown': patch
---

Keep already-escaped markdown specials (`\*`, `\``, etc.) intact when serializing text so `getMarkdown()` stays stable if that output is loaded again as plain/HTML content (#8519).
