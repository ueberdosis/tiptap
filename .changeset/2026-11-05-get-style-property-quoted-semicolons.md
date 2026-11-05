---
'@tiptap/core': patch
---

`getStyleProperty` now keeps semicolons inside quotes and parentheses, so values like `font-family: "Times; New Roman", serif` are no longer truncated when inline styles are parsed.
