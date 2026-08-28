---
'@tiptap/core': minor
---

Add `editor.visualSelection`, a store for driving custom selection UI (borders, toolbars, badges) on a node without dispatching a transaction. Useful for fast, custom selection UI on large documents. Also exports `nodeAt`, a null-safe alternative to `doc.nodeAt` for out-of-range positions.
