---
'@tiptap/markdown': patch
---

Fixed a bug in Markdown serialization where partial formatting at mark boundaries could produce invalid nesting, such as italic or bold markers being emitted outside link labels. The serializer now orders marks using extension priority (matching ProseMirror's schema rank) so that wrapping marks like links are always placed outermost.
