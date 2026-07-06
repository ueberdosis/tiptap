---
'@tiptap/extensions': patch
---

Fixed placeholder flickering and disappearance on large documents. Replaced the viewport-based decoration scan with an incremental `StateField<DecorationSet>` that only re-computes decorations for top-level nodes touched by each transaction. This eliminates the dependency on DOM measurement (`posAtCoords`), `requestAnimationFrame` scheduling, and scroll listeners that caused flickering under collaboration, occlusion, and rapid edits.
