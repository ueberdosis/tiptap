---
'@tiptap/extension-table': patch
---

Fix pipe characters inside backtick inline code spans being incorrectly treated as table column delimiters in both leading-pipe and pipeless (no leading `|`) GFM tables. Cells containing expressions like `` `||` `` or `` `a || b` `` now parse correctly instead of splitting into extra columns and losing their code formatting.
