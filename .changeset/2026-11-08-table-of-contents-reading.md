---
'@tiptap/extension-table-of-contents': minor
---

Added `resolveTableOfContents` and `filterTableOfContents` to read and filter the outline of a document without an editor or a DOM. `resolveTableOfContents` can read only parts of the document with `ranges` and leave nodes out with `ignore`. Added the `updateOnTransaction` option to stop the storage from updating on every change.
