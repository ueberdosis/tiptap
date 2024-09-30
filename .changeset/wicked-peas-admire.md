---
"@tiptap/core": patch
---

This refactors the `onDrop` and `onPaste` event callbacks to be Tiptap extensions rather than separate Prosemirror plugins which was forcing the editor to recreate the view on initialization.
