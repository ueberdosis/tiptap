---
'@tiptap/static-renderer': patch
---

`renderToHTMLString` now closes namespaced elements correctly. The closing tag no longer repeats the `xmlns` declaration, and tags that cannot self-close, such as `div` or `iframe`, are no longer written as self-closing.
