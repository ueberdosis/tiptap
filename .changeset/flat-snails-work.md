---
'@tiptap/core': patch
---

Fix a crash when `editor.commands`, `editor.chain()`, or `editor.can()` were called after the editor had been destroyed (e.g. from a `useEditorState`/`useTiptapState` selector still running during unmount). These now safely no-op and return `false` instead of throwing.

