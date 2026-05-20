---
'@tiptap/extensions': patch
---

**Placeholder**: Replaced full-document `doc.descendants()` traversal with a cursor-resolved fast path for the default config and viewport-limited scanning for the non-default config, significantly reducing decoration overhead on large documents.
