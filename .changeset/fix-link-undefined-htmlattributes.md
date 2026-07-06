---
"@tiptap/extension-link": patch
---

Coerce `undefined` HTMLAttributes (`target`, `rel`, `class`) to `null` so ProseMirror does not emit "No value supplied for attribute" warnings when these options are explicitly set to `undefined`.
