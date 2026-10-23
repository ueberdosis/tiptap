---
'@tiptap/markdown': patch
---

Escape block-level syntax like `\#` and `\-` at the start of a paragraph so escaped text survives a serialize/parse round-trip instead of turning into a heading or list.
