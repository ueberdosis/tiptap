---
'@tiptap/core': patch
'@tiptap/extension-list': patch
'@tiptap/extension-paragraph': patch
'@tiptap/markdown': patch
---

Fix markdown empty paragraph preservation between lists, preserve intentional empty paragraphs within list items on roundtrips, and prevent phantom empty paragraphs inside list items when parsing loose lists with trailing blank lines.
