---
"@tiptap/react": patch
---

The optional deps argument to useEditor was not being respected for performance optimizations, now if deps are declared a new editor instance is created
