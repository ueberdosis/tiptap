---
'@tiptap/html': patch
---

Remove unnecessary `xmlns="http://www.w3.org/1999/xhtml"` attribute from `generateHTML` output by using `innerHTML` instead of `XMLSerializer` for HTML serialization.
