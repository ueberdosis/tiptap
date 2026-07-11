---
'@tiptap/extension-list': patch
---

Fix markdown parsing a line like `(216) 555-1234` as an ordered list. A number followed by `)` mid-line is no longer treated as a list marker.
