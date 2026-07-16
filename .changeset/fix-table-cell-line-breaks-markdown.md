---
'@tiptap/extension-table': patch
---

Keep line breaks inside table cells when serializing to markdown. Hard breaks and paragraph breaks in a cell are now written as `<br>` instead of being collapsed into a space, so they survive a parse/serialize round trip.
