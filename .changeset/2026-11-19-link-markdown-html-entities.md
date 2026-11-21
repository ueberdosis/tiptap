---
'@tiptap/core': patch
'@tiptap/extension-link': patch
'@tiptap/static-renderer': patch
---

Markdown links now decode HTML5 character references in their destination and escape it when writing Markdown back, so URLs containing `&amp;`, parentheses, whitespace or backslashes survive a save-and-load round trip. The static `renderToMarkdown` renderer uses the same destination escaping for links.
