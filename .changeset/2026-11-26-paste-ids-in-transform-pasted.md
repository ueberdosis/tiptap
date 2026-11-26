---
'@tiptap/extension-unique-id': patch
---

Pasting many blocks is faster: pasted nodes get their ids right away instead of one step per node. A paste that used to be dropped when a pasted node had invalid content now lands instead.
