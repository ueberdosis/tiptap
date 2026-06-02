---
"@tiptap/extension-unique-id": patch
---

Fix memory leak when destroying an editor before the collaboration provider syncs. The `synced` listener registered in `onCreate` was only removed once the event fired, so destroying the editor first left the `createIds` closure (and the whole editor it captures) referenced by the shared provider. The listener is now also detached on destroy, so the editor can be garbage collected.
