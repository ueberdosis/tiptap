---
'@tiptap/react': patch
---

Batch React node view portal store notifications that happen in the same microtask to avoid nested update depth warnings when many node views mount together.
