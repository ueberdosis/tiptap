---
'@tiptap/extension-table': patch
---

Fix `<col width>` in a table's `<colgroup>` being ignored when parsing HTML. The width of the first column was always dropped because the cell index `0` failed a truthiness check, and header cells (`<th>`) never read the colgroup at all. Both table cells and table headers now fall back to the matching `<col>` element's `width` attribute when they have no `colwidth` attribute of their own.
