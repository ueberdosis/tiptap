---
"@tiptap/extension-collaboration": patch
---

Moved content validation from Yjs `beforeTransaction` (whose return value was ignored) to ProseMirror `filterTransaction`, so invalid collaborative changes are now properly blocked.
