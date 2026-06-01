---
'@tiptap/extension-list': patch
---

Fix delete at the end of a list item with a branching nested sublist. Nested items are hoisted to the parent list instead of being node-selected and deleted on the next keypress.
