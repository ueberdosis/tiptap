---
'@tiptap/extension-unique-id': patch
---

UniqueID no longer crashes the editor with `RangeError: Invalid content for node type …` when the document holds a node whose children break the schema. Such a node, and any node directly inside it, is left without an ID instead. `generateUniqueIds` skips them too.
