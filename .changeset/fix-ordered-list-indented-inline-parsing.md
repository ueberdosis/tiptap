---
"@tiptap/extension-list": patch
---

Fix indented ordered list items (e.g. one leading space before the marker, as happens when a top-level ordered list is itself nested inside another list) losing inline formatting during markdown parsing. The custom ordered-list markdown tokenizer built its nested structure with a hardcoded base indentation of 0, so an item whose actual indentation was non-zero never matched, causing the tokenizer to silently produce zero items and bail out — falling back to a path that left the item's content as literal, unparsed text instead of running it through inline tokenization (bold, italic, etc. were lost). The base indentation is now taken from the first collected item instead of being hardcoded.
