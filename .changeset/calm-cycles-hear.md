---
"@tiptap/markdown": patch
---

Preserve HTML comments in markdown parsing by keeping them as text nodes instead of dropping them.

This improves round-tripping for markdown content that includes hidden metadata comments like `<!-- ... -->`.
