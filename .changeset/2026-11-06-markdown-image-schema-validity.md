---
'@tiptap/markdown': patch
'@tiptap/extension-paragraph': patch
---

Parsing Markdown with images now always creates content that matches the schema. Block images next to text or in table cells no longer end up inside a paragraph, and inline images on their own line are kept inside a paragraph. Before, the invalid content was dropped when used with collaboration, losing the text or table cell around the image.
