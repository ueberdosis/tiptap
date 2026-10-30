---
'@tiptap/extension-list': patch
---

Fixed Markdown list items that start with a heading, quote or other non-paragraph block, which produced invalid documents. They now parse with a leading paragraph. Empty nested list items are written as `- &nbsp;`, so they no longer turn the parent item into a heading when read back.
