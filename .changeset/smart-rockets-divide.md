---
"@tiptap/core": patch
"@tiptap/extension-placeholder": patch
---

This addresses an issue with `isNodeEmpty` function where it was also comparing node attributes and finding mismatches on actually empty nodes. This helps placeholders find empty content correctly
