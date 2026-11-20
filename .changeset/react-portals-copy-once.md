---
'@tiptap/react': patch
---

Mounting or removing React node views no longer copies every registered portal for each node view. Documents with thousands of React node views load and update faster.
