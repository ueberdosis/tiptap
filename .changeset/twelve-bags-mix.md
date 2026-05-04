---
'@tiptap/markdown': patch
---

Fixed a bug in Markdown serialization where partial formatting at mark boundaries could produce invalid nesting, such as italic or bold markers being emitted outside link labels. The Markdown manager now preserves document mark order by default while adjusting boundary openings so continuing marks stay as the outer wrapper.
