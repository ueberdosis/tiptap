---
"@tiptap/react": patch
---

`useEditorState` now defaults to using a deep equal comparison for it's `equalityFn` option, which makes it more convenient to use
