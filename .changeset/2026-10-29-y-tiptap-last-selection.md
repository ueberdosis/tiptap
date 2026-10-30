---
'@tiptap/y-tiptap': minor
---

`yCursorPlugin` now publishes a `lastSelection` awareness field with each collaborative field's latest selection and whether its editor is focused. Unlike `cursor`, it stays after the editor loses focus, so other clients can still read the selection. `lastSelection` is now reserved and can't be used as the cursor field.
