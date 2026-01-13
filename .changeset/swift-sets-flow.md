---
"@tiptap/extension-unique-id": patch
---

Improved `findDuplicates` helper performance from O(n²) to O(n) by using Set-based lookups instead of Array.indexOf
