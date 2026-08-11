---
'@tiptap/static-renderer': patch
---

Render `audio` and `video` elements with a closing tag instead of as self-closing, so browsers no longer nest following content inside them.
