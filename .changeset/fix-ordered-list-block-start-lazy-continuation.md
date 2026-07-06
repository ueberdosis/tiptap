---
'@tiptap/extension-list': patch
---

Fix markdown parsing bugs where block elements right after an ordered list item (with no blank line in between) were wrongly treated as lazy continuation of the list item, instead of terminating the list the way other markdown parsers do:

- Thematic breaks (`---`, `***`, `___`, `* * *`) were swallowed into the list item as literal paragraph text — along with every line after them. They now terminate the list and become a horizontal rule.
- Fenced code blocks (```` ``` ```` and `~~~`) were nested inside the list item. They now terminate the list and become a top-level code block.
- Unindented bullet markers (`- item`) were nested inside the ordered list item. They now terminate the ordered list and start a new top-level bullet list. Indented bullets still nest inside the item as before.

An indented `***`/`___` inside item content is now also parsed as a horizontal rule inside the item instead of literal text. A `---` line directly below item paragraph text keeps its current behavior because it is a setext heading underline per CommonMark, not a thematic break.
