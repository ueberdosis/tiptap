---
"@tiptap/core": patch
---

Fixed `insertContent` and `insertContentAt` failing when prosemirror-model is loaded more than once. They threw `Can not convert <…> to a Fragment`, or silently inserted nothing. The editor now warns once when it finds a duplicate
