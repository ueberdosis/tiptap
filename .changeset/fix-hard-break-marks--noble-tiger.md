---
"@tiptap/markdown": patch
---

Fix markdown serialization to prevent marks from continuing after hard breaks. Previously, marks like bold would incorrectly persist across hard breaks in the markdown output.
