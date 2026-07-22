---
'@tiptap/react': patch
---

Fixed `useEditorState` not re-rendering components when `editor.setEditable()` changes the editor's editable state, since that call only emits an `update` event and never a `transaction`.
