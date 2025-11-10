---
'@tiptap/extension-collaboration': minor
'@tiptap/core': minor
'tiptap-demos': minor
---

Create utilities to update a position after a transaction. Fixes a bug where positions were not correctly updated after a transaction when the editor had real-time collaboration enabled.

- Create `editor.positionHelpers` property that returns a `PositionHelpers` object with the following methods:
  - `mapPositionFromTransaction`
  - `mapRangeFromTransaction`
  - `getYAbsolutePosition`
  - `getYRelativePosition`
  - `getYAbsoluteRange`
  - `getYRelativeRange`
- Create demo that showcases how to update a position after a transaction in a collaborative editor.