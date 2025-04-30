---
'@tiptap/core': major
---

`insertContent` and `insertContentAt` commands should not split text nodes like paragraphs into multiple nodes when the inserted content is at the beginning of the text to avoid empty nodes being created
