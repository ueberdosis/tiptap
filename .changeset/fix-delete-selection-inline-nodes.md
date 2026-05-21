---
"@tiptap/core": patch
---

Fix deleteSelection to properly handle inline nodes with `text*` content. The selection is now expanded to include the entire inline node boundaries when deleting, preventing incorrect collapse of inline text nodes.
