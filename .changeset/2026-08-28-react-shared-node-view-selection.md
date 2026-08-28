---
'@tiptap/react': patch
---

React node views now check selection through one shared listener instead of each node view registering its own. This reduces overhead on documents with many node views.
