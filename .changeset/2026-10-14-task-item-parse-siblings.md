---
'@tiptap/extension-list': patch
---

Task items parsed from HTML keep every child, instead of only the content of the first `div`. Ordinary labels keep their text; checkbox labels are excluded.
