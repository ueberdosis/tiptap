---
'@tiptap/markdown': patch
---

Fixed a bug where a document containing only a non-breaking space (`&nbsp;`) serialized to an empty markdown string, silently discarding the content. `getMarkdown()`/`serialize()` now only return `""` when the document is actually empty.
