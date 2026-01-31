---
'@tiptap/extension-mathematics': minor
---

Prevent inline math input rule from replacing previous character

- Changed input rule to utilize negative lookbehind rather than regular character match to ensure preceding character is not consumed in final match. This ensures the range's `from` position is correctly at the start o the double `$` signs.
