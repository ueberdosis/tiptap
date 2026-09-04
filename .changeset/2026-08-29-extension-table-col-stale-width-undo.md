---
'@tiptap/extension-table': patch
---

Undoing a column resize now clears the stale inline width on the `<col>` element, so the column visually snaps back to its previous width.
