---
"@tiptap/extension-collaboration": patch
---

Fixed `onContentError` not being triggered when invalid collaborative content is detected. The `filterTransaction` hook now allows the transaction through to keep ProseMirror state in sync with Yjs, ensuring the `contentError` event fires correctly.
