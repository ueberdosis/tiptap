---
'@tiptap/extension-table-of-contents': patch
---

The transaction that updates the outline now carries the `toc` meta, and the editor no longer dispatches an empty transaction on create when every heading already has an ID.
