---
'@tiptap/extension-link': patch
---

Markdown links whose URL contains an HTML entity, such as `?a=1&amp;b=2`, now open the decoded URL instead of one containing a literal `&amp;`.
