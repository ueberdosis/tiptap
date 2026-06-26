---
"@tiptap/react": patch
---

Fix `<Tiptap>` throwing `Tiptap: An editor instance is required` when `editor` is `null`. `useEditor()` returns `null` on the first render (and when `immediatelyRender: false` is used), so the canonical `<Tiptap editor={useEditor(...)}>` usage threw. The provider now renders nothing until the editor is ready, matching `EditorProvider` and the optional `editor` prop type. The `editor` and `instance` props are also typed as `Editor | null` to match what `useEditor()` returns. (#7529)
