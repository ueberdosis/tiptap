---
'@tiptap/extension-list': patch
---

Task items parsed from HTML keep every child, instead of only the content of the first `div`. The checkbox label is skipped only when the item also has its content `div`, so task text that lives in the label is still read as the item's content.
