---
'@tiptap/extension-hard-break': patch
---

Ensure that markdown hard breaks (two spaces followed by a newline) are parsed so they render as line breaks (`<br>`) in the editor when using `contentType: 'markdown'`.

Fixes #7107


