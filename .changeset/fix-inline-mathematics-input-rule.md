---
'@tiptap/extension-mathematics': patch
---

Prevent inline math input rule from capturing previous character. Changed input rule to utilize negative lookbehind to prevent matching previous character. Ensures the range's `from` position is correctly at the start of the double `$` signs.
