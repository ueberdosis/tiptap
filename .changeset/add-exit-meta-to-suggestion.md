---
"@tiptap/suggestion": patch
---

Add a safe API to exit suggestions and remove decorations.

- Dispatching a metadata-only transaction with `{ exit: true }` will now reliably deactivate the suggestion plugin and remove inline decorations.
- Pressing Escape now triggers renderer.onExit and dispatches the exit meta, so suggestions close immediately without needing document edits.
- Clicking outside the editor will also close active suggestions.
- Exported `exitSuggestion(view, pluginKey?)` helper to programmatically close suggestions safely.
