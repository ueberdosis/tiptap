---
'@tiptap/extension-list': patch
---

Fix a markdown parsing bug where a heading right after an ordered list item (with no blank line in between) got pulled into the list item as plain text, so you'd see a literal `###` inside the list instead of an actual heading. Headings now end the list and get parsed properly, the way other markdown parsers handle it. Indented headings inside a list item are also parsed as real headings now instead of literal text.
