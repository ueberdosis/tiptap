---
"@tiptap/core": minor
---

Fixes #5490. The `preventClearDocument` meta tag can now be used to prevent the `clearDocument` plugin in the core keymap extension from modifying transactions that appear to clear the document (but might be clearing it for other reasons).
