---
'@tiptap/extension-list': patch
---

Fixed Markdown parsing of an ordered list nested in a bullet item inside an ordered list item (for example `1. one\n   - two\n     1. three`): the inner ordered list now stays inside the bullet item instead of moving up a level
