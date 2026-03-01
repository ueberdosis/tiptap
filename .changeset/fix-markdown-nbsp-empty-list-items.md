---
'@tiptap/extension-paragraph': patch
---

Fix getMarkdown() producing &nbsp; for empty bullet/ordered list items

Empty paragraphs inside list items now render as empty string instead of &nbsp;, while standalone empty paragraphs still use &nbsp; to preserve blank lines.
