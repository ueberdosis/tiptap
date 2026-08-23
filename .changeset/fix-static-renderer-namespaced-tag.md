---
'@tiptap/static-renderer': patch
---

`renderToHTMLString` no longer copies the `xmlns` prefix of a namespaced `DOMOutputSpec` into the closing tag, and namespaced non-self-closing tags such as `div` or `iframe` are no longer self-closed.
