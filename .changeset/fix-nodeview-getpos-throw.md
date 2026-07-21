---
'@tiptap/core': patch
---

Node view `getPos()` now returns `undefined` instead of throwing when the position cannot be resolved yet, for example when React 19 renders a node view component while the editor view is still updating.
