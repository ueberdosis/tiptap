---
'@tiptap/extension-list': patch
---

Fix a markdown parsing bug where a plain bullet (`- item`) nested under a task-list parent (`- [ ]`) was silently dropped from the parsed document. The task-list tokenizer's nested parser stopped at the first non-checkbox line and discarded everything after it; that remainder is now lexed and kept as sibling blocks (a bullet list or paragraph inside the parent task item), matching how mixed lists already behave at the top level.
