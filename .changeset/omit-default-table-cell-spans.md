---
'@tiptap/extension-table': patch
---

Table cells no longer serialize `colspan="1"` and `rowspan="1"`. The attributes are only rendered when a cell actually spans, so parsing and serializing existing table HTML leaves the markup unchanged.
