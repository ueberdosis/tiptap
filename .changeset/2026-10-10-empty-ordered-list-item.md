---
'@tiptap/extension-list': patch
---

Fixed Markdown serialization throwing on an empty ordered list item (for example `1. text\n2. `): the parsed item now gets an empty paragraph, as an empty bullet list item does
