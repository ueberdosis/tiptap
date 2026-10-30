---
'@tiptap/react': patch
---

Fix `useEditorState` overflowing the stack when a selector returns a value with circular references, such as `editor.state` after one stored mark replaces another.
