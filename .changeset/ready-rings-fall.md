---
'@tiptap/extension-drag-handle': patch
---

Replace DOM traversal with browser's native elementsFromPoint for better performance.

- Use elementsFromPoint instead of querySelectorAll
- Add clampToContent helper for coordinate boundary validation
- Add findClosestTopLevelBlock helper for efficient block lookup
- Future-proof for root-level mousemove listeners