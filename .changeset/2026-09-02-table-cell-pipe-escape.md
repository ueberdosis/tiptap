---
'@tiptap/extension-table': patch
---

Table cells exported to Markdown now escape literal pipe characters, so the cell content survives when the output is read back.
