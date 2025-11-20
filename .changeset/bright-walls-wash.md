---
'@tiptap/extension-collaboration': minor
'@tiptap/core': minor
---

Create utilities to update a position after a transaction. Fixes a bug where positions were not correctly updated after a transaction when the editor had real-time collaboration enabled.

- Create `editor.utils` property that returns a `PositionHelpers` object with the following methods:
  - `getUpdatedPosition`
  - `getUpdatedRange`
- Create demo that showcases how to update a position after a transaction in a collaborative editor.