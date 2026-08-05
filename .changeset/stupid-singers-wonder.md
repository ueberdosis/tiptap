---
"@tiptap/core": patch
---

Fixed `insertContent`, `insertContentAt` and `setContent` failing when prosemirror-model is loaded more than once. They threw `Can not convert <…> to a Fragment` or silently inserted nothing.
