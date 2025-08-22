---
"@tiptap/extension-unique-id": patch
---

Add a `node` argument to the `generateID` option for `@tiptap/extension-unique-id` so ID generation callbacks receive the ProseMirror node they're being created for.

This allows consumers to generate IDs based on node properties (for example, using the node type or content).

The change is backwards-compatible: existing `generateID` functions that ignore the argument will continue to work. Example usage:

```
editor.use(UniqueID, {
  generateID: (node) => `${node.type.name}-${uuidv4()}`,
})
```

Also note: the default implementation accepts the node parameter (and can be prefixed with an underscore to avoid unused-var lint warnings).
