---
'@tiptap/extension-table-header': minor
'@tiptap/extension-table-cell': minor
'@tiptap/extension-table-row': minor
'@tiptap/extension-table': minor
---

This change repackages all of the table extensions to be within the `@tiptap/extension-table` package (other packages are just a re-export of the `@tiptap/extension-table` package). It also adds the `TableKit` export which will allow configuring the entire table with one extension.
