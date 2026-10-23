---
'@tiptap/extension-table': patch
---

Table cells and headers no longer render the default `colspan="1"` and `rowspan="1"` attributes. Cells that actually span still render them, matching how prosemirror-tables serializes spans.
