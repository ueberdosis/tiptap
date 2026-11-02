---
"@tiptap/y-tiptap": patch
---

Cache `step.toJSON()` in `isNodeMarkupChange` so large edits no longer re-serialize the same step once per tracked position during migration.
