---
"@tiptap/markdown": patch
---

Fixed an issue where overlapping marks (e.g. `**bold *italic***`) and marks with whitespace (e.g. `* italic *`) were serialized incorrectly.
