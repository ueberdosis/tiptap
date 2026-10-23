---
'@tiptap/static-renderer': patch
---

Rendering a node whose `renderHTML` returns several nested child elements no longer adds stray commas between them in the HTML string output.
