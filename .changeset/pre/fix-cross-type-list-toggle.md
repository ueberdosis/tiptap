---
'@tiptap/core': patch
---

Fix list toggling between list types that use different item nodes. Nested lists are recursively converted when the target item schema supports nesting, and flattened into sibling items when it does not.
