---
'@tiptap/extension-link': patch
---

Links parsed from Markdown now decode HTML entities in their `href`, so `https://example.com/?a=1&amp;b=2` gives `href="https://example.com/?a=1&b=2"` and a typed URL with a query string survives `getMarkdown()` and parsing again.
