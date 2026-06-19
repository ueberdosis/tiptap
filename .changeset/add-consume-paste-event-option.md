---
"@tiptap/extension-file-handler": patch
---

Add `consumePasteEvent` option to the file-handler extension. When `true`, `handlePaste` returns `true` even when HTML content is present in the clipboard, preventing paste rules from other extensions from creating duplicate content. Default is `false`.
