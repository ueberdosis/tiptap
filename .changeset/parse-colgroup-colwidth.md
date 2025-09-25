---
"@tiptap/extension-table": patch
---

Parse cell `colwidth` from nearest `<colgroup>` when missing on the cell

When importing HTML, table column widths are often declared on a surrounding `<colgroup>` rather than on each `<td>`. Previously, `tableCell` only read the `colwidth` attribute from the cell itself and would lose width information in that case. The implementation now falls back to reading the corresponding `<col>`'s `width` from the table's `<colgroup>` using the cell's index.

This is a non-breaking bugfix that preserves layout information when HTML uses `<colgroup>`. Consider adding a small demo or unit test to assert colwidth is preserved for cells when only the `<colgroup>` contains width attributes.
