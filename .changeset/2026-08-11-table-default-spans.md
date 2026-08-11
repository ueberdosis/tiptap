---
'@tiptap/extension-table': patch
---

Table cells and headers no longer render `colspan="1"` and `rowspan="1"`. Both attributes are only written to the HTML when a cell actually spans more than one column or row, which matches how prosemirror-tables serializes them.
