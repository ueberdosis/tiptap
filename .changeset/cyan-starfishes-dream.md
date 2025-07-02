---
'@tiptap/react': minor
---

Removed flushSync on NodeView render which caused performance regressions, bugs with unused NodeViews still being reconciled for PMViewDesc checks and more
