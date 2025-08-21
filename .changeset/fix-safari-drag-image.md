---
"@tiptap/core": patch
---

Ensure drag previews for node views work correctly in Safari by attaching
an offscreen clone of the node to the DOM while calling
`setDragImage`, and by preserving the original element's pixel
`width`/`height` so the preview matches the original. This prevents
Safari from immediately cancelling the drag when a detached element is
used as the drag image.
