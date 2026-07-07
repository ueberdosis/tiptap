---
'@tiptap/extension-blockquote': patch
---

Add `@tiptap/pm` as a peer dependency so bundlers resolve ProseMirror packages from the app instead of duplicating `prosemirror-model` inside `@tiptap/extension-blockquote`.
