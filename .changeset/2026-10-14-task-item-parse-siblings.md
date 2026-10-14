---
'@tiptap/extension-list': patch
---

Task items parsed from HTML keep every child, instead of only the content of the first `div`. Only a label that holds the checkbox is skipped, so text inside a plain label is still read as the item's content.
