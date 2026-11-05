---
'@tiptap/extension-link': patch
---

Pasting or dropping an HTML link keeps its `href` when the link text looks like a URL. Before, pasting `<a href="https://example.com/LICENSE.md">LICENSE.md</a>` changed the `href` to `http://LICENSE.md`.
