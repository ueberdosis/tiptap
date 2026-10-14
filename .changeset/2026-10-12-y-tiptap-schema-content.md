---
'@tiptap/y-tiptap': patch
---

Preserve shared content when a client cannot display its nodes or marks, and pause that client's editing until compatible content is available.

Headless document creation rejects empty content when the schema requires child nodes.
