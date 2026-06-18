---
'@tiptap/extension-list': patch
---

Fix the ordered list markdown parser dropping the first character of an under-indented continuation line. When a list item's continuation line was indented by fewer columns than the marker width (e.g. a single leading space), the tokenizer sliced a fixed number of characters off the line and removed real content along with the indentation. It now strips only the leading whitespace that is actually present, capped at the marker's content indent, so the first character is preserved.
