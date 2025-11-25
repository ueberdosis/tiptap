---
"@tiptap/extension-collaboration": patch
---

Optimize collaborative position mapping performance by caching bindings and reusing existing Yjs state. This reduces overhead when mapping multiple positions from the same transaction and eliminates redundant Y.Doc creation.
