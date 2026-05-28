---
"@tiptap/extension-collaboration": patch
---

Fix a memory leak where destroying an editor while its Y.Doc/provider stays alive (e.g. multiple editors sharing one provider) left the editor uncollectable. Yjs' UndoManager registered a `doc.on('destroy', ...)` listener that was never removed, keeping the UndoManager — and through it the whole editor — reachable from the long-lived doc. Fixed upstream in `@tiptap/y-tiptap`; this bumps the dependency to pull in the fix.
