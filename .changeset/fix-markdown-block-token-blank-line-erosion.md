---
'@tiptap/markdown': patch
---

Fixed blank lines being dropped after block elements (headings, tables, etc.) when parsing markdown. Blank lines were being absorbed into the block token instead of being preserved, causing content to lose a blank line on each parse/serialize cycle.
