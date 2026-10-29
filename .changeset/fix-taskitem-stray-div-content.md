---
'@tiptap/extension-list': patch
---

Parsing task item HTML no longer discards content when the item has no checkbox label. A `<div>` is only treated as the content wrapper when the item also contains the label, so hand-written or imported HTML keeps all of its children.
