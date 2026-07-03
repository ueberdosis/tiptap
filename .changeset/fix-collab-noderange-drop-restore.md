---
'@tiptap/extension-drag-handle': patch
---

Fix NodeRangeSelection not being restored after drag-and-drop when Collaboration (Yjs) is enabled. Drop anchor positions are now tracked with Yjs relative positions and remapped across `isChangeOrigin` document rebuilds, and selection restore runs via `appendTransaction` after the drop transaction settles.
