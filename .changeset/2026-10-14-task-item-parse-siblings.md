---
'@tiptap/extension-list': patch
'@tiptap/core': patch
---

Task items parsed from HTML keep every child, instead of only the content of the first `div`, so a paragraph before or after that `div` is no longer dropped. The checkbox label is skipped only in Tiptap's rendered structure (a label holding the checkbox next to the item's content `div`); any other label text is kept as content. Custom attribute parsers on a node no longer receive elements matched by its ignored parse rules.
