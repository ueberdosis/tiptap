---
"@tiptap/react": patch
---

Fix `useEditorState` so transient `null` editor snapshots preserve the previous selected state instead of calling selectors.
