---
'@tiptap/core': patch
---

Fixed `onContentError` throwing when calling `editor.commands` from inside the handler on initial load with invalid content. The editor now has a usable state (seeded from the stripped fallback document) before `onContentError` fires.
