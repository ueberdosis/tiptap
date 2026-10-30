---
'@tiptap/extension-image': patch
'@tiptap/extension-link': patch
---

Links and images whose path contains a space are exported to Markdown with that path wrapped in angle brackets, so the result can be read back as a link or an image instead of plain text. Angle brackets inside such a path are escaped, because an unescaped one would end the destination early.
