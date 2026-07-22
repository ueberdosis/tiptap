---
'@tiptap/extension-table': patch
---

Fix inserting a table with an empty cell or header (e.g. via `insertContent`/`insertContentAt`) throwing `RangeError: Invalid content for node tableCell/tableHeader: <>`. Empty `<td>`/`<th>` elements are now backfilled with the cell's default block content, matching the behavior you already get from `setContent`.
