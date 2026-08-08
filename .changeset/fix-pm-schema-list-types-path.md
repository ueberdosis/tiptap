---
'@tiptap/pm': patch
---

Fix the `./schema-list` export map pointing `types` at `dist/schema/`, which is not emitted. Tools that read the `types` condition directly could not resolve `@tiptap/pm/schema-list`.
