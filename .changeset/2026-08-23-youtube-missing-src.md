---
'@tiptap/extension-youtube': patch
---

A YouTube iframe pasted without a `src` attribute no longer throws `Cannot read properties of null (reading 'match')`; the node is now rendered without a source instead.
