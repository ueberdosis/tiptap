---
'@tiptap/core': major
---

Fix `getPos` type in `NodeViewRendererProps` to potentially be `undefined`

Breaking change: Types may flag uses of getPos where an `undefined` possibility isn't handled.
Why this change was made: To ensure the type reflects the real functionality of this function.
How to update: Ensure that the return value of `getPos` exists before making use of the value.
