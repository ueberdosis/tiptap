---
"@tiptap/markdown": patch
---

Fix parsing of mixed bullet lists and task lists. Previously, Marked.js would group consecutive bullet list items and task list items into a single list token, causing incorrect parsing. Now the parser detects mixed lists and splits them into separate bulletList and taskList nodes.
