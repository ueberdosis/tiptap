---
'@tiptap/markdown': patch
---

Escape `$` in text when serializing Markdown, so a literal dollar written as `\$` stays text instead of being parsed as math.
