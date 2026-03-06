---
"@tiptap/extension-paragraph": patch
---

Fixed empty paragraph markdown serialization in nested contexts (list items, blockquotes, etc.). Previously, `&nbsp;` was always emitted for empty paragraphs, resulting in output like `- &nbsp;` for empty list items. The `&nbsp;` marker is now only added when the paragraph is a direct child of the document root, where it is needed to preserve blank lines between paragraphs.
