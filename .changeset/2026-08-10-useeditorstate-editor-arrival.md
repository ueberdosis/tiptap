---
'@tiptap/react': patch
---

useEditorState now updates immediately when the editor instance becomes available or is replaced, instead of waiting for the editor's first transaction.
