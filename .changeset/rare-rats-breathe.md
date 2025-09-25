---
'@tiptap/extension-table': patch
---

Fixes table wrapper replacement and lost selections when `resizable: true`.

TableView.ignoreMutation now ignores attribute/childList/characterData mutations that occur inside the table wrapper but outside the editable `contentDOM`, preventing wrapper re-creation during resize interactions so selections (e.g. `mergeCells()`) are preserved.

No API or breaking changes.
