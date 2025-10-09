---
"@tiptap/extensions": patch
---

Make the `TrailingNode` extension's `node` option optional and derive the
default node type from the editor schema when available.

Previously the extension used a hard-coded `'paragraph'` default and the
`node` option was required in the TypeScript definitions. This change:

- makes `node` optional in the options type,
- prefers the editor schema's top node default type when resolving the
  trailing node, and
- falls back to the configured option or `'paragraph'` as a last resort.

This fixes cases where projects use a different top-level default node and
prevents the extension from inserting an incorrect trailing node type.
