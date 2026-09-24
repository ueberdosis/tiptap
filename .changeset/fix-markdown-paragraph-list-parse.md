---
'@tiptap/core': patch
'@tiptap/extension-list': patch
'@tiptap/extension-paragraph': patch
'@tiptap/markdown': patch
---

Fix markdown empty paragraph preservation between lists, preserve intentional empty paragraphs within list items on roundtrips, prevent phantom empty paragraphs inside list items when parsing loose lists with trailing blank lines, fix ordered list continuation line indentation on roundtrips, and handle empty paragraph markers in task items while preserving inline code.
