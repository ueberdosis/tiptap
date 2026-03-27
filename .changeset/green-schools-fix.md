---
'@tiptap/markdown': patch
---

Fix custom markdown tokenizer helper lexing to use Marked's active lexer so ordered list parsing no longer breaks inline tokenization in following paragraphs.
