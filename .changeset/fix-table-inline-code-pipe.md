---
'@tiptap/markdown': patch
---

Fix pipe characters inside backtick inline code spans being incorrectly treated as table column delimiters. Cells containing expressions like `` `||` `` or `` `a || b` `` now parse correctly instead of splitting into extra columns and losing their code formatting.
