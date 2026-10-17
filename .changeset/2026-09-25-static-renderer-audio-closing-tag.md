---
'@tiptap/static-renderer': patch
---

Render `<audio>` and `<video>` with a closing tag instead of self-closing them, so browsers no longer nest the following content inside the first audio element.
