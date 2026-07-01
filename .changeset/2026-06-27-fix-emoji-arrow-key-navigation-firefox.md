---
'@tiptap/extension-emoji': patch
---

Fix arrow key navigation past emoji nodes in Firefox. Previously, pressing ArrowLeft with the cursor adjacent to an inline non-selectable emoji node at a paragraph boundary would not move the cursor in Firefox. The cursor now correctly skips over emoji nodes in both directions.
