---
"@tiptap/markdown": patch
---

Fix `MarkdownManager.parse()` returning a document with empty `content` for markdown that yields no renderable blocks — whitespace-only input, or input whose only token has no registered handler (e.g. a leading-whitespace-indented line parsed as a code block when no code-block extension is present). A `doc` node requires at least one block child, so the empty document made `setContent` throw `RangeError: Invalid content for node doc: <>`. `parse()` now falls back to a single empty paragraph in that case, matching how an empty markdown string is represented.
