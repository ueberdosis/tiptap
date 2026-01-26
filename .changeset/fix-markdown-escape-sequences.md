---
"@tiptap/markdown": patch
---

Fix escape sequence handling by adding support for marked.js `escape` token type. Escaped characters like `\*`, `\_`, and `\\` are now correctly preserved in the parsed output.
