---
'@tiptap/static-renderer': patch
---

Honor the `textDirection` editor option in `renderToHTMLString`, `renderToMarkdown`, and `renderToReactElement`, and omit `null`/`undefined` attribute values instead of serializing them as the literal string `"null"`.
