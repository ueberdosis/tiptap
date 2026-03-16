---
'@tiptap/extension-placeholder': patch
---

Skip placeholder decorations on non-textblock nodes when `includeChildren` is enabled to prevent duplicate placeholders on wrapper nodes like lists.
