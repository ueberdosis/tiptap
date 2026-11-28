---
'@tiptap/extension-link': patch
'@tiptap/extension-image': patch
---

Escape double quotes and backslashes in link and image titles when serializing to Markdown, so the link or image is not lost on the next parse.
