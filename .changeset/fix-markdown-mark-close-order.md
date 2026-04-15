---
'@tiptap/extension-markdown': patch
---

Fix markdown serializer closing marks in wrong order when strikethrough is combined with bold/italic. Marks are now closed in LIFO order (last opened, first closed), producing valid nested markdown.
