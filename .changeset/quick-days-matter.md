---
"@tiptap/html": major
---

Replace `zeed-dom` with `happy-dom-without-node` for broader compatibility of the HTML parser. The only difference you should see is that `happy-dom-without-node` will output `xmlns="http://www.w3.org/1999/xhtml"` on root elements, which makes it compliant with the HTML5 specification.
