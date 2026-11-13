---
'@tiptap/extension-table': minor
---

Add a relative `width` to tables, in percent of their container. In such a table, each column's `colwidth` is its share of the sum, so the table follows the width of the page or editor. Pass it with `insertTable({ width: 100 })` or parse it from `style="width: 50%"` and `width="50%"`. Resizing a column moves width to its neighbour, and resizing the last column changes the table's width. Tables without a width render as before.
