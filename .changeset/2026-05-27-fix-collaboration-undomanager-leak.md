---
"@tiptap/extension-collaboration": patch
---

Fix a memory leak where destroying an editor while its Y.Doc/provider stays alive (e.g. multiple editors sharing one provider) left the editor uncollectable. Yjs' UndoManager registers a `doc.on('destroy', ...)` listener that it never removes, keeping the UndoManager — and through it the whole editor — reachable from the long-lived doc. The extension now removes that listener when the editor is destroyed.
