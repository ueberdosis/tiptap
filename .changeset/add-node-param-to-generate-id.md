---
"@tiptap/extension-unique-id": patch
---

Change the `generateID` option to accept a context object: `{ node, pos }`.

This lets ID generators access both the ProseMirror `node` and its `pos` within the document when creating IDs, enabling logic that depends on node content, type, or position.

The change is backwards-compatible: existing `generateID` functions that ignore the new context will continue to work. Example usage:

```
editor.use(UniqueID, {
  generateID: ({ node, pos }) => `${node.type.name}-${pos}-${uuidv4()}`,
})
```
