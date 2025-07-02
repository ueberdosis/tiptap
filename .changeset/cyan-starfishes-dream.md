---
'@tiptap/react': minor
---

Removed flushSync on NodeView render which caused performance regressions, bugs with non-used NodeView's still being reconciled for PMViewDesc checks and more
