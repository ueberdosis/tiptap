---
'@tiptap/core': patch
---

Addresses a bug with `insertContentAt`'s `simulatedPasteRules` option where it could only accept text and not Prosemirror `Node` and `Content`
