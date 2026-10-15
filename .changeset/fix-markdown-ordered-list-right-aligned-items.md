---
'@tiptap/extension-list': patch
---

Parsing Markdown ordered lists no longer drops items whose indentation is shallower than the first item of the list, such as `10. ten` below ` 9. nine`. Tab-indented nested items keep their nesting when parsed.
