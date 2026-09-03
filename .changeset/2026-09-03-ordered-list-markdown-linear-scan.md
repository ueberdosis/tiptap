---
'@tiptap/extension-list': patch
---

Parsing Markdown is no longer super-linear in document size. The ordered list tokenizer read the whole remaining document at every block, so a 578KB file took about 19s and now takes about 160ms.
