---
'@tiptap/extension-image': patch
---

Fix resizable images staying invisible when the image is already cached. The resize node view hid the element and only revealed it inside `el.onload`, but a cached image is already `complete` before the node view mounts, so `load` never fires again. The node view now reveals immediately when the image is already loaded, and also on `error` so a broken `src` renders as an inspectable broken image instead of an invisible node.
